locals {
  apis = [
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "sqladmin.googleapis.com",
    "storage.googleapis.com",
  ]
  labels = { app = "chores", env = var.env }
}

resource "google_project_service" "app" {
  for_each           = toset(local.apis)
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# --- Container images -------------------------------------------------------

resource "google_artifact_registry_repository" "images" {
  project       = var.project_id
  location      = var.region
  repository_id = "chores"
  format        = "DOCKER"
  labels        = local.labels

  cleanup_policies {
    id     = "delete-old-untagged"
    action = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = "2592000s" # 30 days
    }
  }

  depends_on = [google_project_service.app]
}

# --- Service identities -----------------------------------------------------

resource "google_service_account" "web" {
  project      = var.project_id
  account_id   = "chores-web"
  display_name = "Chores web (Cloud Run)"
}

resource "google_service_account" "worker" {
  project      = var.project_id
  account_id   = "chores-worker"
  display_name = "Chores worker and migrate job (Cloud Run)"
}

locals {
  runtime_service_accounts = {
    web    = google_service_account.web
    worker = google_service_account.worker
  }
}

resource "google_project_iam_member" "runtime_sql_client" {
  for_each = local.runtime_service_accounts
  project  = var.project_id
  role     = "roles/cloudsql.client"
  member   = "serviceAccount:${each.value.email}"
}

# --- Database ---------------------------------------------------------------

resource "google_sql_database_instance" "main" {
  project             = var.project_id
  name                = "chores-${var.env}"
  region              = var.region
  database_version    = "POSTGRES_16"
  deletion_protection = var.deletion_protection

  settings {
    edition           = "ENTERPRISE"
    tier              = var.db_tier
    availability_type = "ZONAL"
    user_labels       = local.labels

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "02:00"
    }

    ip_configuration {
      # Public IP with no authorised networks: only reachable through the
      # Cloud SQL connector, which checks IAM (roles/cloudsql.client).
      ipv4_enabled = true
      ssl_mode     = "ENCRYPTED_ONLY"
    }

    insights_config {
      query_insights_enabled = true
    }
  }

  depends_on = [google_project_service.app]
}

resource "google_sql_database" "app" {
  project  = var.project_id
  instance = google_sql_database_instance.main.name
  name     = "chores"
}

resource "random_password" "db" {
  length  = 32
  special = false
}

resource "google_sql_user" "app" {
  project  = var.project_id
  instance = google_sql_database_instance.main.name
  name     = "chores_app"
  password = random_password.db.result
}

resource "google_secret_manager_secret" "database_url" {
  project   = var.project_id
  secret_id = "database-url"
  labels    = local.labels

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  depends_on = [google_project_service.app]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgres://${google_sql_user.app.name}:${random_password.db.result}@localhost/${google_sql_database.app.name}?host=/cloudsql/${google_sql_database_instance.main.connection_name}"
}

resource "google_secret_manager_secret_iam_member" "runtime_database_url" {
  for_each  = local.runtime_service_accounts
  project   = var.project_id
  secret_id = google_secret_manager_secret.database_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${each.value.email}"
}

# --- Chore photos -----------------------------------------------------------

resource "google_storage_bucket" "photos" {
  project                     = var.project_id
  name                        = "${var.project_id}-chore-photos"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  labels                      = local.labels

  # Deleted photos must really be gone (PLAN §5), so no soft-delete window.
  soft_delete_policy {
    retention_duration_seconds = 0
  }

  lifecycle_rule {
    condition {
      age = var.photo_retention_days
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.app]
}

resource "google_storage_bucket_iam_member" "web_photos" {
  bucket = google_storage_bucket.photos.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.web.email}"
}

resource "google_storage_bucket_iam_member" "worker_photos" {
  bucket = google_storage_bucket.photos.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.worker.email}"
}

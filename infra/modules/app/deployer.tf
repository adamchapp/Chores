# Least-privilege grants for the GitHub Actions deployer (created in
# infra/bootstrap): push images, roll out Cloud Run revisions, run the migrate
# job, and run services as their runtime service accounts. Nothing else.

locals {
  deployer_member = "serviceAccount:${var.deployer_service_account}"
}

resource "google_artifact_registry_repository_iam_member" "deployer_push" {
  project    = var.project_id
  location   = var.region
  repository = google_artifact_registry_repository.images.repository_id
  role       = "roles/artifactregistry.writer"
  member     = local.deployer_member
}

resource "google_project_iam_member" "deployer_run" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = local.deployer_member
}

resource "google_service_account_iam_member" "deployer_act_as" {
  for_each           = local.runtime_service_accounts
  service_account_id = each.value.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.deployer_member
}

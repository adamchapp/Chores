output "web_url" {
  value = google_cloud_run_v2_service.web.uri
}

output "image_repository" {
  description = "Docker repository for deploys."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.images.repository_id}"
}

output "photos_bucket" {
  value = google_storage_bucket.photos.name
}

output "sql_connection_name" {
  value = google_sql_database_instance.main.connection_name
}

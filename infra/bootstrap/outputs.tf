output "tfstate_bucket" {
  description = "Use as the -backend-config bucket for infra/envs/<env>."
  value       = google_storage_bucket.tfstate.name
}

output "workload_identity_provider" {
  description = "Set as the GitHub environment variable GCP_WORKLOAD_IDENTITY_PROVIDER."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deployer_service_account" {
  description = "Set as the GitHub environment variable GCP_DEPLOY_SERVICE_ACCOUNT."
  value       = google_service_account.deployer.email
}

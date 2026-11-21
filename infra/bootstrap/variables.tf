variable "project_id" {
  description = "GCP project ID for this environment."
  type        = string
}

variable "region" {
  description = "Region for the state bucket. UK data residency: europe-west2."
  type        = string
  default     = "europe-west2"
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy, as owner/name."
  type        = string
  default     = "adamchapp/chores"
}

variable "project_id" {
  type = string
}

variable "env" {
  description = "Environment name: dev, staging or prod."
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env must be dev, staging or prod."
  }
}

variable "region" {
  description = "All resources live here for UK data residency."
  type        = string
  default     = "europe-west2"
}

variable "deployer_service_account" {
  description = "Email of the GitHub Actions deployer service account (from infra/bootstrap)."
  type        = string
}

variable "db_tier" {
  type    = string
  default = "db-f1-micro"
}

variable "deletion_protection" {
  description = "Protect the database from accidental deletion. Must be true outside dev."
  type        = bool
  default     = true
}

variable "web_min_instances" {
  description = "0 scales to zero (cheapest). Use 1 in prod to avoid cold starts."
  type        = number
  default     = 0
}

variable "max_instances" {
  type    = number
  default = 3
}

variable "photo_retention_days" {
  description = "Backstop deletion for chore photos (PLAN §5). The app deletes sooner."
  type        = number
  default     = 30
}

variable "placeholder_image" {
  description = "Image used until the first deploy. Deploys change the image outside Terraform."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

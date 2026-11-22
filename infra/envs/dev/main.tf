# Dev environment. Staging and prod are copies of this folder with their own
# project, deletion_protection = true and (prod) web_min_instances = 1.

terraform {
  required_version = ">= 1.9"

  # Bucket comes from infra/bootstrap:
  #   terraform init -backend-config="bucket=<project>-tfstate"
  backend "gcs" {
    prefix = "env/dev"
  }
}

provider "google" {
  project = var.project_id
  region  = "europe-west2"
}

variable "project_id" {
  type = string
}

variable "deployer_service_account" {
  type = string
}

module "app" {
  source = "../../modules/app"

  project_id               = var.project_id
  env                      = "dev"
  deployer_service_account = var.deployer_service_account
  deletion_protection      = false
  web_min_instances        = 0
}

output "web_url" {
  value = module.app.web_url
}

output "image_repository" {
  value = module.app.image_repository
}

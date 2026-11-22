# Infrastructure (Google Cloud, Terraform)

```
infra/
  bootstrap/     One-off per GCP project: state bucket, GitHub keyless auth, deployer account
  modules/app/   Everything the app runs on: Cloud Run, Cloud SQL, photos bucket, secrets
  envs/dev/      Dev environment (staging/prod will be copies with stricter settings)
```

All resources are in `europe-west2` (London) for UK data residency.

## One-off setup for an environment

You need: a GCP project with billing, Owner rights on it, `gcloud` and Terraform ≥ 1.9.

```sh
gcloud auth application-default login

# 1. Bootstrap: state bucket + Workload Identity Federation for GitHub Actions
cd infra/bootstrap
terraform init
terraform apply -var project_id=<project-id>
#    Keep the outputs. Bootstrap state is local; store terraform.tfstate safely
#    (or migrate it into the bucket it created).

# 2. The environment itself
cd ../envs/dev
cp terraform.tfvars.example terraform.tfvars   # fill in project + deployer SA
terraform init -backend-config="bucket=<project-id>-tfstate"
terraform apply
```

Then in GitHub → Settings → Environments, create **`dev`** with these variables
(not secrets: there are no keys to store):

| Variable                         | Value                                         |
| -------------------------------- | --------------------------------------------- |
| `GCP_PROJECT_ID`                 | the project ID                                |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | bootstrap output `workload_identity_provider` |
| `GCP_DEPLOY_SERVICE_ACCOUNT`     | bootstrap output `deployer_service_account`   |

The next push to `main` deploys. Until `GCP_PROJECT_ID` is set, the deploy
workflow is skipped.

## How deploys work

Terraform owns the infrastructure; the deploy workflow owns which image runs.
Cloud Run resources start on a placeholder image and Terraform ignores image
changes, so the two never fight.

1. Build and push `web` and `worker` images tagged with the commit SHA.
2. Run the `migrate` Cloud Run Job (worker image, `node dist/migrate.js`).
3. Deploy `web` and `worker`, then check `/api/healthz` reports the new version.

## Not yet included

- Staging and prod environments (M7), gradual traffic shifting and auto-rollback.
- Cloud Scheduler and Cloud Tasks for jobs (M2).
- Identity Platform for guardian sign-in (M1).
- Terraform plan/apply from CI (applied by hand for now).
- Committed `.terraform.lock.hcl` files: generate them on first real `init` with
  `terraform providers lock -platform=linux_amd64 -platform=darwin_arm64`.

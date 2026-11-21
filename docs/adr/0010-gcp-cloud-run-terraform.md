# 10. Cloud Run in London, one GCP project per environment, Terraform

- **Status:** Proposed
- **Date:** 2026-11-21

## Context

You chose Google Cloud during planning. UK data residency (ADR 0003) and low
running costs matter.

## Decision

- **Cloud Run** for web, worker and the migrate job, scaling to zero in dev. **Cloud Storage** for photos. **Secret Manager** for secrets. **Artifact Registry** for images. Everything is in `europe-west2`.
- **Separate GCP projects** for dev, staging and prod, for hard isolation of data and permissions.
- **Terraform** for all infrastructure: `infra/bootstrap` (one-off per project), `infra/modules/app` (shared), `infra/envs/<env>`. State is in a versioned GCS bucket.
- Terraform creates Cloud Run resources with a placeholder image and ignores image changes. Deploys own the image version.
- Only dev exists for now. Staging and prod come in M7.

## Alternatives considered

- **GKE:** far more operational work for no benefit at this scale.
- **App Engine:** less flexible than Cloud Run and less actively developed.
- **Pulumi / gcloud scripts:** Terraform is the most widely known and documented for GCP.

## Consequences

- Low cost at launch (Cloud SQL is the main fixed cost).
- Terraform is applied by hand for now; plan/apply in CI can come later.

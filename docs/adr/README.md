# Architecture Decision Records

Short records of significant decisions: the context, the choice, and its
consequences. A decision isn't edited later. If it changes, a new ADR
supersedes it.

**Status key:** _Accepted_ means you chose it during planning. _Proposed_ means
I chose it while setting up the project, and it's waiting for your review.

| #                                             | Decision                                                                      | Status   |
| --------------------------------------------- | ----------------------------------------------------------------------------- | -------- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions                                                 | Accepted |
| [0002](0002-pwa-first-wrap-later.md)          | PWA first, wrap for app stores later                                          | Accepted |
| [0003](0003-uk-first-childrens-code.md)       | UK-first launch, Children's Code as the compliance baseline                   | Accepted |
| [0004](0004-parent-managed-kid-profiles.md)   | Parent-managed kid profiles with device + PIN                                 | Accepted |
| [0005](0005-photo-proof-short-retention.md)   | Photo proof reviewed by a parent, short retention, no scanning in v1          | Accepted |
| [0006](0006-one-off-purchase-stripe.md)       | One-off purchase via Stripe, store-agnostic entitlements                      | Accepted |
| [0007](0007-typescript-monorepo.md)           | TypeScript monorepo with pnpm + Turborepo                                     | Proposed |
| [0008](0008-nextjs-web-and-worker.md)         | Next.js for UI and API, plus a separate worker service                        | Proposed |
| [0009](0009-postgres-drizzle-tenancy.md)      | Postgres + Drizzle, household-scoped tenancy                                  | Proposed |
| [0010](0010-gcp-cloud-run-terraform.md)       | Cloud Run in London, one GCP project per environment, Terraform               | Proposed |
| [0011](0011-cicd-github-actions-wif.md)       | GitHub Actions with keyless deploys; migrations as a job                      | Proposed |
| [0012](0012-pure-domain-and-ledger.md)        | Pure domain package; append-only XP/coin ledger                               | Proposed |
| [0013](0013-toolchain-versions.md)            | Toolchain versions (TypeScript 6.0, Node 24, ESLint 10, Vitest 5, Tailwind 4) | Proposed |

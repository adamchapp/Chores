# 11. GitHub Actions with keyless deploys; migrations as a job

- **Status:** Proposed
- **Date:** 2026-11-21

## Context

We want every change checked automatically and deploys that are safe and need
no long-lived cloud keys.

## Decision

- **CI (every PR and push to main):** format, lint, typecheck, unit tests, Postgres integration tests (Testcontainers), production build, Docker image builds, and Terraform fmt/validate.
- **Deploy to dev (push to main):** authenticate with **Workload Identity Federation**, which only accepts tokens issued to `adamchapp/chores`. The deployer account can only push images, update Cloud Run and run services as their runtime accounts.
- Each deploy builds images tagged with the commit SHA, runs the **migrate Cloud Run Job**, deploys web and worker, then checks `/api/healthz` returns the new version.
- The deploy workflow skips itself until the `dev` GitHub environment is configured.

## Alternatives considered

- **Service account JSON keys in GitHub secrets:** a leak risk, and Google advises against them.
- **Cloud Build:** works, but keeping CI and CD in one place (GitHub) is simpler.
- **Migrating on app startup:** races between instances and couples schema changes to serving traffic.

## Consequences

- Staging/prod promotion, preview deploys per PR, and gradual traffic shifting with auto-rollback come later (PLAN §7). Playwright end-to-end and Lighthouse checks join CI when there's UI to test (M1/M3).

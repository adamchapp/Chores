# 13. Toolchain versions

- **Status:** Proposed
- **Date:** 2026-11-21

## Context

Initial versions were chosen on 2026-11-21. Most are the latest releases.
Where they're not, the reason is recorded here.

## Decision

| Tool                        | Version                                      | Note                                                                                      |
| --------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Node.js                     | 24 in CI and images (`.nvmrc`); works on 22+ | 24 is the active LTS                                                                      |
| pnpm                        | 10.28                                        | Pinned via `packageManager`                                                               |
| TypeScript                  | **6.0** (not 7.0)                            | typescript-eslint 8.x supports TypeScript below 6.1 only. Move to 7 when it adds support. |
| Next.js / React             | 16.4 / 19.3                                  |                                                                                           |
| ESLint                      | 10 (flat config) + typescript-eslint         |                                                                                           |
| Vitest + fast-check         | 5.1 / 4.10                                   |                                                                                           |
| Drizzle ORM / kit           | 0.45 / 0.31                                  |                                                                                           |
| Fastify                     | 5.12                                         |                                                                                           |
| Tailwind CSS                | 4.3                                          |                                                                                           |
| Terraform / Google provider | ≥ 1.9 / ~> 8.12                              |                                                                                           |
| Postgres                    | 16                                           | Same in Cloud SQL, docker-compose and tests                                               |

## Consequences

- Dependabot or Renovate should be added to keep these current (suggested next step).
- Docker images use `node:24-slim` by tag. Pin it to a digest before production.

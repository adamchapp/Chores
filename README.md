# Chores

Turn household chores into a family RPG. Parents set chores; kids complete them,
send photo proof, and earn XP and coins to level up their avatar and beat a
weekly boss together.

Mobile-first PWA, UK launch first. See [docs/PLAN.md](docs/PLAN.md) for the
product plan and [docs/adr](docs/adr/README.md) for architecture decisions.

## Repository layout

```
apps/web          Next.js PWA (guardian + kid UI) and API route handlers
apps/worker       Background jobs service (Fastify) + migrate job entry point
packages/domain   Pure game and scheduling rules (no I/O), heavily tested
packages/db       Postgres schema, migrations and client (Drizzle ORM)
infra             Terraform for Google Cloud
docs              Plan and architecture decision records
```

## Getting started

Needs Node 22+ (24 recommended, see `.nvmrc`), pnpm 10 (`corepack enable`) and Docker.

```sh
pnpm install
cp .env.example .env
pnpm db:up          # local Postgres in Docker
pnpm db:migrate     # apply migrations
pnpm dev            # web on http://localhost:3000, worker on :8080
```

## Common tasks

| Command                        | What it does                                                             |
| ------------------------------ | ------------------------------------------------------------------------ |
| `pnpm lint` / `pnpm typecheck` | Static checks across all packages                                        |
| `pnpm test`                    | Unit tests (fast, no Docker)                                             |
| `pnpm test:integration`        | Database tests against a real Postgres via Testcontainers (needs Docker) |
| `pnpm build`                   | Production builds                                                        |
| `pnpm format`                  | Prettier                                                                 |
| `pnpm db:generate`             | Generate a SQL migration after editing `packages/db/src/schema.ts`       |

Container images build from the repo root:
`docker build -f apps/web/Dockerfile .` (same for `apps/worker`).

## Deployment

Pushes to `main` deploy to the dev environment on Google Cloud Run once it's
configured. See [infra/README.md](infra/README.md).

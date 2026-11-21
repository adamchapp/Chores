# 7. TypeScript monorepo with pnpm + Turborepo

- **Status:** Proposed
- **Date:** 2026-11-21

## Context

The web app, background worker and shared rules must share types and logic.
You chose TypeScript full-stack during planning.

## Decision

- One repository using **pnpm workspaces** and **Turborepo** for task running and caching.
- `apps/web`, `apps/worker`, `packages/domain`, `packages/db`. More packages (`api`, `ui`) are added when there's code for them, not up front.
- Internal packages export TypeScript source directly (no build step for them). Next.js transpiles them; the worker bundles them with tsup.
- One root ESLint flat config and Prettier.

## Alternatives considered

- **npm/yarn workspaces:** pnpm is faster and stricter about undeclared dependencies.
- **Nx:** more powerful but heavier than this project needs.
- **Building each package to `dist`:** more config and slower dev loop, with no benefit while nothing is published.

## Consequences

- One `pnpm install`, one CI job, atomic changes across packages.
- `turbo prune` keeps Docker builds limited to what each app uses.

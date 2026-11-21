# 8. Next.js for UI and API, plus a separate worker service

- **Status:** Proposed
- **Date:** 2026-11-21

## Context

We need a PWA, an API and scheduled/background jobs (chore generation, boss
reset, notifications, photo deletion).

## Decision

- **apps/web:** Next.js 16 (App Router) for both guardian and kid UI, with the API in route handlers. tRPC is added in M1 for typed calls. Tailwind CSS for styling. Built as a standalone server for containers.
- **apps/worker:** a small Fastify service that Cloud Scheduler / Cloud Tasks call over authenticated HTTP. It's not publicly invokable. The same image also runs database migrations.

## Alternatives considered

- **API as its own service from day one:** more moving parts. Route handlers can be split out later because the logic lives in packages.
- **Jobs inside the web app:** couples long-running work to request-serving instances and complicates scaling.
- **Vite SPA + separate API:** loses server rendering for guardian pages and needs two deployables for the same result.

## Consequences

- Two deployables (web, worker) plus the migrate job.
- Service worker / offline support comes in M3. Only the web manifest exists now.

# Build from the repository root:
#   docker build -f apps/worker/Dockerfile -t chores-worker .
# The same image runs the worker service (default command) and the
# "migrate" Cloud Run Job (command: node dist/migrate.js).
ARG NODE_IMAGE=node:24-slim

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable

FROM base AS prune
WORKDIR /repo
COPY . .
RUN pnpm dlx turbo@2.11.13 prune @chores/worker --docker

FROM base AS build
WORKDIR /repo
COPY --from=prune /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /repo/out/full/ .
COPY tsconfig.base.json eslint.config.mjs ./
RUN pnpm turbo run build --filter=@chores/worker

FROM ${NODE_IMAGE} AS run
WORKDIR /app
ENV NODE_ENV=production PORT=8080 MIGRATIONS_DIR=/app/drizzle
COPY --from=build --chown=node:node /repo/apps/worker/dist ./dist
COPY --from=build --chown=node:node /repo/packages/db/drizzle ./drizzle
USER node
EXPOSE 8080
CMD ["node", "dist/index.js"]

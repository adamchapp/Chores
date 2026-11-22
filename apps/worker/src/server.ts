import Fastify, { type FastifyInstance } from "fastify";

export interface ServerOptions {
  version: string;
  logger?: boolean;
}

/**
 * Builds the worker HTTP app. Jobs arrive as authenticated POSTs from Cloud
 * Scheduler / Cloud Tasks (Cloud Run IAM does the authentication, so this
 * service is never publicly invokable). Job routes are added from M2 onwards.
 */
export function buildServer({ version, logger = false }: ServerOptions): FastifyInstance {
  const app = Fastify({ logger });

  app.get("/healthz", async () => ({ status: "ok", service: "worker", version }));

  return app;
}

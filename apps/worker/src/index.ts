import { buildServer } from "./server";

const port = Number(process.env.PORT ?? 8080);
const app = buildServer({ version: process.env.APP_VERSION ?? "dev", logger: true });

const shutdown = async () => {
  await app.close();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

await app.listen({ port, host: "0.0.0.0" });

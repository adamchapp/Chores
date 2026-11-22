import { describe, expect, it } from "vitest";
import { buildServer } from "./server";

describe("worker server", () => {
  it("reports healthy with its version", async () => {
    const app = buildServer({ version: "1.2.3" });
    const res = await app.inject({ method: "GET", url: "/healthz" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", service: "worker", version: "1.2.3" });
  });

  it("returns 404 for unknown routes", async () => {
    const app = buildServer({ version: "test" });
    const res = await app.inject({ method: "GET", url: "/nope" });
    expect(res.statusCode).toBe(404);
  });
});

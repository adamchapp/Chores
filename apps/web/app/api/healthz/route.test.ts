import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/healthz", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reports healthy with the deployed version and is never cached", async () => {
    vi.stubEnv("APP_VERSION", "abc123");
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ status: "ok", service: "web", version: "abc123" });
  });
});

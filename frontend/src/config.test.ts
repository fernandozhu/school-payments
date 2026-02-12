import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

describe("API_ENDPOINTS", () => {
  it("builds endpoints from VITE_API_BASE_URL", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:3000");

    const { API_ENDPOINTS } = await import("./config");

    expect(API_ENDPOINTS.fieldTrips).toBe("http://localhost:3000/api/fieldtrip");
    expect(API_ENDPOINTS.payment).toBe("http://localhost:3000/api/payment");

    vi.unstubAllEnvs();
  });

  it("defaults to empty base when env var is not set", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "");

    const { API_ENDPOINTS } = await import("./config");

    expect(API_ENDPOINTS.fieldTrips).toBe("/api/fieldtrip");
    expect(API_ENDPOINTS.payment).toBe("/api/payment");

    vi.unstubAllEnvs();
  });
});

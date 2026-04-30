import { describe, expect, it } from "vitest";
import { resolveEngineSeed } from "./engine-seed-session";

describe("resolveEngineSeed", () => {
  it("uses a precreated seed when provided", () => {
    const seed = resolveEngineSeed({
      precreatedSeed: "fixed-seed",
      hasHistory: false,
      searchParams: new URLSearchParams("seed=url-seed"),
      createSeed: () => "generated",
    });

    expect(seed).toBe("fixed-seed");
  });

  it("trims the MFCG suffix from first-load compatible URLs", () => {
    const seed = resolveEngineSeed({
      hasHistory: false,
      searchParams: new URLSearchParams("from=MFCG&seed=1234567890123"),
      createSeed: () => "generated",
    });

    expect(seed).toBe("123456789");
  });

  it("uses the URL seed only for the first generated map", () => {
    const seed = resolveEngineSeed({
      hasHistory: false,
      searchParams: new URLSearchParams("seed=url-seed"),
      createSeed: () => "generated",
    });

    expect(seed).toBe("url-seed");
  });

  it("generates a new seed after history exists", () => {
    const seed = resolveEngineSeed({
      hasHistory: true,
      searchParams: new URLSearchParams("seed=url-seed"),
      createSeed: () => "generated",
    });

    expect(seed).toBe("generated");
  });
});

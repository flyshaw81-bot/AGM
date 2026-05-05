import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createGlobalSeedRuntimeTargets,
  createGlobalSeedSessionTargets,
  createRuntimeSeedSession,
  createRuntimeSeedSessionTargets,
  createSeedSessionTargets,
  type EngineSeedDomTargets,
  type EngineSeedRuntimeTargets,
  EngineSeedSessionModule,
  type EngineSeedSessionTargets,
  resolveEngineSeed,
} from "./engine-seed-session";

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

function createTargets(
  overrides: Partial<EngineSeedSessionTargets> = {},
): EngineSeedSessionTargets {
  return {
    hasHistory: () => false,
    getSearchParams: () => new URLSearchParams(),
    setSeed: vi.fn(),
    setOptionsSeed: vi.fn(),
    setRandomGenerator: vi.fn(),
    createSeed: () => "generated",
    ...overrides,
  };
}

function createRuntimeContext(): EngineRuntimeContext {
  return {
    seed: "initial",
    options: {},
    random: {
      next: () => 0.123456789,
    },
  } as unknown as EngineRuntimeContext;
}

describe("EngineSeedSessionModule", () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  it("resolves seeds through injected targets", () => {
    const targets = createTargets({
      getSearchParams: () => new URLSearchParams("seed=url-seed"),
    });

    expect(new EngineSeedSessionModule(targets).resolve()).toBe("url-seed");
  });

  it("applies seeds through injected runtime targets", () => {
    const targets = createTargets();

    const seed = new EngineSeedSessionModule(targets).apply("fixed-seed");

    expect(seed).toBe("fixed-seed");
    expect(targets.setSeed).toHaveBeenCalledWith("fixed-seed");
    expect(targets.setOptionsSeed).toHaveBeenCalledWith("fixed-seed");
    expect(targets.setRandomGenerator).toHaveBeenCalledWith("fixed-seed");
  });

  it("writes options seed through injected DOM targets", () => {
    const optionsSeed = { value: "" } as HTMLInputElement;
    const domTargets: EngineSeedDomTargets = {
      getOptionsSeedInput: vi.fn(() => optionsSeed),
    };

    createGlobalSeedSessionTargets(domTargets).setOptionsSeed("dom-seed");

    expect(domTargets.getOptionsSeedInput).toHaveBeenCalled();
    expect(optionsSeed.value).toBe("dom-seed");
  });

  it("keeps global seed DOM targets safe when document is absent", () => {
    globalThis.document = undefined as unknown as Document;

    expect(() =>
      createGlobalSeedSessionTargets().setOptionsSeed("dom-seed"),
    ).not.toThrow();
  });

  it("keeps global seed DOM targets safe when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    expect(() =>
      createGlobalSeedSessionTargets().setOptionsSeed("dom-seed"),
    ).not.toThrow();
  });

  it("composes seed session targets from explicit runtime and DOM targets", () => {
    const optionsSeed = { value: "" } as HTMLInputElement;
    const runtimeTargets: EngineSeedRuntimeTargets = {
      hasHistory: vi.fn(() => true),
      getSearchParams: vi.fn(() => new URLSearchParams("seed=ignored")),
      setSeed: vi.fn(),
      setRandomGenerator: vi.fn(),
      createSeed: vi.fn(() => "runtime-seed"),
    };
    const sessionTargets = createSeedSessionTargets(runtimeTargets, {
      getOptionsSeedInput: () => optionsSeed,
    });

    const seed = new EngineSeedSessionModule(sessionTargets).apply();

    expect(seed).toBe("runtime-seed");
    expect(runtimeTargets.hasHistory).toHaveBeenCalled();
    expect(runtimeTargets.setSeed).toHaveBeenCalledWith("runtime-seed");
    expect(runtimeTargets.setRandomGenerator).toHaveBeenCalledWith(
      "runtime-seed",
    );
    expect(optionsSeed.value).toBe("runtime-seed");
  });

  it("reads seed session environment through explicit global runtime targets", () => {
    const originalMapHistory = globalThis.mapHistory;
    const originalLocation = globalThis.location;
    const originalSeed = globalThis.seed;
    const originalRandom = Math.random;
    const originalAleaPrng = globalThis.aleaPRNG;

    try {
      globalThis.mapHistory = [{ seed: "past" }];
      globalThis.location = {
        href: "https://agm.example/?seed=url-seed",
      } as Location;
      globalThis.aleaPRNG = vi.fn(() => () => 0.42) as typeof aleaPRNG;

      const runtimeTargets = createGlobalSeedRuntimeTargets();
      runtimeTargets.setSeed("global-seed");
      runtimeTargets.setRandomGenerator("global-seed");

      expect(runtimeTargets.hasHistory()).toBe(true);
      expect(runtimeTargets.getSearchParams().get("seed")).toBe("url-seed");
      expect(globalThis.seed).toBe("global-seed");
      expect(globalThis.aleaPRNG).toHaveBeenCalledWith("global-seed");
      expect(Math.random()).toBe(0.42);
    } finally {
      globalThis.mapHistory = originalMapHistory;
      globalThis.location = originalLocation;
      globalThis.seed = originalSeed;
      globalThis.aleaPRNG = originalAleaPrng;
      Math.random = originalRandom;
    }
  });

  it("writes resolved seeds into the runtime context before delegating", () => {
    const context = createRuntimeContext();
    const fallback = createTargets();
    const session = createRuntimeSeedSession(
      context,
      createRuntimeSeedSessionTargets(context, fallback),
    );

    const seed = session.apply();

    expect(seed).toBe("123456789");
    expect(context.seed).toBe("123456789");
    expect(context.options.seed).toBe("123456789");
    expect(fallback.setSeed).toHaveBeenCalledWith("123456789");
    expect(fallback.setOptionsSeed).toHaveBeenCalledWith("123456789");
    expect(fallback.setRandomGenerator).toHaveBeenCalledWith("123456789");
  });

  it("can be imported when window access throws", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./engine-seed-session")).resolves.toBeDefined();
  });
});

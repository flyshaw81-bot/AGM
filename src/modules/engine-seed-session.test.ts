import { describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createGlobalSeedSessionTargets,
  createRuntimeSeedSession,
  createRuntimeSeedSessionTargets,
  type EngineSeedDomTargets,
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
});

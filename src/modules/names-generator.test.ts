import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalNamesRuntimeAdapters,
  NamesGenerator,
  type NamesRuntimeAdapters,
} from "./names-generator";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

function createAdapters(
  overrides: Partial<NamesRuntimeAdapters> = {},
): NamesRuntimeAdapters {
  return {
    logs: {
      warn: vi.fn(),
      error: vi.fn(),
    },
    showTip: vi.fn(),
    ...overrides,
  };
}

describe("NamesGenerator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    }
  });

  it("can be imported when window access throws", async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./names-generator")).resolves.toBeDefined();
  });

  it("can calculate Markov chains without browser globals", () => {
    const names = new NamesGenerator();

    const chain = names.calculateChain("Aldor,Berin,Cael");

    expect(chain[""]).toEqual(expect.arrayContaining(["al", "be", "cael"]));
    expect(chain.l.length).toBeGreaterThan(0);
  });

  it("routes validation errors through injected adapters", () => {
    const errors: string[] = [];
    const names = new NamesGenerator(
      createAdapters({
        logs: {
          warn: () => {},
          error: (message) => {
            errors.push(message);
          },
        },
      }),
    );

    expect(names.getBase(undefined as unknown as number)).toBe("ERROR");
    expect(errors).toEqual(["Please define a base"]);
  });

  it("uses injected randomness for state suffix selection", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    let randomCalls = 0;
    const names = new NamesGenerator(
      createAdapters({
        random: {
          next: () => {
            randomCalls++;
            return 0.5;
          },
        },
      }),
    );

    expect(names.getState("Bud", 1, 16)).toBe("Budyurt");
    expect(randomCalls).toBe(1);
  });

  it("creates global runtime adapters without invoking globals eagerly", () => {
    const adapters = createGlobalNamesRuntimeAdapters();

    expect(adapters.logs.warn).toBeTypeOf("function");
    expect(adapters.logs.error).toBeTypeOf("function");
    expect(adapters.showTip).toBeTypeOf("function");
  });
});

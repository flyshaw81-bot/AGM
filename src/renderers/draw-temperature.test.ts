import { afterEach, describe, expect, it, vi } from "vitest";

describe("temperature renderer compatibility mount", () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalNode = globalThis.Node;

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    Object.defineProperty(globalThis, "Node", {
      configurable: true,
      value: originalNode,
      writable: true,
    });
  });

  it("can be imported when window is absent", async () => {
    globalThis.window = undefined as unknown as Window & typeof globalThis;
    globalThis.document = undefined as unknown as Document;
    globalThis.Node = undefined as unknown as typeof Node;

    await expect(import("./draw-temperature")).resolves.toBeTruthy();
  });

  it("uses an AGM-owned temperature range without hidden controls", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    const { createGlobalTemperatureRendererTargets } = await import(
      "./draw-temperature"
    );

    expect(
      createGlobalTemperatureRendererTargets().getTemperatureRange(),
    ).toEqual({
      min: -50,
      max: 50,
    });
  });
});

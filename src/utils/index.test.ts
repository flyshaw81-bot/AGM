import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("utils barrel", () => {
  it("can be imported without browser globals", async () => {
    globalThis.window = undefined as unknown as Window & typeof globalThis;
    globalThis.document = undefined as unknown as Document;
    globalThis.Node = undefined as unknown as typeof Node;

    const utils = await import("./index");

    expect(utils.rn(1.234, 1)).toBe(1.2);
    expect(utils.P(1)).toBe(true);
  });

  it("can be imported when browser global access throws", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "Node", {
      configurable: true,
      get: () => {
        throw new Error("Node blocked");
      },
    });

    const utils = await import("./index");

    expect(utils.normalize(5, 0, 10)).toBe(0.5);
    expect(utils.generateSeed()).toMatch(/^\d+$/);
  });
});

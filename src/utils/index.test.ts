import { afterEach, describe, expect, it, vi } from "vitest";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalNode = globalThis.Node;

afterEach(() => {
  vi.resetModules();
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
  globalThis.Node = originalNode;
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
});

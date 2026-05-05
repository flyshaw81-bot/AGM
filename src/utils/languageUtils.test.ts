import { afterEach, describe, expect, it } from "vitest";
import { list } from "./languageUtils";

describe("list", () => {
  const originalDocument = globalThis.document;

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
  });

  it("formats lists without browser document globals", () => {
    globalThis.document = undefined as unknown as Document;

    expect(list(["alpha", "beta"])).toBe("alpha and beta");
  });

  it("falls back to English when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    expect(list(["alpha", "beta"])).toBe("alpha and beta");
  });

  it("falls back to English when language lookup throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        get documentElement() {
          throw new Error("language blocked");
        },
      },
      writable: true,
    });

    expect(list(["alpha", "beta"])).toBe("alpha and beta");
  });
});

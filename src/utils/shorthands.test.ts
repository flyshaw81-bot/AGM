import { afterEach, describe, expect, it, vi } from "vitest";
import {
  byId,
  createGlobalDomLookupTargets,
  type DomLookupTargets,
} from "./shorthands";

describe("byId", () => {
  const originalDocument = globalThis.document;

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
  });

  it("uses injected DOM lookup targets", () => {
    const element = { id: "map" } as HTMLElement;
    const targets: DomLookupTargets = {
      getElementById: vi.fn(() => element),
    };

    expect(byId("map", targets)).toBe(element);
    expect(targets.getElementById).toHaveBeenCalledWith("map");
  });

  it("keeps global DOM lookup safe when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    expect(byId("map", createGlobalDomLookupTargets())).toBeUndefined();
  });

  it("keeps global DOM lookup safe when element lookup throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementById: () => {
          throw new Error("element lookup blocked");
        },
      },
      writable: true,
    });

    expect(byId("map", createGlobalDomLookupTargets())).toBeUndefined();
  });
});

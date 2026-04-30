import { describe, expect, it, vi } from "vitest";
import { createGlobalInitialStateTargets } from "./initialStateTargets";

describe("createGlobalInitialStateTargets", () => {
  it("composes default startup adapters", () => {
    const originalLocalStorage = globalThis.localStorage;
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      },
    });
    globalThis.document = {
      getElementById: vi.fn(() => null),
      documentElement: {
        lang: "",
        dataset: {},
      },
    } as unknown as Document;

    try {
      const targets = createGlobalInitialStateTargets();

      expect(targets.getEngineDocumentState()).toMatchObject({
        name: expect.any(String),
      });
      expect(targets.getEngineStylePreset()).toEqual(expect.any(String));
      expect(targets.getPresetById("desktop-landscape")).toMatchObject({
        id: "desktop-landscape",
      });
      expect(targets.preferences.getStorageItem("missing")).toBeNull();
      expect(targets.projectCenter.getStorageItem("missing")).toBeNull();
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: originalLocalStorage,
      });
      globalThis.document = originalDocument;
    }
  });
});

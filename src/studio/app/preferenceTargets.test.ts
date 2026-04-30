import { describe, expect, it, vi } from "vitest";
import { createGlobalStudioPreferenceTargets } from "./preferenceTargets";

describe("createGlobalStudioPreferenceTargets", () => {
  it("wires browser storage and document writes behind preference targets", () => {
    const storage = {
      getItem: vi.fn(() => "en"),
      setItem: vi.fn(),
    };
    const documentElement = {
      lang: "",
      dataset: {} as Record<string, string>,
    };
    const originalLocalStorage = globalThis.localStorage;
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    });
    globalThis.document = {
      documentElement,
    } as unknown as Document;

    try {
      const targets = createGlobalStudioPreferenceTargets();

      expect(targets.getStorageItem("language")).toBe("en");
      targets.setStorageItem("theme", "daylight");
      targets.setDocumentLanguage("en");
      targets.setDocumentTheme("daylight");

      expect(storage.getItem).toHaveBeenCalledWith("language");
      expect(storage.setItem).toHaveBeenCalledWith("theme", "daylight");
      expect(documentElement.lang).toBe("en");
      expect(documentElement.dataset.studioTheme).toBe("daylight");
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: originalLocalStorage,
      });
      globalThis.document = originalDocument;
    }
  });
});

import { describe, expect, it, vi } from "vitest";
import {
  createGlobalStudioPreferenceTargets,
  createStudioPreferenceTargets,
} from "./preferenceTargets";

describe("createGlobalStudioPreferenceTargets", () => {
  it("composes storage and document preference adapters", () => {
    const storage = {
      getStorageItem: vi.fn(() => "zh-CN"),
      setStorageItem: vi.fn(),
    };
    const documentAdapter = {
      setDocumentLanguage: vi.fn(),
      setDocumentTheme: vi.fn(),
    };

    const targets = createStudioPreferenceTargets(storage, documentAdapter);

    expect(targets.getStorageItem("language")).toBe("zh-CN");
    targets.setStorageItem("theme", "night");
    targets.setDocumentLanguage("en");
    targets.setDocumentTheme("daylight");

    expect(storage.setStorageItem).toHaveBeenCalledWith("theme", "night");
    expect(documentAdapter.setDocumentLanguage).toHaveBeenCalledWith("en");
    expect(documentAdapter.setDocumentTheme).toHaveBeenCalledWith("daylight");
  });

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

  it("keeps global preference targets safe when storage and document are absent", () => {
    const originalLocalStorage = globalThis.localStorage;
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: undefined,
    });
    globalThis.document = undefined as unknown as Document;

    try {
      const targets = createGlobalStudioPreferenceTargets();

      expect(targets.getStorageItem("language")).toBeNull();
      expect(() => targets.setStorageItem("theme", "night")).not.toThrow();
      expect(() => targets.setDocumentLanguage("en")).not.toThrow();
      expect(() => targets.setDocumentTheme("night")).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: originalLocalStorage,
      });
      globalThis.document = originalDocument;
    }
  });
});

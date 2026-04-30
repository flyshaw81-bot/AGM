import { describe, expect, it, vi } from "vitest";
import {
  createGlobalInitialStateTargets,
  createInitialStateTargets,
} from "./initialStateTargets";

describe("initial state targets", () => {
  it("composes startup targets from injected adapters", () => {
    const getEngineDocumentState = vi.fn(() => ({
      name: "Northwatch",
      documentWidth: 1200,
      documentHeight: 800,
      seed: "42",
      stylePreset: "default",
      dirty: false,
      source: "core" as const,
    }));
    const getEngineStylePreset = vi.fn(() => "pencil");
    const getPresetById = vi.fn(() => ({
      id: "desktop-landscape",
      label: "Desktop landscape",
      category: "desktop" as const,
      width: 1200,
      height: 800,
      orientation: "landscape" as const,
    }));
    const preferences = {
      getStorageItem: vi.fn(() => null),
      setStorageItem: vi.fn(),
      setDocumentLanguage: vi.fn(),
      setDocumentTheme: vi.fn(),
    };
    const projectCenter = {
      getStorageItem: vi.fn(() => null),
    };

    const targets = createInitialStateTargets({
      getEngineDocumentState,
      getEngineStylePreset,
      getPresetById,
      preferences,
      projectCenter,
    });

    expect(targets.getEngineDocumentState()).toMatchObject({
      name: "Northwatch",
      seed: "42",
    });
    expect(targets.getEngineStylePreset()).toBe("pencil");
    expect(targets.getPresetById("desktop-landscape")).toMatchObject({
      id: "desktop-landscape",
    });
    expect(targets.preferences).toBe(preferences);
    expect(targets.projectCenter).toBe(projectCenter);
  });

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

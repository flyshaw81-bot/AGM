import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalLayerTargets,
  createLayerTargets,
} from "./engineLayerTargets";

type TestLayerGlobals = typeof globalThis & {
  toggleRivers?: () => void;
  layerIsOn?: (layerId: string) => boolean;
};

const testGlobals = globalThis as TestLayerGlobals;
const originalDocument = globalThis.document;
const originalToggleRivers = testGlobals.toggleRivers;
const originalLayerIsOn = testGlobals.layerIsOn;

describe("createGlobalLayerTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    testGlobals.toggleRivers = originalToggleRivers;
    testGlobals.layerIsOn = originalLayerIsOn;
  });

  it("forwards layer handler checks, active state, and toggles", () => {
    const toggleRivers = vi.fn();
    const targets = createLayerTargets(
      {
        getHandler: (action) =>
          action === "toggleRivers" ? toggleRivers : undefined,
        isLayerOn: (action) => action === "toggleRivers",
      },
      {
        getLayerItems: () => [],
      },
    );

    expect(targets.hasLayerHandler("toggleRivers")).toBe(true);
    expect(targets.isLayerOn("toggleRivers")).toBe(true);
    targets.toggleLayer("toggleRivers");
    expect(toggleRivers).toHaveBeenCalledWith();
  });

  it("keeps global layer handlers behind the default runtime adapter", () => {
    const toggleRivers = vi.fn();
    testGlobals.toggleRivers = toggleRivers;
    testGlobals.layerIsOn = vi.fn((layerId) => layerId === "toggleRivers");

    const targets = createGlobalLayerTargets();

    expect(targets.hasLayerHandler("toggleRivers")).toBe(true);
    expect(targets.isLayerOn("toggleRivers")).toBe(true);
    targets.toggleLayer("toggleRivers");
    expect(toggleRivers).toHaveBeenCalledWith();
  });

  it("reads layer detail metadata from the active map layer list", () => {
    const item = {
      id: "toggleRivers",
      textContent: " Rivers ",
      dataset: { shortcut: "R" },
      classList: { contains: vi.fn((name) => name === "solid") },
    };
    const list = {
      querySelectorAll: vi.fn(() => [item]),
    };
    globalThis.document = {
      getElementById: vi.fn((id) => (id === "mapLayers" ? list : null)),
    } as unknown as Document;

    const targets = createLayerTargets(
      {
        getHandler: () => undefined,
        isLayerOn: () => false,
      },
      {
        getLayerItems: () => [item as unknown as HTMLLIElement],
      },
    );

    expect(targets.getLayerDetails()).toEqual([
      {
        id: "toggleRivers",
        label: "Rivers",
        shortcut: "R",
        pinned: true,
      },
    ]);
  });

  it("keeps map layer list queries behind the default DOM adapter", () => {
    const item = {
      id: "toggleRivers",
      textContent: " Rivers ",
      dataset: { shortcut: "R" },
      classList: { contains: vi.fn((name) => name === "solid") },
    };
    const list = {
      querySelectorAll: vi.fn(() => [item]),
    };
    globalThis.document = {
      getElementById: vi.fn((id) => (id === "mapLayers" ? list : null)),
    } as unknown as Document;

    expect(createGlobalLayerTargets().getLayerDetails()).toEqual([
      {
        id: "toggleRivers",
        label: "Rivers",
        shortcut: "R",
        pinned: true,
      },
    ]);
    expect(list.querySelectorAll).toHaveBeenCalledWith("li[id^='toggle']");
  });
});

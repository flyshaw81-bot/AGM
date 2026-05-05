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
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalToggleRiversDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "toggleRivers",
);
const originalLayerIsOnDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "layerIsOn",
);

describe("createGlobalLayerTargets", () => {
  afterEach(() => {
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
    } else {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        writable: true,
        value: originalDocument,
      });
    }
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
    if (originalToggleRiversDescriptor) {
      Object.defineProperty(
        globalThis,
        "toggleRivers",
        originalToggleRiversDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "toggleRivers", {
        configurable: true,
        writable: true,
        value: originalToggleRivers,
      });
    }
    if (originalLayerIsOnDescriptor) {
      Object.defineProperty(
        globalThis,
        "layerIsOn",
        originalLayerIsOnDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "layerIsOn", {
        configurable: true,
        writable: true,
        value: originalLayerIsOn,
      });
    }
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

  it("keeps default layer targets safe when browser globals throw", () => {
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
    Object.defineProperty(globalThis, "toggleRivers", {
      configurable: true,
      value: () => {
        throw new Error("handler blocked");
      },
    });
    Object.defineProperty(globalThis, "layerIsOn", {
      configurable: true,
      get: () => {
        throw new Error("layer state blocked");
      },
    });

    const targets = createGlobalLayerTargets();

    expect(targets.hasLayerHandler("toggleRivers")).toBe(true);
    expect(targets.isLayerOn("toggleRivers")).toBe(false);
    expect(() => targets.toggleLayer("toggleRivers")).not.toThrow();
    expect(targets.getLayerDetails()).toEqual([]);
  });
});

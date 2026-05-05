import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalStyleTargets,
  createStyleTargets,
  type EngineStyleRuntimeAdapter,
  type EngineStyleStorageAdapter,
  type EngineStyleToggleAdapter,
} from "./engineStyleTargets";

type TestStyleGlobals = typeof globalThis & {
  stylePreset?: {
    value?: string;
  };
  requestStylePresetChange?: (preset: string) => void;
  changeStyle?: (preset: string) => void;
  invokeActiveZooming?: () => void;
};

const testGlobals = globalThis as TestStyleGlobals;
const originalDocument = globalThis.document;
const originalEvent = globalThis.Event;
const originalLocalStorage = globalThis.localStorage;
const originalStylePreset = testGlobals.stylePreset;
const originalRequestStylePresetChange = testGlobals.requestStylePresetChange;
const originalChangeStyle = testGlobals.changeStyle;
const originalInvokeActiveZooming = testGlobals.invokeActiveZooming;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalEventDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Event",
);
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalStylePresetDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "stylePreset",
);
const originalRequestStylePresetChangeDescriptor =
  Object.getOwnPropertyDescriptor(globalThis, "requestStylePresetChange");
const originalChangeStyleDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "changeStyle",
);
const originalInvokeActiveZoomingDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "invokeActiveZooming",
);

describe("createGlobalStyleTargets", () => {
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
    if (originalEventDescriptor) {
      Object.defineProperty(globalThis, "Event", originalEventDescriptor);
    } else {
      Object.defineProperty(globalThis, "Event", {
        configurable: true,
        writable: true,
        value: originalEvent,
      });
    }
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
    if (originalStylePresetDescriptor) {
      Object.defineProperty(
        globalThis,
        "stylePreset",
        originalStylePresetDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "stylePreset", {
        configurable: true,
        writable: true,
        value: originalStylePreset,
      });
    }
    if (originalRequestStylePresetChangeDescriptor) {
      Object.defineProperty(
        globalThis,
        "requestStylePresetChange",
        originalRequestStylePresetChangeDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "requestStylePresetChange", {
        configurable: true,
        writable: true,
        value: originalRequestStylePresetChange,
      });
    }
    if (originalChangeStyleDescriptor) {
      Object.defineProperty(
        globalThis,
        "changeStyle",
        originalChangeStyleDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "changeStyle", {
        configurable: true,
        writable: true,
        value: originalChangeStyle,
      });
    }
    if (originalInvokeActiveZoomingDescriptor) {
      Object.defineProperty(
        globalThis,
        "invokeActiveZooming",
        originalInvokeActiveZoomingDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "invokeActiveZooming", {
        configurable: true,
        writable: true,
        value: originalInvokeActiveZooming,
      });
    }
  });

  it("reads current and stored preset values", () => {
    const getItem = vi.fn(() => "atlas");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem },
    });
    testGlobals.stylePreset = { value: "night" };

    const targets = createGlobalStyleTargets();

    expect(targets.getCurrentPresetValue()).toBe("night");
    expect(targets.getStoredPresetValue()).toBe("atlas");
  });

  it("writes preset storage and forwards style hooks", () => {
    const setItem = vi.fn();
    const requestStylePresetChange = vi.fn();
    const changeStyle = vi.fn();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { setItem },
    });
    testGlobals.requestStylePresetChange = requestStylePresetChange;
    testGlobals.changeStyle = changeStyle;

    const targets = createGlobalStyleTargets();
    targets.storePresetValue("atlas");

    expect(setItem).toHaveBeenCalledWith("presetStyle", "atlas");
    expect(targets.requestStylePresetChange("atlas")).toBe(true);
    expect(requestStylePresetChange).toHaveBeenCalledWith("atlas");
    expect(targets.changeStyle("night")).toBe(true);
    expect(changeStyle).toHaveBeenCalledWith("night");
  });

  it("keeps preset storage safe when browser storage access throws", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("localStorage blocked");
      },
    });

    const targets = createGlobalStyleTargets();

    expect(targets.getStoredPresetValue()).toBeNull();
    expect(() => targets.storePresetValue("atlas")).not.toThrow();
  });

  it("updates toggle checkboxes and dispatches change", () => {
    const dispatchEvent = vi.fn();
    const input = {
      checked: false,
      dispatchEvent,
    };
    globalThis.document = {
      getElementById: vi.fn((id) => (id === "hideLabels" ? input : null)),
    } as unknown as Document;

    const targets = createGlobalStyleTargets();

    expect(targets.isToggleChecked("hideLabels")).toBe(false);
    expect(targets.setToggleChecked("hideLabels", true)).toBe(true);
    expect(input.checked).toBe(true);
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
  });

  it("keeps toggle writes safe when Event is absent", () => {
    const dispatchEvent = vi.fn();
    const input = {
      checked: false,
      dispatchEvent,
    };
    globalThis.Event = undefined as unknown as typeof Event;
    globalThis.document = {
      getElementById: vi.fn((id) => (id === "hideLabels" ? input : null)),
    } as unknown as Document;

    expect(
      createGlobalStyleTargets().setToggleChecked("hideLabels", true),
    ).toBe(true);

    expect(input.checked).toBe(true);
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it("forwards active zoom refresh when available", () => {
    const invokeActiveZooming = vi.fn();
    testGlobals.invokeActiveZooming = invokeActiveZooming;

    createGlobalStyleTargets().invokeActiveZooming();

    expect(invokeActiveZooming).toHaveBeenCalledWith();
  });

  it("keeps default style targets safe when browser globals throw", () => {
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
    Object.defineProperty(globalThis, "Event", {
      configurable: true,
      get: () => {
        throw new Error("Event blocked");
      },
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("storage read blocked");
        },
        setItem: () => {
          throw new Error("storage write blocked");
        },
      },
    });
    Object.defineProperty(globalThis, "stylePreset", {
      configurable: true,
      get: () => {
        throw new Error("style preset blocked");
      },
    });
    Object.defineProperty(globalThis, "requestStylePresetChange", {
      configurable: true,
      value: () => {
        throw new Error("request style blocked");
      },
    });
    Object.defineProperty(globalThis, "changeStyle", {
      configurable: true,
      value: () => {
        throw new Error("change style blocked");
      },
    });
    Object.defineProperty(globalThis, "invokeActiveZooming", {
      configurable: true,
      value: () => {
        throw new Error("zoom blocked");
      },
    });

    const targets = createGlobalStyleTargets();

    expect(targets.getCurrentPresetValue()).toBe("");
    expect(targets.getStoredPresetValue()).toBeNull();
    expect(() => targets.storePresetValue("atlas")).not.toThrow();
    expect(targets.isToggleChecked("hideLabels")).toBe(false);
    expect(targets.setToggleChecked("hideLabels", true)).toBe(false);
    expect(targets.requestStylePresetChange("atlas")).toBe(false);
    expect(targets.changeStyle("night")).toBe(false);
    expect(() => targets.invokeActiveZooming()).not.toThrow();
  });

  it("composes style targets from injected runtime, storage, and toggle adapters", () => {
    const requestStylePresetChange = vi.fn(() => true);
    const changeStyle = vi.fn(() => true);
    const invokeActiveZooming = vi.fn();
    const storePresetValue = vi.fn();
    const dispatchChange = vi.fn();
    const runtimeAdapter: EngineStyleRuntimeAdapter = {
      getCurrentPresetValue: () => "night",
      requestStylePresetChange,
      changeStyle,
      invokeActiveZooming,
    };
    const storageAdapter: EngineStyleStorageAdapter = {
      getStoredPresetValue: () => "atlas",
      storePresetValue,
    };
    const toggleAdapter: EngineStyleToggleAdapter = {
      isToggleChecked: (id) => id === "hideLabels",
      setToggleChecked: vi.fn(() => true),
      dispatchChange,
    };

    const targets = createStyleTargets(
      runtimeAdapter,
      storageAdapter,
      toggleAdapter,
    );

    expect(targets.getCurrentPresetValue()).toBe("night");
    expect(targets.getStoredPresetValue()).toBe("atlas");
    targets.storePresetValue("custom");
    expect(storePresetValue).toHaveBeenCalledWith("custom");
    expect(targets.isToggleChecked("hideLabels")).toBe(true);
    expect(targets.setToggleChecked("hideLabels", false)).toBe(true);
    expect(targets.requestStylePresetChange("atlas")).toBe(true);
    expect(requestStylePresetChange).toHaveBeenCalledWith("atlas");
    expect(targets.changeStyle("night")).toBe(true);
    expect(changeStyle).toHaveBeenCalledWith("night");
    targets.invokeActiveZooming();
    expect(invokeActiveZooming).toHaveBeenCalledWith();
  });
});

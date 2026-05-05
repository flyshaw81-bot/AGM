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

describe("createGlobalStyleTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.Event = originalEvent;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
    testGlobals.stylePreset = originalStylePreset;
    testGlobals.requestStylePresetChange = originalRequestStylePresetChange;
    testGlobals.changeStyle = originalChangeStyle;
    testGlobals.invokeActiveZooming = originalInvokeActiveZooming;
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

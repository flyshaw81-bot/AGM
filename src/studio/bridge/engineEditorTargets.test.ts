import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalEngineEditorTargets } from "./engineEditorTargets";

type TestEditorGlobals = typeof globalThis & {
  editStates?: () => Promise<void>;
  editBiomes?: () => void;
};

const testGlobals = globalThis as TestEditorGlobals;
const testGlobalRecord = globalThis as Record<string, unknown>;
const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
const originalEditStates = testGlobals.editStates;
const originalEditBiomes = testGlobals.editBiomes;

describe("createGlobalEngineEditorTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
    testGlobals.editStates = originalEditStates;
    testGlobals.editBiomes = originalEditBiomes;
  });

  it("detects and runs editor handlers from the active runtime", async () => {
    const editStates = vi.fn(async () => undefined);
    testGlobals.editStates = editStates;
    testGlobalRecord.editBiomes = undefined;

    const targets = createGlobalEngineEditorTargets();

    expect(targets.hasEditorHandler("editStates")).toBe(true);
    expect(targets.hasEditorHandler("editBiomes")).toBe(false);
    await targets.runEditorHandler("editStates");
    await targets.runEditorHandler("editBiomes");

    expect(editStates).toHaveBeenCalledTimes(1);
  });

  it("reads dialog visibility and closes via jQuery UI wrapper controls", () => {
    const closeButton = { click: vi.fn() };
    const wrapper = {
      querySelector: vi.fn(() => closeButton),
      setAttribute: vi.fn(),
      style: { display: "block" },
    };
    const dialog = {
      hidden: false,
      offsetParent: {},
      closest: vi.fn(() => wrapper),
    };
    globalThis.document = {
      getElementById: vi.fn(() => dialog),
    } as unknown as Document;
    globalThis.window = {
      getComputedStyle: vi.fn(() => ({
        display: "block",
        visibility: "visible",
      })),
    } as unknown as Window & typeof globalThis;

    const targets = createGlobalEngineEditorTargets();

    expect(targets.isDialogOpen("statesEditor")).toBe(true);
    targets.closeDialog("statesEditor");

    expect(closeButton.click).toHaveBeenCalledWith();
    expect(wrapper.setAttribute).not.toHaveBeenCalled();
  });

  it("falls back to hiding the wrapper when no close button exists", () => {
    const wrapper = {
      querySelector: vi.fn(() => null),
      setAttribute: vi.fn(),
      style: { display: "block" },
    };
    const dialog = {
      closest: vi.fn(() => wrapper),
    };
    globalThis.document = {
      getElementById: vi.fn(() => dialog),
    } as unknown as Document;

    const targets = createGlobalEngineEditorTargets();
    targets.closeDialog("statesEditor");

    expect(wrapper.setAttribute).toHaveBeenCalledWith("aria-hidden", "true");
    expect(wrapper.style.display).toBe("none");
  });
});

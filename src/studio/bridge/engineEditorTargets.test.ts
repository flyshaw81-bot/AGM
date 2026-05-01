import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createCompositeEngineEditorDialogAdapter,
  createEngineEditorTargets,
  createGlobalEngineEditorDialogDomAdapter,
  createGlobalEngineEditorHandlerRuntime,
  createGlobalEngineEditorTargets,
  createJQueryEngineEditorDialogAdapter,
  createStudioEngineEditorDialogAdapter,
  type EngineEditorDialogAdapter,
  type EngineEditorDialogDomAdapter,
} from "./engineEditorTargets";

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;

describe("createEngineEditorTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  });

  it("detects and runs editor handlers from the active runtime", async () => {
    const editStates = vi.fn(async () => undefined);
    const dialogAdapter: EngineEditorDialogAdapter = {
      isOpen: vi.fn(),
      close: vi.fn(),
    };

    const targets = createEngineEditorTargets(
      {
        getHandler: (action) =>
          action === "editStates" ? editStates : undefined,
      },
      dialogAdapter,
    );

    expect(targets.hasEditorHandler("editStates")).toBe(true);
    expect(targets.hasEditorHandler("editBiomes")).toBe(false);
    await targets.runEditorHandler("editStates");
    await targets.runEditorHandler("editBiomes");

    expect(editStates).toHaveBeenCalledTimes(1);
  });

  it("delegates dialog visibility and closing to the injected dialog adapter", () => {
    const dialogAdapter: EngineEditorDialogAdapter = {
      isOpen: vi.fn(() => true),
      close: vi.fn(),
    };
    const targets = createEngineEditorTargets(
      { getHandler: () => undefined },
      dialogAdapter,
    );

    expect(targets.isDialogOpen("statesEditor")).toBe(true);
    targets.closeDialog("statesEditor");

    expect(dialogAdapter.close).toHaveBeenCalledWith("statesEditor");
  });

  it("keeps the global factory as compatibility wiring over injected adapters", async () => {
    const editStates = vi.fn(async () => undefined);
    const dialogAdapter: EngineEditorDialogAdapter = {
      isOpen: vi.fn(() => true),
      close: vi.fn(),
    };

    const targets = createGlobalEngineEditorTargets(
      {
        getHandler: (action) =>
          action === "editStates" ? editStates : undefined,
      },
      dialogAdapter,
    );

    expect(targets.hasEditorHandler("editStates")).toBe(true);
    await targets.runEditorHandler("editStates");
    expect(targets.isDialogOpen("statesEditor")).toBe(true);
    targets.closeDialog("statesEditor");

    expect(editStates).toHaveBeenCalledTimes(1);
    expect(dialogAdapter.close).toHaveBeenCalledWith("statesEditor");
  });

  it("keeps global editor handlers safe when window is absent", () => {
    globalThis.window = undefined as unknown as Window & typeof globalThis;

    const runtime = createGlobalEngineEditorHandlerRuntime();

    expect(runtime.getHandler("editStates")).toBeUndefined();
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
    const domAdapter: EngineEditorDialogDomAdapter = {
      getElementById: vi.fn(() => dialog as unknown as HTMLElement),
      getComputedStyle: vi.fn(() => ({
        display: "block",
        visibility: "visible",
      })),
    };

    const adapter = createJQueryEngineEditorDialogAdapter(domAdapter);

    expect(adapter.isOpen("statesEditor")).toBe(true);
    adapter.close("statesEditor");

    expect(domAdapter.getElementById).toHaveBeenCalledWith("statesEditor");
    expect(domAdapter.getComputedStyle).toHaveBeenCalledWith(dialog);
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
    const adapter = createJQueryEngineEditorDialogAdapter({
      getElementById: vi.fn(() => dialog as unknown as HTMLElement),
      getComputedStyle: vi.fn(() => null),
    });
    adapter.close("statesEditor");

    expect(wrapper.setAttribute).toHaveBeenCalledWith("aria-hidden", "true");
    expect(wrapper.style.display).toBe("none");
  });

  it("closes Studio-owned dialogs without jQuery UI wrappers", () => {
    const closeButton = { click: vi.fn() };
    const dialog = {
      hidden: false,
      offsetParent: {},
      querySelector: vi.fn(() => closeButton),
      setAttribute: vi.fn(),
    };
    const adapter = createStudioEngineEditorDialogAdapter({
      getElementById: vi.fn(() => dialog as unknown as HTMLElement),
      getComputedStyle: vi.fn(() => ({
        display: "block",
        visibility: "visible",
      })),
    });

    expect(adapter.isOpen("statesEditor")).toBe(true);
    adapter.close("statesEditor");

    expect(dialog.querySelector).toHaveBeenCalledWith(
      "[data-agm-dialog-close], [data-studio-dialog-close], [data-dialog-close]",
    );
    expect(closeButton.click).toHaveBeenCalledWith();
  });

  it("combines Studio and compatibility dialog adapters", () => {
    const studioAdapter: EngineEditorDialogAdapter = {
      isOpen: vi.fn(() => false),
      close: vi.fn(),
    };
    const compatibilityAdapter: EngineEditorDialogAdapter = {
      isOpen: vi.fn(() => true),
      close: vi.fn(),
    };
    const adapter = createCompositeEngineEditorDialogAdapter([
      studioAdapter,
      compatibilityAdapter,
    ]);

    expect(adapter.isOpen("statesEditor")).toBe(true);
    adapter.close("statesEditor");

    expect(studioAdapter.close).not.toHaveBeenCalled();
    expect(compatibilityAdapter.close).toHaveBeenCalledWith("statesEditor");
  });

  it("keeps document and computed-style reads inside the default DOM adapter", () => {
    const dialog = { id: "statesEditor" };
    globalThis.document = {
      getElementById: vi.fn(() => dialog),
    } as unknown as Document;
    globalThis.window = {
      getComputedStyle: vi.fn(() => ({
        display: "block",
        visibility: "visible",
      })),
    } as unknown as Window & typeof globalThis;

    const adapter = createGlobalEngineEditorDialogDomAdapter();

    expect(adapter.getElementById("statesEditor")).toBe(dialog);
    expect(adapter.getComputedStyle(dialog as unknown as HTMLElement)).toEqual({
      display: "block",
      visibility: "visible",
    });
    expect(globalThis.document.getElementById).toHaveBeenCalledWith(
      "statesEditor",
    );
    expect(globalThis.window.getComputedStyle).toHaveBeenCalledWith(dialog);
  });

  it("keeps the default dialog adapters safe when DOM globals are absent", () => {
    globalThis.document = undefined as unknown as Document;
    globalThis.window = undefined as unknown as Window & typeof globalThis;
    const domAdapter = createGlobalEngineEditorDialogDomAdapter();
    const studioAdapter = createStudioEngineEditorDialogAdapter(domAdapter);
    const jqueryAdapter = createJQueryEngineEditorDialogAdapter(domAdapter);

    expect(studioAdapter.isOpen("statesEditor")).toBe(false);
    expect(jqueryAdapter.isOpen("statesEditor")).toBe(false);
    expect(() => studioAdapter.close("statesEditor")).not.toThrow();
    expect(() => jqueryAdapter.close("statesEditor")).not.toThrow();
  });
});

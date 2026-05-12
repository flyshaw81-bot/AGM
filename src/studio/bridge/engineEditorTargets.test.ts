import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createCompositeEngineEditorDialogAdapter,
  createEngineEditorTargets,
  createGlobalEngineEditorDialogDomAdapter,
  createGlobalEngineEditorHandlerRuntime,
  createGlobalEngineEditorTargets,
  createStudioEngineEditorDialogAdapter,
  type EngineEditorDialogAdapter,
  type EngineEditorDialogDomAdapter,
} from "./engineEditorTargets";

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

describe("createEngineEditorTargets", () => {
  afterEach(() => {
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
    } else {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: originalDocument,
        writable: true,
      });
    }
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
        writable: true,
      });
    }
  });

  it("detects and runs editor handlers from the active runtime", async () => {
    const stateWorkbench = vi.fn(async () => undefined);
    const dialogAdapter: EngineEditorDialogAdapter = {
      isOpen: vi.fn(),
      close: vi.fn(),
    };

    const targets = createEngineEditorTargets(
      {
        getHandler: (action) =>
          action === "stateWorkbench" ? stateWorkbench : undefined,
      },
      dialogAdapter,
    );

    expect(targets.hasEditorHandler("stateWorkbench")).toBe(true);
    expect(targets.hasEditorHandler("biomeWorkbench")).toBe(false);
    await targets.runEditorHandler("stateWorkbench");
    await targets.runEditorHandler("biomeWorkbench");

    expect(stateWorkbench).toHaveBeenCalledTimes(1);
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

    expect(targets.isDialogOpen("studioEngineEditor")).toBe(true);
    targets.closeDialog("studioEngineEditor");

    expect(dialogAdapter.close).toHaveBeenCalledWith("studioEngineEditor");
  });

  it("keeps the global factory as compatibility wiring over injected adapters", async () => {
    const stateWorkbench = vi.fn(async () => undefined);
    const dialogAdapter: EngineEditorDialogAdapter = {
      isOpen: vi.fn(() => true),
      close: vi.fn(),
    };

    const targets = createGlobalEngineEditorTargets(
      {
        getHandler: (action) =>
          action === "stateWorkbench" ? stateWorkbench : undefined,
      },
      dialogAdapter,
    );

    expect(targets.hasEditorHandler("stateWorkbench")).toBe(true);
    await targets.runEditorHandler("stateWorkbench");
    expect(targets.isDialogOpen("studioEngineEditor")).toBe(true);
    targets.closeDialog("studioEngineEditor");

    expect(stateWorkbench).toHaveBeenCalledTimes(1);
    expect(dialogAdapter.close).toHaveBeenCalledWith("studioEngineEditor");
  });

  it("keeps global editor handlers safe when window is absent", () => {
    globalThis.window = undefined as unknown as Window & typeof globalThis;

    const runtime = createGlobalEngineEditorHandlerRuntime();

    expect(runtime.getHandler("stateWorkbench")).toBeUndefined();
  });

  it("keeps global editor handlers safe when window access throws", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    const runtime = createGlobalEngineEditorHandlerRuntime();

    expect(runtime.getHandler("stateWorkbench")).toBeUndefined();
  });

  it("closes Studio-owned dialogs without legacy wrappers", () => {
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

    expect(adapter.isOpen("studioEngineEditor")).toBe(true);
    adapter.close("studioEngineEditor");

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

    expect(adapter.isOpen("studioEngineEditor")).toBe(true);
    adapter.close("studioEngineEditor");

    expect(studioAdapter.close).not.toHaveBeenCalled();
    expect(compatibilityAdapter.close).toHaveBeenCalledWith(
      "studioEngineEditor",
    );
  });

  it("keeps document and computed-style reads inside the default DOM adapter", () => {
    const dialog = { id: "studioEngineEditor" };
    const getElementById = vi.fn(() => dialog);
    const getComputedStyle = vi.fn(() => ({
      display: "block",
      visibility: "visible",
    }));
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementById,
      } as unknown as Document,
      writable: true,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        getComputedStyle,
      } as unknown as Window & typeof globalThis,
      writable: true,
    });

    const adapter = createGlobalEngineEditorDialogDomAdapter();

    expect(adapter.getElementById("studioEngineEditor")).toBe(dialog);
    expect(adapter.getComputedStyle(dialog as unknown as HTMLElement)).toEqual({
      display: "block",
      visibility: "visible",
    });
    expect(getElementById).toHaveBeenCalledWith("studioEngineEditor");
    expect(getComputedStyle).toHaveBeenCalledWith(dialog);
  });

  it("keeps the default dialog adapters safe when DOM globals are absent", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    const domAdapter = createGlobalEngineEditorDialogDomAdapter();
    const studioAdapter = createStudioEngineEditorDialogAdapter(domAdapter);

    expect(studioAdapter.isOpen("studioEngineEditor")).toBe(false);
    expect(() => studioAdapter.close("studioEngineEditor")).not.toThrow();
  });

  it("keeps the default dialog DOM adapter safe when DOM reads throw", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    const domAdapter = createGlobalEngineEditorDialogDomAdapter();

    expect(domAdapter.getElementById("studioEngineEditor")).toBeNull();
    expect(domAdapter.getComputedStyle({} as HTMLElement)).toBeNull();
  });

  it("keeps dialog adapters safe when visibility and close DOM operations throw", () => {
    const dialog = {
      get hidden() {
        throw new Error("hidden blocked");
      },
      closest: () => {
        throw new Error("closest blocked");
      },
      querySelector: () => {
        throw new Error("query blocked");
      },
      setAttribute: () => {
        throw new Error("attribute blocked");
      },
    } as unknown as HTMLElement;
    const domAdapter: EngineEditorDialogDomAdapter = {
      getElementById: vi.fn(() => dialog),
      getComputedStyle: vi.fn(() => {
        throw new Error("style blocked");
      }),
    };
    const studioAdapter = createStudioEngineEditorDialogAdapter(domAdapter);

    expect(studioAdapter.isOpen("studioEngineEditor")).toBe(false);
    expect(() => studioAdapter.close("studioEngineEditor")).not.toThrow();
  });

  it("keeps composite dialog close safe when one adapter throws", () => {
    const workingAdapter: EngineEditorDialogAdapter = {
      isOpen: vi.fn(() => true),
      close: vi.fn(),
    };
    const throwingAdapter: EngineEditorDialogAdapter = {
      isOpen: () => {
        throw new Error("adapter blocked");
      },
      close: vi.fn(),
    };
    const adapter = createCompositeEngineEditorDialogAdapter([
      throwingAdapter,
      workingAdapter,
    ]);

    expect(() => adapter.close("studioEngineEditor")).not.toThrow();
    expect(workingAdapter.close).toHaveBeenCalledWith("studioEngineEditor");
  });
});

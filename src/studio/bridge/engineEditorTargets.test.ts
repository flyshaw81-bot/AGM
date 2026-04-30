import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalEngineEditorTargets,
  createJQueryEngineEditorDialogAdapter,
  type EngineEditorDialogAdapter,
} from "./engineEditorTargets";

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;

describe("createGlobalEngineEditorTargets", () => {
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

    const targets = createGlobalEngineEditorTargets(
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
    const targets = createGlobalEngineEditorTargets(
      { getHandler: () => undefined },
      dialogAdapter,
    );

    expect(targets.isDialogOpen("statesEditor")).toBe(true);
    targets.closeDialog("statesEditor");

    expect(dialogAdapter.close).toHaveBeenCalledWith("statesEditor");
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

    const adapter = createJQueryEngineEditorDialogAdapter();

    expect(adapter.isOpen("statesEditor")).toBe(true);
    adapter.close("statesEditor");

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

    const adapter = createJQueryEngineEditorDialogAdapter();
    adapter.close("statesEditor");

    expect(wrapper.setAttribute).toHaveBeenCalledWith("aria-hidden", "true");
    expect(wrapper.style.display).toBe("none");
  });
});

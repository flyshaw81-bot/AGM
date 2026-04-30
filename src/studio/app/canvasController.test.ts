import { describe, expect, it, vi } from "vitest";
import type {
  CanvasPaintPreviewState,
  CanvasSelectionState,
  CanvasToolMode,
  StudioState,
} from "../types";
import {
  bindCanvasToolInteractions,
  type CanvasInteractionTargets,
} from "./canvasController";

type ListenerMap = Record<
  string,
  Array<(event: PointerEvent & MouseEvent) => void>
>;

function createState(canvasTool: CanvasToolMode): StudioState {
  return {
    viewport: {
      canvasTool,
      presetId: "desktop-landscape",
      orientation: "landscape",
      fitMode: "cover",
      zoom: 1,
      panX: 0,
      panY: 0,
      paintPreview: null,
    },
  } as unknown as StudioState;
}

function createPreview(cellId = 42): CanvasPaintPreviewState {
  return {
    tool: "brush",
    cellId,
    label: `Cell ${cellId}`,
    x: 25,
    y: 75,
    height: 10,
    biomeId: 2,
    stateId: 3,
  };
}

function createSelection(): CanvasSelectionState {
  return {
    targetType: "state",
    targetId: 7,
    label: "State 7",
    x: 10,
    y: 20,
  };
}

function createFrame(listeners: ListenerMap) {
  return {
    offsetWidth: 200,
    offsetHeight: 100,
    addEventListener: vi.fn(
      (type: string, listener: (event: PointerEvent & MouseEvent) => void) => {
        listeners[type] = [...(listeners[type] ?? []), listener];
      },
    ),
    getBoundingClientRect: vi.fn(() => ({
      width: 100,
      height: 50,
    })),
    setPointerCapture: vi.fn(),
    hasPointerCapture: vi.fn(() => true),
    releasePointerCapture: vi.fn(),
  } as unknown as HTMLElement;
}

function createHost() {
  return {
    dataset: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  } as unknown as HTMLElement;
}

function createEvent(patch: Partial<PointerEvent & MouseEvent> = {}) {
  return {
    button: 0,
    pointerId: 1,
    clientX: 10,
    clientY: 10,
    preventDefault: vi.fn(),
    ...patch,
  } as unknown as PointerEvent & MouseEvent;
}

function createTargets(
  frame: HTMLElement | null,
  host: HTMLElement | null,
  overrides: Partial<CanvasInteractionTargets> = {},
): CanvasInteractionTargets {
  return {
    getCanvasFrame: vi.fn(() => frame),
    getMapHost: vi.fn(() => host),
    isControlEvent: vi.fn(() => false),
    getPaintPreviewAt: vi.fn(() => createPreview()),
    getSelectionAt: vi.fn(() => createSelection()),
    syncPaintPreview: vi.fn(),
    syncToolHud: vi.fn(),
    syncViewport: vi.fn(),
    isPaintTool: ((
      tool,
    ): tool is Extract<CanvasToolMode, "brush" | "water" | "terrain"> =>
      tool === "brush" ||
      tool === "water" ||
      tool === "terrain") as CanvasInteractionTargets["isPaintTool"],
    ...overrides,
  };
}

describe("bindCanvasToolInteractions", () => {
  it("does not bind listeners without canvas frame or map host", () => {
    const targets = createTargets(null, null);

    bindCanvasToolInteractions(
      createState("select"),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      targets,
    );

    expect(targets.getCanvasFrame).toHaveBeenCalled();
    expect(targets.getMapHost).toHaveBeenCalled();
  });

  it("pans through injected frame, host, viewport, and HUD targets", () => {
    const listeners: ListenerMap = {};
    const frame = createFrame(listeners);
    const host = createHost();
    const state = createState("pan");
    const onViewportPatch = vi.fn();
    const targets = createTargets(frame, host);

    bindCanvasToolInteractions(
      state,
      onViewportPatch,
      vi.fn(),
      vi.fn(),
      targets,
    );
    listeners.pointerdown?.[0]?.(createEvent({ clientX: 10, clientY: 10 }));
    listeners.pointermove?.[0]?.(createEvent({ clientX: 20, clientY: 15 }));
    listeners.pointerup?.[0]?.(createEvent());

    expect(host.classList.add).toHaveBeenCalledWith("is-panning");
    expect(state.viewport.panX).toBe(20);
    expect(state.viewport.panY).toBe(10);
    expect(targets.syncViewport).toHaveBeenCalledWith(
      "desktop-landscape",
      "landscape",
      "cover",
      1,
      20,
      10,
    );
    expect(targets.syncToolHud).toHaveBeenCalledWith(state);
    expect(onViewportPatch).toHaveBeenCalledWith({ panX: 20, panY: 10 });
    expect(host.classList.remove).toHaveBeenCalledWith("is-panning");
  });

  it("paints through injected preview and overlay targets", () => {
    const listeners: ListenerMap = {};
    const frame = createFrame(listeners);
    const host = createHost();
    const state = createState("brush");
    const onViewportPatch = vi.fn();
    const onCanvasPaint = vi.fn(() => true);
    const targets = createTargets(frame, host);

    bindCanvasToolInteractions(
      state,
      onViewportPatch,
      vi.fn(),
      onCanvasPaint,
      targets,
    );
    listeners.pointerdown?.[0]?.(createEvent());
    listeners.pointermove?.[0]?.(createEvent());
    listeners.pointerup?.[0]?.(createEvent());

    expect(targets.getPaintPreviewAt).toHaveBeenCalled();
    expect(onCanvasPaint).toHaveBeenCalledTimes(1);
    expect(targets.syncPaintPreview).toHaveBeenCalledWith(state);
    expect(targets.syncToolHud).toHaveBeenCalledWith(state);
    expect(onViewportPatch).toHaveBeenCalledWith({
      paintPreview: expect.objectContaining({ cellId: 42 }),
    });
  });

  it("selects canvas entities through injected selection targets", () => {
    const listeners: ListenerMap = {};
    const frame = createFrame(listeners);
    const host = createHost();
    const onSelection = vi.fn();
    const targets = createTargets(frame, host);

    bindCanvasToolInteractions(
      createState("select"),
      vi.fn(),
      onSelection,
      vi.fn(),
      targets,
    );
    listeners.click?.[0]?.(createEvent());

    expect(targets.getSelectionAt).toHaveBeenCalled();
    expect(onSelection).toHaveBeenCalledWith(
      expect.objectContaining({ targetId: 7 }),
    );
  });
});

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
  isNativeWorkbenchCanvasFrame,
} from "./canvasController";

type ListenerMap = Record<
  string,
  Array<(event: Event & Partial<PointerEvent & MouseEvent>) => void>
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

function createFrame(listeners: ListenerMap, nativeWorkbench = false) {
  return {
    offsetWidth: 200,
    offsetHeight: 100,
    addEventListener: vi.fn(
      (
        type: string,
        listener: (event: Event & Partial<PointerEvent & MouseEvent>) => void,
      ) => {
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
    closest: vi.fn((selector: string) =>
      nativeWorkbench && selector === ".studio-native-app" ? {} : null,
    ),
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
    cancelable: true,
    pointerId: 1,
    clientX: 10,
    clientY: 10,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
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
    readViewportPatch: vi.fn(() => null),
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
  it("detects native workbench canvas frames", () => {
    expect(isNativeWorkbenchCanvasFrame(createFrame({}, true))).toBe(true);
    expect(isNativeWorkbenchCanvasFrame(createFrame({}, false))).toBe(false);
  });

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

  it("does not commit a pan patch for a plain canvas click", () => {
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
    listeners.pointerup?.[0]?.(createEvent({ clientX: 10, clientY: 10 }));

    expect(targets.syncViewport).not.toHaveBeenCalled();
    expect(onViewportPatch).not.toHaveBeenCalled();
    expect(host.classList.remove).toHaveBeenCalledWith("is-panning");
  });

  it("hydrates viewport state from engine wheel zoom without rerendering", () => {
    vi.useFakeTimers();
    const listeners: ListenerMap = {};
    const frame = createFrame(listeners);
    const host = createHost();
    const state = createState("pan");
    const onViewportPatch = vi.fn();
    const targets = createTargets(frame, host, {
      readViewportPatch: vi.fn(() => ({ zoom: 2, panX: 120, panY: -40 })),
    });

    bindCanvasToolInteractions(
      state,
      onViewportPatch,
      vi.fn(),
      vi.fn(),
      targets,
    );
    listeners.wheel?.[0]?.(createEvent());
    vi.advanceTimersByTime(80);

    expect(state.viewport.zoom).toBe(2);
    expect(state.viewport.panX).toBe(120);
    expect(state.viewport.panY).toBe(-40);
    expect(host.dataset.panX).toBe("120");
    expect(host.dataset.panY).toBe("-40");
    expect(targets.syncToolHud).toHaveBeenCalledWith(state);
    expect(onViewportPatch).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("suppresses native engine drag gestures without swallowing normal canvas clicks", () => {
    const listeners: ListenerMap = {};
    const frame = createFrame(listeners, true);
    const host = createHost();
    const state = createState("select");
    const onSelection = vi.fn();
    const targets = createTargets(frame, host);

    bindCanvasToolInteractions(state, vi.fn(), onSelection, vi.fn(), targets);

    const mouseDownEvent = createEvent();
    listeners.mousedown?.[0]?.(mouseDownEvent);
    listeners.click?.[0]?.(createEvent());

    expect(listeners.wheel).toHaveLength(1);
    expect(mouseDownEvent.preventDefault).toHaveBeenCalled();
    expect(mouseDownEvent.stopPropagation).toHaveBeenCalled();
    expect(targets.getSelectionAt).toHaveBeenCalled();
    expect(onSelection).toHaveBeenCalledWith(
      expect.objectContaining({ targetId: 7 }),
    );
  });

  it("suppresses native canvas clicks after AGM selection so the old engine cannot react", () => {
    const listeners: ListenerMap = {};
    const frame = createFrame(listeners, true);
    const host = createHost();
    const state = createState("select");
    const onSelection = vi.fn();
    const targets = createTargets(frame, host);

    bindCanvasToolInteractions(state, vi.fn(), onSelection, vi.fn(), targets);

    const clickEvent = createEvent();
    listeners.click?.[0]?.(clickEvent);

    expect(targets.getSelectionAt).toHaveBeenCalledWith(clickEvent, state);
    expect(onSelection).toHaveBeenCalledWith(
      expect.objectContaining({ targetId: 7 }),
    );
    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
  });

  it("keeps wheel zoom hydration from turning the next native pan click into a viewport mutation", () => {
    vi.useFakeTimers();
    const listeners: ListenerMap = {};
    const frame = createFrame(listeners, true);
    const host = createHost();
    const state = createState("pan");
    const onViewportPatch = vi.fn();
    const targets = createTargets(frame, host, {
      readViewportPatch: vi.fn(() => ({ zoom: 1.8, panX: 84, panY: -12 })),
    });

    bindCanvasToolInteractions(
      state,
      onViewportPatch,
      vi.fn(),
      vi.fn(),
      targets,
    );

    listeners.wheel?.[0]?.(createEvent());
    vi.advanceTimersByTime(80);
    const clickEvent = createEvent();
    listeners.click?.[0]?.(clickEvent);

    expect(state.viewport.zoom).toBe(1.8);
    expect(state.viewport.panX).toBe(84);
    expect(state.viewport.panY).toBe(-12);
    expect(onViewportPatch).not.toHaveBeenCalled();
    expect(targets.syncViewport).not.toHaveBeenCalled();
    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("keeps native workbench panning controlled by the AGM pointer tool", () => {
    const listeners: ListenerMap = {};
    const frame = createFrame(listeners, true);
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
    expect(onViewportPatch).toHaveBeenCalledWith({ panX: 20, panY: 10 });
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

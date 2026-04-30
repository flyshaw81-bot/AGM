import { describe, expect, it, vi } from "vitest";
import type {
  CanvasPaintPreviewState,
  CanvasSelectionState,
  StudioState,
} from "../types";
import {
  createStudioRenderer,
  renderStudioApp,
  type StudioRendererTargets,
} from "./studioRenderer";

function createState(): StudioState {
  return {
    theme: "night",
    viewport: {
      presetId: "desktop-landscape",
      orientation: "landscape",
      fitMode: "cover",
      zoom: 1,
      panX: 0,
      panY: 0,
      selectedCanvasEntity: null,
      paintPreview: null,
    },
    directEditor: {
      selectedStateId: null,
      lastAppliedStateId: null,
      selectedBurgId: null,
      lastAppliedBurgId: null,
    },
    balanceFocus: null,
  } as unknown as StudioState;
}

function createSelection(
  targetType: CanvasSelectionState["targetType"],
): CanvasSelectionState {
  return {
    targetType,
    targetId: 7,
    label: "Target",
    x: 10,
    y: 20,
  };
}

function createPreview(): CanvasPaintPreviewState {
  return {
    tool: "brush",
    cellId: 1,
    label: "Cell 1",
    x: 10,
    y: 20,
    height: 50,
    biomeId: 2,
    stateId: 3,
  };
}

function createTargets(): StudioRendererTargets {
  return {
    syncEditorWorkflow: vi.fn(() => false),
    syncDocument: vi.fn(() => false),
    updateProjectCenter: vi.fn(),
    preserveEngineNode: vi.fn(),
    renderShell: vi.fn(() => "<main>Studio</main>"),
    setRootHtml: vi.fn(),
    setRootTheme: vi.fn(),
    setDocumentTheme: vi.fn(),
    relocateEngineMapHost: vi.fn(),
    syncOverlays: vi.fn(),
    syncViewport: vi.fn(),
    syncCanvasSelectionHighlight: vi.fn(),
    syncDialogsPosition: vi.fn(),
    bindCanvasToolInteractions: vi.fn(),
    resolveFocusGeometry: vi.fn(() => ({
      targetType: "state",
      targetId: 7,
      sourceLabel: "canvas-select-tool",
      action: "focus",
      x: 10,
      y: 20,
    })),
    applyCanvasPaintPreview: vi.fn(() => true),
    bindShellEvents: vi.fn(),
    syncProjectSummary: vi.fn(async () => true),
    updateViewportDimensions: vi.fn(),
  } as unknown as StudioRendererTargets;
}

describe("studio renderer", () => {
  it("renders shell and syncs engine/canvas surfaces through injected targets", () => {
    const root = {} as HTMLElement;
    const state = createState();
    const targets = createTargets();
    const render = vi.fn();

    renderStudioApp(root, state, render, targets);

    expect(targets.syncEditorWorkflow).toHaveBeenCalledWith(state);
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
    expect(targets.updateProjectCenter).toHaveBeenCalledWith(state);
    expect(targets.preserveEngineNode).toHaveBeenCalledWith(root, "map");
    expect(targets.preserveEngineNode).toHaveBeenCalledWith(root, "dialogs");
    expect(targets.setRootHtml).toHaveBeenCalledWith(
      root,
      "<main>Studio</main>",
    );
    expect(targets.setRootTheme).toHaveBeenCalledWith(root, "night");
    expect(targets.setDocumentTheme).toHaveBeenCalledWith("night");
    expect(targets.syncViewport).toHaveBeenCalledWith(
      "desktop-landscape",
      "landscape",
      "cover",
      1,
      0,
      0,
    );
    expect(targets.bindCanvasToolInteractions).toHaveBeenCalled();
    expect(targets.bindShellEvents).toHaveBeenCalled();
  });

  it("rerenders after viewport patches from canvas interactions", () => {
    const root = {} as HTMLElement;
    const state = createState();
    const targets = createTargets();
    const render = vi.fn();

    renderStudioApp(root, state, render, targets);
    const onViewportPatch = vi.mocked(targets.bindCanvasToolInteractions).mock
      .calls[0]?.[1];
    onViewportPatch?.({ panX: 25 });

    expect(state.viewport.panX).toBe(25);
    expect(render).toHaveBeenCalledWith(root, state);
  });

  it("updates direct editor focus after state canvas selection", () => {
    const root = {} as HTMLElement;
    const state = createState();
    const targets = createTargets();
    const render = vi.fn();

    renderStudioApp(root, state, render, targets);
    const onSelection = vi.mocked(targets.bindCanvasToolInteractions).mock
      .calls[0]?.[2];
    onSelection?.(createSelection("state"));

    expect(state.viewport.selectedCanvasEntity?.targetId).toBe(7);
    expect(state.directEditor.selectedStateId).toBe(7);
    expect(targets.resolveFocusGeometry).toHaveBeenCalled();
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
    expect(render).toHaveBeenCalledWith(root, state);
  });

  it("applies canvas paint previews through injected targets", () => {
    const root = {} as HTMLElement;
    const state = createState();
    const targets = createTargets();

    renderStudioApp(root, state, vi.fn(), targets);
    const onCanvasPaint = vi.mocked(targets.bindCanvasToolInteractions).mock
      .calls[0]?.[3];
    const changed = onCanvasPaint?.(createPreview());

    expect(changed).toBe(true);
    expect(targets.applyCanvasPaintPreview).toHaveBeenCalledWith(
      state,
      expect.objectContaining({ cellId: 1 }),
    );
  });

  it("creates a renderer that recursively uses the same target set", () => {
    const root = {} as HTMLElement;
    const state = createState();
    const targets = createTargets();
    const render = createStudioRenderer(targets);

    render(root, state);
    const onViewportPatch = vi.mocked(targets.bindCanvasToolInteractions).mock
      .calls[0]?.[1];
    onViewportPatch?.({ zoom: 2 });

    expect(state.viewport.zoom).toBe(2);
    expect(targets.bindCanvasToolInteractions).toHaveBeenCalledTimes(2);
  });
});

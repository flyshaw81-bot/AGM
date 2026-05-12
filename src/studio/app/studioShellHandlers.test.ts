import { describe, expect, it, vi } from "vitest";
import type { EngineFocusGeometry } from "../bridge/engineActions";
import type {
  AgmDocumentDraft,
  WorldDocumentDraft,
} from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import type { StudioEngineCommandTargets } from "./studioEngineCommandTargets";
import { createStudioShellEventHandlers } from "./studioShellHandlers";
import type { StudioShellTargets } from "./studioShellTargets";

function createState(): StudioState {
  return {
    language: "zh-CN",
    theme: "night",
    shell: {
      activeEditorModule: "states",
      navigationCollapsed: false,
    },
    section: "canvas",
    document: {
      source: "agm",
      gameProfile: "balanced",
    },
    editor: {
      activeEditor: "stateWorkbench",
      editorDialogOpen: true,
      lastEditorSection: "canvas",
    },
    directEditor: {
      selectedStateId: null,
    },
    viewport: {
      canvasTool: "select",
      paintPreview: null,
      canvasEditHistory: [],
    },
    generationProfileOverrides: {
      profile: "balanced",
      values: {},
    },
  } as unknown as StudioState;
}

function createTargets(
  overrides: Partial<StudioShellTargets> = {},
): StudioShellTargets {
  return {
    syncDocument: vi.fn(),
    syncEditorWorkflow: vi.fn(),
    closeEditor: vi.fn(),
    openEditor: vi.fn(async () => undefined),
    resolveFocusGeometry: vi.fn(
      (focus) =>
        ({
          ...focus,
          x: 10,
          y: 20,
        }) as EngineFocusGeometry,
    ),
    importAgmDraft: vi.fn(async () => null),
    importRulesPack: vi.fn(async () => null),
    restoreAgmDraft: vi.fn(),
    applyRulesPack: vi.fn(),
    applyAutoFixPreview: vi.fn(),
    undoAutoFixPreview: vi.fn(),
    redoAutoFixPreview: vi.fn(),
    applyManualBiomeRuleAdjustment: vi.fn(),
    applyBiomeCoverageTarget: vi.fn(() => true),
    isPaintCanvasTool: ((_tool): _tool is "terrain" | "water" | "brush" =>
      false) as StudioShellTargets["isPaintCanvasTool"],
    getCanvasPaintPreviewForCell: vi.fn(() => null),
    applyCanvasPaintPreview: vi.fn(() => true),
    undoCanvasEditEntry: vi.fn(() => true),
    applyProjectWorkspaceChange: vi.fn(async () => undefined),
    setPendingViewportCanvasSize: vi.fn(),
    confirmViewportCanvasRegenerate: vi.fn(() => true),
    persistLanguage: vi.fn(),
    persistTheme: vi.fn(),
    persistNavigationCollapsed: vi.fn(),
    ...overrides,
  };
}

function createEngineTargets(
  overrides: Partial<StudioEngineCommandTargets> = {},
): StudioEngineCommandTargets {
  return {
    applyStylePreset: vi.fn(),
    getStyleSettings: vi.fn(() => ({
      preset: "default",
      hideLabels: false,
      rescaleLabels: true,
      presetKind: "system" as const,
    })),
    setStyleToggle: vi.fn(),
    setExportSetting: vi.fn(),
    exportWithEngine: vi.fn(),
    runTopbarAction: vi.fn(async () => undefined),
    setPendingCanvasSize: vi.fn(),
    toggleLayer: vi.fn(),
    runDataAction: vi.fn(async () => undefined),
    runLayersPresetAction: vi.fn(),
    markDocumentClean: vi.fn(),
    updateProjectCenter: vi.fn(),
    syncDocument: vi.fn(),
    applyGenerationProfileOverrides: vi.fn(),
    createGenerationProfileResultSample: vi.fn(() => ({
      spawnCandidates: 0,
      averageSpawnScore: 0,
      states: 0,
      burgs: 0,
      provinces: 0,
      routes: 0,
      routePointCount: 0,
      resourceTaggedBiomes: 0,
    })),
    createGenerationProfileResultMetrics: vi.fn(() => []),
    ...overrides,
  };
}

function createHandlers(
  state = createState(),
  targets = createTargets(),
  engineTargets = createEngineTargets(),
) {
  const root = {} as HTMLElement;
  const render = vi.fn();
  const syncProjectSummaryState = vi.fn(async () => undefined);
  const updateViewportDimensions = vi.fn();
  const handlers = createStudioShellEventHandlers({
    render,
    root,
    state,
    syncProjectSummaryState,
    updateViewportDimensions,
    targets,
    engineTargets,
  });

  return {
    handlers,
    render,
    root,
    state,
    syncProjectSummaryState,
    targets,
    engineTargets,
    updateViewportDimensions,
  };
}

describe("studio shell handlers", () => {
  it("routes direct state editor entry through shell targets", async () => {
    const { handlers, render, root, state, targets } = createHandlers();

    await handlers.onEditorAction("stateWorkbench");

    expect(targets.closeEditor).toHaveBeenCalledWith("stateWorkbench");
    expect(state.section).toBe("editors");
    expect(state.editor.activeEditor).toBeNull();
    expect(state.editor.editorDialogOpen).toBe(false);
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
    expect(render).toHaveBeenCalledWith(root, state);
  });

  it("opens product editor modules through shell state", () => {
    const { handlers, render, root, state, targets } = createHandlers();

    handlers.onEditorModuleChange("cultures");

    expect(state.section).toBe("editors");
    expect(state.shell.activeEditorModule).toBe("cultures");
    expect(state.editor.lastEditorSection).toBe("canvas");
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
    expect(render).toHaveBeenCalledWith(root, state);
  });

  it("imports AGM drafts through shell targets", async () => {
    const draft = {} as AgmDocumentDraft;
    const targets = createTargets({ importAgmDraft: vi.fn(async () => draft) });
    const {
      handlers,
      state,
      syncProjectSummaryState,
      updateViewportDimensions,
    } = createHandlers(createState(), targets);
    const file = {} as File;

    await handlers.onAgmFileImport(file);

    expect(targets.importAgmDraft).toHaveBeenCalledWith(file);
    expect(targets.restoreAgmDraft).toHaveBeenCalledWith(
      state,
      draft,
      updateViewportDimensions,
    );
    expect(syncProjectSummaryState).toHaveBeenCalled();
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
  });

  it("imports rules packs through shell targets", async () => {
    const rules = { version: 1 } as WorldDocumentDraft["rules"];
    const targets = createTargets({
      importRulesPack: vi.fn(async () => rules),
    });
    const { handlers, state } = createHandlers(createState(), targets);

    await handlers.onRulesPackImport({} as File);

    expect(targets.applyRulesPack).toHaveBeenCalledWith(state, rules);
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
  });

  it("resolves balance focus through the shell target boundary", () => {
    const { handlers, state, targets } = createHandlers();

    handlers.onBalanceFocus({
      targetType: "state",
      targetId: 2,
      sourceLabel: "test",
    });

    expect(targets.resolveFocusGeometry).toHaveBeenCalled();
    expect(state.balanceFocus).toMatchObject({ targetId: 2, x: 10, y: 20 });
    expect(state.section).toBe("canvas");
  });

  it("resets zoom and pan when changing viewport fit strategy", async () => {
    const state = createState();
    state.viewport = {
      ...state.viewport,
      fitMode: "cover",
      zoom: 2,
      panX: 120,
      panY: -80,
      selectedCanvasEntity: { targetType: "state", targetId: 1 },
      paintPreview: { tool: "terrain", cellId: 2, x: 10, y: 20, label: "Hill" },
    } as StudioState["viewport"];
    const { handlers, updateViewportDimensions } = createHandlers(state);

    await handlers.onViewportChange({ fitMode: "contain" });

    expect(state.viewport.fitMode).toBe("contain");
    expect(state.viewport.zoom).toBe(1);
    expect(state.viewport.panX).toBe(0);
    expect(state.viewport.panY).toBe(0);
    expect(state.viewport.selectedCanvasEntity).toBeNull();
    expect(state.viewport.paintPreview).toBeNull();
    expect(updateViewportDimensions).toHaveBeenCalledWith(state);
  });

  it("confirms and regenerates when changing viewport preset size", async () => {
    const state = createState();
    state.viewport = {
      ...state.viewport,
      presetId: "square",
      orientation: "portrait",
      fitMode: "cover",
      width: 1024,
      height: 1024,
    } as StudioState["viewport"];
    const targets = createTargets();
    const engineTargets = createEngineTargets();
    const { handlers, updateViewportDimensions } = createHandlers(
      state,
      targets,
      engineTargets,
    );
    updateViewportDimensions.mockImplementation((nextState) => {
      nextState.viewport.width = 1440;
      nextState.viewport.height = 900;
    });

    await handlers.onViewportChange({
      presetId: "desktop-landscape",
      orientation: "landscape",
    });

    expect(targets.confirmViewportCanvasRegenerate).toHaveBeenCalledWith(
      "zh-CN",
      1440,
      900,
    );
    expect(updateViewportDimensions).toHaveBeenCalledWith(state);
    expect(targets.setPendingViewportCanvasSize).toHaveBeenCalledWith(
      1440,
      900,
    );
    expect(engineTargets.setPendingCanvasSize).toHaveBeenCalledWith(1440, 900);
    expect(engineTargets.runTopbarAction).toHaveBeenCalledWith("new");
  });

  it("keeps a generation busy state while canvas resize regeneration is running", async () => {
    const state = createState();
    state.viewport = {
      ...state.viewport,
      presetId: "square",
      orientation: "portrait",
      fitMode: "cover",
      width: 1024,
      height: 1024,
    } as StudioState["viewport"];
    let finishGeneration!: () => void;
    const engineTargets = createEngineTargets({
      runTopbarAction: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finishGeneration = resolve;
          }),
      ),
    });
    const { handlers, render, root, updateViewportDimensions } = createHandlers(
      state,
      createTargets(),
      engineTargets,
    );
    updateViewportDimensions.mockImplementation((nextState) => {
      nextState.viewport.width = 1440;
      nextState.viewport.height = 900;
    });

    const pending = handlers.onViewportChange({
      presetId: "desktop-landscape",
      orientation: "landscape",
    });

    expect(state.shell.generationBusy).toEqual({
      title: "正在重新生成画布",
      detail: "1440 × 900",
    });
    expect(render).toHaveBeenCalledWith(root, state);
    expect(engineTargets.runTopbarAction).toHaveBeenCalledWith("new");

    finishGeneration();
    await pending;

    expect(state.shell.generationBusy).toBeNull();
    expect(render).toHaveBeenLastCalledWith(root, state);
  });

  it("restores the previous viewport preset when canvas regeneration is canceled", async () => {
    const state = createState();
    state.viewport = {
      ...state.viewport,
      presetId: "square",
      orientation: "portrait",
      fitMode: "cover",
      width: 1024,
      height: 1024,
    } as StudioState["viewport"];
    const targets = createTargets({
      confirmViewportCanvasRegenerate: vi.fn(() => false),
    });
    const engineTargets = createEngineTargets();
    const { handlers, render, root, updateViewportDimensions } = createHandlers(
      state,
      targets,
      engineTargets,
    );

    await handlers.onViewportChange({
      presetId: "desktop-landscape",
      orientation: "landscape",
    });

    expect(state.viewport.presetId).toBe("square");
    expect(updateViewportDimensions).not.toHaveBeenCalled();
    expect(targets.setPendingViewportCanvasSize).not.toHaveBeenCalled();
    expect(engineTargets.runTopbarAction).not.toHaveBeenCalled();
    expect(render).toHaveBeenCalledWith(root, state);
  });

  it("persists language, theme, and navigation preferences through targets", () => {
    const { handlers, state, targets } = createHandlers();

    handlers.onLanguageChange("en");
    handlers.onThemeChange("daylight");
    handlers.onNavigationCollapseChange(true);

    expect(state.language).toBe("en");
    expect(state.theme).toBe("daylight");
    expect(state.shell.navigationCollapsed).toBe(true);
    expect(targets.persistLanguage).toHaveBeenCalledWith("en");
    expect(targets.persistTheme).toHaveBeenCalledWith("daylight");
    expect(targets.persistNavigationCollapsed).toHaveBeenCalledWith(true);
  });

  it("refreshes the paint preview after undoing a canvas edit", () => {
    const state = createState();
    state.viewport = {
      ...state.viewport,
      canvasTool: "terrain",
      paintPreview: {
        tool: "terrain",
        cellId: 7,
        x: 40,
        y: 45,
        label: "Cell #7 - h 25",
      },
      canvasEditHistory: [
        {
          id: 1,
          tool: "terrain",
          cellId: 7,
          beforeHeight: 20,
          afterHeight: 25,
          beforeBiomeId: 2,
          afterBiomeId: 2,
          label: "Cell #7 - h 20",
          undone: false,
        },
      ],
    } as StudioState["viewport"];
    const refreshedPreview = {
      tool: "terrain" as const,
      cellId: 7,
      x: 40,
      y: 45,
      label: "Cell #7 - h 20",
      height: 20,
      biomeId: 2,
      stateId: null,
    };
    const targets = createTargets({
      isPaintCanvasTool: ((tool): tool is "terrain" | "water" | "brush" =>
        tool === "terrain") as StudioShellTargets["isPaintCanvasTool"],
      getCanvasPaintPreviewForCell: vi.fn(() => refreshedPreview),
    });
    const { handlers } = createHandlers(state, targets);

    handlers.onCanvasEditAction("undo");

    expect(targets.undoCanvasEditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ cellId: 7, undone: false }),
    );
    expect(targets.getCanvasPaintPreviewForCell).toHaveBeenCalledWith(
      "terrain",
      7,
    );
    expect(state.viewport.paintPreview).toBe(refreshedPreview);
    expect(state.viewport.canvasEditHistory[0].undone).toBe(true);
  });
});

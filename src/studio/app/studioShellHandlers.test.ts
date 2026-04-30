import { describe, expect, it, vi } from "vitest";
import type { EngineFocusGeometry } from "../bridge/engineActions";
import type {
  AgmDocumentDraft,
  WorldDocumentDraft,
} from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import { createStudioShellEventHandlers } from "./studioShellHandlers";
import type { StudioShellTargets } from "./studioShellTargets";

function createState(): StudioState {
  return {
    language: "zh-CN",
    theme: "night",
    shell: {
      navigationCollapsed: false,
    },
    section: "canvas",
    document: {
      source: "agm",
      gameProfile: "balanced",
    },
    editor: {
      activeEditor: "editStates",
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
    persistLanguage: vi.fn(),
    persistTheme: vi.fn(),
    persistNavigationCollapsed: vi.fn(),
    ...overrides,
  };
}

function createHandlers(state = createState(), targets = createTargets()) {
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
  });

  return {
    handlers,
    render,
    root,
    state,
    syncProjectSummaryState,
    targets,
    updateViewportDimensions,
  };
}

describe("studio shell handlers", () => {
  it("routes direct state editor entry through shell targets", async () => {
    const { handlers, render, root, state, targets } = createHandlers();

    await handlers.onEditorAction("editStates");

    expect(targets.closeEditor).toHaveBeenCalledWith("editStates");
    expect(state.section).toBe("editors");
    expect(state.editor.activeEditor).toBeNull();
    expect(state.editor.editorDialogOpen).toBe(false);
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
});

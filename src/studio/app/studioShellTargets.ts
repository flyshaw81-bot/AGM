import type {
  EditorAction,
  EngineFocusGeometry,
  EngineFocusTarget,
} from "../bridge/engineActions";
import {
  closeEngineEditor,
  openEngineEditor,
  resolveEngineFocusGeometry,
} from "../bridge/engineActions";
import type {
  AgmDocumentDraft,
  WorldDocumentDraft,
} from "../state/worldDocumentDraft";
import {
  importAgmDocumentDraft,
  importAgmRulesPackDraft,
} from "../state/worldDocumentDraft";
import type { CanvasPaintPreviewState, StudioState } from "../types";
import {
  applyAutoFixPreviewAction,
  applyManualBiomeRuleAdjustment,
  applyRulesPackDraft,
  redoAutoFixPreviewAction,
  undoAutoFixPreviewAction,
} from "./autoFixPreview";
import {
  applyBiomeCoverageTarget,
  applyCanvasPaintPreview,
  getCanvasPaintPreviewForCell,
  isPaintCanvasTool,
  undoCanvasEditEntry,
} from "./canvasController";
import {
  restoreAgmDocumentState,
  syncDocumentState,
  syncEditorWorkflowState,
} from "./documentState";
import {
  persistLanguage,
  persistNavigationCollapsed,
  persistTheme,
} from "./preferences";
import { applyProjectWorkspaceChange } from "./projectWorkspaceActions";

export type StudioShellTargets = {
  syncDocument: (state: StudioState) => void;
  syncEditorWorkflow: (state: StudioState) => void;
  closeEditor: (action: EditorAction) => void;
  openEditor: (action: EditorAction) => Promise<void>;
  resolveFocusGeometry: (focus: EngineFocusTarget) => EngineFocusGeometry;
  importAgmDraft: typeof importAgmDocumentDraft;
  importRulesPack: typeof importAgmRulesPackDraft;
  restoreAgmDraft: (
    state: StudioState,
    draft: AgmDocumentDraft,
    updateViewportDimensions: (state: StudioState) => void,
  ) => void;
  applyRulesPack: (
    state: StudioState,
    rules: WorldDocumentDraft["rules"],
  ) => void;
  applyAutoFixPreview: typeof applyAutoFixPreviewAction;
  undoAutoFixPreview: typeof undoAutoFixPreviewAction;
  redoAutoFixPreview: typeof redoAutoFixPreviewAction;
  applyManualBiomeRuleAdjustment: typeof applyManualBiomeRuleAdjustment;
  applyBiomeCoverageTarget: typeof applyBiomeCoverageTarget;
  isPaintCanvasTool: typeof isPaintCanvasTool;
  getCanvasPaintPreviewForCell: typeof getCanvasPaintPreviewForCell;
  applyCanvasPaintPreview: (
    state: StudioState,
    preview: CanvasPaintPreviewState,
  ) => boolean;
  undoCanvasEditEntry: typeof undoCanvasEditEntry;
  applyProjectWorkspaceChange: typeof applyProjectWorkspaceChange;
  persistLanguage: typeof persistLanguage;
  persistTheme: typeof persistTheme;
  persistNavigationCollapsed: typeof persistNavigationCollapsed;
};

export type StudioShellDocumentAdapter = {
  syncDocument: (state: StudioState) => void;
  syncEditorWorkflow: (state: StudioState) => void;
  restoreAgmDraft: (
    state: StudioState,
    draft: AgmDocumentDraft,
    updateViewportDimensions: (state: StudioState) => void,
  ) => void;
};

export type StudioShellEditorAdapter = {
  closeEditor: (action: EditorAction) => void;
  openEditor: (action: EditorAction) => Promise<void>;
  resolveFocusGeometry: (focus: EngineFocusTarget) => EngineFocusGeometry;
};

export type StudioShellDraftAdapter = {
  importAgmDraft: typeof importAgmDocumentDraft;
  importRulesPack: typeof importAgmRulesPackDraft;
  applyRulesPack: (
    state: StudioState,
    rules: WorldDocumentDraft["rules"],
  ) => void;
};

export type StudioShellAutoFixAdapter = {
  applyAutoFixPreview: typeof applyAutoFixPreviewAction;
  undoAutoFixPreview: typeof undoAutoFixPreviewAction;
  redoAutoFixPreview: typeof redoAutoFixPreviewAction;
  applyManualBiomeRuleAdjustment: typeof applyManualBiomeRuleAdjustment;
};

export type StudioShellCanvasAdapter = {
  applyBiomeCoverageTarget: typeof applyBiomeCoverageTarget;
  isPaintCanvasTool: typeof isPaintCanvasTool;
  getCanvasPaintPreviewForCell: typeof getCanvasPaintPreviewForCell;
  applyCanvasPaintPreview: (
    state: StudioState,
    preview: CanvasPaintPreviewState,
  ) => boolean;
  undoCanvasEditEntry: typeof undoCanvasEditEntry;
};

export type StudioShellWorkspaceAdapter = {
  applyProjectWorkspaceChange: typeof applyProjectWorkspaceChange;
};

export type StudioShellPreferenceAdapter = {
  persistLanguage: typeof persistLanguage;
  persistTheme: typeof persistTheme;
  persistNavigationCollapsed: typeof persistNavigationCollapsed;
};

export function createGlobalStudioShellDocumentAdapter(): StudioShellDocumentAdapter {
  return {
    syncDocument: syncDocumentState,
    syncEditorWorkflow: syncEditorWorkflowState,
    restoreAgmDraft: restoreAgmDocumentState,
  };
}

export function createGlobalStudioShellEditorAdapter(): StudioShellEditorAdapter {
  return {
    closeEditor: closeEngineEditor,
    openEditor: openEngineEditor,
    resolveFocusGeometry: resolveEngineFocusGeometry,
  };
}

export function createGlobalStudioShellDraftAdapter(): StudioShellDraftAdapter {
  return {
    importAgmDraft: importAgmDocumentDraft,
    importRulesPack: importAgmRulesPackDraft,
    applyRulesPack: applyRulesPackDraft,
  };
}

export function createGlobalStudioShellAutoFixAdapter(): StudioShellAutoFixAdapter {
  return {
    applyAutoFixPreview: applyAutoFixPreviewAction,
    undoAutoFixPreview: undoAutoFixPreviewAction,
    redoAutoFixPreview: redoAutoFixPreviewAction,
    applyManualBiomeRuleAdjustment,
  };
}

export function createGlobalStudioShellCanvasAdapter(): StudioShellCanvasAdapter {
  return {
    applyBiomeCoverageTarget,
    isPaintCanvasTool,
    getCanvasPaintPreviewForCell,
    applyCanvasPaintPreview,
    undoCanvasEditEntry,
  };
}

export function createGlobalStudioShellWorkspaceAdapter(): StudioShellWorkspaceAdapter {
  return {
    applyProjectWorkspaceChange,
  };
}

export function createGlobalStudioShellPreferenceAdapter(): StudioShellPreferenceAdapter {
  return {
    persistLanguage,
    persistTheme,
    persistNavigationCollapsed,
  };
}

export function createStudioShellTargets(
  documentAdapter: StudioShellDocumentAdapter,
  editorAdapter: StudioShellEditorAdapter,
  draftAdapter: StudioShellDraftAdapter,
  autoFixAdapter: StudioShellAutoFixAdapter,
  canvasAdapter: StudioShellCanvasAdapter,
  workspaceAdapter: StudioShellWorkspaceAdapter,
  preferenceAdapter: StudioShellPreferenceAdapter,
): StudioShellTargets {
  return {
    syncDocument: documentAdapter.syncDocument,
    syncEditorWorkflow: documentAdapter.syncEditorWorkflow,
    closeEditor: editorAdapter.closeEditor,
    openEditor: editorAdapter.openEditor,
    resolveFocusGeometry: editorAdapter.resolveFocusGeometry,
    importAgmDraft: draftAdapter.importAgmDraft,
    importRulesPack: draftAdapter.importRulesPack,
    restoreAgmDraft: documentAdapter.restoreAgmDraft,
    applyRulesPack: draftAdapter.applyRulesPack,
    applyAutoFixPreview: autoFixAdapter.applyAutoFixPreview,
    undoAutoFixPreview: autoFixAdapter.undoAutoFixPreview,
    redoAutoFixPreview: autoFixAdapter.redoAutoFixPreview,
    applyManualBiomeRuleAdjustment:
      autoFixAdapter.applyManualBiomeRuleAdjustment,
    applyBiomeCoverageTarget: canvasAdapter.applyBiomeCoverageTarget,
    isPaintCanvasTool: canvasAdapter.isPaintCanvasTool,
    getCanvasPaintPreviewForCell: canvasAdapter.getCanvasPaintPreviewForCell,
    applyCanvasPaintPreview: canvasAdapter.applyCanvasPaintPreview,
    undoCanvasEditEntry: canvasAdapter.undoCanvasEditEntry,
    applyProjectWorkspaceChange: workspaceAdapter.applyProjectWorkspaceChange,
    persistLanguage: preferenceAdapter.persistLanguage,
    persistTheme: preferenceAdapter.persistTheme,
    persistNavigationCollapsed: preferenceAdapter.persistNavigationCollapsed,
  };
}

export function createGlobalStudioShellTargets(): StudioShellTargets {
  return createStudioShellTargets(
    createGlobalStudioShellDocumentAdapter(),
    createGlobalStudioShellEditorAdapter(),
    createGlobalStudioShellDraftAdapter(),
    createGlobalStudioShellAutoFixAdapter(),
    createGlobalStudioShellCanvasAdapter(),
    createGlobalStudioShellWorkspaceAdapter(),
    createGlobalStudioShellPreferenceAdapter(),
  );
}

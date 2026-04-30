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

export function createGlobalStudioShellTargets(): StudioShellTargets {
  return {
    syncDocument: syncDocumentState,
    syncEditorWorkflow: syncEditorWorkflowState,
    closeEditor: closeEngineEditor,
    openEditor: openEngineEditor,
    resolveFocusGeometry: resolveEngineFocusGeometry,
    importAgmDraft: importAgmDocumentDraft,
    importRulesPack: importAgmRulesPackDraft,
    restoreAgmDraft: restoreAgmDocumentState,
    applyRulesPack: applyRulesPackDraft,
    applyAutoFixPreview: applyAutoFixPreviewAction,
    undoAutoFixPreview: undoAutoFixPreviewAction,
    redoAutoFixPreview: redoAutoFixPreviewAction,
    applyManualBiomeRuleAdjustment,
    applyBiomeCoverageTarget,
    isPaintCanvasTool,
    getCanvasPaintPreviewForCell,
    applyCanvasPaintPreview,
    undoCanvasEditEntry,
    applyProjectWorkspaceChange,
    persistLanguage,
    persistTheme,
    persistNavigationCollapsed,
  };
}

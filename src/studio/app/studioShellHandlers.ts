import { getPresetById } from "../canvas/presets";
import type { StudioShellEventHandlers } from "../layout/shellEvents";
import type { StudioState } from "../types";
import { createDirectEditorActionHandlers } from "./directEditorActionHandlers";
import { createProjectActionHandler } from "./projectActionHandler";
import { createStudioEngineCommandHandlers } from "./studioEngineCommandHandlers";
import type { StudioEngineCommandTargets } from "./studioEngineCommandTargets";
import {
  createGlobalStudioShellTargets,
  type StudioShellTargets,
} from "./studioShellTargets";

type RenderStudioApp = (root: HTMLElement, state: StudioState) => void;

type CreateStudioShellEventHandlersOptions = {
  render: RenderStudioApp;
  root: HTMLElement;
  state: StudioState;
  syncProjectSummaryState: () => Promise<unknown>;
  updateViewportDimensions: (state: StudioState) => void;
  targets?: StudioShellTargets;
  engineTargets?: StudioEngineCommandTargets;
};

function getViewportCanvasSize(
  presetId: string | undefined,
  orientation: StudioState["viewport"]["orientation"] | undefined,
) {
  const preset = getPresetById(presetId || "desktop-landscape");
  const resolvedOrientation = orientation || preset.orientation;
  return {
    width:
      resolvedOrientation === preset.orientation ? preset.width : preset.height,
    height:
      resolvedOrientation === preset.orientation ? preset.height : preset.width,
  };
}

function getCanvasRegenerationBusyState(
  language: StudioState["language"],
  width: number,
  height: number,
): NonNullable<StudioState["shell"]["generationBusy"]> {
  if (language === "zh-CN") {
    return {
      title: "\u6b63\u5728\u91cd\u65b0\u751f\u6210\u753b\u5e03",
      detail: `${width} \u00d7 ${height}`,
    };
  }

  return {
    title: "Regenerating canvas",
    detail: `${width} x ${height}`,
  };
}

export function createStudioShellEventHandlers({
  render,
  root,
  state,
  syncProjectSummaryState,
  updateViewportDimensions,
  targets = createGlobalStudioShellTargets(),
  engineTargets,
}: CreateStudioShellEventHandlersOptions): StudioShellEventHandlers {
  const engineCommandHandlers = createStudioEngineCommandHandlers({
    render,
    root,
    state,
    syncProjectSummaryState,
    targets: engineTargets,
  });

  return {
    onSectionChange: (section) => {
      targets.syncEditorWorkflow(state);
      targets.syncDocument(state);
      if (section === "editors" && state.section !== "editors") {
        state.editor.lastEditorSection = state.section;
      }
      state.section = section;
      render(root, state);
    },
    onEditorModuleChange: (module) => {
      targets.syncEditorWorkflow(state);
      targets.syncDocument(state);
      if (state.section !== "editors") {
        state.editor.lastEditorSection = state.section;
      }
      state.shell.activeEditorModule = module;
      state.section = "editors";
      render(root, state);
    },
    onViewportChange: async (patch) => {
      const nextPresetId = patch.presetId ?? state.viewport.presetId;
      const nextOrientation = patch.orientation ?? state.viewport.orientation;
      const currentSize = getViewportCanvasSize(
        state.viewport.presetId,
        state.viewport.orientation,
      );
      const nextSize = getViewportCanvasSize(nextPresetId, nextOrientation);
      const changesCanvasSize =
        (patch.presetId !== undefined || patch.orientation !== undefined) &&
        (nextSize.width !== currentSize.width ||
          nextSize.height !== currentSize.height);

      if (
        changesCanvasSize &&
        !targets.confirmViewportCanvasRegenerate(
          state.language,
          nextSize.width,
          nextSize.height,
        )
      ) {
        render(root, state);
        return;
      }

      const resetsViewportContent =
        patch.presetId !== undefined ||
        patch.orientation !== undefined ||
        patch.fitMode !== undefined;
      state.viewport = {
        ...state.viewport,
        ...patch,
        ...(resetsViewportContent
          ? {
              zoom: 1,
              panX: 0,
              panY: 0,
              selectedCanvasEntity: null,
              paintPreview: null,
            }
          : {}),
      };
      updateViewportDimensions(state);
      if (patch.presetId !== undefined || patch.orientation !== undefined) {
        targets.setPendingViewportCanvasSize(
          state.viewport.width,
          state.viewport.height,
        );
      }
      targets.syncDocument(state);

      if (changesCanvasSize) {
        state.shell.generationBusy = getCanvasRegenerationBusyState(
          state.language,
          state.viewport.width,
          state.viewport.height,
        );
        targets.syncDocument(state);
        render(root, state);
        try {
          await engineCommandHandlers.onTopbarAction("new");
        } finally {
          state.shell.generationBusy = null;
          targets.syncDocument(state);
          render(root, state);
        }
        return;
      }

      render(root, state);
    },
    ...engineCommandHandlers,
    onProjectAction: createProjectActionHandler({
      root,
      state,
      render,
      syncProjectSummaryState,
      updateViewportDimensions,
    }),
    onAgmFileImport: async (file) => {
      const draft = await targets.importAgmDraft(file);
      if (draft)
        targets.restoreAgmDraft(state, draft, updateViewportDimensions);
      await syncProjectSummaryState();
      targets.syncDocument(state);
      render(root, state);
    },
    onRulesPackImport: async (file) => {
      const rules = await targets.importRulesPack(file);
      if (rules) targets.applyRulesPack(state, rules);
      await syncProjectSummaryState();
      targets.syncDocument(state);
      render(root, state);
    },
    onEditorAction: async (action) => {
      if (action === "stateWorkbench") {
        targets.closeEditor("stateWorkbench");
        state.editor.activeEditor = null;
        state.editor.editorDialogOpen = false;
        state.section = "editors";
        state.directEditor.selectedStateId =
          state.directEditor.selectedStateId ?? null;
        targets.syncDocument(state);
        render(root, state);
        return;
      }
      state.editor.lastEditorSection =
        state.section === "editors"
          ? state.editor.lastEditorSection
          : state.section;
      state.section = "editors";
      await targets.openEditor(action);
      targets.syncDocument(state);
      targets.syncEditorWorkflow(state);
      render(root, state);
    },
    ...createDirectEditorActionHandlers({ root, state, render }),
    onBalanceFocus: (focus) => {
      state.balanceFocus = targets.resolveFocusGeometry(focus);
      state.section = "canvas";
      targets.syncDocument(state);
      render(root, state);
    },
    onAutoFixPreviewAction: (draftId, action, changeCount) => {
      if (!draftId) return;
      targets.applyAutoFixPreview(state, draftId, action, changeCount);
      targets.syncDocument(state);
      render(root, state);
    },
    onAutoFixHistoryAction: (action) => {
      if (action === "undo") {
        targets.undoAutoFixPreview(state);
      } else {
        targets.redoAutoFixPreview(state);
      }
      targets.syncDocument(state);
      render(root, state);
    },
    onBiomeRuleAdjust: (biomeId, ruleWeight, resourceTag) => {
      if (!Number.isFinite(biomeId)) return;
      targets.applyManualBiomeRuleAdjustment(
        state,
        biomeId,
        ruleWeight,
        resourceTag,
      );
      targets.syncDocument(state);
      render(root, state);
    },
    onBiomeCoverageChange: (biomeId, targetPercentage) => {
      if (!targets.applyBiomeCoverageTarget(state, biomeId, targetPercentage))
        return;
      targets.syncDocument(state);
      render(root, state);
    },
    onCanvasEditAction: (action, cellId) => {
      if (action === "apply") {
        const preview =
          Number.isFinite(cellId) &&
          targets.isPaintCanvasTool(state.viewport.canvasTool)
            ? targets.getCanvasPaintPreviewForCell(
                state.viewport.canvasTool,
                cellId!,
              )
            : state.viewport.paintPreview;
        if (!preview || !targets.applyCanvasPaintPreview(state, preview))
          return;
      } else {
        const entry = state.viewport.canvasEditHistory.find(
          (item) => !item.undone,
        );
        if (!entry || !targets.undoCanvasEditEntry(entry)) return;
        state.viewport.canvasEditHistory = state.viewport.canvasEditHistory.map(
          (item) => (item.id === entry.id ? { ...item, undone: true } : item),
        );
        if (
          state.viewport.paintPreview &&
          targets.isPaintCanvasTool(state.viewport.canvasTool)
        ) {
          state.viewport.paintPreview =
            targets.getCanvasPaintPreviewForCell(
              state.viewport.canvasTool,
              state.viewport.paintPreview.cellId,
            ) ?? state.viewport.paintPreview;
        }
        state.document.source = "core";
      }
      targets.syncDocument(state);
      render(root, state);
    },
    onGeneratorParameterOverride: (key, value) => {
      if (!Number.isFinite(value)) return;
      state.generationProfileOverrides = {
        profile: state.document.gameProfile,
        values:
          state.generationProfileOverrides.profile ===
          state.document.gameProfile
            ? { ...state.generationProfileOverrides.values, [key]: value }
            : { [key]: value },
      };
      state.document.source = "agm";
      targets.syncDocument(state);
      render(root, state);
    },
    onCloseEditor: (action) => {
      targets.closeEditor(action);
      targets.syncDocument(state);
      targets.syncEditorWorkflow(state);
      render(root, state);
    },
    onReturnToOrigin: (section) => {
      state.section = section;
      targets.syncDocument(state);
      render(root, state);
    },
    onProjectWorkspaceChange: async (action, value) => {
      await targets.applyProjectWorkspaceChange(state, action, value);
      targets.syncDocument(state);
      render(root, state);
    },
    onLanguageChange: (language) => {
      state.language = language;
      targets.persistLanguage(language);
      render(root, state);
    },
    onThemeChange: (theme) => {
      state.theme = theme;
      targets.persistTheme(theme);
      render(root, state);
    },
    onNavigationCollapseChange: (collapsed) => {
      state.shell.navigationCollapsed = collapsed;
      targets.persistNavigationCollapsed(collapsed);
      render(root, state);
    },
  };
}

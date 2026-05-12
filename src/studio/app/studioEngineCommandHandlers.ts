import { getPresetById } from "../canvas/presets";
import type { StudioShellEventHandlers } from "../layout/shellEvents";
import type { StudioState } from "../types";
import { persistLayerCards } from "./preferences";
import {
  getRelationshipRepairExportReadyOptions,
  type RelationshipRepairExportReadyOptions,
} from "./relationshipRepairExportReadiness";
import {
  createGlobalStudioEngineCommandTargets,
  type StudioEngineCommandTargets,
} from "./studioEngineCommandTargets";

type RenderStudioApp = (root: HTMLElement, state: StudioState) => void;

type StudioEngineCommandHandlers = Pick<
  StudioShellEventHandlers,
  | "onStyleChange"
  | "onExportFormatChange"
  | "onStyleToggle"
  | "onExportSettingChange"
  | "onTopbarAction"
  | "onLayerAction"
  | "onLayerPin"
  | "onDataAction"
  | "onLayersPresetAction"
  | "onRunExport"
>;

type CreateStudioEngineCommandHandlersOptions = {
  render: RenderStudioApp;
  root: HTMLElement;
  state: StudioState;
  syncProjectSummaryState: () => Promise<unknown>;
  getExportReadyOptions?: (
    state: StudioState,
  ) => RelationshipRepairExportReadyOptions;
  targets?: StudioEngineCommandTargets;
};

function getViewportCanvasSize(state: StudioState) {
  const preset = getPresetById(state.viewport?.presetId || "desktop-landscape");
  const orientation = state.viewport?.orientation || preset.orientation;
  return {
    width: orientation === preset.orientation ? preset.width : preset.height,
    height: orientation === preset.orientation ? preset.height : preset.width,
  };
}

export function createStudioEngineCommandHandlers({
  render,
  root,
  state,
  syncProjectSummaryState,
  getExportReadyOptions = getRelationshipRepairExportReadyOptions,
  targets = createGlobalStudioEngineCommandTargets(),
}: CreateStudioEngineCommandHandlersOptions): StudioEngineCommandHandlers {
  return {
    onStyleChange: (preset) => {
      state.document.stylePreset = preset;
      targets.applyStylePreset(preset);
      targets.syncDocument(state);
      render(root, state);
    },
    onExportFormatChange: (format) => {
      state.export.format = format;
      targets.syncDocument(state);
      render(root, state);
    },
    onStyleToggle: (action) => {
      const nextEnabled =
        !targets.getStyleSettings()[
          action === "hide-labels" ? "hideLabels" : "rescaleLabels"
        ];
      targets.setStyleToggle(action, nextEnabled);
      targets.syncDocument(state);
      render(root, state);
    },
    onExportSettingChange: (setting, value) => {
      targets.setExportSetting(setting, value);
      targets.syncDocument(state);
      render(root, state);
    },
    onTopbarAction: async (action) => {
      if (action === "export") {
        targets.exportWithEngine(state.export.format);
        targets.updateProjectCenter(state, getExportReadyOptions(state));
      } else {
        const generationProfileResultBefore =
          action === "new"
            ? targets.createGenerationProfileResultSample(state)
            : null;
        if (action === "new") {
          const canvasSize = getViewportCanvasSize(state);
          targets.setPendingCanvasSize(canvasSize.width, canvasSize.height);
          targets.applyGenerationProfileOverrides(state);
        }
        await targets.runTopbarAction(action);
        if (
          action === "new" &&
          state.generationProfileImpact &&
          generationProfileResultBefore
        ) {
          const generationProfileResultAfter =
            targets.createGenerationProfileResultSample(state);
          state.generationProfileImpact = {
            ...state.generationProfileImpact,
            resultMetrics: targets.createGenerationProfileResultMetrics(
              generationProfileResultBefore,
              generationProfileResultAfter,
            ),
          };
        }
        if (action === "save") {
          targets.markDocumentClean();
          targets.updateProjectCenter(state, { saved: true });
        } else if (action === "new" || action === "open") {
          state.document.source = "core";
        }
      }
      await syncProjectSummaryState();
      targets.syncDocument(state);
      render(root, state);
    },
    onLayerAction: async (action) => {
      targets.toggleLayer(action);
      await syncProjectSummaryState();
      targets.syncDocument(state);
      render(root, state);
    },
    onLayerPin: (action) => {
      const cards = state.shell.visibleLayerCards;
      const idx = cards.indexOf(action);
      if (idx >= 0) {
        // Already pinned — remove it, but don't allow fewer than 1
        if (cards.length > 1) {
          cards.splice(idx, 1);
        }
      } else {
        // Not pinned — add it, but cap at 8
        if (cards.length >= 8) {
          cards.shift(); // Remove oldest to make room
        }
        cards.push(action);
      }
      persistLayerCards(cards);
      render(root, state);
    },
    onDataAction: async (action) => {
      if (action === "create-generated-world") {
        const canvasSize = getViewportCanvasSize(state);
        targets.setPendingCanvasSize(canvasSize.width, canvasSize.height);
      }
      await targets.runDataAction(action);
      if (action === "save-browser-snapshot" || action === "download-project") {
        targets.markDocumentClean();
        targets.updateProjectCenter(state, { saved: true });
      } else if (
        action === "load-browser-snapshot" ||
        action === "create-generated-world" ||
        action === "open-file" ||
        action === "open-url-source"
      ) {
        state.document.source = "core";
      }
      await syncProjectSummaryState();
      targets.syncDocument(state);
      render(root, state);
    },
    onLayersPresetAction: async (action) => {
      targets.runLayersPresetAction(action);
      await syncProjectSummaryState();
      targets.syncDocument(state);
      render(root, state);
    },
    onRunExport: async () => {
      targets.exportWithEngine(state.export.format);
      await syncProjectSummaryState();
      targets.syncDocument(state);
      render(root, state);
    },
  };
}

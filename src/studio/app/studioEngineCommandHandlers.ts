import type { StudioShellEventHandlers } from "../layout/shellEvents";
import type { StudioState } from "../types";
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
  | "onDataAction"
  | "onLayersPresetAction"
  | "onRunExport"
>;

type CreateStudioEngineCommandHandlersOptions = {
  render: RenderStudioApp;
  root: HTMLElement;
  state: StudioState;
  syncProjectSummaryState: () => Promise<unknown>;
  targets?: StudioEngineCommandTargets;
};

export function createStudioEngineCommandHandlers({
  render,
  root,
  state,
  syncProjectSummaryState,
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
        targets.updateProjectCenter(state, { exportReady: true });
      } else {
        const generationProfileResultBefore =
          action === "new"
            ? targets.createGenerationProfileResultSample(state)
            : null;
        if (action === "new") targets.applyGenerationProfileOverrides(state);
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
    onDataAction: async (action) => {
      await targets.runDataAction(action);
      if (action === "save-storage" || action === "save-machine") {
        targets.markDocumentClean();
        targets.updateProjectCenter(state, { saved: true });
      } else if (
        action === "quick-load" ||
        action === "new-map" ||
        action === "open-file" ||
        action === "load-url" ||
        action === "load-dropbox"
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

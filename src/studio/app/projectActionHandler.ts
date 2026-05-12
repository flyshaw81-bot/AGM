import type { StudioShellEventHandlers } from "../layout/shellEvents";
import type { StudioState } from "../types";
import {
  createGlobalProjectActionTargets,
  type ProjectActionTargets,
} from "./projectActionTargets";
import {
  getRelationshipRepairExportReadyOptions,
  type RelationshipRepairExportReadyOptions,
} from "./relationshipRepairExportReadiness";

type ProjectActionHandlerOptions = {
  root: HTMLElement;
  state: StudioState;
  render: (root: HTMLElement, state: StudioState) => void;
  syncProjectSummaryState: () => Promise<unknown>;
  updateViewportDimensions: (state: StudioState) => void;
  getExportReadyOptions?: (
    state: StudioState,
  ) => RelationshipRepairExportReadyOptions;
  targets?: ProjectActionTargets;
};

export function createProjectActionHandler({
  root,
  state,
  render,
  syncProjectSummaryState,
  updateViewportDimensions,
  getExportReadyOptions = getRelationshipRepairExportReadyOptions,
  targets = createGlobalProjectActionTargets(),
}: ProjectActionHandlerOptions): StudioShellEventHandlers["onProjectAction"] {
  return async (action) => {
    if (action === "save-agm-draft") {
      await syncProjectSummaryState();
      targets.saveAgmDraft(state, targets.getProjectSummary());
      targets.updateProjectCenter(state, { saved: true });
    } else if (action === "export-agm-draft") {
      await syncProjectSummaryState();
      targets.exportAgmDraft(state, targets.getProjectSummary());
    } else if (action === "export-world-package") {
      await syncProjectSummaryState();
      targets.exportWorldPackage(state, targets.getProjectSummary());
    } else if (action === "export-resource-map") {
      await syncProjectSummaryState();
      targets.exportResourceMap(state, targets.getProjectSummary());
    } else if (action === "export-province-map") {
      await syncProjectSummaryState();
      targets.exportProvinceMap(state, targets.getProjectSummary());
    } else if (action === "export-biome-map") {
      await syncProjectSummaryState();
      targets.exportBiomeMap(state, targets.getProjectSummary());
    } else if (action === "export-tiled-map") {
      await syncProjectSummaryState();
      targets.exportTiledMap(state, targets.getProjectSummary());
    } else if (action === "export-geojson-map-layers") {
      await syncProjectSummaryState();
      targets.exportGeoJsonMapLayers(state, targets.getProjectSummary());
    } else if (action === "export-heightmap-metadata") {
      await syncProjectSummaryState();
      targets.exportHeightmapMetadata(state, targets.getProjectSummary());
    } else if (action === "export-heightfield") {
      await syncProjectSummaryState();
      targets.exportHeightfield(state, targets.getProjectSummary());
    } else if (action === "export-heightmap-png") {
      await syncProjectSummaryState();
      await targets.exportHeightmapPng(state, targets.getProjectSummary());
    } else if (action === "export-heightmap-raw16") {
      await syncProjectSummaryState();
      targets.exportHeightmapRaw16(state, targets.getProjectSummary());
    } else if (action === "export-engine-manifest") {
      await syncProjectSummaryState();
      targets.exportEngineManifest(state, targets.getProjectSummary());
    } else if (action === "export-engine-package") {
      await syncProjectSummaryState();
      await targets.exportEnginePackage(state, targets.getProjectSummary());
      targets.updateProjectCenter(state, getExportReadyOptions(state));
    } else if (action === "export-rules-pack") {
      await syncProjectSummaryState();
      targets.exportRulesPack(state, targets.getProjectSummary());
    } else if (action === "restore-agm-draft") {
      const draft = targets.loadAgmDraft();
      if (draft)
        targets.restoreAgmDraft(state, draft, updateViewportDimensions);
    } else {
      targets.runEngineProjectAction(action);
      if (action === "restore-default-canvas-size")
        state.document.source = "core";
    }
    await syncProjectSummaryState();
    targets.syncDocument(state);
    render(root, state);
  };
}

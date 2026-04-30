import type {
  ProjectAction as EngineProjectAction,
  EngineProjectSummary,
} from "../bridge/engineActions";
import {
  getEngineProjectSummary,
  runEngineProjectAction,
} from "../bridge/engineActions";
import type { StudioShellEventHandlers } from "../layout/shellEvents";
import type { AgmDocumentDraft } from "../state/worldDocumentDraft";
import {
  exportAgmDocumentDraft,
  exportAgmRulesPackDraft,
  exportBiomeMapDraft,
  exportEngineManifestDraft,
  exportEnginePackageDraft,
  exportGeoJsonMapLayersDraft,
  exportHeightfieldDraft,
  exportHeightmapMetadataDraft,
  exportHeightmapPngDraft,
  exportHeightmapRaw16Draft,
  exportProvinceMapDraft,
  exportResourceMapDraft,
  exportTiledMapDraft,
  exportWorldPackageDraft,
  loadAgmDocumentDraft,
  saveAgmDocumentDraft,
} from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import { restoreAgmDocumentState, syncDocumentState } from "./documentState";
import { updateProjectCenterState } from "./projectCenter";

export type StudioProjectAction = Parameters<
  StudioShellEventHandlers["onProjectAction"]
>[0];

export type ProjectActionTargets = {
  getProjectSummary: () => EngineProjectSummary;
  saveAgmDraft: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => AgmDocumentDraft;
  exportAgmDraft: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportWorldPackage: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportResourceMap: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportProvinceMap: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportBiomeMap: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportTiledMap: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportGeoJsonMapLayers: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportHeightmapMetadata: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportHeightfield: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportHeightmapPng: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => Promise<unknown>;
  exportHeightmapRaw16: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportEngineManifest: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportEnginePackage: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => Promise<unknown>;
  exportRulesPack: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  loadAgmDraft: () => AgmDocumentDraft | null;
  restoreAgmDraft: (
    state: StudioState,
    draft: AgmDocumentDraft,
    updateViewportDimensions: (state: StudioState) => void,
  ) => void;
  runEngineProjectAction: (action: EngineProjectAction) => void;
  updateProjectCenter: (
    state: StudioState,
    options?: { saved?: boolean; exportReady?: boolean },
  ) => void;
  syncDocument: (state: StudioState) => void;
};

export type ProjectSummaryAdapter = {
  getProjectSummary: () => EngineProjectSummary;
};

export type ProjectDraftAdapter = {
  saveAgmDraft: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => AgmDocumentDraft;
  exportAgmDraft: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  loadAgmDraft: () => AgmDocumentDraft | null;
  restoreAgmDraft: (
    state: StudioState,
    draft: AgmDocumentDraft,
    updateViewportDimensions: (state: StudioState) => void,
  ) => void;
};

export type ProjectExportAdapter = {
  exportWorldPackage: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportResourceMap: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportProvinceMap: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportBiomeMap: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportTiledMap: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportGeoJsonMapLayers: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportHeightmapMetadata: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportHeightfield: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportHeightmapPng: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => Promise<unknown>;
  exportHeightmapRaw16: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportEngineManifest: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
  exportEnginePackage: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => Promise<unknown>;
  exportRulesPack: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => unknown;
};

export type ProjectEngineActionAdapter = {
  runEngineProjectAction: (action: EngineProjectAction) => void;
};

export type ProjectDocumentAdapter = {
  updateProjectCenter: (
    state: StudioState,
    options?: { saved?: boolean; exportReady?: boolean },
  ) => void;
  syncDocument: (state: StudioState) => void;
};

export function createGlobalProjectSummaryAdapter(): ProjectSummaryAdapter {
  return {
    getProjectSummary: getEngineProjectSummary,
  };
}

export function createGlobalProjectDraftAdapter(): ProjectDraftAdapter {
  return {
    saveAgmDraft: saveAgmDocumentDraft,
    exportAgmDraft: exportAgmDocumentDraft,
    loadAgmDraft: loadAgmDocumentDraft,
    restoreAgmDraft: restoreAgmDocumentState,
  };
}

export function createGlobalProjectExportAdapter(): ProjectExportAdapter {
  return {
    exportWorldPackage: exportWorldPackageDraft,
    exportResourceMap: exportResourceMapDraft,
    exportProvinceMap: exportProvinceMapDraft,
    exportBiomeMap: exportBiomeMapDraft,
    exportTiledMap: exportTiledMapDraft,
    exportGeoJsonMapLayers: exportGeoJsonMapLayersDraft,
    exportHeightmapMetadata: exportHeightmapMetadataDraft,
    exportHeightfield: exportHeightfieldDraft,
    exportHeightmapPng: exportHeightmapPngDraft,
    exportHeightmapRaw16: exportHeightmapRaw16Draft,
    exportEngineManifest: exportEngineManifestDraft,
    exportEnginePackage: exportEnginePackageDraft,
    exportRulesPack: exportAgmRulesPackDraft,
  };
}

export function createGlobalProjectEngineActionAdapter(): ProjectEngineActionAdapter {
  return {
    runEngineProjectAction,
  };
}

export function createGlobalProjectDocumentAdapter(): ProjectDocumentAdapter {
  return {
    updateProjectCenter: updateProjectCenterState,
    syncDocument: syncDocumentState,
  };
}

export function createProjectActionTargets(
  summaryAdapter: ProjectSummaryAdapter,
  draftAdapter: ProjectDraftAdapter,
  exportAdapter: ProjectExportAdapter,
  engineActionAdapter: ProjectEngineActionAdapter,
  documentAdapter: ProjectDocumentAdapter,
): ProjectActionTargets {
  return {
    getProjectSummary: summaryAdapter.getProjectSummary,
    saveAgmDraft: draftAdapter.saveAgmDraft,
    exportAgmDraft: draftAdapter.exportAgmDraft,
    exportWorldPackage: exportAdapter.exportWorldPackage,
    exportResourceMap: exportAdapter.exportResourceMap,
    exportProvinceMap: exportAdapter.exportProvinceMap,
    exportBiomeMap: exportAdapter.exportBiomeMap,
    exportTiledMap: exportAdapter.exportTiledMap,
    exportGeoJsonMapLayers: exportAdapter.exportGeoJsonMapLayers,
    exportHeightmapMetadata: exportAdapter.exportHeightmapMetadata,
    exportHeightfield: exportAdapter.exportHeightfield,
    exportHeightmapPng: exportAdapter.exportHeightmapPng,
    exportHeightmapRaw16: exportAdapter.exportHeightmapRaw16,
    exportEngineManifest: exportAdapter.exportEngineManifest,
    exportEnginePackage: exportAdapter.exportEnginePackage,
    exportRulesPack: exportAdapter.exportRulesPack,
    loadAgmDraft: draftAdapter.loadAgmDraft,
    restoreAgmDraft: draftAdapter.restoreAgmDraft,
    runEngineProjectAction: engineActionAdapter.runEngineProjectAction,
    updateProjectCenter: documentAdapter.updateProjectCenter,
    syncDocument: documentAdapter.syncDocument,
  };
}

export function createGlobalProjectActionTargets(): ProjectActionTargets {
  return createProjectActionTargets(
    createGlobalProjectSummaryAdapter(),
    createGlobalProjectDraftAdapter(),
    createGlobalProjectExportAdapter(),
    createGlobalProjectEngineActionAdapter(),
    createGlobalProjectDocumentAdapter(),
  );
}

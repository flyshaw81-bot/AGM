import type { EngineProjectSummary } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  createGlobalDraftFileIoTargets,
  createSafeAgmFilename,
  createSafeFilename,
  type DraftFileIoTargets,
  downloadBlobDraft,
  downloadJsonDraft,
} from "./draftFileIo";
import { AGM_DRAFT_STORAGE_KEY } from "./worldDocumentConstants";
import type { AgmDocumentDraft } from "./worldDocumentDraftBuilders";
import {
  createAgmDocumentDraft,
  createGlobalWorldDocumentDraftBuilderTargets,
  type WorldDocumentDraftBuilderTargets,
} from "./worldDocumentDraftBuilders";
import type { WorldDocumentDraftImportTargets } from "./worldDocumentDraftImport";
import { createEngineManifestExport } from "./worldDocumentEngineExports";
import {
  createGlobalEnginePackageBundleTargets,
  type EnginePackageBundleTargets,
  exportEnginePackageBundle,
} from "./worldDocumentEnginePackageDraft";
import {
  createGeoJsonMapLayerExport,
  createHeightfieldExport,
  createHeightmapMetadataExport,
  createHeightmapPngBlob,
  createHeightmapRaw16Blob,
  createTiledMapExport,
} from "./worldDocumentMapExports";

export {
  AGM_DRAFT_STORAGE_KEY,
  GAME_WORLD_PROFILE_LABELS,
} from "./worldDocumentConstants";
export type {
  AgmDocumentDraft,
  WorldDocumentDraft,
} from "./worldDocumentDraftBuilders";
export {
  createAgmDocumentDraft,
  createWorldDocumentDraft,
} from "./worldDocumentDraftBuilders";
export type { WorldRulesDraft } from "./worldDocumentDraftTypes";

export type WorldDocumentDraftTargets = WorldDocumentDraftImportTargets & {
  createDraft: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => AgmDocumentDraft;
  setStorageItem: (key: string, value: string) => void;
  downloadJson: (filename: string, draft: unknown) => void;
  downloadBlob: (filename: string, blob: Blob) => void;
  createPngBlob: typeof createHeightmapPngBlob;
  createRaw16Blob: typeof createHeightmapRaw16Blob;
  exportEnginePackage: typeof exportEnginePackageBundle;
  enginePackageTargets?: EnginePackageBundleTargets;
};

export type GlobalWorldDocumentDraftTargetOptions = {
  builderTargets?: WorldDocumentDraftBuilderTargets;
  fileIoTargets?: DraftFileIoTargets;
  enginePackageTargets?: EnginePackageBundleTargets;
};

export function createGlobalWorldDocumentDraftTargets(
  options: GlobalWorldDocumentDraftTargetOptions = {},
): WorldDocumentDraftTargets {
  const builderTargets =
    options.builderTargets ?? createGlobalWorldDocumentDraftBuilderTargets();
  const fileIoTargets =
    options.fileIoTargets ?? createGlobalDraftFileIoTargets();

  return {
    createDraft: (state, projectSummary) =>
      createAgmDocumentDraft(state, projectSummary, builderTargets),
    setStorageItem: (key, value) => localStorage.setItem(key, value),
    getStorageItem: (key) => localStorage.getItem(key),
    readFileText: (file) => file.text(),
    downloadJson: (filename, draft) =>
      downloadJsonDraft(filename, draft, fileIoTargets),
    downloadBlob: (filename, blob) =>
      downloadBlobDraft(filename, blob, fileIoTargets),
    createPngBlob: createHeightmapPngBlob,
    createRaw16Blob: createHeightmapRaw16Blob,
    exportEnginePackage: exportEnginePackageBundle,
    enginePackageTargets:
      options.enginePackageTargets ??
      createGlobalEnginePackageBundleTargets({ fileIoTargets }),
  };
}

export function saveAgmDocumentDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  const draft = targets.createDraft(state, projectSummary);
  targets.setStorageItem(AGM_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  return draft;
}

export function exportAgmDocumentDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  const draft = saveAgmDocumentDraft(state, projectSummary, targets);
  targets.downloadJson(createSafeAgmFilename(draft.document.name), draft);
  return draft;
}

function exportPackageJsonArtifact<T>(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  filenameSuffix: string,
  selectPayload: (draft: AgmDocumentDraft) => T,
  targets: WorldDocumentDraftTargets,
) {
  const draft = saveAgmDocumentDraft(state, projectSummary, targets);
  const payload = selectPayload(draft);
  targets.downloadJson(
    createSafeFilename(draft.document.name, filenameSuffix),
    payload,
  );
  return payload;
}

export function exportWorldPackageDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-world.json",
    (draft) => draft.world.package,
    targets,
  );
}

export function exportResourceMapDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-resource-map.json",
    (draft) => draft.world.package.maps.resourceMap,
    targets,
  );
}

export function exportProvinceMapDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-province-map.json",
    (draft) => draft.world.package.maps.provinceMap,
    targets,
  );
}

export function exportBiomeMapDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-biome-map.json",
    (draft) => draft.world.package.maps.biomeMap,
    targets,
  );
}

export function exportTiledMapDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-tiled-map.json",
    (draft) => createTiledMapExport(draft.world.package),
    targets,
  );
}

export function exportGeoJsonMapLayersDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-map-layers.geojson",
    (draft) => createGeoJsonMapLayerExport(draft.world.package),
    targets,
  );
}

export function exportHeightmapMetadataDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-heightmap.json",
    (draft) => createHeightmapMetadataExport(draft.world.package),
    targets,
  );
}

export function exportHeightfieldDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-heightfield.json",
    (draft) => createHeightfieldExport(draft.world.package),
    targets,
  );
}

export async function exportHeightmapPngDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  const draft = saveAgmDocumentDraft(state, projectSummary, targets);
  const heightfield = createHeightfieldExport(draft.world.package);
  const filename = createSafeFilename(draft.document.name, "agm-heightmap.png");
  const blob = await targets.createPngBlob(heightfield);
  targets.downloadBlob(filename, blob);
  return { filename, heightfield };
}

export function exportHeightmapRaw16Draft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  const draft = saveAgmDocumentDraft(state, projectSummary, targets);
  const heightfield = createHeightfieldExport(draft.world.package);
  const filename = createSafeFilename(
    draft.document.name,
    "agm-heightmap-r16.raw",
  );
  const blob = targets.createRaw16Blob(heightfield);
  targets.downloadBlob(filename, blob);
  return { filename, heightfield };
}

export function exportEngineManifestDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-engine-manifest.json",
    (draft) => createEngineManifestExport(draft.world.package),
    targets,
  );
}

export async function exportEnginePackageDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  const draft = saveAgmDocumentDraft(state, projectSummary, targets);
  return targets.exportEnginePackage(
    draft.document.name,
    draft.world.package,
    targets.enginePackageTargets,
  );
}

export function exportAgmRulesPackDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftTargets(),
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-rules.json",
    (draft) => draft.world.rules,
    targets,
  );
}

export type { WorldDocumentDraftImportTargets } from "./worldDocumentDraftImport";
export {
  createGlobalWorldDocumentDraftImportTargets,
  importAgmDocumentDraft,
  importAgmRulesPackDraft,
  loadAgmDocumentDraft,
  parseAgmRulesPackDraft,
} from "./worldDocumentDraftImport";

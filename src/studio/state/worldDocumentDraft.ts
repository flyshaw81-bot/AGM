import type { EngineProjectSummary } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  createSafeAgmFilename,
  createSafeFilename,
  downloadBlobDraft,
  downloadJsonDraft,
} from "./draftFileIo";
import { AGM_DRAFT_STORAGE_KEY } from "./worldDocumentConstants";
import type { AgmDocumentDraft } from "./worldDocumentDraftBuilders";
import { createAgmDocumentDraft } from "./worldDocumentDraftBuilders";
import { createEngineManifestExport } from "./worldDocumentEngineExports";
import { exportEnginePackageBundle } from "./worldDocumentEnginePackageDraft";
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

export function saveAgmDocumentDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  const draft = createAgmDocumentDraft(state, projectSummary);
  localStorage.setItem(AGM_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  return draft;
}

export function exportAgmDocumentDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  downloadJsonDraft(createSafeAgmFilename(draft.document.name), draft);
  return draft;
}

function exportPackageJsonArtifact<T>(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  filenameSuffix: string,
  selectPayload: (draft: AgmDocumentDraft) => T,
) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  const payload = selectPayload(draft);
  downloadJsonDraft(
    createSafeFilename(draft.document.name, filenameSuffix),
    payload,
  );
  return payload;
}

export function exportWorldPackageDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-world.json",
    (draft) => draft.world.package,
  );
}

export function exportResourceMapDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-resource-map.json",
    (draft) => draft.world.package.maps.resourceMap,
  );
}

export function exportProvinceMapDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-province-map.json",
    (draft) => draft.world.package.maps.provinceMap,
  );
}

export function exportBiomeMapDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-biome-map.json",
    (draft) => draft.world.package.maps.biomeMap,
  );
}

export function exportTiledMapDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-tiled-map.json",
    (draft) => createTiledMapExport(draft.world.package),
  );
}

export function exportGeoJsonMapLayersDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-map-layers.geojson",
    (draft) => createGeoJsonMapLayerExport(draft.world.package),
  );
}

export function exportHeightmapMetadataDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-heightmap.json",
    (draft) => createHeightmapMetadataExport(draft.world.package),
  );
}

export function exportHeightfieldDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-heightfield.json",
    (draft) => createHeightfieldExport(draft.world.package),
  );
}

export async function exportHeightmapPngDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  const heightfield = createHeightfieldExport(draft.world.package);
  const filename = createSafeFilename(draft.document.name, "agm-heightmap.png");
  const blob = await createHeightmapPngBlob(heightfield);
  downloadBlobDraft(filename, blob);
  return { filename, heightfield };
}

export function exportHeightmapRaw16Draft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  const heightfield = createHeightfieldExport(draft.world.package);
  const filename = createSafeFilename(
    draft.document.name,
    "agm-heightmap-r16.raw",
  );
  const blob = createHeightmapRaw16Blob(heightfield);
  downloadBlobDraft(filename, blob);
  return { filename, heightfield };
}

export function exportEngineManifestDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-engine-manifest.json",
    (draft) => createEngineManifestExport(draft.world.package),
  );
}

export async function exportEnginePackageDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  return exportEnginePackageBundle(draft.document.name, draft.world.package);
}

export function exportAgmRulesPackDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  return exportPackageJsonArtifact(
    state,
    projectSummary,
    "agm-rules.json",
    (draft) => draft.world.rules,
  );
}

export {
  importAgmDocumentDraft,
  importAgmRulesPackDraft,
  loadAgmDocumentDraft,
  parseAgmRulesPackDraft,
} from "./worldDocumentDraftImport";

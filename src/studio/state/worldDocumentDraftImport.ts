import type { LayerAction } from "../bridge/engineActionTypes";
import {
  AGM_DRAFT_STORAGE_KEY,
  GAME_WORLD_PROFILE_LABELS,
} from "./worldDocumentConstants";
import type { AgmDocumentDraft } from "./worldDocumentDraft";
import {
  isGenerationProfileOverrides,
  isWorldPlayabilityHints,
  isWorldRulesDraft,
} from "./worldDocumentDraftImportGuards";

export type WorldDocumentDraftImportTargets = {
  getStorageItem: (key: string) => string | null;
  readFileText: (file: File) => Promise<string>;
};

export function createGlobalWorldDocumentDraftImportTargets(): WorldDocumentDraftImportTargets {
  return {
    getStorageItem: (key) => localStorage.getItem(key),
    readFileText: (file) => file.text(),
  };
}

function isLayerStates(
  value: unknown,
): value is Partial<Record<LayerAction, boolean>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((item) => typeof item === "boolean");
}

function isLayerDetails(value: unknown) {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const detail = item as Record<string, unknown>;
    return (
      typeof detail.id === "string" &&
      typeof detail.label === "string" &&
      typeof detail.shortcut === "string" &&
      typeof detail.pinned === "boolean" &&
      typeof detail.active === "boolean"
    );
  });
}

function isEntitySummaryItem(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "number" ||
    !Number.isFinite(item.id) ||
    typeof item.name !== "string"
  )
    return false;
  return (
    [item.type, item.color].every(
      (field) => field === undefined || typeof field === "string",
    ) &&
    [item.state, item.culture, item.capital, item.population, item.cells].every(
      (field) =>
        field === undefined ||
        (typeof field === "number" && Number.isFinite(field)),
    )
  );
}

function isEntitySummaryList(value: unknown) {
  return Array.isArray(value) && value.every(isEntitySummaryItem);
}

function isEntitySummary(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const summary = value as Record<string, unknown>;
  return (
    isEntitySummaryList(summary.states) &&
    isEntitySummaryList(summary.burgs) &&
    isEntitySummaryList(summary.cultures) &&
    isEntitySummaryList(summary.religions)
  );
}

function isEntityIndex(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

function isResourceSummaryItem(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "number" || !Number.isFinite(item.id)) return false;
  if (item.name !== undefined && typeof item.name !== "string") return false;
  if (item.fullName !== undefined && typeof item.fullName !== "string")
    return false;
  if (item.type !== undefined && typeof item.type !== "string") return false;
  if (item.group !== undefined && typeof item.group !== "string") return false;
  if (item.color !== undefined && typeof item.color !== "string") return false;
  return (
    [
      item.habitability,
      item.movementCost,
      item.iconDensity,
      item.state,
      item.burg,
      item.center,
      item.feature,
      item.pointCount,
      item.agmRuleWeight,
    ].every(
      (field) =>
        field === undefined ||
        (typeof field === "number" && Number.isFinite(field)),
    ) &&
    (item.agmResourceTag === undefined ||
      typeof item.agmResourceTag === "string")
  );
}

function isResourceSummaryList(value: unknown) {
  return Array.isArray(value) && value.every(isResourceSummaryItem);
}

function isWorldResourceSummary(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const summary = value as Record<string, unknown>;
  return (
    isResourceSummaryList(summary.biomes) &&
    isResourceSummaryList(summary.provinces) &&
    isResourceSummaryList(summary.routes)
  );
}

function isWorldPackageDraft(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const packageDraft = value as Record<string, unknown>;
  const manifest = packageDraft.manifest;
  const map = packageDraft.map;
  const indexes = packageDraft.indexes;
  const entities = packageDraft.entities;
  const resources = packageDraft.resources;
  const generation = packageDraft.generation;
  const rules = packageDraft.rules;
  const playability = packageDraft.playability;
  const exportTargets = packageDraft.exportTargets;
  if (packageDraft.schema !== "agm.package.v0") return false;
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest))
    return false;
  const manifestRecord = manifest as Record<string, unknown>;
  if (
    typeof manifestRecord.id !== "string" ||
    typeof manifestRecord.name !== "string"
  )
    return false;
  if (
    typeof manifestRecord.profile !== "string" ||
    !(manifestRecord.profile in GAME_WORLD_PROFILE_LABELS)
  )
    return false;
  if (
    typeof manifestRecord.profileLabel !== "string" ||
    manifestRecord.sourceSchema !== "agm.world.v0"
  )
    return false;
  if (!map || typeof map !== "object" || Array.isArray(map)) return false;
  const mapRecord = map as Record<string, unknown>;
  if (typeof mapRecord.seed !== "string" || typeof mapRecord.style !== "string")
    return false;
  if (typeof mapRecord.width !== "number" || !Number.isFinite(mapRecord.width))
    return false;
  if (
    typeof mapRecord.height !== "number" ||
    !Number.isFinite(mapRecord.height)
  )
    return false;
  if (typeof mapRecord.heightmap !== "string") return false;
  if (!indexes || typeof indexes !== "object" || Array.isArray(indexes))
    return false;
  const indexRecord = indexes as Record<string, unknown>;
  if (
    !isEntityIndex(indexRecord.states) ||
    !isEntityIndex(indexRecord.burgs) ||
    !isEntityIndex(indexRecord.cultures) ||
    !isEntityIndex(indexRecord.religions)
  )
    return false;
  if (indexRecord.biomes && !isEntityIndex(indexRecord.biomes)) return false;
  if (indexRecord.provinces && !isEntityIndex(indexRecord.provinces))
    return false;
  if (indexRecord.routes && !isEntityIndex(indexRecord.routes)) return false;
  if (entities && !isEntitySummary(entities)) return false;
  if (resources && !isWorldResourceSummary(resources)) return false;
  if (generation !== undefined) {
    if (
      !generation ||
      typeof generation !== "object" ||
      Array.isArray(generation)
    )
      return false;
    const generationRecord = generation as Record<string, unknown>;
    if (!isGenerationProfileOverrides(generationRecord.profileOverrides))
      return false;
  }
  if (rules && !isWorldRulesDraft(rules)) return false;
  if (playability && !isWorldPlayabilityHints(playability)) return false;
  return (
    Array.isArray(exportTargets) &&
    exportTargets.every((item) => typeof item === "string")
  );
}

function parseAgmDocumentDraft(rawDraft: string) {
  try {
    const draft = JSON.parse(rawDraft) as Partial<AgmDocumentDraft>;
    const document = draft.document;
    if (draft.schema !== "agm.document.v0" || !document || !draft.world)
      return null;
    if (
      typeof document.name !== "string" ||
      typeof document.designIntent !== "string"
    )
      return null;
    if (
      typeof document.gameProfile !== "string" ||
      !(document.gameProfile in GAME_WORLD_PROFILE_LABELS)
    )
      return null;
    if (draft.world.viewport) {
      if (typeof draft.world.viewport.presetId !== "string") return null;
      if (
        draft.world.viewport.orientation !== "landscape" &&
        draft.world.viewport.orientation !== "portrait"
      )
        return null;
      if (
        draft.world.viewport.fitMode !== "contain" &&
        draft.world.viewport.fitMode !== "cover" &&
        draft.world.viewport.fitMode !== "actual-size"
      )
        return null;
    }
    if (
      draft.world.export &&
      draft.world.export.format !== "svg" &&
      draft.world.export.format !== "png" &&
      draft.world.export.format !== "jpeg"
    )
      return null;
    if (draft.world.layers) {
      if (typeof draft.world.layers.preset !== "string") return null;
      if (!isLayerStates(draft.world.layers.visible)) return null;
      if (!isLayerDetails(draft.world.layers.details)) return null;
    }
    if (draft.world.entities && !isEntitySummary(draft.world.entities))
      return null;
    if (
      draft.world.generation?.profileOverrides &&
      !isGenerationProfileOverrides(draft.world.generation.profileOverrides)
    )
      return null;
    if (draft.world.resources && !isWorldResourceSummary(draft.world.resources))
      return null;
    if (draft.world.rules && !isWorldRulesDraft(draft.world.rules)) return null;
    if (
      draft.world.playability &&
      !isWorldPlayabilityHints(draft.world.playability)
    )
      return null;
    if (draft.world.package && !isWorldPackageDraft(draft.world.package))
      return null;
    return draft as AgmDocumentDraft;
  } catch (error) {
    console.warn("AGM Studio could not parse the document draft.", error);
    return null;
  }
}

export function loadAgmDocumentDraft(
  targets: Pick<
    WorldDocumentDraftImportTargets,
    "getStorageItem"
  > = createGlobalWorldDocumentDraftImportTargets(),
) {
  const rawDraft = targets.getStorageItem(AGM_DRAFT_STORAGE_KEY);
  return rawDraft ? parseAgmDocumentDraft(rawDraft) : null;
}

export function parseAgmRulesPackDraft(rawDraft: string) {
  try {
    const draft = JSON.parse(rawDraft) as unknown;
    return isWorldRulesDraft(draft) ? draft : null;
  } catch (error) {
    console.warn("AGM Studio could not parse the rules pack draft.", error);
    return null;
  }
}

export async function importAgmRulesPackDraft(
  file: File,
  targets: Pick<
    WorldDocumentDraftImportTargets,
    "readFileText"
  > = createGlobalWorldDocumentDraftImportTargets(),
) {
  return parseAgmRulesPackDraft(await targets.readFileText(file));
}

export async function importAgmDocumentDraft(
  file: File,
  targets: Pick<
    WorldDocumentDraftImportTargets,
    "readFileText"
  > = createGlobalWorldDocumentDraftImportTargets(),
) {
  return parseAgmDocumentDraft(await targets.readFileText(file));
}

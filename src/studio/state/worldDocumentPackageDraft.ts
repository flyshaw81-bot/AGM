import type {
  EngineEntitySummary,
  EngineProjectSummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import { createSafeAgmFilename } from "./draftFileIo";
import { GAME_WORLD_PROFILE_LABELS } from "./worldDocumentConstants";
import type {
  WorldPlayabilityHints,
  WorldRulesDraft,
} from "./worldDocumentDraftTypes";
import {
  createBiomeMapExport,
  createProvinceMapExport,
  createResourceMapExport,
} from "./worldDocumentMapExports";

function createEntityIndex(entities: EngineEntitySummary) {
  return {
    states: entities.states.map((item) => item.id),
    burgs: entities.burgs.map((item) => item.id),
    cultures: entities.cultures.map((item) => item.id),
    religions: entities.religions.map((item) => item.id),
  };
}

function createResourceIndex(resources: EngineWorldResourceSummary) {
  return {
    biomes: resources.biomes.map((item) => item.id),
    provinces: resources.provinces.map((item) => item.id),
    routes: resources.routes.map((item) => item.id),
  };
}

export function createGenerationProfileOverrides(state: StudioState) {
  return {
    profile: state.generationProfileOverrides.profile,
    values: { ...state.generationProfileOverrides.values },
  };
}

export function createWorldPackageDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  entities: EngineEntitySummary,
  resources: EngineWorldResourceSummary,
  playability: WorldPlayabilityHints,
  rules: WorldRulesDraft,
  profileOverrides: ReturnType<typeof createGenerationProfileOverrides>,
) {
  return {
    schema: "agm.package.v0",
    manifest: {
      id: createSafeAgmFilename(state.document.name).replace(/\.agm$/u, ""),
      name: state.document.name,
      profile: state.document.gameProfile,
      profileLabel: GAME_WORLD_PROFILE_LABELS[state.document.gameProfile],
      sourceSchema: "agm.world.v0",
    },
    map: {
      seed: state.document.seed,
      width: state.document.documentWidth,
      height: state.document.documentHeight,
      style: state.document.stylePreset,
      heightmap: projectSummary.pendingTemplate,
    },
    maps: {
      resourceMap: createResourceMapExport(rules),
      provinceMap: createProvinceMapExport(resources, rules),
      biomeMap: createBiomeMapExport(resources, rules),
    },
    generation: {
      profileOverrides,
    },
    entities,
    resources,
    rules,
    playability,
    indexes: {
      ...createEntityIndex(entities),
      ...createResourceIndex(resources),
    },
    exportTargets: [
      "json",
      "unity",
      "godot",
      "unreal",
      "tiled",
      "geojson",
      "heightmap",
      "biome-map",
      "province-map",
      "resource-map",
    ],
  };
}

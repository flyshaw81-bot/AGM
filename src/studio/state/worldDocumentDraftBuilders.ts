import {
  getEngineEntitySummary,
  getEngineLayerDetails,
  getEngineLayerStates,
  getEngineWorldResourceSummary,
} from "../bridge/engineActions";
import type {
  EngineEntitySummary,
  EngineProjectSummary,
  EngineWorldResourceSummary,
  LayerAction,
} from "../bridge/engineActionTypes";
import type { DocumentState, StudioState } from "../types";
import { GAME_WORLD_PROFILE_LABELS } from "./worldDocumentConstants";
import {
  createGenerationProfileOverrides,
  createWorldPackageDraft,
} from "./worldDocumentPackageDraft";
import {
  createEffectiveProfileParameters,
  createWorldPlayabilityHints,
  createWorldRulesDraft,
} from "./worldDocumentPlayability";

function numberOrNull(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export type WorldDocumentDraftTargets = {
  getEntities: () => EngineEntitySummary;
  getResources: () => EngineWorldResourceSummary;
  getLayerStates: () => Record<LayerAction, boolean>;
  getLayerDetails: () => ReturnType<typeof getEngineLayerDetails>;
};

export function createGlobalWorldDocumentDraftBuilderTargets(): WorldDocumentDraftTargets {
  return {
    getEntities: getEngineEntitySummary,
    getResources: getEngineWorldResourceSummary,
    getLayerStates: getEngineLayerStates,
    getLayerDetails: getEngineLayerDetails,
  };
}

export function createWorldDocumentDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftBuilderTargets(),
) {
  const entities = targets.getEntities();
  const resources = targets.getResources();
  const playability = createWorldPlayabilityHints(entities, resources, state);
  const effectiveProfileParameters = createEffectiveProfileParameters(
    state.document.gameProfile,
    playability.spawnCandidates,
    entities,
    resources,
    state.generationProfileOverrides,
  );
  const rules = createWorldRulesDraft(
    resources,
    state.document.gameProfile,
    effectiveProfileParameters,
  );
  const profileOverrides = createGenerationProfileOverrides(state);

  return {
    schema: "agm.world.v0",
    project: {
      name: state.document.name,
      source: state.document.source,
    },
    game: {
      profile: state.document.gameProfile,
      profileLabel: GAME_WORLD_PROFILE_LABELS[state.document.gameProfile],
      designIntent: state.document.designIntent,
    },
    map: {
      seed: state.document.seed,
      width: state.document.documentWidth,
      height: state.document.documentHeight,
      style: state.document.stylePreset,
    },
    generation: {
      pendingSeed: projectSummary.pendingSeed,
      pointsDensity: numberOrNull(projectSummary.pendingPoints),
      cellsLabel: projectSummary.pendingCellsLabel,
      states: numberOrNull(projectSummary.pendingStates),
      provincesRatio: numberOrNull(projectSummary.pendingProvincesRatio),
      growthRate: numberOrNull(projectSummary.pendingGrowthRate),
      sizeVariety: numberOrNull(projectSummary.pendingSizeVariety),
      heightmap: {
        value: projectSummary.pendingTemplate,
        label: projectSummary.pendingTemplateLabel,
      },
      pendingCanvasSize: {
        width: numberOrNull(projectSummary.pendingWidth),
        height: numberOrNull(projectSummary.pendingHeight),
      },
      profileOverrides,
    },
    climate: {
      temperature: {
        equator: numberOrNull(projectSummary.pendingTemperatureEquator),
        northPole: numberOrNull(projectSummary.pendingTemperatureNorthPole),
        southPole: numberOrNull(projectSummary.pendingTemperatureSouthPole),
      },
      precipitation: numberOrNull(projectSummary.pendingPrecipitation),
      mapSize: numberOrNull(projectSummary.pendingMapSize),
      latitude: numberOrNull(projectSummary.pendingLatitude),
      longitude: numberOrNull(projectSummary.pendingLongitude),
      winds: [
        numberOrNull(projectSummary.pendingWindTier0),
        numberOrNull(projectSummary.pendingWindTier1),
        numberOrNull(projectSummary.pendingWindTier2),
        numberOrNull(projectSummary.pendingWindTier3),
        numberOrNull(projectSummary.pendingWindTier4),
        numberOrNull(projectSummary.pendingWindTier5),
      ],
    },
    population: {
      cultures: numberOrNull(projectSummary.pendingCultures),
      burgs: numberOrNull(projectSummary.pendingBurgs),
      burgsLabel: projectSummary.pendingBurgsLabel,
      religions: numberOrNull(projectSummary.pendingReligions),
      stateLabelsMode: projectSummary.pendingStateLabelsMode,
      stateLabelsModeLabel: projectSummary.pendingStateLabelsModeLabel,
      cultureSet: projectSummary.pendingCultureSet,
      cultureSetLabel: projectSummary.pendingCultureSetLabel,
    },
    layers: {
      preset: projectSummary.lastLayersPreset,
      visible: targets.getLayerStates(),
      details: targets.getLayerDetails(),
    },
    entities,
    resources,
    rules,
    playability,
    package: createWorldPackageDraft(
      state,
      projectSummary,
      entities,
      resources,
      playability,
      rules,
      profileOverrides,
    ),
    viewport: {
      presetId: state.viewport.presetId,
      orientation: state.viewport.orientation,
      fitMode: state.viewport.fitMode,
    },
    export: {
      format: state.export.format,
    },
  };
}

export type WorldDocumentDraft = ReturnType<typeof createWorldDocumentDraft>;

export type AgmDocumentDraft = {
  schema: "agm.document.v0";
  document: Pick<DocumentState, "name" | "gameProfile" | "designIntent">;
  world: WorldDocumentDraft;
};

export function createAgmDocumentDraft(
  state: StudioState,
  projectSummary: EngineProjectSummary,
  targets: WorldDocumentDraftTargets = createGlobalWorldDocumentDraftBuilderTargets(),
): AgmDocumentDraft {
  return {
    schema: "agm.document.v0",
    document: {
      name: state.document.name,
      gameProfile: state.document.gameProfile,
      designIntent: state.document.designIntent,
    },
    world: createWorldDocumentDraft(state, projectSummary, targets),
  };
}

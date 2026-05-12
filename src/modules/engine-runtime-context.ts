import type { ClimateRuntimeContext } from "./climate";
import {
  createRuntimeBurgService,
  type EngineBurgService,
} from "./engine-burg-service";
import { createGlobalClimateContext } from "./engine-climate-context";
import {
  createGlobalFeedbackService,
  type EngineFeedbackService,
} from "./engine-feedback-service";
import {
  createGlobalGenerationSessionLifecycle,
  createRuntimeGenerationSessionAdapter,
  createRuntimeGridSessionService,
  type EngineGenerationSessionAdapter,
  type EngineGenerationSessionLifecycle,
  type EngineGridSessionService,
} from "./engine-generation-session-services";
import {
  createRuntimeGenerationSettingsStore,
  type EngineGenerationSettings,
  type EngineGenerationSettingsStore,
} from "./engine-generation-settings";
import {
  createRuntimeGenerationStatisticsService,
  type EngineGenerationStatisticsService,
} from "./engine-generation-statistics-service";
import {
  createRuntimeGraphSession,
  type EngineGraphSessionModule as EngineGraphSessionService,
} from "./engine-graph-session";
import {
  createRuntimeHeraldryService,
  type EngineHeraldryService,
} from "./engine-heraldry-service";
import {
  createGlobalLifecycleAdapter,
  type EngineLifecycleAdapter,
} from "./engine-lifecycle-adapter";
import {
  createGlobalLogService,
  type EngineLogService,
} from "./engine-log-service";
import {
  createRuntimeMapGraphLifecycleService,
  type EngineMapGraphLifecycleService,
} from "./engine-map-graph-lifecycle-service";
import {
  createRuntimeMapPlacementService,
  type EngineMapPlacementService,
} from "./engine-map-placement-service";
import { createRuntimeMapStore, type EngineMapStore } from "./engine-map-store";
import {
  createRuntimeNamingService,
  type EngineNamingService,
} from "./engine-naming-service";
import {
  createRuntimeNoteService,
  type EngineNoteService,
} from "./engine-note-service";
import {
  createGlobalNoticeService,
  type EngineNoticeService,
} from "./engine-notice-service";
import {
  createRuntimeOptionsSession,
  type EngineOptionsSessionModule,
} from "./engine-options-session";
import {
  createGlobalRandomService,
  type EngineRandomService,
} from "./engine-random-service";
import {
  createGlobalRenderAdapter,
  createRuntimeRenderAdapter,
  type EngineRenderAdapter,
} from "./engine-render-adapter";
import {
  createRuntimeRouteService,
  type EngineRouteService,
} from "./engine-route-service";
import {
  createGlobalPopulationSettings,
  createGlobalTimingSettings,
  createGlobalUnitSettings,
  createRuntimeWorldSettingsStore,
  type EnginePopulationSettings,
  type EngineTimingSettings,
  type EngineUnitSettings,
  type EngineWorldSettings,
  type EngineWorldSettingsStore,
} from "./engine-runtime-settings";
import {
  createRuntimeSeedSession,
  type EngineSeedSessionModule as EngineSeedSessionService,
} from "./engine-seed-session";
import {
  createRuntimeStateService,
  type EngineStateService,
} from "./engine-state-service";
import {
  createGlobalWaterFeatureService,
  type EngineWaterFeatureService,
} from "./engine-water-feature-service";
import {
  createBrowserEngineWorldState,
  type EngineBiomeData,
  type EngineGrid,
  type EngineOptions,
  type EnginePack,
  type EngineSeed,
  type EngineWorldState,
} from "./engine-world-state";

export type { EngineBurgService } from "./engine-burg-service";
export type { EngineFeedbackService } from "./engine-feedback-service";
export type { EngineGenerationStatisticsService } from "./engine-generation-statistics-service";
export type { EngineHeraldryService } from "./engine-heraldry-service";
export type { EngineLogService } from "./engine-log-service";
export type { EngineMapGraphLifecycleService } from "./engine-map-graph-lifecycle-service";
export type { EngineMapPlacementService } from "./engine-map-placement-service";
export type { EngineMapSnapshot, EngineMapStore } from "./engine-map-store";
export type { EngineNamingService } from "./engine-naming-service";
export type { EngineNote, EngineNoteService } from "./engine-note-service";
export type { EngineNoticeService } from "./engine-notice-service";
export type { EngineRandomService } from "./engine-random-service";
export type { EngineRenderAdapter } from "./engine-render-adapter";
export type { EngineRouteService } from "./engine-route-service";
export type { EngineStateService } from "./engine-state-service";
export type { EngineWaterFeatureService } from "./engine-water-feature-service";
export type { EngineBiomeData, EngineWorldState } from "./engine-world-state";

export type EngineRuntimeContext = {
  worldState?: EngineWorldState;
  grid: EngineGrid;
  pack: EnginePack;
  options: EngineOptions;
  seed: EngineSeed;
  worldSettings: EngineWorldSettings;
  worldSettingsStore?: EngineWorldSettingsStore;
  generationSettings: EngineGenerationSettings;
  generationSettingsStore?: EngineGenerationSettingsStore;
  generationStatistics?: EngineGenerationStatisticsService;
  populationSettings: EnginePopulationSettings;
  naming: EngineNamingService;
  burgs: EngineBurgService;
  routes: EngineRouteService;
  states: EngineStateService;
  units: EngineUnitSettings;
  heraldry: EngineHeraldryService;
  mapStore: EngineMapStore;
  mapGraphLifecycle?: EngineMapGraphLifecycleService;
  mapPlacement?: EngineMapPlacementService;
  waterFeatures?: EngineWaterFeatureService;
  seedSession: EngineSeedSessionService;
  graphSession: EngineGraphSessionService;
  optionsSession: EngineOptionsSessionModule;
  gridSession: EngineGridSessionService;
  sessionLifecycle: EngineGenerationSessionLifecycle;
  generationSession: EngineGenerationSessionAdapter;
  lifecycle: EngineLifecycleAdapter;
  notes: EngineNoteService;
  notices?: EngineNoticeService;
  logs?: EngineLogService;
  feedback?: EngineFeedbackService;
  random: EngineRandomService;
  rendering?: EngineRenderAdapter;
  climate?: ClimateRuntimeContext;
  profile?: string;
  timing: EngineTimingSettings;
  biomesData: EngineBiomeData;
};

export type EngineRuntimeServiceOverrides = Partial<
  Omit<
    EngineRuntimeContext,
    | "worldState"
    | "grid"
    | "pack"
    | "options"
    | "seed"
    | "worldSettings"
    | "generationSettings"
    | "biomesData"
  >
>;

export function getEngineWorldDimensions(context: EngineRuntimeContext): {
  graphWidth: number;
  graphHeight: number;
} {
  return {
    graphWidth: context.worldSettings.graphWidth ?? 0,
    graphHeight: context.worldSettings.graphHeight ?? 0,
  };
}

export function createEngineRuntimeContext(
  state: EngineWorldState,
  services: EngineRuntimeServiceOverrides = {},
): EngineRuntimeContext {
  const feedback = services.feedback ?? createGlobalFeedbackService();
  const context = {
    worldState: state,
    grid: state.grid,
    pack: state.pack,
    options: state.options,
    seed: state.seed,
    worldSettings: state.worldSettings,
    worldSettingsStore: undefined as never,
    generationSettings: state.generationSettings,
    generationSettingsStore: undefined as never,
    generationStatistics: services.generationStatistics,
    populationSettings:
      services.populationSettings ?? createGlobalPopulationSettings(),
    naming: services.naming ?? undefined,
    burgs: undefined as never,
    routes: undefined as never,
    states: undefined as never,
    units: services.units ?? createGlobalUnitSettings(),
    heraldry: services.heraldry ?? undefined,
    mapStore: undefined as never,
    mapGraphLifecycle: services.mapGraphLifecycle,
    mapPlacement: services.mapPlacement,
    waterFeatures: services.waterFeatures,
    seedSession: undefined as never,
    graphSession: undefined as never,
    optionsSession: undefined as never,
    gridSession: undefined as never,
    sessionLifecycle:
      services.sessionLifecycle ?? createGlobalGenerationSessionLifecycle(),
    generationSession: undefined as never,
    lifecycle: undefined as never,
    notes: services.notes ?? createRuntimeNoteService(getBrowserNotes()),
    notices: services.notices ?? createGlobalNoticeService(),
    logs: services.logs ?? createGlobalLogService(),
    feedback,
    random: services.random ?? createGlobalRandomService(),
    rendering: services.rendering ?? undefined,
    climate: services.climate ?? createGlobalClimateContext(),
    profile: services.profile,
    timing: services.timing ?? createGlobalTimingSettings(),
    biomesData: state.biomesData,
  } as EngineRuntimeContext;
  context.lifecycle =
    services.lifecycle ?? createGlobalLifecycleAdapter(() => context);
  context.naming = services.naming ?? createRuntimeNamingService(context);
  context.heraldry = services.heraldry ?? createRuntimeHeraldryService(context);
  context.burgs = services.burgs ?? createRuntimeBurgService(context);
  context.routes = services.routes ?? createRuntimeRouteService(context);
  context.states = services.states ?? createRuntimeStateService(context);
  context.mapStore =
    services.mapStore ?? createRuntimeMapStore(context, () => context);
  context.mapGraphLifecycle =
    services.mapGraphLifecycle ??
    createRuntimeMapGraphLifecycleService(context);
  context.mapPlacement =
    services.mapPlacement ?? createRuntimeMapPlacementService(context);
  context.waterFeatures =
    services.waterFeatures ?? createGlobalWaterFeatureService();
  context.worldSettingsStore =
    services.worldSettingsStore ?? createRuntimeWorldSettingsStore(context);
  context.generationSettingsStore =
    services.generationSettingsStore ??
    createRuntimeGenerationSettingsStore(context);
  context.generationStatistics =
    services.generationStatistics ??
    createRuntimeGenerationStatisticsService(context);
  context.rendering =
    services.rendering ??
    createRuntimeRenderAdapter(context, createGlobalRenderAdapter());
  context.seedSession =
    services.seedSession ?? createRuntimeSeedSession(context);
  context.graphSession =
    services.graphSession ?? createRuntimeGraphSession(context);
  context.gridSession =
    services.gridSession ?? createRuntimeGridSessionService(context);
  context.optionsSession =
    services.optionsSession ?? createRuntimeOptionsSession(context);
  context.generationSession =
    services.generationSession ??
    createRuntimeGenerationSessionAdapter(context);
  return context;
}

export function createBrowserEngineRuntimeContext(): EngineRuntimeContext {
  return createEngineRuntimeContext(createBrowserEngineWorldState());
}

function getBrowserNotes() {
  try {
    return globalThis.notes ?? [];
  } catch {
    return [];
  }
}

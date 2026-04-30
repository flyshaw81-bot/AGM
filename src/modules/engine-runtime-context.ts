import type { PackedGraph } from "../types/PackedGraph";
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
  createGlobalGenerationSettings,
  createRuntimeGenerationSettingsStore,
  type EngineGenerationSettings,
  type EngineGenerationSettingsStore,
} from "./engine-generation-settings";
import {
  createGlobalGenerationStatisticsService,
  type EngineGenerationStatisticsService,
} from "./engine-generation-statistics-service";
import {
  createRuntimeGraphSession,
  type EngineGraphSessionModule as EngineGraphSessionService,
} from "./engine-graph-session";
import {
  createGlobalHeraldryService,
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
  createGlobalMapGraphLifecycleService,
  type EngineMapGraphLifecycleService,
} from "./engine-map-graph-lifecycle-service";
import {
  createGlobalMapPlacementService,
  type EngineMapPlacementService,
} from "./engine-map-placement-service";
import { createRuntimeMapStore, type EngineMapStore } from "./engine-map-store";
import {
  createGlobalNamingService,
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
  createGlobalWorldSettings,
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
  createGlobalStateService,
  type EngineStateService,
} from "./engine-state-service";
import {
  createGlobalWaterFeatureService,
  type EngineWaterFeatureService,
} from "./engine-water-feature-service";

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

export type EngineBiomeData = {
  i: number[];
  name: string[];
  color: string[];
  biomesMatrix: Uint8Array[];
  habitability: number[];
  iconsDensity: number[];
  icons: string[][];
  cost: number[];
};

export type EngineRuntimeContext = {
  grid: typeof grid;
  pack: PackedGraph;
  options: typeof options;
  seed: typeof seed;
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

export function getGlobalEngineRuntimeContext(): EngineRuntimeContext {
  const feedback = createGlobalFeedbackService();
  const context = {
    grid,
    pack,
    options,
    seed,
    worldSettings: createGlobalWorldSettings(),
    worldSettingsStore: undefined as never,
    generationSettings: createGlobalGenerationSettings(),
    generationSettingsStore: undefined as never,
    generationStatistics: undefined,
    populationSettings: createGlobalPopulationSettings(),
    naming: createGlobalNamingService(),
    burgs: undefined as never,
    routes: undefined as never,
    states: createGlobalStateService(),
    units: createGlobalUnitSettings(),
    heraldry: createGlobalHeraldryService(),
    mapStore: undefined as never,
    mapGraphLifecycle: undefined,
    mapPlacement: undefined,
    waterFeatures: undefined,
    seedSession: undefined as never,
    graphSession: undefined as never,
    optionsSession: undefined as never,
    gridSession: undefined as never,
    sessionLifecycle: createGlobalGenerationSessionLifecycle(),
    generationSession: undefined as never,
    lifecycle: createGlobalLifecycleAdapter(getGlobalEngineRuntimeContext),
    notes: createRuntimeNoteService(notes),
    notices: createGlobalNoticeService(),
    logs: createGlobalLogService(),
    feedback,
    random: createGlobalRandomService(),
    rendering: createGlobalRenderAdapter(),
    climate: createGlobalClimateContext(),
    timing: createGlobalTimingSettings(),
    biomesData,
  } as EngineRuntimeContext;
  context.burgs = createRuntimeBurgService(context);
  context.routes = createRuntimeRouteService(context);
  context.mapStore = createRuntimeMapStore(context, () => context);
  context.mapGraphLifecycle = createGlobalMapGraphLifecycleService();
  context.mapPlacement = createGlobalMapPlacementService();
  context.waterFeatures = createGlobalWaterFeatureService();
  context.worldSettingsStore = createRuntimeWorldSettingsStore(context);
  context.generationSettingsStore =
    createRuntimeGenerationSettingsStore(context);
  context.generationStatistics = createGlobalGenerationStatisticsService();
  context.seedSession = createRuntimeSeedSession(context);
  context.graphSession = createRuntimeGraphSession(context);
  context.gridSession = createRuntimeGridSessionService(context);
  context.optionsSession = createRuntimeOptionsSession(context);
  context.generationSession = createRuntimeGenerationSessionAdapter(context);
  return context;
}

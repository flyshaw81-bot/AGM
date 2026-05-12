import { rn } from "../utils/numberUtils";
import type { ClimateRuntimeContext } from "./climate";
import type { EngineGenerationSessionRequest } from "./engine-generation-session-services";
import { setActiveEngineRuntimeContext } from "./engine-runtime-active-context";
import {
  createBrowserEngineRuntimeContext,
  type EngineRuntimeContext,
} from "./engine-runtime-context";

declare global {
  var EngineGenerationPipeline: EngineGenerationPipelineModule;
  var generate: (
    request?: EngineGenerationRequest,
  ) => Promise<EngineRuntimeContext | undefined>;
}

function getWindow(): (Window & typeof globalThis) | undefined {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
}

function now() {
  return globalThis.performance?.now?.() ?? Date.now();
}

function getRuntimeInfoFlag(context: EngineRuntimeContext): boolean {
  return Boolean(context.worldState?.runtimeFlags.shouldLogInfo);
}

function getRuntimeWarningFlag(context: EngineRuntimeContext): boolean {
  return Boolean(context.worldState?.runtimeFlags.shouldLogWarnings);
}

function createNoopPrecipitationLayer(): typeof prec {
  return {
    selectAll: () => ({ remove: () => {} }),
  } as unknown as typeof prec;
}

export type EngineGenerationRequest = EngineGenerationSessionRequest;

export class EngineGenerationPipelineModule {
  constructor(
    private readonly resolveCurrentContext: () => EngineRuntimeContext = createBrowserEngineRuntimeContext,
  ) {}

  getCurrentContext() {
    return this.resolveCurrentContext();
  }

  private getClimateContext(
    context: EngineRuntimeContext,
  ): ClimateRuntimeContext {
    const generationSettings =
      context.generationSettingsStore?.get() ?? context.generationSettings;
    const worldSettings =
      context.worldSettingsStore?.get() ?? context.worldSettings;
    const climateContext = {
      grid: context.grid,
      coordinates: (worldSettings.mapCoordinates ??
        context.climate?.coordinates ??
        {}) as ClimateRuntimeContext["coordinates"],
      graphWidth: worldSettings.graphWidth ?? context.climate?.graphWidth ?? 0,
      graphHeight:
        worldSettings.graphHeight ?? context.climate?.graphHeight ?? 0,
      options: context.options,
      heightExponent: generationSettings.heightExponent,
      pointsCount: generationSettings.pointsCount,
      precipitationPercent: context.climate?.precipitationPercent ?? 100,
      precipitationLayer:
        context.climate?.precipitationLayer ?? createNoopPrecipitationLayer(),
      debugTemperature: context.climate?.debugTemperature ?? false,
      shouldTime: context.timing.shouldTime,
    };

    if (context.climate) {
      Object.assign(context.climate, climateContext);
      return context.climate;
    }

    return climateContext;
  }

  async generateHeightmap(context: EngineRuntimeContext) {
    context.grid.cells.h = await HeightmapGenerator.generate(
      context.grid,
      context,
    );
    return context.grid.cells.h;
  }

  async generateWorld(context: EngineRuntimeContext) {
    await this.generateHeightmap(context);
    context.mapStore.resetPackForGeneration();

    let generationContext = context.mapStore.getCurrentContext();
    this.prepareGridSurface(generationContext);
    generationContext = this.prepareMapPlacement(generationContext);
    this.preparePackGraph(generationContext);
    this.generateTerrainFeatures(generationContext);
    this.generateWorldEntities(generationContext);

    return generationContext;
  }

  prepareGenerationSession(
    request: EngineGenerationRequest = {},
    context: EngineRuntimeContext = this.getCurrentContext(),
  ) {
    context.generationSession.prepare(request);
    return context.mapStore.getCurrentContext();
  }

  async generateFromRequest(
    request: EngineGenerationRequest = {},
    context?: EngineRuntimeContext,
  ) {
    const preparedContext = context
      ? this.prepareGenerationSession(request, context)
      : this.prepareGenerationSession(request);
    return this.generateWorld(preparedContext);
  }

  async runGenerationRequest(
    request: EngineGenerationRequest = {},
    context?: EngineRuntimeContext,
  ) {
    let activeContext = context;
    try {
      const timeStart = now();
      const generationSession = activeContext
        ? this.prepareGenerationSession(request, activeContext)
        : this.prepareGenerationSession(request);
      activeContext = generationSession;
      setActiveEngineRuntimeContext(generationSession);
      const label = `Generated Map ${generationSession.seed}`;
      if (getRuntimeInfoFlag(generationSession)) console.group(label);

      const generationContext = await this.generateWorld(generationSession);
      setActiveEngineRuntimeContext(generationContext);

      if (getRuntimeWarningFlag(generationContext)) {
        console.warn(`TOTAL: ${rn((now() - timeStart) / 1000, 2)}s`);
      }
      this.finalizeGeneration(generationContext);
      if (getRuntimeInfoFlag(generationContext)) console.groupEnd();
      return generationContext;
    } catch (error) {
      if (activeContext) this.handleGenerationError(error, activeContext);
      else this.handleGenerationError(error);
      return undefined;
    }
  }

  handleGenerationError(
    error: unknown,
    context: EngineRuntimeContext = this.getCurrentContext(),
  ) {
    context.logs?.error(String(error));
    context.notices?.showGenerationError(error);
  }

  markupGrid(context: EngineRuntimeContext) {
    return Features.markupGrid(context);
  }

  prepareGridSurface(context: EngineRuntimeContext) {
    this.markupGrid(context);
    context.lifecycle.addLakesInDeepDepressions(context);
    context.lifecycle.openNearSeaLakes(context);
    context.lifecycle.drawOceanLayers(context);
  }

  calculateClimate(context: EngineRuntimeContext) {
    const climateContext = this.getClimateContext(context);
    Climate.calculateTemperatures(climateContext);
    return Climate.generatePrecipitation(climateContext);
  }

  prepareMapPlacement(context: EngineRuntimeContext) {
    context.lifecycle.defineMapSize(context);
    const placedContext = context.mapStore.getCurrentContext();
    placedContext.lifecycle.calculateMapCoordinates(placedContext);
    this.calculateClimate(placedContext);
    return placedContext;
  }

  markupPack(context: EngineRuntimeContext) {
    return Features.markupPack(context);
  }

  preparePackGraph(context: EngineRuntimeContext) {
    context.lifecycle.rebuildGraph(context);
    this.markupPack(context);
    context.lifecycle.createDefaultRuler(context);
  }

  generateRivers(context: EngineRuntimeContext) {
    return Rivers.generate(context);
  }

  specifyRivers(context: EngineRuntimeContext) {
    return Rivers.specify(context);
  }

  defineLakeNames(context: EngineRuntimeContext) {
    return Lakes.defineNames(context);
  }

  defineBiomes(context: EngineRuntimeContext) {
    return Biomes.define(context);
  }

  defineFeatureGroups(context: EngineRuntimeContext) {
    return Features.defineGroups(context);
  }

  generateIce(context: EngineRuntimeContext) {
    return Ice.generate(context);
  }

  generateTerrainFeatures(context: EngineRuntimeContext) {
    this.generateRivers(context);
    this.defineBiomes(context);
    this.defineFeatureGroups(context);
    return this.generateIce(context);
  }

  generateCultures(context: EngineRuntimeContext) {
    Cultures.generate(context);
    return Cultures.expand(context);
  }

  rankCells(context: EngineRuntimeContext) {
    return CellRanking.rank(context);
  }

  generateBurgs(context: EngineRuntimeContext) {
    return Burgs.generate(context);
  }

  generateStates(context: EngineRuntimeContext) {
    return States.generate(context);
  }

  generateRoutes(context: EngineRuntimeContext) {
    return Routes.generate(context);
  }

  generateReligions(context: EngineRuntimeContext) {
    return Religions.generate(context);
  }

  defineStateForms(context: EngineRuntimeContext) {
    return States.defineStateForms(context);
  }

  generateProvinces(context: EngineRuntimeContext) {
    return Provinces.generate(context);
  }

  defineProvincePoles(context: EngineRuntimeContext) {
    return Provinces.getPoles(context);
  }

  generateZones(context: EngineRuntimeContext, globalModifier = 1) {
    return Zones.generate(context, globalModifier);
  }

  generateMilitary(context: EngineRuntimeContext) {
    return Military.generate(context);
  }

  generateMarkers(context: EngineRuntimeContext) {
    return Markers.generate(context);
  }

  specifyBurgs(context: EngineRuntimeContext) {
    return Burgs.specify(context);
  }

  generateWorldEntities(context: EngineRuntimeContext) {
    this.rankCells(context);
    this.generateCultures(context);
    this.generateBurgs(context);
    this.generateStates(context);
    this.generateRoutes(context);
    this.generateReligions(context);
    this.specifyBurgs(context);
    States.collectStatistics(context);
    this.defineStateForms(context);
    this.generateProvinces(context);
    this.defineProvincePoles(context);
    this.specifyRivers(context);
    this.defineLakeNames(context);
    this.generateMilitary(context);
    this.generateMarkers(context);
    return this.generateZones(context);
  }

  finalizeGeneration(context: EngineRuntimeContext) {
    context.rendering?.drawScaleBar();
    context.naming.getMapName?.();
    context.lifecycle.showStatistics(context);
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.EngineGenerationPipeline = new EngineGenerationPipelineModule();
  runtimeWindow.generate = (request?: EngineGenerationRequest) =>
    runtimeWindow.EngineGenerationPipeline.runGenerationRequest(request);
}

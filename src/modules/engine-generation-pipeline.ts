import type { ClimateRuntimeContext } from "./climate";
import type { EngineGenerationSessionRequest } from "./engine-generation-session-services";
import {
  type EngineRuntimeContext,
  getGlobalEngineRuntimeContext,
} from "./engine-runtime-context";

declare global {
  var EngineGenerationPipeline: EngineGenerationPipelineModule;
}

function getWindow(): (Window & typeof globalThis) | undefined {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
}

export type EngineGenerationRequest = EngineGenerationSessionRequest;

export class EngineGenerationPipelineModule {
  getCurrentContext() {
    return getGlobalEngineRuntimeContext();
  }

  private getClimateContext(
    context: EngineRuntimeContext,
  ): ClimateRuntimeContext {
    if (context.climate) return context.climate;

    return {
      grid: context.grid,
      coordinates: context.worldSettings
        .mapCoordinates as ClimateRuntimeContext["coordinates"],
      graphWidth: context.worldSettings.graphWidth ?? 0,
      graphHeight: context.worldSettings.graphHeight ?? 0,
      options: context.options,
      heightExponent: context.generationSettings.heightExponent,
      pointsCount: context.generationSettings.pointsCount,
      precipitationPercent: 100,
      precipitationLayer: prec,
      debugTemperature: false,
      shouldTime: context.timing.shouldTime,
    };
  }

  async generateHeightmap(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    context.grid.cells.h = await HeightmapGenerator.generate(
      context.grid,
      context,
    );
    return context.grid.cells.h;
  }

  async generateWorld(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
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

  prepareGenerationSession(request: EngineGenerationRequest = {}) {
    const context = this.getCurrentContext();
    context.generationSession.prepare(request);
    return context.mapStore.getCurrentContext();
  }

  async generateFromRequest(request: EngineGenerationRequest = {}) {
    const context = this.prepareGenerationSession(request);
    return this.generateWorld(context);
  }

  handleGenerationError(error: unknown) {
    const context = this.getCurrentContext();
    context.logs?.error(String(error));
    context.notices?.showGenerationError(error);
  }

  markupGrid(context: EngineRuntimeContext = getGlobalEngineRuntimeContext()) {
    return Features.markupGrid(context);
  }

  prepareGridSurface(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    this.markupGrid(context);
    context.lifecycle.addLakesInDeepDepressions(context);
    context.lifecycle.openNearSeaLakes(context);
    context.lifecycle.drawOceanLayers(context);
  }

  calculateClimate(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    const climateContext = this.getClimateContext(context);
    Climate.calculateTemperatures(climateContext);
    return Climate.generatePrecipitation(climateContext);
  }

  prepareMapPlacement(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    context.lifecycle.defineMapSize(context);
    const placedContext = context.mapStore.getCurrentContext();
    placedContext.lifecycle.calculateMapCoordinates(placedContext);
    this.calculateClimate(placedContext);
    return placedContext;
  }

  markupPack(context: EngineRuntimeContext = getGlobalEngineRuntimeContext()) {
    return Features.markupPack(context);
  }

  preparePackGraph(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    context.lifecycle.rebuildGraph(context);
    this.markupPack(context);
    context.lifecycle.createDefaultRuler(context);
  }

  generateRivers(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Rivers.generate(context);
  }

  specifyRivers(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Rivers.specify(context);
  }

  defineLakeNames(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Lakes.defineNames(context);
  }

  defineBiomes(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Biomes.define(context);
  }

  defineFeatureGroups(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Features.defineGroups(context);
  }

  generateIce(context: EngineRuntimeContext = getGlobalEngineRuntimeContext()) {
    return Ice.generate(context);
  }

  generateTerrainFeatures(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    this.generateRivers(context);
    this.defineBiomes(context);
    this.defineFeatureGroups(context);
    return this.generateIce(context);
  }

  generateCultures(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    Cultures.generate(context);
    return Cultures.expand(context);
  }

  rankCells(context: EngineRuntimeContext = getGlobalEngineRuntimeContext()) {
    return CellRanking.rank(context);
  }

  generateBurgs(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Burgs.generate(context);
  }

  generateStates(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return States.generate(context);
  }

  generateRoutes(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Routes.generate(context);
  }

  generateReligions(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Religions.generate(context);
  }

  defineStateForms(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return States.defineStateForms(context);
  }

  generateProvinces(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Provinces.generate(context);
  }

  defineProvincePoles(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Provinces.getPoles(context);
  }

  generateZones(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
    globalModifier = 1,
  ) {
    return Zones.generate(context, globalModifier);
  }

  generateMilitary(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Military.generate(context);
  }

  generateMarkers(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Markers.generate(context);
  }

  specifyBurgs(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    return Burgs.specify(context);
  }

  generateWorldEntities(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
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

  finalizeGeneration(
    context: EngineRuntimeContext = getGlobalEngineRuntimeContext(),
  ) {
    context.rendering?.drawScaleBar();
    context.naming.getMapName?.();
    context.lifecycle.showStatistics(context);
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.EngineGenerationPipeline = new EngineGenerationPipelineModule();
}

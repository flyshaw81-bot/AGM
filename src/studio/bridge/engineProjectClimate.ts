import {
  createGlobalProjectClimateTargets,
  type EngineProjectClimateTargets,
} from "./engineProjectClimateTargets";

export type EngineClimateApplyResult = "disabled" | "unavailable" | "applied";

export function applyEngineWorldClimateRedraw(
  targets: EngineProjectClimateTargets = createGlobalProjectClimateTargets(),
): EngineClimateApplyResult {
  if (!targets.shouldAutoApplyClimate()) return "disabled";

  if (!targets.canApplyClimatePipeline()) {
    return "unavailable";
  }

  targets.calculateTemperatures();
  targets.generatePrecipitation();
  const heights = targets.cloneHeights();
  if (!heights) return "unavailable";
  targets.generateRivers();
  targets.specifyRivers();
  targets.restoreHeights(heights);
  targets.defineBiomes();
  targets.defineFeatureGroups();
  targets.defineLakeNames();

  if (targets.isLayerOn("toggleTemperature")) targets.drawTemperature();
  if (targets.isLayerOn("togglePrecipitation")) targets.drawPrecipitation();
  if (targets.isLayerOn("toggleBiomes")) targets.drawBiomes();
  if (targets.isLayerOn("toggleCoordinates")) targets.drawCoordinates();
  if (targets.isLayerOn("toggleRivers")) targets.drawRivers();
  if (targets.hasCanvas3d())
    targets.schedule(() => targets.updateThreeD(), 500);

  return "applied";
}

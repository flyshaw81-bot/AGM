import {
  createGlobalProjectClimateTargets,
  type EngineProjectClimateTargets,
} from "./engineProjectClimateTargets";

export type EngineClimateApplyResult = "disabled" | "unavailable" | "applied";

export type EngineClimateRedrawOptions = {
  updateGlobePosition?: boolean;
  updateGlobeTemperature?: boolean;
};

export function applyEngineWorldClimateRedraw(
  options: EngineClimateRedrawOptions = {},
  targets: EngineProjectClimateTargets = createGlobalProjectClimateTargets(
    options,
  ),
): EngineClimateApplyResult {
  if (!targets.shouldAutoApplyClimate()) return "disabled";

  if (
    (options.updateGlobePosition && !targets.canUpdateGlobePosition()) ||
    !targets.canApplyClimatePipeline()
  ) {
    return "unavailable";
  }

  if (options.updateGlobeTemperature) targets.updateGlobeTemperature();
  if (options.updateGlobePosition) targets.updateGlobePosition();

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

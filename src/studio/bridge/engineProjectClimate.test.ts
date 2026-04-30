import { describe, expect, it, vi } from "vitest";
import { applyEngineWorldClimateRedraw } from "./engineProjectClimate";
import type { EngineProjectClimateTargets } from "./engineProjectClimateTargets";

function createTargets(
  overrides: Partial<EngineProjectClimateTargets> = {},
): EngineProjectClimateTargets {
  return {
    shouldAutoApplyClimate: vi.fn(() => true),
    canUpdateGlobePosition: vi.fn(() => true),
    canApplyClimatePipeline: vi.fn(() => true),
    updateGlobeTemperature: vi.fn(),
    updateGlobePosition: vi.fn(),
    calculateTemperatures: vi.fn(),
    generatePrecipitation: vi.fn(),
    cloneHeights: vi.fn(() => new Uint8Array([1, 2, 3])),
    generateRivers: vi.fn(),
    specifyRivers: vi.fn(),
    restoreHeights: vi.fn(),
    defineBiomes: vi.fn(),
    defineFeatureGroups: vi.fn(),
    defineLakeNames: vi.fn(),
    isLayerOn: vi.fn(() => false),
    drawTemperature: vi.fn(),
    drawPrecipitation: vi.fn(),
    drawBiomes: vi.fn(),
    drawCoordinates: vi.fn(),
    drawRivers: vi.fn(),
    hasCanvas3d: vi.fn(() => false),
    updateThreeD: vi.fn(),
    schedule: vi.fn(),
    ...overrides,
  };
}

describe("applyEngineWorldClimateRedraw", () => {
  it("skips climate redraw when auto apply is disabled", () => {
    const targets = createTargets({
      shouldAutoApplyClimate: vi.fn(() => false),
    });

    expect(applyEngineWorldClimateRedraw({}, targets)).toBe("disabled");
    expect(targets.canApplyClimatePipeline).not.toHaveBeenCalled();
    expect(targets.calculateTemperatures).not.toHaveBeenCalled();
  });

  it("reports unavailable when the required climate pipeline is missing", () => {
    const targets = createTargets({
      canApplyClimatePipeline: vi.fn(() => false),
    });

    expect(applyEngineWorldClimateRedraw({}, targets)).toBe("unavailable");
    expect(targets.calculateTemperatures).not.toHaveBeenCalled();
  });

  it("requires globe position support only when requested", () => {
    const targets = createTargets({
      canUpdateGlobePosition: vi.fn(() => false),
    });

    expect(
      applyEngineWorldClimateRedraw({ updateGlobePosition: true }, targets),
    ).toBe("unavailable");
    expect(targets.canApplyClimatePipeline).not.toHaveBeenCalled();
  });

  it("applies the climate pipeline, redraws active layers, and schedules 3D refresh", () => {
    const activeLayers = new Set([
      "toggleTemperature",
      "toggleBiomes",
      "toggleRivers",
    ]);
    const heights = new Uint8Array([7, 8, 9]);
    const targets = createTargets({
      cloneHeights: vi.fn(() => heights),
      isLayerOn: vi.fn((layer) => activeLayers.has(layer)),
      hasCanvas3d: vi.fn(() => true),
    });

    expect(
      applyEngineWorldClimateRedraw(
        { updateGlobePosition: true, updateGlobeTemperature: true },
        targets,
      ),
    ).toBe("applied");

    expect(targets.updateGlobeTemperature).toHaveBeenCalledWith();
    expect(targets.updateGlobePosition).toHaveBeenCalledWith();
    expect(targets.calculateTemperatures).toHaveBeenCalledWith();
    expect(targets.generatePrecipitation).toHaveBeenCalledWith();
    expect(targets.generateRivers).toHaveBeenCalledWith();
    expect(targets.specifyRivers).toHaveBeenCalledWith();
    expect(targets.restoreHeights).toHaveBeenCalledWith(heights);
    expect(targets.defineBiomes).toHaveBeenCalledWith();
    expect(targets.defineFeatureGroups).toHaveBeenCalledWith();
    expect(targets.defineLakeNames).toHaveBeenCalledWith();
    expect(targets.drawTemperature).toHaveBeenCalledWith();
    expect(targets.drawBiomes).toHaveBeenCalledWith();
    expect(targets.drawRivers).toHaveBeenCalledWith();
    expect(targets.drawPrecipitation).not.toHaveBeenCalled();
    expect(targets.drawCoordinates).not.toHaveBeenCalled();
    expect(targets.schedule).toHaveBeenCalledWith(expect.any(Function), 500);
  });
});

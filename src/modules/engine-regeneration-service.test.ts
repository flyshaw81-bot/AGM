import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createEngineRegenerationService,
  type EngineRegenerationTargets,
} from "./engine-regeneration-service";

function createTargets(
  overrides: Partial<EngineRegenerationTargets> = {},
): EngineRegenerationTargets {
  return {
    warn: vi.fn(),
    getCellsDesired: vi.fn(() => 12001),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    closeDialogs: vi.fn(),
    resetCustomization: vi.fn(),
    resetZoom: vi.fn(),
    undraw: vi.fn(),
    generate: vi.fn(async () => undefined),
    drawLayers: vi.fn(),
    isThreeDOn: vi.fn(() => true),
    redrawThreeD: vi.fn(),
    fitMapToScreen: vi.fn(),
    clearMainTip: vi.fn(),
    ...overrides,
  };
}

describe("engine regeneration service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("runs the V2 regeneration lifecycle through typed targets", async () => {
    const targets = createTargets();
    const service = createEngineRegenerationService(targets);
    const options = { reason: "test" };

    await service.regenerateMap(options);

    expect(targets.warn).toHaveBeenCalledWith("Generate new random map");
    expect(targets.showLoading).toHaveBeenCalledTimes(1);
    expect(targets.closeDialogs).toHaveBeenCalledWith();
    expect(targets.resetCustomization).toHaveBeenCalledTimes(1);
    expect(targets.resetZoom).toHaveBeenCalledWith(1000);
    expect(targets.undraw).toHaveBeenCalledTimes(1);
    expect(targets.generate).toHaveBeenCalledWith(options);
    expect(targets.drawLayers).toHaveBeenCalledTimes(1);
    expect(targets.redrawThreeD).toHaveBeenCalledTimes(1);
    expect(targets.fitMapToScreen).toHaveBeenCalledTimes(1);
    expect(targets.hideLoading).toHaveBeenCalledTimes(1);
    expect(targets.clearMainTip).toHaveBeenCalledTimes(1);
  });

  it("skips optional loading and editor redraw work when not needed", async () => {
    const targets = createTargets({
      getCellsDesired: vi.fn(() => 10000),
      isThreeDOn: vi.fn(() => false),
    });
    const service = createEngineRegenerationService(targets);

    await service.regenerateMap();

    expect(targets.showLoading).not.toHaveBeenCalled();
    expect(targets.hideLoading).not.toHaveBeenCalled();
    expect(targets.redrawThreeD).not.toHaveBeenCalled();
    expect(targets.clearMainTip).toHaveBeenCalledTimes(1);
  });
});

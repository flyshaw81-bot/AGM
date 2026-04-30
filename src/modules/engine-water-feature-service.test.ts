import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createGlobalWaterFeatureService,
  createGlobalWaterFeatureTargets,
  createWaterFeatureService,
} from "./engine-water-feature-service";

const originalAddLakesInDeepDepressions = globalThis.addLakesInDeepDepressions;
const originalOpenNearSeaLakes = globalThis.openNearSeaLakes;
const originalOceanLayers = globalThis.OceanLayers;

describe("EngineWaterFeatureService", () => {
  afterEach(() => {
    globalThis.addLakesInDeepDepressions = originalAddLakesInDeepDepressions;
    globalThis.openNearSeaLakes = originalOpenNearSeaLakes;
    globalThis.OceanLayers = originalOceanLayers;
  });

  it("routes water feature operations through injected targets", () => {
    const context = {} as EngineRuntimeContext;
    const targets = {
      addLakesInDeepDepressions: vi.fn(),
      openNearSeaLakes: vi.fn(),
      drawOceanLayers: vi.fn(),
    };
    const service = createWaterFeatureService(targets);

    service.addLakesInDeepDepressions(24);
    service.openNearSeaLakes("volcano");
    service.drawOceanLayers(context);

    expect(targets.addLakesInDeepDepressions).toHaveBeenCalledWith(24);
    expect(targets.openNearSeaLakes).toHaveBeenCalledWith("volcano");
    expect(targets.drawOceanLayers).toHaveBeenCalledWith(context);
  });

  it("keeps public water helpers behind global targets", () => {
    const context = {} as EngineRuntimeContext;
    globalThis.addLakesInDeepDepressions = vi.fn();
    globalThis.openNearSeaLakes = vi.fn();
    globalThis.OceanLayers = vi.fn();
    const targets = createGlobalWaterFeatureTargets();

    targets.addLakesInDeepDepressions(31);
    targets.openNearSeaLakes("archipelago");
    targets.drawOceanLayers(context);

    expect(globalThis.addLakesInDeepDepressions).toHaveBeenCalledWith(31);
    expect(globalThis.openNearSeaLakes).toHaveBeenCalledWith("archipelago");
    expect(globalThis.OceanLayers).toHaveBeenCalledWith(context);
  });

  it("creates a global water feature service from explicit targets", () => {
    const targets = {
      addLakesInDeepDepressions: vi.fn(),
      openNearSeaLakes: vi.fn(),
      drawOceanLayers: vi.fn(),
    };

    createGlobalWaterFeatureService(targets).openNearSeaLakes("peninsula");

    expect(targets.openNearSeaLakes).toHaveBeenCalledWith("peninsula");
  });
});

import { describe, expect, it } from "vitest";

import { createEngineRuntimeDefaultsService } from "./engine-runtime-defaults";

describe("EngineRuntimeDefaultsService", () => {
  it("mounts default runtime scalars", () => {
    const runtime: Record<string, unknown> = {};

    createEngineRuntimeDefaultsService().mountDefaults(runtime);

    expect(runtime.populationRate).toBe(1000);
    expect(runtime.distanceScale).toBe(3);
    expect(runtime.heightExponent).toBe(1.8);
    expect(runtime.temperatureScale).toBe("°C");
    expect(runtime.mapSizePercent).toBe(0);
    expect(runtime.latitudePercent).toBe(0);
    expect(runtime.longitudePercent).toBe(0);
  });

  it("does not overwrite values already owned by the runtime", () => {
    const runtime: Record<string, unknown> = {
      populationRate: 2500,
      temperatureScale: "°F",
      mapSizePercent: 72,
    };

    createEngineRuntimeDefaultsService().mountDefaults(runtime);

    expect(runtime.populationRate).toBe(2500);
    expect(runtime.temperatureScale).toBe("°F");
    expect(runtime.mapSizePercent).toBe(72);
    expect(runtime.distanceScale).toBe(3);
  });
});

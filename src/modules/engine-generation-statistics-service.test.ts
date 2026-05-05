import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGenerationStatisticsService,
  createGlobalGenerationStatisticsService,
  createGlobalGenerationStatisticsTargets,
} from "./engine-generation-statistics-service";

const originalShowStatistics = globalThis.showStatistics;
const originalShowStatisticsDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "showStatistics",
);

describe("EngineGenerationStatisticsService", () => {
  afterEach(() => {
    if (originalShowStatisticsDescriptor) {
      Object.defineProperty(
        globalThis,
        "showStatistics",
        originalShowStatisticsDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "showStatistics", {
        configurable: true,
        value: originalShowStatistics,
        writable: true,
      });
    }
  });

  it("routes statistics display through injected targets", () => {
    const targets = {
      showStatistics: vi.fn(),
    };
    const service = createGenerationStatisticsService(targets);

    service.showStatistics("archipelago");

    expect(targets.showStatistics).toHaveBeenCalledWith("archipelago");
  });

  it("keeps public statistics helper behind global targets", () => {
    globalThis.showStatistics = vi.fn();
    const targets = createGlobalGenerationStatisticsTargets();

    targets.showStatistics("volcano");

    expect(globalThis.showStatistics).toHaveBeenCalledWith("volcano");
  });

  it("keeps global statistics targets safe when public helpers are absent", () => {
    globalThis.showStatistics =
      undefined as unknown as typeof globalThis.showStatistics;
    const targets = createGlobalGenerationStatisticsTargets();

    expect(() => targets.showStatistics("volcano")).not.toThrow();
  });

  it("keeps global statistics targets safe when helper access throws", () => {
    Object.defineProperty(globalThis, "showStatistics", {
      configurable: true,
      get: () => {
        throw new Error("showStatistics blocked");
      },
    });
    const targets = createGlobalGenerationStatisticsTargets();

    expect(() => targets.showStatistics("volcano")).not.toThrow();
  });

  it("creates a global statistics service from explicit targets", () => {
    const targets = {
      showStatistics: vi.fn(),
    };

    createGlobalGenerationStatisticsService(targets).showStatistics("islands");

    expect(targets.showStatistics).toHaveBeenCalledWith("islands");
  });
});

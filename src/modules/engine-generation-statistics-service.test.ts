import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGenerationStatisticsService,
  createGlobalGenerationStatisticsService,
  createGlobalGenerationStatisticsTargets,
  showEngineGenerationStatistics,
} from "./engine-generation-statistics-service";
import {
  clearActiveEngineRuntimeContext,
  setActiveEngineRuntimeContext,
} from "./engine-runtime-active-context";
import type { EngineRuntimeContext } from "./engine-runtime-context";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalShowStatistics = globalThis.showStatistics;
const originalShowStatisticsDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "showStatistics",
);
const originalEngineGenerationStatisticsDescriptor =
  Object.getOwnPropertyDescriptor(globalThis, "EngineGenerationStatistics");
const originalMapIdDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "mapId",
);
const restoredGlobalDescriptors = [
  ["seed", Object.getOwnPropertyDescriptor(globalThis, "seed")],
  ["graphWidth", Object.getOwnPropertyDescriptor(globalThis, "graphWidth")],
  ["graphHeight", Object.getOwnPropertyDescriptor(globalThis, "graphHeight")],
  ["grid", Object.getOwnPropertyDescriptor(globalThis, "grid")],
  ["pack", Object.getOwnPropertyDescriptor(globalThis, "pack")],
  [
    "heightmapTemplates",
    Object.getOwnPropertyDescriptor(globalThis, "heightmapTemplates"),
  ],
  ["locked", Object.getOwnPropertyDescriptor(globalThis, "locked")],
  ["mapHistory", Object.getOwnPropertyDescriptor(globalThis, "mapHistory")],
  ["INFO", Object.getOwnPropertyDescriptor(globalThis, "INFO")],
  ["culturesSet", Object.getOwnPropertyDescriptor(globalThis, "culturesSet")],
  [
    "dispatchEvent",
    Object.getOwnPropertyDescriptor(globalThis, "dispatchEvent"),
  ],
] as const;

function restoreGlobalDescriptor(
  name: string,
  descriptor?: PropertyDescriptor,
) {
  if (descriptor) {
    Object.defineProperty(globalThis, name, descriptor);
    return;
  }

  delete (globalThis as Record<string, unknown>)[name];
}

describe("EngineGenerationStatisticsService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearActiveEngineRuntimeContext();
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as Record<string, unknown>).window;
    }
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
    restoreGlobalDescriptor(
      "EngineGenerationStatistics",
      originalEngineGenerationStatisticsDescriptor,
    );
    restoreGlobalDescriptor("mapId", originalMapIdDescriptor);
    for (const [name, descriptor] of restoredGlobalDescriptors) {
      restoreGlobalDescriptor(name, descriptor);
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

  it("creates generation statistics and publishes the generated map event", () => {
    const pushMapHistory = vi.fn();
    const logInfo = vi.fn();
    const dispatchGeneratedEvent = vi.fn();
    const setMapId = vi.fn();

    showEngineGenerationStatistics("archipelago", {
      getHeightmapTemplateId: vi.fn(),
      getHeightmapTemplates: () => ({ archipelago: {} }),
      isLocked: () => false,
      getSeed: () => "12345",
      getGraphSize: () => ({ width: 1440, height: 900 }),
      getGridPointCount: () => 100,
      getPackCount: (collection) =>
        ({
          cells: 80,
          states: 12,
          provinces: 18,
          burgs: 25,
          religions: 5,
          cultures: 7,
        })[collection],
      getMapSizePercent: () => "64",
      getCulturesSet: () => "fantasy",
      createMapId: () => 777,
      setMapId,
      pushMapHistory,
      logInfo,
      dispatchGeneratedEvent,
    });

    expect(setMapId).toHaveBeenCalledWith(777);
    expect(pushMapHistory).toHaveBeenCalledWith({
      seed: "12345",
      width: 1440,
      height: 900,
      template: "archipelago",
      created: 777,
    });
    expect(logInfo).toHaveBeenCalledWith(
      expect.stringContaining("Template: random template"),
    );
    expect(logInfo).toHaveBeenCalledWith(expect.stringContaining("States: 12"));
    expect(dispatchGeneratedEvent).toHaveBeenCalledWith({
      seed: "12345",
      mapId: 777,
    });
  });

  it("falls back to the template input when no template id is provided", () => {
    const pushMapHistory = vi.fn();

    showEngineGenerationStatistics(undefined, {
      getHeightmapTemplateId: () => "custom-template",
      getHeightmapTemplates: () => ({}),
      isLocked: () => true,
      getSeed: () => "seed",
      getGraphSize: () => ({ width: 100, height: 50 }),
      getGridPointCount: () => 1,
      getPackCount: () => 0,
      getMapSizePercent: () => "50",
      getCulturesSet: () => "default",
      createMapId: () => 5,
      setMapId: vi.fn(),
      pushMapHistory,
      logInfo: vi.fn(),
      dispatchGeneratedEvent: vi.fn(),
    });

    expect(pushMapHistory).toHaveBeenCalledWith(
      expect.objectContaining({ template: "custom-template" }),
    );
  });

  it("keeps global statistics targets behind the module implementation", () => {
    const originalDateNow = Date.now;
    Date.now = vi.fn(() => 888);
    globalThis.seed = "global-seed";
    globalThis.graphWidth = 1200;
    globalThis.graphHeight = 800;
    globalThis.grid = { points: [1, 2, 3] };
    globalThis.pack = {
      cells: { i: [1, 2] },
      states: [0, 1, 2],
      provinces: [0, 1],
      burgs: [0, 1, 2, 3],
      religions: [0, 1],
      cultures: [0, 1, 2],
    } as unknown as typeof globalThis.pack;
    globalThis.heightmapTemplates = { volcano: {} };
    globalThis.locked = vi.fn(() => true);
    globalThis.mapHistory = [];
    (globalThis as typeof globalThis & { INFO?: boolean }).INFO = false;
    globalThis.culturesSet = { value: "classic" } as HTMLSelectElement;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        dispatchEvent: vi.fn(),
      },
    });
    const targets = createGlobalGenerationStatisticsTargets();

    try {
      targets.showStatistics("volcano");
    } finally {
      Date.now = originalDateNow;
    }

    expect(globalThis.mapId).toBe(888);
    expect(globalThis.mapHistory).toEqual([
      {
        seed: "global-seed",
        width: 1200,
        height: 800,
        template: "volcano",
        created: 888,
      },
    ]);
  });

  it("prefers active context data for default statistics targets", () => {
    const originalDateNow = Date.now;
    Date.now = vi.fn(() => 999);
    globalThis.seed = "global-seed";
    globalThis.graphWidth = 1200;
    globalThis.graphHeight = 800;
    globalThis.grid = { points: [1] };
    globalThis.pack = {
      cells: { i: [1] },
      states: [0, 1],
      provinces: [0],
      burgs: [0],
      religions: [0],
      cultures: [0],
    } as unknown as typeof globalThis.pack;
    globalThis.heightmapTemplates = { volcano: {} };
    globalThis.locked = vi.fn(() => true);
    globalThis.mapHistory = [];
    (globalThis as typeof globalThis & { INFO?: boolean }).INFO = false;
    globalThis.culturesSet = { value: "classic" } as HTMLSelectElement;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        dispatchEvent: vi.fn(),
      },
    });
    setActiveEngineRuntimeContext({
      seed: "context-seed",
      worldSettings: {
        graphWidth: 1440,
        graphHeight: 900,
      },
      grid: { points: [1, 2, 3, 4] },
      pack: {
        cells: { i: [1, 2, 3] },
        states: [0, 1, 2, 3],
        provinces: [0, 1, 2],
        burgs: [0, 1],
        religions: [0, 1, 2],
        cultures: [0, 1],
      },
    } as unknown as EngineRuntimeContext);
    const targets = createGlobalGenerationStatisticsTargets();

    try {
      targets.showStatistics("volcano");
    } finally {
      Date.now = originalDateNow;
    }

    expect(globalThis.mapHistory).toEqual([
      expect.objectContaining({
        seed: "context-seed",
        width: 1440,
        height: 900,
        created: 999,
      }),
    ]);
  });

  it("creates a global statistics service from explicit targets", () => {
    const targets = {
      showStatistics: vi.fn(),
    };

    createGlobalGenerationStatisticsService(targets).showStatistics("islands");

    expect(targets.showStatistics).toHaveBeenCalledWith("islands");
  });

  it("mounts the legacy showStatistics compatibility entrypoint from the module", async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: globalThis,
    });
    globalThis.seed = "mounted-seed";
    globalThis.graphWidth = 1440;
    globalThis.graphHeight = 900;
    globalThis.grid = { points: [1] };
    globalThis.pack = {
      cells: { i: [1] },
      states: [0],
      provinces: [0],
      burgs: [0],
      religions: [0],
      cultures: [0],
    } as unknown as typeof globalThis.pack;
    globalThis.heightmapTemplates = {};
    globalThis.locked = vi.fn(() => true);
    globalThis.mapHistory = [];
    (globalThis as typeof globalThis & { INFO?: boolean }).INFO = false;
    globalThis.culturesSet = { value: "default" } as HTMLSelectElement;
    globalThis.dispatchEvent = vi.fn();
    restoreGlobalDescriptor("EngineGenerationStatistics", undefined);
    restoreGlobalDescriptor("showStatistics", undefined);
    restoreGlobalDescriptor("mapId", undefined);

    await import("./engine-generation-statistics-service");
    globalThis.showStatistics("custom");

    expect(globalThis.EngineGenerationStatistics).toBeDefined();
    expect(globalThis.mapHistory).toHaveLength(1);
    expect(globalThis.mapHistory[0].template).toBe("custom");
  });
});

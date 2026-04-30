import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineBurgService } from "../../modules/engine-burg-service";
import type { EngineRenderAdapter } from "../../modules/engine-render-adapter";
import type { EngineRouteService } from "../../modules/engine-route-service";
import type { EngineAutoFixPreviewChange } from "./engineActionTypes";
import type { EngineRouteWritebackTargets } from "./engineAutoFixRouteTargets";
import { applyEngineRoutePreviewChanges } from "./engineAutoFixRouteWriteback";
import { undoEngineAutoFixWriteback } from "./engineAutoFixUndo";
import type { EngineAutoFixUndoTargets } from "./engineAutoFixUndoTargets";

const originalPack = globalThis.pack;
const originalBiomesData = globalThis.biomesData;

function createRouteService(overrides: Partial<EngineRouteService>) {
  return {
    isCrossroad: vi.fn(() => false),
    isConnected: vi.fn(() => false),
    hasRoad: vi.fn(() => false),
    getRoute: vi.fn(),
    getConnectivityRate: vi.fn(() => 0),
    buildLinks: vi.fn(() => []),
    connect: vi.fn(),
    remove: vi.fn(),
    findById: vi.fn(),
    ...overrides,
  } as EngineRouteService;
}

function createBurgService(overrides: Partial<EngineBurgService>) {
  return {
    add: vi.fn(() => null),
    remove: vi.fn(),
    findById: vi.fn(),
    ...overrides,
  } as EngineBurgService;
}

function createRenderAdapter(overrides: Partial<EngineRenderAdapter>) {
  return {
    findCell: vi.fn(),
    addBurgCoa: vi.fn(),
    drawRoute: vi.fn(),
    isLayerOn: vi.fn(() => false),
    drawBurg: vi.fn(),
    removeBurg: vi.fn(),
    removeBurgCoa: vi.fn(),
    redrawIceberg: vi.fn(),
    redrawGlacier: vi.fn(),
    removeElementById: vi.fn(),
    drawScaleBar: vi.fn(),
    ...overrides,
  } as EngineRenderAdapter;
}

function createRouteTargets(overrides: Partial<EngineRouteWritebackTargets>) {
  return {
    resolveRouteCell: vi.fn(),
    getWritableProvince: vi.fn(),
    ...overrides,
  } as EngineRouteWritebackTargets;
}

function createUndoTargets(overrides: Partial<EngineAutoFixUndoTargets>) {
  return {
    getWritableProvince: vi.fn(),
    getWritableState: vi.fn(),
    getWritableBiomeData: vi.fn(),
    ...overrides,
  } as EngineAutoFixUndoTargets;
}

describe("engine autofix route commands", () => {
  afterEach(() => {
    globalThis.pack = originalPack;
    globalThis.biomesData = originalBiomesData;
  });

  it("connects route preview changes through injected route and render services", () => {
    const route = { i: 42 };
    const routes = createRouteService({
      connect: vi.fn(() => route),
    });
    const rendering = createRenderAdapter({
      isLayerOn: vi.fn(() => true),
      drawRoute: vi.fn(),
    });
    const province = { i: 4 } as Record<string, unknown>;
    const targets = createRouteTargets({
      resolveRouteCell: vi.fn(() => 10),
      getWritableProvince: vi.fn(() => province),
    });

    const change: EngineAutoFixPreviewChange = {
      id: "route:4:5",
      operation: "link",
      entity: "route",
      summary: "Connect provinces",
      refs: { provinces: [4, 5] },
      fields: { fromProvince: 4, toProvince: 5, connectorType: "road" },
    };

    const result = applyEngineRoutePreviewChanges(
      [change],
      routes,
      rendering,
      targets,
    );

    expect(targets.resolveRouteCell).toHaveBeenCalledWith(change);
    expect(routes.connect).toHaveBeenCalledWith(10);
    expect(result.createdRouteIds).toEqual([42]);
    expect(rendering.isLayerOn).toHaveBeenCalledWith("toggleRoutes");
    expect(rendering.drawRoute).toHaveBeenCalledWith(route);
    expect(targets.getWritableProvince).toHaveBeenCalledWith(4);
    expect(province.agmConnectorTarget).toBe(5);
    expect(province.agmConnectorType).toBe("road");
  });

  it("undoes created routes through the injected route service", () => {
    const route = { i: 7 };
    const routes = createRouteService({
      findById: vi.fn(() => route as any),
      remove: vi.fn(),
    });
    const burgs = createBurgService({
      remove: vi.fn(),
    });
    const province = {
      i: 4,
      agmConnectorTarget: 9,
      agmConnectorType: "road",
    } as Record<string, unknown>;
    const targets = createUndoTargets({
      getWritableProvince: vi.fn(() => province),
    });

    undoEngineAutoFixWriteback(
      {
        createdBurgIds: [],
        createdRouteIds: [7],
        updatedBiomes: [],
        updatedStates: [],
        updatedProvinces: [
          {
            provinceId: 4,
            previousAgmConnectorTarget: null,
            nextAgmConnectorTarget: 9,
            previousAgmConnectorType: null,
            nextAgmConnectorType: "road",
          },
        ],
      },
      routes,
      burgs,
      targets,
    );

    expect(targets.getWritableProvince).toHaveBeenCalledWith(4);
    expect(routes.findById).toHaveBeenCalledWith(7);
    expect(routes.remove).toHaveBeenCalledWith(route);
    expect(burgs.remove).not.toHaveBeenCalled();
    expect(province.agmConnectorTarget).toBeUndefined();
    expect(province.agmConnectorType).toBeUndefined();
  });

  it("undoes created burgs through the injected burg service", () => {
    const routes = createRouteService({});
    const burgs = createBurgService({
      remove: vi.fn(),
    });

    undoEngineAutoFixWriteback(
      {
        createdBurgIds: [4, 5],
        createdRouteIds: [],
        updatedBiomes: [],
        updatedStates: [],
        updatedProvinces: [],
      },
      routes,
      burgs,
      createUndoTargets({}),
    );

    expect(burgs.remove).toHaveBeenNthCalledWith(1, 5);
    expect(burgs.remove).toHaveBeenNthCalledWith(2, 4);
  });
});

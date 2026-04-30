import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineRouteService,
  createGlobalRouteService,
  createRuntimeRouteService,
} from "./engine-route-service";
import type { EngineRuntimeContext } from "./engine-runtime-context";

const originalRoutes = globalThis.Routes;
const originalPack = globalThis.pack;

describe("createGlobalRouteService", () => {
  afterEach(() => {
    globalThis.Routes = originalRoutes;
    globalThis.pack = originalPack;
  });

  it("forwards route calls to the current AGM Routes module mount", () => {
    const links = [1, 2, 3];
    const connected = { group: "roads" };
    const routeToRemove = { i: 3 };
    const packedRoute = { i: 8, group: "roads" };
    globalThis.Routes = {
      isCrossroad: vi.fn(() => true),
      isConnected: vi.fn(() => false),
      hasRoad: vi.fn(() => true),
      getRoute: vi.fn(() => ({ group: "trail" })),
      getConnectivityRate: vi.fn(() => 0.75),
      buildLinks: vi.fn(() => links),
      connect: vi.fn(() => connected),
      remove: vi.fn(),
    };
    globalThis.pack = {
      routes: [packedRoute],
    } as typeof pack;

    const routes = createGlobalRouteService();

    expect(routes.isCrossroad(10)).toBe(true);
    expect(routes.isConnected(11)).toBe(false);
    expect(routes.hasRoad(12)).toBe(true);
    expect(routes.getRoute(1, 2)).toEqual({ group: "trail" });
    expect(routes.getConnectivityRate(13)).toBe(0.75);
    expect(routes.buildLinks([] as any)).toBe(links);
    expect(routes.connect(14)).toBe(connected);
    routes.remove(routeToRemove);
    expect(routes.findById(8)).toBe(packedRoute);
    expect(routes.findById(99)).toBeUndefined();

    expect(Routes.isCrossroad).toHaveBeenCalledWith(10, undefined);
    expect(Routes.isConnected).toHaveBeenCalledWith(11, undefined);
    expect(Routes.hasRoad).toHaveBeenCalledWith(12, undefined);
    expect(Routes.getRoute).toHaveBeenCalledWith(1, 2, undefined);
    expect(Routes.getConnectivityRate).toHaveBeenCalledWith(13, undefined);
    expect(Routes.buildLinks).toHaveBeenCalledWith([]);
    expect(Routes.connect).toHaveBeenCalledWith(14, undefined);
    expect(Routes.remove).toHaveBeenCalledWith(routeToRemove);
  });

  it("composes route service from injected runtime targets", () => {
    const packedRoute = { i: 4, group: "roads" };
    const links = { 4: { 5: 1 } };
    const routesModule = {
      isCrossroad: vi.fn(() => true),
      isConnected: vi.fn(() => true),
      hasRoad: vi.fn(() => false),
      getRoute: vi.fn(() => ({ group: "roads" })),
      getConnectivityRate: vi.fn(() => 0.5),
      buildLinks: vi.fn(() => links),
      connect: vi.fn(() => ({ group: "roads" })),
      remove: vi.fn(),
    };
    const routes = createEngineRouteService({
      getRoutesModule: () => routesModule,
      getPackedRoutes: () => [packedRoute] as any,
    });

    expect(routes.isCrossroad(1)).toBe(true);
    expect(routes.isConnected(2)).toBe(true);
    expect(routes.hasRoad(3)).toBe(false);
    expect(routes.getRoute(1, 2)).toEqual({ group: "roads" });
    expect(routes.getConnectivityRate(5)).toBe(0.5);
    expect(routes.buildLinks([] as any)).toBe(links);
    expect(routes.connect(6)).toEqual({ group: "roads" });
    routes.remove(packedRoute);
    expect(routes.findById(4)).toBe(packedRoute);

    expect(routesModule.isCrossroad).toHaveBeenCalledWith(1, undefined);
    expect(routesModule.isConnected).toHaveBeenCalledWith(2, undefined);
    expect(routesModule.hasRoad).toHaveBeenCalledWith(3, undefined);
    expect(routesModule.getRoute).toHaveBeenCalledWith(1, 2, undefined);
    expect(routesModule.getConnectivityRate).toHaveBeenCalledWith(5, undefined);
    expect(routesModule.connect).toHaveBeenCalledWith(6, undefined);
    expect(routesModule.remove).toHaveBeenCalledWith(packedRoute);
  });

  it("reads runtime routes from context pack instead of global pack", () => {
    const runtimeRoute = { i: 12, group: "runtime-roads" };
    const globalRoute = { i: 12, group: "global-roads" };
    globalThis.pack = {
      routes: [globalRoute],
    } as typeof pack;
    const routesModule = {
      hasRoad: vi.fn(() => true),
      remove: vi.fn(),
    };
    const context = {
      pack: {
        routes: [runtimeRoute],
      },
    } as unknown as EngineRuntimeContext;

    const routes = createRuntimeRouteService(context, routesModule);

    expect(routes.findById(12)).toBe(runtimeRoute);
    expect(routes.findById(12)).not.toBe(globalRoute);
    expect(routes.hasRoad(4)).toBe(true);
    routes.remove(runtimeRoute);
    expect(routesModule.hasRoad).toHaveBeenCalledWith(4, context);
    expect(routesModule.remove).toHaveBeenCalledWith(runtimeRoute);
  });
});

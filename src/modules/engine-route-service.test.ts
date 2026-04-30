import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalRouteService } from "./engine-route-service";

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

    expect(Routes.isCrossroad).toHaveBeenCalledWith(10);
    expect(Routes.isConnected).toHaveBeenCalledWith(11);
    expect(Routes.hasRoad).toHaveBeenCalledWith(12);
    expect(Routes.getRoute).toHaveBeenCalledWith(1, 2);
    expect(Routes.getConnectivityRate).toHaveBeenCalledWith(13);
    expect(Routes.buildLinks).toHaveBeenCalledWith([]);
    expect(Routes.connect).toHaveBeenCalledWith(14);
    expect(Routes.remove).toHaveBeenCalledWith(routeToRemove);
  });
});

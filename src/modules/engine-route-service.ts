import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";

type EngineRouteModule = {
  isCrossroad?: (cell: number) => boolean;
  isConnected?: (cell: number) => boolean;
  hasRoad?: (cell: number) => boolean;
  getRoute?: (from: number, to: number) => { group?: string } | undefined;
  getConnectivityRate?: (cell: number) => number;
  buildLinks?: (
    routes: PackedGraph["routes"],
  ) => PackedGraph["cells"]["routes"];
  connect?: (cell: number) => any;
  remove?: (route: any) => void;
};

export type EngineRouteServiceTargets = {
  getRoutesModule: () => EngineRouteModule | undefined;
  getPackedRoutes: () => PackedGraph["routes"] | undefined;
};

export type EngineRouteService = {
  isCrossroad: (cell: number) => boolean;
  isConnected: (cell: number) => boolean;
  hasRoad: (cell: number) => boolean;
  getRoute: (from: number, to: number) => { group?: string } | undefined;
  getConnectivityRate: (cell: number) => number;
  buildLinks: (routes: PackedGraph["routes"]) => PackedGraph["cells"]["routes"];
  connect: (cell: number) => any;
  remove: (route: unknown) => void;
  findById: (routeId: number) => PackedGraph["routes"][number] | undefined;
};

export function createEngineRouteService(
  targets: EngineRouteServiceTargets,
): EngineRouteService {
  return {
    isCrossroad: (cell) =>
      targets.getRoutesModule()?.isCrossroad?.(cell) ?? false,
    isConnected: (cell) =>
      targets.getRoutesModule()?.isConnected?.(cell) ?? false,
    hasRoad: (cell) => targets.getRoutesModule()?.hasRoad?.(cell) ?? false,
    getRoute: (from, to) => targets.getRoutesModule()?.getRoute?.(from, to),
    getConnectivityRate: (cell) =>
      targets.getRoutesModule()?.getConnectivityRate?.(cell) ?? 0,
    buildLinks: (routes) =>
      targets.getRoutesModule()?.buildLinks?.(routes) ?? [],
    connect: (cell) => targets.getRoutesModule()?.connect?.(cell),
    remove: (route) => {
      targets.getRoutesModule()?.remove?.(route as any);
    },
    findById: (routeId) =>
      targets.getPackedRoutes()?.find((route) => route?.i === routeId),
  };
}

export function createGlobalRouteService(): EngineRouteService {
  return createEngineRouteService({
    getRoutesModule: () => globalThis.Routes,
    getPackedRoutes: () => globalThis.pack?.routes,
  });
}

export function createRuntimeRouteService(
  context: EngineRuntimeContext,
  routesModule: EngineRouteModule | undefined = globalThis.Routes,
): EngineRouteService {
  return createEngineRouteService({
    getRoutesModule: () => routesModule,
    getPackedRoutes: () => context.pack.routes,
  });
}

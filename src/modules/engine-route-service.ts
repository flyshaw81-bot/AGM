import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";

type EngineRouteModule = {
  isCrossroad?: (cell: number, context?: EngineRuntimeContext) => boolean;
  isConnected?: (cell: number, context?: EngineRuntimeContext) => boolean;
  hasRoad?: (cell: number, context?: EngineRuntimeContext) => boolean;
  getRoute?: (
    from: number,
    to: number,
    context?: EngineRuntimeContext,
  ) => { group?: string } | null | undefined;
  getConnectivityRate?: (
    cell: number,
    context?: EngineRuntimeContext,
  ) => number;
  buildLinks?: (
    routes: PackedGraph["routes"],
  ) => PackedGraph["cells"]["routes"];
  connect?: (cell: number, context?: EngineRuntimeContext) => any;
  remove?: (route: any) => void;
  getLength?: (routeId: number) => number;
};

export type EngineRouteServiceTargets = {
  getRoutesModule: () => EngineRouteModule | undefined;
  getPackedRoutes: () => PackedGraph["routes"] | undefined;
  getRouteContext?: () => EngineRuntimeContext | undefined;
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
  getLength: (routeId: number) => number;
  findById: (routeId: number) => PackedGraph["routes"][number] | undefined;
};

export function createEngineRouteService(
  targets: EngineRouteServiceTargets,
): EngineRouteService {
  return {
    isCrossroad: (cell) =>
      targets
        .getRoutesModule()
        ?.isCrossroad?.(cell, targets.getRouteContext?.()) ?? false,
    isConnected: (cell) =>
      targets
        .getRoutesModule()
        ?.isConnected?.(cell, targets.getRouteContext?.()) ?? false,
    hasRoad: (cell) =>
      targets.getRoutesModule()?.hasRoad?.(cell, targets.getRouteContext?.()) ??
      false,
    getRoute: (from, to) =>
      targets
        .getRoutesModule()
        ?.getRoute?.(from, to, targets.getRouteContext?.()) ?? undefined,
    getConnectivityRate: (cell) =>
      targets
        .getRoutesModule()
        ?.getConnectivityRate?.(cell, targets.getRouteContext?.()) ?? 0,
    buildLinks: (routes) =>
      targets.getRoutesModule()?.buildLinks?.(routes) ?? [],
    connect: (cell) =>
      targets.getRoutesModule()?.connect?.(cell, targets.getRouteContext?.()),
    remove: (route) => {
      targets.getRoutesModule()?.remove?.(route as any);
    },
    getLength: (routeId) =>
      targets.getRoutesModule()?.getLength?.(routeId) ?? 0,
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
    getRouteContext: () => context,
  });
}

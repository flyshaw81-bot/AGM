import type { PackedGraph } from "../types/PackedGraph";

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

export function createGlobalRouteService(): EngineRouteService {
  return {
    isCrossroad: (cell) => globalThis.Routes?.isCrossroad?.(cell) ?? false,
    isConnected: (cell) => globalThis.Routes?.isConnected?.(cell) ?? false,
    hasRoad: (cell) => globalThis.Routes?.hasRoad?.(cell) ?? false,
    getRoute: (from, to) => globalThis.Routes?.getRoute?.(from, to),
    getConnectivityRate: (cell) =>
      globalThis.Routes?.getConnectivityRate?.(cell) ?? 0,
    buildLinks: (routes) => globalThis.Routes?.buildLinks?.(routes) ?? [],
    connect: (cell) => globalThis.Routes?.connect?.(cell),
    remove: (route) => {
      globalThis.Routes?.remove?.(route as any);
    },
    findById: (routeId) =>
      globalThis.pack?.routes?.find((route) => route?.i === routeId),
  };
}

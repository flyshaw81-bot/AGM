import type { PackedGraph } from "../types/PackedGraph";

export type EngineRenderAdapter = {
  findCell: (
    x: number,
    y: number,
    radius?: number,
    graph?: PackedGraph,
  ) => number | undefined;
  addBurgCoa: (burgId: number, coa: unknown, x: number, y: number) => void;
  drawRoute: (route: unknown) => void;
  isLayerOn: (layer: string) => boolean;
  drawBurg: (burg: unknown) => void;
  removeBurg: (burgId: number) => void;
  removeBurgCoa: (burgId: number) => void;
  redrawIceberg: (iceId: number) => void;
  redrawGlacier: (iceId: number) => void;
  removeElementById: (id: string) => void;
  drawScaleBar: () => void;
  drawHeightmap?: () => void;
  drawBiomes?: () => void;
  drawCells?: () => void;
  invokeActiveZooming?: () => void;
};

export type EngineRenderTargets = {
  findCell: (
    x: number,
    y: number,
    radius: number | undefined,
    graph: { cells: { p: [number, number][] } },
  ) => number | undefined;
  getPack: () => PackedGraph;
  addCoa: (type: "burg", id: number, coa: any, x: number, y: number) => void;
  drawRoute: (route: unknown) => void;
  isLayerOn: (layer: string) => boolean;
  drawBurgIcon: (burg: any) => void;
  drawBurgLabel: (burg: any) => void;
  removeBurgIcon: (burgId: number) => void;
  removeBurgLabel: (burgId: number) => void;
  getElementById: (id: string) => HTMLElement | SVGElement | null;
  removeBurgEmblemUse: (burgId: number) => void;
  redrawIceberg: (iceId: number) => void;
  redrawGlacier: (iceId: number) => void;
  selectScaleBar: () => unknown;
  getScale: () => number;
  drawScaleBar: (scaleBar: unknown, scale: number) => void;
  drawHeightmap?: () => void;
  drawBiomes?: () => void;
  drawCells?: () => void;
  invokeActiveZooming?: () => void;
};

export function createEngineRenderAdapter(
  targets: EngineRenderTargets,
): EngineRenderAdapter {
  return {
    findCell: (x, y, radius, graph) =>
      targets.findCell(x, y, radius, graph ?? targets.getPack()),
    addBurgCoa: (burgId, coa, x, y) => {
      targets.addCoa("burg", burgId, coa as any, x, y);
    },
    drawRoute: (route) => {
      targets.drawRoute(route);
    },
    isLayerOn: (layer) => targets.isLayerOn(layer),
    drawBurg: (burg) => {
      targets.drawBurgIcon(burg as any);
      targets.drawBurgLabel(burg as any);
    },
    removeBurg: (burgId) => {
      targets.removeBurgIcon(burgId);
      targets.removeBurgLabel(burgId);
    },
    removeBurgCoa: (burgId) => {
      targets.getElementById(`burgCOA${burgId}`)?.remove();
      targets.removeBurgEmblemUse(burgId);
    },
    redrawIceberg: (iceId) => {
      targets.redrawIceberg(iceId);
    },
    redrawGlacier: (iceId) => {
      targets.redrawGlacier(iceId);
    },
    removeElementById: (id) => {
      targets.getElementById(id)?.remove();
    },
    drawScaleBar: () => {
      targets.drawScaleBar(targets.selectScaleBar(), targets.getScale());
    },
    drawHeightmap: () => {
      targets.drawHeightmap?.();
    },
    drawBiomes: () => {
      targets.drawBiomes?.();
    },
    drawCells: () => {
      targets.drawCells?.();
    },
    invokeActiveZooming: () => {
      targets.invokeActiveZooming?.();
    },
  };
}

export function createGlobalRenderAdapter(): EngineRenderAdapter {
  return createEngineRenderAdapter({
    findCell: (x, y, radius, graph) => window.findCell(x, y, radius, graph),
    getPack: () => pack,
    addCoa: (type, id, coa, x, y) => {
      COArenderer.add(type, id, coa, x, y);
    },
    drawRoute: (route) => {
      drawRoute(route);
    },
    isLayerOn: (layer) => layerIsOn(layer),
    drawBurgIcon: (burg) => {
      drawBurgIcon(burg);
    },
    drawBurgLabel: (burg) => {
      drawBurgLabel(burg);
    },
    removeBurgIcon: (burgId) => {
      removeBurgIcon(burgId);
    },
    removeBurgLabel: (burgId) => {
      removeBurgLabel(burgId);
    },
    getElementById: (id) => document.getElementById(id),
    removeBurgEmblemUse: (burgId) => {
      emblems.select(`#burgEmblems > use[data-i='${burgId}']`).remove();
    },
    redrawIceberg: (iceId) => {
      redrawIceberg(iceId);
    },
    redrawGlacier: (iceId) => {
      redrawGlacier(iceId);
    },
    selectScaleBar: () => svg.select("#scaleBar"),
    getScale: () => scale,
    drawScaleBar: (scaleBar, scale) => {
      drawScaleBar(scaleBar as any, scale);
    },
    drawHeightmap: () => {
      drawHeightmap();
    },
    drawBiomes: () => {
      (globalThis as any).drawBiomes?.();
    },
    drawCells: () => {
      (globalThis as any).drawCells?.();
    },
    invokeActiveZooming: () => {
      invokeActiveZooming();
    },
  });
}

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
};

export function createGlobalRenderAdapter(): EngineRenderAdapter {
  return {
    findCell: (x, y, radius, graph) =>
      window.findCell(x, y, radius, graph ?? pack),
    addBurgCoa: (burgId, coa, x, y) => {
      COArenderer.add("burg", burgId, coa as any, x, y);
    },
    drawRoute: (route) => {
      drawRoute(route);
    },
    isLayerOn: (layer) => layerIsOn(layer),
    drawBurg: (burg) => {
      drawBurgIcon(burg as any);
      drawBurgLabel(burg as any);
    },
    removeBurg: (burgId) => {
      removeBurgIcon(burgId);
      removeBurgLabel(burgId);
    },
    removeBurgCoa: (burgId) => {
      document.getElementById(`burgCOA${burgId}`)?.remove();
      emblems.select(`#burgEmblems > use[data-i='${burgId}']`).remove();
    },
    redrawIceberg: (iceId) => {
      redrawIceberg(iceId);
    },
    redrawGlacier: (iceId) => {
      redrawGlacier(iceId);
    },
    removeElementById: (id) => {
      document.getElementById(id)?.remove();
    },
    drawScaleBar: () => {
      drawScaleBar(svg.select("#scaleBar") as any, scale);
    },
  };
}

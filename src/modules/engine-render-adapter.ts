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
  getElementTotalLengthById?: (id: string) => number | undefined;
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

export type EngineRenderDomTargets = Pick<
  EngineRenderTargets,
  "getElementById"
>;

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
      try {
        targets.getElementById(`burgCOA${burgId}`)?.remove();
      } catch {
        // DOM removal is best-effort for compatibility-rendered burg COA nodes.
      }
      targets.removeBurgEmblemUse(burgId);
    },
    redrawIceberg: (iceId) => {
      targets.redrawIceberg(iceId);
    },
    redrawGlacier: (iceId) => {
      targets.redrawGlacier(iceId);
    },
    removeElementById: (id) => {
      try {
        targets.getElementById(id)?.remove();
      } catch {
        // DOM removal is best-effort for compatibility-rendered nodes.
      }
    },
    getElementTotalLengthById: (id) => {
      try {
        const element = targets.getElementById(id) as
          | (SVGElement & { getTotalLength?: () => number })
          | null;
        return element?.getTotalLength?.();
      } catch {
        return undefined;
      }
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

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function getGlobalValue<T = unknown>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}

function callGlobal<T extends (...args: never[]) => unknown>(
  name: string,
  ...args: Parameters<T>
) {
  try {
    getGlobalValue<T>(name)?.(...args);
  } catch {
    // Render compatibility helpers are best-effort behind injected targets.
  }
}

export function createGlobalRenderDomTargets(): EngineRenderDomTargets {
  return {
    getElementById: (id) => {
      try {
        return getDocument()?.getElementById(id) ?? null;
      } catch {
        return null;
      }
    },
  };
}

export function createGlobalRenderTargets(
  domTargets: EngineRenderDomTargets = createGlobalRenderDomTargets(),
): EngineRenderTargets {
  return {
    findCell: (x, y, radius, graph) => {
      try {
        return getGlobalValue<EngineRenderTargets["findCell"]>("findCell")?.(
          x,
          y,
          radius,
          graph,
        );
      } catch {
        return undefined;
      }
    },
    getPack: () => getGlobalValue<PackedGraph>("pack") ?? ({} as PackedGraph),
    addCoa: (type, id, coa, x, y) => {
      try {
        getGlobalValue<{ add?: EngineRenderTargets["addCoa"] }>(
          "COArenderer",
        )?.add?.(type, id, coa, x, y);
      } catch {
        // Optional compatibility renderer.
      }
    },
    drawRoute: (route) => {
      callGlobal<(route: unknown) => void>("drawRoute", route);
    },
    isLayerOn: (layer) => {
      try {
        return (
          getGlobalValue<(layer: string) => boolean>("layerIsOn")?.(layer) ??
          false
        );
      } catch {
        return false;
      }
    },
    drawBurgIcon: (burg) => {
      callGlobal<(burg: unknown) => void>("drawBurgIcon", burg);
    },
    drawBurgLabel: (burg) => {
      callGlobal<(burg: unknown) => void>("drawBurgLabel", burg);
    },
    removeBurgIcon: (burgId) => {
      callGlobal<(burgId: number) => void>("removeBurgIcon", burgId);
    },
    removeBurgLabel: (burgId) => {
      callGlobal<(burgId: number) => void>("removeBurgLabel", burgId);
    },
    getElementById: domTargets.getElementById,
    removeBurgEmblemUse: (burgId) => {
      try {
        getGlobalValue<{
          select?: (selector: string) => { remove?: () => void };
        }>("emblems")
          ?.select?.(`#burgEmblems > use[data-i='${burgId}']`)
          ?.remove?.();
      } catch {
        // Optional compatibility emblem renderer.
      }
    },
    redrawIceberg: (iceId) => {
      callGlobal<(iceId: number) => void>("redrawIceberg", iceId);
    },
    redrawGlacier: (iceId) => {
      callGlobal<(iceId: number) => void>("redrawGlacier", iceId);
    },
    selectScaleBar: () => {
      try {
        return getGlobalValue<{ select?: (selector: string) => unknown }>(
          "svg",
        )?.select?.("#scaleBar");
      } catch {
        return undefined;
      }
    },
    getScale: () => getGlobalValue<number>("scale") ?? 0,
    drawScaleBar: (scaleBar, scale) => {
      try {
        getGlobalValue<(scaleBar: unknown, scale: number) => void>(
          "drawScaleBar",
        )?.(scaleBar, scale);
      } catch {
        // Optional compatibility renderer.
      }
    },
    drawHeightmap: () => {
      callGlobal<() => void>("drawHeightmap");
    },
    drawBiomes: () => {
      callGlobal<() => void>("drawBiomes");
    },
    drawCells: () => {
      callGlobal<() => void>("drawCells");
    },
    invokeActiveZooming: () => {
      callGlobal<() => void>("invokeActiveZooming");
    },
  };
}

export function createGlobalRenderAdapter(
  targets: EngineRenderTargets = createGlobalRenderTargets(),
): EngineRenderAdapter {
  return createEngineRenderAdapter(targets);
}

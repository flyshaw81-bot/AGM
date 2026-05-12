import { areaLayersRenderer } from "../renderers/draw-area-layers";
import { bordersRenderer } from "../renderers/draw-borders";
import {
  burgIconsRenderer,
  drawBurgIconRenderer,
  removeBurgIconRenderer,
} from "../renderers/draw-burg-icons";
import {
  burgLabelsRenderer,
  drawBurgLabelRenderer,
  removeBurgLabelRenderer,
} from "../renderers/draw-burg-labels";
import { emblemsRenderer } from "../renderers/draw-emblems";
import { featuresRenderer } from "../renderers/draw-features";
import { heightmapRenderer } from "../renderers/draw-heightmap";
import {
  iceRenderer,
  redrawGlacierRenderer,
  redrawIcebergRenderer,
} from "../renderers/draw-ice";
import { markersRenderer } from "../renderers/draw-markers";
import { militaryRenderer } from "../renderers/draw-military";
import { reliefIconsRenderer } from "../renderers/draw-relief-icons";
import { stateLabelsRenderer } from "../renderers/draw-state-labels";
import { temperatureRenderer } from "../renderers/draw-temperature";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";

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
  drawFeatures?: () => void;
  drawHeightmap?: () => void;
  drawTemperature?: () => void;
  drawBorders?: () => void;
  drawStateLabels?: (list?: number[]) => void;
  drawReliefIcons?: () => void;
  drawMilitary?: () => void;
  drawMarkers?: () => void;
  drawIce?: () => void;
  drawBurgIcons?: () => void;
  drawBurgLabels?: () => void;
  drawEmblems?: () => void;
  drawBiomes?: () => void;
  drawCultures?: () => void;
  drawReligions?: () => void;
  drawStates?: () => void;
  drawProvinces?: () => void;
  drawZones?: () => void;
  drawRivers?: () => void;
  drawRoutes?: () => void;
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
  drawFeatures?: () => void;
  drawHeightmap?: () => void;
  drawTemperature?: () => void;
  drawBorders?: () => void;
  drawStateLabels?: (list?: number[]) => void;
  drawReliefIcons?: () => void;
  drawMilitary?: () => void;
  drawMarkers?: () => void;
  drawIce?: () => void;
  drawBurgIcons?: () => void;
  drawBurgLabels?: () => void;
  drawEmblems?: () => void;
  drawBiomes?: () => void;
  drawCultures?: () => void;
  drawReligions?: () => void;
  drawStates?: () => void;
  drawProvinces?: () => void;
  drawZones?: () => void;
  drawRivers?: () => void;
  drawRoutes?: () => void;
  drawCells?: () => void;
  invokeActiveZooming?: () => void;
};

export type EngineGlobalRenderFunctions = {
  drawRoute?: (route: unknown) => void;
  drawBurgIcon?: (burg: unknown) => void;
  drawBurgLabel?: (burg: unknown) => void;
  removeBurgIcon?: (burgId: number) => void;
  removeBurgLabel?: (burgId: number) => void;
  redrawIceberg?: (iceId: number) => void;
  redrawGlacier?: (iceId: number) => void;
  drawFeatures?: () => void;
  drawHeightmap?: () => void;
  drawTemperature?: () => void;
  drawBorders?: () => void;
  drawStateLabels?: (list?: number[]) => void;
  drawReliefIcons?: () => void;
  drawMilitary?: () => void;
  drawMarkers?: () => void;
  drawIce?: () => void;
  drawBurgIcons?: () => void;
  drawBurgLabels?: () => void;
  drawEmblems?: () => void;
  drawBiomes?: () => void;
  drawCultures?: () => void;
  drawReligions?: () => void;
  drawStates?: () => void;
  drawProvinces?: () => void;
  drawZones?: () => void;
  drawRivers?: () => void;
  drawRoutes?: () => void;
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
    drawFeatures: () => {
      targets.drawFeatures?.();
    },
    drawHeightmap: () => {
      targets.drawHeightmap?.();
    },
    drawTemperature: () => {
      targets.drawTemperature?.();
    },
    drawBorders: () => {
      targets.drawBorders?.();
    },
    drawStateLabels: (list) => {
      targets.drawStateLabels?.(list);
    },
    drawReliefIcons: () => {
      targets.drawReliefIcons?.();
    },
    drawMilitary: () => {
      targets.drawMilitary?.();
    },
    drawMarkers: () => {
      targets.drawMarkers?.();
    },
    drawIce: () => {
      targets.drawIce?.();
    },
    drawBurgIcons: () => {
      targets.drawBurgIcons?.();
    },
    drawBurgLabels: () => {
      targets.drawBurgLabels?.();
    },
    drawEmblems: () => {
      targets.drawEmblems?.();
    },
    drawBiomes: () => {
      targets.drawBiomes?.();
    },
    drawCultures: () => {
      targets.drawCultures?.();
    },
    drawReligions: () => {
      targets.drawReligions?.();
    },
    drawStates: () => {
      targets.drawStates?.();
    },
    drawProvinces: () => {
      targets.drawProvinces?.();
    },
    drawZones: () => {
      targets.drawZones?.();
    },
    drawRivers: () => {
      targets.drawRivers?.();
    },
    drawRoutes: () => {
      targets.drawRoutes?.();
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

function getGlobalFunction<K extends keyof EngineGlobalRenderFunctions>(
  name: K,
): EngineGlobalRenderFunctions[K] {
  try {
    const value = getGlobalValue(name);
    return typeof value === "function"
      ? (value as EngineGlobalRenderFunctions[K])
      : undefined;
  } catch {
    return undefined;
  }
}

function callOptionalGlobalRender<T extends (...args: any[]) => unknown>(
  target: T | undefined,
  ...args: Parameters<T>
) {
  try {
    target?.(...args);
  } catch {
    // Render compatibility helpers are best-effort behind injected targets.
  }
}

export function createGlobalEngineRenderFunctions(): EngineGlobalRenderFunctions {
  return {
    drawRoute: getGlobalFunction("drawRoute"),
    drawBurgIcon: getGlobalFunction("drawBurgIcon"),
    drawBurgLabel: getGlobalFunction("drawBurgLabel"),
    removeBurgIcon: getGlobalFunction("removeBurgIcon"),
    removeBurgLabel: getGlobalFunction("removeBurgLabel"),
    redrawIceberg: getGlobalFunction("redrawIceberg"),
    redrawGlacier: getGlobalFunction("redrawGlacier"),
    drawFeatures: getGlobalFunction("drawFeatures"),
    drawHeightmap: getGlobalFunction("drawHeightmap"),
    drawTemperature: getGlobalFunction("drawTemperature"),
    drawBorders: getGlobalFunction("drawBorders"),
    drawStateLabels: getGlobalFunction("drawStateLabels"),
    drawReliefIcons: getGlobalFunction("drawReliefIcons"),
    drawMilitary: getGlobalFunction("drawMilitary"),
    drawMarkers: getGlobalFunction("drawMarkers"),
    drawIce: getGlobalFunction("drawIce"),
    drawBurgIcons: getGlobalFunction("drawBurgIcons"),
    drawBurgLabels: getGlobalFunction("drawBurgLabels"),
    drawEmblems: getGlobalFunction("drawEmblems"),
    drawBiomes: getGlobalFunction("drawBiomes"),
    drawCultures: getGlobalFunction("drawCultures"),
    drawReligions: getGlobalFunction("drawReligions"),
    drawStates: getGlobalFunction("drawStates"),
    drawProvinces: getGlobalFunction("drawProvinces"),
    drawZones: getGlobalFunction("drawZones"),
    drawRivers: getGlobalFunction("drawRivers"),
    drawRoutes: getGlobalFunction("drawRoutes"),
    drawCells: getGlobalFunction("drawCells"),
    invokeActiveZooming: getGlobalFunction("invokeActiveZooming"),
  };
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
  renderFunctions: EngineGlobalRenderFunctions = createGlobalEngineRenderFunctions(),
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
      callOptionalGlobalRender(renderFunctions.drawRoute, route);
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
      callOptionalGlobalRender(renderFunctions.drawBurgIcon, burg);
    },
    drawBurgLabel: (burg) => {
      callOptionalGlobalRender(renderFunctions.drawBurgLabel, burg);
    },
    removeBurgIcon: (burgId) => {
      callOptionalGlobalRender(renderFunctions.removeBurgIcon, burgId);
    },
    removeBurgLabel: (burgId) => {
      callOptionalGlobalRender(renderFunctions.removeBurgLabel, burgId);
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
      callOptionalGlobalRender(renderFunctions.redrawIceberg, iceId);
    },
    redrawGlacier: (iceId) => {
      callOptionalGlobalRender(renderFunctions.redrawGlacier, iceId);
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
    drawFeatures: () => {
      callOptionalGlobalRender(renderFunctions.drawFeatures);
    },
    drawHeightmap: () => {
      callOptionalGlobalRender(renderFunctions.drawHeightmap);
    },
    drawTemperature: () => {
      callOptionalGlobalRender(renderFunctions.drawTemperature);
    },
    drawBorders: () => {
      callOptionalGlobalRender(renderFunctions.drawBorders);
    },
    drawStateLabels: (list) => {
      callOptionalGlobalRender(renderFunctions.drawStateLabels, list);
    },
    drawReliefIcons: () => {
      callOptionalGlobalRender(renderFunctions.drawReliefIcons);
    },
    drawMilitary: () => {
      callOptionalGlobalRender(renderFunctions.drawMilitary);
    },
    drawMarkers: () => {
      callOptionalGlobalRender(renderFunctions.drawMarkers);
    },
    drawIce: () => {
      callOptionalGlobalRender(renderFunctions.drawIce);
    },
    drawBurgIcons: () => {
      callOptionalGlobalRender(renderFunctions.drawBurgIcons);
    },
    drawBurgLabels: () => {
      callOptionalGlobalRender(renderFunctions.drawBurgLabels);
    },
    drawEmblems: () => {
      callOptionalGlobalRender(renderFunctions.drawEmblems);
    },
    drawBiomes: () => {
      callOptionalGlobalRender(renderFunctions.drawBiomes);
    },
    drawCultures: () => {
      callOptionalGlobalRender(renderFunctions.drawCultures);
    },
    drawReligions: () => {
      callOptionalGlobalRender(renderFunctions.drawReligions);
    },
    drawStates: () => {
      callOptionalGlobalRender(renderFunctions.drawStates);
    },
    drawProvinces: () => {
      callOptionalGlobalRender(renderFunctions.drawProvinces);
    },
    drawZones: () => {
      callOptionalGlobalRender(renderFunctions.drawZones);
    },
    drawRivers: () => {
      callOptionalGlobalRender(renderFunctions.drawRivers);
    },
    drawRoutes: () => {
      callOptionalGlobalRender(renderFunctions.drawRoutes);
    },
    drawCells: () => {
      callOptionalGlobalRender(renderFunctions.drawCells);
    },
    invokeActiveZooming: () => {
      callOptionalGlobalRender(renderFunctions.invokeActiveZooming);
    },
  };
}

export function createGlobalRenderAdapter(
  targets: EngineRenderTargets = createGlobalRenderTargets(),
): EngineRenderAdapter {
  return createEngineRenderAdapter(targets);
}

export function createRuntimeRenderAdapter(
  context: EngineRuntimeContext,
  fallback: EngineRenderAdapter = createGlobalRenderAdapter(),
): EngineRenderAdapter {
  return {
    ...fallback,
    drawBurg: (burg) => {
      drawBurgIconRenderer(context, burg as any);
      drawBurgLabelRenderer(context, burg as any);
    },
    removeBurg: (burgId) => {
      removeBurgIconRenderer(burgId);
      removeBurgLabelRenderer(burgId);
    },
    drawRoute: (route) => areaLayersRenderer.drawRoute(route),
    drawFeatures: () => featuresRenderer(context),
    drawHeightmap: () => heightmapRenderer(context),
    drawTemperature: () => temperatureRenderer(context),
    drawBorders: () => bordersRenderer(context),
    drawStateLabels: (list) => stateLabelsRenderer(context, list),
    drawReliefIcons: () => reliefIconsRenderer(context),
    drawMilitary: () => militaryRenderer(context),
    drawMarkers: () => markersRenderer(context),
    drawIce: () => iceRenderer(context),
    drawBurgIcons: () => burgIconsRenderer(context),
    drawBurgLabels: () => burgLabelsRenderer(context),
    drawEmblems: () => emblemsRenderer(context),
    redrawIceberg: (iceId) => redrawIcebergRenderer(context, iceId),
    redrawGlacier: (iceId) => redrawGlacierRenderer(context, iceId),
    drawBiomes: () => areaLayersRenderer.drawBiomes(context),
    drawCultures: () => areaLayersRenderer.drawCultures(context),
    drawReligions: () => areaLayersRenderer.drawReligions(context),
    drawStates: () => areaLayersRenderer.drawStates(context),
    drawProvinces: () => areaLayersRenderer.drawProvinces(context),
    drawZones: () => areaLayersRenderer.drawZones(context),
    drawRivers: () => areaLayersRenderer.drawRivers(context),
    drawRoutes: () => areaLayersRenderer.drawRoutes(context),
  };
}

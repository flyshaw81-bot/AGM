import type { EngineRuntimeContext } from "../modules/engine-runtime-context";
import { color as d3Color } from "../utils/colorCore";
import { getIsolines, getVertexPath } from "../utils/pathUtils";
import { createBrowserRendererContext } from "./renderer-runtime-context";

declare global {
  var drawBiomes: () => void;
  var drawCultures: () => void;
  var drawLabels: () => void;
  var drawProvinces: () => void;
  var drawReligions: () => void;
  var drawRivers: () => void;
  var drawRoute: (route: any) => void;
  var drawRoutes: () => void;
  var drawStates: () => void;
  var drawZones: () => void;
}

const getWindow = (): (Window & typeof globalThis) | undefined => {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
};

function getBrowserContext(): EngineRuntimeContext {
  return createBrowserRendererContext();
}

function getElement(id: string): HTMLElement | SVGElement | null {
  try {
    return globalThis.document?.getElementById(id) ?? null;
  } catch {
    return null;
  }
}

function getGappedFillPaths(
  elementName: string,
  fill: string | undefined,
  waterGap: string | undefined,
  fillColor: string,
  index: string | number,
): string {
  let html = "";
  if (fill)
    html += `<path d="${fill}" fill="${fillColor}" id="${elementName}${index}" />`;
  if (waterGap) {
    html += `<path d="${waterGap}" fill="none" stroke="${fillColor}" stroke-width="3" id="${elementName}-gap${index}" />`;
  }
  return html;
}

function renderTypedIsolines({
  context,
  elementName,
  targetId,
  getType,
  getColor,
}: {
  context: EngineRuntimeContext;
  elementName: string;
  targetId: string;
  getType: (cellId: number) => number | string;
  getColor: (index: string) => string | undefined;
}) {
  const { pack } = context;
  const cells = context.pack.cells;
  const bodyPaths: string[] = [];
  const isolines = getIsolines(pack, getType, { fill: true, waterGap: true });

  Object.entries(isolines).forEach(([index, isoline]) => {
    const { fill, waterGap } = isoline as {
      fill?: string;
      waterGap?: string;
    };
    bodyPaths.push(
      getGappedFillPaths(
        elementName,
        fill,
        waterGap,
        getColor(index) || "#888888",
        index,
      ),
    );
  });

  const target = getElement(targetId);
  if (target) target.innerHTML = bodyPaths.join("");
  return cells;
}

export const areaLayersRenderer = {
  drawBiomes(context: EngineRuntimeContext) {
    context.timing.shouldTime && console.time("drawBiomes");
    renderTypedIsolines({
      context,
      elementName: "biome",
      targetId: "biomes",
      getType: (cellId) => context.pack.cells.biome[cellId],
      getColor: (index) => context.biomesData.color[Number(index)],
    });
    context.timing.shouldTime && console.timeEnd("drawBiomes");
  },

  drawCultures(context: EngineRuntimeContext) {
    context.timing.shouldTime && console.time("drawCultures");
    renderTypedIsolines({
      context,
      elementName: "culture",
      targetId: "cults",
      getType: (cellId) => context.pack.cells.culture[cellId],
      getColor: (index) => context.pack.cultures[Number(index)]?.color,
    });
    context.timing.shouldTime && console.timeEnd("drawCultures");
  },

  drawReligions(context: EngineRuntimeContext) {
    context.timing.shouldTime && console.time("drawReligions");
    renderTypedIsolines({
      context,
      elementName: "religion",
      targetId: "relig",
      getType: (cellId) => context.pack.cells.religion[cellId],
      getColor: (index) => context.pack.religions[Number(index)]?.color,
    });
    context.timing.shouldTime && console.timeEnd("drawReligions");
  },

  drawStates(context: EngineRuntimeContext) {
    context.timing.shouldTime && console.time("drawStates");
    const { cells, states } = context.pack;
    const bodyPaths: string[] = [];
    const clipPaths: string[] = [];
    const haloPaths: string[] = [];
    const shapeRendering = getElement(
      "shapeRendering",
    ) as HTMLSelectElement | null;
    const renderHalo = shapeRendering?.value === "geometricPrecision";
    const isolines = getIsolines(
      context.pack,
      (cellId) => cells.state[cellId],
      {
        fill: true,
        waterGap: true,
        halo: renderHalo,
      },
    );

    Object.entries(isolines).forEach(([index, isoline]) => {
      const { fill, waterGap, halo } = isoline as {
        fill?: string;
        waterGap?: string;
        halo?: string;
      };
      const stateColor = states[Number(index)]?.color || "#9fb6d8";
      bodyPaths.push(
        getGappedFillPaths("state", fill, waterGap, stateColor, index),
      );

      if (renderHalo && halo) {
        const haloColor =
          d3Color(stateColor)?.darker().formatHex() || "#666666";
        clipPaths.push(
          `<clipPath id="state-clip${index}"><use href="#state${index}"/></clipPath>`,
        );
        haloPaths.push(
          `<path id="state-border${index}" d="${halo}" clip-path="url(#state-clip${index})" stroke="${haloColor}"/>`,
        );
      }
    });

    const statesBody = getElement("statesBody");
    const statePaths = getElement("statePaths");
    const statesHalo = getElement("statesHalo");
    if (statesBody) statesBody.innerHTML = bodyPaths.join("");
    if (statePaths) statePaths.innerHTML = renderHalo ? clipPaths.join("") : "";
    if (statesHalo) statesHalo.innerHTML = renderHalo ? haloPaths.join("") : "";
    context.timing.shouldTime && console.timeEnd("drawStates");
  },

  drawProvinces(context: EngineRuntimeContext) {
    context.timing.shouldTime && console.time("drawProvinces");
    const { cells, provinces } = context.pack;
    const bodyPaths: string[] = [];
    const isolines = getIsolines(
      context.pack,
      (cellId) => cells.province[cellId],
      {
        fill: true,
        waterGap: true,
      },
    );

    Object.entries(isolines).forEach(([index, isoline]) => {
      const { fill, waterGap } = isoline as {
        fill?: string;
        waterGap?: string;
      };
      bodyPaths.push(
        getGappedFillPaths(
          "province",
          fill,
          waterGap,
          provinces[Number(index)]?.color || "#777777",
          index,
        ),
      );
    });

    const labelsHtml = provinces
      .filter((province: any) => province.i && !province.removed)
      .map((province: any) => {
        const [x, y] = province.pole || cells.p[province.center];
        return `<text x="${x}" y="${y}" id="provinceLabel${province.i}">${province.name}</text>`;
      });

    const target = getElement("provs");
    if (target) {
      target.innerHTML = `<g id="provincesBody">${bodyPaths.join("")}</g><g id="provinceLabels">${labelsHtml.join("")}</g>`;
      const labels = getElement("provinceLabels") as SVGElement | null;
      if (labels)
        labels.style.display = target.dataset.labels === "1" ? "block" : "none";
    }
    context.timing.shouldTime && console.timeEnd("drawProvinces");
  },

  drawZones(context: EngineRuntimeContext) {
    const filter = getElement("zonesFilterType") as HTMLSelectElement | null;
    const filterBy = filter?.value || "";
    const isFiltered = Boolean(filterBy && filterBy !== "all");
    const visibleZones = (context.pack.zones || []).filter(
      ({ hidden, cells, type }: any) =>
        !hidden && cells.length && (!isFiltered || type === filterBy),
    );
    const target = getElement("zones");
    if (!target) return;
    target.innerHTML = visibleZones
      .map(({ i, cells, type, color }: any) => {
        const path = getVertexPath(cells, context.pack);
        return `<path id="zone${i}" data-id="${i}" data-type="${type}" d="${path}" fill="${color}" />`;
      })
      .join("");
  },

  drawRivers(context: EngineRuntimeContext) {
    context.timing.shouldTime && console.time("drawRivers");
    rivers.selectAll("*").remove();
    const riverPaths = (context.pack.rivers || []).map(
      ({ cells, points, i, widthFactor, sourceWidth }: any) => {
        if (!cells || cells.length < 2) return "";

        let riverPoints = points;
        if (riverPoints && riverPoints.length !== cells.length) {
          ERROR &&
            console.error(
              `River ${i} has ${cells.length} cells, but only ${riverPoints.length} points defined. Resetting points data`,
            );
          riverPoints = undefined;
        }

        const meanderedPoints = Rivers.addMeandering(
          cells,
          riverPoints,
          0.5,
          context,
        );
        const path = Rivers.getRiverPath(
          meanderedPoints,
          widthFactor,
          sourceWidth,
        );
        return `<path id="river${i}" d="${path}"/>`;
      },
    );
    rivers.html(riverPaths.join(""));
    context.timing.shouldTime && console.timeEnd("drawRivers");
  },

  drawRoutes(context: EngineRuntimeContext) {
    context.timing.shouldTime && console.time("drawRoutes");
    const routePaths: Record<string, string[]> = {};
    for (const route of context.pack.routes || []) {
      const { i, group, points } = route;
      if (!points || points.length < 2) continue;
      if (!routePaths[group]) routePaths[group] = [];
      routePaths[group].push(
        `<path id="route${i}" d="${Routes.getPath(route)}"/>`,
      );
    }

    routes.selectAll("path").remove();
    for (const group in routePaths) {
      routes.select(`#${group}`).html(routePaths[group].join(""));
    }
    context.timing.shouldTime && console.timeEnd("drawRoutes");
  },

  drawRoute(route: any) {
    routes
      .select(`#${route.group}`)
      .append("path")
      .attr("d", Routes.getPath(route))
      .attr("id", `route${route.i}`);
  },

  drawLabels() {
    drawStateLabels();
    drawBurgLabels();
    invokeActiveZooming();
  },
};

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.drawBiomes = () =>
    areaLayersRenderer.drawBiomes(getBrowserContext());
  runtimeWindow.drawCultures = () =>
    areaLayersRenderer.drawCultures(getBrowserContext());
  runtimeWindow.drawLabels = areaLayersRenderer.drawLabels;
  runtimeWindow.drawProvinces = () =>
    areaLayersRenderer.drawProvinces(getBrowserContext());
  runtimeWindow.drawReligions = () =>
    areaLayersRenderer.drawReligions(getBrowserContext());
  runtimeWindow.drawRivers = () =>
    areaLayersRenderer.drawRivers(getBrowserContext());
  runtimeWindow.drawRoute = areaLayersRenderer.drawRoute;
  runtimeWindow.drawRoutes = () =>
    areaLayersRenderer.drawRoutes(getBrowserContext());
  runtimeWindow.drawStates = () =>
    areaLayersRenderer.drawStates(getBrowserContext());
  runtimeWindow.drawZones = () =>
    areaLayersRenderer.drawZones(getBrowserContext());
}

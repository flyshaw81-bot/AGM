import { C_12 } from "./colorUtils";
import { getGridPolygon } from "./graphUtils";
import { normalize } from "./numberUtils";
import { curveBundle, line } from "./shapeUtils";
import { max, min } from "./statUtils";
import { round } from "./stringUtils";

const getWindow = (): Window | undefined => {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
};

export type DebugDrawingTargets = {
  getDebugLayer: () => any | undefined;
  getColorScheme: (name: string) => ((t: number) => string) | undefined;
};

export function createGlobalDebugDrawingTargets(): DebugDrawingTargets {
  return {
    getDebugLayer: () => getWindow()?.debug,
    getColorScheme: (name) => getWindow()?.getColorScheme?.(name),
  };
}

const defaultDebugDrawingTargets = createGlobalDebugDrawingTargets();

/**
 * Drawing cell values and polygons for debugging purposes
 * @param {any[]} data - Array of data values corresponding to each cell
 * @param {any} packedGraph - The packed graph object containing cell positions
 */
export const drawCellsValue = (
  data: any[],
  packedGraph: any,
  targets: DebugDrawingTargets = defaultDebugDrawingTargets,
): void => {
  const debug = targets.getDebugLayer();
  if (!debug) return;

  debug.selectAll("text").remove();
  debug
    .selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", (_d: any, i: number) => packedGraph.cells.p[i][0])
    .attr("y", (_d: any, i: number) => packedGraph.cells.p[i][1])
    .text((d: any) => d);
};
/**
 * Drawing polygons colored according to data values for debugging purposes
 * @param {number[]} data - Array of numerical values corresponding to each cell
 * @param {any} terrs - The SVG group element where the polygons will be drawn
 */
export const drawPolygons = (
  data: number[],
  terrs: any,
  grid: any,
  targets: DebugDrawingTargets = defaultDebugDrawingTargets,
): void => {
  const debug = targets.getDebugLayer();
  if (!debug) return;

  const maximum: number = max(data) as number;
  const minimum: number = min(data) as number;
  const scheme = targets.getColorScheme(
    terrs.select("#landHeights").attr("scheme"),
  );
  if (!scheme) return;

  data = data.map((d) => 1 - normalize(d, minimum, maximum));
  debug.selectAll("polygon").remove();
  debug
    .selectAll("polygon")
    .data(data)
    .enter()
    .append("polygon")
    .attr("points", (_d: number, i: number) => getGridPolygon(i, grid))
    .attr("fill", (d: number) => scheme(d))
    .attr("stroke", (d: number) => scheme(d));
};

/**
 * Drawing route connections for debugging purposes
 * @param {any} pack - The packed graph object containing cell positions and routes
 */
export const drawRouteConnections = (
  packedGraph: any,
  targets: DebugDrawingTargets = defaultDebugDrawingTargets,
): void => {
  const debug = targets.getDebugLayer();
  if (!debug) return;

  debug.select("#connections").remove();
  const routes = debug
    .append("g")
    .attr("id", "connections")
    .attr("stroke-width", 0.8);

  const points = packedGraph.cells.p;
  const links = packedGraph.cells.routes;

  for (const from in links) {
    for (const to in links[from]) {
      const [x1, y1] = points[from];
      const [x3, y3] = points[to];
      const [x2, y2] = [(x1 + x3) / 2, (y1 + y3) / 2];
      const routeId = links[from][to];

      routes
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("data-id", routeId)
        .attr("stroke", C_12[routeId % 12]);
    }
  }
};

/**
 * Drawing a point for debugging purposes
 * @param {[number, number]} point - The [x, y] coordinates of the point to draw
 * @param {Object} options - Options for drawing the point
 * @param {string} options.color - Color of the point
 * @param {number} options.radius - Radius of the point
 */
export const drawPoint = (
  [x, y]: [number, number],
  { color = "red", radius = 0.5 },
  targets: DebugDrawingTargets = defaultDebugDrawingTargets,
): void => {
  const debug = targets.getDebugLayer();
  if (!debug) return;

  debug
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", radius)
    .attr("fill", color);
};

/**
 * Drawing a path for debugging purposes
 * @param {[number, number][]} points - Array of [x, y] coordinates representing the path
 * @param {Object} options - Options for drawing the path
 * @param {string} options.color - Color of the path
 * @param {number} options.width - Stroke width of the path
 */
export const drawPath = (
  points: [number, number][],
  { color = "red", width = 0.5 },
  targets: DebugDrawingTargets = defaultDebugDrawingTargets,
): void => {
  const debug = targets.getDebugLayer();
  if (!debug) return;

  const lineGen = line().curve(curveBundle);
  debug
    .append("path")
    .attr("d", round(lineGen(points) as string))
    .attr("stroke", color)
    .attr("stroke-width", width)
    .attr("fill", "none");
};

declare global {
  interface Window {
    debug: any;
    getColorScheme: (name: string) => (t: number) => string;

    drawCellsValue: typeof drawCellsValue;
    drawPolygons: typeof drawPolygons;
    drawRouteConnections: typeof drawRouteConnections;
    drawPoint: typeof drawPoint;
    drawPath: typeof drawPath;
  }
}

import type { CurveFactory } from "d3";
import {
  color,
  curveBasisClosed,
  curveLinear,
  curveStep,
  line,
  range,
} from "d3";
import { round } from "../utils";

declare global {
  var drawHeightmap: () => void;
}

const getWindow = (): (Window & typeof globalThis) | undefined => {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
};

export type HeightmapRendererLogTargets = {
  error: (...args: unknown[]) => void;
};

const getErrorFlag = (): boolean => {
  try {
    return Boolean(globalThis.ERROR);
  } catch {
    return false;
  }
};

export function createGlobalHeightmapRendererLogTargets(): HeightmapRendererLogTargets {
  return {
    error: (...args) => {
      if (getErrorFlag()) console.error(...args);
    },
  };
}

const HEIGHTMAP_CURVES = {
  curveBasisClosed,
  curveLinear,
  curveStep,
} satisfies Record<string, CurveFactory>;

function getHeightmapCurve(curveName: string | null): CurveFactory {
  return (
    HEIGHTMAP_CURVES[curveName as keyof typeof HEIGHTMAP_CURVES] ||
    curveBasisClosed
  );
}

export function connectHeightmapVertices({
  cells,
  vertices,
  start,
  height,
  used,
  logTargets = createGlobalHeightmapRendererLogTargets(),
}: {
  cells: any;
  vertices: any;
  start: number;
  height: number;
  used: Uint8Array;
  logTargets?: HeightmapRendererLogTargets;
}): number[] {
  const MAX_ITERATIONS = vertices.c.length;

  const n = cells.i.length;
  const chain: number[] = []; // vertices chain to form a path
  for (
    let i = 0, current = start;
    i === 0 || (current !== start && i < MAX_ITERATIONS);
    i++
  ) {
    const prev = chain[chain.length - 1]; // previous vertex in chain
    chain.push(current); // add current vertex to sequence
    const c = vertices.c[current]; // cells adjacent to vertex
    c.filter((cell: number) => cells.h[cell] === height).forEach(
      (cell: number) => {
        used[cell] = 1;
      },
    );
    const c0 = c[0] >= n || cells.h[c[0]] < height;
    const c1 = c[1] >= n || cells.h[c[1]] < height;
    const c2 = c[2] >= n || cells.h[c[2]] < height;
    const v = vertices.v[current]; // neighboring vertices
    if (v[0] !== prev && c0 !== c1) current = v[0];
    else if (v[1] !== prev && c1 !== c2) current = v[1];
    else if (v[2] !== prev && c0 !== c2) current = v[2];
    if (current === chain[chain.length - 1]) {
      logTargets.error("Next vertex is not found");
      break;
    }
  }
  return chain;
}

const heightmapRenderer = (): void => {
  TIME && console.time("drawHeightmap");

  const ocean = terrs.select<SVGGElement>("#oceanHeights");
  const land = terrs.select<SVGGElement>("#landHeights");

  ocean.selectAll("*").remove();
  land.selectAll("*").remove();

  const paths: (string | undefined)[] = new Array(101);
  const { cells, vertices } = grid;
  const used = new Uint8Array(cells.i.length);
  const heights = Array.from(cells.i as number[]).sort(
    (a, b) => cells.h[a] - cells.h[b],
  );

  // ocean cells
  const renderOceanCells = Boolean(+ocean.attr("data-render"));
  if (renderOceanCells) {
    const skip = +ocean.attr("skip") + 1 || 1;
    const relax = +ocean.attr("relax") || 0;
    const lineGen = line().curve(getHeightmapCurve(ocean.attr("curve")));

    let currentLayer = 0;
    for (const i of heights) {
      const h = cells.h[i];
      if (h > currentLayer) currentLayer += skip;
      if (h < currentLayer) continue;
      if (currentLayer >= 20) break;
      if (used[i]) continue; // already marked
      const onborder = cells.c[i].some((n: number) => cells.h[n] < h);
      if (!onborder) continue;
      const vertex = cells.v[i].find((v: number) =>
        vertices.c[v].some((i: number) => cells.h[i] < h),
      );
      const chain = connectHeightmapVertices({
        cells,
        vertices,
        start: vertex,
        height: h,
        used,
      });
      if (chain.length < 3) continue;
      const points = simplifyLine(chain, relax).map(
        (v: number) => vertices.p[v],
      );
      if (!paths[h]) paths[h] = "";
      paths[h] += round(lineGen(points) || "");
    }
  }

  // land cells
  {
    const skip = +land.attr("skip") + 1 || 1;
    const relax = +land.attr("relax") || 0;
    const lineGen = line().curve(getHeightmapCurve(land.attr("curve")));

    let currentLayer = 20;
    for (const i of heights) {
      const h = cells.h[i];
      if (h > currentLayer) currentLayer += skip;
      if (h < currentLayer) continue;
      if (currentLayer > 100) break; // no layers possible with height > 100
      if (used[i]) continue; // already marked
      const onborder = cells.c[i].some((n: number) => cells.h[n] < h);
      if (!onborder) continue;

      const startVertex = cells.v[i].find((v: number) =>
        vertices.c[v].some((i: number) => cells.h[i] < h),
      );
      const chain = connectHeightmapVertices({
        cells,
        vertices,
        start: startVertex,
        height: h,
        used,
      });
      if (chain.length < 3) continue;

      const points = simplifyLine(chain, relax).map(
        (v: number) => vertices.p[v],
      );
      if (!paths[h]) paths[h] = "";
      paths[h] += round(lineGen(points) || "");
    }
  }

  // render paths
  for (const height of range(0, 101)) {
    const group = height < 20 ? ocean : land;
    const scheme = getColorScheme(group.attr("scheme"));

    if (height === 0 && renderOceanCells) {
      // draw base ocean layer
      group
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("fill", scheme(1));
    }

    if (height === 20) {
      // draw base land layer
      group
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("fill", scheme(0.8));
    }

    if (paths[height] && paths[height]!.length >= 10) {
      const terracing = +group.attr("terracing") / 10 || 0;
      const fillColor = getColor(height, scheme);

      if (terracing) {
        group
          .append("path")
          .attr("d", paths[height]!)
          .attr("transform", "translate(.7,1.4)")
          .attr("fill", color(fillColor)!.darker(terracing).toString())
          .attr("data-height", height);
      }
      group
        .append("path")
        .attr("d", paths[height]!)
        .attr("fill", fillColor)
        .attr("data-height", height);
    }
  }

  function simplifyLine(chain: number[], simplification: number): number[] {
    if (!simplification) return chain;
    const n = simplification + 1; // filter each nth element
    return chain.filter((_d, i) => i % n === 0);
  }

  TIME && console.timeEnd("drawHeightmap");
};

const runtimeWindow = getWindow();
if (runtimeWindow) runtimeWindow.drawHeightmap = heightmapRenderer;

import Alea from "../utils/alea";
import { clipPoly } from "../utils/commonUtils";
import { getGridPolygon } from "../utils/graphUtils";
import { lerp, minmax, normalize, rn } from "../utils/numberUtils";
import { getIsolines } from "../utils/pathUtils";
import { P, ra, rand } from "../utils/probabilityUtils";
import { min } from "../utils/statUtils";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import type { Point } from "./voronoi";

declare global {
  var Ice: IceModule;
}

function getWindow(): (Window & typeof globalThis) | undefined {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
}

export class IceModule {
  // Find next available id for new ice element idealy filling gaps
  private getNextId(context: EngineRuntimeContext) {
    const { pack } = context;
    if (pack.ice.length === 0) return 0;
    // find gaps in existing ids
    const existingIds = pack.ice.map((e) => e.i).sort((a, b) => a - b);
    for (let id = 0; id < existingIds[existingIds.length - 1]; id++) {
      if (!existingIds.includes(id)) return id;
    }
    return existingIds[existingIds.length - 1] + 1;
  }

  // Clear all ice
  private clear(context: EngineRuntimeContext) {
    const { pack } = context;
    pack.ice = [];
  }

  // Generate glaciers and icebergs based on temperature and height
  public generate(context: EngineRuntimeContext) {
    this.clear(context);
    const { grid, pack } = context;
    const { graphWidth = 0, graphHeight = 0 } = context.worldSettings;
    const { cells, features } = grid;
    const { temp, h } = cells;
    const previousRandom = Math.random;

    try {
      Math.random = Alea(context.seed);

      const ICEBERG_MAX_TEMP = 0;
      const GLACIER_MAX_TEMP = -8;
      const minMaxTemp = min<number>(temp)!;

      // Generate glaciers on cold land
      {
        const type = "iceShield";
        const getType = (cellId: number) =>
          h[cellId] >= 20 && temp[cellId] <= GLACIER_MAX_TEMP ? type : null;
        const isolines = getIsolines(grid, getType, { polygons: true });

        if (isolines[type]?.polygons) {
          isolines[type].polygons.forEach((points: Point[]) => {
            const clipped = clipPoly(points, graphWidth, graphHeight);
            pack.ice.push({
              i: this.getNextId(context),
              points: clipped,
              type: "glacier",
            });
          });
        }
      }

      // Generate icebergs on cold water
      for (const cellId of grid.cells.i) {
        const t = temp[cellId];
        if (h[cellId] >= 20) continue; // no icebergs on land
        if (t > ICEBERG_MAX_TEMP) continue; // too warm: no icebergs
        if (features[cells.f[cellId]].type === "lake") continue; // no icebergs on lakes
        if (P(0.8)) continue; // skip most of eligible cells

        const randomFactor = 0.8 + rand() * 0.4; // random size factor
        let baseSize = (1 - normalize(t, minMaxTemp, 1)) * 0.8; // size: 0 = zero, 1 = full
        if (cells.t[cellId] === -1) baseSize /= 1.3; // coastline: smaller icebergs
        const size = minmax(rn(baseSize * randomFactor, 2), 0.1, 1);

        const [cx, cy] = grid.points[cellId];
        const points = getGridPolygon(cellId, grid).map(([x, y]: Point) => [
          rn(lerp(cx, x, size), 2),
          rn(lerp(cy, y, size), 2),
        ]);

        pack.ice.push({
          i: this.getNextId(context),
          points,
          type: "iceberg",
          cellId,
          size,
        });
      }
    } finally {
      Math.random = previousRandom;
    }
  }

  addIceberg(cellId: number, size: number, context: EngineRuntimeContext) {
    const { grid, pack } = context;
    const [cx, cy] = grid.points[cellId];
    const points = getGridPolygon(cellId, grid).map(([x, y]: Point) => [
      rn(lerp(cx, x, size), 2),
      rn(lerp(cy, y, size), 2),
    ]);
    const id = this.getNextId(context);
    pack.ice.push({
      i: id,
      points,
      type: "iceberg",
      cellId,
      size,
    });
    context.rendering?.redrawIceberg(id);
  }

  removeIce(id: number, context: EngineRuntimeContext) {
    const { pack } = context;
    const index = pack.ice.findIndex((element) => element.i === id);
    if (index !== -1) {
      const type = pack.ice.find((element) => element.i === id).type;
      pack.ice.splice(index, 1);
      if (type === "glacier") {
        context.rendering?.redrawGlacier(id);
      } else {
        context.rendering?.redrawIceberg(id);
      }
    }
  }

  randomizeIcebergShape(id: number, context: EngineRuntimeContext) {
    const { grid, pack } = context;
    const iceberg = pack.ice.find((element) => element.i === id);
    if (!iceberg) return;

    const cellId = iceberg.cellId;
    const size = iceberg.size;
    const [cx, cy] = grid.points[cellId];

    // Get a different random cell for the polygon template
    const i = ra(grid.cells.i);
    const cn = grid.points[i];
    const poly = getGridPolygon(i, grid).map((p: Point) => [
      p[0] - cn[0],
      p[1] - cn[1],
    ]);
    const points = poly.map((p: Point) => [
      rn(cx + p[0] * size, 2),
      rn(cy + p[1] * size, 2),
    ]);

    iceberg.points = points;
  }

  changeIcebergSize(
    id: number,
    newSize: number,
    context: EngineRuntimeContext,
  ) {
    const { grid, pack } = context;
    const iceberg = pack.ice.find((element) => element.i === id);
    if (!iceberg) return;

    const cellId = iceberg.cellId;
    const [cx, cy] = grid.points[cellId];
    const oldSize = iceberg.size;

    const flat = iceberg.points.flat();
    const pairs = [];
    while (flat.length) pairs.push(flat.splice(0, 2));
    const poly = pairs.map((p) => [
      (p[0] - cx) / oldSize,
      (p[1] - cy) / oldSize,
    ]);
    const points = poly.map((p) => [
      rn(cx + p[0] * newSize, 2),
      rn(cy + p[1] * newSize, 2),
    ]);

    iceberg.points = points;
    iceberg.size = newSize;
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow) runtimeWindow.Ice = new IceModule();

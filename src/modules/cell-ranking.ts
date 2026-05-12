import { normalize } from "../utils/numberUtils";
import { max, mean, median } from "../utils/statUtils";
import type { EngineRuntimeContext } from "./engine-runtime-context";

declare global {
  var CellRanking: CellRankingModule;
}

function getWindow(): (Window & typeof globalThis) | undefined {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
}

type CellScoreMap = Record<string, number>;

const scoreMap: CellScoreMap = {
  estuary: 15,
  ocean_coast: 5,
  save_harbor: 20,
  freshwater: 30,
  salt: 10,
  frozen: 1,
  dry: -5,
  sinkhole: -5,
  lava: -30,
};

export class CellRankingModule {
  rank(context: EngineRuntimeContext) {
    if (context.timing.shouldTime) console.time("rankCells");

    const { cells, features } = context.pack;
    cells.s = new Int16Array(cells.i.length);
    cells.pop = new Float32Array(cells.i.length);

    const meanFlux = median(cells.fl.filter((flux: number) => flux)) || 0;
    const maxFlux = (max(cells.fl) ?? 0) + (max(cells.conf) ?? 0);
    const meanArea = mean(cells.area) || 1;

    for (const cellId of cells.i) {
      if (cells.h[cellId] < 20) continue;

      let score = context.biomesData.habitability[cells.biome[cellId]];
      if (!score) continue;

      if (meanFlux) {
        score +=
          normalize(cells.fl[cellId] + cells.conf[cellId], meanFlux, maxFlux) *
          250;
      }

      score -= (cells.h[cellId] - 50) / 5;

      if (cells.t[cellId] === 1) {
        if (cells.r[cellId]) score += scoreMap.estuary;
        const feature = features[cells.f[cells.haven[cellId]]];

        if (feature.type === "lake") {
          score += scoreMap[feature.group] || 0;
        } else {
          score += scoreMap.ocean_coast;
          if (cells.harbor[cellId] === 1) score += scoreMap.save_harbor;
        }
      }

      cells.s[cellId] = score / 5;
      cells.pop[cellId] =
        cells.s[cellId] > 0
          ? (cells.s[cellId] * cells.area[cellId]) / meanArea
          : 0;
    }

    if (context.timing.shouldTime) console.timeEnd("rankCells");
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.CellRanking = new CellRankingModule();
}

import { minmax, rn } from "../utils/numberUtils";
import { rand } from "../utils/probabilityUtils";
import { mean, range } from "../utils/statUtils";
import { createGlobalClimateContext } from "./engine-climate-context";
import type { EngineGrid, EngineOptions } from "./engine-world-state";

declare global {
  var Climate: ClimateModule;
}

function getWindow(): (Window & typeof globalThis) | undefined {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
}

type WindSource = number | [number, number, number];
export type ClimateMapCoordinates = {
  latT: number;
  latN: number;
  latS: number;
};

export type ClimateRuntimeContext = {
  grid: EngineGrid;
  coordinates: ClimateMapCoordinates;
  graphWidth: number;
  graphHeight: number;
  options: EngineOptions;
  heightExponent: number;
  pointsCount: number;
  precipitationPercent: number;
  precipitationLayer: typeof prec;
  debugTemperature: boolean;
  shouldTime: boolean;
};

export function getGlobalClimateRuntimeContext(): ClimateRuntimeContext {
  return createGlobalClimateContext();
}

export class ClimateModule {
  calculateTemperatures(context = getGlobalClimateRuntimeContext()) {
    context.shouldTime && console.time("calculateTemperatures");
    const { coordinates, graphHeight, grid, options } = context;
    const cells = grid.cells;
    cells.temp = new Int8Array(cells.i.length);

    const { temperatureEquator, temperatureNorthPole, temperatureSouthPole } =
      options;
    const tropics = [16, -20];
    const tropicalGradient = 0.15;

    const tempNorthTropic = temperatureEquator - tropics[0] * tropicalGradient;
    const northernGradient =
      (tempNorthTropic - temperatureNorthPole) / (90 - tropics[0]);

    const tempSouthTropic = temperatureEquator + tropics[1] * tropicalGradient;
    const southernGradient =
      (tempSouthTropic - temperatureSouthPole) / (90 + tropics[1]);

    const exponent = context.heightExponent;

    for (
      let rowCellId = 0;
      rowCellId < cells.i.length;
      rowCellId += grid.cellsX
    ) {
      const [, y] = grid.points[rowCellId];
      const rowLatitude =
        coordinates.latN - (y / graphHeight) * coordinates.latT;
      const tempSeaLevel = this.calculateSeaLevelTemp({
        latitude: rowLatitude,
        temperatureEquator,
        tempNorthTropic,
        northernGradient,
        tempSouthTropic,
        southernGradient,
        tropics,
        tropicalGradient,
      });
      context.debugTemperature &&
        console.info(
          `${rn(rowLatitude)}° sea temperature: ${rn(tempSeaLevel)}°C`,
        );

      for (let cellId = rowCellId; cellId < rowCellId + grid.cellsX; cellId++) {
        const tempAltitudeDrop = this.getAltitudeTemperatureDrop(
          cells.h[cellId],
          exponent,
        );
        cells.temp[cellId] = minmax(tempSeaLevel - tempAltitudeDrop, -128, 127);
      }
    }

    context.shouldTime && console.timeEnd("calculateTemperatures");
  }

  generatePrecipitation(context = getGlobalClimateRuntimeContext()) {
    context.shouldTime && console.time("generatePrecipitation");
    const { coordinates, grid, precipitationLayer } = context;
    precipitationLayer.selectAll("*").remove();
    const { cells, cellsX, cellsY } = grid;
    cells.prec = new Uint8Array(cells.i.length);

    const cellsNumberModifier = (context.pointsCount / 10000) ** 0.25;
    const precInputModifier = context.precipitationPercent / 100;
    const modifier = cellsNumberModifier * precInputModifier;

    const westerly: Array<[number, number, number]> = [];
    const easterly: Array<[number, number, number]> = [];
    let southerly = 0;
    let northerly = 0;

    const latitudeModifier = [
      4, 2, 2, 2, 1, 1, 2, 2, 2, 2, 3, 3, 2, 2, 1, 1, 1, 0.5,
    ];
    const maxPassableElevation = 85;

    range(0, cells.i.length, cellsX).forEach((cellId, rowIndex) => {
      const lat = coordinates.latN - (rowIndex / cellsY) * coordinates.latT;
      const latBand = ((Math.abs(lat) - 1) / 5) | 0;
      const latMod = latitudeModifier[latBand];
      const windTier = (Math.abs(lat - 89) / 30) | 0;
      const { isWest, isEast, isNorth, isSouth } = this.getWindDirections(
        windTier,
        context.options.winds,
      );

      if (isWest) westerly.push([cellId, latMod, windTier]);
      if (isEast) easterly.push([cellId + cellsX - 1, latMod, windTier]);
      if (isNorth) northerly++;
      if (isSouth) southerly++;
    });

    const passWind = (
      source: WindSource[],
      maxPrecInput: number,
      next: number,
      steps: number,
    ) => {
      const maxPrecInit = maxPrecInput;
      let maxPrec = maxPrecInput;

      for (let first of source) {
        if (Array.isArray(first)) {
          maxPrec = Math.min(maxPrecInit * first[1], 255);
          first = first[0];
        }

        let humidity = maxPrec - cells.h[first];
        if (humidity <= 0) continue;

        for (
          let step = 0, current = first;
          step < steps;
          step++, current += next
        ) {
          if (cells.temp[current] < -5) continue;

          if (cells.h[current] < 20) {
            if (cells.h[current + next] >= 20) {
              cells.prec[current + next] += Math.max(
                humidity / rand(10, 20),
                1,
              );
            } else {
              humidity = Math.min(humidity + 5 * modifier, maxPrec);
              cells.prec[current] += 5 * modifier;
            }
            continue;
          }

          const isPassable = cells.h[current + next] <= maxPassableElevation;
          const precipitation = isPassable
            ? this.getPrecipitation(cells, humidity, current, next, modifier)
            : humidity;
          cells.prec[current] += precipitation;
          const evaporation = precipitation > 1.5 ? 1 : 0;
          humidity = isPassable
            ? minmax(humidity - precipitation + evaporation, 0, maxPrec)
            : 0;
        }
      }
    };

    if (westerly.length) passWind(westerly, 120 * modifier, 1, cellsX);
    if (easterly.length) passWind(easterly, 120 * modifier, -1, cellsX);

    const verticalTotal = southerly + northerly;
    if (northerly) {
      const bandN = ((Math.abs(coordinates.latN) - 1) / 5) | 0;
      const latModN =
        coordinates.latT > 60
          ? (mean(latitudeModifier) ?? 1)
          : (latitudeModifier[bandN] ?? 1);
      const maxPrecN = (northerly / verticalTotal) * 60 * modifier * latModN;
      passWind(range(0, cellsX, 1), maxPrecN, cellsX, cellsY);
    }

    if (southerly) {
      const bandS = ((Math.abs(coordinates.latS) - 1) / 5) | 0;
      const latModS =
        coordinates.latT > 60
          ? (mean(latitudeModifier) ?? 1)
          : (latitudeModifier[bandS] ?? 1);
      const maxPrecS = (southerly / verticalTotal) * 60 * modifier * latModS;
      passWind(
        range(cells.i.length - cellsX, cells.i.length, 1),
        maxPrecS,
        -cellsX,
        cellsY,
      );
    }

    this.drawWindDirection(context, westerly, easterly, northerly, southerly);
    context.shouldTime && console.timeEnd("generatePrecipitation");
  }

  private calculateSeaLevelTemp({
    latitude,
    temperatureEquator,
    tempNorthTropic,
    northernGradient,
    tempSouthTropic,
    southernGradient,
    tropics,
    tropicalGradient,
  }: {
    latitude: number;
    temperatureEquator: number;
    tempNorthTropic: number;
    northernGradient: number;
    tempSouthTropic: number;
    southernGradient: number;
    tropics: number[];
    tropicalGradient: number;
  }) {
    const isTropical = latitude <= 16 && latitude >= -20;
    if (isTropical)
      return temperatureEquator - Math.abs(latitude) * tropicalGradient;

    return latitude > 0
      ? tempNorthTropic - (latitude - tropics[0]) * northernGradient
      : tempSouthTropic + (latitude - tropics[1]) * southernGradient;
  }

  private getAltitudeTemperatureDrop(heightValue: number, exponent: number) {
    if (heightValue < 20) return 0;
    const height = (heightValue - 18) ** exponent;
    return rn((height / 1000) * 6.5);
  }

  private getWindDirections(tier: number, winds: number[]) {
    const angle = winds[tier];

    const isWest = angle > 40 && angle < 140;
    const isEast = angle > 220 && angle < 320;
    const isNorth = angle > 100 && angle < 260;
    const isSouth = angle > 280 || angle < 80;

    return { isWest, isEast, isNorth, isSouth };
  }

  private getPrecipitation(
    cells: EngineGrid["cells"],
    humidity: number,
    cellId: number,
    next: number,
    modifier: number,
  ) {
    const normalLoss = Math.max(humidity / (10 * modifier), 1);
    const diff = Math.max(cells.h[cellId + next] - cells.h[cellId], 0);
    const mod = (cells.h[cellId + next] / 70) ** 2;
    return minmax(normalLoss + diff * mod, 1, humidity);
  }

  private drawWindDirection(
    context: ClimateRuntimeContext,
    westerly: Array<[number, number, number]>,
    easterly: Array<[number, number, number]>,
    northerly: number,
    southerly: number,
  ) {
    const { graphWidth, graphHeight, grid, precipitationLayer } = context;
    const wind = precipitationLayer.append("g").attr("id", "wind");

    range(0, 6).forEach((tier) => {
      if (westerly.length > 1) {
        const west = westerly.filter((windSource) => windSource[2] === tier);
        if (west && west.length > 3) {
          const from = west[0][0];
          const to = west[west.length - 1][0];
          const y = (grid.points[from][1] + grid.points[to][1]) / 2;
          wind
            .append("text")
            .attr("text-rendering", "optimizeSpeed")
            .attr("x", 20)
            .attr("y", y)
            .text("\u21C9");
        }
      }

      if (easterly.length > 1) {
        const east = easterly.filter((windSource) => windSource[2] === tier);
        if (east && east.length > 3) {
          const from = east[0][0];
          const to = east[east.length - 1][0];
          const y = (grid.points[from][1] + grid.points[to][1]) / 2;
          wind
            .append("text")
            .attr("text-rendering", "optimizeSpeed")
            .attr("x", graphWidth - 52)
            .attr("y", y)
            .text("\u21C7");
        }
      }
    });

    if (northerly)
      wind
        .append("text")
        .attr("text-rendering", "optimizeSpeed")
        .attr("x", graphWidth / 2)
        .attr("y", 42)
        .text("\u21CA");
    if (southerly)
      wind
        .append("text")
        .attr("text-rendering", "optimizeSpeed")
        .attr("x", graphWidth / 2)
        .attr("y", graphHeight - 20)
        .text("\u21C8");
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.Climate = new ClimateModule();
  runtimeWindow.calculateTemperatures = () =>
    runtimeWindow.Climate.calculateTemperatures();
  runtimeWindow.generatePrecipitation = () =>
    runtimeWindow.Climate.generatePrecipitation();
}

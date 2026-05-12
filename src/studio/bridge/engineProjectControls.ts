import { applyEngineWorldClimateRedraw } from "./engineProjectClimate";
import {
  createGlobalProjectControlTargets,
  type EngineProjectControlTargets,
} from "./engineProjectControlTargets";

function setEngineTemperatureControl(
  value: number,
  optionKey:
    | "temperatureEquator"
    | "temperatureNorthPole"
    | "temperatureSouthPole",
  targets: EngineProjectControlTargets = createGlobalProjectControlTargets(),
) {
  if (!Number.isFinite(value)) return;

  const nextValue = Math.min(50, Math.max(-50, Math.round(value)));
  targets.setOptionNumber(optionKey, nextValue);
  applyEngineWorldClimateRedraw();
}

function setEngineMapCoordinateControl(
  value: number,
  optionKey: "mapSize" | "latitude" | "longitude",
  targets: EngineProjectControlTargets = createGlobalProjectControlTargets(),
) {
  if (!Number.isFinite(value)) return;

  const min = optionKey === "mapSize" ? 1 : 0;
  const nextValue = Math.min(100, Math.max(min, Math.round(value * 10) / 10));
  targets.setMapPlacementPercent(optionKey, nextValue);
  targets.setOptionNumber(optionKey, nextValue);
  applyEngineWorldClimateRedraw();
}

function setEngineWindTierValue(
  tier: 0 | 1 | 2 | 3 | 4 | 5,
  value: number,
  targets: EngineProjectControlTargets = createGlobalProjectControlTargets(),
) {
  if (!Number.isFinite(value)) return;

  const nextValue = (((Math.round(value / 45) * 45) % 360) + 360) % 360;
  if (!targets.applyWindTierToRuntime(tier, nextValue)) return;
  applyEngineWorldClimateRedraw();
}

export function setEngineTemperatureEquator(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineTemperatureControl(value, "temperatureEquator", targets);
}

export function setEngineTemperatureNorthPole(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineTemperatureControl(value, "temperatureNorthPole", targets);
}

export function setEngineTemperatureSouthPole(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineTemperatureControl(value, "temperatureSouthPole", targets);
}

export function setEngineMapSize(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineMapCoordinateControl(value, "mapSize", targets);
}

export function setEngineLatitude(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineMapCoordinateControl(value, "latitude", targets);
}

export function setEngineLongitude(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineMapCoordinateControl(value, "longitude", targets);
}

export function setEngineWindTier0(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(0, value, targets);
}

export function setEngineWindTier1(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(1, value, targets);
}

export function setEngineWindTier2(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(2, value, targets);
}

export function setEngineWindTier3(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(3, value, targets);
}

export function setEngineWindTier4(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(4, value, targets);
}

export function setEngineWindTier5(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(5, value, targets);
}

export function setEnginePrecipitation(
  value: number,
  targets: EngineProjectControlTargets = createGlobalProjectControlTargets(),
) {
  if (!Number.isFinite(value)) return;

  const nextValue = Math.max(0, Math.min(500, Math.round(value)));
  targets.setPrecipitationPercent(nextValue);
  applyEngineWorldClimateRedraw();
}

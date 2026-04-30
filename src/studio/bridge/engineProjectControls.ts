import { applyEngineWorldClimateRedraw } from "./engineProjectClimate";
import {
  dispatchEnginePairChangeEvents,
  dispatchEnginePairInputEvents,
  lockEngineStoredSetting,
  setEngineNumberPair,
} from "./engineProjectControlDom";
import {
  createGlobalProjectControlTargets,
  type EngineProjectControlTargets,
} from "./engineProjectControlTargets";

function setEngineTemperatureControl(
  value: number,
  inputId: string,
  outputId: string,
  fahrenheitId: string,
  optionKey:
    | "temperatureEquator"
    | "temperatureNorthPole"
    | "temperatureSouthPole",
  targets: EngineProjectControlTargets = createGlobalProjectControlTargets(),
) {
  const pair = setEngineNumberPair(value, {
    inputId,
    outputId,
    fallbackMin: "-50",
    fallbackMax: "50",
    round: Math.round,
  });
  const fahrenheit = targets.getTemperatureLabel(fahrenheitId);
  if (!pair) return;

  lockEngineStoredSetting(pair.input, pair.output, optionKey);
  targets.setOptionNumber(optionKey, Number(pair.nextValue));

  if (fahrenheit) {
    const converted = targets.convertTemperature(
      Number(pair.nextValue),
      "\u00b0F",
    );
    fahrenheit.textContent =
      typeof converted === "string" || typeof converted === "number"
        ? String(converted)
        : fahrenheit.textContent || "";
  }

  dispatchEnginePairInputEvents(pair);
  if (applyEngineWorldClimateRedraw() !== "disabled") {
    dispatchEnginePairChangeEvents(pair);
  }
}

function setEngineMapCoordinateControl(
  value: number,
  inputId: string,
  outputId: string,
  optionKey: "mapSize" | "latitude" | "longitude",
) {
  const pair = setEngineNumberPair(value, {
    inputId,
    outputId,
    fallbackMin: optionKey === "mapSize" ? "1" : "0",
    fallbackMax: "100",
    round: (next) => Math.round(next * 10) / 10,
  });
  if (!pair) return;

  lockEngineStoredSetting(pair.input, pair.output, optionKey);
  dispatchEnginePairInputEvents(pair);
  if (
    applyEngineWorldClimateRedraw({
      updateGlobePosition: true,
      updateGlobeTemperature: true,
    }) !== "disabled"
  ) {
    dispatchEnginePairChangeEvents(pair);
  }
}

function getEngineWindTransformPoint(transform: string, fallback: string) {
  const match = transform.match(/rotate\(([-\d.]+)\s+([\d.-]+)\s+([\d.-]+)\)/);
  const fallbackMatch = fallback.match(
    /rotate\(([-\d.]+)\s+([\d.-]+)\s+([\d.-]+)\)/,
  );
  return {
    cx: match?.[2] || fallbackMatch?.[2] || "210",
    cy: match?.[3] || fallbackMatch?.[3] || "6",
  };
}

function setEngineWindTierValue(
  tier: 0 | 1 | 2 | 3 | 4 | 5,
  value: number,
  fallbackTransform: string,
  targets: EngineProjectControlTargets = createGlobalProjectControlTargets(),
) {
  if (!Number.isFinite(value)) return;

  const nextValue = (((Math.round(value / 45) * 45) % 360) + 360) % 360;
  const currentTransform = targets.getWindTransform(tier);
  if (currentTransform === null) return;
  const transform = currentTransform || fallbackTransform;
  const { cx, cy } = getEngineWindTransformPoint(transform, fallbackTransform);
  targets.setWindTransform(tier, `rotate(${nextValue} ${cx} ${cy})`);

  if (!targets.applyWindTierToRuntime(tier, nextValue)) return;
  applyEngineWorldClimateRedraw({
    updateGlobePosition: true,
    updateGlobeTemperature: true,
  });
}

export function setEngineTemperatureEquator(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineTemperatureControl(
    value,
    "temperatureEquatorInput",
    "temperatureEquatorOutput",
    "temperatureEquatorF",
    "temperatureEquator",
    targets,
  );
}

export function setEngineTemperatureNorthPole(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineTemperatureControl(
    value,
    "temperatureNorthPoleInput",
    "temperatureNorthPoleOutput",
    "temperatureNorthPoleF",
    "temperatureNorthPole",
    targets,
  );
}

export function setEngineTemperatureSouthPole(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineTemperatureControl(
    value,
    "temperatureSouthPoleInput",
    "temperatureSouthPoleOutput",
    "temperatureSouthPoleF",
    "temperatureSouthPole",
    targets,
  );
}

export function setEngineMapSize(value: number) {
  setEngineMapCoordinateControl(
    value,
    "mapSizeInput",
    "mapSizeOutput",
    "mapSize",
  );
}

export function setEngineLatitude(value: number) {
  setEngineMapCoordinateControl(
    value,
    "latitudeInput",
    "latitudeOutput",
    "latitude",
  );
}

export function setEngineLongitude(value: number) {
  setEngineMapCoordinateControl(
    value,
    "longitudeInput",
    "longitudeOutput",
    "longitude",
  );
}

export function setEngineWindTier0(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(0, value, "rotate(225 210 6)", targets);
}

export function setEngineWindTier1(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(1, value, "rotate(45 210 30)", targets);
}

export function setEngineWindTier2(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(2, value, "rotate(225 210 54)", targets);
}

export function setEngineWindTier3(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(3, value, "rotate(315 210 78)", targets);
}

export function setEngineWindTier4(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(4, value, "rotate(135 210 102)", targets);
}

export function setEngineWindTier5(
  value: number,
  targets?: EngineProjectControlTargets,
) {
  setEngineWindTierValue(5, value, "rotate(315 210 126)", targets);
}

export function setEnginePrecipitation(value: number) {
  const pair = setEngineNumberPair(value, {
    inputId: "precInput",
    outputId: "precOutput",
    fallbackMin: "0",
    fallbackMax: "500",
    round: Math.round,
    boundsSource: "output-first",
  });
  if (!pair) return;

  lockEngineStoredSetting(pair.input, pair.output, "prec");
  dispatchEnginePairInputEvents(pair);
  if (applyEngineWorldClimateRedraw() !== "disabled") {
    dispatchEnginePairChangeEvents(pair);
  }
}

import type {
  AgmWritableBiomeData,
  EngineBiomeSummaryItem,
  EngineEntitySummary,
  EngineEntitySummaryItem,
  EngineProvinceSummaryItem,
  EngineRouteSummaryItem,
  EngineWorldResourceSummary,
  EngineZoneSummaryItem,
} from "./engineActionTypes";
import {
  createGlobalResourceSummaryTargets,
  type EngineResourceSummaryTargets,
} from "./engineResourceSummaryTargets";

function finiteNumberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function compactEntity(
  item: Record<string, unknown>,
): EngineEntitySummaryItem | null {
  const id = finiteNumberOrUndefined(item.i);
  const name = stringOrUndefined(item.name);
  if (!id || !name || item.removed === true) return null;

  return {
    id,
    name,
    fullName: stringOrUndefined(item.fullName),
    formName: stringOrUndefined(item.formName),
    form: stringOrUndefined(item.form),
    type:
      stringOrUndefined(item.type) ||
      stringOrUndefined(item.form) ||
      stringOrUndefined(item.formName),
    state: finiteNumberOrUndefined(item.state),
    culture: finiteNumberOrUndefined(item.culture),
    capital: finiteNumberOrUndefined(item.capital),
    population: finiteNumberOrUndefined(item.population),
    cells: finiteNumberOrUndefined(item.cells),
    area: finiteNumberOrUndefined(item.area),
    rural: finiteNumberOrUndefined(item.rural),
    urban: finiteNumberOrUndefined(item.urban),
    neighbors: Array.isArray(item.neighbors)
      ? item.neighbors.map(Number).filter(Number.isFinite)
      : undefined,
    diplomacy: Array.isArray(item.diplomacy)
      ? item.diplomacy.map((value) => String(value))
      : undefined,
    color: stringOrUndefined(item.color),
  };
}

function summarizeEntities(value: unknown, limit = 24) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? compactEntity(item as Record<string, unknown>)
        : null,
    )
    .filter((item) => item !== null)
    .slice(0, limit);
}

export function getEngineBiomeData(
  targets: EngineResourceSummaryTargets = createGlobalResourceSummaryTargets(),
) {
  const data = targets.getBiomeData();
  targets.setBiomeData(data);
  return data;
}

function summarizeBiomes(
  targets: EngineResourceSummaryTargets,
): EngineBiomeSummaryItem[] {
  const data = getEngineBiomeData(targets) as
    | (AgmWritableBiomeData & {
        i: number[];
        name: Record<number, string>;
        color: Record<number, string>;
        cost: Record<number, number>;
        iconsDensity: Record<number, number>;
      })
    | undefined;
  if (!data) return [];

  return data.i
    .map((id) => ({
      id,
      name: data.name[id],
      color: data.color[id],
      habitability: finiteNumberOrUndefined(data.habitability[id]),
      movementCost: finiteNumberOrUndefined(data.cost[id]),
      iconDensity: finiteNumberOrUndefined(data.iconsDensity[id]),
      agmRuleWeight: finiteNumberOrUndefined(data.agmRuleWeight?.[id]),
      agmResourceTag: stringOrUndefined(data.agmResourceTag?.[id]),
    }))
    .filter((item) => item.name);
}

function compactProvince(
  item: Record<string, unknown>,
): EngineProvinceSummaryItem | null {
  const id = finiteNumberOrUndefined(item.i);
  const name = stringOrUndefined(item.name);
  if (!id || !name || item.removed === true) return null;

  return {
    id,
    name,
    fullName: stringOrUndefined(item.fullName),
    type: stringOrUndefined(item.formName) || stringOrUndefined(item.type),
    state: finiteNumberOrUndefined(item.state),
    burg: finiteNumberOrUndefined(item.burg),
    center: finiteNumberOrUndefined(item.center),
    color: stringOrUndefined(item.color),
  };
}

function summarizeProvinces(value: unknown, limit = 160) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? compactProvince(item as Record<string, unknown>)
        : null,
    )
    .filter((item) => item !== null)
    .slice(0, limit);
}

function compactRoute(
  item: Record<string, unknown>,
): EngineRouteSummaryItem | null {
  const id = finiteNumberOrUndefined(item.i);
  if (id === undefined) return null;
  const points = Array.isArray(item.points) ? item.points : [];
  const firstPoint = points.find(
    (point) => typeof point === "number" && Number.isFinite(point),
  );

  return {
    id,
    group: stringOrUndefined(item.group),
    feature: finiteNumberOrUndefined(item.feature),
    pointCount: points.length || undefined,
    startCell:
      finiteNumberOrUndefined(item.cell) ??
      (typeof firstPoint === "number" ? firstPoint : undefined),
  };
}

function summarizeRoutes(value: unknown, limit = 160) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? compactRoute(item as Record<string, unknown>)
        : null,
    )
    .filter((item) => item !== null)
    .slice(0, limit);
}

function compactZone(
  item: Record<string, unknown>,
  targets: EngineResourceSummaryTargets,
): EngineZoneSummaryItem | null {
  const id = finiteNumberOrUndefined(item.i);
  const name = stringOrUndefined(item.name);
  if (id === undefined || !name) return null;
  const cells = Array.isArray(item.cells)
    ? item.cells.map(Number).filter(Number.isFinite)
    : [];
  const area = cells.reduce(
    (total, cellId) => total + (targets.getCellArea(cellId) || 0),
    0,
  );
  const population = cells.reduce(
    (total, cellId) => total + (targets.getCellPopulation(cellId) || 0),
    0,
  );

  return {
    id,
    name,
    type: stringOrUndefined(item.type),
    color: stringOrUndefined(item.color),
    cellCount: cells.length,
    hidden: item.hidden === true,
    area: area || undefined,
    population: population || undefined,
  };
}

function summarizeZones(
  value: unknown,
  targets: EngineResourceSummaryTargets,
  limit = 160,
) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? compactZone(item as Record<string, unknown>, targets)
        : null,
    )
    .filter((item) => item !== null)
    .slice(0, limit);
}

export function getEngineWorldResourceSummary(
  targets: EngineResourceSummaryTargets = createGlobalResourceSummaryTargets(),
): EngineWorldResourceSummary {
  return {
    biomes: summarizeBiomes(targets),
    provinces: summarizeProvinces(targets.getProvinces()),
    routes: summarizeRoutes(targets.getRoutes()),
    zones: summarizeZones(targets.getZones(), targets),
  };
}

export function getEngineEntitySummary(
  targets: EngineResourceSummaryTargets = createGlobalResourceSummaryTargets(),
): EngineEntitySummary {
  return {
    states: summarizeEntities(targets.getStates()),
    burgs: summarizeEntities(targets.getBurgs(), 200),
    cultures: summarizeEntities(targets.getCultures(), 80),
    religions: summarizeEntities(targets.getReligions(), 80),
  };
}

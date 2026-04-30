import type {
  EngineFocusGeometry,
  EngineFocusTarget,
} from "./engineActionTypes";
import {
  createGlobalFocusGeometryTargets,
  type EngineFocusGeometryTargets,
} from "./engineFocusGeometryTargets";

function finiteNumberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function averageCellPoints(
  cellIds: number[],
  targets: EngineFocusGeometryTargets,
) {
  const points = cellIds
    .map((cellId) => targets.getCellPoint(cellId))
    .filter((point): point is [number, number] => Array.isArray(point));
  if (!points.length) return null;

  return points.reduce((sum, [x, y]) => ({ x: sum.x + x, y: sum.y + y }), {
    x: 0,
    y: 0,
  });
}

function normalizeFocusGeometry(
  target: EngineFocusTarget,
  x: number | undefined,
  y: number | undefined,
  targets: EngineFocusGeometryTargets,
): EngineFocusGeometry {
  const width = finiteNumberOrUndefined(targets.getWidth()) || 1;
  const height = finiteNumberOrUndefined(targets.getHeight()) || 1;
  if (x === undefined || y === undefined) return target;

  return {
    ...target,
    x: Math.max(0, Math.min(100, (x / width) * 100)),
    y: Math.max(0, Math.min(100, (y / height) * 100)),
    width,
    height,
  };
}

function resolveStateFocusGeometry(
  target: EngineFocusTarget,
  targets: EngineFocusGeometryTargets,
) {
  const state = targets.getState(target.targetId);
  const center = finiteNumberOrUndefined(state?.center);
  const capital = finiteNumberOrUndefined(state?.capital);
  const capitalBurg =
    capital === undefined ? undefined : targets.getBurg(capital);
  const cellPoint =
    center === undefined ? undefined : targets.getCellPoint(center);
  if (cellPoint)
    return normalizeFocusGeometry(target, cellPoint[0], cellPoint[1], targets);
  const capitalBurgX = finiteNumberOrUndefined(capitalBurg?.x);
  const capitalBurgY = finiteNumberOrUndefined(capitalBurg?.y);
  if (capitalBurgX !== undefined && capitalBurgY !== undefined)
    return normalizeFocusGeometry(target, capitalBurgX, capitalBurgY, targets);

  const cellIds = targets
    .getCellIds()
    .filter(
      (cellId) =>
        targets.getCellFieldValue("state", cellId) === target.targetId,
    );
  const sum = averageCellPoints(cellIds, targets);
  return sum
    ? normalizeFocusGeometry(
        target,
        sum.x / cellIds.length,
        sum.y / cellIds.length,
        targets,
      )
    : target;
}

function resolveProvinceFocusGeometry(
  target: EngineFocusTarget,
  targets: EngineFocusGeometryTargets,
) {
  const province = targets.getProvince(target.targetId);
  const center = finiteNumberOrUndefined(province?.center);
  const burg = finiteNumberOrUndefined(province?.burg);
  const provinceBurg = burg === undefined ? undefined : targets.getBurg(burg);
  const cellPoint =
    center === undefined ? undefined : targets.getCellPoint(center);
  if (cellPoint)
    return normalizeFocusGeometry(target, cellPoint[0], cellPoint[1], targets);
  const provinceBurgX = finiteNumberOrUndefined(provinceBurg?.x);
  const provinceBurgY = finiteNumberOrUndefined(provinceBurg?.y);
  if (provinceBurgX !== undefined && provinceBurgY !== undefined)
    return normalizeFocusGeometry(
      target,
      provinceBurgX,
      provinceBurgY,
      targets,
    );

  const cellIds = targets
    .getCellIds()
    .filter(
      (cellId) =>
        targets.getCellFieldValue("province", cellId) === target.targetId,
    );
  const sum = averageCellPoints(cellIds, targets);
  return sum
    ? normalizeFocusGeometry(
        target,
        sum.x / cellIds.length,
        sum.y / cellIds.length,
        targets,
      )
    : target;
}

function resolveBurgFocusGeometry(
  target: EngineFocusTarget,
  targets: EngineFocusGeometryTargets,
) {
  const burg = targets.getBurg(target.targetId);
  const x = finiteNumberOrUndefined(burg?.x);
  const y = finiteNumberOrUndefined(burg?.y);
  if (x !== undefined && y !== undefined)
    return normalizeFocusGeometry(target, x, y, targets);

  const cell = finiteNumberOrUndefined(burg?.cell);
  const cellPoint = cell === undefined ? undefined : targets.getCellPoint(cell);
  return cellPoint
    ? normalizeFocusGeometry(target, cellPoint[0], cellPoint[1], targets)
    : target;
}

function resolveBiomeFocusGeometry(
  target: EngineFocusTarget,
  targets: EngineFocusGeometryTargets,
) {
  const cellIds = targets
    .getCellIds()
    .filter(
      (cellId) =>
        targets.getCellFieldValue("biome", cellId) === target.targetId,
    )
    .slice(0, 240);
  const sum = averageCellPoints(cellIds, targets);
  return sum
    ? normalizeFocusGeometry(
        target,
        sum.x / cellIds.length,
        sum.y / cellIds.length,
        targets,
      )
    : target;
}

function resolveRouteFocusGeometry(
  target: EngineFocusTarget,
  targets: EngineFocusGeometryTargets,
) {
  const route = targets.getRoute(target.targetId);
  const routePoints = Array.isArray(route?.points) ? route.points : [];
  const cellIds = routePoints
    .map((point) =>
      typeof point === "number"
        ? point
        : Array.isArray(point) && typeof point[0] === "number"
          ? point[0]
          : undefined,
    )
    .filter(
      (point): point is number =>
        typeof point === "number" && Number.isFinite(point),
    );
  const sum = averageCellPoints(cellIds, targets);
  if (sum && cellIds.length)
    return normalizeFocusGeometry(
      target,
      sum.x / cellIds.length,
      sum.y / cellIds.length,
      targets,
    );

  const routeCells = Array.isArray(route?.cells) ? route.cells : [];
  const firstRouteCell = routeCells.find(
    (cell) => typeof cell === "number" && Number.isFinite(cell),
  );
  const startCell =
    finiteNumberOrUndefined(route?.cell) ??
    (typeof firstRouteCell === "number" ? firstRouteCell : cellIds[0]);
  const cellPoint =
    startCell === undefined ? undefined : targets.getCellPoint(startCell);
  return cellPoint
    ? normalizeFocusGeometry(target, cellPoint[0], cellPoint[1], targets)
    : target;
}

function resolveCultureFocusGeometry(
  target: EngineFocusTarget,
  targets: EngineFocusGeometryTargets,
) {
  const cellIds = targets
    .getCellIds()
    .filter(
      (cellId) =>
        targets.getCellFieldValue("culture", cellId) === target.targetId,
    )
    .slice(0, 240);
  const sum = averageCellPoints(cellIds, targets);
  return sum && cellIds.length
    ? normalizeFocusGeometry(
        target,
        sum.x / cellIds.length,
        sum.y / cellIds.length,
        targets,
      )
    : target;
}

function resolveReligionFocusGeometry(
  target: EngineFocusTarget,
  targets: EngineFocusGeometryTargets,
) {
  const cellIds = targets
    .getCellIds()
    .filter(
      (cellId) =>
        targets.getCellFieldValue("religion", cellId) === target.targetId,
    )
    .slice(0, 240);
  const sum = averageCellPoints(cellIds, targets);
  return sum && cellIds.length
    ? normalizeFocusGeometry(
        target,
        sum.x / cellIds.length,
        sum.y / cellIds.length,
        targets,
      )
    : target;
}

function resolveZoneFocusGeometry(
  target: EngineFocusTarget,
  targets: EngineFocusGeometryTargets,
) {
  const zone = targets.getZone(target.targetId);
  const cellIds = (Array.isArray(zone?.cells) ? zone.cells : [])
    .map(Number)
    .filter(Number.isFinite)
    .slice(0, 240);
  const sum = averageCellPoints(cellIds, targets);
  return sum && cellIds.length
    ? normalizeFocusGeometry(
        target,
        sum.x / cellIds.length,
        sum.y / cellIds.length,
        targets,
      )
    : target;
}

export function resolveEngineFocusGeometry(
  target: EngineFocusTarget,
  targets: EngineFocusGeometryTargets = createGlobalFocusGeometryTargets(),
): EngineFocusGeometry {
  if (target.targetType === "state")
    return resolveStateFocusGeometry(target, targets);
  if (target.targetType === "province")
    return resolveProvinceFocusGeometry(target, targets);
  if (target.targetType === "burg")
    return resolveBurgFocusGeometry(target, targets);
  if (target.targetType === "route")
    return resolveRouteFocusGeometry(target, targets);
  if (target.targetType === "culture")
    return resolveCultureFocusGeometry(target, targets);
  if (target.targetType === "religion")
    return resolveReligionFocusGeometry(target, targets);
  if (target.targetType === "zone")
    return resolveZoneFocusGeometry(target, targets);
  return resolveBiomeFocusGeometry(target, targets);
}

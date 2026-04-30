import {
  createGlobalRenderAdapter,
  type EngineRenderAdapter,
} from "../../modules/engine-render-adapter";
import {
  createGlobalRouteService,
  type EngineRouteService,
} from "../../modules/engine-route-service";
import type {
  EngineAutoFixPreviewChange,
  EngineAutoFixWritebackResult,
} from "./engineActionTypes";
import {
  createGlobalRouteWritebackTargets,
  type EngineRouteWritebackTargets,
} from "./engineAutoFixRouteTargets";
import { createEmptyEngineAutoFixWritebackResult } from "./engineAutoFixWritebackResult";

export function applyEngineRoutePreviewChanges(
  changes: EngineAutoFixPreviewChange[],
  routes: EngineRouteService = createGlobalRouteService(),
  rendering: EngineRenderAdapter = createGlobalRenderAdapter(),
  targets: EngineRouteWritebackTargets = createGlobalRouteWritebackTargets(),
): EngineAutoFixWritebackResult {
  const result = createEmptyEngineAutoFixWritebackResult();
  const { createdRouteIds, updatedProvinces } = result;

  changes.forEach((change) => {
    if (change.operation !== "link" || change.entity !== "route") return;
    const cellId = targets.resolveRouteCell(change);
    if (typeof cellId !== "number" || !Number.isFinite(cellId)) return;
    const route = routes.connect(cellId);
    if (route && typeof route.i === "number" && Number.isFinite(route.i)) {
      createdRouteIds.push(route.i);
      if (rendering.isLayerOn("toggleRoutes")) rendering.drawRoute(route);
    }

    const fromProvince = change.fields?.fromProvince;
    const toProvince = change.fields?.toProvince;
    const nextAgmConnectorType = change.fields?.connectorType;
    if (
      typeof fromProvince !== "number" ||
      !Number.isFinite(fromProvince) ||
      typeof toProvince !== "number" ||
      !Number.isFinite(toProvince) ||
      typeof nextAgmConnectorType !== "string"
    )
      return;
    const province = targets.getWritableProvince(fromProvince);
    if (!province) return;
    const previousAgmConnectorTarget =
      typeof province.agmConnectorTarget === "number" &&
      Number.isFinite(province.agmConnectorTarget)
        ? province.agmConnectorTarget
        : null;
    const previousAgmConnectorType =
      typeof province.agmConnectorType === "string"
        ? province.agmConnectorType
        : null;
    province.agmConnectorTarget = toProvince;
    province.agmConnectorType = nextAgmConnectorType;
    updatedProvinces.push({
      provinceId: fromProvince,
      previousAgmConnectorTarget,
      nextAgmConnectorTarget: toProvince,
      previousAgmConnectorType,
      nextAgmConnectorType,
    });
  });

  return result;
}

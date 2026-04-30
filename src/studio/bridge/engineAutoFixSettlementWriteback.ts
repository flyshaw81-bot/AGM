import {
  createGlobalBurgService,
  type EngineBurgService,
} from "../../modules/engine-burg-service";
import type {
  AgmWritableBurg,
  EngineAutoFixPreviewChange,
  EngineAutoFixWritebackResult,
} from "./engineActionTypes";
import {
  createGlobalSettlementWritebackTargets,
  type EngineSettlementWritebackTargets,
} from "./engineAutoFixSettlementTargets";
import { createEmptyEngineAutoFixWritebackResult } from "./engineAutoFixWritebackResult";

export function applyEngineSettlementPreviewChanges(
  changes: EngineAutoFixPreviewChange[],
  burgs: EngineBurgService = createGlobalBurgService(),
  targets: EngineSettlementWritebackTargets = createGlobalSettlementWritebackTargets(),
): EngineAutoFixWritebackResult {
  const result = createEmptyEngineAutoFixWritebackResult();
  const { createdBurgIds } = result;

  changes.forEach((change) => {
    if (change.operation !== "create" || change.entity !== "burg") return;
    const point = targets.resolveSettlementPoint(change);
    if (!point) return;
    const burgId = burgs.add([point.x, point.y]);
    if (typeof burgId !== "number" || !Number.isFinite(burgId)) return;
    const burg = burgs.findById(burgId) as unknown as
      | AgmWritableBurg
      | undefined;
    const provisionalName = change.fields?.provisionalName;
    const agmRole = change.fields?.agmRole;
    const agmPriority = change.fields?.priority;
    const agmSupportState = change.fields?.agmSupportState;
    if (burg && typeof provisionalName === "string")
      burg.name = provisionalName;
    if (burg && typeof agmRole === "string") burg.agmRole = agmRole;
    if (burg && typeof agmPriority === "string") burg.agmPriority = agmPriority;
    if (
      burg &&
      typeof agmSupportState === "number" &&
      Number.isFinite(agmSupportState)
    )
      burg.agmSupportState = agmSupportState;
    createdBurgIds.push(burgId);
  });

  return result;
}

import {
  createGlobalBurgService,
  type EngineBurgService,
} from "../../modules/engine-burg-service";
import {
  createGlobalRouteService,
  type EngineRouteService,
} from "../../modules/engine-route-service";
import type { EngineAutoFixWritebackResult } from "./engineActionTypes";
import {
  createGlobalAutoFixUndoTargets,
  type EngineAutoFixUndoTargets,
} from "./engineAutoFixUndoTargets";

export function undoEngineAutoFixWriteback(
  writeback: EngineAutoFixWritebackResult | undefined,
  routes: EngineRouteService = createGlobalRouteService(),
  burgs: EngineBurgService = createGlobalBurgService(),
  targets: EngineAutoFixUndoTargets = createGlobalAutoFixUndoTargets(),
) {
  writeback?.updatedProvinces
    .slice()
    .reverse()
    .forEach((entry) => {
      const province = targets.getWritableProvince(entry.provinceId);
      if (!province) return;
      if (entry.previousAgmConnectorTarget === null)
        delete province.agmConnectorTarget;
      else province.agmConnectorTarget = entry.previousAgmConnectorTarget;
      if (entry.previousAgmConnectorType === null)
        delete province.agmConnectorType;
      else province.agmConnectorType = entry.previousAgmConnectorType;
    });

  writeback?.updatedStates
    .slice()
    .reverse()
    .forEach((entry) => {
      const state = targets.getWritableState(entry.stateId);
      if (!state) return;
      if (entry.previousAgmFairStart === null) delete state.agmFairStart;
      else state.agmFairStart = entry.previousAgmFairStart;
      if (entry.previousAgmFairStartScore === null)
        delete state.agmFairStartScore;
      else state.agmFairStartScore = entry.previousAgmFairStartScore;
      if (entry.previousAgmPriority === null) delete state.agmPriority;
      else state.agmPriority = entry.previousAgmPriority;
    });

  const biomeData = targets.getWritableBiomeData();
  if (biomeData) {
    writeback?.updatedBiomes
      .slice()
      .reverse()
      .forEach((entry) => {
        biomeData.habitability[entry.biomeId] = entry.previousHabitability ?? 0;
        if (entry.previousAgmRuleWeight === null)
          delete biomeData.agmRuleWeight?.[entry.biomeId];
        else {
          biomeData.agmRuleWeight ||= {};
          biomeData.agmRuleWeight[entry.biomeId] = entry.previousAgmRuleWeight;
        }
        if (entry.previousAgmResourceTag === null)
          delete biomeData.agmResourceTag?.[entry.biomeId];
        else {
          biomeData.agmResourceTag ||= {};
          biomeData.agmResourceTag[entry.biomeId] =
            entry.previousAgmResourceTag;
        }
      });
  }

  writeback?.createdRouteIds
    .slice()
    .reverse()
    .forEach((routeId) => {
      const route = routes.findById(routeId);
      if (route) routes.remove(route);
    });

  writeback?.createdBurgIds
    .slice()
    .reverse()
    .forEach((burgId) => {
      burgs.remove(burgId);
    });
}

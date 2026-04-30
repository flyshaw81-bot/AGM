import type { LayerAction } from "./engineActionTypes";
import { LAYER_ACTIONS } from "./engineActionTypes";
import {
  createGlobalLayerTargets,
  type EngineLayerTargets,
} from "./engineLayerTargets";

export function getEngineLayerStates(
  targets: EngineLayerTargets = createGlobalLayerTargets(),
) {
  return Object.fromEntries(
    LAYER_ACTIONS.map((action) => [
      action,
      targets.hasLayerHandler(action) ? targets.isLayerOn(action) : false,
    ]),
  ) as Record<LayerAction, boolean>;
}

export function getEngineLayerDetails(
  targets: EngineLayerTargets = createGlobalLayerTargets(),
) {
  const states = getEngineLayerStates(targets);

  return targets.getLayerDetails().map((item) => ({
    ...item,
    id: item.id as LayerAction,
    active: states[item.id as LayerAction] ?? false,
  }));
}

export function toggleEngineLayer(
  action: LayerAction,
  targets: EngineLayerTargets = createGlobalLayerTargets(),
) {
  targets.toggleLayer(action);
}

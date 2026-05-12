import type { StudioShellEventHandlers } from "../layout/shellEvents";
import type { StudioState } from "../types";
import {
  createGlobalDirectEditorActionTargets,
  type DirectEditorActionTargets,
} from "./directEditorActionTargets";
import { createDirectEditorEntityActionHandlers } from "./directEditorEntityActionHandlers";

type DirectEditorActionHandlers = Pick<
  StudioShellEventHandlers,
  | "onDirectStateSelect"
  | "onDirectStateApply"
  | "onDirectStateReset"
  | "onDirectStateListChange"
  | "onDirectBurgSelect"
  | "onDirectBurgApply"
  | "onDirectBurgReset"
  | "onDirectBurgListChange"
  | "onDirectCultureSelect"
  | "onDirectCultureApply"
  | "onDirectCultureReset"
  | "onDirectCultureListChange"
  | "onDirectReligionSelect"
  | "onDirectReligionApply"
  | "onDirectReligionReset"
  | "onDirectReligionListChange"
  | "onDirectProvinceSelect"
  | "onDirectProvinceApply"
  | "onDirectProvinceReset"
  | "onDirectProvinceListChange"
  | "onDirectRouteSelect"
  | "onDirectRouteApply"
  | "onDirectRouteReset"
  | "onDirectRouteListChange"
  | "onDirectZoneSelect"
  | "onDirectZoneApply"
  | "onDirectZoneReset"
  | "onDirectZoneListChange"
  | "onDirectMarkerSelect"
  | "onDirectMarkerApply"
  | "onDirectMarkerReset"
  | "onDirectMarkerListChange"
  | "onDirectDiplomacySubjectSelect"
  | "onDirectDiplomacyObjectSelect"
  | "onDirectDiplomacyApply"
  | "onDirectDiplomacyReset"
  | "onDirectDiplomacyListChange"
  | "onDirectMilitaryListChange"
  | "onDirectBiomeSelect"
  | "onDirectBiomeApply"
  | "onDirectBiomeReset"
  | "onDirectBiomeListChange"
  | "onDirectRelationshipQueueHistoryChange"
>;

type DirectEditorActionHandlersContext = {
  root: HTMLElement;
  state: StudioState;
  render: (root: HTMLElement, state: StudioState) => void;
  targets?: DirectEditorActionTargets;
};

export function createDirectEditorActionHandlers({
  root,
  state,
  render,
  targets = createGlobalDirectEditorActionTargets(),
}: DirectEditorActionHandlersContext): DirectEditorActionHandlers {
  const syncAndRender = () => {
    targets.syncDocument(state);
    render(root, state);
  };
  const applyDirectEditorPatch = (
    patch: Partial<StudioState["directEditor"]>,
  ) => {
    state.directEditor = { ...state.directEditor, ...patch };
    syncAndRender();
  };

  return {
    ...createDirectEditorEntityActionHandlers({
      state,
      syncAndRender,
      targets,
    }),
    onDirectDiplomacySubjectSelect: (stateId) => {
      if (!Number.isFinite(stateId)) return;
      state.shell.activeEditorModule = "diplomacy";
      state.directEditor.selectedDiplomacySubjectId = stateId;
      state.directEditor.selectedDiplomacyObjectId = null;
      state.directEditor.lastAppliedDiplomacyPair = null;
      syncAndRender();
    },
    onDirectDiplomacyObjectSelect: (stateId) => {
      if (!Number.isFinite(stateId)) return;
      state.directEditor.selectedDiplomacyObjectId = stateId;
      state.directEditor.lastAppliedDiplomacyPair = null;
      state.shell.activeEditorModule = "diplomacy";
      state.balanceFocus = targets.resolveFocusGeometry({
        targetType: "state",
        targetId: stateId,
        sourceLabel: "direct-diplomacy-workbench",
        action: "focus",
      });
      state.section = "editors";
      syncAndRender();
    },
    onDirectDiplomacyApply: (subjectId, objectId, next) => {
      if (!Number.isFinite(subjectId) || !Number.isFinite(objectId)) return;
      state.directEditor.selectedDiplomacySubjectId = subjectId;
      state.directEditor.selectedDiplomacyObjectId = objectId;
      targets.updateDiplomacy(subjectId, objectId, next);
      state.directEditor.lastAppliedDiplomacyPair = `${subjectId}:${objectId}`;
      state.document.source = "core";
      syncAndRender();
    },
    onDirectDiplomacyReset: (subjectId, objectId) => {
      if (!Number.isFinite(subjectId) || !Number.isFinite(objectId)) return;
      state.directEditor.selectedDiplomacySubjectId = subjectId;
      state.directEditor.selectedDiplomacyObjectId = objectId;
      state.directEditor.lastAppliedDiplomacyPair = null;
      syncAndRender();
    },
    onDirectDiplomacyListChange: applyDirectEditorPatch,
    onDirectMilitaryListChange: applyDirectEditorPatch,
    onDirectRelationshipQueueHistoryChange: (history) => {
      state.directEditor.relationshipQueueHistory = history;
      if (history) {
        state.directEditor.relationshipQueueHistoryLog = [
          history,
          ...state.directEditor.relationshipQueueHistoryLog.filter(
            (item) => item.id !== history.id,
          ),
        ].slice(0, 4);
      }
      syncAndRender();
    },
  };
}

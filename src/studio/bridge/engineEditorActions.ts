import type { EditorAction } from "./engineActionTypes";
import { EDITOR_ACTIONS } from "./engineActionTypes";
import {
  createGlobalEngineEditorTargets,
  type EngineEditorTargets,
} from "./engineEditorTargets";

const EDITOR_DIALOG_IDS = {
  editStates: "statesEditor",
  editCultures: "culturesEditor",
  editReligions: "religionsEditor",
  editBiomes: "biomesEditor",
  editProvinces: "provincesEditor",
  editZones: "zonesEditor",
  editDiplomacy: "diplomacyEditor",
} satisfies Record<EditorAction, string>;

export function getEngineEditorAvailability(
  targets = createGlobalEngineEditorTargets(),
) {
  return Object.fromEntries(
    EDITOR_ACTIONS.map((action) => [action, targets.hasEditorHandler(action)]),
  ) as Record<EditorAction, boolean>;
}

export function getEngineEditorDialogId(action: EditorAction) {
  return EDITOR_DIALOG_IDS[action];
}

export function isEngineEditorOpen(
  action: EditorAction,
  targets = createGlobalEngineEditorTargets(),
) {
  const dialogId = getEngineEditorDialogId(action);
  return targets.isDialogOpen(dialogId);
}

export function getOpenEngineEditor(
  targets = createGlobalEngineEditorTargets(),
) {
  return (
    EDITOR_ACTIONS.find((action) => isEngineEditorOpen(action, targets)) ?? null
  );
}

export function syncEngineEditorState(
  targets = createGlobalEngineEditorTargets(),
) {
  const activeEditor = getOpenEngineEditor(targets);
  return {
    activeEditor,
    editorDialogOpen: Boolean(activeEditor),
  };
}

export function closeEngineEditor(
  action: EditorAction,
  targets = createGlobalEngineEditorTargets(),
) {
  const dialogId = getEngineEditorDialogId(action);
  targets.closeDialog(dialogId);
}

export async function openEngineEditor(
  action: EditorAction,
  targets: EngineEditorTargets = createGlobalEngineEditorTargets(),
) {
  EDITOR_ACTIONS.filter((editorAction) => editorAction !== action).forEach(
    (editorAction) => {
      closeEngineEditor(editorAction, targets);
    },
  );

  await targets.runEditorHandler(action);
}

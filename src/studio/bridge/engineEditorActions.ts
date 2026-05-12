import type { EditorAction } from "./engineActionTypes";
import { EDITOR_ACTIONS } from "./engineActionTypes";
import {
  createGlobalEngineEditorTargets,
  type EngineEditorTargets,
} from "./engineEditorTargets";

export function getEngineEditorAvailability(
  targets = createGlobalEngineEditorTargets(),
) {
  return Object.fromEntries(
    EDITOR_ACTIONS.map((action) => [action, targets.hasEditorHandler(action)]),
  ) as Record<EditorAction, boolean>;
}

export function isEngineEditorOpen(
  _action: EditorAction,
  _targets = createGlobalEngineEditorTargets(),
) {
  return false;
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
  _action: EditorAction,
  targets = createGlobalEngineEditorTargets(),
) {
  targets.closeDialog("studioEngineEditor");
}

export async function openEngineEditor(
  action: EditorAction,
  targets: EngineEditorTargets = createGlobalEngineEditorTargets(),
) {
  closeEngineEditor(action, targets);
  await targets.runEditorHandler(action);
}

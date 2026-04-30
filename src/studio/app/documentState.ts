import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import {
  createGlobalDocumentStateTargets,
  type DocumentStateTargets,
} from "./documentStateTargets";

export {
  createGlobalDocumentStateTargets,
  type DocumentStateTargets,
} from "./documentStateTargets";

export function syncEditorWorkflowState(
  state: StudioState,
  targets: Pick<
    DocumentStateTargets,
    "syncEditorState"
  > = createGlobalDocumentStateTargets(),
) {
  const previousActiveEditor = state.editor.activeEditor;
  const previousDialogOpen = state.editor.editorDialogOpen;
  const nextEditorState = targets.syncEditorState();
  const changed =
    previousActiveEditor !== nextEditorState.activeEditor ||
    previousDialogOpen !== nextEditorState.editorDialogOpen;
  const shouldEnterEditorsWorkflow =
    Boolean(nextEditorState.activeEditor) &&
    state.section !== "editors" &&
    (previousActiveEditor !== nextEditorState.activeEditor ||
      !previousDialogOpen);
  const shouldReturnToOrigin =
    !nextEditorState.activeEditor &&
    previousDialogOpen &&
    state.section === "editors" &&
    Boolean(state.editor.lastEditorSection) &&
    state.editor.lastEditorSection !== "editors";

  state.editor.activeEditor = nextEditorState.activeEditor;
  state.editor.editorDialogOpen = nextEditorState.editorDialogOpen;

  if (shouldEnterEditorsWorkflow) {
    state.editor.lastEditorSection = state.section;
    state.section = "editors";
  }

  if (shouldReturnToOrigin) {
    state.section = state.editor.lastEditorSection!;
  }

  if (!nextEditorState.activeEditor && state.section === "editors") {
    state.editor.lastEditorSection =
      state.editor.lastEditorSection ?? "editors";
  }

  return changed;
}

export function syncDocumentState(
  state: StudioState,
  targets: Pick<
    DocumentStateTargets,
    "getDocumentState" | "getStylePreset"
  > = createGlobalDocumentStateTargets(),
) {
  const engineDocument = targets.getDocumentState();
  const nextDocument = {
    ...state.document,
    ...engineDocument,
    name:
      state.document.source === "agm"
        ? state.document.name
        : engineDocument.name,
    source: state.document.source,
    stylePreset: targets.getStylePreset(),
  };
  const changed =
    state.document.name !== nextDocument.name ||
    state.document.documentWidth !== nextDocument.documentWidth ||
    state.document.documentHeight !== nextDocument.documentHeight ||
    state.document.seed !== nextDocument.seed ||
    state.document.stylePreset !== nextDocument.stylePreset ||
    state.document.dirty !== nextDocument.dirty ||
    state.document.source !== nextDocument.source ||
    state.document.gameProfile !== nextDocument.gameProfile ||
    state.document.designIntent !== nextDocument.designIntent;

  state.document = nextDocument;
  return changed;
}

function syncAgmLayerState(
  draftLayers: WorldDocumentDraft["layers"],
  targets: Pick<
    DocumentStateTargets,
    "getLayerStates" | "setLayersPreset" | "toggleLayer"
  >,
) {
  if (draftLayers.preset) targets.setLayersPreset(draftLayers.preset);
  const currentLayers = targets.getLayerStates();
  Object.entries(draftLayers.visible).forEach(([action, enabled]) => {
    if (currentLayers[action as keyof typeof currentLayers] !== enabled)
      targets.toggleLayer(action as keyof typeof currentLayers);
  });
}

export function restoreAgmDocumentState(
  state: StudioState,
  draft: {
    document: Pick<
      StudioState["document"],
      "name" | "gameProfile" | "designIntent"
    >;
    world?: Partial<
      Pick<WorldDocumentDraft, "viewport" | "export" | "layers" | "generation">
    >;
  },
  onViewportRestored?: (state: StudioState) => void,
  targets: Pick<
    DocumentStateTargets,
    "getLayerStates" | "setDocumentName" | "setLayersPreset" | "toggleLayer"
  > = createGlobalDocumentStateTargets(),
) {
  state.document.name = targets.setDocumentName(draft.document.name);
  state.document.gameProfile = draft.document.gameProfile;
  state.document.designIntent = draft.document.designIntent;
  state.document.source = "agm";
  if (draft.world?.viewport) {
    state.viewport = { ...state.viewport, ...draft.world.viewport };
    onViewportRestored?.(state);
  }
  if (draft.world?.export) {
    state.export = { ...state.export, ...draft.world.export };
  }
  if (draft.world?.generation?.profileOverrides) {
    state.generationProfileOverrides = {
      profile: draft.world.generation.profileOverrides.profile,
      values: { ...draft.world.generation.profileOverrides.values },
    };
  } else {
    state.generationProfileOverrides = {
      profile: draft.document.gameProfile,
      values: {},
    };
  }
  if (draft.world?.layers) syncAgmLayerState(draft.world.layers, targets);
}

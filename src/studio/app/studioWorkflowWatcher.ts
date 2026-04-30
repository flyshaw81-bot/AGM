import { syncEngineProjectSummary } from "../bridge/engineActions";
import type { StudioState } from "../types";
import { syncDocumentState, syncEditorWorkflowState } from "./documentState";

export type RenderStudioApp = (root: HTMLElement, state: StudioState) => void;

export type StudioWorkflowWatcherTargets = {
  syncEditorWorkflow: (state: StudioState) => boolean;
  syncProjectSummary: () => Promise<boolean>;
  syncDocument: (state: StudioState) => boolean;
  render: RenderStudioApp;
  setInterval: (callback: () => void, delay: number) => unknown;
  addWindowEventListener: (type: "focus", callback: () => void) => void;
  addDocumentEventListener: (
    type: "visibilitychange",
    callback: () => void,
  ) => void;
  getDocumentVisibilityState: () => DocumentVisibilityState;
};

export function createGlobalStudioWorkflowWatcherTargets(
  render: RenderStudioApp,
  syncProjectSummary: () => Promise<boolean> = syncEngineProjectSummary,
): StudioWorkflowWatcherTargets {
  return {
    syncEditorWorkflow: syncEditorWorkflowState,
    syncProjectSummary,
    syncDocument: syncDocumentState,
    render,
    setInterval: (callback, delay) => window.setInterval(callback, delay),
    addWindowEventListener: (type, callback) =>
      window.addEventListener(type, callback),
    addDocumentEventListener: (type, callback) =>
      document.addEventListener(type, callback),
    getDocumentVisibilityState: () => document.visibilityState,
  };
}

export async function syncStudioWorkflowAndRender(
  root: HTMLElement,
  state: StudioState,
  targets: Pick<
    StudioWorkflowWatcherTargets,
    "syncEditorWorkflow" | "syncProjectSummary" | "syncDocument" | "render"
  >,
) {
  const editorChanged = targets.syncEditorWorkflow(state);
  const projectSummaryChanged = await targets.syncProjectSummary();
  const documentChanged = targets.syncDocument(state);
  if (editorChanged || projectSummaryChanged || documentChanged) {
    targets.render(root, state);
    return true;
  }
  return false;
}

export function watchStudioWorkflow(
  root: HTMLElement,
  state: StudioState,
  targets: StudioWorkflowWatcherTargets,
) {
  const syncAndRender = () => {
    void syncStudioWorkflowAndRender(root, state, targets);
  };

  targets.setInterval(syncAndRender, 500);
  targets.addWindowEventListener("focus", syncAndRender);
  targets.addDocumentEventListener("visibilitychange", () => {
    if (targets.getDocumentVisibilityState() === "visible") syncAndRender();
  });
}

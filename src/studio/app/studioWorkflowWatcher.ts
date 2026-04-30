import { syncEngineProjectSummary } from "../bridge/engineActions";
import type { StudioState } from "../types";
import { syncDocumentState, syncEditorWorkflowState } from "./documentState";

export type RenderStudioApp = (root: HTMLElement, state: StudioState) => void;

export type StudioWorkflowSyncAdapter = {
  syncEditorWorkflow: (state: StudioState) => boolean;
  syncProjectSummary: () => Promise<boolean>;
  syncDocument: (state: StudioState) => boolean;
};

export type StudioWorkflowRenderAdapter = {
  render: RenderStudioApp;
};

export type StudioWorkflowBrowserAdapter = {
  setInterval: (callback: () => void, delay: number) => unknown;
  addWindowEventListener: (type: "focus", callback: () => void) => void;
  addDocumentEventListener: (
    type: "visibilitychange",
    callback: () => void,
  ) => void;
  getDocumentVisibilityState: () => DocumentVisibilityState;
};

export type StudioWorkflowWatcherTargets = StudioWorkflowSyncAdapter &
  StudioWorkflowRenderAdapter &
  StudioWorkflowBrowserAdapter;

export function createGlobalStudioWorkflowSyncAdapter(
  syncProjectSummary: () => Promise<boolean> = syncEngineProjectSummary,
): StudioWorkflowSyncAdapter {
  return {
    syncEditorWorkflow: syncEditorWorkflowState,
    syncProjectSummary,
    syncDocument: syncDocumentState,
  };
}

export function createStudioWorkflowRenderAdapter(
  render: RenderStudioApp,
): StudioWorkflowRenderAdapter {
  return { render };
}

export function createGlobalStudioWorkflowBrowserAdapter(): StudioWorkflowBrowserAdapter {
  return {
    setInterval: (callback, delay) => window.setInterval(callback, delay),
    addWindowEventListener: (type, callback) =>
      window.addEventListener(type, callback),
    addDocumentEventListener: (type, callback) =>
      document.addEventListener(type, callback),
    getDocumentVisibilityState: () => document.visibilityState,
  };
}

export function createStudioWorkflowWatcherTargets(
  sync: StudioWorkflowSyncAdapter,
  renderer: StudioWorkflowRenderAdapter,
  browser: StudioWorkflowBrowserAdapter,
): StudioWorkflowWatcherTargets {
  return {
    syncEditorWorkflow: sync.syncEditorWorkflow,
    syncProjectSummary: sync.syncProjectSummary,
    syncDocument: sync.syncDocument,
    render: renderer.render,
    setInterval: browser.setInterval,
    addWindowEventListener: browser.addWindowEventListener,
    addDocumentEventListener: browser.addDocumentEventListener,
    getDocumentVisibilityState: browser.getDocumentVisibilityState,
  };
}

export function createGlobalStudioWorkflowWatcherTargets(
  render: RenderStudioApp,
  syncProjectSummary: () => Promise<boolean> = syncEngineProjectSummary,
): StudioWorkflowWatcherTargets {
  return createStudioWorkflowWatcherTargets(
    createGlobalStudioWorkflowSyncAdapter(syncProjectSummary),
    createStudioWorkflowRenderAdapter(render),
    createGlobalStudioWorkflowBrowserAdapter(),
  );
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

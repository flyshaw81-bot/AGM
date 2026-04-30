import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import {
  bootstrapStudio,
  type StudioBootstrapTargets,
  type StudioViewportSync,
  startStudioApp,
} from "./studioBootstrap";
import type { StudioWorkflowWatcherTargets } from "./studioWorkflowWatcher";

function createState(): StudioState {
  return {
    viewport: {
      presetId: "desktop-landscape",
      orientation: "landscape",
      fitMode: "cover",
      zoom: 1.25,
      panX: 10,
      panY: 20,
    },
  } as unknown as StudioState;
}

function createWatcherTargets(): StudioWorkflowWatcherTargets {
  return {
    syncEditorWorkflow: vi.fn(() => false),
    syncProjectSummary: vi.fn(async () => false),
    syncDocument: vi.fn(() => false),
    render: vi.fn(),
    setInterval: vi.fn(),
    addWindowEventListener: vi.fn(),
    addDocumentEventListener: vi.fn(),
    getDocumentVisibilityState: vi.fn(() => "visible" as const),
  };
}

function createTargets(
  readyState: DocumentReadyState = "complete",
): StudioBootstrapTargets {
  const state = createState();
  const root = {} as HTMLElement;
  const watcherTargets = createWatcherTargets();
  return {
    injectStyles: vi.fn(),
    enableStudioBody: vi.fn(),
    removeLoadingIndicator: vi.fn(),
    createInitialState: vi.fn(() => state),
    updateViewportDimensions: vi.fn(),
    ensureRoot: vi.fn(() => root),
    syncProjectSummary: vi.fn(async () => true),
    syncDocument: vi.fn(() => true),
    render: vi.fn(),
    createWorkflowWatcherTargets: vi.fn(() => watcherTargets),
    watchWorkflow: vi.fn(),
    addResizeListener: vi.fn(),
    syncViewport: vi.fn(),
    getDocumentReadyState: vi.fn(() => readyState),
    addDomContentLoadedListener: vi.fn(),
    setViewportSync: vi.fn(),
  };
}

describe("studio bootstrap", () => {
  it("boots Studio through injected targets and wires resize sync", async () => {
    const targets = createTargets();

    const boot = await bootstrapStudio(targets);
    const resizeCallback = vi.mocked(targets.addResizeListener).mock
      .calls[0]?.[0];
    resizeCallback?.();

    expect(targets.injectStyles).toHaveBeenCalled();
    expect(targets.enableStudioBody).toHaveBeenCalled();
    expect(targets.removeLoadingIndicator).toHaveBeenCalled();
    expect(targets.updateViewportDimensions).toHaveBeenCalledWith(boot.state);
    expect(targets.render).toHaveBeenCalledWith(boot.root, boot.state);
    expect(targets.watchWorkflow).toHaveBeenCalledWith(
      boot.root,
      boot.state,
      expect.any(Object),
    );
    expect(targets.syncViewport).toHaveBeenCalledWith(
      "desktop-landscape",
      "landscape",
      "cover",
      1.25,
      10,
      20,
    );
  });

  it("defers bootstrap until DOMContentLoaded while still exposing viewport sync", () => {
    const targets = createTargets("loading");

    startStudioApp(targets);

    expect(targets.setViewportSync).toHaveBeenCalledWith(targets.syncViewport);
    expect(targets.addDomContentLoadedListener).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(targets.injectStyles).not.toHaveBeenCalled();
  });

  it("starts immediately when the document is already ready", () => {
    const targets = createTargets("complete");

    startStudioApp(targets);

    expect(targets.setViewportSync).toHaveBeenCalledWith(targets.syncViewport);
    expect(targets.injectStyles).toHaveBeenCalled();
  });

  it("accepts the public viewport sync shape", () => {
    const sync: StudioViewportSync = vi.fn();
    sync("desktop-landscape", "landscape", "cover");

    expect(sync).toHaveBeenCalledWith(
      "desktop-landscape",
      "landscape",
      "cover",
    );
  });
});

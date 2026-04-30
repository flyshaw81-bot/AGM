import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import {
  createGlobalStudioBootstrapTargets,
  createStudioBootstrapTargets,
  type StudioBootstrapTargets,
} from "./studioBootstrapTargets";

function createTargets(): StudioBootstrapTargets {
  const render = vi.fn();
  return {
    injectStyles: vi.fn(),
    enableStudioBody: vi.fn(),
    removeLoadingIndicator: vi.fn(),
    createInitialState: vi.fn(() => ({}) as StudioState),
    updateViewportDimensions: vi.fn(),
    ensureRoot: vi.fn(() => ({}) as HTMLElement),
    syncProjectSummary: vi.fn(async () => true),
    syncDocument: vi.fn(() => false),
    render,
    createWorkflowWatcherTargets: vi.fn(() => ({
      syncEditorWorkflow: vi.fn(() => false),
      syncProjectSummary: vi.fn(async () => true),
      syncDocument: vi.fn(() => false),
      render,
      setInterval: vi.fn(),
      addWindowEventListener: vi.fn(),
      addDocumentEventListener: vi.fn(),
      getDocumentVisibilityState: vi.fn(
        () => "visible" as DocumentVisibilityState,
      ),
    })),
    watchWorkflow: vi.fn(),
    addResizeListener: vi.fn(),
    syncViewport: vi.fn(),
    getDocumentReadyState: vi.fn(() => "complete" as DocumentReadyState),
    addDomContentLoadedListener: vi.fn(),
    setViewportSync: vi.fn(),
  };
}

describe("studio bootstrap targets", () => {
  it("composes bootstrap targets from injected adapters", () => {
    const targets = createTargets();

    expect(createStudioBootstrapTargets(targets)).toBe(targets);
  });

  it("composes bootstrap defaults around the provided renderer", () => {
    const render = vi.fn();

    const targets = createGlobalStudioBootstrapTargets(render);

    expect(targets.render).toBe(render);
    expect(targets.injectStyles).toEqual(expect.any(Function));
    expect(targets.createInitialState).toEqual(expect.any(Function));
    expect(targets.syncProjectSummary).toEqual(expect.any(Function));
    expect(targets.syncDocument).toEqual(expect.any(Function));
    expect(targets.createWorkflowWatcherTargets).toEqual(expect.any(Function));
    expect(targets.watchWorkflow).toEqual(expect.any(Function));
    expect(targets.syncViewport).toEqual(expect.any(Function));
  });
});

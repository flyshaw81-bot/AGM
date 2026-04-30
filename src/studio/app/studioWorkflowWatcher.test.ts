import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import {
  createStudioWorkflowRenderAdapter,
  createStudioWorkflowWatcherTargets,
  type StudioWorkflowWatcherTargets,
  syncStudioWorkflowAndRender,
  watchStudioWorkflow,
} from "./studioWorkflowWatcher";

function createTargets(
  overrides: Partial<StudioWorkflowWatcherTargets> = {},
): StudioWorkflowWatcherTargets {
  return {
    syncEditorWorkflow: vi.fn(() => false),
    syncProjectSummary: vi.fn(async () => false),
    syncDocument: vi.fn(() => false),
    render: vi.fn(),
    setInterval: vi.fn(),
    addWindowEventListener: vi.fn(),
    addDocumentEventListener: vi.fn(),
    getDocumentVisibilityState: vi.fn(() => "visible" as const),
    ...overrides,
  };
}

describe("studio workflow watcher", () => {
  it("composes sync, render, and browser workflow adapters", () => {
    const sync = {
      syncEditorWorkflow: vi.fn(() => false),
      syncProjectSummary: vi.fn(async () => true),
      syncDocument: vi.fn(() => false),
    };
    const render = vi.fn();
    const renderer = createStudioWorkflowRenderAdapter(render);
    const browser = {
      setInterval: vi.fn(),
      addWindowEventListener: vi.fn(),
      addDocumentEventListener: vi.fn(),
      getDocumentVisibilityState: vi.fn(() => "visible" as const),
    };

    const targets = createStudioWorkflowWatcherTargets(sync, renderer, browser);

    expect(targets.syncProjectSummary).toBe(sync.syncProjectSummary);
    expect(targets.render).toBe(render);
    targets.setInterval(vi.fn(), 500);
    expect(browser.setInterval).toHaveBeenCalledWith(expect.any(Function), 500);
  });

  it("renders when any workflow sync target reports a change", async () => {
    const root = {} as HTMLElement;
    const state = {} as StudioState;
    const targets = createTargets({
      syncProjectSummary: vi.fn(async () => true),
    });

    const rendered = await syncStudioWorkflowAndRender(root, state, targets);

    expect(rendered).toBe(true);
    expect(targets.render).toHaveBeenCalledWith(root, state);
  });

  it("does not render when workflow sync targets are unchanged", async () => {
    const root = {} as HTMLElement;
    const state = {} as StudioState;
    const targets = createTargets();

    const rendered = await syncStudioWorkflowAndRender(root, state, targets);

    expect(rendered).toBe(false);
    expect(targets.render).not.toHaveBeenCalled();
  });

  it("wires interval, focus, and visible document callbacks", () => {
    const root = {} as HTMLElement;
    const state = {} as StudioState;
    const targets = createTargets({
      syncEditorWorkflow: vi.fn(() => true),
    });

    watchStudioWorkflow(root, state, targets);
    const intervalCallback = vi.mocked(targets.setInterval).mock.calls[0]?.[0];
    const focusCallback = vi.mocked(targets.addWindowEventListener).mock
      .calls[0]?.[1];
    const visibilityCallback = vi.mocked(targets.addDocumentEventListener).mock
      .calls[0]?.[1];

    intervalCallback?.();
    focusCallback?.();
    visibilityCallback?.();

    expect(targets.setInterval).toHaveBeenCalledWith(expect.any(Function), 500);
    expect(targets.addWindowEventListener).toHaveBeenCalledWith(
      "focus",
      expect.any(Function),
    );
    expect(targets.addDocumentEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
    expect(targets.syncEditorWorkflow).toHaveBeenCalledTimes(3);
  });

  it("skips hidden document visibility callbacks", () => {
    const root = {} as HTMLElement;
    const state = {} as StudioState;
    const targets = createTargets({
      getDocumentVisibilityState: vi.fn(() => "hidden" as const),
    });

    watchStudioWorkflow(root, state, targets);
    const visibilityCallback = vi.mocked(targets.addDocumentEventListener).mock
      .calls[0]?.[1];
    visibilityCallback?.();

    expect(targets.syncEditorWorkflow).not.toHaveBeenCalled();
  });
});

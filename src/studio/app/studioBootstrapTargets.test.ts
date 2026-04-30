import { describe, expect, it, vi } from "vitest";
import { createGlobalStudioBootstrapTargets } from "./studioBootstrapTargets";

describe("createGlobalStudioBootstrapTargets", () => {
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

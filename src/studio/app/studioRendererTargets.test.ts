import { describe, expect, it, vi } from "vitest";
import { createGlobalStudioRendererTargets } from "./studioRendererTargets";

describe("createGlobalStudioRendererTargets", () => {
  it("composes default renderer adapters", () => {
    const targets = createGlobalStudioRendererTargets();
    const root = {
      dataset: {},
      innerHTML: "",
    } as unknown as HTMLElement;

    targets.setRootHtml(root, "<main>Studio</main>");
    targets.setRootTheme(root, "night");

    expect(root.innerHTML).toBe("<main>Studio</main>");
    expect(root.dataset.studioTheme).toBe("night");
    expect(targets.syncEditorWorkflow).toEqual(expect.any(Function));
    expect(targets.syncDocument).toEqual(expect.any(Function));
    expect(targets.renderShell).toEqual(expect.any(Function));
    expect(targets.bindCanvasToolInteractions).toEqual(expect.any(Function));
    expect(targets.bindShellEvents).toEqual(expect.any(Function));
    expect(targets.syncProjectSummary).toEqual(expect.any(Function));
    expect(vi.isMockFunction(targets.syncProjectSummary)).toBe(false);
  });
});

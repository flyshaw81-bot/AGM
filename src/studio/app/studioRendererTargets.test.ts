import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import {
  createGlobalStudioRendererTargets,
  createStudioRendererTargets,
  type StudioRendererTargets,
} from "./studioRendererTargets";

function createTargets(): StudioRendererTargets {
  return {
    syncEditorWorkflow: vi.fn(() => false),
    syncDocument: vi.fn(() => false),
    updateProjectCenter: vi.fn(),
    preserveEngineNode: vi.fn(),
    renderShell: vi.fn(() => "<main>Studio</main>"),
    setRootHtml: vi.fn(),
    setRootTheme: vi.fn(),
    setDocumentTheme: vi.fn(),
    relocateEngineMapHost: vi.fn(),
    syncOverlays: vi.fn(),
    syncViewport: vi.fn(),
    syncCanvasSelectionHighlight: vi.fn(),
    syncDialogsPosition: vi.fn(),
    bindCanvasToolInteractions: vi.fn(),
    resolveFocusGeometry: vi.fn(),
    applyCanvasPaintPreview: vi.fn(() => false),
    bindShellEvents: vi.fn(),
    syncProjectSummary: vi.fn(async () => undefined),
    updateViewportDimensions: vi.fn((_state: StudioState) => undefined),
  };
}

describe("studio renderer targets", () => {
  it("composes renderer targets from injected adapters", () => {
    const targets = createTargets();

    expect(createStudioRendererTargets(targets)).toBe(targets);
  });

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

import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import { createStudioEngineCommandHandlers } from "./studioEngineCommandHandlers";
import type { StudioEngineCommandTargets } from "./studioEngineCommandTargets";

function createState(): StudioState {
  return {
    document: {
      source: "core",
      stylePreset: "default",
    },
    export: {
      format: "png",
    },
    generationProfileImpact: null,
  } as StudioState;
}

function createTargets(
  overrides: Partial<StudioEngineCommandTargets> = {},
): StudioEngineCommandTargets {
  return {
    applyStylePreset: vi.fn(),
    getStyleSettings: vi.fn(() => ({
      preset: "default",
      hideLabels: false,
      rescaleLabels: true,
      presetKind: "system" as const,
    })),
    setStyleToggle: vi.fn(),
    setExportSetting: vi.fn(),
    exportWithEngine: vi.fn(),
    runTopbarAction: vi.fn(async () => undefined),
    toggleLayer: vi.fn(),
    runDataAction: vi.fn(async () => undefined),
    runLayersPresetAction: vi.fn(),
    markDocumentClean: vi.fn(),
    updateProjectCenter: vi.fn(),
    syncDocument: vi.fn(),
    applyGenerationProfileOverrides: vi.fn(),
    createGenerationProfileResultSample: vi.fn(() => ({
      spawnCandidates: 0,
      averageSpawnScore: 0,
      states: 0,
      burgs: 0,
      provinces: 0,
      routes: 0,
      routePointCount: 0,
      resourceTaggedBiomes: 0,
    })),
    createGenerationProfileResultMetrics: vi.fn(() => []),
    ...overrides,
  };
}

function createHandlers(state = createState(), targets = createTargets()) {
  const root = {} as HTMLElement;
  const render = vi.fn();
  const syncProjectSummaryState = vi.fn(async () => undefined);
  const handlers = createStudioEngineCommandHandlers({
    render,
    root,
    state,
    syncProjectSummaryState,
    targets,
  });

  return { handlers, render, root, state, syncProjectSummaryState, targets };
}

describe("studio engine command handlers", () => {
  it("routes style changes through injected command targets", () => {
    const { handlers, render, root, state, targets } = createHandlers();

    handlers.onStyleChange("pencil");

    expect(state.document.stylePreset).toBe("pencil");
    expect(targets.applyStylePreset).toHaveBeenCalledWith("pencil");
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
    expect(render).toHaveBeenCalledWith(root, state);
  });

  it("derives style toggle state from injected style settings", () => {
    const { handlers, targets } = createHandlers();

    handlers.onStyleToggle("hide-labels");
    handlers.onStyleToggle("rescale-labels");

    expect(targets.setStyleToggle).toHaveBeenNthCalledWith(
      1,
      "hide-labels",
      true,
    );
    expect(targets.setStyleToggle).toHaveBeenNthCalledWith(
      2,
      "rescale-labels",
      false,
    );
  });

  it("handles save through the topbar command target boundary", async () => {
    const { handlers, state, syncProjectSummaryState, targets } =
      createHandlers();

    await handlers.onTopbarAction("save");

    expect(targets.runTopbarAction).toHaveBeenCalledWith("save");
    expect(targets.markDocumentClean).toHaveBeenCalled();
    expect(targets.updateProjectCenter).toHaveBeenCalledWith(state, {
      saved: true,
    });
    expect(syncProjectSummaryState).toHaveBeenCalled();
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
  });

  it("keeps export inside the command targets without invoking topbar bridge", async () => {
    const { handlers, state, targets } = createHandlers();

    await handlers.onTopbarAction("export");

    expect(targets.exportWithEngine).toHaveBeenCalledWith("png");
    expect(targets.updateProjectCenter).toHaveBeenCalledWith(state, {
      exportReady: true,
    });
    expect(targets.runTopbarAction).not.toHaveBeenCalled();
  });

  it("marks loaded data as an AGM core document", async () => {
    const state = createState();
    state.document.source = "agm";
    const { handlers, targets } = createHandlers(state);

    await handlers.onDataAction("quick-load");

    expect(targets.runDataAction).toHaveBeenCalledWith("quick-load");
    expect(state.document.source).toBe("core");
  });
});

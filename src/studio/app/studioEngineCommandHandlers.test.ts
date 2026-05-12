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
    viewport: {
      orientation: "landscape",
      presetId: "desktop-landscape",
    },
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
    setPendingCanvasSize: vi.fn(),
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

function createHandlers({
  exportReady = true,
  state = createState(),
  targets = createTargets(),
}: {
  exportReady?: boolean;
  state?: StudioState;
  targets?: StudioEngineCommandTargets;
} = {}) {
  const root = {} as HTMLElement;
  const render = vi.fn();
  const syncProjectSummaryState = vi.fn(async () => undefined);
  const getExportReadyOptions = vi.fn(() => ({
    deliveryStatus: exportReady
      ? ("ready" as const)
      : ("needs-repair" as const),
    exportReady,
  }));
  const handlers = createStudioEngineCommandHandlers({
    render,
    root,
    state,
    syncProjectSummaryState,
    getExportReadyOptions,
    targets,
  });

  return {
    getExportReadyOptions,
    handlers,
    render,
    root,
    state,
    syncProjectSummaryState,
    targets,
  };
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

  it("syncs the selected canvas size before generating a new map", async () => {
    const { handlers, targets } = createHandlers();

    await handlers.onTopbarAction("new");

    expect(targets.setPendingCanvasSize).toHaveBeenCalledWith(1440, 900);
    expect(targets.applyGenerationProfileOverrides).toHaveBeenCalled();
    expect(targets.runTopbarAction).toHaveBeenCalledWith("new");
    expect(
      vi.mocked(targets.setPendingCanvasSize).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(targets.runTopbarAction).mock.invocationCallOrder[0],
    );
  });

  it("syncs the selected canvas size before project-center generation", async () => {
    const { handlers, targets } = createHandlers();

    await handlers.onDataAction("create-generated-world");

    expect(targets.setPendingCanvasSize).toHaveBeenCalledWith(1440, 900);
    expect(targets.runDataAction).toHaveBeenCalledWith(
      "create-generated-world",
    );
    expect(
      vi.mocked(targets.setPendingCanvasSize).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(targets.runDataAction).mock.invocationCallOrder[0],
    );
  });

  it("keeps export inside the command targets without invoking topbar bridge", async () => {
    const { handlers, state, targets } = createHandlers();

    await handlers.onTopbarAction("export");

    expect(targets.exportWithEngine).toHaveBeenCalledWith("png");
    expect(targets.updateProjectCenter).toHaveBeenCalledWith(state, {
      deliveryStatus: "ready",
      exportReady: true,
    });
    expect(targets.runTopbarAction).not.toHaveBeenCalled();
  });

  it("keeps topbar export running when the relationship gate blocks export-ready state", async () => {
    const { handlers, state, targets } = createHandlers({
      exportReady: false,
    });

    await handlers.onTopbarAction("export");

    expect(targets.exportWithEngine).toHaveBeenCalledWith("png");
    expect(targets.updateProjectCenter).toHaveBeenCalledWith(state, {
      deliveryStatus: "needs-repair",
      exportReady: false,
    });
    expect(targets.runTopbarAction).not.toHaveBeenCalled();
  });

  it("marks loaded data as an AGM core document", async () => {
    const state = createState();
    state.document.source = "agm";
    const { handlers, targets } = createHandlers({ state });

    await handlers.onDataAction("load-browser-snapshot");

    expect(targets.runDataAction).toHaveBeenCalledWith("load-browser-snapshot");
    expect(state.document.source).toBe("core");
  });
});

import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActions";
import type { AgmDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import { createProjectActionHandler } from "./projectActionHandler";
import type { ProjectActionTargets } from "./projectActionTargets";

function createState(): StudioState {
  return {
    document: {
      source: "agm",
    },
  } as StudioState;
}

function createTargets(
  overrides: Partial<ProjectActionTargets> = {},
): ProjectActionTargets {
  return {
    getProjectSummary: vi.fn(() => ({}) as EngineProjectSummary),
    saveAgmDraft: vi.fn(() => ({}) as AgmDocumentDraft),
    exportAgmDraft: vi.fn(),
    exportWorldPackage: vi.fn(),
    exportResourceMap: vi.fn(),
    exportProvinceMap: vi.fn(),
    exportBiomeMap: vi.fn(),
    exportTiledMap: vi.fn(),
    exportGeoJsonMapLayers: vi.fn(),
    exportHeightmapMetadata: vi.fn(),
    exportHeightfield: vi.fn(),
    exportHeightmapPng: vi.fn(async () => undefined),
    exportHeightmapRaw16: vi.fn(),
    exportEngineManifest: vi.fn(),
    exportEnginePackage: vi.fn(async () => undefined),
    exportRulesPack: vi.fn(),
    loadAgmDraft: vi.fn(() => null),
    restoreAgmDraft: vi.fn(),
    runEngineProjectAction: vi.fn(),
    updateProjectCenter: vi.fn(),
    syncDocument: vi.fn(),
    ...overrides,
  };
}

function createHandler({
  exportReady = true,
  state = createState(),
  targets = createTargets(),
}: {
  exportReady?: boolean;
  state?: StudioState;
  targets?: ProjectActionTargets;
} = {}) {
  const root = {} as HTMLElement;
  const render = vi.fn();
  const syncProjectSummaryState = vi.fn(async () => undefined);
  const updateViewportDimensions = vi.fn();
  const getExportReadyOptions = vi.fn(() => ({
    deliveryStatus: exportReady
      ? ("ready" as const)
      : ("needs-repair" as const),
    exportReady,
  }));
  const handler = createProjectActionHandler({
    root,
    state,
    render,
    syncProjectSummaryState,
    updateViewportDimensions,
    getExportReadyOptions,
    targets,
  });

  return {
    getExportReadyOptions,
    handler,
    render,
    root,
    state,
    syncProjectSummaryState,
    targets,
    updateViewportDimensions,
  };
}

describe("project action handler", () => {
  it("saves AGM drafts through injected project action targets", async () => {
    const { handler, state, syncProjectSummaryState, targets } =
      createHandler();

    await handler("save-agm-draft");

    expect(syncProjectSummaryState).toHaveBeenCalledTimes(2);
    expect(targets.saveAgmDraft).toHaveBeenCalledWith(
      state,
      targets.getProjectSummary(),
    );
    expect(targets.updateProjectCenter).toHaveBeenCalledWith(state, {
      saved: true,
    });
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
  });

  it("marks engine package exports as ready", async () => {
    const { handler, state, targets } = createHandler();

    await handler("export-engine-package");

    expect(targets.exportEnginePackage).toHaveBeenCalledWith(
      state,
      targets.getProjectSummary(),
    );
    expect(targets.updateProjectCenter).toHaveBeenCalledWith(state, {
      deliveryStatus: "ready",
      exportReady: true,
    });
  });

  it("keeps engine package exports running when the relationship gate blocks export-ready state", async () => {
    const { handler, state, targets } = createHandler({ exportReady: false });

    await handler("export-engine-package");

    expect(targets.exportEnginePackage).toHaveBeenCalledWith(
      state,
      targets.getProjectSummary(),
    );
    expect(targets.updateProjectCenter).toHaveBeenCalledWith(state, {
      deliveryStatus: "needs-repair",
      exportReady: false,
    });
  });

  it("restores stored AGM drafts through the restore target", async () => {
    const draft = {} as AgmDocumentDraft;
    const targets = createTargets({ loadAgmDraft: vi.fn(() => draft) });
    const { handler, state, updateViewportDimensions } = createHandler({
      state: createState(),
      targets,
    });

    await handler("restore-agm-draft");

    expect(targets.restoreAgmDraft).toHaveBeenCalledWith(
      state,
      draft,
      updateViewportDimensions,
    );
  });

  it("keeps engine project actions behind the command target boundary", async () => {
    const state = createState();
    const { handler, targets } = createHandler({ state });

    await handler("restore-default-canvas-size");

    expect(targets.runEngineProjectAction).toHaveBeenCalledWith(
      "restore-default-canvas-size",
    );
    expect(state.document.source).toBe("core");
  });
});

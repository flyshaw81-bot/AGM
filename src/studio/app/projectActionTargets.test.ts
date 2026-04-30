import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActions";
import type {
  AgmDocumentDraft,
  WorldDocumentDraftTargets,
} from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import {
  createGlobalProjectDocumentAdapter,
  createProjectActionTargets,
  createProjectDraftAdapter,
  createProjectExportAdapter,
} from "./projectActionTargets";
import type { ProjectCenterTargets } from "./projectCenter";

describe("createProjectActionTargets", () => {
  it("composes project action targets from injected project adapters", async () => {
    const state = {} as StudioState;
    const summary = {} as EngineProjectSummary;
    const draft = {} as AgmDocumentDraft;
    const exportEnginePackage = vi.fn(async () => undefined);
    const runEngineProjectAction = vi.fn();
    const syncDocument = vi.fn();
    const targets = createProjectActionTargets(
      {
        getProjectSummary: () => summary,
      },
      {
        saveAgmDraft: vi.fn(() => draft),
        exportAgmDraft: vi.fn(),
        loadAgmDraft: vi.fn(() => draft),
        restoreAgmDraft: vi.fn(),
      },
      {
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
        exportEnginePackage,
        exportRulesPack: vi.fn(),
      },
      {
        runEngineProjectAction,
      },
      {
        updateProjectCenter: vi.fn(),
        syncDocument,
      },
    );

    expect(targets.getProjectSummary()).toBe(summary);
    expect(targets.saveAgmDraft(state, summary)).toBe(draft);
    await targets.exportEnginePackage(state, summary);
    expect(exportEnginePackage).toHaveBeenCalledWith(state, summary);
    targets.runEngineProjectAction("restore-default-canvas-size");
    expect(runEngineProjectAction).toHaveBeenCalledWith(
      "restore-default-canvas-size",
    );
    targets.syncDocument(state);
    expect(syncDocument).toHaveBeenCalledWith(state);
  });

  it("composes project draft and export adapters from injected draft targets", async () => {
    const state = {} as StudioState;
    const summary = {} as EngineProjectSummary;
    const draft = {
      schema: "agm.document.v0",
      document: {
        name: "Northwatch",
        gameProfile: "balanced",
        designIntent: "",
      },
      world: {
        package: {},
      },
    } as unknown as AgmDocumentDraft;
    const draftTargets = {
      createDraft: vi.fn(() => draft),
      setStorageItem: vi.fn(),
      downloadJson: vi.fn(),
      downloadBlob: vi.fn(),
      createPngBlob: vi.fn(),
      createRaw16Blob: vi.fn(),
      exportEnginePackage: vi.fn(async () => ({ filename: "package.zip" })),
    } as unknown as WorldDocumentDraftTargets;

    const draftAdapter = createProjectDraftAdapter(draftTargets);
    const exportAdapter = createProjectExportAdapter(draftTargets);

    expect(draftAdapter.saveAgmDraft(state, summary)).toBe(draft);
    expect(draftTargets.setStorageItem).toHaveBeenCalled();
    await exportAdapter.exportEnginePackage(state, summary);
    expect(draftTargets.exportEnginePackage).toHaveBeenCalledWith(
      "Northwatch",
      draft.world.package,
      undefined,
    );
  });

  it("updates project center through injected project center targets", () => {
    const state = {
      document: {
        name: "Northwatch",
        seed: "42",
        gameProfile: "balanced",
        designIntent: "",
        source: "draft",
        dirty: false,
      },
      viewport: {
        width: 1200,
        height: 800,
      },
      projectCenter: {
        activeProjectId: null,
        lastSavedAt: null,
        recentProjects: [],
      },
    } as unknown as StudioState;
    const setStorageItem = vi.fn();
    const targets: ProjectCenterTargets = {
      getStorageItem: vi.fn(() => null),
      setStorageItem,
      getProjectSummary: vi.fn(
        () =>
          ({
            pendingSeed: "42",
            hasLocalSnapshot: true,
          }) as EngineProjectSummary,
      ),
      now: vi.fn(() => 3000),
    };

    const adapter = createGlobalProjectDocumentAdapter(targets);
    adapter.updateProjectCenter(state, { saved: true });

    expect(state.projectCenter.activeProjectId).toBe("northwatch-42");
    expect(state.projectCenter.lastSavedAt).toBe(3000);
    expect(setStorageItem).toHaveBeenCalled();
  });
});

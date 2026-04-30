import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActions";
import type { AgmDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import { createProjectActionTargets } from "./projectActionTargets";

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
});

import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActions";
import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import type { ProjectCenterTargets } from "./projectCenter";
import {
  createGlobalStudioDocumentCommandAdapter,
  createStudioEngineCommandTargets,
  createStudioGenerationProfileCommandAdapter,
} from "./studioEngineCommandTargets";

describe("createStudioEngineCommandTargets", () => {
  it("composes Studio engine command targets from injected command adapters", async () => {
    const applyStylePreset = vi.fn();
    const setExportSetting = vi.fn();
    const runTopbarAction = vi.fn(async () => undefined);
    const setPendingCanvasSize = vi.fn();
    const markDocumentClean = vi.fn();
    const applyGenerationProfileOverrides = vi.fn();
    const targets = createStudioEngineCommandTargets(
      {
        applyStylePreset,
        getStyleSettings: vi.fn(() => ({
          preset: "default",
          hideLabels: false,
          rescaleLabels: true,
          presetKind: "system" as const,
        })),
        setStyleToggle: vi.fn(),
      },
      {
        setExportSetting,
        exportWithEngine: vi.fn(),
      },
      {
        runTopbarAction,
        setPendingCanvasSize,
        toggleLayer: vi.fn(),
        runDataAction: vi.fn(async () => undefined),
        runLayersPresetAction: vi.fn(),
      },
      {
        markDocumentClean,
        updateProjectCenter: vi.fn(),
        syncDocument: vi.fn(),
      },
      {
        applyGenerationProfileOverrides,
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
      },
    );

    targets.applyStylePreset("pencil");
    targets.setExportSetting("png-resolution", 2);
    await targets.runTopbarAction("save");
    targets.setPendingCanvasSize(1440, 900);
    targets.markDocumentClean();
    targets.applyGenerationProfileOverrides({} as never);

    expect(applyStylePreset).toHaveBeenCalledWith("pencil");
    expect(setExportSetting).toHaveBeenCalledWith("png-resolution", 2);
    expect(runTopbarAction).toHaveBeenCalledWith("save");
    expect(setPendingCanvasSize).toHaveBeenCalledWith(1440, 900);
    expect(markDocumentClean).toHaveBeenCalledWith();
    expect(applyGenerationProfileOverrides).toHaveBeenCalledWith({});
  });

  it("composes generation profile commands from injected targets", () => {
    const state = {
      document: {
        gameProfile: "balanced",
      },
      generationProfileOverrides: {
        profile: "balanced",
        values: {
          spawnFairnessWeight: 3,
        },
      },
      generationProfileImpact: null,
    } as unknown as StudioState;
    const summary = {
      pendingStates: "10",
      pendingBurgs: "20",
      pendingGrowthRate: "1",
      pendingSizeVariety: "5",
      pendingProvincesRatio: "50",
    } as EngineProjectSummary;
    const worldDraft = {
      playability: {
        spawnCandidates: [],
        generatorProfileSuggestions: [],
      },
      entities: {
        states: [],
        burgs: [],
      },
      resources: {
        provinces: [],
        routes: [],
        biomes: [],
      },
    } as unknown as WorldDocumentDraft;
    const setPendingStates = vi.fn();
    const adapter = createStudioGenerationProfileCommandAdapter({
      getProjectSummary: vi.fn(() => summary),
      createWorldDraft: vi.fn(() => worldDraft),
      setPendingStates,
      setPendingBurgs: vi.fn(),
      setPendingGrowthRate: vi.fn(),
      setPendingSizeVariety: vi.fn(),
      setPendingProvincesRatio: vi.fn(),
      now: vi.fn(() => 2000),
    });

    adapter.applyGenerationProfileOverrides(state);
    const sample = adapter.createGenerationProfileResultSample(state);

    expect(setPendingStates).toHaveBeenCalledWith(30);
    expect(sample.spawnCandidates).toBe(0);
    expect(state.generationProfileImpact).toMatchObject({
      profile: "balanced",
      appliedAt: 2000,
    });
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
    const projectCenterTargets: ProjectCenterTargets = {
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

    const adapter =
      createGlobalStudioDocumentCommandAdapter(projectCenterTargets);
    adapter.updateProjectCenter(state, { exportReady: true });

    expect(state.projectCenter.activeProjectId).toBe("northwatch-42");
    expect(state.projectCenter.recentProjects[0]?.status).toBe("export-ready");
    expect(setStorageItem).toHaveBeenCalled();
  });
});

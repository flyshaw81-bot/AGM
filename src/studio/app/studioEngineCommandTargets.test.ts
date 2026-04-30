import { describe, expect, it, vi } from "vitest";
import { createStudioEngineCommandTargets } from "./studioEngineCommandTargets";

describe("createStudioEngineCommandTargets", () => {
  it("composes Studio engine command targets from injected command adapters", async () => {
    const applyStylePreset = vi.fn();
    const setExportSetting = vi.fn();
    const runTopbarAction = vi.fn(async () => undefined);
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
    targets.markDocumentClean();
    targets.applyGenerationProfileOverrides({} as never);

    expect(applyStylePreset).toHaveBeenCalledWith("pencil");
    expect(setExportSetting).toHaveBeenCalledWith("png-resolution", 2);
    expect(runTopbarAction).toHaveBeenCalledWith("save");
    expect(markDocumentClean).toHaveBeenCalledWith();
    expect(applyGenerationProfileOverrides).toHaveBeenCalledWith({});
  });
});

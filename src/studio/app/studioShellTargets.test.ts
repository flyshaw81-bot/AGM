import { describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type {
  EngineFocusGeometry,
  EngineFocusTarget,
} from "../bridge/engineActions";
import type {
  AgmDocumentDraft,
  WorldDocumentDraft,
} from "../state/worldDocumentDraft";
import type {
  CanvasPaintPreviewState,
  CanvasToolMode,
  StudioState,
} from "../types";
import {
  STUDIO_LANGUAGE_STORAGE_KEY,
  STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY,
  STUDIO_THEME_STORAGE_KEY,
} from "./preferences";
import {
  createGlobalStudioShellDraftAdapter,
  createGlobalStudioShellPreferenceAdapter,
  createRuntimeStudioShellCanvasAdapter,
  createStudioShellTargets,
} from "./studioShellTargets";

describe("createStudioShellTargets", () => {
  it("composes shell targets from injected app adapters", async () => {
    const state = {} as StudioState;
    const draft = {} as AgmDocumentDraft;
    const rules = {} as WorldDocumentDraft["rules"];
    const focus = {
      targetType: "state",
      targetId: 1,
      sourceLabel: "State",
    } satisfies EngineFocusTarget;
    const focusGeometry = {
      ...focus,
      x: 10,
      y: 20,
    } satisfies EngineFocusGeometry;
    const preview = {} as CanvasPaintPreviewState;
    const openEditor = vi.fn(async () => undefined);
    const resolveFocusGeometry = vi.fn(() => focusGeometry);
    const applyRulesPack = vi.fn();
    const applyCanvasPaintPreview = vi.fn(() => true);
    const persistTheme = vi.fn();
    const setPendingViewportCanvasSize = vi.fn();
    const confirmViewportCanvasRegenerate = vi.fn(() => true);
    const isPaintCanvasTool = (
      tool: CanvasToolMode,
    ): tool is Extract<CanvasToolMode, "brush" | "water" | "terrain"> =>
      tool === "brush" || tool === "water" || tool === "terrain";

    const targets = createStudioShellTargets(
      {
        syncDocument: vi.fn(),
        syncEditorWorkflow: vi.fn(),
        restoreAgmDraft: vi.fn(),
      },
      {
        closeEditor: vi.fn(),
        openEditor,
        resolveFocusGeometry,
      },
      {
        importAgmDraft: vi.fn(async () => draft),
        importRulesPack: vi.fn(async () => rules),
        applyRulesPack,
      },
      {
        applyAutoFixPreview: vi.fn(),
        undoAutoFixPreview: vi.fn(),
        redoAutoFixPreview: vi.fn(),
        applyManualBiomeRuleAdjustment: vi.fn(),
      },
      {
        applyBiomeCoverageTarget: vi.fn(),
        isPaintCanvasTool,
        getCanvasPaintPreviewForCell: vi.fn(() => preview),
        applyCanvasPaintPreview,
        undoCanvasEditEntry: vi.fn(),
      },
      {
        applyProjectWorkspaceChange: vi.fn(),
      },
      {
        setPendingViewportCanvasSize,
        confirmViewportCanvasRegenerate,
      },
      {
        persistLanguage: vi.fn(),
        persistTheme,
        persistNavigationCollapsed: vi.fn(),
      },
    );

    await targets.openEditor("stateWorkbench");
    expect(openEditor).toHaveBeenCalledWith("stateWorkbench");
    expect(targets.resolveFocusGeometry(focus)).toBe(focusGeometry);
    targets.applyRulesPack(state, rules);
    expect(applyRulesPack).toHaveBeenCalledWith(state, rules);
    expect(targets.applyCanvasPaintPreview(state, preview)).toBe(true);
    expect(applyCanvasPaintPreview).toHaveBeenCalledWith(state, preview);
    targets.setPendingViewportCanvasSize(1440, 900);
    expect(setPendingViewportCanvasSize).toHaveBeenCalledWith(1440, 900);
    expect(targets.confirmViewportCanvasRegenerate("zh-CN", 1440, 900)).toBe(
      true,
    );
    expect(confirmViewportCanvasRegenerate).toHaveBeenCalledWith(
      "zh-CN",
      1440,
      900,
    );
    targets.persistTheme("night");
    expect(persistTheme).toHaveBeenCalledWith("night");
  });
});

describe("createGlobalStudioShellDraftAdapter", () => {
  it("imports AGM drafts and rules through injected file text targets", async () => {
    const draftFile = new File(["ignored"], "world.agm");
    const rulesFile = new File(["ignored"], "rules.agm-rules.json");
    const readFileText = vi
      .fn()
      .mockResolvedValueOnce(
        JSON.stringify({
          schema: "agm.document.v0",
          document: {
            name: "Northwatch",
            gameProfile: "strategy",
            designIntent: "",
          },
          world: {},
        }),
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          schema: "agm.rules.v0",
          version: 1,
          source: "agm-biome-summary",
          biomeRules: [],
          resourceTags: [],
          provinceStructure: [],
          resourceRules: [],
          profileRules: {
            profile: "rpg",
            profileLabel: "RPG world",
            priorities: [],
            sourceFields: [],
          },
          weights: {
            defaultRuleWeight: 1,
            ruleWeightRange: { min: 0, max: 5 },
            sourceFields: [],
          },
        }),
      );

    const adapter = createGlobalStudioShellDraftAdapter({
      getStorageItem: vi.fn(),
      readFileText,
    });

    await expect(adapter.importAgmDraft(draftFile)).resolves.toMatchObject({
      document: { name: "Northwatch" },
    });
    await expect(adapter.importRulesPack(rulesFile)).resolves.toMatchObject({
      schema: "agm.rules.v0",
    });
    expect(readFileText).toHaveBeenNthCalledWith(1, draftFile);
    expect(readFileText).toHaveBeenNthCalledWith(2, rulesFile);
  });
});

describe("createGlobalStudioShellPreferenceAdapter", () => {
  it("persists shell preferences through injected preference targets", () => {
    const preferenceTargets = {
      getStorageItem: vi.fn(),
      setStorageItem: vi.fn(),
      setDocumentLanguage: vi.fn(),
      setDocumentTheme: vi.fn(),
    };
    const adapter = createGlobalStudioShellPreferenceAdapter(preferenceTargets);

    adapter.persistLanguage("en");
    adapter.persistTheme("daylight");
    adapter.persistNavigationCollapsed(true);

    expect(preferenceTargets.setStorageItem).toHaveBeenCalledWith(
      STUDIO_LANGUAGE_STORAGE_KEY,
      "en",
    );
    expect(preferenceTargets.setDocumentLanguage).toHaveBeenCalledWith("en");
    expect(preferenceTargets.setStorageItem).toHaveBeenCalledWith(
      STUDIO_THEME_STORAGE_KEY,
      "daylight",
    );
    expect(preferenceTargets.setDocumentTheme).toHaveBeenCalledWith("daylight");
    expect(preferenceTargets.setStorageItem).toHaveBeenCalledWith(
      STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY,
      "true",
    );
  });
});

describe("createRuntimeStudioShellCanvasAdapter", () => {
  it("routes canvas paint edits through the runtime context", () => {
    const drawHeightmap = vi.fn();
    const drawBiomes = vi.fn();
    const drawCells = vi.fn();
    const invokeActiveZooming = vi.fn();
    const context = {
      worldSettings: {
        graphWidth: 1000,
        graphHeight: 500,
      },
      pack: {
        cells: {
          p: { 1: [250, 100] },
          g: { 1: 7 },
          h: { 1: 20 },
          biome: { 1: 4 },
          state: { 1: 2 },
        },
      },
      grid: {
        cells: { h: { 7: 20 } },
      },
      rendering: {
        drawHeightmap,
        drawBiomes,
        drawCells,
        isLayerOn: () => true,
        invokeActiveZooming,
      },
    } as unknown as EngineRuntimeContext;
    const state = {
      document: { source: "loaded" },
      viewport: { canvasEditHistory: [] },
    } as unknown as StudioState;

    const adapter = createRuntimeStudioShellCanvasAdapter(context);
    const preview = adapter.getCanvasPaintPreviewForCell("terrain", 1);

    expect(preview).toMatchObject({
      cellId: 1,
      height: 20,
      biomeId: 4,
      stateId: 2,
      x: 25,
      y: 20,
    });
    expect(adapter.applyCanvasPaintPreview(state, preview!)).toBe(true);
    expect(context.pack.cells.h[1]).toBe(25);
    expect(context.grid.cells.h[7]).toBe(25);
    expect(state.document.source).toBe("core");
    expect(drawHeightmap).toHaveBeenCalledWith();
    expect(drawBiomes).toHaveBeenCalledWith();
    expect(drawCells).toHaveBeenCalledWith();
    expect(invokeActiveZooming).toHaveBeenCalledWith();
  });
});

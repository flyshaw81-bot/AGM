import { describe, expect, it, vi } from "vitest";
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
  createGlobalStudioShellDraftAdapter,
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
        persistLanguage: vi.fn(),
        persistTheme,
        persistNavigationCollapsed: vi.fn(),
      },
    );

    await targets.openEditor("editStates");
    expect(openEditor).toHaveBeenCalledWith("editStates");
    expect(targets.resolveFocusGeometry(focus)).toBe(focusGeometry);
    targets.applyRulesPack(state, rules);
    expect(applyRulesPack).toHaveBeenCalledWith(state, rules);
    expect(targets.applyCanvasPaintPreview(state, preview)).toBe(true);
    expect(applyCanvasPaintPreview).toHaveBeenCalledWith(state, preview);
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

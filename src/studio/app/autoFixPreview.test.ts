import { describe, expect, it, vi } from "vitest";
import type {
  EngineAutoFixPreviewChange,
  EngineAutoFixWritebackResult,
  EngineProjectSummary,
} from "../bridge/engineActions";
import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import {
  applyAutoFixPreviewAction,
  applyManualBiomeRuleAdjustment,
  applyRulesPackDraft,
  redoAutoFixPreviewAction,
  undoAutoFixPreviewAction,
} from "./autoFixPreview";
import type { AutoFixPreviewTargets } from "./autoFixPreviewTargets";

function createWriteback(
  overrides: Partial<EngineAutoFixWritebackResult> = {},
): EngineAutoFixWritebackResult {
  return {
    createdBurgIds: [],
    createdRouteIds: [],
    updatedBiomes: [],
    updatedStates: [],
    updatedProvinces: [],
    ...overrides,
  };
}

function createState(): StudioState {
  return {
    document: {
      source: "core",
    },
    autoFixPreview: {
      appliedDraftIds: [],
      discardedDraftIds: [],
      undoStack: [],
      redoStack: [],
    },
  } as unknown as StudioState;
}

function createWorldDraft(
  autoFixDrafts: WorldDocumentDraft["playability"]["autoFixDrafts"] = [],
): WorldDocumentDraft {
  return {
    playability: {
      autoFixDrafts,
    },
    resources: {
      biomes: [
        {
          id: 3,
          name: "Forest",
          habitability: 44,
        },
      ],
    },
  } as unknown as WorldDocumentDraft;
}

function createTargets(
  overrides: Partial<AutoFixPreviewTargets> = {},
): AutoFixPreviewTargets {
  return {
    getProjectSummary: vi.fn(() => ({}) as EngineProjectSummary),
    createWorldDraft: vi.fn(() => createWorldDraft()),
    applyStatePreviewChanges: vi.fn(() => createWriteback()),
    applySettlementPreviewChanges: vi.fn(() => createWriteback()),
    applyRoutePreviewChanges: vi.fn(() => createWriteback()),
    applyBiomePreviewChanges: vi.fn(() => createWriteback()),
    undoWriteback: vi.fn(),
    ...overrides,
  };
}

describe("auto fix preview", () => {
  it("applies preview writebacks through injected targets", () => {
    const change = {
      id: "change-1",
      operation: "update",
      entity: "state",
      summary: "Adjust state",
      refs: { states: [1] },
    } satisfies EngineAutoFixPreviewChange;
    const writeback = createWriteback({
      updatedStates: [{}],
    } as Partial<EngineAutoFixWritebackResult>);
    const targets = createTargets({
      createWorldDraft: vi.fn(() =>
        createWorldDraft([
          {
            id: "draft-1",
            category: "spawn",
            previewDiff: { changes: [change] },
          },
        ] as unknown as WorldDocumentDraft["playability"]["autoFixDrafts"]),
      ),
      applyStatePreviewChanges: vi.fn(() => writeback),
    });
    const state = createState();

    applyAutoFixPreviewAction(state, "draft-1", "apply", 1, targets);

    expect(targets.applyStatePreviewChanges).toHaveBeenCalledWith([change]);
    expect(state.autoFixPreview.appliedDraftIds).toEqual(["draft-1"]);
    expect(state.autoFixPreview.undoStack.at(-1)).toMatchObject({
      draftId: "draft-1",
      action: "apply",
      engineWriteback: writeback,
    });
    expect(state.document.source).toBe("agm");
  });

  it("creates manual biome rule writebacks through injected targets", () => {
    const writeback = createWriteback();
    const targets = createTargets({
      createWorldDraft: vi.fn(() => createWorldDraft()),
      applyBiomePreviewChanges: vi.fn(() => writeback),
    });
    const state = createState();

    applyManualBiomeRuleAdjustment(state, 3, 1.234, "food", targets);

    expect(targets.applyBiomePreviewChanges).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "manual-biome-rule-3",
        entity: "biome",
        fields: expect.objectContaining({
          habitability: 44,
          agmRuleWeight: 1.23,
          agmResourceTag: "food",
        }),
      }),
    ]);
    expect(state.autoFixPreview.appliedDraftIds).toEqual([
      "manual-biome-rule-3",
    ]);
    expect(state.autoFixPreview.undoStack.at(-1)).toMatchObject({
      changeCount: 1,
      engineWriteback: writeback,
    });
  });

  it("applies rules packs as biome writebacks", () => {
    const state = createState();
    const targets = createTargets();

    applyRulesPackDraft(
      state,
      {
        version: 2,
        biomeRules: [{ biomeId: 3, ruleWeight: 5, resourceTag: "wood" }],
      } as unknown as WorldDocumentDraft["rules"],
      targets,
    );

    expect(targets.applyBiomePreviewChanges).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "manual-biome-rule-3",
        fields: expect.objectContaining({ agmResourceTag: "wood" }),
      }),
    ]);
    expect(state.autoFixPreview.undoStack.at(-1)).toMatchObject({
      draftId: "import-rules-pack-v2",
      rulesPackImportVersion: 2,
    });
  });

  it("undoes and redoes applied entries through injected targets", () => {
    const writeback = createWriteback({
      updatedBiomes: [
        {
          biomeId: 3,
          previousHabitability: 44,
          nextHabitability: 44,
          previousAgmRuleWeight: null,
          nextAgmRuleWeight: 2,
          previousAgmResourceTag: null,
          nextAgmResourceTag: "wood",
        },
      ],
    });
    const targets = createTargets({
      applyBiomePreviewChanges: vi.fn(() => writeback),
    });
    const state = createState();
    state.autoFixPreview.appliedDraftIds = ["manual-biome-rule-3"];
    state.autoFixPreview.undoStack = [
      {
        draftId: "manual-biome-rule-3",
        action: "apply",
        changeCount: 1,
        engineWriteback: writeback,
      },
    ];

    undoAutoFixPreviewAction(state, targets);
    redoAutoFixPreviewAction(state, targets);

    expect(targets.undoWriteback).toHaveBeenCalledWith(writeback);
    expect(targets.applyBiomePreviewChanges).toHaveBeenCalled();
    expect(state.autoFixPreview.appliedDraftIds).toEqual([
      "manual-biome-rule-3",
    ]);
    expect(state.autoFixPreview.undoStack).toHaveLength(1);
    expect(state.autoFixPreview.redoStack).toHaveLength(0);
  });
});

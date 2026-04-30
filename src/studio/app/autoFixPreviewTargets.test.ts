import { describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type {
  EngineAutoFixPreviewChange,
  EngineAutoFixWritebackResult,
  EngineProjectSummary,
} from "../bridge/engineActions";
import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import {
  createAutoFixPreviewTargets,
  createRuntimeAutoFixPreviewTargets,
} from "./autoFixPreviewTargets";

describe("createAutoFixPreviewTargets", () => {
  it("composes autofix preview targets from injected adapters", () => {
    const state = {} as StudioState;
    const summary = {} as EngineProjectSummary;
    const draft = {} as WorldDocumentDraft;
    const writeback = {} as EngineAutoFixWritebackResult;
    const createWorldDraft = vi.fn(() => draft);
    const applyRoutePreviewChanges = vi.fn(() => writeback);
    const undoWriteback = vi.fn();

    const targets = createAutoFixPreviewTargets(
      {
        getProjectSummary: () => summary,
      },
      {
        createWorldDraft,
      },
      {
        applyStatePreviewChanges: vi.fn(() => writeback),
        applySettlementPreviewChanges: vi.fn(() => writeback),
        applyRoutePreviewChanges,
        applyBiomePreviewChanges: vi.fn(() => writeback),
        undoWriteback,
      },
    );

    expect(targets.getProjectSummary()).toBe(summary);
    expect(targets.createWorldDraft(state, summary)).toBe(draft);
    expect(targets.applyRoutePreviewChanges([])).toBe(writeback);
    expect(applyRoutePreviewChanges).toHaveBeenCalledWith([]);
    targets.undoWriteback(writeback);
    expect(undoWriteback).toHaveBeenCalledWith(writeback);
  });

  it("creates autofix preview targets from an injected runtime context", () => {
    const state = {
      agmFairStart: false,
      agmFairStartScore: 0,
      agmPriority: "low",
    };
    const biomeData = {
      habitability: { 2: 10 },
      agmRuleWeight: { 2: 1 },
      agmResourceTag: { 2: "grain" },
    };
    const context = {
      pack: {
        states: [undefined, state],
        provinces: [],
      },
      biomesData: biomeData,
    } as unknown as EngineRuntimeContext;
    const targets = createRuntimeAutoFixPreviewTargets(context);
    const stateChange = {
      id: "state-1",
      operation: "update",
      entity: "state",
      summary: "state update",
      refs: { states: [1] },
      fields: {
        agmFairStart: true,
        agmFairStartScore: 42,
        agmPriority: "high",
      },
    } satisfies EngineAutoFixPreviewChange;
    const biomeChange = {
      id: "biome-2",
      operation: "update",
      entity: "biome",
      summary: "biome update",
      refs: { biomes: [2] },
      fields: {
        habitability: 30,
        agmRuleWeight: 3,
        agmResourceTag: "ore",
      },
    } satisfies EngineAutoFixPreviewChange;

    const stateWriteback = targets.applyStatePreviewChanges([stateChange]);
    const biomeWriteback = targets.applyBiomePreviewChanges([biomeChange]);

    expect(state.agmFairStart).toBe(true);
    expect(state.agmPriority).toBe("high");
    expect(biomeData.habitability[2]).toBe(30);
    targets.undoWriteback({
      createdBurgIds: [],
      createdRouteIds: [],
      updatedBiomes: biomeWriteback.updatedBiomes,
      updatedStates: stateWriteback.updatedStates,
      updatedProvinces: [],
    });

    expect(state.agmFairStart).toBe(false);
    expect(state.agmPriority).toBe("low");
    expect(biomeData.habitability[2]).toBe(10);
    expect(biomeData.agmResourceTag[2]).toBe("grain");
  });
});

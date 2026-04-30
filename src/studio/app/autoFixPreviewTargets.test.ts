import { describe, expect, it, vi } from "vitest";
import type {
  EngineAutoFixWritebackResult,
  EngineProjectSummary,
} from "../bridge/engineActions";
import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import { createAutoFixPreviewTargets } from "./autoFixPreviewTargets";

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
});

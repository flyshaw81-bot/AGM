import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import {
  createNativeRelationshipHistoryRestoreResult,
  createNativeRelationshipHistoryUndoResult,
  restoreNativeRelationshipHistoryChangeToAfter,
} from "./nativeRelationshipQueueHistoryActions";

type RelationshipHistory = NonNullable<
  StudioState["directEditor"]["relationshipQueueHistory"]
>;

const originalPack = (globalThis as { pack?: unknown }).pack;

const createHistory = (): RelationshipHistory => ({
  id: 7,
  count: 1,
  summary: "States culture: 1",
  target: "studioDirectStatesWorkbench",
  resultText: "Applied 1 queued repairs",
  undoChanges: [
    {
      entity: "state",
      id: 2,
      field: "culture",
      beforeValue: "8",
      afterValue: "0",
      payload: {
        fixKind: "state-clear-culture",
        stateId: "2",
        stateCulture: "0",
      },
    },
  ],
  undone: false,
  undoBlockedReason: null,
});

const setPackCulture = (culture: number | string) => {
  (globalThis as { pack?: unknown }).pack = {
    states: {
      2: { culture },
    },
  };
};

const applyStateCultureFromButton = (button: HTMLElement) => {
  const pack = (globalThis as { pack?: { states: Record<number, any> } }).pack;
  if (pack?.states?.[2]) {
    pack.states[2].culture = button.dataset.stateCulture || "";
  }
};

beforeEach(() => {
  vi.stubGlobal("document", {
    createElement: () => ({ dataset: {} }),
  });
});

afterEach(() => {
  (globalThis as { pack?: unknown }).pack = originalPack;
  vi.unstubAllGlobals();
});

describe("nativeRelationshipQueueHistoryActions", () => {
  it("undo restores before values and marks the history as undone", () => {
    setPackCulture("0");
    const history = createHistory();

    const result = createNativeRelationshipHistoryUndoResult(
      history,
      applyStateCultureFromButton,
    );

    expect(
      (globalThis as { pack: { states: Record<number, any> } }).pack.states[2]
        .culture,
    ).toBe("8");
    expect(result).toMatchObject({
      undone: true,
      undoBlockedReason: null,
      resultText: "Undid 1 queued repairs · States culture: 1",
    });
  });

  it("blocks stale undo instead of overwriting changed current values", () => {
    setPackCulture("9");
    const apply = vi.fn();

    const result = createNativeRelationshipHistoryUndoResult(
      createHistory(),
      apply,
    );

    expect(apply).not.toHaveBeenCalled();
    expect(result.undone).toBe(false);
    expect(result.undoBlockedReason).toContain(
      "Undo blocked: state #2 culture changed after apply",
    );
    expect(
      (globalThis as { pack: { states: Record<number, any> } }).pack.states[2]
        .culture,
    ).toBe("9");
  });

  it("restore-after reapplies after values and clears the stale block once current matches after", () => {
    setPackCulture("9");
    const history = {
      ...createHistory(),
      undoBlockedReason: "Undo blocked: state #2 culture changed after apply",
    };

    restoreNativeRelationshipHistoryChangeToAfter(
      history.undoChanges[0],
      applyStateCultureFromButton,
    );
    const result = createNativeRelationshipHistoryRestoreResult(history, 1);

    expect(
      (globalThis as { pack: { states: Record<number, any> } }).pack.states[2]
        .culture,
    ).toBe("0");
    expect(result.undoBlockedReason).toBeNull();
    expect(result.resultText).toBe(
      "Restored Current to After · States culture: 1",
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  countDirectRelationshipHistoryRowStatuses,
  getDirectRelationshipHistoryRecoveryState,
  getDirectRelationshipHistoryRowStatus,
  getDirectRelationshipHistoryStatusSuffix,
  getNativeRelationshipHistoryRowStatus,
} from "./nativeRelationshipHistoryStatus";
import type { NativeRelationshipQueueHistory } from "./nativeRelationshipQueue";

const createHistory = (
  patch: Partial<NativeRelationshipQueueHistory> = {},
): NativeRelationshipQueueHistory => ({
  id: 1,
  count: 1,
  summary: "States culture: 1",
  target: "studioDirectStatesWorkbench",
  resultText: "Applied 1 queued repairs",
  undoChanges: [],
  undone: false,
  undoBlockedReason: null,
  ...patch,
});

describe("nativeRelationshipHistoryStatus", () => {
  it("classifies history rows by latest, stale, and undone state", () => {
    expect(getDirectRelationshipHistoryRowStatus(createHistory(), 0)).toBe(
      "undoable",
    );
    expect(getDirectRelationshipHistoryRowStatus(createHistory(), 2)).toBe(
      "readonly",
    );
    expect(
      getDirectRelationshipHistoryRowStatus(
        createHistory({ undoBlockedReason: "Conflict" }),
        0,
      ),
    ).toBe("blocked");
    expect(
      getDirectRelationshipHistoryRowStatus(createHistory({ undone: true }), 0),
    ).toBe("undone");
  });

  it("returns shared status suffixes and recovery states", () => {
    expect(getDirectRelationshipHistoryStatusSuffix(createHistory())).toBe("");
    expect(
      getDirectRelationshipHistoryStatusSuffix(
        createHistory({ undoBlockedReason: "Conflict" }),
      ),
    ).toBe(" · undo blocked");
    expect(
      getDirectRelationshipHistoryStatusSuffix(createHistory({ undone: true })),
    ).toBe(" · undone");
    expect(getDirectRelationshipHistoryRecoveryState(createHistory(), 0)).toBe(
      "ready",
    );
    expect(
      getDirectRelationshipHistoryRecoveryState(
        createHistory({ undoBlockedReason: "Conflict" }),
        0,
      ),
    ).toBe("blocked");
    expect(getDirectRelationshipHistoryRecoveryState(createHistory(), 1)).toBe(
      "hidden",
    );
  });

  it("counts filter badges from row status classifications", () => {
    expect(
      countDirectRelationshipHistoryRowStatuses([
        createHistory(),
        createHistory({ undone: true }),
        createHistory({ undoBlockedReason: "Conflict" }),
        createHistory(),
      ]),
    ).toEqual({ blocked: 1, undoable: 1, undone: 1, readonly: 1 });
  });

  it("keeps native history aliases for compatibility callers", () => {
    expect(getNativeRelationshipHistoryRowStatus(createHistory(), 0)).toBe(
      "undoable",
    );
  });
});

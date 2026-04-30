import { describe, expect, it } from "vitest";
import {
  countNativeRelationshipHistoryRowStatuses,
  getNativeRelationshipHistoryRecoveryState,
  getNativeRelationshipHistoryRowStatus,
  getNativeRelationshipHistoryStatusSuffix,
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
    expect(getNativeRelationshipHistoryRowStatus(createHistory(), 0)).toBe(
      "undoable",
    );
    expect(getNativeRelationshipHistoryRowStatus(createHistory(), 2)).toBe(
      "readonly",
    );
    expect(
      getNativeRelationshipHistoryRowStatus(
        createHistory({ undoBlockedReason: "Conflict" }),
        0,
      ),
    ).toBe("blocked");
    expect(
      getNativeRelationshipHistoryRowStatus(createHistory({ undone: true }), 0),
    ).toBe("undone");
  });

  it("returns shared status suffixes and recovery states", () => {
    expect(getNativeRelationshipHistoryStatusSuffix(createHistory())).toBe("");
    expect(
      getNativeRelationshipHistoryStatusSuffix(
        createHistory({ undoBlockedReason: "Conflict" }),
      ),
    ).toBe(" · undo blocked");
    expect(
      getNativeRelationshipHistoryStatusSuffix(createHistory({ undone: true })),
    ).toBe(" · undone");
    expect(getNativeRelationshipHistoryRecoveryState(createHistory(), 0)).toBe(
      "ready",
    );
    expect(
      getNativeRelationshipHistoryRecoveryState(
        createHistory({ undoBlockedReason: "Conflict" }),
        0,
      ),
    ).toBe("blocked");
    expect(getNativeRelationshipHistoryRecoveryState(createHistory(), 1)).toBe(
      "hidden",
    );
  });

  it("counts filter badges from row status classifications", () => {
    expect(
      countNativeRelationshipHistoryRowStatuses([
        createHistory(),
        createHistory({ undone: true }),
        createHistory({ undoBlockedReason: "Conflict" }),
        createHistory(),
      ]),
    ).toEqual({ blocked: 1, undoable: 1, undone: 1, readonly: 1 });
  });
});

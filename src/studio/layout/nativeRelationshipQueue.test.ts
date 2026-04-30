import { afterEach, describe, expect, it } from "vitest";
import {
  applyNativeRelationshipQueuedItems,
  getNativeRelationshipCurrentFieldValue,
  getNativeRelationshipFixField,
  getNativeRelationshipFixTarget,
  getNativeRelationshipQueueImpactSummary,
  normalizeRelationshipQueueValue,
  reviewNativeRelationshipQueue,
} from "./nativeRelationshipQueue";

const originalPack = (globalThis as { pack?: unknown }).pack;

afterEach(() => {
  (globalThis as { pack?: unknown }).pack = originalPack;
});

describe("native relationship queue helpers", () => {
  it("detects the target entity and id from a repair button dataset", () => {
    const button = {
      dataset: {
        fixKind: "province-sync-burg-state",
        provinceId: "42",
      },
    } as unknown as HTMLElement;

    expect(getNativeRelationshipFixTarget(button)).toEqual({
      fixKind: "province-sync-burg-state",
      entity: "province",
      id: 42,
    });
  });

  it("maps repair kinds to relationship fields", () => {
    expect(getNativeRelationshipFixField("state-clear-culture")).toBe(
      "culture",
    );
    expect(getNativeRelationshipFixField("state-clear-capital")).toBe(
      "capital",
    );
    expect(getNativeRelationshipFixField("province-clear-burg")).toBe("burg");
    expect(getNativeRelationshipFixField("province-clear-state")).toBe("state");
  });

  it("normalizes current values read from the live pack", () => {
    (globalThis as { pack?: unknown }).pack = {
      provinces: {
        7: { state: "#3" },
      },
    };

    expect(getNativeRelationshipCurrentFieldValue("province", 7, "state")).toBe(
      "3",
    );
    expect(normalizeRelationshipQueueValue(" #12 ")).toBe("12");
  });

  it("reviews duplicate and stale queued relationship repairs", () => {
    (globalThis as { pack?: unknown }).pack = {
      states: {
        2: { culture: "#8" },
      },
    };
    const button = {
      dataset: {
        fixKind: "state-clear-culture",
        stateId: "2",
      },
    } as unknown as HTMLElement;
    const queue = [
      {
        key: "a",
        fieldKey: "state:2:culture",
        label: "Clear culture",
        preview: "#7 -> #0",
        target: "states",
        sourceValue: "7",
        targetValue: "0",
        button,
      },
      {
        key: "b",
        fieldKey: "state:2:culture",
        label: "Clear culture again",
        preview: "#7 -> #0",
        target: "states",
        sourceValue: "7",
        targetValue: "0",
        button,
      },
    ];

    expect(reviewNativeRelationshipQueue(queue)).toEqual({
      itemStates: [
        { duplicate: true, stale: true },
        { duplicate: true, stale: true },
      ],
      hasIssues: true,
    });
    expect(getNativeRelationshipQueueImpactSummary(queue)).toBe(
      "States culture: 2",
    );
  });

  it("applies queued repairs and captures undo payloads", () => {
    (globalThis as { pack?: unknown }).pack = {
      burgs: {
        3: { state: 9 },
      },
    };
    const button = {
      dataset: {
        fixKind: "burg-clear-state",
        burgId: "3",
        burgName: "Grey Mill",
        burgState: "0",
      },
    } as unknown as HTMLElement;
    const applied: Array<{ entity: string; id: number }> = [];

    expect(
      applyNativeRelationshipQueuedItems(
        [
          {
            key: "burg-3-state",
            fieldKey: "burg:3:state",
            label: "Clear state",
            preview: "#9 -> #0",
            target: "studioDirectBurgsWorkbench",
            sourceValue: "9",
            targetValue: "0",
            button,
          },
        ],
        (_button, entity, id) => applied.push({ entity, id }),
      ),
    ).toMatchObject({
      target: "studioDirectBurgsWorkbench",
      undoChanges: [
        {
          entity: "burg",
          id: 3,
          field: "state",
          beforeValue: "9",
          afterValue: "0",
          payload: {
            fixKind: "burg-clear-state",
            burgId: "3",
            burgName: "Grey Mill",
            burgState: "0",
          },
        },
      ],
    });
    expect(applied).toEqual([{ entity: "burg", id: 3 }]);
  });
});

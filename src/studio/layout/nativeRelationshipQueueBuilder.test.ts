import { afterEach, describe, expect, it } from "vitest";
import {
  createDirectRelationshipQueueItem,
  parseDirectRelationshipQueuePreview,
  parseNativeRelationshipQueuePreview,
} from "./nativeRelationshipQueueBuilder";

const originalPack = (globalThis as { pack?: unknown }).pack;

afterEach(() => {
  (globalThis as { pack?: unknown }).pack = originalPack;
});

function createFakeFixButton(
  dataset: Record<string, string>,
  textContent = "Clear relationship",
) {
  const button = {
    dataset: { ...dataset },
    textContent,
    closest: () => null,
    cloneNode: () => createFakeFixButton(dataset, textContent),
  };
  return button as unknown as HTMLElement;
}

describe("nativeRelationshipQueueBuilder", () => {
  it("parses repair preview values across arrow formats", () => {
    expect(parseDirectRelationshipQueuePreview("#9 -> #0")).toEqual({
      source: "9",
      target: "0",
    });
    expect(parseDirectRelationshipQueuePreview("#12 => #4")).toEqual({
      source: "12",
      target: "4",
    });
    expect(parseDirectRelationshipQueuePreview("#7 → #3")).toEqual({
      source: "7",
      target: "3",
    });
  });

  it("keeps the native preview parser as a compatibility alias", () => {
    expect(parseNativeRelationshipQueuePreview("#9 -> #0")).toEqual({
      source: "9",
      target: "0",
    });
  });

  it("builds source values from the live pack and fallback target values from button datasets", () => {
    (globalThis as { pack?: unknown }).pack = {
      states: {
        2: { culture: 8 },
      },
    };

    const item = createDirectRelationshipQueueItem({
      existingItems: [],
      fallbackLabel: "",
      fixButton: createFakeFixButton(
        {
          fixKind: "state-clear-culture",
          stateId: "2",
          stateCulture: "0",
          workbenchTarget: "studioDirectStatesWorkbench",
        },
        "",
      ),
    });

    expect(item).toMatchObject({
      key: "state-clear-culture:state:2",
      fieldKey: "state:2:culture",
      sourceValue: "8",
      targetValue: "0",
      target: "studioDirectStatesWorkbench",
    });
  });

  it("ignores a duplicate queue item for the same relationship fix", () => {
    const fixButton = createFakeFixButton({
      fixKind: "state-clear-culture",
      stateId: "2",
      stateCulture: "0",
    });
    const item = createDirectRelationshipQueueItem({
      existingItems: [],
      fallbackLabel: "Clear culture",
      fixButton,
    });

    expect(
      createDirectRelationshipQueueItem({
        existingItems: item ? [item] : [],
        fallbackLabel: "Clear culture",
        fixButton,
      }),
    ).toBeNull();
  });
});

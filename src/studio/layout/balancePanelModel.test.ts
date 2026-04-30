import { describe, expect, it } from "vitest";
import {
  getAppliedPreviewSummary,
  getBalancePanelSummary,
} from "./balancePanelModel";

describe("balancePanelModel", () => {
  it("keeps the first applied change per draft", () => {
    const changes = [
      { draftId: "spawn", id: "a", appliedAt: 1 },
      { draftId: "spawn", id: "b", appliedAt: 1 },
      { draftId: "route", id: "c", appliedAt: 2 },
    ] as Parameters<typeof getAppliedPreviewSummary>[0];

    expect(
      getAppliedPreviewSummary(changes).map((change) => change.id),
    ).toEqual(["a", "c"]);
  });

  it("summarizes playability state for the balance panel", () => {
    const playability = {
      appliedPreviewChanges: [
        { draftId: "spawn", id: "a", appliedAt: 1 },
        { draftId: "spawn", id: "b", appliedAt: 1 },
        { draftId: "biome", id: "c", appliedAt: 2 },
      ],
      autoFixDrafts: [],
      balanceHints: [
        { severity: "warning" },
        { severity: "info" },
        { severity: "warning" },
      ],
      generationProfileImpact: {
        changes: [{ key: "spawn" }, { key: "route" }],
        resultMetrics: [{ key: "fairness" }],
      },
      generatorProfileSuggestions: [],
      spawnCandidates: [
        { id: "first" },
        { id: "second" },
        { id: "third" },
        { id: "fourth" },
      ],
    } as unknown as Parameters<typeof getBalancePanelSummary>[0];
    const resources = {
      biomes: [
        { id: 1, agmRuleWeight: 1 },
        { id: 2 },
        { id: 3, agmResourceTag: "starter-biome" },
      ],
    } as Parameters<typeof getBalancePanelSummary>[1];
    const previewState = {
      redoStack: [{ draftId: "redo", action: "discard", changeCount: 1 }],
      undoStack: [{ draftId: "undo", action: "apply", changeCount: 2 }],
    } as Parameters<typeof getBalancePanelSummary>[2];

    expect(
      getBalancePanelSummary(playability, resources, previewState),
    ).toMatchObject({
      appliedPreviewSummary: [{ id: "a" }, { id: "c" }],
      biomeRuleSummary: [{ id: 1 }, { id: 3 }],
      generationImpactCount: 3,
      lastHistoryEntry: { draftId: "undo" },
      nextRedoEntry: { draftId: "redo" },
      topCandidates: [{ id: "first" }, { id: "second" }, { id: "third" }],
      topSpawn: { id: "first" },
      warningCount: 2,
    });
  });
});

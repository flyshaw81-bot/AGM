import { describe, expect, it } from "vitest";
import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import {
  createRelationshipIssuesFromSummaries,
  createRelationshipRepairHealth,
  createRelationshipRepairHealthFromSummaries,
} from "./directRelationshipRepairHealth";
import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";

const createDirectEditor = (
  relationshipQueueHistory: StudioState["directEditor"]["relationshipQueueHistory"] = null,
): StudioState["directEditor"] => ({
  selectedStateId: null,
  stateSearchQuery: "",
  stateSortMode: "name",
  stateFilterMode: "all",
  lastAppliedStateId: null,
  selectedBurgId: null,
  burgSearchQuery: "",
  burgFilterMode: "all",
  lastAppliedBurgId: null,
  selectedProvinceId: null,
  provinceSearchQuery: "",
  provinceFilterMode: "all",
  lastAppliedProvinceId: null,
  selectedRouteId: null,
  routeSearchQuery: "",
  routeFilterMode: "all",
  lastAppliedRouteId: null,
  selectedBiomeId: null,
  biomeSearchQuery: "",
  biomeFilterMode: "all",
  lastAppliedBiomeId: null,
  selectedCultureId: null,
  cultureSearchQuery: "",
  cultureFilterMode: "all",
  lastAppliedCultureId: null,
  selectedReligionId: null,
  religionSearchQuery: "",
  religionFilterMode: "all",
  lastAppliedReligionId: null,
  selectedZoneId: null,
  zoneSearchQuery: "",
  zoneFilterMode: "all",
  lastAppliedZoneId: null,
  selectedMarkerId: null,
  markerSearchQuery: "",
  markerFilterMode: "all",
  lastAppliedMarkerId: null,
  selectedDiplomacySubjectId: null,
  selectedDiplomacyObjectId: null,
  diplomacySearchQuery: "",
  diplomacyFilterMode: "all",
  lastAppliedDiplomacyPair: null,
  militarySearchQuery: "",
  militaryFilterMode: "all",
  relationshipQueueHistory,
  relationshipQueueHistoryLog: relationshipQueueHistory
    ? [relationshipQueueHistory]
    : [],
});

const healthyEntitySummary: EngineEntitySummary = {
  states: [{ id: 1, name: "Northwatch", culture: 1, capital: 10 }],
  burgs: [{ id: 10, name: "Saltport", state: 1, culture: 1 }],
  cultures: [{ id: 1, name: "Northfolk" }],
  religions: [],
};

const healthyWorldResources: EngineWorldResourceSummary = {
  biomes: [],
  provinces: [{ id: 20, name: "North Coast", state: 1, burg: 10 }],
  routes: [],
  zones: [],
  markers: [],
  military: [],
};

describe("relationshipRepairHealth", () => {
  it("returns ready when the relationship issue list is empty", () => {
    expect(createRelationshipRepairHealth([])).toEqual({
      issueCount: 0,
      blockingIssueCount: 0,
      lastAppliedRepairId: null,
      exportGate: "ready",
      deliveryStatus: "ready",
    });
  });

  it("treats every MVP relationship issue as blocking", () => {
    const issue: RelationshipIssue = {
      groupKey: "state-clear-culture",
      groupLabel: "Missing state culture",
      target: "studioDirectStatesWorkbench",
      label: "State culture is missing",
      source: "State #1",
      sourceEntity: "state",
      sourceId: 1,
      reference: "Culture #99",
      detail: "State points at a missing culture.",
    };

    expect(createRelationshipRepairHealth([issue], 42)).toEqual({
      issueCount: 1,
      blockingIssueCount: 1,
      lastAppliedRepairId: 42,
      exportGate: "blocked",
      deliveryStatus: "needs-repair",
    });
  });

  it("derives ready health from consistent summaries", () => {
    expect(
      createRelationshipRepairHealthFromSummaries({
        directEditor: createDirectEditor(),
        entitySummary: healthyEntitySummary,
        language: "en",
        worldResources: healthyWorldResources,
      }),
    ).toMatchObject({
      issueCount: 0,
      blockingIssueCount: 0,
      exportGate: "ready",
    });
  });

  it("derives blocked health from state, burg, and province relationship issues", () => {
    const entitySummary: EngineEntitySummary = {
      states: [{ id: 1, name: "Northwatch", culture: 99, capital: 88 }],
      burgs: [
        { id: 10, name: "Saltport", state: 99, culture: 1 },
        { id: 11, name: "Bridgehold", state: 2, culture: 1 },
      ],
      cultures: [{ id: 1, name: "Northfolk" }],
      religions: [],
    };
    const worldResources: EngineWorldResourceSummary = {
      biomes: [],
      provinces: [{ id: 20, name: "North Coast", state: 1, burg: 11 }],
      routes: [],
      zones: [],
      markers: [],
      military: [],
    };
    const directEditor = createDirectEditor({
      id: 123,
      count: 1,
      summary: "States culture: 1",
      target: "studioDirectStatesWorkbench",
      resultText: "Applied 1 queued repairs",
      undoChanges: [],
      undone: false,
      undoBlockedReason: null,
    });
    const issues = createRelationshipIssuesFromSummaries({
      directEditor,
      entitySummary,
      language: "en",
      worldResources,
    });
    const health = createRelationshipRepairHealthFromSummaries({
      directEditor,
      entitySummary,
      language: "en",
      worldResources,
    });

    expect(issues.map((issue) => issue.groupKey)).toEqual(
      expect.arrayContaining([
        "state-clear-culture",
        "state-clear-capital",
        "burg-clear-state",
        "province-sync-burg-state",
      ]),
    );
    expect(health).toEqual({
      issueCount: issues.length,
      blockingIssueCount: issues.length,
      lastAppliedRepairId: 123,
      exportGate: "blocked",
      deliveryStatus: "needs-repair",
    });
  });
});

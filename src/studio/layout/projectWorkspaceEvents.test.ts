import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import { bindProjectWorkspaceEvents } from "./projectWorkspaceEvents";
import { createFakeControl, installFakeDocument } from "./testDomHelpers";

const { projectSummary } = vi.hoisted(() => ({
  projectSummary: {
    lastLayersPreset: "political",
    pendingCultureSet: "european",
    pendingPoints: "5000",
    pendingSeed: "alpha-seed",
  },
}));

vi.mock("../bridge/engineActions", () => ({
  getEngineProjectSummary: () => projectSummary,
}));

function createState(section: StudioState["section"]) {
  return {
    section,
    document: {
      designIntent: "Make a compact strategy map.",
      gameProfile: "grand-strategy",
      name: "Northwatch",
      seed: "document-seed",
    },
  } as unknown as StudioState;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("project workspace events", () => {
  it("hydrates project controls and emits data-driven changes", () => {
    const projectName = createFakeControl("studioProjectNameInput", "Old");
    const projectPoints = createFakeControl("studioProjectPointsInput", "1000");
    const projectCultureSet = createFakeControl(
      "studioProjectCultureSetSelect",
      "default",
    );
    const topbarSeed = createFakeControl("studioTopbarSeedInput", "old-seed");
    const autosave = createFakeControl("studioProjectAutosaveInput", "10");
    installFakeDocument([
      projectName,
      projectPoints,
      projectCultureSet,
      topbarSeed,
      autosave,
    ]);

    const changes: Array<[string, string]> = [];
    bindProjectWorkspaceEvents(createState("project"), (setting, value) => {
      changes.push([setting, value]);
    });

    expect(projectName.value).toBe("Northwatch");
    expect(projectPoints.value).toBe("5000");
    expect(projectCultureSet.value).toBe("european");
    expect(topbarSeed.value).toBe("alpha-seed");

    projectName.value = "Southwatch";
    projectName.emit("change");
    autosave.value = "15";
    autosave.emit("input");

    expect(changes).toEqual([
      ["document-name", "Southwatch"],
      ["autosave-interval", "15"],
    ]);
  });

  it("keeps project-only pending values unchanged outside the project section", () => {
    const projectPoints = createFakeControl("studioProjectPointsInput", "1000");
    installFakeDocument([projectPoints]);

    bindProjectWorkspaceEvents(createState("canvas"), vi.fn());

    expect(projectPoints.value).toBe("1000");
  });
});

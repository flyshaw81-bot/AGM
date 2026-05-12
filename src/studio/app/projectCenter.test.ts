import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  loadProjectCenterState,
  PROJECT_CENTER_STORAGE_KEY,
  type ProjectCenterTargets,
  updateProjectCenterState,
} from "./projectCenter";

function createDocument(): StudioState["document"] {
  return {
    name: "Northwatch",
    source: "agm",
    gameProfile: "strategy",
    designIntent: "balanced fantasy campaign",
    seed: "42",
    documentWidth: 1200,
    documentHeight: 800,
    stylePreset: "default",
    dirty: false,
  };
}

function createState(): StudioState {
  return {
    document: createDocument(),
    viewport: {
      width: 1024,
      height: 768,
    },
    projectCenter: {
      activeProjectId: "old",
      lastSavedAt: 10,
      recentProjects: [
        {
          id: "old",
          name: "Old",
          gameProfile: "strategy",
          designIntent: "",
          width: 100,
          height: 100,
          seed: "1",
          source: "agm",
          status: "draft",
          updatedAt: 10,
          hasLocalSnapshot: false,
          exportReady: false,
          deliveryStatus: "unchecked",
        },
      ],
    },
  } as unknown as StudioState;
}

function createSummary(): EngineProjectSummary {
  return {
    pendingSeed: "fallback-seed",
    hasLocalSnapshot: true,
  } as EngineProjectSummary;
}

function createTargets(
  storageValue: string | null = null,
): ProjectCenterTargets {
  return {
    getStorageItem: vi.fn(() => storageValue),
    setStorageItem: vi.fn(),
    getProjectSummary: vi.fn(() => createSummary()),
    now: vi.fn(() => 1234),
  };
}

describe("projectCenter", () => {
  it("loads recent projects through injected storage targets", () => {
    const recentProjects = [
      {
        id: "northwatch-42",
        name: "Northwatch",
        updatedAt: 10,
        deliveryStatus: "needs-repair",
      },
      {
        id: 1,
        name: "Broken",
        updatedAt: 10,
      },
    ];
    const targets = createTargets(JSON.stringify(recentProjects));

    const state = loadProjectCenterState(createDocument(), targets);

    expect(state.activeProjectId).toBe("northwatch-42");
    expect(state.recentProjects).toEqual([
      {
        id: "northwatch-42",
        name: "Northwatch",
        updatedAt: 10,
        deliveryStatus: "needs-repair",
      },
    ]);
    expect(targets.getStorageItem).toHaveBeenCalledWith(
      PROJECT_CENTER_STORAGE_KEY,
    );
  });

  it("updates and persists project center state through injected targets", () => {
    const state = createState();
    const targets = createTargets();

    updateProjectCenterState(
      state,
      { saved: true, exportReady: true },
      targets,
    );

    expect(state.projectCenter.activeProjectId).toBe("northwatch-42");
    expect(state.projectCenter.lastSavedAt).toBe(1234);
    expect(state.projectCenter.recentProjects[0]).toMatchObject({
      id: "northwatch-42",
      name: "Northwatch",
      status: "export-ready",
      hasLocalSnapshot: true,
      exportReady: true,
      deliveryStatus: "ready",
    });
    expect(targets.setStorageItem).toHaveBeenCalledWith(
      PROJECT_CENTER_STORAGE_KEY,
      JSON.stringify(state.projectCenter.recentProjects),
    );
  });

  it("keeps relationship repair delivery status on recent project entries", () => {
    const state = createState();
    const targets = createTargets();

    updateProjectCenterState(
      state,
      { exportReady: false, deliveryStatus: "needs-repair" },
      targets,
    );

    expect(state.projectCenter.recentProjects[0]).toMatchObject({
      id: "northwatch-42",
      status: "draft",
      exportReady: false,
      deliveryStatus: "needs-repair",
    });
  });

  it("marks a project validated when relationship repair is ready before export", () => {
    const state = createState();
    const targets = createTargets();

    updateProjectCenterState(state, { deliveryStatus: "ready" }, targets);

    expect(state.projectCenter.recentProjects[0]).toMatchObject({
      id: "northwatch-42",
      status: "validated",
      exportReady: false,
      deliveryStatus: "ready",
    });
  });
});

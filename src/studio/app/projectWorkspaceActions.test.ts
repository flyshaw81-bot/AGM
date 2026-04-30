import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import {
  applyProjectWorkspaceChange,
  type ProjectWorkspaceActionTargets,
} from "./projectWorkspaceActions";

function createState(): StudioState {
  return {
    document: {
      name: "Current",
      source: "core",
      gameProfile: "strategy",
      designIntent: "balanced",
    },
    generationProfileOverrides: {
      profile: "strategy",
      values: { states: 8 },
    },
  } as unknown as StudioState;
}

function createTargets(
  overrides: Partial<ProjectWorkspaceActionTargets> = {},
): ProjectWorkspaceActionTargets {
  return {
    numberSetters: {
      points: vi.fn(),
    },
    stringSetters: {
      seed: vi.fn(),
    },
    setDocumentName: vi.fn((value) => `${value} saved`),
    setCanvasSize: vi.fn(),
    setAutosaveInterval: vi.fn(),
    syncProjectSummary: vi.fn(),
    ...overrides,
  };
}

describe("applyProjectWorkspaceChange", () => {
  it("routes string settings through injected targets", async () => {
    const targets = createTargets();

    await applyProjectWorkspaceChange(createState(), "seed", "agm-42", targets);

    expect(targets.stringSetters.seed).toHaveBeenCalledWith("agm-42");
    expect(targets.syncProjectSummary).toHaveBeenCalled();
  });

  it("routes number settings through injected targets", async () => {
    const targets = createTargets();

    await applyProjectWorkspaceChange(createState(), "points", "2048", targets);

    expect(targets.numberSetters.points).toHaveBeenCalledWith(2048);
    expect(targets.syncProjectSummary).toHaveBeenCalled();
  });

  it("updates document name through injected document target", async () => {
    const state = createState();
    const targets = createTargets();

    await applyProjectWorkspaceChange(
      state,
      "document-name",
      "Northwatch",
      targets,
    );

    expect(state.document.name).toBe("Northwatch saved");
    expect(state.document.source).toBe("agm");
  });

  it("keeps game profile state and overrides aligned", async () => {
    const state = createState();
    const targets = createTargets();

    await applyProjectWorkspaceChange(
      state,
      "game-profile",
      "exploration",
      targets,
    );

    expect(state.document.gameProfile).toBe("exploration");
    expect(state.generationProfileOverrides).toEqual({
      profile: "exploration",
      values: {},
    });
    expect(state.document.source).toBe("agm");
  });

  it("trims design intent before storing it locally", async () => {
    const state = createState();
    const targets = createTargets();

    await applyProjectWorkspaceChange(
      state,
      "design-intent",
      "  frontier campaign  ",
      targets,
    );

    expect(state.document.designIntent).toBe("frontier campaign");
    expect(state.document.source).toBe("agm");
  });

  it("routes canvas and autosave settings through injected targets", async () => {
    const targets = createTargets();

    await applyProjectWorkspaceChange(createState(), "width", "1400", targets);
    await applyProjectWorkspaceChange(
      createState(),
      "autosave-interval",
      "15",
      targets,
    );

    expect(targets.setCanvasSize).toHaveBeenCalledWith("width", 1400);
    expect(targets.setAutosaveInterval).toHaveBeenCalledWith(15);
    expect(targets.syncProjectSummary).toHaveBeenCalledTimes(2);
  });
});

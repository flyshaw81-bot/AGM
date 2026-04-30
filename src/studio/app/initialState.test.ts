import { describe, expect, it, vi } from "vitest";
import { createInitialState, type InitialStateTargets } from "./initialState";
import type { StudioPreferenceTargets } from "./preferences";
import {
  PROJECT_CENTER_STORAGE_KEY,
  type ProjectCenterTargets,
} from "./projectCenter";

function createPreferenceTargets(): StudioPreferenceTargets {
  return {
    getStorageItem: vi.fn((key) => {
      if (key === "agm-studio-language") return "en";
      if (key === "agm-studio-theme") return "daylight";
      if (key === "agm-studio-navigation-collapsed") return "true";
      return null;
    }),
    setStorageItem: vi.fn(),
    setDocumentLanguage: vi.fn(),
    setDocumentTheme: vi.fn(),
  };
}

function createInitialStateTargets(): InitialStateTargets {
  const preferences = createPreferenceTargets();
  const projectCenter: Pick<ProjectCenterTargets, "getStorageItem"> = {
    getStorageItem: vi.fn((key) =>
      key === PROJECT_CENTER_STORAGE_KEY
        ? JSON.stringify([
            {
              id: "recent-1",
              name: "Recent",
              updatedAt: 1000,
            },
          ])
        : null,
    ),
  };

  return {
    getEngineDocumentState: vi.fn(() => ({
      name: "Northwatch",
      seed: "42",
      source: "core",
      dirty: false,
      documentWidth: 1200,
      documentHeight: 800,
    })),
    getEngineStylePreset: vi.fn(() => "pencil"),
    getPresetById: vi.fn(() => ({
      id: "desktop-landscape",
      width: 1440,
      height: 960,
      orientation: "landscape",
    })),
    preferences,
    projectCenter,
  } as unknown as InitialStateTargets;
}

describe("createInitialState", () => {
  it("builds initial state through injected app targets", () => {
    const targets = createInitialStateTargets();

    const state = createInitialState(targets);

    expect(state.language).toBe("en");
    expect(state.theme).toBe("daylight");
    expect(state.shell.navigationCollapsed).toBe(true);
    expect(state.document).toMatchObject({
      name: "Northwatch",
      seed: "42",
      stylePreset: "pencil",
      gameProfile: "rpg",
    });
    expect(state.viewport).toMatchObject({
      presetId: "desktop-landscape",
      width: 1440,
      height: 960,
    });
    expect(state.projectCenter.recentProjects[0]?.id).toBe("recent-1");
    expect(targets.preferences.setDocumentLanguage).toHaveBeenCalledWith("en");
    expect(targets.preferences.setDocumentTheme).toHaveBeenCalledWith(
      "daylight",
    );
  });
});

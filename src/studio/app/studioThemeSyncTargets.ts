import type { StudioState } from "../types";

export type StudioThemeSyncTargets = {
  setDocumentTheme: (theme: StudioState["theme"]) => void;
};

export function createStudioThemeSyncTargets(
  targets: StudioThemeSyncTargets,
): StudioThemeSyncTargets {
  return targets;
}

export function createGlobalStudioThemeSyncTargets(): StudioThemeSyncTargets {
  return createStudioThemeSyncTargets({
    setDocumentTheme: (theme) => {
      document.documentElement.dataset.studioTheme = theme;
    },
  });
}

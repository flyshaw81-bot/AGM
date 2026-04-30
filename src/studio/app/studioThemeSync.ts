import type { StudioState } from "../types";

export type StudioThemeSyncTargets = {
  setDocumentTheme: (theme: StudioState["theme"]) => void;
};

export function createGlobalStudioThemeSyncTargets(): StudioThemeSyncTargets {
  return {
    setDocumentTheme: (theme) => {
      document.documentElement.dataset.studioTheme = theme;
    },
  };
}

export function syncStudioDocumentTheme(
  theme: StudioState["theme"],
  targets: StudioThemeSyncTargets = createGlobalStudioThemeSyncTargets(),
) {
  targets.setDocumentTheme(theme);
}

import type { StudioLanguage, StudioTheme } from "../types";

export const STUDIO_LANGUAGE_STORAGE_KEY = "agm-studio-language";
export const STUDIO_THEME_STORAGE_KEY = "agm-studio-theme";
export const STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY =
  "agm-studio-navigation-collapsed";

export type StudioPreferenceTargets = {
  getStorageItem: (key: string) => string | null;
  setStorageItem: (key: string, value: string) => void;
  setDocumentLanguage: (language: StudioLanguage) => void;
  setDocumentTheme: (theme: StudioTheme) => void;
};

export function createGlobalStudioPreferenceTargets(): StudioPreferenceTargets {
  return {
    getStorageItem: (key) => localStorage.getItem(key),
    setStorageItem: (key, value) => localStorage.setItem(key, value),
    setDocumentLanguage: (language) => {
      document.documentElement.lang = language;
    },
    setDocumentTheme: (theme) => {
      document.documentElement.dataset.studioTheme = theme;
    },
  };
}

export function getInitialLanguage(
  targets: Pick<
    StudioPreferenceTargets,
    "getStorageItem"
  > = createGlobalStudioPreferenceTargets(),
): StudioLanguage {
  return targets.getStorageItem(STUDIO_LANGUAGE_STORAGE_KEY) === "en"
    ? "en"
    : "zh-CN";
}

export function persistLanguage(
  language: StudioLanguage,
  targets: Pick<
    StudioPreferenceTargets,
    "setStorageItem" | "setDocumentLanguage"
  > = createGlobalStudioPreferenceTargets(),
) {
  targets.setStorageItem(STUDIO_LANGUAGE_STORAGE_KEY, language);
  targets.setDocumentLanguage(language);
}

export function getInitialTheme(
  targets: Pick<
    StudioPreferenceTargets,
    "getStorageItem"
  > = createGlobalStudioPreferenceTargets(),
): StudioTheme {
  const theme = targets.getStorageItem(STUDIO_THEME_STORAGE_KEY);
  return theme === "daylight" ? "daylight" : "night";
}

export function persistTheme(
  theme: StudioTheme,
  targets: Pick<
    StudioPreferenceTargets,
    "setStorageItem" | "setDocumentTheme"
  > = createGlobalStudioPreferenceTargets(),
) {
  targets.setStorageItem(STUDIO_THEME_STORAGE_KEY, theme);
  targets.setDocumentTheme(theme);
}

export function getInitialNavigationCollapsed(
  targets: Pick<
    StudioPreferenceTargets,
    "getStorageItem"
  > = createGlobalStudioPreferenceTargets(),
) {
  return (
    targets.getStorageItem(STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY) === "true"
  );
}

export function persistNavigationCollapsed(
  collapsed: boolean,
  targets: Pick<
    StudioPreferenceTargets,
    "setStorageItem"
  > = createGlobalStudioPreferenceTargets(),
) {
  targets.setStorageItem(
    STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY,
    collapsed ? "true" : "false",
  );
}

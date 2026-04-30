import type { StudioLanguage, StudioTheme } from "../types";

const STUDIO_LANGUAGE_STORAGE_KEY = "agm-studio-language";
const STUDIO_THEME_STORAGE_KEY = "agm-studio-theme";
const STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY =
  "agm-studio-navigation-collapsed";

export function getInitialLanguage(): StudioLanguage {
  return localStorage.getItem(STUDIO_LANGUAGE_STORAGE_KEY) === "en"
    ? "en"
    : "zh-CN";
}

export function persistLanguage(language: StudioLanguage) {
  localStorage.setItem(STUDIO_LANGUAGE_STORAGE_KEY, language);
  document.documentElement.lang = language;
}

export function getInitialTheme(): StudioTheme {
  const theme = localStorage.getItem(STUDIO_THEME_STORAGE_KEY);
  return theme === "daylight" ? "daylight" : "night";
}

export function persistTheme(theme: StudioTheme) {
  localStorage.setItem(STUDIO_THEME_STORAGE_KEY, theme);
  document.documentElement.dataset.studioTheme = theme;
}

export function getInitialNavigationCollapsed() {
  return (
    localStorage.getItem(STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY) === "true"
  );
}

export function persistNavigationCollapsed(collapsed: boolean) {
  localStorage.setItem(
    STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY,
    collapsed ? "true" : "false",
  );
}

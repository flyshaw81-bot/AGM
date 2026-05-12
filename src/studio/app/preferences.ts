import type { StudioLanguage, StudioTheme } from "../types";
import {
  createGlobalStudioPreferenceTargets,
  type StudioPreferenceTargets,
} from "./preferenceTargets";

export {
  createGlobalStudioPreferenceTargets,
  type StudioPreferenceTargets,
} from "./preferenceTargets";

export const STUDIO_LANGUAGE_STORAGE_KEY = "agm-studio-language";
export const STUDIO_THEME_STORAGE_KEY = "agm-studio-theme";
export const STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY =
  "agm-studio-navigation-collapsed";
export const STUDIO_LAYER_CARDS_STORAGE_KEY = "agm-studio-layer-cards";

const DEFAULT_LAYER_CARDS = [
  "toggleCells",
  "toggleBiomes",
  "toggleRivers",
  "toggleRelief",
  "toggleBorders",
  "toggleRoutes",
  "toggleReligions",
  "toggleMarkers",
  "toggleStates",
  "toggleLabels",
] as const;

export type LayerCardKey = string;

export function getInitialLayerCards(
  targets: Pick<
    StudioPreferenceTargets,
    "getStorageItem"
  > = createGlobalStudioPreferenceTargets(),
): LayerCardKey[] {
  try {
    const raw = targets.getStorageItem(STUDIO_LAYER_CARDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 10) return parsed as LayerCardKey[];
    }
  } catch {
    // invalid storage → fall back to default
  }
  return [...DEFAULT_LAYER_CARDS];
}

export function persistLayerCards(
  cards: LayerCardKey[],
  targets: Pick<
    StudioPreferenceTargets,
    "setStorageItem"
  > = createGlobalStudioPreferenceTargets(),
) {
  targets.setStorageItem(STUDIO_LAYER_CARDS_STORAGE_KEY, JSON.stringify(cards.slice(0, 10)));
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

export function applyDocumentPreferences(
  language: StudioLanguage,
  theme: StudioTheme,
  targets: Pick<
    StudioPreferenceTargets,
    "setDocumentLanguage" | "setDocumentTheme"
  > = createGlobalStudioPreferenceTargets(),
) {
  targets.setDocumentLanguage(language);
  targets.setDocumentTheme(theme);
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

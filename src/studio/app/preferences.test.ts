import { describe, expect, it, vi } from "vitest";
import {
  getInitialLanguage,
  getInitialNavigationCollapsed,
  getInitialTheme,
  persistLanguage,
  persistNavigationCollapsed,
  persistTheme,
  STUDIO_LANGUAGE_STORAGE_KEY,
  STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY,
  STUDIO_THEME_STORAGE_KEY,
  type StudioPreferenceTargets,
} from "./preferences";

function createTargets(
  values: Record<string, string | null> = {},
): StudioPreferenceTargets {
  return {
    getStorageItem: vi.fn((key) => values[key] ?? null),
    setStorageItem: vi.fn(),
    setDocumentLanguage: vi.fn(),
    setDocumentTheme: vi.fn(),
  };
}

describe("studio preferences", () => {
  it("reads initial preferences through injected storage targets", () => {
    const targets = createTargets({
      [STUDIO_LANGUAGE_STORAGE_KEY]: "en",
      [STUDIO_THEME_STORAGE_KEY]: "daylight",
      [STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY]: "true",
    });

    expect(getInitialLanguage(targets)).toBe("en");
    expect(getInitialTheme(targets)).toBe("daylight");
    expect(getInitialNavigationCollapsed(targets)).toBe(true);
  });

  it("falls back to default preferences for missing or unknown values", () => {
    const targets = createTargets({
      [STUDIO_LANGUAGE_STORAGE_KEY]: "de",
      [STUDIO_THEME_STORAGE_KEY]: "solarized",
      [STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY]: "false",
    });

    expect(getInitialLanguage(targets)).toBe("zh-CN");
    expect(getInitialTheme(targets)).toBe("night");
    expect(getInitialNavigationCollapsed(targets)).toBe(false);
  });

  it("persists language, theme, and navigation through injected targets", () => {
    const targets = createTargets();

    persistLanguage("en", targets);
    persistTheme("daylight", targets);
    persistNavigationCollapsed(true, targets);

    expect(targets.setStorageItem).toHaveBeenCalledWith(
      STUDIO_LANGUAGE_STORAGE_KEY,
      "en",
    );
    expect(targets.setDocumentLanguage).toHaveBeenCalledWith("en");
    expect(targets.setStorageItem).toHaveBeenCalledWith(
      STUDIO_THEME_STORAGE_KEY,
      "daylight",
    );
    expect(targets.setDocumentTheme).toHaveBeenCalledWith("daylight");
    expect(targets.setStorageItem).toHaveBeenCalledWith(
      STUDIO_NAVIGATION_COLLAPSED_STORAGE_KEY,
      "true",
    );
  });
});

import type { StudioLanguage, StudioTheme } from "../types";

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

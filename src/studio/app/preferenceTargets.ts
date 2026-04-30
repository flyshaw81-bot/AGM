import type { StudioLanguage, StudioTheme } from "../types";

export type StudioPreferenceStorageAdapter = {
  getStorageItem: (key: string) => string | null;
  setStorageItem: (key: string, value: string) => void;
};

export type StudioPreferenceDocumentAdapter = {
  setDocumentLanguage: (language: StudioLanguage) => void;
  setDocumentTheme: (theme: StudioTheme) => void;
};

export type StudioPreferenceTargets = {
  getStorageItem: (key: string) => string | null;
  setStorageItem: (key: string, value: string) => void;
  setDocumentLanguage: (language: StudioLanguage) => void;
  setDocumentTheme: (theme: StudioTheme) => void;
};

export function createGlobalStudioPreferenceStorageAdapter(): StudioPreferenceStorageAdapter {
  return {
    getStorageItem: (key) => localStorage.getItem(key),
    setStorageItem: (key, value) => localStorage.setItem(key, value),
  };
}

export function createGlobalStudioPreferenceDocumentAdapter(): StudioPreferenceDocumentAdapter {
  return {
    setDocumentLanguage: (language) => {
      document.documentElement.lang = language;
    },
    setDocumentTheme: (theme) => {
      document.documentElement.dataset.studioTheme = theme;
    },
  };
}

export function createStudioPreferenceTargets(
  storage: StudioPreferenceStorageAdapter,
  documentAdapter: StudioPreferenceDocumentAdapter,
): StudioPreferenceTargets {
  return {
    getStorageItem: storage.getStorageItem,
    setStorageItem: storage.setStorageItem,
    setDocumentLanguage: documentAdapter.setDocumentLanguage,
    setDocumentTheme: documentAdapter.setDocumentTheme,
  };
}

export function createGlobalStudioPreferenceTargets(): StudioPreferenceTargets {
  return createStudioPreferenceTargets(
    createGlobalStudioPreferenceStorageAdapter(),
    createGlobalStudioPreferenceDocumentAdapter(),
  );
}

import type { EngineProjectSummary } from "./engineActionTypes";
import {
  createGlobalProjectFormTargets,
  type EngineProjectFormTargets,
} from "./engineProjectFormTargets";

type EngineProjectSummaryGlobal = typeof globalThis & {
  __studioProjectSummary?: EngineProjectSummary;
  ldb?: {
    get?: (key: string) => Promise<unknown>;
  };
};

export type EngineProjectSummaryTargets = {
  form: EngineProjectFormTargets;
  getCachedSummary: () => EngineProjectSummary | undefined;
  setCachedSummary: (summary: EngineProjectSummary) => void;
  getLocalStorageItem: (key: string) => string | null;
  getSessionStorageItem: (key: string) => string | null;
  hasElement: (id: string) => boolean;
  readLocalDatabaseSnapshot: () => Promise<unknown>;
};

export type EngineProjectSummaryCacheAdapter = {
  getCachedSummary: () => EngineProjectSummary | undefined;
  setCachedSummary: (summary: EngineProjectSummary) => void;
};

export type EngineProjectSummaryStorageAdapter = {
  getLocalStorageItem: (key: string) => string | null;
  getSessionStorageItem: (key: string) => string | null;
};

export type EngineProjectSummaryDocumentAdapter = {
  hasElement: (id: string) => boolean;
};

export type EngineProjectSummaryDatabaseAdapter = {
  readLocalDatabaseSnapshot: () => Promise<unknown>;
};

function getSummaryGlobal(): EngineProjectSummaryGlobal {
  return globalThis as EngineProjectSummaryGlobal;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

function getLocalStorage(): Storage | undefined {
  return globalThis.localStorage;
}

function getSessionStorage(): Storage | undefined {
  return globalThis.sessionStorage;
}

export function createGlobalProjectSummaryCacheAdapter(): EngineProjectSummaryCacheAdapter {
  return {
    getCachedSummary: () => getSummaryGlobal().__studioProjectSummary,
    setCachedSummary: (summary) => {
      getSummaryGlobal().__studioProjectSummary = summary;
    },
  };
}

export function createGlobalProjectSummaryStorageAdapter(): EngineProjectSummaryStorageAdapter {
  return {
    getLocalStorageItem: (key) => getLocalStorage()?.getItem(key) ?? null,
    getSessionStorageItem: (key) => getSessionStorage()?.getItem(key) ?? null,
  };
}

export function createGlobalProjectSummaryDocumentAdapter(): EngineProjectSummaryDocumentAdapter {
  return {
    hasElement: (id) => Boolean(getDocument()?.getElementById(id)),
  };
}

export function createGlobalProjectSummaryDatabaseAdapter(): EngineProjectSummaryDatabaseAdapter {
  return {
    readLocalDatabaseSnapshot: async () => {
      const localDatabase = getSummaryGlobal().ldb;
      return typeof localDatabase?.get === "function"
        ? localDatabase.get("lastMap")
        : undefined;
    },
  };
}

export function createProjectSummaryTargets(
  form: EngineProjectFormTargets,
  cacheAdapter: EngineProjectSummaryCacheAdapter,
  storageAdapter: EngineProjectSummaryStorageAdapter,
  documentAdapter: EngineProjectSummaryDocumentAdapter,
  databaseAdapter: EngineProjectSummaryDatabaseAdapter,
): EngineProjectSummaryTargets {
  return {
    form,
    getCachedSummary: cacheAdapter.getCachedSummary,
    setCachedSummary: cacheAdapter.setCachedSummary,
    getLocalStorageItem: storageAdapter.getLocalStorageItem,
    getSessionStorageItem: storageAdapter.getSessionStorageItem,
    hasElement: documentAdapter.hasElement,
    readLocalDatabaseSnapshot: databaseAdapter.readLocalDatabaseSnapshot,
  };
}

export function createGlobalProjectSummaryTargets(): EngineProjectSummaryTargets {
  return createProjectSummaryTargets(
    createGlobalProjectFormTargets(),
    createGlobalProjectSummaryCacheAdapter(),
    createGlobalProjectSummaryStorageAdapter(),
    createGlobalProjectSummaryDocumentAdapter(),
    createGlobalProjectSummaryDatabaseAdapter(),
  );
}

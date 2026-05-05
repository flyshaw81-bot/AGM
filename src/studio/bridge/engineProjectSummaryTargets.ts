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
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function getSessionStorage(): Storage | undefined {
  try {
    return globalThis.sessionStorage;
  } catch {
    return undefined;
  }
}

export function createGlobalProjectSummaryCacheAdapter(): EngineProjectSummaryCacheAdapter {
  return {
    getCachedSummary: () => {
      try {
        return getSummaryGlobal().__studioProjectSummary;
      } catch {
        return undefined;
      }
    },
    setCachedSummary: (summary) => {
      try {
        getSummaryGlobal().__studioProjectSummary = summary;
      } catch {
        // Compatibility cache is best-effort; injected adapters own strict state.
      }
    },
  };
}

export function createGlobalProjectSummaryStorageAdapter(): EngineProjectSummaryStorageAdapter {
  return {
    getLocalStorageItem: (key) => {
      try {
        return getLocalStorage()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    getSessionStorageItem: (key) => {
      try {
        return getSessionStorage()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
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
      try {
        const localDatabase = getSummaryGlobal().ldb;
        return typeof localDatabase?.get === "function"
          ? localDatabase.get("lastMap")
          : undefined;
      } catch {
        return undefined;
      }
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

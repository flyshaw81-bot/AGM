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

export function createGlobalProjectSummaryTargets(): EngineProjectSummaryTargets {
  return {
    form: createGlobalProjectFormTargets(),
    getCachedSummary: () => getSummaryGlobal().__studioProjectSummary,
    setCachedSummary: (summary) => {
      getSummaryGlobal().__studioProjectSummary = summary;
    },
    getLocalStorageItem: (key) => getLocalStorage()?.getItem(key) ?? null,
    getSessionStorageItem: (key) => getSessionStorage()?.getItem(key) ?? null,
    hasElement: (id) => Boolean(getDocument()?.getElementById(id)),
    readLocalDatabaseSnapshot: async () => {
      const localDatabase = getSummaryGlobal().ldb;
      return typeof localDatabase?.get === "function"
        ? localDatabase.get("lastMap")
        : undefined;
    },
  };
}

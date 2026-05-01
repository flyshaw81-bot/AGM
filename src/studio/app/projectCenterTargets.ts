import { getEngineProjectSummary } from "../bridge/engineActions";
import type { EngineProjectSummary } from "../bridge/engineActionTypes";

export type ProjectCenterStorageAdapter = {
  getStorageItem: (key: string) => string | null;
  setStorageItem: (key: string, value: string) => void;
};

export type ProjectCenterSummaryAdapter = {
  getProjectSummary: () => EngineProjectSummary;
};

export type ProjectCenterClockAdapter = {
  now: () => number;
};

export type ProjectCenterTargets = ProjectCenterStorageAdapter &
  ProjectCenterSummaryAdapter &
  ProjectCenterClockAdapter;

export function createGlobalProjectCenterStorageAdapter(): ProjectCenterStorageAdapter {
  return {
    getStorageItem: (key) => globalThis.localStorage?.getItem(key) ?? null,
    setStorageItem: (key, value) => {
      globalThis.localStorage?.setItem(key, value);
    },
  };
}

export function createGlobalProjectCenterSummaryAdapter(): ProjectCenterSummaryAdapter {
  return {
    getProjectSummary: getEngineProjectSummary,
  };
}

export function createGlobalProjectCenterClockAdapter(): ProjectCenterClockAdapter {
  return {
    now: () => Date.now(),
  };
}

export function createProjectCenterTargets(
  storage: ProjectCenterStorageAdapter,
  summary: ProjectCenterSummaryAdapter,
  clock: ProjectCenterClockAdapter,
): ProjectCenterTargets {
  return {
    getStorageItem: storage.getStorageItem,
    setStorageItem: storage.setStorageItem,
    getProjectSummary: summary.getProjectSummary,
    now: clock.now,
  };
}

export function createGlobalProjectCenterTargets(): ProjectCenterTargets {
  return createProjectCenterTargets(
    createGlobalProjectCenterStorageAdapter(),
    createGlobalProjectCenterSummaryAdapter(),
    createGlobalProjectCenterClockAdapter(),
  );
}

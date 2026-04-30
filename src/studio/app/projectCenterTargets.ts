import { getEngineProjectSummary } from "../bridge/engineActions";
import type { EngineProjectSummary } from "../bridge/engineActionTypes";

export type ProjectCenterTargets = {
  getStorageItem: (key: string) => string | null;
  setStorageItem: (key: string, value: string) => void;
  getProjectSummary: () => EngineProjectSummary;
  now: () => number;
};

export function createGlobalProjectCenterTargets(): ProjectCenterTargets {
  return {
    getStorageItem: (key) => localStorage.getItem(key),
    setStorageItem: (key, value) => localStorage.setItem(key, value),
    getProjectSummary: getEngineProjectSummary,
    now: () => Date.now(),
  };
}

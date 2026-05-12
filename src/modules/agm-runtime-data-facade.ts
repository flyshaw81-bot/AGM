export type AgmProjectSaveTarget = "storage" | "machine";

export type AgmRuntimeDataFacade = {
  loadBrowserSnapshot?: () => Promise<void>;
  saveProject?: (target: AgmProjectSaveTarget) => Promise<void>;
  openUrlSource?: (maplink?: string, random?: number) => void;
  importProjectFile?: (file: Blob | File, callback?: () => void) => void;
  createGeneratedWorld?: () => Promise<void>;
};

export type AgmRuntimeDataHost = {
  AgmRuntimeData?: AgmRuntimeDataFacade;
};

declare global {
  var AgmRuntimeData: AgmRuntimeDataFacade | undefined;
  interface Window {
    AgmRuntimeData?: AgmRuntimeDataFacade;
  }
}

function getDefaultRuntimeHost(): AgmRuntimeDataHost {
  try {
    return ((globalThis as typeof globalThis & { window?: AgmRuntimeDataHost })
      .window ?? globalThis) as AgmRuntimeDataHost;
  } catch {
    return globalThis as AgmRuntimeDataHost;
  }
}

export function getAgmRuntimeDataFacade(
  runtime: AgmRuntimeDataHost = getDefaultRuntimeHost(),
): AgmRuntimeDataFacade {
  try {
    if (!runtime.AgmRuntimeData) runtime.AgmRuntimeData = {};
    return runtime.AgmRuntimeData;
  } catch {
    return {};
  }
}

export function installAgmRuntimeDataFacade(
  facade: AgmRuntimeDataFacade,
  runtime: AgmRuntimeDataHost = getDefaultRuntimeHost(),
): AgmRuntimeDataFacade {
  try {
    runtime.AgmRuntimeData = {
      ...runtime.AgmRuntimeData,
      ...facade,
    };
    return runtime.AgmRuntimeData;
  } catch {
    return facade;
  }
}

const runtime = getDefaultRuntimeHost();
if (runtime) getAgmRuntimeDataFacade(runtime);

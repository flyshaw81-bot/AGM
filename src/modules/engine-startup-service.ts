import {
  type AgmRuntimeDataFacade,
  getAgmRuntimeDataFacade,
} from "./agm-runtime-data-facade";

export type EngineStartupTargets = {
  getUrl: () => URL;
  getOnloadBehavior: () => string;
  warn: (message: string) => void;
  error: (error: unknown) => void;
  openUrlSource: (maplink: string, random?: number) => void;
  showUploadErrorMessage: (error: string, url: string) => void;
  getLastMap: () => Promise<Blob | File | undefined>;
  importProjectFile: (file: Blob | File) => void;
  applyStyleOnLoad: () => Promise<void>;
  generate: () => Promise<unknown>;
  applyLayersPreset: () => void;
  drawLayers: () => void;
  fitMapToScreen: () => void;
  focusOn: () => void;
  toggleAssistant: () => void;
  schedule: (callback: () => void, delay: number) => void;
};

export type EngineStartupService = {
  checkLoadParameters: () => Promise<void>;
  generateMapOnLoad: () => Promise<void>;
};

export type EngineStartupLifecycleTargets = {
  isServerless: () => boolean;
  showServerlessNotice: () => void;
  hideLoading: () => void;
  checkLoadParameters: () => Promise<void>;
  restoreDefaultEvents: () => void;
  initiateAutosave: () => void;
  getReadyState: () => DocumentReadyState;
  onDomContentLoaded: (callback: () => void) => void;
};

export type EngineStartupLifecycle = {
  startInitialMapLoad: () => Promise<void>;
  startPostLoadHooks: () => Promise<void>;
  install: () => void;
};

type StartupGlobal = {
  location?: Location;
  WARN?: boolean;
  ERROR?: boolean;
  ldb?: { get?: (key: string) => Promise<Blob | File | undefined> };
  AgmRuntimeData?: AgmRuntimeDataFacade;
  showUploadErrorMessage?: (error: string, url: string) => void;
  applyStyleOnLoad?: () => Promise<void>;
  generate?: () => Promise<unknown>;
  applyLayersPreset?: () => void;
  drawLayers?: () => void;
  fitMapToScreen?: () => void;
  focusOn?: () => void;
  toggleAssistant?: () => void;
  EngineStartupService?: EngineStartupService;
  checkLoadParameters?: () => Promise<void>;
};

declare global {
  var EngineStartupService: EngineStartupService;
  var checkLoadParameters: () => Promise<void>;
  interface Window {
    EngineStartupService: EngineStartupService;
    checkLoadParameters: () => Promise<void>;
    createEngineStartupLifecycle: (
      targets: EngineStartupLifecycleTargets,
    ) => EngineStartupLifecycle;
  }
}

const VALID_MAP_LINK_PATTERN =
  /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

export function createEngineStartupService(
  targets: EngineStartupTargets,
): EngineStartupService {
  const generateMapOnLoad = async (): Promise<void> => {
    await targets.applyStyleOnLoad();
    await targets.generate();
    targets.applyLayersPreset();
    targets.drawLayers();
    targets.fitMapToScreen();
    targets.focusOn();
    targets.toggleAssistant();
  };

  return {
    generateMapOnLoad,
    async checkLoadParameters(): Promise<void> {
      const params = targets.getUrl().searchParams;
      const maplink = params.get("maplink");

      if (maplink) {
        targets.warn("Load map from URL");
        if (VALID_MAP_LINK_PATTERN.test(maplink)) {
          targets.schedule(() => targets.openUrlSource(maplink, 1), 1000);
          return;
        }

        targets.showUploadErrorMessage("Map link is not a valid URL", maplink);
      }

      if (params.get("seed")) {
        targets.warn("Generate map for seed");
        await generateMapOnLoad();
        return;
      }

      if (targets.getOnloadBehavior() === "lastSaved") {
        try {
          const blob = await targets.getLastMap();
          if (blob) {
            targets.warn("Loading last stored map");
            targets.importProjectFile(blob);
            return;
          }
        } catch (error) {
          targets.error(error);
        }
      }

      targets.warn("Generate random map");
      void generateMapOnLoad();
    },
  };
}

export function createGlobalStartupTargets(
  runtime: StartupGlobal = globalThis as unknown as StartupGlobal,
): EngineStartupTargets {
  return {
    getUrl: () => new URL(runtime.location?.href ?? ""),
    getOnloadBehavior: () =>
      document.querySelector<HTMLInputElement>("#onloadBehavior")?.value ?? "",
    warn: (message) => {
      if (runtime.WARN) console.warn(message);
    },
    error: (error) => {
      if (runtime.ERROR) console.error(error);
    },
    openUrlSource: (maplink, random) =>
      getAgmRuntimeDataFacade(runtime).openUrlSource?.(maplink, random),
    showUploadErrorMessage: (error, url) =>
      runtime.showUploadErrorMessage?.(error, url),
    getLastMap: () =>
      runtime.ldb?.get?.("lastMap") ?? Promise.resolve(undefined),
    importProjectFile: (file) =>
      getAgmRuntimeDataFacade(runtime).importProjectFile?.(file),
    applyStyleOnLoad: () => runtime.applyStyleOnLoad?.() ?? Promise.resolve(),
    generate: () => runtime.generate?.() ?? Promise.resolve(),
    applyLayersPreset: () => runtime.applyLayersPreset?.(),
    drawLayers: () => runtime.drawLayers?.(),
    fitMapToScreen: () => runtime.fitMapToScreen?.(),
    focusOn: () => runtime.focusOn?.(),
    toggleAssistant: () => runtime.toggleAssistant?.(),
    schedule: (callback, delay) => {
      setTimeout(callback, delay);
    },
  };
}

export function createGlobalStartupService(
  targets = createGlobalStartupTargets(),
): EngineStartupService {
  return createEngineStartupService(targets);
}

export function createEngineStartupLifecycle(
  targets: EngineStartupLifecycleTargets,
): EngineStartupLifecycle {
  let initialMapLoadPromise: Promise<void> | undefined;
  let postLoadHooksPromise: Promise<void> | undefined;

  const startInitialMapLoad = async (): Promise<void> => {
    if (initialMapLoadPromise) return initialMapLoadPromise;

    initialMapLoadPromise = (async () => {
      if (targets.isServerless()) {
        targets.showServerlessNotice();
        return;
      }

      targets.hideLoading();
      await targets.checkLoadParameters();
    })();

    return initialMapLoadPromise;
  };

  const startPostLoadHooks = async (): Promise<void> => {
    if (postLoadHooksPromise) return postLoadHooksPromise;

    postLoadHooksPromise = (async () => {
      await startInitialMapLoad();
      targets.restoreDefaultEvents();
      targets.initiateAutosave();
    })();

    return postLoadHooksPromise;
  };

  return {
    startInitialMapLoad,
    startPostLoadHooks,
    install: () => {
      void startInitialMapLoad();
      if (targets.getReadyState() === "complete") {
        void startPostLoadHooks();
        return;
      }

      targets.onDomContentLoaded(() => void startPostLoadHooks());
    },
  };
}

function getRuntimeWindow(): Window | undefined {
  try {
    return window;
  } catch {
    return undefined;
  }
}

const runtimeWindow = getRuntimeWindow();
if (runtimeWindow) {
  runtimeWindow.EngineStartupService = createGlobalStartupService();
  runtimeWindow.createEngineStartupLifecycle = createEngineStartupLifecycle;
  runtimeWindow.checkLoadParameters = () =>
    runtimeWindow.EngineStartupService.checkLoadParameters();
}

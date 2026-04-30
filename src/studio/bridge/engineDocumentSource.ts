import type {
  EngineDocumentSourceSummary,
  EngineSaveTargetSummary,
} from "./engineActionTypes";

type EngineSaveMethod = "storage" | "machine" | "dropbox";
type EngineQuickLoad = () => Promise<void>;
type EngineLoadFromDropbox = () => Promise<void>;
type EngineLoadMapFromUrl = (maplink: string, random?: number) => void;
type EngineUploadMap = (file: Blob | File, callback?: () => void) => void;
type EngineGenerateMapOnLoad = () => Promise<void>;
type EngineSaveMap = (method: EngineSaveMethod) => Promise<void>;

type EngineDocumentSourceTracker = {
  quickLoadWrapped?: EngineQuickLoad;
  loadFromDropboxWrapped?: EngineLoadFromDropbox;
  loadMapFromURLWrapped?: EngineLoadMapFromUrl;
  uploadMapWrapped?: EngineUploadMap;
  generateMapOnLoadWrapped?: EngineGenerateMapOnLoad;
  saveMapWrapped?: EngineSaveMap;
};

type EngineDocumentSourceStore = {
  __studioEngineDocumentSourceSummary?: EngineDocumentSourceSummary;
  __studioEnginePendingDocumentSource?: EngineDocumentSourceSummary | null;
  __studioEngineLastSaveTarget?: EngineSaveTargetSummary;
  __studioEngineDocumentSourceTracker?: EngineDocumentSourceTracker;
};

type EngineDocumentSourceRuntime = {
  quickLoad?: EngineQuickLoad;
  loadFromDropbox?: EngineLoadFromDropbox;
  loadMapFromURL?: EngineLoadMapFromUrl;
  uploadMap?: EngineUploadMap;
  generateMapOnLoad?: EngineGenerateMapOnLoad;
  saveMap?: EngineSaveMap;
  mapName?: { value?: string };
};

export type EngineDocumentSourceTargets = {
  getStore: () => EngineDocumentSourceStore;
  getMapFileName: () => string;
  getDropboxSourceDetail: () => string;
  getRuntimeFunction: <T extends keyof EngineDocumentSourceRuntime>(
    key: T,
  ) => EngineDocumentSourceRuntime[T];
  setRuntimeFunction: <T extends keyof EngineDocumentSourceRuntime>(
    key: T,
    value: NonNullable<EngineDocumentSourceRuntime[T]>,
  ) => void;
};

function getGlobalEngineRuntime(): EngineDocumentSourceRuntime {
  return ((
    globalThis as typeof globalThis & { window?: EngineDocumentSourceRuntime }
  ).window ?? globalThis) as EngineDocumentSourceRuntime;
}

export function createGlobalEngineDocumentSourceTargets(): EngineDocumentSourceTargets {
  return {
    getStore: () => globalThis as EngineDocumentSourceStore,
    getMapFileName: () => {
      const mapName = getGlobalEngineRuntime().mapName?.value?.trim();
      return mapName ? `${mapName}.map` : "Current map";
    },
    getDropboxSourceDetail: () => {
      const dropboxSelect = globalThis.document?.getElementById(
        "loadFromDropboxSelect",
      ) as HTMLSelectElement | null;
      const selectedOption = dropboxSelect?.selectedOptions?.[0] ?? null;
      return (
        selectedOption?.textContent?.trim() ||
        dropboxSelect?.value ||
        "Selected file"
      );
    },
    getRuntimeFunction: (key) => getGlobalEngineRuntime()[key],
    setRuntimeFunction: (key, value) => {
      getGlobalEngineRuntime()[key] = value;
    },
  };
}

function getEngineDocumentSourceStore(targets: EngineDocumentSourceTargets) {
  return targets.getStore();
}

function queueEngineDocumentSource(
  summary: EngineDocumentSourceSummary,
  targets: EngineDocumentSourceTargets,
) {
  getEngineDocumentSourceStore(targets).__studioEnginePendingDocumentSource =
    summary;
}

export function setEngineDocumentSourceSummary(
  summary: EngineDocumentSourceSummary,
  targets = createGlobalEngineDocumentSourceTargets(),
) {
  const store = getEngineDocumentSourceStore(targets);
  store.__studioEngineDocumentSourceSummary = summary;
  store.__studioEnginePendingDocumentSource = null;
}

function setEngineSaveTargetSummary(
  summary: EngineSaveTargetSummary,
  targets: EngineDocumentSourceTargets,
) {
  getEngineDocumentSourceStore(targets).__studioEngineLastSaveTarget = summary;
}

export function getEngineSaveTargetSummary(
  targets = createGlobalEngineDocumentSourceTargets(),
) {
  return (
    getEngineDocumentSourceStore(targets).__studioEngineLastSaveTarget || {
      saveLabel: "Not saved yet",
      saveDetail: "Not saved",
    }
  );
}

function getEngineSaveTargetSummaryForMethod(
  method: EngineSaveMethod,
  targets: EngineDocumentSourceTargets,
) {
  const filename = targets.getMapFileName();
  if (method === "storage") {
    return {
      saveLabel: "Browser snapshot",
      saveDetail: filename,
    } satisfies EngineSaveTargetSummary;
  }
  if (method === "machine") {
    return {
      saveLabel: "Downloads",
      saveDetail: filename,
    } satisfies EngineSaveTargetSummary;
  }
  return {
    saveLabel: "Dropbox",
    saveDetail: filename,
  } satisfies EngineSaveTargetSummary;
}

function formatEngineSourceUrl(maplink: string) {
  try {
    const url = new URL(decodeURIComponent(maplink));
    return `${url.host}${url.pathname}`;
  } catch (error) {
    console.warn("AGM Studio could not parse the source URL.", error);
    try {
      return decodeURIComponent(maplink);
    } catch (decodeError) {
      console.warn("AGM Studio could not decode the source URL.", decodeError);
      return maplink;
    }
  }
}

function inferEngineDocumentSourceFromUpload(
  file: Blob | File,
): EngineDocumentSourceSummary | null {
  if (
    file &&
    typeof file === "object" &&
    "name" in file &&
    typeof file.name === "string" &&
    file.name
  ) {
    return {
      sourceLabel: "Local file",
      sourceDetail: file.name,
    };
  }

  return null;
}

export function getEngineDocumentSourceSummary(
  targets = createGlobalEngineDocumentSourceTargets(),
) {
  return (
    getEngineDocumentSourceStore(targets)
      .__studioEngineDocumentSourceSummary || {
      sourceLabel: "Generated",
      sourceDetail: "Current settings",
    }
  );
}

function commitPendingDocumentSource(targets: EngineDocumentSourceTargets) {
  const pendingSource =
    getEngineDocumentSourceStore(targets).__studioEnginePendingDocumentSource;
  if (pendingSource) setEngineDocumentSourceSummary(pendingSource, targets);
}

export function ensureEngineDocumentSourceTracking(
  targets = createGlobalEngineDocumentSourceTargets(),
) {
  const store = getEngineDocumentSourceStore(targets);
  if (!store.__studioEngineDocumentSourceTracker) {
    store.__studioEngineDocumentSourceTracker = {};
  }
  const tracker = store.__studioEngineDocumentSourceTracker;

  const quickLoad = targets.getRuntimeFunction("quickLoad");
  if (
    typeof quickLoad === "function" &&
    tracker.quickLoadWrapped !== quickLoad
  ) {
    const wrappedQuickLoad: EngineQuickLoad = async () => {
      queueEngineDocumentSource(
        {
          sourceLabel: "Browser snapshot",
          sourceDetail: "Quick load",
        },
        targets,
      );
      try {
        return await quickLoad();
      } finally {
        commitPendingDocumentSource(targets);
      }
    };
    tracker.quickLoadWrapped = wrappedQuickLoad;
    targets.setRuntimeFunction("quickLoad", wrappedQuickLoad);
  }

  const loadFromDropbox = targets.getRuntimeFunction("loadFromDropbox");
  if (
    typeof loadFromDropbox === "function" &&
    tracker.loadFromDropboxWrapped !== loadFromDropbox
  ) {
    const wrappedLoadFromDropbox: EngineLoadFromDropbox = async () => {
      queueEngineDocumentSource(
        {
          sourceLabel: "Dropbox",
          sourceDetail: targets.getDropboxSourceDetail(),
        },
        targets,
      );
      try {
        return await loadFromDropbox();
      } finally {
        commitPendingDocumentSource(targets);
      }
    };
    tracker.loadFromDropboxWrapped = wrappedLoadFromDropbox;
    targets.setRuntimeFunction("loadFromDropbox", wrappedLoadFromDropbox);
  }

  const loadMapFromURL = targets.getRuntimeFunction("loadMapFromURL");
  if (
    typeof loadMapFromURL === "function" &&
    tracker.loadMapFromURLWrapped !== loadMapFromURL
  ) {
    const wrappedLoadMapFromURL: EngineLoadMapFromUrl = (maplink, random) => {
      queueEngineDocumentSource(
        {
          sourceLabel: "URL",
          sourceDetail: formatEngineSourceUrl(maplink),
        },
        targets,
      );
      try {
        return loadMapFromURL(maplink, random);
      } finally {
        commitPendingDocumentSource(targets);
      }
    };
    tracker.loadMapFromURLWrapped = wrappedLoadMapFromURL;
    targets.setRuntimeFunction("loadMapFromURL", wrappedLoadMapFromURL);
  }

  const uploadMap = targets.getRuntimeFunction("uploadMap");
  if (
    typeof uploadMap === "function" &&
    tracker.uploadMapWrapped !== uploadMap
  ) {
    const wrappedUploadMap: EngineUploadMap = (file, callback) => {
      const inferredSource = inferEngineDocumentSourceFromUpload(file);
      const pendingSource = store.__studioEnginePendingDocumentSource;
      const nextSource = inferredSource || pendingSource;
      if (nextSource) setEngineDocumentSourceSummary(nextSource, targets);
      return uploadMap(file, callback);
    };
    tracker.uploadMapWrapped = wrappedUploadMap;
    targets.setRuntimeFunction("uploadMap", wrappedUploadMap);
  }

  const generateMapOnLoad = targets.getRuntimeFunction("generateMapOnLoad");
  if (
    typeof generateMapOnLoad === "function" &&
    tracker.generateMapOnLoadWrapped !== generateMapOnLoad
  ) {
    const wrappedGenerateMapOnLoad: EngineGenerateMapOnLoad = async () => {
      const result = await generateMapOnLoad();
      setEngineDocumentSourceSummary(
        {
          sourceLabel: "Generated",
          sourceDetail: "Current settings",
        },
        targets,
      );
      return result;
    };
    tracker.generateMapOnLoadWrapped = wrappedGenerateMapOnLoad;
    targets.setRuntimeFunction("generateMapOnLoad", wrappedGenerateMapOnLoad);
  }

  const saveMap = targets.getRuntimeFunction("saveMap");
  if (typeof saveMap === "function" && tracker.saveMapWrapped !== saveMap) {
    const wrappedSaveMap: EngineSaveMap = async (method) => {
      const result = await saveMap(method);
      setEngineSaveTargetSummary(
        getEngineSaveTargetSummaryForMethod(method, targets),
        targets,
      );
      return result;
    };
    tracker.saveMapWrapped = wrappedSaveMap;
    targets.setRuntimeFunction("saveMap", wrappedSaveMap);
  }
}

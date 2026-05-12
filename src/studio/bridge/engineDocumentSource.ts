import {
  type AgmRuntimeDataFacade,
  getAgmRuntimeDataFacade,
} from "../../modules/agm-runtime-data-facade";
import type {
  EngineDocumentSourceSummary,
  EngineSaveTargetSummary,
} from "./engineActionTypes";

type EngineSaveMethod = "storage" | "machine";
type AgmBrowserSnapshotLoader = () => Promise<void>;
type AgmUrlSourceLoader = (maplink?: string, random?: number) => void;
type AgmFileUploader = (file: Blob | File, callback?: () => void) => void;
type AgmGeneratedWorldCreator = () => Promise<void>;
type AgmProjectSaver = (method: EngineSaveMethod) => Promise<void>;

type EngineDocumentSourceTracker = {
  browserSnapshotLoaderWrapped?: AgmBrowserSnapshotLoader;
  urlSourceLoaderWrapped?: AgmUrlSourceLoader;
  fileUploaderWrapped?: AgmFileUploader;
  generatedWorldCreatorWrapped?: AgmGeneratedWorldCreator;
  projectSaverWrapped?: AgmProjectSaver;
};

type EngineDocumentSourceStore = {
  __studioEngineDocumentSourceSummary?: EngineDocumentSourceSummary;
  __studioEnginePendingDocumentSource?: EngineDocumentSourceSummary | null;
  __studioEngineLastSaveTarget?: EngineSaveTargetSummary;
  __studioEngineDocumentSourceTracker?: EngineDocumentSourceTracker;
};

type EngineDocumentSourceRuntime = {
  AgmRuntimeData?: AgmRuntimeDataFacade;
  mapName?: { value?: string };
};

export type EngineDocumentSourceTargets = {
  getStore: () => EngineDocumentSourceStore;
  getMapFileName: () => string;
  getBrowserSnapshotLoader: () => AgmBrowserSnapshotLoader | undefined;
  setBrowserSnapshotLoader: (loader: AgmBrowserSnapshotLoader) => void;
  getUrlSourceLoader: () => AgmUrlSourceLoader | undefined;
  setUrlSourceLoader: (loader: AgmUrlSourceLoader) => void;
  getFileUploader: () => AgmFileUploader | undefined;
  setFileUploader: (uploader: AgmFileUploader) => void;
  getGeneratedWorldCreator: () => AgmGeneratedWorldCreator | undefined;
  setGeneratedWorldCreator: (creator: AgmGeneratedWorldCreator) => void;
  getProjectSaver: () => AgmProjectSaver | undefined;
  setProjectSaver: (saver: AgmProjectSaver) => void;
};

function getGlobalEngineRuntime(): EngineDocumentSourceRuntime {
  try {
    return ((
      globalThis as typeof globalThis & { window?: EngineDocumentSourceRuntime }
    ).window ?? globalThis) as EngineDocumentSourceRuntime;
  } catch {
    return globalThis as EngineDocumentSourceRuntime;
  }
}

export function createGlobalEngineDocumentSourceTargets(): EngineDocumentSourceTargets {
  return {
    getStore: () => globalThis as EngineDocumentSourceStore,
    getMapFileName: () => {
      try {
        const mapName = getGlobalEngineRuntime().mapName?.value?.trim();
        return mapName ? `${mapName}.map` : "Current map";
      } catch {
        return "Current map";
      }
    },
    getBrowserSnapshotLoader: () => {
      try {
        return getAgmRuntimeDataFacade(getGlobalEngineRuntime())
          .loadBrowserSnapshot;
      } catch {
        return undefined;
      }
    },
    setBrowserSnapshotLoader: (loader) => {
      try {
        getAgmRuntimeDataFacade(getGlobalEngineRuntime()).loadBrowserSnapshot =
          loader;
      } catch {
        // Document-source tracking is optional for blocked compatibility runtimes.
      }
    },
    getUrlSourceLoader: () => {
      try {
        return getAgmRuntimeDataFacade(getGlobalEngineRuntime()).openUrlSource;
      } catch {
        return undefined;
      }
    },
    setUrlSourceLoader: (loader) => {
      try {
        getAgmRuntimeDataFacade(getGlobalEngineRuntime()).openUrlSource =
          loader;
      } catch {
        // Document-source tracking is optional for blocked compatibility runtimes.
      }
    },
    getFileUploader: () => {
      try {
        return getAgmRuntimeDataFacade(getGlobalEngineRuntime())
          .importProjectFile;
      } catch {
        return undefined;
      }
    },
    setFileUploader: (uploader) => {
      try {
        getAgmRuntimeDataFacade(getGlobalEngineRuntime()).importProjectFile =
          uploader;
      } catch {
        // Document-source tracking is optional for blocked compatibility runtimes.
      }
    },
    getGeneratedWorldCreator: () => {
      try {
        return getAgmRuntimeDataFacade(getGlobalEngineRuntime())
          .createGeneratedWorld;
      } catch {
        return undefined;
      }
    },
    setGeneratedWorldCreator: (creator) => {
      try {
        getAgmRuntimeDataFacade(getGlobalEngineRuntime()).createGeneratedWorld =
          creator;
      } catch {
        // Document-source tracking is optional for blocked compatibility runtimes.
      }
    },
    getProjectSaver: () => {
      try {
        return getAgmRuntimeDataFacade(getGlobalEngineRuntime()).saveProject;
      } catch {
        return undefined;
      }
    },
    setProjectSaver: (saver) => {
      try {
        getAgmRuntimeDataFacade(getGlobalEngineRuntime()).saveProject = saver;
      } catch {
        // Document-source tracking is optional for blocked compatibility runtimes.
      }
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
    saveLabel: "Not saved yet",
    saveDetail: filename,
  } satisfies EngineSaveTargetSummary;
}

function formatEngineSourceUrl(maplink = "") {
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

  const browserSnapshotLoader = targets.getBrowserSnapshotLoader();
  if (
    typeof browserSnapshotLoader === "function" &&
    tracker.browserSnapshotLoaderWrapped !== browserSnapshotLoader
  ) {
    const wrappedBrowserSnapshotLoader: AgmBrowserSnapshotLoader = async () => {
      queueEngineDocumentSource(
        {
          sourceLabel: "Browser snapshot",
          sourceDetail: "Browser snapshot",
        },
        targets,
      );
      try {
        return await browserSnapshotLoader();
      } finally {
        commitPendingDocumentSource(targets);
      }
    };
    tracker.browserSnapshotLoaderWrapped = wrappedBrowserSnapshotLoader;
    targets.setBrowserSnapshotLoader(wrappedBrowserSnapshotLoader);
  }

  const urlSourceLoader = targets.getUrlSourceLoader();
  if (
    typeof urlSourceLoader === "function" &&
    tracker.urlSourceLoaderWrapped !== urlSourceLoader
  ) {
    const wrappedUrlSourceLoader: AgmUrlSourceLoader = (maplink, random) => {
      queueEngineDocumentSource(
        {
          sourceLabel: "URL",
          sourceDetail: formatEngineSourceUrl(maplink),
        },
        targets,
      );
      try {
        return urlSourceLoader(maplink, random);
      } finally {
        commitPendingDocumentSource(targets);
      }
    };
    tracker.urlSourceLoaderWrapped = wrappedUrlSourceLoader;
    targets.setUrlSourceLoader(wrappedUrlSourceLoader);
  }

  const fileUploader = targets.getFileUploader();
  if (
    typeof fileUploader === "function" &&
    tracker.fileUploaderWrapped !== fileUploader
  ) {
    const wrappedFileUploader: AgmFileUploader = (file, callback) => {
      const inferredSource = inferEngineDocumentSourceFromUpload(file);
      const pendingSource = store.__studioEnginePendingDocumentSource;
      const nextSource = inferredSource || pendingSource;
      if (nextSource) setEngineDocumentSourceSummary(nextSource, targets);
      return fileUploader(file, callback);
    };
    tracker.fileUploaderWrapped = wrappedFileUploader;
    targets.setFileUploader(wrappedFileUploader);
  }

  const generatedWorldCreator = targets.getGeneratedWorldCreator();
  if (
    typeof generatedWorldCreator === "function" &&
    tracker.generatedWorldCreatorWrapped !== generatedWorldCreator
  ) {
    const wrappedGeneratedWorldCreator: AgmGeneratedWorldCreator = async () => {
      const result = await generatedWorldCreator();
      setEngineDocumentSourceSummary(
        {
          sourceLabel: "Generated",
          sourceDetail: "Current settings",
        },
        targets,
      );
      return result;
    };
    tracker.generatedWorldCreatorWrapped = wrappedGeneratedWorldCreator;
    targets.setGeneratedWorldCreator(wrappedGeneratedWorldCreator);
  }

  const projectSaver = targets.getProjectSaver();
  if (
    typeof projectSaver === "function" &&
    tracker.projectSaverWrapped !== projectSaver
  ) {
    const wrappedProjectSaver: AgmProjectSaver = async (method) => {
      const result = await projectSaver(method);
      setEngineSaveTargetSummary(
        getEngineSaveTargetSummaryForMethod(method, targets),
        targets,
      );
      return result;
    };
    tracker.projectSaverWrapped = wrappedProjectSaver;
    targets.setProjectSaver(wrappedProjectSaver);
  }
}

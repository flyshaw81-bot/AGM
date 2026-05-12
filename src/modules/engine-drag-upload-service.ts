import { byId } from "../utils/shorthands";
import {
  type AgmRuntimeDataFacade,
  getAgmRuntimeDataFacade,
} from "./agm-runtime-data-facade";

export type EngineDragUploadTargets = {
  addDocumentListener: (
    event: "dragover" | "dragleave" | "drop",
    handler: (event: DragEvent) => void,
  ) => void;
  getOverlay: () => HTMLElement | null;
  showInvalidFileNotice: () => void;
  closeDialogs: () => void;
  importProjectFile: (file: File, callback: () => void) => void;
};

export type EngineDragUploadService = {
  install: () => void;
};

type DragUploadGlobal = {
  document?: Document;
  AgmRuntimeData?: AgmRuntimeDataFacade;
  EngineNoticeService?: {
    showModal: (notice: {
      title: string;
      html: string;
      position?: unknown;
    }) => void;
  };
  closeDialogs?: () => void;
};

declare global {
  var EngineDragUploadService: EngineDragUploadService;
  interface Window {
    EngineDragUploadService: EngineDragUploadService;
  }
}

export function createEngineDragUploadService(
  targets: EngineDragUploadTargets,
): EngineDragUploadService {
  return {
    install: () => {
      targets.addDocumentListener("dragover", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const overlay = targets.getOverlay();
        if (overlay) overlay.style.display = "";
      });

      targets.addDocumentListener("dragleave", () => {
        const overlay = targets.getOverlay();
        if (overlay) overlay.style.display = "none";
      });

      targets.addDocumentListener("drop", (event) => {
        event.stopPropagation();
        event.preventDefault();

        const overlay = targets.getOverlay();
        if (overlay) overlay.style.display = "none";
        if (
          !event.dataTransfer?.items ||
          event.dataTransfer.items.length !== 1
        ) {
          return;
        }

        const file = event.dataTransfer.items[0]?.getAsFile();
        if (!file) return;

        if (!file.name.endsWith(".map") && !file.name.endsWith(".gz")) {
          targets.showInvalidFileNotice();
          return;
        }

        if (overlay) {
          overlay.style.display = "";
          overlay.innerHTML =
            "Uploading<span>.</span><span>.</span><span>.</span>";
        }
        targets.closeDialogs();
        targets.importProjectFile(file, () => {
          const currentOverlay = targets.getOverlay();
          if (!currentOverlay) return;
          currentOverlay.style.display = "none";
          currentOverlay.innerHTML = "Drop a map file to open";
        });
      });
    },
  };
}

export function createGlobalDragUploadTargets(
  runtime: DragUploadGlobal = globalThis as unknown as DragUploadGlobal,
): EngineDragUploadTargets {
  return {
    addDocumentListener: (event, handler) =>
      runtime.document?.addEventListener(event, handler as EventListener),
    getOverlay: () => byId("mapOverlay") ?? null,
    showInvalidFileNotice: () =>
      runtime.EngineNoticeService?.showModal({
        title: "Invalid file format",
        html: "Please upload a map file (<i>.map</i> or <i>.gz</i> formats) you have previously downloaded",
        position: { my: "center", at: "center", of: "svg" },
      }),
    closeDialogs: () => runtime.closeDialogs?.(),
    importProjectFile: (file, callback) =>
      getAgmRuntimeDataFacade(runtime).importProjectFile?.(file, callback),
  };
}

export function createGlobalDragUploadService(
  targets = createGlobalDragUploadTargets(),
): EngineDragUploadService {
  return createEngineDragUploadService(targets);
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
  runtimeWindow.EngineDragUploadService = createGlobalDragUploadService();
  runtimeWindow.EngineDragUploadService.install();
}

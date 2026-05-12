import { describe, expect, it, vi } from "vitest";

import {
  createEngineDragUploadService,
  type EngineDragUploadTargets,
} from "./engine-drag-upload-service";

type DragUploadHandlers = {
  dragleave?: (event: DragEvent) => void;
  dragover?: (event: DragEvent) => void;
  drop?: (event: DragEvent) => void;
};

function createDragEvent(file?: File): DragEvent {
  return {
    dataTransfer: {
      items: file ? [{ getAsFile: () => file }] : [],
    },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as DragEvent;
}

function createTargets(overrides: Partial<EngineDragUploadTargets> = {}): {
  handlers: DragUploadHandlers;
  targets: EngineDragUploadTargets;
  overlay: HTMLElement;
} {
  const handlers: DragUploadHandlers = {};
  const overlay = {
    innerHTML: "Drop a map file to open",
    style: { display: "none" },
  } as HTMLElement;
  const targets: EngineDragUploadTargets = {
    addDocumentListener: vi.fn(
      (
        event: keyof DragUploadHandlers,
        handler: (event: DragEvent) => void,
      ) => {
        handlers[event] = handler;
      },
    ),
    getOverlay: vi.fn(() => overlay),
    showInvalidFileNotice: vi.fn(),
    closeDialogs: vi.fn(),
    importProjectFile: vi.fn((_file, callback) => callback()),
    ...overrides,
  };
  return { handlers, overlay, targets };
}

describe("engine drag upload service", () => {
  it("shows and hides the map overlay on drag movement", () => {
    const { handlers, overlay, targets } = createTargets();
    createEngineDragUploadService(targets).install();

    handlers.dragover?.(createDragEvent());
    expect(overlay.style.display).toBe("");

    handlers.dragleave?.(createDragEvent());
    expect(overlay.style.display).toBe("none");
  });

  it("shows a native notice for unsupported dropped files", () => {
    const { handlers, targets } = createTargets();
    createEngineDragUploadService(targets).install();

    handlers.drop?.(createDragEvent(new File(["bad"], "notes.txt")));

    expect(targets.showInvalidFileNotice).toHaveBeenCalledTimes(1);
    expect(targets.importProjectFile).not.toHaveBeenCalled();
  });

  it("uploads supported map files and restores the overlay", () => {
    const file = new File(["map"], "world.map");
    const { handlers, overlay, targets } = createTargets();
    createEngineDragUploadService(targets).install();

    handlers.drop?.(createDragEvent(file));

    expect(targets.closeDialogs).toHaveBeenCalledTimes(1);
    expect(targets.importProjectFile).toHaveBeenCalledWith(
      file,
      expect.any(Function),
    );
    expect(overlay.style.display).toBe("none");
    expect(overlay.innerHTML).toBe("Drop a map file to open");
  });
});

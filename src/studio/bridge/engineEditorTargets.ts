import type { EditorAction } from "./engineActionTypes";

type EngineEditorRuntime = Partial<Record<EditorAction, () => unknown>>;

export type EngineEditorTargets = {
  hasEditorHandler: (action: EditorAction) => boolean;
  runEditorHandler: (action: EditorAction) => Promise<void>;
  isDialogOpen: (dialogId: string) => boolean;
  closeDialog: (dialogId: string) => void;
};

function getGlobalEditorRuntime(): EngineEditorRuntime {
  return ((globalThis as typeof globalThis & { window?: EngineEditorRuntime })
    .window ?? globalThis) as EngineEditorRuntime;
}

function isElementVisible(element: HTMLElement) {
  if (element.hidden) return false;
  if (element.offsetParent === null) return false;
  const style = globalThis.window?.getComputedStyle(element);
  return style?.display !== "none" && style?.visibility !== "hidden";
}

function getDialogElement(dialogId: string) {
  return globalThis.document?.getElementById(dialogId) ?? null;
}

export function createGlobalEngineEditorTargets(): EngineEditorTargets {
  return {
    hasEditorHandler: (action) =>
      typeof getGlobalEditorRuntime()[action] === "function",
    runEditorHandler: async (action) => {
      const handler = getGlobalEditorRuntime()[action];
      if (typeof handler === "function") await handler();
    },
    isDialogOpen: (dialogId) => {
      const dialog = getDialogElement(dialogId);
      if (!dialog) return false;
      return isElementVisible(dialog);
    },
    closeDialog: (dialogId) => {
      const dialog = getDialogElement(dialogId);
      if (!dialog) return;

      const wrapper = dialog.closest(".ui-dialog");
      if (!wrapper) return;

      const closeButton = wrapper.querySelector<HTMLButtonElement>(
        ".ui-dialog-titlebar-close",
      );
      if (closeButton) {
        closeButton.click();
        return;
      }

      wrapper.setAttribute("aria-hidden", "true");
      (wrapper as HTMLElement).style.display = "none";
    },
  };
}

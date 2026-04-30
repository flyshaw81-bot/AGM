import type { EditorAction } from "./engineActionTypes";

type EngineEditorRuntime = Partial<Record<EditorAction, () => unknown>>;

export type EngineEditorHandlerRuntime = {
  getHandler: (action: EditorAction) => (() => unknown) | undefined;
};

export type EngineEditorDialogAdapter = {
  isOpen: (dialogId: string) => boolean;
  close: (dialogId: string) => void;
};

export type EngineEditorDialogDomAdapter = {
  getElementById: (dialogId: string) => HTMLElement | null;
  getComputedStyle: (
    element: HTMLElement,
  ) => Pick<CSSStyleDeclaration, "display" | "visibility"> | null;
};

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

export function createGlobalEngineEditorHandlerRuntime(): EngineEditorHandlerRuntime {
  return {
    getHandler: (action) => {
      const handler = getGlobalEditorRuntime()[action];
      return typeof handler === "function" ? handler : undefined;
    },
  };
}

function isElementVisible(
  element: HTMLElement,
  domAdapter: EngineEditorDialogDomAdapter,
) {
  if (element.hidden) return false;
  if (element.offsetParent === null) return false;
  const style = domAdapter.getComputedStyle(element);
  return style?.display !== "none" && style?.visibility !== "hidden";
}

export function createGlobalEngineEditorDialogDomAdapter(): EngineEditorDialogDomAdapter {
  return {
    getElementById: (dialogId) =>
      globalThis.document?.getElementById(dialogId) ?? null,
    getComputedStyle: (element) =>
      globalThis.window?.getComputedStyle(element) ?? null,
  };
}

export function createJQueryEngineEditorDialogAdapter(
  domAdapter: EngineEditorDialogDomAdapter = createGlobalEngineEditorDialogDomAdapter(),
): EngineEditorDialogAdapter {
  return {
    isOpen: (dialogId) => {
      const dialog = domAdapter.getElementById(dialogId);
      if (!dialog) return false;
      return isElementVisible(dialog, domAdapter);
    },
    close: (dialogId) => {
      const dialog = domAdapter.getElementById(dialogId);
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

export function createEngineEditorTargets(
  handlerRuntime: EngineEditorHandlerRuntime,
  dialogAdapter: EngineEditorDialogAdapter,
): EngineEditorTargets {
  return {
    hasEditorHandler: (action) => Boolean(handlerRuntime.getHandler(action)),
    runEditorHandler: async (action) => {
      const handler = handlerRuntime.getHandler(action);
      if (handler) await handler();
    },
    isDialogOpen: (dialogId) => dialogAdapter.isOpen(dialogId),
    closeDialog: (dialogId) => dialogAdapter.close(dialogId),
  };
}

export function createGlobalEngineEditorTargets(
  handlerRuntime: EngineEditorHandlerRuntime = createGlobalEngineEditorHandlerRuntime(),
  dialogAdapter: EngineEditorDialogAdapter = createJQueryEngineEditorDialogAdapter(),
): EngineEditorTargets {
  return createEngineEditorTargets(handlerRuntime, dialogAdapter);
}

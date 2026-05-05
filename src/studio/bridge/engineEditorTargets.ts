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
  try {
    return ((globalThis as typeof globalThis & { window?: EngineEditorRuntime })
      .window ?? globalThis) as EngineEditorRuntime;
  } catch {
    return globalThis as EngineEditorRuntime;
  }
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
  try {
    if (element.hidden) return false;
    if (element.offsetParent === null) return false;
    const style = domAdapter.getComputedStyle(element);
    return style?.display !== "none" && style?.visibility !== "hidden";
  } catch {
    return false;
  }
}

export function createGlobalEngineEditorDialogDomAdapter(): EngineEditorDialogDomAdapter {
  return {
    getElementById: (dialogId) => {
      try {
        return globalThis.document?.getElementById(dialogId) ?? null;
      } catch {
        return null;
      }
    },
    getComputedStyle: (element) => {
      try {
        return globalThis.window?.getComputedStyle(element) ?? null;
      } catch {
        return null;
      }
    },
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
      try {
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
      } catch {
        // Dialog fallback closing is best-effort for compatibility wrappers.
      }
    },
  };
}

export function createStudioEngineEditorDialogAdapter(
  domAdapter: EngineEditorDialogDomAdapter = createGlobalEngineEditorDialogDomAdapter(),
): EngineEditorDialogAdapter {
  return {
    isOpen: (dialogId) => {
      const dialog = domAdapter.getElementById(dialogId);
      if (!dialog) return false;
      return isElementVisible(dialog, domAdapter);
    },
    close: (dialogId) => {
      try {
        const dialog = domAdapter.getElementById(dialogId);
        if (!dialog) return;

        if ("close" in dialog && typeof dialog.close === "function") {
          dialog.close();
          return;
        }

        const closeButton = dialog.querySelector<HTMLButtonElement>(
          "[data-agm-dialog-close], [data-studio-dialog-close], [data-dialog-close]",
        );
        if (closeButton) {
          closeButton.click();
          return;
        }

        dialog.setAttribute("aria-hidden", "true");
        dialog.hidden = true;
      } catch {
        // Studio-owned dialogs can remain open if the host blocks DOM writes.
      }
    },
  };
}

export function createCompositeEngineEditorDialogAdapter(
  adapters: EngineEditorDialogAdapter[],
): EngineEditorDialogAdapter {
  return {
    isOpen: (dialogId) => adapters.some((adapter) => adapter.isOpen(dialogId)),
    close: (dialogId) => {
      for (const adapter of adapters) {
        try {
          if (adapter.isOpen(dialogId)) adapter.close(dialogId);
        } catch {
          // Keep one failing compatibility adapter from blocking the rest.
        }
      }
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
  dialogAdapter: EngineEditorDialogAdapter = createCompositeEngineEditorDialogAdapter(
    [
      createStudioEngineEditorDialogAdapter(),
      createJQueryEngineEditorDialogAdapter(),
    ],
  ),
): EngineEditorTargets {
  return createEngineEditorTargets(handlerRuntime, dialogAdapter);
}

export type EngineHostDomAdapter = {
  getElementById: (id: string) => HTMLElement | null;
  createElement: (tagName: string) => HTMLElement;
  appendToBody: (element: HTMLElement) => void;
};

export type EngineHostDialogAdapter = {
  queryDialogs: () => HTMLElement[];
};

export type EngineHostDialogDomAdapter = {
  querySelectorAll: (selector: string) => HTMLElement[];
};

export type EngineHostTargets = EngineHostDomAdapter & EngineHostDialogAdapter;

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function createGlobalEngineHostDomAdapter(): EngineHostDomAdapter {
  return {
    getElementById: (id) => {
      try {
        return getDocument()?.getElementById(id) ?? null;
      } catch {
        return null;
      }
    },
    createElement: (tagName) => {
      try {
        return (
          getDocument()?.createElement(tagName) ??
          ({ id: "", dataset: {}, style: {} } as HTMLElement)
        );
      } catch {
        return { id: "", dataset: {}, style: {} } as HTMLElement;
      }
    },
    appendToBody: (element) => {
      try {
        getDocument()?.body?.appendChild(element);
      } catch {
        // Host elements can remain detached in restricted runtimes.
      }
    },
  };
}

export function createGlobalEngineHostDialogDomAdapter(): EngineHostDialogDomAdapter {
  return {
    querySelectorAll: (selector) => {
      try {
        return Array.from(
          getDocument()?.querySelectorAll<HTMLElement>(selector) ?? [],
        );
      } catch {
        return [];
      }
    },
  };
}

export function createStudioEngineHostDialogAdapter(
  domAdapter: EngineHostDialogDomAdapter = createGlobalEngineHostDialogDomAdapter(),
): EngineHostDialogAdapter {
  return {
    queryDialogs: () =>
      domAdapter.querySelectorAll(
        "#dialogs > [data-agm-engine-dialog], #dialogs > [data-studio-engine-dialog]",
      ),
  };
}

export function createCompositeEngineHostDialogAdapter(
  adapters: EngineHostDialogAdapter[],
): EngineHostDialogAdapter {
  return {
    queryDialogs: () => {
      const dialogs = new Set<HTMLElement>();
      for (const adapter of adapters) {
        for (const dialog of adapter.queryDialogs()) dialogs.add(dialog);
      }
      return Array.from(dialogs);
    },
  };
}

export function createEngineHostTargets(
  domAdapter: EngineHostDomAdapter,
  dialogAdapter: EngineHostDialogAdapter,
): EngineHostTargets {
  return {
    ...domAdapter,
    ...dialogAdapter,
  };
}

export function createGlobalEngineHostTargets(
  domAdapter: EngineHostDomAdapter = createGlobalEngineHostDomAdapter(),
  dialogAdapter: EngineHostDialogAdapter = createCompositeEngineHostDialogAdapter(
    [createStudioEngineHostDialogAdapter()],
  ),
): EngineHostTargets {
  return createEngineHostTargets(domAdapter, dialogAdapter);
}

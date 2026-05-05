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
    getElementById: (id) => getDocument()?.getElementById(id) ?? null,
    createElement: (tagName) =>
      getDocument()?.createElement(tagName) ??
      ({ id: "", dataset: {}, style: {} } as HTMLElement),
    appendToBody: (element) => {
      getDocument()?.body?.appendChild(element);
    },
  };
}

export function createGlobalEngineHostDialogDomAdapter(): EngineHostDialogDomAdapter {
  return {
    querySelectorAll: (selector) =>
      Array.from(getDocument()?.querySelectorAll<HTMLElement>(selector) ?? []),
  };
}

export function createJQueryEngineHostDialogAdapter(
  domAdapter: EngineHostDialogDomAdapter = createGlobalEngineHostDialogDomAdapter(),
): EngineHostDialogAdapter {
  return {
    queryDialogs: () => domAdapter.querySelectorAll("#dialogs > .ui-dialog"),
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
    [
      createStudioEngineHostDialogAdapter(),
      createJQueryEngineHostDialogAdapter(),
    ],
  ),
): EngineHostTargets {
  return createEngineHostTargets(domAdapter, dialogAdapter);
}

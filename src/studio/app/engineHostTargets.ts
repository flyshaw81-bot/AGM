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

export function createGlobalEngineHostDomAdapter(): EngineHostDomAdapter {
  return {
    getElementById: (id) => globalThis.document?.getElementById(id) ?? null,
    createElement: (tagName) => globalThis.document.createElement(tagName),
    appendToBody: (element) => {
      globalThis.document.body.appendChild(element);
    },
  };
}

export function createGlobalEngineHostDialogDomAdapter(): EngineHostDialogDomAdapter {
  return {
    querySelectorAll: (selector) =>
      Array.from(
        globalThis.document?.querySelectorAll<HTMLElement>(selector) ?? [],
      ),
  };
}

export function createJQueryEngineHostDialogAdapter(
  domAdapter: EngineHostDialogDomAdapter = createGlobalEngineHostDialogDomAdapter(),
): EngineHostDialogAdapter {
  return {
    queryDialogs: () => domAdapter.querySelectorAll("#dialogs > .ui-dialog"),
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
  dialogAdapter: EngineHostDialogAdapter = createJQueryEngineHostDialogAdapter(),
): EngineHostTargets {
  return createEngineHostTargets(domAdapter, dialogAdapter);
}

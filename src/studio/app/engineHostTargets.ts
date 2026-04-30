export type EngineHostDomAdapter = {
  getElementById: (id: string) => HTMLElement | null;
  createElement: (tagName: string) => HTMLElement;
  appendToBody: (element: HTMLElement) => void;
};

export type EngineHostDialogAdapter = {
  queryDialogs: () => HTMLElement[];
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

export function createJQueryEngineHostDialogAdapter(): EngineHostDialogAdapter {
  return {
    queryDialogs: () =>
      Array.from(
        globalThis.document?.querySelectorAll<HTMLElement>(
          "#dialogs > .ui-dialog",
        ) ?? [],
      ),
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

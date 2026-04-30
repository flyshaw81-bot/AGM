export type EngineHostTargets = {
  getElementById: (id: string) => HTMLElement | null;
  createElement: (tagName: string) => HTMLElement;
  appendToBody: (element: HTMLElement) => void;
  queryDialogs: () => HTMLElement[];
};

export function createGlobalEngineHostTargets(): EngineHostTargets {
  return {
    getElementById: (id) => globalThis.document?.getElementById(id) ?? null,
    createElement: (tagName) => globalThis.document.createElement(tagName),
    appendToBody: (element) => {
      globalThis.document.body.appendChild(element);
    },
    queryDialogs: () =>
      Array.from(
        globalThis.document?.querySelectorAll<HTMLElement>(
          "#dialogs > .ui-dialog",
        ) ?? [],
      ),
  };
}

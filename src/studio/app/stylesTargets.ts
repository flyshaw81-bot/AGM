export type StudioStyleTargets = {
  getStyleElement: (id: string) => HTMLElement | null;
  createStyleElement: () => HTMLStyleElement;
  appendToHead: (element: HTMLStyleElement) => void;
};

export function createStudioStyleTargets(
  targets: StudioStyleTargets,
): StudioStyleTargets {
  return targets;
}

export function createGlobalStudioStyleTargets(): StudioStyleTargets {
  return createStudioStyleTargets({
    getStyleElement: (id) => globalThis.document?.getElementById(id) ?? null,
    createStyleElement: () =>
      globalThis.document?.createElement("style") ??
      ({ id: "", textContent: "" } as HTMLStyleElement),
    appendToHead: (element) => {
      globalThis.document?.head?.appendChild(element);
    },
  });
}

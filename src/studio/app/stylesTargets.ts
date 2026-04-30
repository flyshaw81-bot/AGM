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
    getStyleElement: (id) => document.getElementById(id),
    createStyleElement: () => document.createElement("style"),
    appendToHead: (element) => {
      document.head.appendChild(element);
    },
  });
}

export type StudioStyleTargets = {
  getStyleElement: (id: string) => HTMLElement | null;
  createStyleElement: () => HTMLStyleElement;
  appendToHead: (element: HTMLStyleElement) => void;
};

export function createGlobalStudioStyleTargets(): StudioStyleTargets {
  return {
    getStyleElement: (id) => document.getElementById(id),
    createStyleElement: () => document.createElement("style"),
    appendToHead: (element) => {
      document.head.appendChild(element);
    },
  };
}

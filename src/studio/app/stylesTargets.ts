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

const createUnavailableStyleElement = (): HTMLStyleElement =>
  ({ id: "", textContent: "" }) as HTMLStyleElement;

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function createGlobalStudioStyleTargets(): StudioStyleTargets {
  return createStudioStyleTargets({
    getStyleElement: (id) => {
      try {
        return getDocument()?.getElementById(id) ?? null;
      } catch {
        return null;
      }
    },
    createStyleElement: () => {
      try {
        return (
          getDocument()?.createElement("style") ??
          createUnavailableStyleElement()
        );
      } catch {
        return createUnavailableStyleElement();
      }
    },
    appendToHead: (element) => {
      try {
        getDocument()?.head?.appendChild(element);
      } catch {
        // Style injection can be skipped in restricted runtime shells.
      }
    },
  });
}

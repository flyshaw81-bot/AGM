export type DomLookupTargets = {
  getElementById: (id: string) => HTMLElement | null;
};

const getDocument = (): Document | undefined => {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
};

export function createGlobalDomLookupTargets(): DomLookupTargets {
  return {
    getElementById: (id) => getDocument()?.getElementById(id) ?? null,
  };
}

export const byId = <T extends HTMLElement>(
  id: string,
  targets: DomLookupTargets = createGlobalDomLookupTargets(),
): T | undefined => (targets.getElementById(id) as T | null) ?? undefined;

declare global {
  interface Window {
    byId: typeof byId;
  }
}

export type DomLookupTargets = {
  getElementById: (id: string) => HTMLElement | null;
};

export function createGlobalDomLookupTargets(): DomLookupTargets {
  return {
    getElementById: (id) => document.getElementById(id),
  };
}

export const byId = <T extends HTMLElement>(
  id: string,
  targets: DomLookupTargets = createGlobalDomLookupTargets(),
): T | undefined => targets.getElementById(id) as T | undefined;

declare global {
  interface Window {
    byId: typeof byId;
  }
}

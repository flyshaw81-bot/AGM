/**
 * Get the composed path of a node (including shadow DOM and window)
 * @param {Node | Window} node - The starting node or window
 * @returns {Array<Node>} - The composed path as an array
 */
export const getComposedPath = (node: any): Array<Node | Window> => {
  let parent: Node | Window | undefined;
  if (node.parentNode) parent = node.parentNode;
  else if (node.host) parent = node.host;
  else if (node.defaultView) parent = node.defaultView;
  if (parent !== undefined) return [node].concat(getComposedPath(parent));
  return [node];
};

export type NodeIdTargets = {
  getElementById: (id: string) => Element | null;
};

const getDocument = (): Document | undefined => {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
};

export function createGlobalNodeIdTargets(): NodeIdTargets {
  return {
    getElementById: (id) => {
      try {
        return getDocument()?.getElementById(id) ?? null;
      } catch {
        return null;
      }
    },
  };
}

/**
 * Generate a unique ID for a given core string
 * @param {string} core - The core string for the ID
 * @param {number} [i=1] - The starting index
 * @returns {string} - The unique ID
 */
export const getNextId = (
  core: string,
  i: number = 1,
  targets: NodeIdTargets = createGlobalNodeIdTargets(),
): string => {
  while (targets.getElementById(core + i)) i++;
  return core + i;
};

declare global {
  interface Window {
    getComposedPath: typeof getComposedPath;
    getNextId: typeof getNextId;
  }
}

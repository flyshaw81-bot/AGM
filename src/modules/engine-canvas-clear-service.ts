export const MAP_CLEAR_SELECTOR =
  "path, circle, polygon, line, text, use, #texture > image, #zones > g, #armies > g, #ruler > g";

export type EngineCanvasClearTargets = {
  clearMapNodes: (selector: string) => void;
  clearDefinitionNodes: () => void;
  clearGeneratedEmblems: () => void;
  resetNotes: () => void;
  unfog: () => void;
};

export type EngineCanvasClearService = {
  undraw: () => void;
};

declare global {
  var EngineCanvasClearService: EngineCanvasClearService;
  var undraw: () => void;
  interface Window {
    EngineCanvasClearService: EngineCanvasClearService;
    createEngineCanvasClearService: (
      targets: EngineCanvasClearTargets,
    ) => EngineCanvasClearService;
    undraw: () => void;
  }
}

export function createEngineCanvasClearService(
  targets: EngineCanvasClearTargets,
): EngineCanvasClearService {
  return {
    undraw: () => {
      targets.clearMapNodes(MAP_CLEAR_SELECTOR);
      targets.clearDefinitionNodes();
      targets.clearGeneratedEmblems();
      targets.resetNotes();
      targets.unfog();
    },
  };
}

function getRuntimeWindow(): Window | undefined {
  try {
    return window;
  } catch {
    return undefined;
  }
}

const runtimeWindow = getRuntimeWindow();
if (runtimeWindow) {
  runtimeWindow.createEngineCanvasClearService = createEngineCanvasClearService;
}

import { debounce } from "../utils/commonUtils";
import { byId } from "../utils/shorthands";

export type EngineRegenerationService = {
  regenerateMap: (options?: unknown) => Promise<void>;
};

export type EngineRegenerationTargets = {
  warn: (message: string) => void;
  getCellsDesired: () => number;
  showLoading: () => void;
  hideLoading: () => void;
  closeDialogs: (except?: string) => void;
  resetCustomization: () => void;
  resetZoom: (duration: number) => void;
  undraw: () => void;
  generate: (options?: unknown) => Promise<unknown>;
  drawLayers: () => void;
  isThreeDOn: () => boolean;
  redrawThreeD: () => void;
  fitMapToScreen: () => void;
  clearMainTip: () => void;
};

type RegenerationGlobal = {
  WARN?: boolean;
  customization?: number;
  EngineRegenerationService?: EngineRegenerationService;
  showLoading?: () => void;
  hideLoading?: () => void;
  closeDialogs?: (except?: string) => void;
  resetZoom?: (duration: number) => void;
  undraw?: () => void;
  generate?: (options?: unknown) => Promise<unknown>;
  drawLayers?: () => void;
  ThreeD?: { options?: { isOn?: boolean }; redraw?: () => void };
  fitMapToScreen?: () => void;
  clearMainTip?: () => void;
  regenerateMap?: (options?: unknown) => void;
};

declare global {
  interface Window {
    EngineRegenerationService: EngineRegenerationService;
    regenerateMap: (options?: unknown) => void;
  }
}

export function createEngineRegenerationService(
  targets: EngineRegenerationTargets,
): EngineRegenerationService {
  return {
    async regenerateMap(options?: unknown): Promise<void> {
      targets.warn("Generate new random map");

      const shouldShowLoading = targets.getCellsDesired() > 10000;
      if (shouldShowLoading) targets.showLoading();

      targets.closeDialogs();
      targets.resetCustomization();
      targets.resetZoom(1000);
      targets.undraw();
      await targets.generate(options);
      targets.drawLayers();
      if (targets.isThreeDOn()) targets.redrawThreeD();

      targets.fitMapToScreen();
      if (shouldShowLoading) targets.hideLoading();
      targets.clearMainTip();
    },
  };
}

export function createGlobalRegenerationTargets(
  runtime: RegenerationGlobal = globalThis as RegenerationGlobal,
): EngineRegenerationTargets {
  return {
    warn: (message) => {
      if (runtime.WARN) console.warn(message);
    },
    getCellsDesired: () =>
      Number(byId<HTMLInputElement>("pointsInput")?.dataset.cells ?? 0),
    showLoading: () => runtime.showLoading?.(),
    hideLoading: () => runtime.hideLoading?.(),
    closeDialogs: (except) => runtime.closeDialogs?.(except),
    resetCustomization: () => {
      runtime.customization = 0;
    },
    resetZoom: (duration) => runtime.resetZoom?.(duration),
    undraw: () => runtime.undraw?.(),
    generate: (options) => runtime.generate?.(options) ?? Promise.resolve(),
    drawLayers: () => runtime.drawLayers?.(),
    isThreeDOn: () => Boolean(runtime.ThreeD?.options?.isOn),
    redrawThreeD: () => runtime.ThreeD?.redraw?.(),
    fitMapToScreen: () => runtime.fitMapToScreen?.(),
    clearMainTip: () => runtime.clearMainTip?.(),
  };
}

export function createGlobalRegenerationService(
  targets = createGlobalRegenerationTargets(),
): EngineRegenerationService {
  return createEngineRegenerationService(targets);
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
  runtimeWindow.EngineRegenerationService = createGlobalRegenerationService();
  runtimeWindow.regenerateMap = debounce((options?: unknown) => {
    void runtimeWindow.EngineRegenerationService.regenerateMap(options);
  }, 250);
}

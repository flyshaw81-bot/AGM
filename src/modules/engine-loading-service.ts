import { select as svgSelect } from "../utils/svgSelection";

type LoadingSelection = {
  style: (name: string, value: string | number) => LoadingSelection;
  transition: () => LoadingTransition;
};

type LoadingTransition = {
  style: (name: string, value: string | number) => LoadingTransition;
  duration: (duration: number) => LoadingTransition;
};

export type EngineLoadingHost = {
  select: (selector: string) => LoadingSelection;
};

export type EngineLoadingService = {
  hideLoading: () => void;
  showLoading: () => void;
};

declare global {
  var EngineLoadingService: EngineLoadingService;
  var hideLoading: () => void;
  var showLoading: () => void;
  interface Window {
    EngineLoadingService: EngineLoadingService;
    hideLoading: () => void;
    showLoading: () => void;
  }
}

export function createEngineLoadingService(
  host: EngineLoadingHost,
): EngineLoadingService {
  return {
    hideLoading: () => {
      host.select("#loading").style("display", "none").style("opacity", 0);
      host.select("#optionsContainer").style("opacity", 1);
      host.select("#tooltip").style("opacity", 1);
    },
    showLoading: () => {
      host.select("#loading").transition().duration(200).style("opacity", 1);
      host
        .select("#optionsContainer")
        .transition()
        .duration(100)
        .style("opacity", 0);
      host.select("#tooltip").transition().duration(200).style("opacity", 0);
    },
  };
}

export function createGlobalLoadingHost(): EngineLoadingHost {
  return {
    select: (selector) => {
      const selection = svgSelect(selector);
      return selection as unknown as LoadingSelection;
    },
  };
}

export function createGlobalLoadingService(
  host = createGlobalLoadingHost(),
): EngineLoadingService {
  return createEngineLoadingService(host);
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
  runtimeWindow.EngineLoadingService = createGlobalLoadingService();
  runtimeWindow.hideLoading = () =>
    runtimeWindow.EngineLoadingService.hideLoading();
  runtimeWindow.showLoading = () =>
    runtimeWindow.EngineLoadingService.showLoading();
}

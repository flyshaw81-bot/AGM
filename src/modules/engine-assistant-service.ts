import { byId } from "../utils/shorthands";

export type EngineAssistantTargets = {
  getProtocol: () => string;
  getHostname: () => string;
  getAssistantContainer: () => HTMLElement | null;
  getAssistantToggle: () => HTMLInputElement | null;
  loadAssistantWidget: () => Promise<void>;
  getWidgetBubble: () =>
    | (HTMLElement & { on?: (event: string, handler: EventListener) => void })
    | null;
  showDataTip: EventListener;
};

export type EngineAssistantService = {
  toggleAssistant: () => void;
  isLocalRuntime: () => boolean;
};

type AssistantGlobal = {
  location?: Location;
  document?: Document;
  EngineAssistantService?: EngineAssistantService;
  toggleAssistant?: () => void;
  showDataTip?: EventListener;
};

declare global {
  var EngineAssistantService: EngineAssistantService;
  var toggleAssistant: () => void;
  interface Window {
    EngineAssistantService: EngineAssistantService;
    toggleAssistant: () => void;
  }
}

export function createEngineAssistantService(
  targets: EngineAssistantTargets,
): EngineAssistantService {
  let isAssistantLoaded = false;
  let isAssistantLoading = false;

  const isLocalRuntime = () =>
    targets.getProtocol() === "file:" ||
    ["localhost", "127.0.0.1", "::1"].includes(targets.getHostname());

  return {
    isLocalRuntime,
    toggleAssistant: () => {
      const assistantContainer = targets.getAssistantContainer();
      const assistantToggle = targets.getAssistantToggle();
      if (!assistantContainer || !assistantToggle) return;

      const showAssistant = assistantToggle.value === "show";
      if (showAssistant) {
        if (isLocalRuntime()) {
          assistantContainer.style.display = "none";
          return;
        }

        if (isAssistantLoaded) {
          assistantContainer.style.display = "block";
          return;
        }

        if (isAssistantLoading) return;
        isAssistantLoading = true;
        void targets.loadAssistantWidget().then(() => {
          isAssistantLoaded = true;
          isAssistantLoading = false;
          setTimeout(() => {
            const bubble = targets.getWidgetBubble();
            if (!bubble) return;
            bubble.dataset.tip = "Click to open the Assistant";
            bubble.on?.("mouseover", targets.showDataTip);
          }, 5000);
        });
      } else if (isAssistantLoaded) {
        assistantContainer.style.display = "none";
      }
    },
  };
}

export function createGlobalAssistantTargets(
  runtime: AssistantGlobal = globalThis as unknown as AssistantGlobal,
): EngineAssistantTargets {
  return {
    getProtocol: () => runtime.location?.protocol ?? "",
    getHostname: () => runtime.location?.hostname ?? "",
    getAssistantContainer: () => byId("chat-widget-container") ?? null,
    getAssistantToggle: () => byId<HTMLInputElement>("agmAssistant") ?? null,
    loadAssistantWidget: () => Promise.resolve(),
    getWidgetBubble: () =>
      byId("chat-widget-minimized") as ReturnType<
        EngineAssistantTargets["getWidgetBubble"]
      >,
    showDataTip: (event) => runtime.showDataTip?.(event),
  };
}

export function createGlobalAssistantService(
  targets = createGlobalAssistantTargets(),
): EngineAssistantService {
  return createEngineAssistantService(targets);
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
  runtimeWindow.EngineAssistantService = createGlobalAssistantService();
  runtimeWindow.toggleAssistant = () =>
    runtimeWindow.EngineAssistantService.toggleAssistant();
}

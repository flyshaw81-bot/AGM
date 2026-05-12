import { describe, expect, it, vi } from "vitest";

import {
  createEngineAssistantService,
  type EngineAssistantTargets,
} from "./engine-assistant-service";

function createTargets(
  overrides: Partial<EngineAssistantTargets> = {},
): EngineAssistantTargets {
  const assistantContainer = { style: { display: "" } } as HTMLElement;
  const assistantToggle = { value: "show" } as HTMLInputElement;
  assistantToggle.value = "show";
  const bubble = {
    dataset: {},
    on: vi.fn(),
  } as unknown as HTMLElement & {
    on?: (event: string, handler: EventListener) => void;
  };

  return {
    getProtocol: vi.fn(() => "https:"),
    getHostname: vi.fn(() => "agm.local"),
    getAssistantContainer: vi.fn(() => assistantContainer),
    getAssistantToggle: vi.fn(() => assistantToggle),
    loadAssistantWidget: vi.fn(async () => undefined),
    getWidgetBubble: vi.fn(() => bubble),
    showDataTip: vi.fn(),
    ...overrides,
  };
}

describe("engine assistant service", () => {
  it("keeps the assistant hidden in local runtime", () => {
    const container = { style: { display: "" } } as HTMLElement;
    const targets = createTargets({
      getProtocol: vi.fn(() => "file:"),
      getAssistantContainer: vi.fn(() => container),
    });
    const service = createEngineAssistantService(targets);

    service.toggleAssistant();

    expect(container.style.display).toBe("none");
    expect(targets.loadAssistantWidget).not.toHaveBeenCalled();
  });

  it("loads the assistant widget once for remote runtime", async () => {
    vi.useFakeTimers();
    const targets = createTargets();
    const service = createEngineAssistantService(targets);

    service.toggleAssistant();
    await Promise.resolve();
    service.toggleAssistant();
    await vi.runAllTimersAsync();

    expect(targets.loadAssistantWidget).toHaveBeenCalledTimes(1);
    expect(targets.getWidgetBubble()).toHaveProperty(
      "dataset.tip",
      "Click to open the Assistant",
    );
    expect(targets.getWidgetBubble()?.on).toHaveBeenCalledWith(
      "mouseover",
      targets.showDataTip,
    );
    vi.useRealTimers();
  });

  it("hides the loaded assistant when toggled off", async () => {
    const container = { style: { display: "" } } as HTMLElement;
    const toggle = { value: "show" } as HTMLInputElement;
    const targets = createTargets({
      getAssistantContainer: vi.fn(() => container),
      getAssistantToggle: vi.fn(() => toggle),
    });
    const service = createEngineAssistantService(targets);

    toggle.value = "show";
    service.toggleAssistant();
    await Promise.resolve();
    toggle.value = "hide";
    service.toggleAssistant();

    expect(container.style.display).toBe("none");
  });
});

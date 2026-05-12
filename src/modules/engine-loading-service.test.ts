import { describe, expect, it, vi } from "vitest";

import {
  createEngineLoadingService,
  type EngineLoadingHost,
  type EngineLoadingService,
} from "./engine-loading-service";

type SelectionCall =
  | { selector: string; method: "style"; name: string; value: string | number }
  | { selector: string; method: "transition" }
  | { selector: string; method: "duration"; value: number };

function createHost(): { host: EngineLoadingHost; calls: SelectionCall[] } {
  const calls: SelectionCall[] = [];

  return {
    calls,
    host: {
      select: (selector) => {
        const selection = {
          style: vi.fn((name: string, value: string | number) => {
            calls.push({ selector, method: "style", name, value });
            return selection;
          }),
          transition: vi.fn(() => {
            calls.push({ selector, method: "transition" });
            return selection;
          }),
          duration: vi.fn((value: number) => {
            calls.push({ selector, method: "duration", value });
            return selection;
          }),
        };
        return selection;
      },
    },
  };
}

describe("engine loading service", () => {
  it("hides the loading overlay through the loading host", () => {
    const { host, calls } = createHost();
    const service: EngineLoadingService = createEngineLoadingService(host);

    service.hideLoading();

    expect(calls).toEqual([
      { selector: "#loading", method: "style", name: "display", value: "none" },
      { selector: "#loading", method: "style", name: "opacity", value: 0 },
      {
        selector: "#optionsContainer",
        method: "style",
        name: "opacity",
        value: 1,
      },
      { selector: "#tooltip", method: "style", name: "opacity", value: 1 },
    ]);
  });

  it("shows the loading overlay with the existing transition timings", () => {
    const { host, calls } = createHost();
    const service = createEngineLoadingService(host);

    service.showLoading();

    expect(calls).toEqual([
      { selector: "#loading", method: "transition" },
      { selector: "#loading", method: "duration", value: 200 },
      { selector: "#loading", method: "style", name: "opacity", value: 1 },
      { selector: "#optionsContainer", method: "transition" },
      { selector: "#optionsContainer", method: "duration", value: 100 },
      {
        selector: "#optionsContainer",
        method: "style",
        name: "opacity",
        value: 0,
      },
      { selector: "#tooltip", method: "transition" },
      { selector: "#tooltip", method: "duration", value: 200 },
      { selector: "#tooltip", method: "style", name: "opacity", value: 0 },
    ]);
  });
});

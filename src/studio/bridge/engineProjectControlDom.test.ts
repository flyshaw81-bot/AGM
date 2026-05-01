import { describe, expect, it, vi } from "vitest";
import {
  dispatchEnginePairInputEvents,
  type EngineNumberPair,
  lockEngineStoredSetting,
  setEngineNumberPair,
} from "./engineProjectControlDom";

describe("engine project control DOM helpers", () => {
  it("keeps number pair lookup safe when document is absent", () => {
    const originalDocument = globalThis.document;
    globalThis.document = undefined as unknown as Document;

    try {
      expect(
        setEngineNumberPair(50, {
          inputId: "input",
          outputId: "output",
          fallbackMin: "0",
          fallbackMax: "100",
          round: Math.round,
        }),
      ).toBeNull();
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it("keeps form event dispatch safe when Event is absent", () => {
    const originalEvent = globalThis.Event;
    globalThis.Event = undefined as unknown as typeof Event;
    const pair: EngineNumberPair = {
      input: { dispatchEvent: vi.fn() } as unknown as HTMLInputElement,
      output: { dispatchEvent: vi.fn() } as unknown as HTMLInputElement,
      nextValue: "50",
    };

    try {
      expect(() => dispatchEnginePairInputEvents(pair)).not.toThrow();
      expect(pair.input.dispatchEvent).not.toHaveBeenCalled();
      expect(pair.output.dispatchEvent).not.toHaveBeenCalled();
    } finally {
      globalThis.Event = originalEvent;
    }
  });

  it("keeps stored setting locks safe when window is absent", () => {
    const originalWindow = globalThis.window;
    globalThis.window = undefined as unknown as Window & typeof globalThis;
    const input = { dataset: {} } as HTMLInputElement;
    const output = { dataset: {} } as HTMLInputElement;

    try {
      expect(() => lockEngineStoredSetting(input, output, "30")).not.toThrow();
    } finally {
      globalThis.window = originalWindow;
    }
  });
});

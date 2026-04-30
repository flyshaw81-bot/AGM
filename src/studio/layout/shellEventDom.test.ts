import { afterEach, describe, expect, it, vi } from "vitest";
import { bindNumberInput } from "./shellEventDom";
import { createFakeControl, installFakeDocument } from "./testDomHelpers";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("shell event DOM helpers", () => {
  it("commits finite number input changes once per value", () => {
    const input = createFakeControl("quantity", "10");
    installFakeDocument([input]);
    const onChange = vi.fn();

    bindNumberInput("quantity", onChange);

    input.emit("change");
    input.value = "12";
    input.emit("input");
    input.emit("change");
    input.value = "not-a-number";
    input.emit("input");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it("commits delegated number input changes when the input appears after binding", () => {
    class FakeInput {
      id = "lateQuantity";
      value = "1";
      defaultValue = "1";
      addEventListener = vi.fn();
    }

    const listeners = new Map<string, EventListener[]>();
    vi.stubGlobal("HTMLInputElement", FakeInput);
    vi.stubGlobal("document", {
      getElementById: () => null,
      addEventListener: (type: string, listener: EventListener) => {
        listeners.set(type, [...(listeners.get(type) || []), listener]);
      },
    });

    const onChange = vi.fn();
    bindNumberInput("lateQuantity", onChange);

    const input = new FakeInput();
    input.value = "3";
    listeners.get("input")?.forEach((listener) => {
      listener({ target: input } as unknown as Event);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(3);
  });
});

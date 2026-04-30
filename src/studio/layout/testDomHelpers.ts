import { vi } from "vitest";

export type FakeControl = {
  id: string;
  value: string;
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
  ) => void;
  emit: (type: string) => void;
};

export function createFakeControl(id: string, value = ""): FakeControl {
  const listeners = new Map<string, EventListenerOrEventListenerObject[]>();
  return {
    id,
    value,
    addEventListener(type, listener) {
      listeners.set(type, [...(listeners.get(type) || []), listener]);
    },
    emit(type) {
      (listeners.get(type) || []).forEach((listener) => {
        if (typeof listener === "function") listener(new Event(type));
        else listener.handleEvent(new Event(type));
      });
    },
  };
}

export function installFakeDocument(controls: FakeControl[]) {
  const controlsById = new Map(
    controls.map((control) => [control.id, control]),
  );
  vi.stubGlobal("document", {
    getElementById: (id: string) => controlsById.get(id) || null,
  });
}

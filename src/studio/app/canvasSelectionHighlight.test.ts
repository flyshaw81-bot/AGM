import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import {
  type CanvasSelectionHighlightTargets,
  syncCanvasSelectionHighlight,
} from "./canvasSelectionHighlight";

type FakeElement = {
  dataset: Record<string, string>;
  classList: {
    add: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  attributes: Record<string, string>;
  setAttribute: ReturnType<typeof vi.fn>;
};

function createElement(): FakeElement {
  const element: FakeElement = {
    dataset: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
    attributes: {},
    setAttribute: vi.fn((key: string, value: string) => {
      element.attributes[key] = value;
    }),
  };
  return element;
}

function createState(selectedStateId: number | null): StudioState {
  return {
    viewport: {
      selectedCanvasEntity:
        selectedStateId === null
          ? null
          : {
              targetType: "state",
              targetId: selectedStateId,
              label: "State",
              x: 10,
              y: 20,
            },
    },
  } as unknown as StudioState;
}

function createTargets() {
  const staleState = createElement();
  const staleBorder = createElement();
  staleState.dataset.studioSelectedState = "true";
  staleBorder.dataset.studioSelectedStateBorder = "true";
  const frame = createElement();
  const host = createElement();
  const statePath = createElement();
  const stateBorder = createElement();
  const targets: CanvasSelectionHighlightTargets = {
    getSelectedStateElements: vi.fn(() => [
      staleState as unknown as SVGElement,
    ]),
    getSelectedStateBorderElements: vi.fn(() => [
      staleBorder as unknown as SVGElement,
    ]),
    getCanvasFrame: vi.fn(() => frame as unknown as HTMLElement),
    getMapHost: vi.fn(() => host as unknown as HTMLElement),
    getStatePath: vi.fn(() => statePath as unknown as SVGElement),
    getStateBorder: vi.fn(() => stateBorder as unknown as SVGElement),
    appendToParent: vi.fn(),
  };
  return {
    targets,
    staleState,
    staleBorder,
    frame,
    host,
    statePath,
    stateBorder,
  };
}

describe("syncCanvasSelectionHighlight", () => {
  it("clears stale highlights and writes empty selection attributes", () => {
    const { targets, staleState, staleBorder, frame, host } = createTargets();

    syncCanvasSelectionHighlight(createState(null), targets);

    expect(staleState.classList.remove).toHaveBeenCalledWith(
      "is-studio-selected-state",
    );
    expect(staleState.dataset.studioSelectedState).toBeUndefined();
    expect(staleBorder.classList.remove).toHaveBeenCalledWith(
      "is-studio-selected-state-border",
    );
    expect(staleBorder.dataset.studioSelectedStateBorder).toBeUndefined();
    expect(frame.attributes["data-selected-state-id"]).toBe("");
    expect(host.attributes["data-selected-state-id"]).toBe("");
    expect(targets.getStatePath).not.toHaveBeenCalled();
  });

  it("highlights selected state path and border through injected targets", () => {
    const { targets, frame, host, statePath, stateBorder } = createTargets();

    syncCanvasSelectionHighlight(createState(7), targets);

    expect(frame.attributes["data-selected-state-id"]).toBe("7");
    expect(host.attributes["data-selected-state-id"]).toBe("7");
    expect(targets.getStatePath).toHaveBeenCalledWith(7);
    expect(targets.getStateBorder).toHaveBeenCalledWith(7);
    expect(statePath.classList.add).toHaveBeenCalledWith(
      "is-studio-selected-state",
    );
    expect(statePath.dataset.studioSelectedState).toBe("true");
    expect(stateBorder.classList.add).toHaveBeenCalledWith(
      "is-studio-selected-state-border",
    );
    expect(stateBorder.dataset.studioSelectedStateBorder).toBe("true");
    expect(targets.appendToParent).toHaveBeenCalledTimes(2);
  });
});

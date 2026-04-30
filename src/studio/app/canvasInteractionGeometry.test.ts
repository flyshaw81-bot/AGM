import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import {
  type CanvasInteractionGeometryTargets,
  getCanvasSelectionAt,
} from "./canvasInteractionGeometry";

function createState(): StudioState {
  return {
    viewport: {
      fitMode: "cover",
      panX: 0,
      panY: 0,
      zoom: 1,
      canvasTool: "select",
    },
  } as unknown as StudioState;
}

function createPointerEvent(clientX: number, clientY: number): PointerEvent {
  return {
    clientX,
    clientY,
  } as PointerEvent;
}

function createTargets(
  overrides: Partial<CanvasInteractionGeometryTargets> = {},
): CanvasInteractionGeometryTargets {
  return {
    getCanvasFrame: vi.fn(
      () =>
        ({
          offsetWidth: 200,
          offsetHeight: 100,
          getBoundingClientRect: vi.fn(() => ({
            x: 10,
            y: 20,
            left: 10,
            top: 20,
            right: 110,
            bottom: 70,
            width: 100,
            height: 50,
            toJSON: vi.fn(),
          })),
        }) as CanvasInteractionGeometryTargets["getCanvasFrame"] extends () => infer Result
          ? NonNullable<Result>
          : never,
    ),
    getGraphSize: vi.fn(() => ({ width: 200, height: 100 })),
    getPack: vi.fn(() => ({
      cells: {
        i: [1, 2, 3],
        p: {
          1: [0, 0],
          2: [80, 40],
          3: [180, 90],
        },
        state: {
          1: 0,
          2: 4,
          3: 7,
        },
      },
      states: {
        4: { name: "Eastmere" },
        7: { name: "Westreach" },
      },
    })),
    getPaintPreviewForCell: vi.fn(() => null),
    ...overrides,
  };
}

describe("canvas interaction geometry", () => {
  it("resolves selected state through injected frame, graph, and pack targets", () => {
    const targets = createTargets();

    const selection = getCanvasSelectionAt(
      createPointerEvent(100, 60),
      createState(),
      targets,
    );

    expect(targets.getCanvasFrame).toHaveBeenCalled();
    expect(targets.getGraphSize).toHaveBeenCalled();
    expect(targets.getPack).toHaveBeenCalled();
    expect(selection).toEqual({
      targetType: "state",
      targetId: 7,
      label: "Westreach #7",
      x: 90,
      y: 80,
    });
  });

  it("returns null when injected frame or pack data is unavailable", () => {
    expect(
      getCanvasSelectionAt(
        createPointerEvent(100, 60),
        createState(),
        createTargets({ getCanvasFrame: vi.fn(() => null) }),
      ),
    ).toBeNull();
    expect(
      getCanvasSelectionAt(
        createPointerEvent(100, 60),
        createState(),
        createTargets({ getPack: vi.fn(() => undefined) }),
      ),
    ).toBeNull();
  });
});

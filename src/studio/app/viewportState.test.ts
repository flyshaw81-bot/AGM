import { describe, expect, it, vi } from "vitest";
import type { CanvasPreset, StudioState } from "../types";
import { updateViewportDimensions } from "./viewportState";

function createState(orientation: "landscape" | "portrait"): StudioState {
  return {
    viewport: {
      presetId: "desktop-landscape",
      orientation,
      width: 0,
      height: 0,
    },
  } as unknown as StudioState;
}

function createPreset(): CanvasPreset {
  return {
    id: "desktop-landscape",
    label: "Desktop",
    category: "desktop",
    width: 1440,
    height: 960,
    orientation: "landscape",
  };
}

describe("updateViewportDimensions", () => {
  it("uses preset dimensions when orientations match", () => {
    const state = createState("landscape");

    updateViewportDimensions(state, {
      getPresetById: vi.fn(() => createPreset()),
    });

    expect(state.viewport.width).toBe(1440);
    expect(state.viewport.height).toBe(960);
  });

  it("swaps preset dimensions when orientations differ", () => {
    const state = createState("portrait");

    updateViewportDimensions(state, {
      getPresetById: vi.fn(() => createPreset()),
    });

    expect(state.viewport.width).toBe(960);
    expect(state.viewport.height).toBe(1440);
  });
});

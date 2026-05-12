import { describe, expect, it } from "vitest";
import type { StudioState } from "../types";
import { renderCanvasToolHud } from "./canvasToolHud";

function makeViewport(
  patch: Partial<StudioState["viewport"]> = {},
): StudioState["viewport"] {
  return {
    presetId: "desktop-landscape",
    width: 1440,
    height: 900,
    orientation: "landscape",
    fitMode: "contain",
    zoom: 1,
    panX: 0,
    panY: 0,
    safeAreaEnabled: true,
    guidesEnabled: true,
    canvasTool: "select",
    selectedCanvasEntity: null,
    paintPreview: null,
    canvasEditHistory: [],
    ...patch,
  };
}

describe("canvas tool hud", () => {
  it("does not render a passive selected-entity card", () => {
    const html = renderCanvasToolHud(
      makeViewport({
        selectedCanvasEntity: {
          targetType: "state",
          targetId: 4,
          label: "Zhath #4",
          x: 50,
          y: 50,
        },
      }),
      "zh-CN",
    );

    expect(html).toBe("");
  });

  it("still renders for actionable paint edits", () => {
    const html = renderCanvasToolHud(
      makeViewport({
        canvasTool: "brush",
        paintPreview: {
          tool: "brush",
          cellId: 12,
          label: "Cell #12",
          x: 20,
          y: 30,
          height: 45,
          biomeId: 2,
          stateId: 4,
        },
      }),
      "en",
    );

    expect(html).toContain('data-canvas-tool-hud="true"');
    expect(html).toContain('data-preview-cell="12"');
    expect(html).toContain("Painting Cell #12");
    expect(html).toContain('data-studio-action="canvas-edit-undo"');
  });
});

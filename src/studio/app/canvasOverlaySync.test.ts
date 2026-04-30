import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import {
  type CanvasOverlayTargets,
  syncCanvasPaintPreview,
  syncCanvasToolHud,
  syncOverlays,
} from "./canvasOverlaySync";

function createState(): StudioState {
  return {
    viewport: {
      canvasTool: "brush",
      panX: 12,
      panY: -8,
      safeAreaEnabled: true,
      guidesEnabled: false,
      paintPreview: {
        tool: "brush",
        cellId: 42,
        label: "Cell 42",
        x: 25,
        y: 75,
        height: 10,
        biomeId: 2,
        stateId: 3,
      },
    },
  } as unknown as StudioState;
}

type FakeElement = {
  dataset: Record<string, string>;
  style: Record<string, string>;
  textContent: string;
  disabled?: boolean;
  querySelector: <T extends Element = Element>(selector: string) => T | null;
};

function createElement(
  children: Record<string, FakeElement> = {},
): FakeElement {
  return {
    dataset: {},
    style: {},
    textContent: "",
    querySelector: <T extends Element = Element>(selector: string) => {
      const child = children[selector];
      return child ? (child as unknown as T) : null;
    },
  };
}

function createOverlayTargets(): {
  targets: CanvasOverlayTargets;
  overlay: HTMLElement;
  hud: HTMLElement;
  frame: HTMLElement;
} {
  const marker = createElement();
  const label = createElement();
  const overlay = createElement({
    ".studio-canvas-paint-preview__marker": marker,
    ".studio-canvas-paint-preview__label": label,
  });

  const applyButton = createElement();
  const details = createElement();
  const hud = createElement({
    "[data-studio-action='canvas-edit-apply']": applyButton,
    span: details,
  });

  const safeArea = createElement();
  const guides = createElement();
  const toolGrid = createElement();
  const measure = createElement();
  const frame = createElement({
    ".studio-canvas-frame__overlay--safe-area": safeArea,
    ".studio-canvas-frame__overlay--guides": guides,
    ".studio-canvas-frame__overlay--tool-grid": toolGrid,
    ".studio-canvas-frame__overlay--measure": measure,
  });

  return {
    targets: {
      getPaintPreviewOverlay: vi.fn(() => overlay as unknown as HTMLElement),
      getToolHud: vi.fn(() => hud as unknown as HTMLElement),
      getCanvasFrame: vi.fn(() => frame as unknown as HTMLElement),
    },
    overlay: overlay as unknown as HTMLElement,
    hud: hud as unknown as HTMLElement,
    frame: frame as unknown as HTMLElement,
  };
}

describe("canvas overlay sync", () => {
  it("syncs paint preview through injected overlay targets", () => {
    const state = createState();
    const { targets, overlay } = createOverlayTargets();

    syncCanvasPaintPreview(state, targets);

    expect(overlay.style.display).toBe("block");
    expect(overlay.dataset.previewTool).toBe("brush");
    expect(overlay.dataset.previewCell).toBe("42");
    expect(
      overlay.querySelector<HTMLElement>(".studio-canvas-paint-preview__label")
        ?.textContent,
    ).toBe("Cell 42");
  });

  it("syncs tool hud through injected targets", () => {
    const state = createState();
    const { targets, hud } = createOverlayTargets();

    syncCanvasToolHud(state, targets);

    const applyButton = hud.querySelector<HTMLButtonElement>(
      "[data-studio-action='canvas-edit-apply']",
    );
    expect(hud.dataset.panX).toBe("12");
    expect(hud.dataset.panY).toBe("-8");
    expect(applyButton?.disabled).toBe(false);
    expect(applyButton?.dataset.previewCell).toBe("42");
    expect(hud.querySelector("span")?.textContent).toBe("Painting Cell 42");
  });

  it("syncs frame overlays and paint preview through one target set", () => {
    const state = createState();
    const { targets, frame, overlay } = createOverlayTargets();

    syncOverlays(state, targets);

    expect(
      frame.querySelector<HTMLElement>(
        ".studio-canvas-frame__overlay--safe-area",
      )?.style.display,
    ).toBe("block");
    expect(
      frame.querySelector<HTMLElement>(".studio-canvas-frame__overlay--guides")
        ?.style.display,
    ).toBe("none");
    expect(overlay.dataset.previewCell).toBe("42");
  });
});

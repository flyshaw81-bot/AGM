import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineRenderAdapter,
  createGlobalRenderAdapter,
  type EngineRenderTargets,
} from "./engine-render-adapter";

const originalWindow = globalThis.window;
const originalPack = globalThis.pack;
const originalCoaRenderer = globalThis.COArenderer;
const originalDrawRoute = globalThis.drawRoute;
const originalLayerIsOn = globalThis.layerIsOn;
const originalDrawBurgIcon = globalThis.drawBurgIcon;
const originalDrawBurgLabel = globalThis.drawBurgLabel;
const originalRemoveBurgIcon = globalThis.removeBurgIcon;
const originalRemoveBurgLabel = globalThis.removeBurgLabel;
const originalDocument = globalThis.document;
const originalEmblems = globalThis.emblems;
const originalRedrawIceberg = globalThis.redrawIceberg;
const originalRedrawGlacier = globalThis.redrawGlacier;
const originalSvg = globalThis.svg;
const originalScale = globalThis.scale;
const originalDrawScaleBar = globalThis.drawScaleBar;

describe("createGlobalRenderAdapter", () => {
  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.pack = originalPack;
    globalThis.COArenderer = originalCoaRenderer;
    globalThis.drawRoute = originalDrawRoute;
    globalThis.layerIsOn = originalLayerIsOn;
    globalThis.drawBurgIcon = originalDrawBurgIcon;
    globalThis.drawBurgLabel = originalDrawBurgLabel;
    globalThis.removeBurgIcon = originalRemoveBurgIcon;
    globalThis.removeBurgLabel = originalRemoveBurgLabel;
    globalThis.document = originalDocument;
    globalThis.emblems = originalEmblems;
    globalThis.redrawIceberg = originalRedrawIceberg;
    globalThis.redrawGlacier = originalRedrawGlacier;
    globalThis.svg = originalSvg;
    globalThis.scale = originalScale;
    globalThis.drawScaleBar = originalDrawScaleBar;
  });

  it("forwards map and burg rendering calls to current DOM/SVG helpers", () => {
    const findCell = vi.fn(() => 42);
    const addCoa = vi.fn();
    const route = { id: "route1" };
    const burg = { i: 7 };
    globalThis.window = { findCell } as unknown as Window & typeof globalThis;
    globalThis.pack = { cells: { i: [1] } } as typeof pack;
    globalThis.COArenderer = { add: addCoa } as unknown as typeof COArenderer;
    globalThis.drawRoute = vi.fn();
    globalThis.layerIsOn = vi.fn(() => true);
    globalThis.drawBurgIcon = vi.fn();
    globalThis.drawBurgLabel = vi.fn();
    globalThis.removeBurgIcon = vi.fn();
    globalThis.removeBurgLabel = vi.fn();

    const rendering = createGlobalRenderAdapter();

    expect(rendering.findCell(10, 20, 3)).toBe(42);
    rendering.addBurgCoa(5, { shield: "heater" }, 12, 14);
    rendering.drawRoute(route);
    expect(rendering.isLayerOn("toggleRoutes")).toBe(true);
    rendering.drawBurg(burg);
    rendering.removeBurg(7);

    expect(findCell).toHaveBeenCalledWith(10, 20, 3, globalThis.pack);
    expect(addCoa).toHaveBeenCalledWith(
      "burg",
      5,
      { shield: "heater" },
      12,
      14,
    );
    expect(drawRoute).toHaveBeenCalledWith(route);
    expect(layerIsOn).toHaveBeenCalledWith("toggleRoutes");
    expect(drawBurgIcon).toHaveBeenCalledWith(burg);
    expect(drawBurgLabel).toHaveBeenCalledWith(burg);
    expect(removeBurgIcon).toHaveBeenCalledWith(7);
    expect(removeBurgLabel).toHaveBeenCalledWith(7);
  });

  it("removes rendered COA and generic elements through current DOM helpers", () => {
    const removeCoaElement = vi.fn();
    const removeGenericElement = vi.fn();
    const removeEmblemUse = vi.fn();
    const select = vi.fn(() => ({ remove: removeEmblemUse }));
    globalThis.document = {
      getElementById: (id: string) => {
        if (id === "burgCOA9") return { remove: removeCoaElement };
        if (id === "marker12") return { remove: removeGenericElement };
        return null;
      },
    } as unknown as Document;
    globalThis.emblems = { select } as unknown as typeof emblems;

    const rendering = createGlobalRenderAdapter();
    rendering.removeBurgCoa(9);
    rendering.removeElementById("marker12");

    expect(removeCoaElement).toHaveBeenCalledWith();
    expect(select).toHaveBeenCalledWith("#burgEmblems > use[data-i='9']");
    expect(removeEmblemUse).toHaveBeenCalledWith();
    expect(removeGenericElement).toHaveBeenCalledWith();
  });

  it("forwards ice redraws and scale-bar drawing to current render helpers", () => {
    const scaleBarSelection = { id: "scaleBar" };
    globalThis.redrawIceberg = vi.fn();
    globalThis.redrawGlacier = vi.fn();
    globalThis.svg = {
      select: vi.fn(() => scaleBarSelection),
    } as unknown as typeof svg;
    globalThis.scale = 2;
    globalThis.drawScaleBar = vi.fn();

    const rendering = createGlobalRenderAdapter();
    rendering.redrawIceberg(1);
    rendering.redrawGlacier(2);
    rendering.drawScaleBar();

    expect(redrawIceberg).toHaveBeenCalledWith(1);
    expect(redrawGlacier).toHaveBeenCalledWith(2);
    expect(svg.select).toHaveBeenCalledWith("#scaleBar");
    expect(drawScaleBar).toHaveBeenCalledWith(scaleBarSelection, 2);
  });

  it("composes render adapter from injected render targets", () => {
    const scaleBarSelection = { id: "scaleBar" };
    const route = { id: "route2" };
    const burg = { i: 5 };
    const targets: EngineRenderTargets = {
      findCell: vi.fn(() => 24),
      getPack: vi.fn(() => ({ cells: { i: [1] } }) as typeof pack),
      addCoa: vi.fn(),
      drawRoute: vi.fn(),
      isLayerOn: vi.fn(() => false),
      drawBurgIcon: vi.fn(),
      drawBurgLabel: vi.fn(),
      removeBurgIcon: vi.fn(),
      removeBurgLabel: vi.fn(),
      getElementById: vi.fn(
        () => ({ remove: vi.fn() }) as unknown as HTMLElement,
      ),
      removeBurgEmblemUse: vi.fn(),
      redrawIceberg: vi.fn(),
      redrawGlacier: vi.fn(),
      selectScaleBar: vi.fn(() => scaleBarSelection),
      getScale: vi.fn(() => 3),
      drawScaleBar: vi.fn(),
    };
    const rendering = createEngineRenderAdapter(targets);

    expect(rendering.findCell(1, 2)).toBe(24);
    rendering.addBurgCoa(8, { shield: "kite" }, 10, 11);
    rendering.drawRoute(route);
    expect(rendering.isLayerOn("toggleRoutes")).toBe(false);
    rendering.drawBurg(burg);
    rendering.removeBurg(5);
    rendering.removeBurgCoa(8);
    rendering.redrawIceberg(3);
    rendering.redrawGlacier(4);
    rendering.removeElementById("marker5");
    rendering.drawScaleBar();

    expect(targets.findCell).toHaveBeenCalledWith(
      1,
      2,
      undefined,
      expect.objectContaining({ cells: { i: [1] } }),
    );
    expect(targets.addCoa).toHaveBeenCalledWith(
      "burg",
      8,
      { shield: "kite" },
      10,
      11,
    );
    expect(targets.drawRoute).toHaveBeenCalledWith(route);
    expect(targets.drawBurgIcon).toHaveBeenCalledWith(burg);
    expect(targets.drawBurgLabel).toHaveBeenCalledWith(burg);
    expect(targets.removeBurgIcon).toHaveBeenCalledWith(5);
    expect(targets.removeBurgLabel).toHaveBeenCalledWith(5);
    expect(targets.getElementById).toHaveBeenCalledWith("burgCOA8");
    expect(targets.removeBurgEmblemUse).toHaveBeenCalledWith(8);
    expect(targets.redrawIceberg).toHaveBeenCalledWith(3);
    expect(targets.redrawGlacier).toHaveBeenCalledWith(4);
    expect(targets.getElementById).toHaveBeenCalledWith("marker5");
    expect(targets.drawScaleBar).toHaveBeenCalledWith(scaleBarSelection, 3);
  });
});

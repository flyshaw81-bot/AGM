import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineRenderAdapter,
  createGlobalRenderAdapter,
  createGlobalRenderDomTargets,
  createGlobalRenderTargets,
  type EngineRenderTargets,
} from "./engine-render-adapter";

const originalWindow = globalThis.window;
const originalFindCell = (globalThis as { findCell?: unknown }).findCell;
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
const originalDrawHeightmap = globalThis.drawHeightmap;
const originalDrawBiomes = (globalThis as any).drawBiomes;
const originalDrawCells = (globalThis as any).drawCells;
const originalInvokeActiveZooming = globalThis.invokeActiveZooming;

describe("createGlobalRenderAdapter", () => {
  afterEach(() => {
    globalThis.window = originalWindow;
    (globalThis as { findCell?: unknown }).findCell = originalFindCell;
    globalThis.pack = originalPack;
    globalThis.COArenderer = originalCoaRenderer;
    globalThis.drawRoute = originalDrawRoute;
    globalThis.layerIsOn = originalLayerIsOn;
    globalThis.drawBurgIcon = originalDrawBurgIcon;
    globalThis.drawBurgLabel = originalDrawBurgLabel;
    globalThis.removeBurgIcon = originalRemoveBurgIcon;
    globalThis.removeBurgLabel = originalRemoveBurgLabel;
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    globalThis.emblems = originalEmblems;
    globalThis.redrawIceberg = originalRedrawIceberg;
    globalThis.redrawGlacier = originalRedrawGlacier;
    globalThis.svg = originalSvg;
    globalThis.scale = originalScale;
    globalThis.drawScaleBar = originalDrawScaleBar;
    globalThis.drawHeightmap = originalDrawHeightmap;
    (globalThis as any).drawBiomes = originalDrawBiomes;
    (globalThis as any).drawCells = originalDrawCells;
    globalThis.invokeActiveZooming = originalInvokeActiveZooming;
  });

  it("forwards map and burg rendering calls to current DOM/SVG helpers", () => {
    const findCell = vi.fn(() => 42);
    const addCoa = vi.fn();
    const route = { id: "route1" };
    const burg = { i: 7 };
    globalThis.window = { findCell } as unknown as Window & typeof globalThis;
    (globalThis as { findCell?: unknown }).findCell = findCell;
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

  it("exposes default global render targets for explicit adapter composition", () => {
    const findCell = vi.fn(() => 8);
    const route = { id: "route-target" };
    globalThis.window = { findCell } as unknown as Window & typeof globalThis;
    (globalThis as { findCell?: unknown }).findCell = findCell;
    globalThis.pack = { cells: { i: [1] } } as typeof pack;
    globalThis.drawRoute = vi.fn();

    const targets = createGlobalRenderTargets();
    const rendering = createGlobalRenderAdapter(targets);

    expect(rendering.findCell(1, 2)).toBe(8);
    rendering.drawRoute(route);

    expect(findCell).toHaveBeenCalledWith(1, 2, undefined, globalThis.pack);
    expect(drawRoute).toHaveBeenCalledWith(route);
  });

  it("removes rendered COA and generic elements through current DOM helpers", () => {
    const removeCoaElement = vi.fn();
    const removeGenericElement = vi.fn();
    const getTotalLength = vi.fn(() => 45);
    const removeEmblemUse = vi.fn();
    const select = vi.fn(() => ({ remove: removeEmblemUse }));
    globalThis.document = {
      getElementById: (id: string) => {
        if (id === "burgCOA9") return { remove: removeCoaElement };
        if (id === "marker12") return { remove: removeGenericElement };
        if (id === "route3") return { getTotalLength };
        return null;
      },
    } as unknown as Document;
    globalThis.emblems = { select } as unknown as typeof emblems;

    const rendering = createGlobalRenderAdapter();
    rendering.removeBurgCoa(9);
    rendering.removeElementById("marker12");
    const routeLength = rendering.getElementTotalLengthById?.("route3");

    expect(removeCoaElement).toHaveBeenCalledWith();
    expect(select).toHaveBeenCalledWith("#burgEmblems > use[data-i='9']");
    expect(removeEmblemUse).toHaveBeenCalledWith();
    expect(removeGenericElement).toHaveBeenCalledWith();
    expect(routeLength).toBe(45);
    expect(getTotalLength).toHaveBeenCalledWith();
  });

  it("keeps global render DOM lookup safe when document is absent", () => {
    globalThis.document = undefined as unknown as Document;

    const rendering = createGlobalRenderAdapter();

    expect(() => rendering.removeElementById("marker12")).not.toThrow();
    expect(rendering.getElementTotalLengthById?.("route3")).toBeUndefined();
  });

  it("keeps global render DOM lookup safe when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    const rendering = createGlobalRenderAdapter();

    expect(() => rendering.removeElementById("marker12")).not.toThrow();
    expect(rendering.getElementTotalLengthById?.("route3")).toBeUndefined();
  });

  it("exposes global render DOM targets for explicit composition", () => {
    const getElementById = vi.fn(() => ({ id: "marker12" }));
    globalThis.document = {
      getElementById,
    } as unknown as Document;

    const domTargets = createGlobalRenderDomTargets();
    const targets = createGlobalRenderTargets(domTargets);

    expect(domTargets.getElementById("marker12")).toMatchObject({
      id: "marker12",
    });
    expect(targets.getElementById("marker12")).toMatchObject({
      id: "marker12",
    });
    expect(getElementById).toHaveBeenCalledWith("marker12");
  });

  it("keeps global cell lookup safe when findCell is absent", () => {
    (globalThis as { findCell?: unknown }).findCell = undefined;
    globalThis.pack = { cells: { i: [1] } } as typeof pack;

    expect(createGlobalRenderAdapter().findCell(1, 2)).toBeUndefined();
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

  it("forwards canvas redraw helpers when available", () => {
    globalThis.drawHeightmap = vi.fn();
    (globalThis as any).drawBiomes = vi.fn();
    (globalThis as any).drawCells = vi.fn();
    globalThis.invokeActiveZooming = vi.fn();

    const rendering = createGlobalRenderAdapter();
    rendering.drawHeightmap?.();
    rendering.drawBiomes?.();
    rendering.drawCells?.();
    rendering.invokeActiveZooming?.();

    expect(drawHeightmap).toHaveBeenCalledWith();
    expect((globalThis as any).drawBiomes).toHaveBeenCalledWith();
    expect((globalThis as any).drawCells).toHaveBeenCalledWith();
    expect(invokeActiveZooming).toHaveBeenCalledWith();
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

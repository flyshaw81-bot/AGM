import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalEngineMapHostTargets } from "./engineMapHostTargets";

type TestMapHostGlobals = typeof globalThis & {
  stylePreset?: { value?: string };
  seed?: string;
  optionsSeed?: { value?: string };
  mapName?: HTMLInputElement;
  mapId?: string;
  mapWidthInput?: { value?: string };
  mapHeightInput?: { value?: string };
  graphWidth?: number;
  graphHeight?: number;
  svgWidth?: number;
  svgHeight?: number;
};

const testGlobals = globalThis as TestMapHostGlobals;
const testGlobalRecord = globalThis as Record<string, unknown>;
const originalDocument = globalThis.document;
const originalLocalStorage = globalThis.localStorage;
const originalWindow = globalThis.window;

function restoreRuntime() {
  delete testGlobalRecord.stylePreset;
  delete testGlobalRecord.seed;
  delete testGlobalRecord.optionsSeed;
  delete testGlobalRecord.mapName;
  delete testGlobalRecord.mapId;
  delete testGlobalRecord.mapWidthInput;
  delete testGlobalRecord.mapHeightInput;
  delete testGlobalRecord.graphWidth;
  delete testGlobalRecord.graphHeight;
  delete testGlobalRecord.svgWidth;
  delete testGlobalRecord.svgHeight;
  delete testGlobalRecord.setStudioViewportSize;
}

describe("createGlobalEngineMapHostTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.localStorage = originalLocalStorage;
    globalThis.window = originalWindow;
    restoreRuntime();
  });

  it("reads document baseline candidate from runtime, storage, and DOM fallbacks", () => {
    testGlobals.mapId = "map-1";
    testGlobals.mapName = { value: "Atlas" } as HTMLInputElement;
    testGlobals.optionsSeed = { value: "seed-from-options" };
    testGlobals.mapWidthInput = { value: "1200" };
    testGlobals.svgHeight = 700;
    globalThis.localStorage = {
      getItem: vi.fn(() => "pencil"),
    } as unknown as Storage;
    globalThis.document = {
      getElementById: vi.fn((id) =>
        id === "map"
          ? { getAttribute: vi.fn(() => "640") }
          : id === "viewbox"
            ? {
                getBoundingClientRect: vi.fn(() => ({
                  width: 500,
                  height: 400,
                })),
              }
            : null,
      ),
    } as unknown as Document;

    const targets = createGlobalEngineMapHostTargets();

    expect(targets.getDocumentBaselineCandidate()).toEqual({
      mapId: "map-1",
      name: "Atlas",
      documentWidth: 1200,
      documentHeight: 700,
      seed: "seed-from-options",
      stylePreset: "pencil",
    });
  });

  it("writes document names through the active map name input", () => {
    const input = {
      value: "",
      dispatchEvent: vi.fn(),
    };
    testGlobals.mapName = input as unknown as HTMLInputElement;

    createGlobalEngineMapHostTargets().setDocumentName("New Atlas");

    expect(input.value).toBe("New Atlas");
    expect(input.dispatchEvent).toHaveBeenCalledTimes(2);
  });

  it("reads viewport elements and applies viewport sizing through the active runtime", () => {
    const frameScaler = { style: {} };
    const frame = { dataset: {}, style: {} };
    const stage = {
      getBoundingClientRect: vi.fn(() => ({ width: 1000, height: 800 })),
    };
    const map = {
      style: {},
      setAttribute: vi.fn(),
    };
    const viewbox = {
      setAttribute: vi.fn(),
    };
    const setStudioViewportSize = vi.fn();
    const svgAttr = vi.fn(() => ({ attr: svgAttr }));
    const scaleExtent = vi.fn();
    const translateExtent = vi.fn(() => ({ scaleExtent }));
    const scaleBar = {};
    const fitScaleBar = vi.fn();
    const fitLegendBox = vi.fn();
    const runtimeWindow = {
      svgWidth: 0,
      svgHeight: 0,
      graphWidth: 1440,
      graphHeight: 900,
      setStudioViewportSize,
      svg: { attr: svgAttr },
      zoom: { translateExtent },
      rn: vi.fn((value: number) => Number(value.toFixed(3))),
      zoomExtentMax: { value: "12" },
      scaleBar,
      fitScaleBar,
      fitLegendBox,
      getComputedStyle: vi.fn(() => ({
        paddingLeft: "10",
        paddingRight: "20",
        paddingTop: "5",
        paddingBottom: "15",
      })),
    };
    globalThis.window = runtimeWindow as unknown as Window & typeof globalThis;
    globalThis.document = {
      getElementById: vi.fn((id) =>
        id === "studioCanvasFrameScaler"
          ? frameScaler
          : id === "studioCanvasFrame"
            ? frame
            : id === "studioStageViewport"
              ? stage
              : id === "map"
                ? map
                : id === "viewbox"
                  ? viewbox
                  : null,
      ),
    } as unknown as Document;

    const targets = createGlobalEngineMapHostTargets();

    expect(targets.getViewportElements()).toEqual({
      frameScaler,
      frame,
      stage,
      map,
    });
    expect(targets.getStageInnerSize(stage as unknown as HTMLElement)).toEqual({
      width: 970,
      height: 780,
    });
    targets.syncViewportSize(1440, 900);
    targets.applyFrameSize(
      frame as unknown as HTMLElement,
      1440,
      900,
      "landscape",
      "contain",
    );
    targets.applyFrameScalerSize(
      frameScaler as unknown as HTMLElement,
      frame as unknown as HTMLElement,
      1440,
      900,
      0.5,
    );
    targets.applyMapSize(map as unknown as SVGSVGElement, 1440, 900);
    targets.applyViewboxTransform(
      viewbox as unknown as Element,
      "translate(0 0) scale(1)",
    );
    targets.syncSvgCompatibility(1440, 900);

    expect(runtimeWindow.svgWidth).toBe(1440);
    expect(runtimeWindow.svgHeight).toBe(900);
    expect(setStudioViewportSize).toHaveBeenCalledWith(1440, 900);
    expect(frame.style).toMatchObject({
      width: "1440px",
      height: "900px",
      transform: "scale(0.5)",
    });
    expect(frame.dataset).toMatchObject({
      orientation: "landscape",
      fitMode: "contain",
    });
    expect(frameScaler.style).toMatchObject({
      width: "720px",
      height: "450px",
    });
    expect(map.setAttribute).toHaveBeenCalledWith("width", "1440");
    expect(map.setAttribute).toHaveBeenCalledWith("height", "900");
    expect(map.style).toMatchObject({
      width: "1440px",
      height: "900px",
    });
    expect(targets.getContentFitTarget()).toEqual({
      graphWidth: 1440,
      graphHeight: 900,
      viewbox,
    });
    expect(viewbox.setAttribute).toHaveBeenCalledWith(
      "transform",
      "translate(0 0) scale(1)",
    );
    expect(svgAttr).toHaveBeenCalledWith("width", 1440);
    expect(svgAttr).toHaveBeenCalledWith("height", 900);
    expect(translateExtent).toHaveBeenCalledWith([
      [0, 0],
      [1440, 900],
    ]);
    expect(scaleExtent).toHaveBeenCalledWith([1, 12]);
    expect(fitScaleBar).toHaveBeenCalledWith(scaleBar, 1440, 900);
    expect(fitLegendBox).toHaveBeenCalledWith();
  });
});

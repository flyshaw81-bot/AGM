export type EngineDocumentBaseline = {
  mapId: string;
  name: string;
  documentWidth: number;
  documentHeight: number;
  seed: string;
  stylePreset: string;
};

export type EngineDocumentBaselineStore = {
  __studioEngineDocumentBaseline?: EngineDocumentBaseline;
};

type EngineMapHostRuntime = {
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
  setStudioViewportSize?: (width: number, height: number) => void;
  svg?: {
    attr: (
      name: string,
      value: number,
    ) => { attr: (name: string, value: number) => unknown };
  };
  zoom?: {
    translateExtent: (extent: [[number, number], [number, number]]) => {
      scaleExtent: (extent: [number, number]) => unknown;
    };
  };
  rn?: (value: number, digits: number) => number;
  zoomExtentMax?: { value?: string };
  scaleBar?: unknown;
  fitScaleBar?: (scaleBar: unknown, width: number, height: number) => void;
  fitLegendBox?: () => void;
};

export type EngineViewportElements = {
  frameScaler: HTMLElement;
  frame: HTMLElement;
  stage: HTMLElement;
  map: SVGSVGElement;
};

export type EngineStageInnerSize = {
  width: number;
  height: number;
};

export type EngineMapContentFitTarget = {
  graphWidth: number;
  graphHeight: number;
  viewbox: Element;
};

export type EngineMapHostTargets = {
  getBaselineStore: () => EngineDocumentBaselineStore;
  getDocumentBaselineCandidate: () => EngineDocumentBaseline;
  setDocumentName: (name: string) => void;
  getViewportElements: () => EngineViewportElements | null;
  getStageInnerSize: (stage: HTMLElement) => EngineStageInnerSize;
  syncViewportSize: (width: number, height: number) => void;
  applyFrameSize: (
    frame: HTMLElement,
    width: number,
    height: number,
    orientation: string,
    fitMode: string,
  ) => void;
  applyFrameScalerSize: (
    frameScaler: HTMLElement,
    frame: HTMLElement,
    width: number,
    height: number,
    scale: number,
  ) => void;
  applyMapSize: (map: SVGSVGElement, width: number, height: number) => void;
  getContentFitTarget: () => EngineMapContentFitTarget | null;
  applyViewboxTransform: (viewbox: Element, transform: string) => void;
  syncSvgCompatibility: (width: number, height: number) => void;
};

export type EngineMapHostDocumentAdapter = {
  getBaselineStore: () => EngineDocumentBaselineStore;
  getDocumentBaselineCandidate: () => EngineDocumentBaseline;
  setDocumentName: (name: string) => void;
};

export type EngineMapHostViewportAdapter = {
  getViewportElements: () => EngineViewportElements | null;
  getStageInnerSize: (stage: HTMLElement) => EngineStageInnerSize;
  applyFrameSize: (
    frame: HTMLElement,
    width: number,
    height: number,
    orientation: string,
    fitMode: string,
  ) => void;
  applyFrameScalerSize: (
    frameScaler: HTMLElement,
    frame: HTMLElement,
    width: number,
    height: number,
    scale: number,
  ) => void;
  applyMapSize: (map: SVGSVGElement, width: number, height: number) => void;
  getContentFitTarget: () => EngineMapContentFitTarget | null;
  applyViewboxTransform: (viewbox: Element, transform: string) => void;
};

export type EngineMapHostRuntimeAdapter = {
  syncViewportSize: (width: number, height: number) => void;
  syncSvgCompatibility: (width: number, height: number) => void;
};

function getGlobalMapHostRuntime(): EngineMapHostRuntime {
  return ((globalThis as typeof globalThis & { window?: EngineMapHostRuntime })
    .window ?? globalThis) as EngineMapHostRuntime;
}

function getElement(id: string) {
  return globalThis.document?.getElementById(id) ?? null;
}

function getMapDimensionAttribute(
  map: Element | null,
  attribute: "width" | "height",
) {
  return +(map?.getAttribute(attribute) || 0);
}

export function createGlobalEngineMapHostDocumentAdapter(): EngineMapHostDocumentAdapter {
  return {
    getBaselineStore: () => globalThis as EngineDocumentBaselineStore,
    getDocumentBaselineCandidate: () => {
      const runtime = getGlobalMapHostRuntime();
      const stylePreset =
        runtime.stylePreset?.value ||
        globalThis.localStorage?.getItem("presetStyle") ||
        "default";
      const seed = runtime.seed || runtime.optionsSeed?.value || "";
      const name = runtime.mapName?.value || "Untitled map";
      const map = getElement("map");
      const viewBox = getElement("viewbox");
      const mapWidthAttr = getMapDimensionAttribute(map, "width");
      const mapHeightAttr = getMapDimensionAttribute(map, "height");
      const documentWidth =
        Number(runtime.mapWidthInput?.value || 0) ||
        runtime.graphWidth ||
        runtime.svgWidth ||
        mapWidthAttr ||
        viewBox?.getBoundingClientRect().width ||
        0;
      const documentHeight =
        Number(runtime.mapHeightInput?.value || 0) ||
        runtime.graphHeight ||
        runtime.svgHeight ||
        mapHeightAttr ||
        viewBox?.getBoundingClientRect().height ||
        0;

      return {
        mapId: String(runtime.mapId || ""),
        name,
        documentWidth,
        documentHeight,
        seed,
        stylePreset,
      };
    },
    setDocumentName: (name) => {
      const mapName = getGlobalMapHostRuntime().mapName;
      if (!mapName) return;

      mapName.value = name;
      mapName.dispatchEvent(new Event("input", { bubbles: true }));
      mapName.dispatchEvent(new Event("change", { bubbles: true }));
    },
  };
}

export function createGlobalEngineMapHostViewportAdapter(): EngineMapHostViewportAdapter {
  return {
    getViewportElements: () => {
      const frameScaler = getElement("studioCanvasFrameScaler");
      const frame = getElement("studioCanvasFrame");
      const stage = getElement("studioStageViewport");
      const map = getElement("map") as SVGSVGElement | null;
      if (!frameScaler || !frame || !stage || !map) return null;
      return { frameScaler, frame, stage, map };
    },
    getStageInnerSize: (stage) => {
      const rect = stage.getBoundingClientRect();
      const style = globalThis.window.getComputedStyle(stage);
      const paddingX =
        Number.parseFloat(style.paddingLeft || "0") +
        Number.parseFloat(style.paddingRight || "0");
      const paddingY =
        Number.parseFloat(style.paddingTop || "0") +
        Number.parseFloat(style.paddingBottom || "0");

      return {
        width: Math.max(rect.width - paddingX, 1),
        height: Math.max(rect.height - paddingY, 1),
      };
    },
    applyFrameSize: (frame, width, height, orientation, fitMode) => {
      frame.style.width = `${width}px`;
      frame.style.height = `${height}px`;
      frame.dataset.orientation = orientation;
      frame.dataset.fitMode = fitMode;
    },
    applyFrameScalerSize: (frameScaler, frame, width, height, scale) => {
      frameScaler.style.width = `${width * scale}px`;
      frameScaler.style.height = `${height * scale}px`;
      frame.style.transform = `scale(${scale})`;
    },
    applyMapSize: (map, width, height) => {
      map.setAttribute("width", String(width));
      map.setAttribute("height", String(height));
      map.style.width = `${width}px`;
      map.style.height = `${height}px`;
    },
    getContentFitTarget: () => {
      const runtime = getGlobalMapHostRuntime();
      const graphWidth = Number(
        runtime.graphWidth || runtime.mapWidthInput?.value || 0,
      );
      const graphHeight = Number(
        runtime.graphHeight || runtime.mapHeightInput?.value || 0,
      );
      const viewbox = getElement("viewbox");
      if (!viewbox || !graphWidth || !graphHeight) return null;
      return { graphWidth, graphHeight, viewbox };
    },
    applyViewboxTransform: (viewbox, transform) => {
      viewbox.setAttribute("transform", transform);
    },
  };
}

export function createGlobalEngineMapHostRuntimeAdapter(): EngineMapHostRuntimeAdapter {
  return {
    syncViewportSize: (width, height) => {
      const runtime = getGlobalMapHostRuntime();
      runtime.svgWidth = width;
      runtime.svgHeight = height;

      if (typeof runtime.setStudioViewportSize === "function") {
        runtime.setStudioViewportSize(width, height);
      }
    },
    syncSvgCompatibility: (width, height) => {
      const runtime = getGlobalMapHostRuntime();
      if (!runtime.svg) return;

      runtime.svgWidth = width;
      runtime.svgHeight = height;
      runtime.svg.attr("width", width).attr("height", height);

      if (runtime.zoom && runtime.graphWidth && runtime.graphHeight) {
        const zoomMin = runtime.rn
          ? runtime.rn(
              Math.max(
                width / runtime.graphWidth,
                height / runtime.graphHeight,
              ),
              3,
            )
          : Math.max(width / runtime.graphWidth, height / runtime.graphHeight);
        const zoomMax = Number(runtime.zoomExtentMax?.value || 20);
        runtime.zoom
          .translateExtent([
            [0, 0],
            [runtime.graphWidth, runtime.graphHeight],
          ])
          .scaleExtent([zoomMin, zoomMax]);
      }

      if (runtime.fitScaleBar && runtime.scaleBar) {
        runtime.fitScaleBar(runtime.scaleBar, width, height);
      }
      if (runtime.fitLegendBox) runtime.fitLegendBox();
    },
  };
}

export function createEngineMapHostTargets(
  documentAdapter: EngineMapHostDocumentAdapter,
  viewportAdapter: EngineMapHostViewportAdapter,
  runtimeAdapter: EngineMapHostRuntimeAdapter,
): EngineMapHostTargets {
  return {
    getBaselineStore: documentAdapter.getBaselineStore,
    getDocumentBaselineCandidate: documentAdapter.getDocumentBaselineCandidate,
    setDocumentName: documentAdapter.setDocumentName,
    getViewportElements: viewportAdapter.getViewportElements,
    getStageInnerSize: viewportAdapter.getStageInnerSize,
    syncViewportSize: runtimeAdapter.syncViewportSize,
    applyFrameSize: viewportAdapter.applyFrameSize,
    applyFrameScalerSize: viewportAdapter.applyFrameScalerSize,
    applyMapSize: viewportAdapter.applyMapSize,
    getContentFitTarget: viewportAdapter.getContentFitTarget,
    applyViewboxTransform: viewportAdapter.applyViewboxTransform,
    syncSvgCompatibility: runtimeAdapter.syncSvgCompatibility,
  };
}

export function createGlobalEngineMapHostTargets(): EngineMapHostTargets {
  return createEngineMapHostTargets(
    createGlobalEngineMapHostDocumentAdapter(),
    createGlobalEngineMapHostViewportAdapter(),
    createGlobalEngineMapHostRuntimeAdapter(),
  );
}

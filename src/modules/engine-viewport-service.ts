type ViewportTransform = unknown;

type ViewportNode = {
  id?: string;
  dataset?: { size?: string };
  classList: { add: (name: string) => void; remove: (name: string) => void };
  setAttribute: (name: string, value: string | number) => void;
  getAttribute: (name: string) => string | null;
  children: ArrayLike<{ getAttribute: (name: string) => string | null }>;
};

type ViewportMarker = {
  i: number;
  x: number;
  y: number;
  size?: number;
  hidden?: boolean;
};

export type EngineViewportTargets = {
  getViewportSize: () => { svgWidth: number; svgHeight: number };
  getScale: () => number;
  getCustomization: () => number;
  getShapeRenderingMode: () => string;
  createZoomTransform: (
    x: number,
    y: number,
    scale: number,
  ) => ViewportTransform;
  getIdentityTransform: () => ViewportTransform;
  applyZoomTransform: (transform: ViewportTransform, duration: number) => void;
  isCoastlineAutoFilterEnabled: () => boolean;
  setCoastlineFilter: (filter: string | null) => void;
  areLabelsVisible: () => boolean;
  forEachLabelGroup: (callback: (node: ViewportNode) => void) => void;
  shouldRescaleLabels: () => boolean;
  shouldHideLabels: () => boolean;
  shouldHideEmblems: () => boolean;
  areEmblemsVisible: () => boolean;
  forEachEmblemGroup: (callback: (node: ViewportNode) => void) => void;
  hasCoaRenderer: () => boolean;
  renderGroupCOAs: (node: ViewportNode) => void;
  getStatesHaloWidth: () => number;
  setStatesHalo: (strokeWidth: number, display: "block" | "none") => void;
  shouldRescaleMarkers: () => boolean;
  getMarkers: () => ViewportMarker[];
  getElementById: (id: string) => Element | null;
  isRulerVisible: () => boolean;
  setRulerTextSize: (fontSize: number) => void;
  round: (value: number, digits?: number) => number;
};

export type EngineViewportService = {
  zoomTo: (x: number, y: number, scale?: number, duration?: number) => void;
  resetZoom: (duration?: number) => void;
  invokeActiveZooming: () => void;
};

export type EngineViewportSizeTargets = {
  setLocalViewportSize: (width: number, height: number) => void;
  setRuntimeViewportSize: (width: number, height: number) => void;
};

export type EngineViewportSizeService = {
  setStudioViewportSize: (width: number, height: number) => void;
  mountGlobalEntry: (runtime?: Pick<Window, "setStudioViewportSize">) => void;
};

declare global {
  var EngineViewportService: EngineViewportService;
  var zoomTo: (x: number, y: number, scale?: number, duration?: number) => void;
  var resetZoom: (duration?: number) => void;
  var invokeActiveZooming: () => void;
  interface Window {
    EngineViewportService: EngineViewportService;
    EngineViewportSizeService: EngineViewportSizeService;
    createEngineViewportService: (
      targets: EngineViewportTargets,
    ) => EngineViewportService;
    createEngineViewportSizeService: (
      targets: EngineViewportSizeTargets,
    ) => EngineViewportSizeService;
    setStudioViewportSize: (width: number, height: number) => void;
    zoomTo: (x: number, y: number, scale?: number, duration?: number) => void;
    resetZoom: (duration?: number) => void;
    invokeActiveZooming: () => void;
  }
}

export function createEngineViewportService(
  targets: EngineViewportTargets,
): EngineViewportService {
  return {
    zoomTo: (x, y, scale = 8, duration = 2000) => {
      const { svgWidth, svgHeight } = targets.getViewportSize();
      const transform = targets.createZoomTransform(
        x * -scale + svgWidth / 2,
        y * -scale + svgHeight / 2,
        scale,
      );
      targets.applyZoomTransform(transform, duration);
    },
    resetZoom: (duration = 1000) => {
      targets.applyZoomTransform(targets.getIdentityTransform(), duration);
    },
    invokeActiveZooming: () => {
      const scale = targets.getScale();
      const isOptimized = targets.getShapeRenderingMode() === "optimizeSpeed";

      if (targets.isCoastlineAutoFilterEnabled()) {
        const filter =
          scale > 1.5 && scale <= 2.6
            ? null
            : scale > 2.6
              ? "url(#blurFilter)"
              : "url(#dropShadow)";
        targets.setCoastlineFilter(filter);
      }

      if (targets.areLabelsVisible()) {
        targets.forEachLabelGroup((node) => {
          if (node.id === "burgLabels") return;
          const desired = Number(node.dataset?.size);
          const relative = Math.max(
            targets.round((desired + desired / scale) / 2, 2),
            1,
          );
          if (targets.shouldRescaleLabels()) {
            node.setAttribute("font-size", relative);
          }

          setNodeHidden(
            node,
            targets.shouldHideLabels() &&
              (relative * scale < 6 || relative * scale > 60),
          );
        });
      }

      if (targets.areEmblemsVisible()) {
        targets.forEachEmblemGroup((node) => {
          const size = Number(node.getAttribute("font-size")) * scale;
          const hidden =
            targets.shouldHideEmblems() && (size < 25 || size > 300);
          setNodeHidden(node, hidden);
          if (
            !hidden &&
            targets.hasCoaRenderer() &&
            node.children.length &&
            !node.children[0]?.getAttribute("href")
          ) {
            targets.renderGroupCOAs(node);
          }
        });
      }

      if (!targets.getCustomization() && !isOptimized) {
        const desired = targets.getStatesHaloWidth();
        const haloSize = targets.round(desired / scale ** 0.8, 2);
        targets.setStatesHalo(haloSize, haloSize > 0.1 ? "block" : "none");
      }

      if (targets.shouldRescaleMarkers()) {
        for (const marker of targets.getMarkers()) {
          const { i, x, y, size = 30, hidden } = marker;
          const element = !hidden && targets.getElementById(`marker${i}`);
          if (!element) continue;

          const zoomedSize = Math.max(
            targets.round(size / 5 + 24 / scale, 2),
            1,
          );
          element.setAttribute("width", String(zoomedSize));
          element.setAttribute("height", String(zoomedSize));
          element.setAttribute(
            "x",
            String(targets.round(x - zoomedSize / 2, 1)),
          );
          element.setAttribute("y", String(targets.round(y - zoomedSize, 1)));
        }
      }

      if (targets.isRulerVisible()) {
        const size = targets.round((10 / scale ** 0.3) * 2, 2);
        targets.setRulerTextSize(size);
      }
    },
  };
}

export function createEngineViewportSizeService(
  targets: EngineViewportSizeTargets,
): EngineViewportSizeService {
  const service: EngineViewportSizeService = {
    setStudioViewportSize: (width, height) => {
      targets.setLocalViewportSize(width, height);
      targets.setRuntimeViewportSize(width, height);
    },
    mountGlobalEntry: (runtime = window) => {
      runtime.setStudioViewportSize = service.setStudioViewportSize;
    },
  };

  return service;
}

function setNodeHidden(node: ViewportNode, hidden: boolean): void {
  if (hidden) node.classList.add("hidden");
  else node.classList.remove("hidden");
}

function getRuntimeWindow(): Window | undefined {
  try {
    return window;
  } catch {
    return undefined;
  }
}

const runtimeWindow = getRuntimeWindow();
if (runtimeWindow) {
  runtimeWindow.createEngineViewportService = createEngineViewportService;
  runtimeWindow.createEngineViewportSizeService =
    createEngineViewportSizeService;
}

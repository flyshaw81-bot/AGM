import { getPresetById } from "../canvas/presets";
import type { FitMode, Orientation } from "../types";
import {
  createGlobalEngineMapHostTargets,
  type EngineMapHostTargets,
} from "./engineMapHostTargets";

const STAGE_PADDING = 0;

export function markEngineDocumentClean(
  targets = createGlobalEngineMapHostTargets(),
) {
  targets.getBaselineStore().__studioEngineDocumentBaseline =
    targets.getDocumentBaselineCandidate();
}

export function getEngineDocumentState(
  targets = createGlobalEngineMapHostTargets(),
) {
  const baselineStore = targets.getBaselineStore();
  const current = targets.getDocumentBaselineCandidate();
  const baseline = baselineStore.__studioEngineDocumentBaseline;

  if (
    !baseline ||
    (!baseline.mapId && current.mapId) ||
    baseline.mapId !== current.mapId
  ) {
    baselineStore.__studioEngineDocumentBaseline = current;
  }

  const effectiveBaseline = baselineStore.__studioEngineDocumentBaseline!;
  const dirty =
    effectiveBaseline.name !== current.name ||
    effectiveBaseline.seed !== current.seed ||
    effectiveBaseline.stylePreset !== current.stylePreset ||
    effectiveBaseline.documentWidth !== current.documentWidth ||
    effectiveBaseline.documentHeight !== current.documentHeight;

  return {
    name: current.name,
    documentWidth: current.documentWidth,
    documentHeight: current.documentHeight,
    seed: current.seed,
    stylePreset: current.stylePreset,
    dirty,
    source: "core" as const,
  };
}

export function setEngineDocumentName(
  name: string,
  targets: EngineMapHostTargets = createGlobalEngineMapHostTargets(),
) {
  const nextName = name.trim() || "Untitled map";
  targets.setDocumentName(nextName);
  return nextName;
}

function fitEngineMapContentToViewport(
  viewportWidth: number,
  viewportHeight: number,
  orientation: Orientation,
  fitMode: FitMode,
  zoom = 1,
  panX = 0,
  panY = 0,
  targets: EngineMapHostTargets = createGlobalEngineMapHostTargets(),
) {
  const fitTarget = targets.getContentFitTarget();
  if (!fitTarget) return;
  const { graphWidth, graphHeight, viewbox } = fitTarget;

  const shouldRotateContent =
    viewportHeight > viewportWidth &&
    orientation === "portrait" &&
    graphWidth > graphHeight;
  const contentWidth = shouldRotateContent ? graphHeight : graphWidth;
  const contentHeight = shouldRotateContent ? graphWidth : graphHeight;
  const fitScale =
    fitMode === "actual-size"
      ? 1
      : fitMode === "cover"
        ? Math.max(viewportWidth / contentWidth, viewportHeight / contentHeight)
        : Math.min(
            viewportWidth / contentWidth,
            viewportHeight / contentHeight,
          );
  const contentScale = fitScale * Math.max(zoom, 0.1);
  const x = (viewportWidth - contentWidth * contentScale) / 2 + panX;
  const y = (viewportHeight - contentHeight * contentScale) / 2 + panY;

  // Use d3.zoom.transform() to keep d3.zoom internal state in sync,
  // preventing drift on subsequent wheel-zoom operations.
  targets.applyViewboxTransform(
    viewbox,
    shouldRotateContent
      ? `translate(${x} ${y}) scale(${contentScale}) translate(${graphHeight} 0) rotate(90)`
      : `translate(${x} ${y}) scale(${contentScale})`,
  );
}

export function readEngineViewportStatePatch(
  _presetId: string,
  orientation: Orientation,
  fitMode: FitMode,
  targets: EngineMapHostTargets = createGlobalEngineMapHostTargets(),
) {
  const viewportElements = targets.getViewportElements();
  const fitTarget = targets.getContentFitTarget();
  if (!viewportElements || !fitTarget) return null;

  const { frame, map } = viewportElements;
  const { graphWidth, graphHeight } = fitTarget;

  // Read current transform — prefer the d3 __zoom property, but fall back
  // to parsing the #viewbox DOM attribute (custom ZoomBehavior doesn't write __zoom).
  let transform: { x: number; y: number; k: number } | undefined = (
    map as SVGSVGElement & { __zoom?: { x: number; y: number; k: number } }
  ).__zoom;
  if (!transform || !Number.isFinite(transform.k) || transform.k <= 0) {
    const viewbox = fitTarget.viewbox;
    const attr = viewbox.getAttribute("transform") || "";
    const m = /translate\(([-\d.]+)\s+([-\d.]+)\)\s+scale\(([-\d.]+)\)/.exec(attr);
    if (m) {
      transform = {
        k: Number(m[3]),
        x: Number(m[1]),
        y: Number(m[2]),
      };
    }
  }
  if (!transform || !Number.isFinite(transform.k) || transform.k <= 0)
    return null;

  const viewportWidth = Number(map.getAttribute("width")) || frame.offsetWidth;
  const viewportHeight =
    Number(map.getAttribute("height")) || frame.offsetHeight;
  if (!viewportWidth || !viewportHeight) return null;

  const shouldRotateContent =
    viewportHeight > viewportWidth &&
    orientation === "portrait" &&
    graphWidth > graphHeight;
  const contentWidth = shouldRotateContent ? graphHeight : graphWidth;
  const contentHeight = shouldRotateContent ? graphWidth : graphHeight;
  const fitScale =
    fitMode === "actual-size"
      ? 1
      : fitMode === "cover"
        ? Math.max(viewportWidth / contentWidth, viewportHeight / contentHeight)
        : Math.min(
            viewportWidth / contentWidth,
            viewportHeight / contentHeight,
          );
  if (!Number.isFinite(fitScale) || fitScale <= 0) return null;

  const zoom = transform.k / fitScale;
  const panX = transform.x - (viewportWidth - contentWidth * transform.k) / 2;
  const panY = transform.y - (viewportHeight - contentHeight * transform.k) / 2;

  if (![zoom, panX, panY].every(Number.isFinite)) return null;
  return { zoom, panX, panY };
}

function shouldFillNativeWorkbenchFrame(stage: HTMLElement, fitMode: FitMode) {
  return (
    fitMode !== "actual-size" &&
    typeof stage.closest === "function" &&
    Boolean(stage.closest(".studio-native-app"))
  );
}

function resolveNativeWorkbenchFrameSize(
  availableWidth: number,
  availableHeight: number,
  targetWidth: number,
  targetHeight: number,
) {
  const scale = Math.min(
    availableWidth / Math.max(targetWidth, 1),
    availableHeight / Math.max(targetHeight, 1),
  );
  const width = Math.round(targetWidth * scale);
  const height = Math.round(targetHeight * scale);

  return {
    height: Math.max(Math.round(height), 1),
    width: Math.max(Math.round(width), 1),
  };
}

export function syncEngineViewport(
  presetId: string,
  orientation: Orientation,
  fitMode: FitMode,
  viewportZoom = 1,
  panX = 0,
  panY = 0,
  targets: EngineMapHostTargets = createGlobalEngineMapHostTargets(),
) {
  const preset = getPresetById(presetId);
  const width =
    orientation === preset.orientation ? preset.width : preset.height;
  const height =
    orientation === preset.orientation ? preset.height : preset.width;

  const viewportElements = targets.getViewportElements();
  if (!viewportElements) return null;
  const { frameScaler, frame, stage, map } = viewportElements;

  const stageSize = targets.getStageInnerSize(stage);
  const safePadding = fitMode === "actual-size" ? 0 : STAGE_PADDING;
  const availableWidth = Math.max(stageSize.width - safePadding * 2, 1);
  const availableHeight = Math.max(stageSize.height - safePadding * 2, 1);
  const fillsNativeWorkbench = shouldFillNativeWorkbenchFrame(stage, fitMode);
  const nativeFrameSize = fillsNativeWorkbench
    ? resolveNativeWorkbenchFrameSize(
        availableWidth,
        availableHeight,
        width,
        height,
      )
    : null;
  const frameWidth = nativeFrameSize?.width ?? Math.round(width);
  const frameHeight = nativeFrameSize?.height ?? Math.round(height);

  targets.applyFrameSize(frame, frameWidth, frameHeight, orientation, fitMode);

  const scaleX = availableWidth / frameWidth;
  const scaleY = availableHeight / frameHeight;
  const scale =
    fillsNativeWorkbench || fitMode === "actual-size"
      ? 1
      : fitMode === "cover"
        ? Math.max(scaleX, scaleY)
        : Math.min(scaleX, scaleY);

  const frameScale = Math.max(scale, 0.1);
  targets.applyFrameScalerSize(
    frameScaler,
    frame,
    frameWidth,
    frameHeight,
    frameScale,
  );

  const nextWidth = Math.round(frameWidth);
  const nextHeight = Math.round(frameHeight);
  targets.syncViewportSize(nextWidth, nextHeight);
  targets.applyMapSize(map, nextWidth, nextHeight);
  fitEngineMapContentToViewport(
    nextWidth,
    nextHeight,
    orientation,
    fitMode,
    viewportZoom,
    panX,
    panY,
    targets,
  );

  targets.syncSvgCompatibility(nextWidth, nextHeight);
  return { width: nextWidth, height: nextHeight };
}

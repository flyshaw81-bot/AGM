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
    orientation === "portrait" && graphWidth > graphHeight;
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

  if (shouldRotateContent) {
    targets.applyViewboxTransform(
      viewbox,
      `translate(${x} ${y}) scale(${contentScale}) translate(${graphHeight} 0) rotate(90)`,
    );
    return;
  }

  targets.applyViewboxTransform(
    viewbox,
    `translate(${x} ${y}) scale(${contentScale})`,
  );
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
  if (!viewportElements) return;
  const { frameScaler, frame, stage, map } = viewportElements;

  const stageSize = targets.getStageInnerSize(stage);
  const safePadding = fitMode === "actual-size" ? 0 : STAGE_PADDING;
  const availableWidth = Math.max(stageSize.width - safePadding * 2, 1);
  const availableHeight = Math.max(stageSize.height - safePadding * 2, 1);
  const frameWidth = Math.round(width);
  const frameHeight = Math.round(height);

  targets.applyFrameSize(frame, frameWidth, frameHeight, orientation, fitMode);

  const scaleX = availableWidth / frameWidth;
  const scaleY = availableHeight / frameHeight;
  const scale =
    fitMode === "actual-size"
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
}

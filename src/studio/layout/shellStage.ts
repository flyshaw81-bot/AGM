import type { StudioState } from "../types";
import { renderCanvasToolHud } from "./canvasPanel";
import { segmentButton } from "./shellChrome";
import { FIT_MODE_LABELS, SHELL_LABELS } from "./shellConstants";
import { renderFocusOverlay } from "./shellFocusOverlay";
import { t } from "./shellShared";

export function renderStudioStage(state: StudioState) {
  const labels = SHELL_LABELS[state.language];
  const fitModeLabels = FIT_MODE_LABELS[state.language];

  return `
    <main class="studio-stage">
      <div class="studio-stage__toolbar">
        <div class="studio-map-controls">
          <div class="studio-segment studio-segment--viewport" role="group" aria-label="${labels.orientation}">
            ${segmentButton(labels.landscape, "landscape", state.viewport.orientation === "landscape", "orientation")}
            ${segmentButton(labels.portrait, "portrait", state.viewport.orientation === "portrait", "orientation")}
          </div>
          <div class="studio-segment studio-segment--viewport" role="group" aria-label="${t(state.language, "适配模式", "Fit mode")}">
            ${Object.entries(fitModeLabels)
              .map(([value, label]) =>
                segmentButton(
                  label,
                  value,
                  state.viewport.fitMode === value,
                  "fitmode",
                ),
              )
              .join("")}
          </div>
          <button class="studio-chip${state.viewport.safeAreaEnabled ? " is-active" : ""}" data-studio-action="toggle-safe-area">${labels.safeArea}</button>
          <button class="studio-chip${state.viewport.guidesEnabled ? " is-active" : ""}" data-studio-action="toggle-guides">${labels.guides}</button>
        </div>
      </div>
      <div id="studioStageViewport" class="studio-stage__viewport">
        <div id="studioCanvasFrameScaler" class="studio-canvas-frame-scaler">
          <div id="studioCanvasFrame" class="studio-canvas-frame">
            <div class="studio-canvas-frame__overlay studio-canvas-frame__overlay--safe-area"></div>
            <div class="studio-canvas-frame__overlay studio-canvas-frame__overlay--guides"></div>
            <div class="studio-canvas-frame__overlay studio-canvas-frame__overlay--tool-grid"></div>
            <div class="studio-canvas-frame__overlay studio-canvas-frame__overlay--measure"><span>${t(state.language, "点击并拖动测量距离", "Click and drag to measure distance")}</span></div>
            <div class="studio-canvas-paint-preview" data-canvas-paint-preview="true" data-preview-tool="${state.viewport.paintPreview?.tool || ""}" data-preview-cell="${state.viewport.paintPreview?.cellId ?? ""}"><span class="studio-canvas-paint-preview__marker"></span><span class="studio-canvas-paint-preview__label"></span></div>
            ${renderFocusOverlay(state.balanceFocus, state.language)}
            <div id="studioMapHost" class="studio-map-host" data-canvas-tool="${state.viewport.canvasTool}" data-pan-x="${Math.round(state.viewport.panX)}" data-pan-y="${Math.round(state.viewport.panY)}"></div>
            ${renderCanvasToolHud(state.viewport, state.language)}
          </div>
        </div>
        <div class="studio-map-zoom">
          <button data-studio-action="viewport-zoom" data-value="in" aria-label="${t(state.language, "放大地图", "Zoom in")}">＋</button>
          <button data-studio-action="viewport-zoom" data-value="out" aria-label="${t(state.language, "缩小地图", "Zoom out")}">−</button>
          <button data-studio-action="viewport-zoom" data-value="reset" aria-label="${t(state.language, "重置地图缩放", "Reset map zoom")}">⛶</button>
        </div>
      </div>
    </main>
  `;
}

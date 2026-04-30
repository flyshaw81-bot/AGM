import type { StudioState } from "../types";
import {
  type CanvasOverlayTargets,
  createGlobalCanvasOverlayTargets,
} from "./canvasOverlayTargets";
import { isPaintCanvasTool } from "./canvasPaintEditing";

export {
  type CanvasOverlayTargets,
  createGlobalCanvasOverlayTargets,
} from "./canvasOverlayTargets";

export function syncCanvasPaintPreview(
  state: StudioState,
  targets: Pick<
    CanvasOverlayTargets,
    "getPaintPreviewOverlay"
  > = createGlobalCanvasOverlayTargets(),
) {
  const overlay = targets.getPaintPreviewOverlay();
  const marker = overlay?.querySelector<HTMLElement>(
    ".studio-canvas-paint-preview__marker",
  );
  const label = overlay?.querySelector<HTMLElement>(
    ".studio-canvas-paint-preview__label",
  );
  const preview = state.viewport.paintPreview;
  if (!overlay || !marker || !label) return;
  overlay.style.display =
    preview && isPaintCanvasTool(state.viewport.canvasTool) ? "block" : "none";
  overlay.dataset.previewTool = preview?.tool || "";
  overlay.dataset.previewCell = preview ? String(preview.cellId) : "";
  if (!preview) return;
  marker.style.left = `${preview.x}%`;
  marker.style.top = `${preview.y}%`;
  label.style.left = `${preview.x}%`;
  label.style.top = `${preview.y}%`;
  label.textContent = preview.label;
}

export function syncCanvasToolHud(
  state: StudioState,
  targets: Pick<
    CanvasOverlayTargets,
    "getToolHud"
  > = createGlobalCanvasOverlayTargets(),
) {
  const hud = targets.getToolHud();
  if (!hud) return;
  const activePreview =
    state.viewport.paintPreview?.tool === state.viewport.canvasTool
      ? state.viewport.paintPreview
      : null;
  hud.dataset.panX = String(Math.round(state.viewport.panX));
  hud.dataset.panY = String(Math.round(state.viewport.panY));
  hud.dataset.previewCell = activePreview ? String(activePreview.cellId) : "";
  const applyButton = hud.querySelector<HTMLButtonElement>(
    "[data-studio-action='canvas-edit-apply']",
  );
  if (applyButton) {
    applyButton.disabled = !activePreview;
    applyButton.dataset.previewCell = activePreview
      ? String(activePreview.cellId)
      : "";
  }
  const details = hud.querySelector("span");
  if (details && state.viewport.canvasTool === "pan")
    details.textContent = `Offset ${Math.round(state.viewport.panX)}, ${Math.round(state.viewport.panY)}`;
  if (details && activePreview)
    details.textContent = `Painting ${activePreview.label}`;
}

export function syncOverlays(
  state: StudioState,
  targets: CanvasOverlayTargets = createGlobalCanvasOverlayTargets(),
) {
  const frame = targets.getCanvasFrame();
  const safeArea = frame?.querySelector<HTMLElement>(
    ".studio-canvas-frame__overlay--safe-area",
  );
  const guides = frame?.querySelector<HTMLElement>(
    ".studio-canvas-frame__overlay--guides",
  );
  const toolGrid = frame?.querySelector<HTMLElement>(
    ".studio-canvas-frame__overlay--tool-grid",
  );
  const measure = frame?.querySelector<HTMLElement>(
    ".studio-canvas-frame__overlay--measure",
  );
  if (safeArea)
    safeArea.style.display = state.viewport.safeAreaEnabled ? "block" : "none";
  if (guides)
    guides.style.display = state.viewport.guidesEnabled ? "block" : "none";
  if (toolGrid)
    toolGrid.style.display =
      state.viewport.canvasTool === "grid" ? "block" : "none";
  if (measure)
    measure.style.display =
      state.viewport.canvasTool === "measure" ? "grid" : "none";
  syncCanvasPaintPreview(state, targets);
}

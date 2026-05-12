import type { CanvasToolMode, StudioLanguage, StudioState } from "../types";
import { CANVAS_TOOL_LABELS, CANVAS_TOOL_ORDER } from "./shellConstants";
import { escapeHtml, studioIcon, t } from "./shellShared";

function isPaintTool(tool: CanvasToolMode) {
  return tool === "brush" || tool === "water" || tool === "terrain";
}

export function renderCanvasTools(
  currentTool: CanvasToolMode,
  language: StudioLanguage,
) {
  return `
    <div class="studio-map-tools" data-studio-map-tools="true" data-active-tool="${currentTool}">
      <div class="studio-map-tools__title">${t(language, "地图工具", "Map tools")}</div>
      <div class="studio-map-tools__grid">
        ${CANVAS_TOOL_ORDER.map((tool) => {
          const item = CANVAS_TOOL_LABELS[language][tool];
          const active = tool === currentTool;
          return `<button class="studio-map-tool${active ? " is-active" : ""}" data-studio-action="canvas-tool" data-value="${tool}" aria-pressed="${active}" title="${escapeHtml(item.hint)}"><span class="studio-map-tool__icon">${studioIcon(item.icon, "studio-map-tool__svg")}</span><strong>${escapeHtml(item.label)}</strong></button>`;
        }).join("")}
      </div>
    </div>
  `;
}

export function renderCanvasToolHud(
  viewport: StudioState["viewport"],
  language: StudioLanguage,
) {
  if (!isPaintTool(viewport.canvasTool)) return "";
  const paintPreview = viewport.paintPreview;
  const latestEdit = viewport.canvasEditHistory[0];
  const canApply = paintPreview && paintPreview.tool === viewport.canvasTool;
  if (!canApply && (!latestEdit || latestEdit.undone)) return "";
  const item = CANVAS_TOOL_LABELS[language][viewport.canvasTool];
  const details =
    canApply && paintPreview
      ? `${t(language, "绘制", "Painting")} ${paintPreview.label}`
      : item.hint;
  const actions = `<div class="studio-canvas-tool-hud__actions"><button data-studio-action="canvas-edit-undo"${latestEdit && !latestEdit.undone ? "" : " disabled"}>${t(language, "撤销", "Undo")}</button></div>`;
  return `<div class="studio-canvas-tool-hud" data-canvas-tool-hud="true" data-active-tool="${viewport.canvasTool}" data-pan-x="${Math.round(viewport.panX)}" data-pan-y="${Math.round(viewport.panY)}" data-preview-cell="${canApply && paintPreview ? String(paintPreview.cellId) : ""}" data-edit-count="${viewport.canvasEditHistory.length}" data-latest-edit-cell="${latestEdit ? String(latestEdit.cellId) : ""}" data-latest-edit-after-height="${latestEdit?.afterHeight ?? ""}"><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(details)}</span>${actions}</div>`;
}

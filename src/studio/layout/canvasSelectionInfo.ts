import { getEngineEntitySummary } from "../bridge/engineActions";
import type { EngineEntitySummaryItem } from "../bridge/engineActionTypes";
import type { StudioLanguage, StudioState } from "../types";
import { escapeHtml, t } from "./shellShared";

function formatSelectionMetric(value: number | undefined) {
  return Number.isFinite(value)
    ? Math.round(value as number).toLocaleString()
    : "-";
}

function getSummaryName(
  items: EngineEntitySummaryItem[],
  id: number | undefined,
) {
  if (!Number.isFinite(id)) return "-";
  const item = items.find((entry) => entry.id === id);
  return item?.name || `#${id}`;
}

export function renderCanvasSelectionInfo(
  viewport: StudioState["viewport"],
  language: StudioLanguage,
) {
  const selection = viewport.selectedCanvasEntity;
  if (viewport.canvasTool !== "select" || selection?.targetType !== "state")
    return "";

  const summary = getEngineEntitySummary();
  const state = summary.states.find((item) => item.id === selection.targetId);
  const title = state?.fullName || state?.name || selection.label;
  const subtitle =
    state?.formName ||
    state?.form ||
    t(language, "王国 / 国家", "Kingdom / state");
  const capital = getSummaryName(summary.burgs, state?.capital);
  const population = formatSelectionMetric(state?.population);
  const area = formatSelectionMetric(state?.area);
  const cells = formatSelectionMetric(state?.cells);
  const neighbors = state?.neighbors?.length ?? 0;
  const diplomacy =
    state?.diplomacy?.filter(Boolean).slice(0, 3).join(" · ") ||
    t(language, "暂无外交摘要", "No diplomacy summary");
  const color =
    state?.color && /^#[0-9a-f]{6}$/i.test(state.color)
      ? state.color
      : "var(--studio-accent)";
  const status =
    state && state.id === selection.targetId
      ? t(language, "No changes", "No changes")
      : t(language, "Data pending", "Data pending");

  return `
    <aside class="studio-canvas-selection-card" data-canvas-selection-card="true" data-selected-state-id="${selection.targetId}">
      <div class="studio-canvas-selection-card__head">
        <span class="studio-canvas-selection-card__swatch" style="--selection-color: ${escapeHtml(color)}"></span>
        <div>
          <small>${t(language, "已选择王国", "Selected kingdom")} #${selection.targetId}</small>
          <strong>${escapeHtml(title)}</strong>
          <em>${escapeHtml(subtitle)}</em>
        </div>
      </div>
      <div class="studio-canvas-selection-card__metrics">
        <span><small>${t(language, "人口", "Population")}</small><strong>${population}</strong></span>
        <span><small>${t(language, "面积", "Area")}</small><strong>${area}</strong></span>
        <span><small>${t(language, "单元", "Cells")}</small><strong>${cells}</strong></span>
        <span><small>${t(language, "首都", "Capital")}</small><strong>${escapeHtml(capital)}</strong></span>
      </div>
      <div class="studio-canvas-selection-card__editor">
        <label class="studio-canvas-selection-card__field">
          <span>${t(language, "短名", "Short name")}</span>
          <input data-canvas-state-field="name" value="${escapeHtml(state?.name || "")}" autocomplete="off" />
        </label>
        <label class="studio-canvas-selection-card__field">
          <span>${t(language, "全名", "Full name")}</span>
          <input data-canvas-state-field="fullName" value="${escapeHtml(state?.fullName || state?.name || "")}" autocomplete="off" />
        </label>
        <label class="studio-canvas-selection-card__field">
          <span>${t(language, "Form name", "Form name")}</span>
          <input data-canvas-state-field="formName" value="${escapeHtml(state?.formName || state?.form || "")}" autocomplete="off" />
        </label>
        <label class="studio-canvas-selection-card__field studio-canvas-selection-card__field--color">
          <span>${t(language, "颜色", "Color")}</span>
          <input data-canvas-state-field="color" type="color" value="${escapeHtml(color)}" />
        </label>
        <label class="studio-canvas-selection-card__field">
          <span>${t(language, "人口", "Population")}</span>
          <input data-canvas-state-field="population" type="number" min="0" step="1" value="${state?.population ?? ""}" />
        </label>
        <label class="studio-canvas-selection-card__field">
          <span>${t(language, "农村", "Rural")}</span>
          <input data-canvas-state-field="rural" type="number" min="0" step="1" value="${state?.rural ?? ""}" />
        </label>
        <label class="studio-canvas-selection-card__field">
          <span>${t(language, "城市", "Urban")}</span>
          <input data-canvas-state-field="urban" type="number" min="0" step="1" value="${state?.urban ?? ""}" />
        </label>
      </div>
      <div class="studio-canvas-selection-card__actions">
        <span class="studio-canvas-selection-card__status" data-canvas-state-edit-status="true" data-clean-label="${t(language, "No changes", "No changes")}" data-dirty-label="${t(language, "有未应用修改", "Unsaved changes")}" data-saved-label="${t(language, "Applied", "Applied")}">${status}</span>
        <button data-studio-action="canvas-state-apply" data-state-id="${selection.targetId}">${t(language, "应用", "Apply")}</button>
        <button data-studio-action="canvas-state-open-workbench" data-state-id="${selection.targetId}">${t(language, "更多", "More")}</button>
      </div>
      <div class="studio-canvas-selection-card__footer">
        <span>${t(language, "邻国", "Neighbors")} ${neighbors}</span>
        <span>${escapeHtml(diplomacy)}</span>
      </div>
    </aside>
  `;
}

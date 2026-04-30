import { renderDirectSelectOptions } from "./directWorkbenchShared";
import { escapeHtml } from "./shellShared";

type DirectWorkbenchHeaderOptions = {
  eyebrow: string;
  title: string;
  badge: string;
};

export function renderDirectWorkbenchHeader({
  eyebrow,
  title,
  badge,
}: DirectWorkbenchHeaderOptions) {
  return `<div class="studio-direct-editor__header">
        <div>
          <div class="studio-panel__eyebrow">${escapeHtml(eyebrow)}</div>
          <h2 class="studio-panel__hero">${escapeHtml(title)}</h2>
        </div>
        <div class="studio-direct-editor__badge">${escapeHtml(badge)}</div>
      </div>`;
}

type DirectWorkbenchStat = {
  label: string;
  value: number | string;
};

export function renderDirectWorkbenchStats(stats: DirectWorkbenchStat[]) {
  return `<div class="studio-direct-editor__stats">
        ${stats
          .map(
            (stat) =>
              `<div><span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(String(stat.value))}</strong></div>`,
          )
          .join("")}
      </div>`;
}

type DirectWorkbenchOption = {
  value: string;
  label: string;
};

type DirectWorkbenchControlSelect = {
  id: string;
  label: string;
  options: DirectWorkbenchOption[];
  value: string;
};

type DirectWorkbenchSearchControlsOptions = {
  searchId: string;
  searchLabel: string;
  searchValue: string;
  searchPlaceholder: string;
  selects: DirectWorkbenchControlSelect[];
  summary?: DirectWorkbenchStat;
};

export function renderDirectWorkbenchSearchControls({
  searchId,
  searchLabel,
  searchValue,
  searchPlaceholder,
  selects,
  summary,
}: DirectWorkbenchSearchControlsOptions) {
  return `<div class="studio-direct-state-controls">
        <label class="studio-stack-field studio-state-search-field">
          <span>${escapeHtml(searchLabel)}</span>
          <input id="${escapeHtml(searchId)}" class="studio-input" type="search" value="${escapeHtml(searchValue)}" placeholder="${escapeHtml(searchPlaceholder)}" autocomplete="off" />
        </label>
        ${selects
          .map(
            (select) => `<label class="studio-stack-field">
          <span>${escapeHtml(select.label)}</span>
          <select id="${escapeHtml(select.id)}">
            ${renderDirectSelectOptions(select.options, select.value)}
          </select>
        </label>`,
          )
          .join("")}
        ${
          summary
            ? `<div class="studio-kv"><span>${escapeHtml(summary.label)}</span><strong>${escapeHtml(String(summary.value))}</strong></div>`
            : ""
        }
      </div>`;
}

type DirectWorkbenchRowOptions = {
  action: string;
  color: string;
  id: number;
  idDataAttribute: string;
  meta: string;
  metric: string;
  selected: boolean;
  swatchClass?: string;
  title: string;
};

export function renderDirectWorkbenchEntityRow({
  action,
  color,
  id,
  idDataAttribute,
  meta,
  metric,
  selected,
  swatchClass,
  title,
}: DirectWorkbenchRowOptions) {
  return `
    <button class="studio-state-row${selected ? " is-active" : ""}" data-studio-action="${escapeHtml(action)}" data-${escapeHtml(idDataAttribute)}="${id}">
      <span class="studio-state-row__swatch${swatchClass ? ` ${escapeHtml(swatchClass)}` : ""}" style="background: ${escapeHtml(color)}"></span>
      <span class="studio-state-row__main"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(meta)}</small></span>
      <span class="studio-state-row__metric">${escapeHtml(metric)}</span>
    </button>
  `;
}

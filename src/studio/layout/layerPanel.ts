import type { StudioLanguage } from "../types";
import {
  LAYER_CONTROL_LABELS,
  LAYER_CONTROL_ZH_LABELS,
} from "./shellConstants";
import { escapeHtml, studioIcon } from "./shellShared";

export function renderLayerGroup(
  language: StudioLanguage,
  title: string,
  actions: readonly (keyof typeof LAYER_CONTROL_LABELS)[],
  layerStates: Record<string, boolean>,
  visibleLayerCards: string[],
) {
  return `
    <section class="studio-panel studio-layer-group" data-layer-control-group="true">
      <header class="studio-layer-group__header">
        <h2 class="studio-panel__title studio-layer-group__title">${escapeHtml(title)}</h2>
      </header>
      <div class="studio-chip-grid studio-layer-group__strip">
        ${actions
          .map((action) => {
            const active = layerStates[action];
            const pinned = visibleLayerCards.includes(action);
            const label =
              language === "zh-CN"
                ? LAYER_CONTROL_ZH_LABELS[action]
                : LAYER_CONTROL_LABELS[action];
            return `<div class="studio-chip-row studio-layer-token${active ? " is-active" : ""}${pinned ? " is-pinned" : ""}" data-layer-token="${action}">
              <button class="studio-chip studio-layer-token__toggle${active ? " is-active" : ""}" data-studio-action="layer" data-value="${action}" aria-pressed="${active ? "true" : "false"}">
                <span class="studio-layer-token__state" aria-hidden="true"></span>
                <span class="studio-layer-token__label">${escapeHtml(label)}</span>
              </button>
              <button class="studio-chip-pin studio-layer-token__pin${pinned ? " is-pinned" : ""}" data-studio-action="layer-pin" data-value="${action}" aria-label="${pinned ? "移除快捷栏" : "添加到快捷栏"}" title="${pinned ? "从底部快捷栏移除" : "固定到底部快捷栏"}">
                ${studioIcon("pin", "studio-chip-pin__icon studio-layer-token__pin-icon")}
              </button>
            </div>`;
          })
          .join("")}
      </div>
    </section>
  `;
}

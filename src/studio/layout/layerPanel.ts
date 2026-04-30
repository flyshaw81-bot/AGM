import type { StudioLanguage } from "../types";
import {
  LAYER_CONTROL_LABELS,
  LAYER_CONTROL_ZH_LABELS,
} from "./shellConstants";

export function renderLayerGroup(
  language: StudioLanguage,
  title: string,
  actions: (keyof typeof LAYER_CONTROL_LABELS)[],
  layerStates: Record<string, boolean>,
) {
  return `
    <section class="studio-panel">
      <h2 class="studio-panel__title">${title}</h2>
      <div class="studio-chip-grid">
        ${actions
          .map(
            (action) =>
              `<button class="studio-chip${layerStates[action] ? " is-active" : ""}" data-studio-action="layer" data-value="${action}">${language === "zh-CN" ? LAYER_CONTROL_ZH_LABELS[action] : LAYER_CONTROL_LABELS[action]}</button>`,
          )
          .join("")}
      </div>
    </section>
  `;
}

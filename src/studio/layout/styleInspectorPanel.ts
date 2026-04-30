import { getEngineStyleSettings } from "../bridge/engineStyle";
import type { StudioState } from "../types";
import {
  SECTION_LABELS,
  SHELL_LABELS,
  STYLE_PRESET_OPTIONS,
} from "./shellConstants";
import { t } from "./shellShared";

export function renderStyleInspectorPanel(state: StudioState) {
  const labels = SHELL_LABELS[state.language];
  const styleSettings = getEngineStyleSettings();

  return `
    <section class="studio-panel">
      <h2 class="studio-panel__title">${SECTION_LABELS[state.language].style}</h2>
      <label class="studio-stack-field">
        <span>${labels.preset}</span>
        <select id="studioStylePresetSelect">
          ${STYLE_PRESET_OPTIONS.map((option) => `<option value="${option}">${option}</option>`).join("")}
        </select>
      </label>
      <div class="studio-kv"><span>${t(state.language, "当前", "Active")}</span><strong>${styleSettings.preset}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "类型", "Type")}</span><strong>${styleSettings.presetKind}</strong></div>
    </section>
    <section class="studio-panel">
      <h2 class="studio-panel__title">${t(state.language, "标签行为", "Label behavior")}</h2>
      <div class="studio-chip-grid">
        <button class="studio-chip${styleSettings.hideLabels ? " is-active" : ""}" data-studio-action="style-toggle" data-value="hide-labels">${t(state.language, "隐藏小标签", "Hide small labels")}</button>
        <button class="studio-chip${styleSettings.rescaleLabels ? " is-active" : ""}" data-studio-action="style-toggle" data-value="rescale-labels">${t(state.language, "重新缩放标签", "Rescale labels")}</button>
      </div>
    </section>
    <section class="studio-panel">
      <h2 class="studio-panel__title">${t(state.language, "保真度", "Fidelity")}</h2>
      <p class="studio-panel__text">${t(state.language, "预设切换仍通过 AGM Core 样式系统执行，因此 Studio 可以改进工作流而不改变地图图层语义。", "Preset switching still runs through the AGM Core style system so Studio can improve workflow without changing map layer semantics.")}</p>
    </section>
  `;
}

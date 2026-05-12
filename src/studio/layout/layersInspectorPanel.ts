import {
  getEngineLayerDetails,
  getEngineLayerStates,
  getEngineProjectSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { renderLayerGroup } from "./layerPanel";
import { LAYER_CONTROL_LABELS, SHELL_LABELS } from "./shellConstants";
import { t } from "./shellShared";

const LAYER_GROUPS = [
  {
    title: { zh: "地理", en: "Geography" },
    actions: ["toggleTexture", "toggleHeight", "toggleBiomes", "toggleRelief"],
  },
  {
    title: { zh: "政治", en: "Political" },
    actions: ["toggleStates", "toggleProvinces", "toggleBorders", "toggleLabels"],
  },
  {
    title: { zh: "基础设施", en: "Infrastructure" },
    actions: ["toggleRivers", "toggleRoutes", "togglePopulation"],
  },
  {
    title: { zh: "辅助线", en: "Guides" },
    actions: ["toggleCells", "toggleGrid", "toggleCoordinates", "toggleCompass", "toggleRulers", "toggleScaleBar", "toggleVignette"],
  },
  {
    title: { zh: "世界细节", en: "World details" },
    actions: ["toggleIce", "toggleCultures", "toggleReligions", "toggleZones", "toggleTemperature", "togglePrecipitation"],
  },
  {
    title: { zh: "聚落", en: "Settlement" },
    actions: ["toggleEmblems", "toggleBurgIcons", "toggleMilitary", "toggleMarkers"],
  },
] as const;

export function renderLayersInspectorPanel(state: StudioState) {
  const labels = SHELL_LABELS[state.language];
  const layerDetails = getEngineLayerDetails();
  const layerStates = getEngineLayerStates();
  const projectSummary = getEngineProjectSummary();
  const visibleCount = layerDetails.filter((layer) => layer.active).length;
  const pinnedCount = layerDetails.filter((layer) => layer.pinned).length;

  return `
    <section class="studio-panel studio-layer-inspector" data-layer-inspector="true">
      <header class="studio-layer-inspector__summary">
        <div class="studio-kv studio-layer-inspector__kv">
          <span>${t(state.language, "可见", "Visible")}</span><strong>${visibleCount}/${layerDetails.length}</strong>
        </div>
        <div class="studio-kv studio-layer-inspector__kv">
          <span>${t(state.language, "已固定", "Pinned")}</span><strong>${pinnedCount}</strong>
        </div>
        <div class="studio-kv studio-layer-inspector__kv">
          <span>${labels.preset}</span><strong>${projectSummary.lastLayersPreset}</strong>
        </div>
      </header>
      <label class="studio-stack-field studio-layer-inspector__preset">
        <span>${t(state.language, "修改预设", "Change preset")}</span>
        <select id="studioLayersPresetSelect">
          ${projectSummary.availableLayersPresets.map((option) => `<option value="${option}">${option}</option>`).join("")}
        </select>
      </label>
      <div class="studio-panel__actions studio-layer-inspector__actions">
        <button class="studio-ghost" data-studio-action="layers-preset-action" data-value="save"${projectSummary.canSaveLayersPreset ? "" : " disabled"}>${t(state.language, "保存预设", "Save preset")}</button>
        <button class="studio-ghost" data-studio-action="layers-preset-action" data-value="remove"${projectSummary.canRemoveLayersPreset ? "" : " disabled"}>${t(state.language, "移除预设", "Remove preset")}</button>
      </div>
      <div class="studio-layer-inspector__groups">
        ${LAYER_GROUPS.map((group) => renderLayerGroup(
          state.language,
          t(state.language, group.title.zh, group.title.en),
          group.actions as readonly (keyof typeof LAYER_CONTROL_LABELS)[],
          layerStates,
          state.shell.visibleLayerCards,
        )).join("")}
      </div>
    </section>
  `;
}

import type { EngineZoneSummaryItem } from "../bridge/engineActionTypes";
import type { StudioLanguage, StudioState } from "../types";
import {
  getDirectWorkbenchEditStatus,
  renderDirectSelectOptions,
  renderDirectWorkbenchFormActions,
} from "./directWorkbenchShared";
import { getDirectEditorFieldsByScope } from "./editorResponsibilityModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

type NativeZoneDetailOptions = {
  language: StudioLanguage;
  directEditor: StudioState["directEditor"];
  selectedColor: string;
  selectedZone: EngineZoneSummaryItem | undefined;
};

function getColorInputValue(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#8fbf7a";
}

function renderNativeZoneReadonlyGrid(
  selectedZone: EngineZoneSummaryItem | undefined,
  language: StudioLanguage,
) {
  if (!selectedZone) return "";
  const rows = [
    {
      label: t(language, "区域 ID", "Zone ID"),
      value: selectedZone.id,
    },
    {
      label: t(language, "单元格", "Cells"),
      value: selectedZone.cellCount,
    },
    {
      label: t(language, "面积", "Area"),
      value: selectedZone.area ? Math.round(selectedZone.area) : "-",
    },
    {
      label: t(language, "人口权重", "Population weight"),
      value: selectedZone.population
        ? Math.round(selectedZone.population)
        : "-",
    },
  ];

  return `<div class="studio-native-identity__readonly">
    ${rows.map((row) => `<div class="studio-native-identity__kv"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(String(row.value))}</strong></div>`).join("")}
  </div>`;
}

function renderZoneColorField(selectedColor: string, language: StudioLanguage) {
  const safeColor = getColorInputValue(selectedColor);
  return `<label class="studio-native-identity-field studio-native-color-field">
    <span>${t(language, "颜色", "Color")}</span>
    <span class="studio-native-color-control">
      <code>${escapeHtml(safeColor.toUpperCase())}</code>
      <input id="studioZoneColorInput" type="color" value="${escapeHtml(safeColor)}" aria-label="${t(language, "更换区域颜色", "Change zone color")}" />
    </span>
  </label>`;
}

function renderZoneSectionLabel(label: string, icon: string) {
  return `<div class="studio-native-identity-detail__section-label">${studioIcon(icon, "studio-native-identity-detail__section-icon")}<span>${escapeHtml(label)}</span></div>`;
}

function renderZoneFieldsAttribute(scope: "owned" | "readonly") {
  const labels = getDirectEditorFieldsByScope("zones", scope).map(
    (field) => field.label,
  );
  return `data-editor-fields="${escapeHtml(labels.join(","))}"`;
}

export function renderDirectZoneDetail({
  language,
  directEditor,
  selectedColor,
  selectedZone,
}: NativeZoneDetailOptions) {
  const zoneStatus = getDirectWorkbenchEditStatus(
    Boolean(selectedZone && directEditor.lastAppliedZoneId === selectedZone.id),
  );

  return `<article class="studio-native-identity__detail-wrap">
          <div class="studio-native-identity-detail" data-native-zone-detail="true">
          ${
            selectedZone
              ? `
            <section class="studio-native-identity-detail__section" data-editor-scope="owned" ${renderZoneFieldsAttribute("owned")}>
              ${renderZoneSectionLabel(t(language, "核心区域字段", "Core zone fields"), "grid")}
              <div class="studio-native-identity-detail__form">
              <label class="studio-native-identity-field">
                <span>${t(language, "名称", "Name")}</span>
                <input id="studioZoneNameInput" class="studio-input" value="${escapeHtml(selectedZone.name)}" autocomplete="off" />
              </label>
              <label class="studio-native-identity-field">
                <span>${t(language, "类型", "Type")}</span>
                <input id="studioZoneTypeInput" class="studio-input" value="${escapeHtml(selectedZone.type || "")}" autocomplete="off" />
              </label>
              ${renderZoneColorField(selectedColor, language)}
              <label class="studio-native-identity-field">
                <span>${t(language, "隐藏区域", "Hide zone")}</span>
                <select id="studioZoneHiddenSelect" class="studio-input">
                  ${renderDirectSelectOptions(
                    [
                      { value: "false", label: t(language, "显示", "Visible") },
                      { value: "true", label: t(language, "隐藏", "Hidden") },
                    ],
                    String(Boolean(selectedZone.hidden)),
                  )}
                </select>
              </label>
              </div>
            </section>
            <section class="studio-native-identity-detail__advanced" data-editor-scope="readonly" ${renderZoneFieldsAttribute("readonly")}>
              <div class="studio-native-identity-detail__advanced-title">
                ${studioIcon("book-open", "studio-native-identity-detail__section-icon")}
                <span>${t(language, "技术信息", "Technical info")}</span>
              </div>
              ${renderNativeZoneReadonlyGrid(selectedZone, language)}
            </section>
          `
              : `<div class="studio-native-identity__empty">${t(language, "没有选中的区域", "No zone selected")}</div>`
          }
          ${
            selectedZone
              ? renderDirectWorkbenchFormActions({
                  applyAction: "direct-zone-apply",
                  attributes: { "zone-id": selectedZone.id },
                  language,
                  resetAction: "direct-zone-reset",
                  status: zoneStatus,
                  statusId: "studioZoneEditStatus",
                })
              : ""
          }
        </div>
        </article>`;
}

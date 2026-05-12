import type { EngineMarkerSummaryItem } from "../bridge/engineActionTypes";
import type { StudioLanguage, StudioState } from "../types";
import {
  getDirectWorkbenchEditStatus,
  renderDirectSelectOptions,
  renderDirectWorkbenchFormActions,
} from "./directWorkbenchShared";
import { getDirectEditorFieldsByScope } from "./editorResponsibilityModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

type NativeMarkerDetailOptions = {
  language: StudioLanguage;
  directEditor: StudioState["directEditor"];
  selectedMarker: EngineMarkerSummaryItem | undefined;
};

function renderNativeMarkerReadonlyGrid(
  selectedMarker: EngineMarkerSummaryItem | undefined,
  language: StudioLanguage,
) {
  if (!selectedMarker) return "";
  const rows = [
    {
      label: t(language, "标记 ID", "Marker ID"),
      value: selectedMarker.id,
    },
    {
      label: t(language, "单元格", "Cell"),
      value: selectedMarker.cell ?? "-",
    },
    {
      label: t(language, "坐标", "Coordinates"),
      value:
        selectedMarker.x === undefined || selectedMarker.y === undefined
          ? "-"
          : `${Math.round(selectedMarker.x)}, ${Math.round(selectedMarker.y)}`,
    },
    {
      label: t(language, "图标字号", "Icon px"),
      value: selectedMarker.px ?? "-",
    },
  ];

  return `<div class="studio-native-identity__readonly">
    ${rows.map((row) => `<div class="studio-native-identity__kv"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(String(row.value))}</strong></div>`).join("")}
  </div>`;
}

function renderMarkerSectionLabel(label: string, icon: string) {
  return `<div class="studio-native-identity-detail__section-label">${studioIcon(icon, "studio-native-identity-detail__section-icon")}<span>${escapeHtml(label)}</span></div>`;
}

function renderMarkerFieldsAttribute(scope: "owned" | "readonly") {
  const labels = getDirectEditorFieldsByScope("markers", scope).map(
    (field) => field.label,
  );
  return `data-editor-fields="${escapeHtml(labels.join(","))}"`;
}

export function renderDirectMarkerDetail({
  language,
  directEditor,
  selectedMarker,
}: NativeMarkerDetailOptions) {
  const markerStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedMarker && directEditor.lastAppliedMarkerId === selectedMarker.id,
    ),
  );

  return `<article class="studio-native-identity__detail-wrap">
          <div class="studio-native-identity-detail" data-native-marker-detail="true">
          ${
            selectedMarker
              ? `
            <section class="studio-native-identity-detail__section" data-editor-scope="owned" ${renderMarkerFieldsAttribute("owned")}>
              ${renderMarkerSectionLabel(t(language, "核心标记字段", "Core marker fields"), "map-pin")}
              <div class="studio-native-identity-detail__form">
              <label class="studio-native-identity-field">
                <span>${t(language, "类型", "Type")}</span>
                <input id="studioMarkerTypeInput" class="studio-input" value="${escapeHtml(selectedMarker.type || "")}" autocomplete="off" />
              </label>
              <label class="studio-native-identity-field">
                <span>${t(language, "图标", "Icon")}</span>
                <input id="studioMarkerIconInput" class="studio-input" value="${escapeHtml(selectedMarker.icon || "")}" autocomplete="off" />
              </label>
              <label class="studio-native-identity-field">
                <span>${t(language, "尺寸", "Size")}</span>
                <input id="studioMarkerSizeInput" class="studio-input" type="number" min="1" step="1" value="${selectedMarker.size ?? ""}" />
              </label>
              <label class="studio-native-identity-field">
                <span>${t(language, "Pin 形状", "Pin shape")}</span>
                <input id="studioMarkerPinInput" class="studio-input" value="${escapeHtml(selectedMarker.pin || "")}" placeholder="bubble / pin / square" autocomplete="off" />
              </label>
              <label class="studio-native-identity-field">
                <span>${t(language, "填充", "Fill")}</span>
                <input id="studioMarkerFillInput" class="studio-input" value="${escapeHtml(selectedMarker.fill || "")}" placeholder="#ffffff" autocomplete="off" />
              </label>
              <label class="studio-native-identity-field">
                <span>${t(language, "描边", "Stroke")}</span>
                <input id="studioMarkerStrokeInput" class="studio-input" value="${escapeHtml(selectedMarker.stroke || "")}" placeholder="#000000" autocomplete="off" />
              </label>
              <label class="studio-native-identity-field">
                <span>${t(language, "固定显示", "Pinned")}</span>
                <select id="studioMarkerPinnedSelect" class="studio-input">
                  ${renderDirectSelectOptions(
                    [
                      { value: "false", label: t(language, "否", "No") },
                      { value: "true", label: t(language, "是", "Yes") },
                    ],
                    String(Boolean(selectedMarker.pinned)),
                  )}
                </select>
              </label>
              <label class="studio-native-identity-field">
                <span>${t(language, "锁定生成", "Locked")}</span>
                <select id="studioMarkerLockedSelect" class="studio-input">
                  ${renderDirectSelectOptions(
                    [
                      { value: "false", label: t(language, "否", "No") },
                      { value: "true", label: t(language, "是", "Yes") },
                    ],
                    String(Boolean(selectedMarker.locked)),
                  )}
                </select>
              </label>
              </div>
            </section>
            <section class="studio-native-identity-detail__advanced" data-editor-scope="readonly" ${renderMarkerFieldsAttribute("readonly")}>
              <div class="studio-native-identity-detail__advanced-title">
                ${studioIcon("book-open", "studio-native-identity-detail__section-icon")}
                <span>${t(language, "技术信息", "Technical info")}</span>
              </div>
              ${renderNativeMarkerReadonlyGrid(selectedMarker, language)}
            </section>
          `
              : `<div class="studio-native-identity__empty">${t(language, "没有选中的标记", "No marker selected")}</div>`
          }
          ${
            selectedMarker
              ? renderDirectWorkbenchFormActions({
                  applyAction: "direct-marker-apply",
                  attributes: { "marker-id": selectedMarker.id },
                  language,
                  resetAction: "direct-marker-reset",
                  status: markerStatus,
                  statusId: "studioMarkerEditStatus",
                })
              : ""
          }
        </div>
        </article>`;
}

import type { EngineRouteSummaryItem } from "../bridge/engineActionTypes";
import type { StudioLanguage, StudioState } from "../types";
import {
  getDirectWorkbenchEditStatus,
  renderDirectWorkbenchFormActions,
} from "./directWorkbenchShared";
import { getDirectEditorFieldsByScope } from "./editorResponsibilityModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

type NativeRouteDetailOptions = {
  language: StudioLanguage;
  directEditor: StudioState["directEditor"];
  selectedRoute: EngineRouteSummaryItem | undefined;
};

function renderNativeRouteReadonlyGrid(
  selectedRoute: EngineRouteSummaryItem | undefined,
  language: StudioLanguage,
) {
  if (!selectedRoute) return "";
  const rows = [
    {
      label: t(language, "路线 ID", "Route ID"),
      value: selectedRoute.id,
    },
    {
      label: t(language, "路径点", "Points"),
      value: selectedRoute.pointCount ?? 0,
    },
    {
      label: t(language, "起始单元", "Start cell"),
      value: selectedRoute.startCell ?? "-",
    },
    {
      label: t(language, "地物 ID", "Feature ID"),
      value: selectedRoute.feature ?? "-",
    },
  ];

  return `<div class="studio-native-identity__readonly">
    ${rows.map((row) => `<div class="studio-native-identity__kv"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(String(row.value))}</strong></div>`).join("")}
  </div>`;
}

function renderRouteSectionLabel(label: string, icon: string) {
  return `<div class="studio-native-identity-detail__section-label">${studioIcon(icon, "studio-native-identity-detail__section-icon")}<span>${escapeHtml(label)}</span></div>`;
}

function renderRouteFieldsAttribute(scope: "owned" | "readonly") {
  const labels = getDirectEditorFieldsByScope("routes", scope).map(
    (field) => field.label,
  );
  return `data-editor-fields="${escapeHtml(labels.join(","))}"`;
}

export function renderDirectRouteDetail({
  language,
  directEditor,
  selectedRoute,
}: NativeRouteDetailOptions) {
  const routeStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedRoute && directEditor.lastAppliedRouteId === selectedRoute.id,
    ),
  );

  return `<article class="studio-native-identity__detail-wrap">
          <div class="studio-native-identity-detail" data-native-route-detail="true">
          ${
            selectedRoute
              ? `
            <section class="studio-native-identity-detail__section" data-editor-scope="owned" ${renderRouteFieldsAttribute("owned")}>
              ${renderRouteSectionLabel(t(language, "核心路线字段", "Core route fields"), "route")}
              <div class="studio-native-identity-detail__form">
              <label class="studio-native-identity-field">
                <span>${t(language, "路线分组", "Route group")}</span>
                <input id="studioRouteGroupInput" class="studio-input" value="${escapeHtml(selectedRoute.group || "")}" autocomplete="off" />
              </label>
              <label class="studio-native-identity-field">
                <span>${t(language, "地物 ID", "Feature ID")}</span>
                <input id="studioRouteFeatureInput" class="studio-input" type="number" step="1" value="${selectedRoute.feature ?? ""}" />
              </label>
              </div>
            </section>
            <section class="studio-native-identity-detail__advanced" data-editor-scope="readonly" ${renderRouteFieldsAttribute("readonly")}>
              <div class="studio-native-identity-detail__advanced-title">
                ${studioIcon("book-open", "studio-native-identity-detail__section-icon")}
                <span>${t(language, "技术信息", "Technical info")}</span>
              </div>
              ${renderNativeRouteReadonlyGrid(selectedRoute, language)}
            </section>
          `
              : `<div class="studio-native-identity__empty">${t(language, "没有选中的路线", "No route selected")}</div>`
          }
          ${
            selectedRoute
              ? renderDirectWorkbenchFormActions({
                  applyAction: "direct-route-apply",
                  attributes: { "route-id": selectedRoute.id },
                  language,
                  resetAction: "direct-route-reset",
                  status: routeStatus,
                  statusId: "studioRouteEditStatus",
                })
              : ""
          }
        </div>
        </article>`;
}

import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import type { DirectWorkbenchEditStatus } from "./directWorkbenchShared";
import {
  limitDirectWorkbenchRows,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { renderDirectWorkbenchToolbar } from "./directWorkbenchToolbar";
import {
  type DirectEditorResponsibilityModule,
  getDirectEditorFieldsByScope,
} from "./editorResponsibilityModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

type SocietyFilterOption = {
  value: string;
  label: string;
};

type NativeSocietyWorkbenchOptions = {
  applyAction: string;
  colorInputId: string;
  dataAttribute: "culture-id" | "religion-id";
  dataWorkbench: "cultures" | "religions";
  defaultColor: string;
  editStatusId: string;
  editStatus: DirectWorkbenchEditStatus;
  emptyLabel: string;
  entityType: "culture" | "religion";
  fallbackTypeLabel: string;
  filterId: string;
  filterOptions: SocietyFilterOption[];
  filterValue: string;
  icon: string;
  nameInputId: string;
  resetAction: string;
  rowAction: string;
  searchId: string;
  searchPlaceholder: string;
  searchValue: string;
  selectedColor: string;
  selectedItem: EngineEntitySummaryItem | undefined;
  title: string;
  typeInputId: string;
  visibleItems: EngineEntitySummaryItem[];
  totalItems: EngineEntitySummaryItem[];
  language: StudioLanguage;
  workbenchId: string;
};

function renderNativeSocietyListHeader({
  title,
  totalCount,
  visibleCount,
}: {
  title: string;
  totalCount: number;
  visibleCount: number;
}) {
  return `<div class="studio-native-identity__list-title">
    <div>
      <h3>${escapeHtml(title)}</h3>
    </div>
    <strong>${visibleCount}/${totalCount}</strong>
  </div>`;
}

function renderNativeSocietyRow({
  dataAttribute,
  defaultColor,
  fallbackTypeLabel,
  item,
  language,
  rowAction,
  selected,
}: {
  dataAttribute: NativeSocietyWorkbenchOptions["dataAttribute"];
  defaultColor: string;
  fallbackTypeLabel: string;
  item: EngineEntitySummaryItem;
  language: StudioLanguage;
  rowAction: string;
  selected: boolean;
}) {
  const typeLabel =
    item.type ||
    item.formName ||
    item.form ||
    t(language, fallbackTypeLabel, fallbackTypeLabel);
  return `<button class="studio-native-entity-row studio-state-row${selected ? " is-active" : ""}" data-studio-action="${escapeHtml(rowAction)}" data-${dataAttribute}="${item.id}">
    <span class="studio-state-row__swatch" style="background: ${escapeHtml(item.color || defaultColor)}"></span>
    <span class="studio-state-row__main"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(typeLabel)} / ${t(language, "单元格", "cells")} ${item.cells ?? "-"}</small></span>
    <span class="studio-state-row__metric">#${item.id}</span>
  </button>`;
}

function renderNativeSocietyReadonlyGrid(
  item: EngineEntitySummaryItem,
  language: StudioLanguage,
  entityIdLabel: string,
) {
  const rows = [
    { label: entityIdLabel, value: item.id },
    { label: t(language, "单元格", "Cells"), value: item.cells ?? "-" },
    { label: t(language, "面积", "Area"), value: item.area ?? "-" },
    { label: t(language, "中心", "Center"), value: item.capital ?? "-" },
  ];

  return `<div class="studio-native-identity__readonly">
    ${rows.map((row) => `<div class="studio-native-identity__kv"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(String(row.value))}</strong></div>`).join("")}
  </div>`;
}

function getSocietyResponsibilityModule(
  entityType: "culture" | "religion",
): DirectEditorResponsibilityModule {
  return entityType === "culture" ? "cultures" : "religions";
}

function renderSocietyFieldsAttribute(
  entityType: "culture" | "religion",
  scope: "owned" | "readonly",
) {
  const labels = getDirectEditorFieldsByScope(
    getSocietyResponsibilityModule(entityType),
    scope,
  ).map((field) => field.label);
  return `data-editor-fields="${escapeHtml(labels.join(","))}"`;
}

function renderSocietySectionLabel(label: string, icon: string) {
  return `<div class="studio-native-identity-detail__section-label">${studioIcon(icon, "studio-native-identity-detail__section-icon")}<span>${escapeHtml(label)}</span></div>`;
}

function renderSocietyColorPicker(
  colorInputId: string,
  selectedColor: string,
  language: StudioLanguage,
) {
  const safeColor = /^#[0-9a-f]{6}$/i.test(selectedColor)
    ? selectedColor
    : "#8d70c9";
  return `<label class="studio-native-identity-field studio-native-color-field">
    <span>${t(language, "\u989c\u8272", "Color")}</span>
    <span class="studio-native-color-control">
      <code>${escapeHtml(safeColor.toUpperCase())}</code>
      <input id="${escapeHtml(colorInputId)}" type="color" value="${escapeHtml(safeColor)}" aria-label="${t(language, "\u66f4\u6362\u989c\u8272", "Change color")}" />
    </span>
  </label>`;
}

function renderNativeSocietyDetail({
  applyAction,
  colorInputId,
  dataAttribute,
  editStatus,
  editStatusId,
  entityType,
  language,
  nameInputId,
  resetAction,
  selectedColor,
  selectedItem,
  typeInputId,
}: Pick<
  NativeSocietyWorkbenchOptions,
  | "applyAction"
  | "colorInputId"
  | "dataAttribute"
  | "editStatus"
  | "editStatusId"
  | "entityType"
  | "language"
  | "nameInputId"
  | "resetAction"
  | "selectedColor"
  | "selectedItem"
  | "typeInputId"
>) {
  const entityIdLabel =
    entityType === "culture"
      ? t(language, "文化 ID", "Culture ID")
      : t(language, "宗教 ID", "Religion ID");
  const entityLabel =
    entityType === "culture"
      ? t(language, "文化", "Culture")
      : t(language, "宗教", "Religion");

  return `<article class="studio-native-identity__detail-wrap">
    <div class="studio-native-identity-detail" data-native-identity-detail="${entityType}">
      ${
        selectedItem
          ? `<section class="studio-native-identity-detail__section" data-editor-scope="owned" ${renderSocietyFieldsAttribute(entityType, "owned")}>
              ${renderSocietySectionLabel(entityType === "culture" ? t(language, "核心文化字段", "Core culture fields") : t(language, "核心宗教字段", "Core religion fields"), entityType === "culture" ? "palette" : "star")}
              <div class="studio-native-identity-detail__form">
                <label class="studio-native-identity-field">
                  <span>${t(language, "名称", "Name")}</span>
                  <input id="${escapeHtml(nameInputId)}" class="studio-input" value="${escapeHtml(selectedItem.name)}" autocomplete="off" />
                </label>
                <label class="studio-native-identity-field">
                  <span>${t(language, "形态", "Form")}</span>
                  <input id="${escapeHtml(typeInputId)}" class="studio-input" value="${escapeHtml(selectedItem.type || selectedItem.formName || selectedItem.form || "")}" autocomplete="off" />
                </label>
                ${renderSocietyColorPicker(colorInputId, selectedColor, language)}
              </div>
            </section>
            <section class="studio-native-identity-detail__advanced" data-editor-scope="readonly" ${renderSocietyFieldsAttribute(entityType, "readonly")}>
              <div class="studio-native-identity-detail__advanced-title">
                ${studioIcon("book-open", "studio-native-identity-detail__section-icon")}
                <span>${t(language, "覆盖信息", "Coverage info")}</span>
              </div>
              ${renderNativeSocietyReadonlyGrid(selectedItem, language, entityIdLabel)}
            </section>
            <div class="studio-native-identity-detail__actions">
              ${renderDirectWorkbenchEditStatus(editStatusId, language, editStatus)}
              <button class="studio-primary-action" data-studio-action="${escapeHtml(applyAction)}" data-${dataAttribute}="${selectedItem.id}">${t(language, "应用修改", "Apply changes")}</button>
              <button class="studio-ghost" data-studio-action="${escapeHtml(resetAction)}" data-${dataAttribute}="${selectedItem.id}">${t(language, "重置", "Reset")}</button>
            </div>`
          : `<div class="studio-native-identity__empty">${t(language, `没有选中的${entityLabel}`, `No ${entityLabel.toLowerCase()} selected`)}</div>`
      }
    </div>
  </article>`;
}

export function renderNativeSocietyWorkbench({
  applyAction,
  colorInputId,
  dataAttribute,
  dataWorkbench,
  defaultColor,
  editStatus,
  editStatusId,
  emptyLabel,
  entityType,
  fallbackTypeLabel,
  filterId,
  filterOptions,
  filterValue,
  language,
  nameInputId,
  resetAction,
  rowAction,
  searchId,
  searchPlaceholder,
  searchValue,
  selectedColor,
  selectedItem,
  title,
  totalItems,
  typeInputId,
  visibleItems,
  workbenchId,
}: NativeSocietyWorkbenchOptions) {
  const limitedItems = limitDirectWorkbenchRows(visibleItems);

  return `<section id="${escapeHtml(workbenchId)}" class="studio-native-identity studio-native-identity--${dataWorkbench} studio-direct-editor" data-native-identity-drawer="${dataWorkbench}" data-direct-workbench="${dataWorkbench}">
    ${renderDirectWorkbenchToolbar({
      filterId,
      filterOptions,
      filterValue,
      language,
      searchId,
      searchPlaceholder,
      searchValue,
    })}
    <aside class="studio-native-identity__list">
      ${renderNativeSocietyListHeader({
        title,
        totalCount: totalItems.length,
        visibleCount: visibleItems.length,
      })}
      <div class="studio-native-identity__rows">
        ${
          limitedItems
            .map((item) =>
              renderNativeSocietyRow({
                dataAttribute,
                defaultColor,
                fallbackTypeLabel,
                item,
                language,
                rowAction,
                selected: item.id === selectedItem?.id,
              }),
            )
            .join("") ||
          `<div class="studio-native-identity__empty">${escapeHtml(emptyLabel)}</div>`
        }
      </div>
    </aside>
    <div class="studio-native-identity__divider"></div>
    ${renderNativeSocietyDetail({
      applyAction,
      colorInputId,
      dataAttribute,
      editStatus,
      editStatusId,
      entityType,
      language,
      nameInputId,
      resetAction,
      selectedColor,
      selectedItem,
      typeInputId,
    })}
  </section>`;
}

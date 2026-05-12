import type { EngineWorldResourceSummary } from "../bridge/engineActions";
import type { EngineMilitarySummaryItem } from "../bridge/engineActionTypes";
import type { StudioLanguage, StudioState } from "../types";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import { renderDirectWorkbenchToolbar } from "./directWorkbenchToolbar";
import { escapeHtml, studioIcon, t } from "./shellShared";

type NativeModuleContract = "military";

type ContractMetric = {
  label: string;
  value: string | number;
};

const EMPTY_VALUE = "-";

function formatValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;
  return String(value);
}

function renderMetric(metric: ContractMetric) {
  return `<div class="studio-native-contract__metric"><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(formatValue(metric.value))}</strong></div>`;
}

function renderStatusList(items: string[]) {
  return `<div class="studio-native-contract__requirements">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function renderHero(itemCount: number, language: StudioLanguage) {
  const readable = itemCount > 0;
  const status = readable
    ? t(language, "只读情报", "Read-only intelligence")
    : t(language, "等待数据源", "Waiting for data source");

  return `<div class="studio-native-contract__hero">
    <div>
      <p>${t(language, "军事情报", "Military intelligence")}</p>
      <h3>${t(language, "军事", "Military")}</h3>
      <span>${t(language, "AGM 已经可以读取国家军队摘要；这里先作为只读情报面板，用来查看兵力分布和样例单位。", "AGM can read state regiment summaries; this panel is a read-only intelligence view for troop distribution and sample units.")}</span>
    </div>
    <strong class="studio-native-contract__status${readable ? " is-readable" : ""}">${status}</strong>
  </div>`;
}

function renderMilitaryMetrics(
  worldResources: EngineWorldResourceSummary,
  language: StudioLanguage,
) {
  const statesWithMilitary = new Set(
    worldResources.military.map((item) => item.stateId),
  ).size;
  const totalTroops = worldResources.military.reduce(
    (total, item) => total + (item.total || 0),
    0,
  );
  const navalUnits = worldResources.military.filter(
    (item) => item.naval,
  ).length;
  const metrics: ContractMetric[] = [
    {
      label: t(language, "军队单位", "Regiments"),
      value: worldResources.military.length,
    },
    {
      label: t(language, "涉及国家", "States with military"),
      value: statesWithMilitary,
    },
    {
      label: t(language, "兵力摘要", "Troop summary"),
      value: totalTroops || EMPTY_VALUE,
    },
    {
      label: t(language, "海军单位", "Naval units"),
      value: navalUnits,
    },
    {
      label: t(language, "当前能力", "Current capability"),
      value: t(language, "只读", "Read-only"),
    },
  ];

  return `<div class="studio-native-contract__metrics">${metrics.map(renderMetric).join("")}</div>`;
}

function getMilitaryMeta(
  item: EngineMilitarySummaryItem,
  language: StudioLanguage,
) {
  return [
    item.stateName,
    item.type,
    item.cell === undefined
      ? null
      : t(language, `单元格 ${item.cell}`, `cell ${item.cell}`),
  ]
    .filter(Boolean)
    .join(" / ");
}

function filterMilitaryRows(
  rows: EngineMilitarySummaryItem[],
  queryValue: string,
  filterMode: StudioState["directEditor"]["militaryFilterMode"],
  language: StudioLanguage,
) {
  const query = normalizeWorkbenchQuery(queryValue);
  return rows.filter((item) => {
    if (filterMode === "land" && item.naval) return false;
    if (filterMode === "naval" && !item.naval) return false;
    if (!query) return true;
    const haystack = [
      item.name,
      item.stateName,
      item.type,
      item.id,
      item.regimentId,
      item.stateId,
      item.cell,
      getMilitaryMeta(item, language),
    ]
      .filter((value) => value !== null && value !== undefined)
      .join(" ");
    return normalizeWorkbenchQuery(haystack).includes(query);
  });
}

function renderMilitarySamples(
  rows: EngineMilitarySummaryItem[],
  language: StudioLanguage,
) {
  const visibleRows = rows.slice(0, 8);
  if (!rows.length) {
    return `<div class="studio-native-contract__empty">${t(language, "当前摘要没有读到军事单位。生成或加载包含军队的地图后，这里会显示样例。", "No military units were found in the current summary. Generate or load a map with regiments to see samples here.")}</div>`;
  }

  return `<div class="studio-native-contract__rows">${visibleRows
    .map(
      (item) => `<div class="studio-native-contract__row">
        <span>${studioIcon(item.naval ? "drop" : "shield", "studio-native-contract__row-icon")}</span>
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(getMilitaryMeta(item, language) || EMPTY_VALUE)}</small>
        </div>
        <em>${escapeHtml(formatValue(item.total))}</em>
      </div>`,
    )
    .join("")}</div>`;
}

function renderSamples(
  worldResources: EngineWorldResourceSummary,
  language: StudioLanguage,
  directEditor: StudioState["directEditor"],
) {
  const rows = filterMilitaryRows(
    worldResources.military,
    directEditor.militarySearchQuery,
    directEditor.militaryFilterMode,
    language,
  );
  return `<section class="studio-native-contract__section" data-editor-scope="readonly">
    <div class="studio-native-contract__section-head">
      <h4>${t(language, "单位样例", "Unit samples")}</h4>
      <p>${t(language, "这里展示 AGM 当前能稳定读取的军队摘要字段。", "This shows the military summary fields AGM can read reliably today.")}</p>
    </div>
    ${renderMilitarySamples(rows, language)}
  </section>`;
}

function renderReadOnlyBoundary(language: StudioLanguage) {
  return `<section class="studio-native-contract__section" data-editor-scope="advanced">
    <div class="studio-native-contract__section-head">
      <h4>${t(language, "尚不可编辑", "Not editable yet")}</h4>
      <p>${t(language, "军事模块当前只负责查看和判断，不承担写回、撤销或验证修复。", "The military module currently supports inspection and judgement only, not writeback, undo, or validation repair.")}</p>
    </div>
    ${renderStatusList([
      t(
        language,
        "摘要读取：已接入 pack.states[].military",
        "Summary read: wired to pack.states[].military",
      ),
      t(language, "写回：未开放", "Writeback: not available"),
      t(language, "撤销/恢复：未开放", "Undo/restore: not available"),
      t(language, "验证修复：未开放", "Validation repair: not available"),
    ])}
  </section>`;
}

export function renderNativeModuleContractWorkbench(
  module: NativeModuleContract,
  worldResources: EngineWorldResourceSummary,
  language: StudioLanguage,
  directEditor: StudioState["directEditor"],
) {
  const workbenchId = "studioDirectMilitaryWorkbench";

  return `<section id="${workbenchId}" class="studio-native-contract studio-direct-editor" data-native-module-contract="${module}" data-military-readonly="true" data-direct-workbench="${module}">
    ${renderDirectWorkbenchToolbar({
      filterId: "studioMilitaryFilterSelect",
      filterOptions: [
        { value: "all", label: t(language, "全部军事", "All military") },
        { value: "land", label: t(language, "陆军单位", "Land units") },
        { value: "naval", label: t(language, "海军单位", "Naval units") },
      ],
      filterValue: directEditor.militaryFilterMode,
      language,
      searchId: "studioMilitarySearchInput",
      searchPlaceholder: t(
        language,
        "搜索军事单位、国家或 ID",
        "Search unit, state, or ID",
      ),
      searchValue: directEditor.militarySearchQuery,
    })}
    ${renderHero(worldResources.military.length, language)}
    ${renderMilitaryMetrics(worldResources, language)}
    ${renderSamples(worldResources, language, directEditor)}
    ${renderReadOnlyBoundary(language)}
  </section>`;
}

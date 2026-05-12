import type {
  EngineEntitySummaryItem,
  EngineMilitarySummaryItem,
  EngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioLanguage, StudioState } from "../types";
import {
  DIPLOMACY_RELATION_OPTIONS,
  getDirectDiplomacyPairKey,
  getDirectDiplomacyRelation,
} from "./directDiplomacyWorkbenchModel";
import {
  getDirectWorkbenchEditStatus,
  renderDirectSelectOptions,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { getDirectEditorFieldsByScope } from "./editorResponsibilityModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

type NativeDiplomacyDetailOptions = {
  language: StudioLanguage;
  directEditor: StudioState["directEditor"];
  object: EngineEntitySummaryItem | undefined;
  subject: EngineEntitySummaryItem | undefined;
  worldResources: EngineWorldResourceSummary;
};

function renderDiplomacyFieldsAttribute(
  scope: "owned" | "related" | "readonly",
) {
  const labels = getDirectEditorFieldsByScope("diplomacy", scope).map(
    (field) => field.label,
  );
  return `data-editor-fields="${escapeHtml(labels.join(","))}"`;
}

function renderDiplomacySectionLabel(label: string, icon: string) {
  return `<div class="studio-native-identity-detail__section-label">${studioIcon(icon, "studio-native-identity-detail__section-icon")}<span>${escapeHtml(label)}</span></div>`;
}

function getMilitaryRowsForState(
  worldResources: EngineWorldResourceSummary,
  stateId: number | undefined,
) {
  if (!stateId) return [];
  return worldResources.military.filter((item) => item.stateId === stateId);
}

function getMilitaryTotal(rows: EngineMilitarySummaryItem[]) {
  return rows.reduce((total, item) => total + (item.total || 0), 0);
}

function renderMilitarySide({
  label,
  rows,
  state,
}: {
  label: string;
  rows: EngineMilitarySummaryItem[];
  state: EngineEntitySummaryItem;
}) {
  const total = getMilitaryTotal(rows);
  const naval = rows.filter((item) => item.naval).length;

  return `<div class="studio-diplomacy-intel__side">
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(state.name)}</strong>
    <div class="studio-diplomacy-intel__stats">
      <div><em>${rows.length}</em><small>单位</small></div>
      <div><em>${total || "-"}</em><small>兵力</small></div>
      <div><em>${naval}</em><small>海军</small></div>
    </div>
  </div>`;
}

function renderMilitarySamples(
  rows: EngineMilitarySummaryItem[],
  language: StudioLanguage,
) {
  const samples = rows.slice(0, 4);
  if (!samples.length) {
    return `<div class="studio-diplomacy-intel__empty">${t(language, "当前双方没有读到军事单位。", "No military units were found for this pair.")}</div>`;
  }

  return `<div class="studio-diplomacy-intel__samples">
    ${samples
      .map(
        (item) => `<div class="studio-diplomacy-intel__unit">
          ${studioIcon(item.naval ? "drop" : "shield", "studio-diplomacy-intel__unit-icon")}
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml([item.stateName, item.type, item.cell ? `cell ${item.cell}` : null].filter(Boolean).join(" / ") || "-")}</small>
          </div>
          <em>${escapeHtml(String(item.total || "-"))}</em>
        </div>`,
      )
      .join("")}
  </div>`;
}

function renderDiplomacyMilitaryIntel({
  language,
  object,
  subject,
  worldResources,
}: {
  language: StudioLanguage;
  object: EngineEntitySummaryItem;
  subject: EngineEntitySummaryItem;
  worldResources: EngineWorldResourceSummary;
}) {
  const subjectRows = getMilitaryRowsForState(worldResources, subject.id);
  const objectRows = getMilitaryRowsForState(worldResources, object.id);
  const pairRows = [...subjectRows, ...objectRows].sort(
    (a, b) => (b.total || 0) - (a.total || 0),
  );
  const subjectTotal = getMilitaryTotal(subjectRows);
  const objectTotal = getMilitaryTotal(objectRows);
  const balance =
    subjectTotal === objectTotal
      ? t(language, "势均", "Even")
      : subjectTotal > objectTotal
        ? t(language, "主体优势", "Subject advantage")
        : t(language, "对象优势", "Object advantage");

  return `<section class="studio-diplomacy-intel" data-editor-scope="readonly">
    <div class="studio-diplomacy-intel__header">
      <div>
        ${studioIcon("shield", "studio-diplomacy-intel__header-icon")}
        <h4>${t(language, "军事情报", "Military intelligence")}</h4>
      </div>
      <strong>${balance}</strong>
    </div>
    <div class="studio-diplomacy-intel__compare">
      ${renderMilitarySide({
        label: t(language, "主体", "Subject"),
        rows: subjectRows,
        state: subject,
      })}
      ${renderMilitarySide({
        label: t(language, "对象", "Object"),
        rows: objectRows,
        state: object,
      })}
    </div>
    ${renderMilitarySamples(pairRows, language)}
  </section>`;
}

function renderNativeDiplomacyReadonlyGrid({
  object,
  pairKey,
  subject,
}: {
  object: EngineEntitySummaryItem;
  pairKey: string | null;
  subject: EngineEntitySummaryItem;
}) {
  const rows = [
    {
      label: "Subject",
      value: `${subject.fullName || subject.name} #${subject.id}`,
    },
    {
      label: "Object",
      value: `${object.fullName || object.name} #${object.id}`,
    },
    { label: "Pair", value: pairKey || "-" },
  ];

  return `<div class="studio-native-identity__readonly">
    ${rows.map((row) => `<div class="studio-native-identity__kv"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(String(row.value))}</strong></div>`).join("")}
  </div>`;
}

export function renderDirectDiplomacyDetail({
  language,
  directEditor,
  object,
  subject,
  worldResources,
}: NativeDiplomacyDetailOptions) {
  const selectedRelation = getDirectDiplomacyRelation(subject, object);
  const pairKey = getDirectDiplomacyPairKey(subject, object);
  const diplomacyStatus = getDirectWorkbenchEditStatus(
    Boolean(pairKey && directEditor.lastAppliedDiplomacyPair === pairKey),
  );

  return `<article class="studio-native-identity__detail-wrap">
          <div class="studio-native-identity-detail" data-native-diplomacy-detail="true">
          ${
            subject && object
              ? `
            <section class="studio-native-identity-detail__section" data-editor-scope="owned" ${renderDiplomacyFieldsAttribute("owned")}>
              ${renderDiplomacySectionLabel(t(language, "关系字段", "Relation field"), "handshake")}
              <div class="studio-native-identity-detail__form">
                <label class="studio-native-identity-field">
                  <span>${t(language, "关系", "Relation")}</span>
                  <select id="studioDiplomacyRelationSelect" class="studio-input">
                    ${renderDirectSelectOptions(
                      DIPLOMACY_RELATION_OPTIONS.map((relation) => ({
                        value: relation,
                        label: relation,
                      })),
                      selectedRelation,
                    )}
                  </select>
                </label>
              </div>
            </section>
            ${renderDiplomacyMilitaryIntel({
              language,
              object,
              subject,
              worldResources,
            })}
            <section class="studio-native-identity-detail__advanced" data-editor-scope="readonly" ${renderDiplomacyFieldsAttribute("readonly")}>
              <div class="studio-native-identity-detail__advanced-title">
                ${studioIcon("book-open", "studio-native-identity-detail__section-icon")}
                <span>${t(language, "技术信息", "Technical info")}</span>
              </div>
              ${renderNativeDiplomacyReadonlyGrid({ object, pairKey, subject })}
            </section>
          `
              : `<div class="studio-native-identity__empty">${t(language, "没有选中的外交关系", "No relation selected")}</div>`
          }
          <div class="studio-native-identity-detail__actions">
            ${subject && object ? renderDirectWorkbenchEditStatus("studioDiplomacyEditStatus", language, diplomacyStatus) : ""}
            ${subject && object ? `<button class="studio-primary-action" data-studio-action="direct-diplomacy-apply" data-subject-id="${subject.id}" data-object-id="${object.id}">${t(language, "应用关系", "Apply relation")}</button>` : ""}
            ${subject && object ? `<button class="studio-ghost" data-studio-action="direct-diplomacy-reset" data-subject-id="${subject.id}" data-object-id="${object.id}">${t(language, "重置", "Reset")}</button>` : ""}
          </div>
        </div>
        </article>`;
}

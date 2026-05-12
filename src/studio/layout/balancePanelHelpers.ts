import type { EditorAction } from "../bridge/engineActionTypes";
import type { StudioLanguage, StudioState } from "../types";
import { renderFocusButton } from "./focusControls";
import {
  EDITOR_CONTROL_LABELS,
  EDITOR_CONTROL_ZH_LABELS,
} from "./shellConstants";
import { escapeHtml } from "./shellShared";

export function getEditorLabel(
  action: EditorAction | null,
  language: StudioLanguage,
) {
  if (!action) return "None";
  return language === "zh-CN"
    ? EDITOR_CONTROL_ZH_LABELS[action]
    : EDITOR_CONTROL_LABELS[action];
}

export function localizeReferenceLabel(label: string) {
  if (label === "states") return "states";
  if (label === "provinces") return "provinces";
  if (label === "burgs") return "burgs";
  if (label === "biomes") return "biomes";
  return label;
}

export function renderReferenceList(
  refs: Record<string, number[]> | undefined,
  _language?: StudioLanguage,
) {
  if (!refs || !Object.keys(refs).length) return "";

  return `
    <div class="studio-balance-card__refs">
      ${Object.entries(refs)
        .map(
          ([label, values]) =>
            `<span>${escapeHtml(localizeReferenceLabel(label))}: ${values.slice(0, 6).join(", ")}</span>`,
        )
        .join("")}
    </div>
  `;
}

export function getBalanceHintEditorAction(category: string): EditorAction {
  if (category === "habitability") return "biomeWorkbench";
  if (category === "connectivity") return "provinceWorkbench";
  return "stateWorkbench";
}

function getTargetTypeFromRef(
  type: string,
): NonNullable<StudioState["balanceFocus"]>["targetType"] {
  if (type === "provinces") return "province";
  if (type === "burgs") return "burg";
  if (type === "biomes") return "biome";
  return "state";
}

export function renderEditorEntry(
  action: EditorAction,
  editorAvailability: Record<EditorAction, boolean>,
  label?: string,
  language: StudioLanguage = "en",
) {
  const buttonLabel =
    label ?? `Open ${getEditorLabel(action, language)} editor`;
  const actionName = action === "stateWorkbench" ? "section" : "editor";
  const value = action === "stateWorkbench" ? "editors" : action;
  return `<button class="studio-ghost" data-studio-action="${actionName}" data-value="${value}"${editorAvailability[action] ? "" : " disabled"}>${buttonLabel}</button>`;
}

export function renderReferenceFocusButtons(
  refs: Record<string, number[]> | undefined,
  sourceLabel: string,
  language: StudioLanguage,
) {
  if (!refs) return "";

  return Object.entries(refs)
    .map(
      ([type, values]) =>
        `${renderFocusButton(getTargetTypeFromRef(type), values[0], sourceLabel, "focus", language)}${renderFocusButton(getTargetTypeFromRef(type), values[0], sourceLabel, "fix", language)}`,
    )
    .join("");
}

export function renderAutoFixTargetButton(
  refs: Record<string, number[]> | undefined,
  sourceLabel: string,
  language: StudioLanguage,
) {
  const entry = Object.entries(refs || {}).find(([, values]) => values.length);
  if (!entry) return "";
  const [type, values] = entry;
  return renderFocusButton(
    getTargetTypeFromRef(type),
    values[0],
    sourceLabel,
    "fix",
    language,
  );
}

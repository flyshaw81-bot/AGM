import type { EngineEntitySummaryItem } from "../bridge/engineActionTypes";
import type { StudioLanguage } from "../types";
import { escapeHtml, t } from "./shellShared";

export type DirectWorkbenchEditStatus = "clean" | "saved";

export const DIRECT_WORKBENCH_ROW_LIMITS = {
  default: 80,
  burgs: 60,
  states: 40,
} as const;

export function formatEntityPickerValue(
  item: EngineEntitySummaryItem | undefined,
  fallbackId: number | undefined,
) {
  if (item) return `${item.name} #${item.id}`;
  return fallbackId ? `#${fallbackId}` : "";
}

export function getDirectWorkbenchEditStatus(isSaved: boolean) {
  return isSaved ? "saved" : "clean";
}

export function getDirectWorkbenchEditStatusLabel(
  language: StudioLanguage,
  status: DirectWorkbenchEditStatus,
) {
  return status === "saved"
    ? t(language, "已应用", "Applied")
    : t(language, "未修改", "No changes");
}

export function renderDirectWorkbenchEditStatus(
  id: string,
  language: StudioLanguage,
  status: DirectWorkbenchEditStatus,
) {
  return `<span id="${id}" class="studio-state-edit-status" aria-live="polite" data-status="${status}" data-clean-label="${t(language, "未修改", "No changes")}" data-dirty-label="${t(language, "有未应用修改", "Unsaved changes")}" data-saved-label="${t(language, "已应用", "Applied")}" hidden></span>`;
}

type DirectWorkbenchFormActionsOptions = {
  applyAction: string;
  applyLabel?: string;
  attributes: Record<string, number | string>;
  language: StudioLanguage;
  resetAction: string;
  resetLabel?: string;
  status: DirectWorkbenchEditStatus;
  statusId: string;
};

function renderActionDataAttributes(
  attributes: Record<string, number | string>,
) {
  return Object.entries(attributes)
    .map(
      ([key, value]) =>
        ` data-${escapeHtml(key)}="${escapeHtml(String(value))}"`,
    )
    .join("");
}

export function renderDirectWorkbenchFormActions({
  applyAction,
  applyLabel,
  attributes,
  language,
  resetAction,
  resetLabel,
  status,
  statusId,
}: DirectWorkbenchFormActionsOptions) {
  const dataAttributes = renderActionDataAttributes(attributes);
  return `<div class="studio-native-identity-detail__actions">
            ${renderDirectWorkbenchEditStatus(statusId, language, status)}
            <button class="studio-primary-action" data-studio-action="${escapeHtml(applyAction)}"${dataAttributes}>${escapeHtml(applyLabel ?? t(language, "应用修改", "Apply changes"))}</button>
            <button class="studio-ghost" data-studio-action="${escapeHtml(resetAction)}"${dataAttributes}>${escapeHtml(resetLabel ?? t(language, "重置", "Reset"))}</button>
          </div>`;
}

export function renderDirectSelectOptions<T extends string | number>(
  options: readonly { value: T; label: string }[],
  selectedValue: T,
) {
  return options
    .map(
      (option) =>
        `<option value="${escapeHtml(String(option.value))}"${option.value === selectedValue ? " selected" : ""}>${escapeHtml(option.label)}</option>`,
    )
    .join("");
}

export function limitDirectWorkbenchRows<T>(
  items: readonly T[],
  limit: number = DIRECT_WORKBENCH_ROW_LIMITS.default,
) {
  return items.slice(0, limit);
}

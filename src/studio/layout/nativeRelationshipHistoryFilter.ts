import type { StudioLanguage } from "../types";
import { queryDirectRelationshipQueueHistoryRows } from "./nativeRelationshipQueueDom";
import { t } from "./shellShared";

export type ApplyDirectRelationshipHistoryFilterOptions = {
  filter: string;
  language: StudioLanguage;
  filters: HTMLElement | null;
  summary: HTMLElement | null;
  emptyState: HTMLElement | null;
};

export function applyDirectRelationshipHistoryFilter({
  filter,
  language,
  filters,
  summary,
  emptyState,
}: ApplyDirectRelationshipHistoryFilterOptions) {
  if (!filters) return;
  filters.dataset.historyFilter = filter;
  filters
    .querySelectorAll<HTMLElement>(
      "[data-studio-action='direct-relationship-history-filter']",
    )
    .forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.historyFilter === filter,
      );
    });
  let visibleCount = 0;
  const rows = queryDirectRelationshipQueueHistoryRows();
  rows.forEach((row) => {
    const visible = filter === "all" || row.dataset.historyRowStatus === filter;
    row.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  filters.dataset.historyVisible = String(visibleCount);
  filters.dataset.historyTotal = String(rows.length);
  const statusCounts = rows.reduce(
    (counts, row) => {
      const status = row.dataset.historyRowStatus || "readonly";
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    {
      all: rows.length,
      blocked: 0,
      undoable: 0,
      undone: 0,
      readonly: 0,
    } as Record<string, number>,
  );
  filters
    .querySelectorAll<HTMLElement>(
      "[data-studio-action='direct-relationship-history-filter']",
    )
    .forEach((button) => {
      const count = button.querySelector("strong");
      if (count)
        count.textContent = String(
          statusCounts[button.dataset.historyFilter || "all"] || 0,
        );
    });
  if (summary) {
    const filterLabel =
      filters
        .querySelector<HTMLElement>(
          `[data-studio-action='direct-relationship-history-filter'][data-history-filter='${filter}']`,
        )
        ?.childNodes[0]?.textContent?.trim() || filter;
    summary.textContent = `${t(language, "当前筛选", "Current filter")}: ${filterLabel} \u00b7 ${t(language, "可见", "Visible")}: ${visibleCount} / ${rows.length}`;
  }
  if (emptyState) emptyState.hidden = visibleCount > 0;
}

export type ApplyNativeRelationshipHistoryFilterOptions =
  ApplyDirectRelationshipHistoryFilterOptions;

export const applyNativeRelationshipHistoryFilter =
  applyDirectRelationshipHistoryFilter;

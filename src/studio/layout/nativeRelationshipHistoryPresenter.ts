import type { StudioLanguage } from "../types";
import { createDirectRelationshipHistoryLabels } from "./nativeRelationshipHistoryLabels";
import { createDirectRelationshipHistorySummaries } from "./nativeRelationshipHistorySummaries";

export function createDirectRelationshipHistoryPresenter(
  language: StudioLanguage,
) {
  const labels = createDirectRelationshipHistoryLabels(language);
  const summaries = createDirectRelationshipHistorySummaries(language, labels);

  return {
    ...labels,
    ...summaries,
  };
}

export const createNativeRelationshipHistoryPresenter =
  createDirectRelationshipHistoryPresenter;

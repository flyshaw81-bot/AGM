import type { StudioLanguage } from "../types";
import { createNativeRelationshipHistoryLabels } from "./nativeRelationshipHistoryLabels";
import { createNativeRelationshipHistorySummaries } from "./nativeRelationshipHistorySummaries";

export function createNativeRelationshipHistoryPresenter(
  language: StudioLanguage,
) {
  const labels = createNativeRelationshipHistoryLabels(language);
  const summaries = createNativeRelationshipHistorySummaries(language, labels);

  return {
    ...labels,
    ...summaries,
  };
}

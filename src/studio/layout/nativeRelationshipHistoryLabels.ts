import {
  getEngineEntitySummary,
  getEngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import {
  getNativeRelationshipCurrentFieldValue,
  type NativeRelationshipQueueUndoChange,
} from "./nativeRelationshipQueue";
import { t } from "./shellShared";

export function createNativeRelationshipHistoryLabels(
  language: StudioLanguage,
) {
  const getNativeRelationshipHistoryEntityLabel = (
    change: NativeRelationshipQueueUndoChange,
  ) => {
    const entitySummary = getEngineEntitySummary();
    const worldResources = getEngineWorldResourceSummary();
    const entityLabels = {
      state: t(language, "国家", "State"),
      burg: t(language, "城镇", "Burg"),
      province: t(language, "省份", "Province"),
    };
    const name =
      change.entity === "state"
        ? entitySummary.states.find((item) => item.id === change.id)?.name
        : change.entity === "burg"
          ? entitySummary.burgs.find((item) => item.id === change.id)?.name
          : worldResources.provinces.find((item) => item.id === change.id)
              ?.name;
    return `${entityLabels[change.entity]}${name ? ` · ${name}` : ""} #${change.id}`;
  };
  const getNativeRelationshipHistoryFieldLabel = (field: string) =>
    ({
      culture: t(language, "文化", "Culture"),
      capital: t(language, "首都", "Capital"),
      state: t(language, "国家", "State"),
      burg: t(language, "城镇", "Burg"),
    })[field] || field;
  const getNativeRelationshipHistoryValueLabel = (
    change: NativeRelationshipQueueUndoChange,
    value: string,
  ) => {
    if (!value || value === "0") return `${t(language, "无", "None")} #0`;
    const id = Number(value);
    const entitySummary = getEngineEntitySummary();
    const label =
      change.field === "culture"
        ? entitySummary.cultures.find((item) => item.id === id)?.name
        : change.field === "capital" || change.field === "burg"
          ? entitySummary.burgs.find((item) => item.id === id)?.name
          : change.field === "state"
            ? entitySummary.states.find((item) => item.id === id)?.name
            : "";
    return `${label || t(language, "缺失引用", "Missing reference")} #${value}`;
  };
  const getNativeRelationshipHistoryCurrentState = (
    change: NativeRelationshipQueueUndoChange,
  ) => {
    const currentValue = getNativeRelationshipCurrentFieldValue(
      change.entity,
      change.id,
      change.field,
    );
    return { currentValue, matchesAfter: currentValue === change.afterValue };
  };
  const getNativeRelationshipHistoryCurrentText = (
    change: NativeRelationshipQueueUndoChange,
  ) => {
    const current = getNativeRelationshipHistoryCurrentState(change);
    return `${t(language, "当前", "Current")}: ${getNativeRelationshipHistoryValueLabel(change, current.currentValue)} · ${current.matchesAfter ? t(language, "当前仍匹配 after", "Current matches after") : t(language, "当前已变化", "Current changed")}`;
  };
  const getNativeRelationshipHistoryCurrentStatus = (
    change: NativeRelationshipQueueUndoChange,
  ) =>
    getNativeRelationshipHistoryCurrentState(change).matchesAfter
      ? t(language, "当前仍匹配 after", "Current matches after")
      : t(language, "当前已变化", "Current changed");

  return {
    getNativeRelationshipHistoryCurrentState,
    getNativeRelationshipHistoryCurrentStatus,
    getNativeRelationshipHistoryCurrentText,
    getNativeRelationshipHistoryEntityLabel,
    getNativeRelationshipHistoryFieldLabel,
    getNativeRelationshipHistoryValueLabel,
  };
}

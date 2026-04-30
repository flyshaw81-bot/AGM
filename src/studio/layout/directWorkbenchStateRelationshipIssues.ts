import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";
import { createStateRelationshipReplacementCandidates } from "./nativeRelationshipIssueCandidates";
import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";
import { t } from "./shellShared";

type CreateStateRelationshipIssuesOptions = {
  activeBurgs: EngineEntitySummaryItem[];
  activeCultures: EngineEntitySummaryItem[];
  activeStates: EngineEntitySummaryItem[];
  burgIds: ReadonlySet<number>;
  cultureIds: ReadonlySet<number>;
  language: StudioLanguage;
};

export function createStateRelationshipIssues({
  activeBurgs,
  activeCultures,
  activeStates,
  burgIds,
  cultureIds,
  language,
}: CreateStateRelationshipIssuesOptions) {
  return activeStates.flatMap((state) => {
    const issues: RelationshipIssue[] = [];

    if (state.culture && !cultureIds.has(state.culture)) {
      issues.push({
        groupKey: "state-clear-culture",
        groupLabel: t(language, "国家文化缺失", "Missing state culture"),
        target: DIRECT_WORKBENCH_TARGETS.states,
        label: `${t(language, "国家文化缺失", "Missing state culture")} #${state.id}`,
        source: `${t(language, "国家", "State")} ${state.name} #${state.id}`,
        sourceEntity: "state",
        sourceId: state.id,
        reference: `${t(language, "文化", "Culture")} #${state.culture}`,
        detail: t(
          language,
          "-",
          "The state references a culture that no longer exists.",
        ),
        repairField: t(language, "文化", "Culture"),
        repairCurrent: `#${state.culture}`,
        repairTarget: "#0",
        candidateTotal: activeCultures.length,
        editLabel: t(language, "选择有效文化", "Choose valid culture"),
        editEntity: "state",
        editId: state.id,
        editField: "culture",
        replaceCandidates: createStateRelationshipReplacementCandidates({
          activeBurgs,
          activeCultures,
          field: "culture",
          language,
          state,
        }),
        fixLabel: t(language, "清空失效文化", "Clear broken culture"),
        fixKind: "state-clear-culture",
        fixStateId: state.id,
        fixStateName: state.name,
        fixStateForm: state.form || state.type || "",
        fixStateFormName: state.formName || state.type || "",
        fixStateFullName: state.fullName || state.name,
        fixStateColor: state.color || "",
        fixStateCulture: 0,
        fixStateCapital: state.capital || 0,
        fixStatePopulation: state.population ?? "",
        fixStateRural: state.rural ?? "",
        fixStateUrban: state.urban ?? "",
      });
    }

    if (state.capital && !burgIds.has(state.capital)) {
      issues.push({
        groupKey: "state-clear-capital",
        groupLabel: t(language, "国家首都缺失", "Missing state capital"),
        target: DIRECT_WORKBENCH_TARGETS.states,
        label: `${t(language, "国家首都缺失", "Missing state capital")} #${state.id}`,
        source: `${t(language, "国家", "State")} ${state.name} #${state.id}`,
        sourceEntity: "state",
        sourceId: state.id,
        reference: `${t(language, "首都城镇", "Capital burg")} #${state.capital}`,
        detail: t(
          language,
          "-",
          "The state references a capital burg that no longer exists.",
        ),
        repairField: t(language, "首都", "Capital"),
        repairCurrent: `#${state.capital}`,
        repairTarget: "#0",
        candidateTotal: activeBurgs.length,
        editLabel: t(language, "选择有效首都", "Choose valid capital"),
        editEntity: "state",
        editId: state.id,
        editField: "capital",
        replaceCandidates: createStateRelationshipReplacementCandidates({
          activeBurgs,
          activeCultures,
          field: "capital",
          language,
          state,
        }),
        fixLabel: t(language, "清空失效首都", "Clear broken capital"),
        fixKind: "state-clear-capital",
        fixStateId: state.id,
        fixStateName: state.name,
        fixStateForm: state.form || state.type || "",
        fixStateFormName: state.formName || state.type || "",
        fixStateFullName: state.fullName || state.name,
        fixStateColor: state.color || "",
        fixStateCulture: state.culture || 0,
        fixStateCapital: 0,
        fixStatePopulation: state.population ?? "",
        fixStateRural: state.rural ?? "",
        fixStateUrban: state.urban ?? "",
      });
    }

    return issues;
  });
}

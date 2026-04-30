import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";
import { createBurgRelationshipReplacementCandidates } from "./nativeRelationshipIssueCandidates";
import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";
import { t } from "./shellShared";

type CreateBurgRelationshipIssuesOptions = {
  activeBurgs: EngineEntitySummaryItem[];
  activeCultures: EngineEntitySummaryItem[];
  activeStates: EngineEntitySummaryItem[];
  cultureIds: ReadonlySet<number>;
  language: StudioLanguage;
  stateIds: ReadonlySet<number>;
};

export function createBurgRelationshipIssues({
  activeBurgs,
  activeCultures,
  activeStates,
  cultureIds,
  language,
  stateIds,
}: CreateBurgRelationshipIssuesOptions) {
  return activeBurgs.flatMap((burg) => {
    const issues: RelationshipIssue[] = [];

    if (burg.state && !stateIds.has(burg.state)) {
      issues.push({
        groupKey: "burg-clear-state",
        groupLabel: t(language, "城镇国家缺失", "Missing burg state"),
        target: DIRECT_WORKBENCH_TARGETS.burgs,
        label: `${t(language, "城镇国家缺失", "Missing burg state")} #${burg.id}`,
        source: `${t(language, "城镇", "Burg")} ${burg.name} #${burg.id}`,
        sourceEntity: "burg",
        sourceId: burg.id,
        reference: `${t(language, "国家", "State")} #${burg.state}`,
        detail: t(
          language,
          "-",
          "The burg references a state that no longer exists.",
        ),
        repairField: t(language, "国家", "State"),
        repairCurrent: `#${burg.state}`,
        repairTarget: "#0",
        candidateTotal: activeStates.length,
        editLabel: t(language, "选择有效国家", "Choose valid state"),
        editEntity: "burg",
        editId: burg.id,
        editField: "state",
        replaceCandidates: createBurgRelationshipReplacementCandidates({
          activeCultures,
          activeStates,
          burg,
          field: "state",
          language,
        }),
        fixLabel: t(language, "清空失效国家", "Clear broken state"),
        fixKind: "burg-clear-state",
        fixBurgId: burg.id,
        fixBurgName: burg.name,
        fixBurgType: burg.type || "",
        fixBurgState: 0,
        fixBurgCulture: burg.culture || 0,
        fixBurgPopulation: burg.population ?? "",
      });
    }

    if (burg.culture && !cultureIds.has(burg.culture)) {
      issues.push({
        groupKey: "burg-clear-culture",
        groupLabel: t(language, "城镇文化缺失", "Missing burg culture"),
        target: DIRECT_WORKBENCH_TARGETS.burgs,
        label: `${t(language, "城镇文化缺失", "Missing burg culture")} #${burg.id}`,
        source: `${t(language, "城镇", "Burg")} ${burg.name} #${burg.id}`,
        sourceEntity: "burg",
        sourceId: burg.id,
        reference: `${t(language, "文化", "Culture")} #${burg.culture}`,
        detail: t(
          language,
          "-",
          "The burg references a culture that no longer exists.",
        ),
        repairField: t(language, "文化", "Culture"),
        repairCurrent: `#${burg.culture}`,
        repairTarget: "#0",
        candidateTotal: activeCultures.length,
        editLabel: t(language, "选择有效文化", "Choose valid culture"),
        editEntity: "burg",
        editId: burg.id,
        editField: "culture",
        replaceCandidates: createBurgRelationshipReplacementCandidates({
          activeCultures,
          activeStates,
          burg,
          field: "culture",
          language,
        }),
        fixLabel: t(language, "清空失效文化", "Clear broken culture"),
        fixKind: "burg-clear-culture",
        fixBurgId: burg.id,
        fixBurgName: burg.name,
        fixBurgType: burg.type || "",
        fixBurgState: burg.state || 0,
        fixBurgCulture: 0,
        fixBurgPopulation: burg.population ?? "",
      });
    }

    return issues;
  });
}

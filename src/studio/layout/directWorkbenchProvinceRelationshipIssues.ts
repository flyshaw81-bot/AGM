import type {
  EngineEntitySummaryItem,
  EngineProvinceSummaryItem,
} from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";
import { createProvinceRelationshipReplacementCandidates } from "./nativeRelationshipIssueCandidates";
import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";
import { t } from "./shellShared";

type CreateProvinceRelationshipIssuesOptions = {
  activeBurgs: EngineEntitySummaryItem[];
  activeProvinces: EngineProvinceSummaryItem[];
  activeStates: EngineEntitySummaryItem[];
  burgIds: ReadonlySet<number>;
  burgStateById: ReadonlyMap<number, number | undefined>;
  language: StudioLanguage;
  stateIds: ReadonlySet<number>;
};

export function createProvinceRelationshipIssues({
  activeBurgs,
  activeProvinces,
  activeStates,
  burgIds,
  burgStateById,
  language,
  stateIds,
}: CreateProvinceRelationshipIssuesOptions) {
  return activeProvinces.flatMap((province) => {
    const issues: RelationshipIssue[] = [];
    const linkedBurgState = province.burg
      ? burgStateById.get(province.burg)
      : undefined;

    if (province.state && !stateIds.has(province.state)) {
      issues.push({
        groupKey: "province-clear-state",
        groupLabel: t(language, "省份国家缺失", "Missing province state"),
        target: DIRECT_WORKBENCH_TARGETS.provinces,
        label: `${t(language, "省份国家缺失", "Missing province state")} #${province.id}`,
        source: `${t(language, "省份", "Province")} ${province.name} #${province.id}`,
        sourceEntity: "province",
        sourceId: province.id,
        reference: `${t(language, "国家", "State")} #${province.state}`,
        detail: t(
          language,
          "-",
          "The province references a state that no longer exists.",
        ),
        repairField: t(language, "国家", "State"),
        repairCurrent: `#${province.state}`,
        repairTarget: "#0",
        candidateTotal: activeStates.length,
        editLabel: t(language, "选择有效国家", "Choose valid state"),
        editEntity: "province",
        editId: province.id,
        editField: "state",
        replaceCandidates: createProvinceRelationshipReplacementCandidates({
          activeBurgs,
          activeStates,
          field: "state",
          language,
          province,
        }),
        fixLabel: t(language, "清空失效国家", "Clear broken state"),
        fixKind: "province-clear-state",
        fixProvinceId: province.id,
        fixProvinceName: province.name,
        fixProvinceFullName: province.fullName || province.name,
        fixProvinceType: province.type || "",
        fixProvinceState: 0,
        fixProvinceBurg: province.burg || 0,
        fixProvinceColor: province.color || "",
      });
    }

    if (province.burg && !burgIds.has(province.burg)) {
      issues.push({
        groupKey: "province-clear-burg",
        groupLabel: t(language, "省份城镇缺失", "Missing province burg"),
        target: DIRECT_WORKBENCH_TARGETS.provinces,
        label: `${t(language, "省份城镇缺失", "Missing province burg")} #${province.id}`,
        source: `${t(language, "省份", "Province")} ${province.name} #${province.id}`,
        sourceEntity: "province",
        sourceId: province.id,
        reference: `${t(language, "城镇", "Burg")} #${province.burg}`,
        detail: t(
          language,
          "-",
          "The province references a burg that no longer exists.",
        ),
        repairField: t(language, "城镇", "Burg"),
        repairCurrent: `#${province.burg}`,
        repairTarget: "#0",
        candidateTotal: activeBurgs.length,
        editLabel: t(language, "选择有效城镇", "Choose valid burg"),
        editEntity: "province",
        editId: province.id,
        editField: "burg",
        replaceCandidates: createProvinceRelationshipReplacementCandidates({
          activeBurgs,
          activeStates,
          field: "burg",
          language,
          province,
        }),
        fixLabel: t(language, "清空失效城镇", "Clear broken burg"),
        fixKind: "province-clear-burg",
        fixProvinceId: province.id,
        fixProvinceName: province.name,
        fixProvinceFullName: province.fullName || province.name,
        fixProvinceType: province.type || "",
        fixProvinceState: province.state || 0,
        fixProvinceBurg: 0,
        fixProvinceColor: province.color || "",
      });
    }

    if (
      province.state &&
      province.burg &&
      linkedBurgState !== undefined &&
      linkedBurgState !== province.state
    ) {
      issues.push({
        groupKey: "province-sync-burg-state",
        groupLabel: t(language, "-", "Province burg state mismatch"),
        target: DIRECT_WORKBENCH_TARGETS.provinces,
        label: `${t(language, "Province burg state mismatch", "Province burg state mismatch")} #${province.id}`,
        source: `${t(language, "省份", "Province")} ${province.name} #${province.id}`,
        sourceEntity: "province",
        sourceId: province.id,
        reference: `${t(language, "省份国家", "Province state")} #${province.state} · ${t(language, "城镇国家", "Burg state")} #${linkedBurgState}`,
        detail: t(
          language,
          "-",
          "The province state does not match the burg's state.",
        ),
        repairField: t(language, "省份国家", "Province state"),
        repairCurrent: `#${province.state}`,
        repairTarget: `#${linkedBurgState}`,
        fixLabel: t(language, "Sync to burg state", "Sync to burg state"),
        fixKind: "province-sync-burg-state",
        fixProvinceId: province.id,
        fixProvinceName: province.name,
        fixProvinceFullName: province.fullName || province.name,
        fixProvinceType: province.type || "",
        fixProvinceState: linkedBurgState,
        fixProvinceBurg: province.burg,
        fixProvinceColor: province.color || "",
      });
    }

    return issues;
  });
}

import type {
  RelationshipIssue,
  RelationshipReplacementCandidate,
} from "./nativeRelationshipIssueTypes";
import { escapeHtml } from "./shellShared";

type DataAttributeValue = boolean | number | string | null | undefined;

export function renderNativeRelationshipDataAttributes(
  attributes: Record<string, DataAttributeValue>,
) {
  return Object.entries(attributes)
    .map(([name, value]) => `data-${name}="${escapeHtml(String(value ?? ""))}"`)
    .join(" ");
}

export function renderNativeRelationshipIssueFixAttributes(
  issue: RelationshipIssue,
) {
  return renderNativeRelationshipDataAttributes({
    "studio-action": "direct-relationship-fix",
    "fix-kind": issue.fixKind,
    "workbench-target": issue.target,
    "state-id": issue.fixStateId,
    "state-name": issue.fixStateName,
    "state-form": issue.fixStateForm,
    "state-form-name": issue.fixStateFormName,
    "state-full-name": issue.fixStateFullName || issue.fixStateName,
    "state-color": issue.fixStateColor,
    "state-culture": issue.fixStateCulture,
    "state-capital": issue.fixStateCapital,
    "state-population": issue.fixStatePopulation,
    "state-rural": issue.fixStateRural,
    "state-urban": issue.fixStateUrban,
    "burg-id": issue.fixBurgId,
    "burg-name": issue.fixBurgName,
    "burg-type": issue.fixBurgType,
    "burg-state": issue.fixBurgState,
    "burg-culture": issue.fixBurgCulture,
    "burg-population": issue.fixBurgPopulation,
    "province-id": issue.fixProvinceId,
    "province-name": issue.fixProvinceName,
    "province-full-name": issue.fixProvinceFullName || issue.fixProvinceName,
    "province-type": issue.fixProvinceType,
    "province-state": issue.fixProvinceState,
    "province-burg": issue.fixProvinceBurg,
    "province-color": issue.fixProvinceColor,
  });
}

export function renderNativeRelationshipReplacementCandidateAttributes(
  candidate: RelationshipReplacementCandidate,
) {
  return renderNativeRelationshipDataAttributes({
    "studio-action": "direct-relationship-replace-reference",
    "replace-entity": candidate.replaceEntity,
    "replace-field": candidate.replaceField,
    "replace-id": candidate.replaceId,
    "replace-value": candidate.replaceValue,
    "candidate-rank": candidate.rank,
    "candidate-recommended": candidate.recommended,
    "workbench-target": candidate.target,
    "state-name": candidate.stateName,
    "state-form": candidate.stateForm,
    "state-form-name": candidate.stateFormName,
    "state-full-name": candidate.stateFullName || candidate.stateName,
    "state-color": candidate.stateColor,
    "state-culture": candidate.stateCulture,
    "state-capital": candidate.stateCapital,
    "state-population": candidate.statePopulation,
    "state-rural": candidate.stateRural,
    "state-urban": candidate.stateUrban,
    "burg-name": candidate.burgName,
    "burg-type": candidate.burgType,
    "burg-state": candidate.burgState,
    "burg-culture": candidate.burgCulture,
    "burg-population": candidate.burgPopulation,
    "province-name": candidate.provinceName,
    "province-full-name": candidate.provinceFullName || candidate.provinceName,
    "province-type": candidate.provinceType,
    "province-state": candidate.provinceState,
    "province-burg": candidate.provinceBurg,
    "province-color": candidate.provinceColor,
  });
}

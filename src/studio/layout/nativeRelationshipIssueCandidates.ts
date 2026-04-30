import type {
  EngineEntitySummaryItem,
  EngineProvinceSummaryItem,
} from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";
import type { RelationshipReplacementCandidate } from "./nativeRelationshipIssueTypes";
import { t } from "./shellShared";

type CandidateOption = {
  label: string;
  value: number;
};

const getCandidateReason = (language: StudioLanguage, index: number) =>
  index === 0
    ? t(language, "First valid candidate", "First valid candidate")
    : t(language, "Alternate valid candidate", "Alternate valid candidate");

type StateReplacementCandidateOptions = {
  activeBurgs: EngineEntitySummaryItem[];
  activeCultures: EngineEntitySummaryItem[];
  field: "culture" | "capital";
  language: StudioLanguage;
  state: EngineEntitySummaryItem;
};

export function createStateRelationshipReplacementCandidates({
  activeBurgs,
  activeCultures,
  field,
  language,
  state,
}: StateReplacementCandidateOptions): RelationshipReplacementCandidate[] {
  const candidates: CandidateOption[] =
    field === "culture"
      ? activeCultures.slice(0, 3).map((culture) => ({
          label: `${culture.name} #${culture.id}`,
          value: culture.id,
        }))
      : activeBurgs.slice(0, 3).map((burg) => ({
          label: `${burg.name} #${burg.id}`,
          value: burg.id,
        }));

  return candidates.map((candidate, index) => ({
    label: candidate.label,
    previewField:
      field === "culture"
        ? t(language, "文化", "Culture")
        : t(language, "首都", "Capital"),
    previewCurrent: `#${field === "culture" ? state.culture : state.capital}`,
    previewTarget: candidate.label,
    rank: index + 1,
    recommended: index === 0,
    reason: getCandidateReason(language, index),
    replaceEntity: "state",
    replaceField: field,
    replaceId: state.id,
    replaceValue: candidate.value,
    target: DIRECT_WORKBENCH_TARGETS.states,
    stateName: state.name,
    stateForm: state.form || state.type || "",
    stateFormName: state.formName || state.type || "",
    stateFullName: state.fullName || state.name,
    stateColor: state.color || "",
    stateCulture: field === "culture" ? candidate.value : state.culture || 0,
    stateCapital: field === "capital" ? candidate.value : state.capital || 0,
    statePopulation: state.population ?? "",
    stateRural: state.rural ?? "",
    stateUrban: state.urban ?? "",
  }));
}

type BurgReplacementCandidateOptions = {
  activeCultures: EngineEntitySummaryItem[];
  activeStates: EngineEntitySummaryItem[];
  burg: EngineEntitySummaryItem;
  field: "state" | "culture";
  language: StudioLanguage;
};

export function createBurgRelationshipReplacementCandidates({
  activeCultures,
  activeStates,
  burg,
  field,
  language,
}: BurgReplacementCandidateOptions): RelationshipReplacementCandidate[] {
  const candidates: CandidateOption[] =
    field === "state"
      ? activeStates.slice(0, 3).map((state) => ({
          label: `${state.name} #${state.id}`,
          value: state.id,
        }))
      : activeCultures.slice(0, 3).map((culture) => ({
          label: `${culture.name} #${culture.id}`,
          value: culture.id,
        }));

  return candidates.map((candidate, index) => ({
    label: candidate.label,
    previewField:
      field === "state"
        ? t(language, "国家", "State")
        : t(language, "文化", "Culture"),
    previewCurrent: `#${field === "state" ? burg.state : burg.culture}`,
    previewTarget: candidate.label,
    rank: index + 1,
    recommended: index === 0,
    reason: getCandidateReason(language, index),
    replaceEntity: "burg",
    replaceField: field,
    replaceId: burg.id,
    replaceValue: candidate.value,
    target: DIRECT_WORKBENCH_TARGETS.burgs,
    burgName: burg.name,
    burgType: burg.type || "",
    burgState: field === "state" ? candidate.value : burg.state || 0,
    burgCulture: field === "culture" ? candidate.value : burg.culture || 0,
    burgPopulation: burg.population ?? "",
  }));
}

type ProvinceReplacementCandidateOptions = {
  activeBurgs: EngineEntitySummaryItem[];
  activeStates: EngineEntitySummaryItem[];
  field: "state" | "burg";
  language: StudioLanguage;
  province: EngineProvinceSummaryItem;
};

export function createProvinceRelationshipReplacementCandidates({
  activeBurgs,
  activeStates,
  field,
  language,
  province,
}: ProvinceReplacementCandidateOptions): RelationshipReplacementCandidate[] {
  const candidates: CandidateOption[] =
    field === "state"
      ? activeStates.slice(0, 3).map((state) => ({
          label: `${state.name} #${state.id}`,
          value: state.id,
        }))
      : activeBurgs.slice(0, 3).map((burg) => ({
          label: `${burg.name} #${burg.id}`,
          value: burg.id,
        }));

  return candidates.map((candidate, index) => ({
    label: candidate.label,
    previewField:
      field === "state"
        ? t(language, "国家", "State")
        : t(language, "城镇", "Burg"),
    previewCurrent: `#${field === "state" ? province.state : province.burg}`,
    previewTarget: candidate.label,
    rank: index + 1,
    recommended: index === 0,
    reason: getCandidateReason(language, index),
    replaceEntity: "province",
    replaceField: field,
    replaceId: province.id,
    replaceValue: candidate.value,
    target: DIRECT_WORKBENCH_TARGETS.provinces,
    provinceName: province.name,
    provinceFullName: province.fullName || province.name,
    provinceType: province.type || "",
    provinceState: field === "state" ? candidate.value : province.state || 0,
    provinceBurg: field === "burg" ? candidate.value : province.burg || 0,
    provinceColor: province.color || "",
  }));
}

import type {
  EngineEntitySummaryItem,
  EngineProvinceSummaryItem,
} from "../bridge/engineActions";
import type { StudioLanguage } from "../types";

export type RelationshipReplacementCandidate = {
  label: string;
  previewField: string;
  previewCurrent: string;
  previewTarget: string;
  rank: number;
  recommended: boolean;
  reason: string;
  replaceEntity: "state" | "burg" | "province";
  replaceField: "culture" | "capital" | "state" | "burg";
  replaceId: number;
  replaceValue: number;
  target: string;
  stateName?: string;
  stateForm?: string;
  stateFormName?: string;
  stateFullName?: string;
  stateColor?: string;
  stateCulture?: number;
  stateCapital?: number;
  statePopulation?: number | string;
  stateRural?: number | string;
  stateUrban?: number | string;
  burgName?: string;
  burgType?: string;
  burgState?: number;
  burgCulture?: number;
  burgPopulation?: number | string;
  provinceName?: string;
  provinceFullName?: string;
  provinceType?: string;
  provinceState?: number;
  provinceBurg?: number;
  provinceColor?: string;
};

export type RelationshipIssue = {
  groupKey: string;
  groupLabel: string;
  target: string;
  label: string;
  source: string;
  sourceEntity: "state" | "burg" | "province";
  sourceId: number;
  reference: string;
  detail: string;
  repairField?: string;
  repairCurrent?: string;
  repairTarget?: string;
  candidateTotal?: number;
  editLabel?: string;
  editEntity?: "state" | "burg" | "province";
  editId?: number;
  editField?: "culture" | "capital" | "state" | "burg";
  replaceCandidates?: RelationshipReplacementCandidate[];
  fixLabel?: string;
  fixKind?:
    | "state-clear-culture"
    | "state-clear-capital"
    | "burg-clear-state"
    | "burg-clear-culture"
    | "province-clear-state"
    | "province-clear-burg"
    | "province-sync-burg-state";
  fixStateId?: number;
  fixStateName?: string;
  fixStateForm?: string;
  fixStateFormName?: string;
  fixStateFullName?: string;
  fixStateColor?: string;
  fixStateCulture?: number;
  fixStateCapital?: number;
  fixStatePopulation?: number | string;
  fixStateRural?: number | string;
  fixStateUrban?: number | string;
  fixBurgId?: number;
  fixBurgName?: string;
  fixBurgType?: string;
  fixBurgState?: number;
  fixBurgCulture?: number;
  fixBurgPopulation?: number | string;
  fixProvinceId?: number;
  fixProvinceName?: string;
  fixProvinceFullName?: string;
  fixProvinceType?: string;
  fixProvinceState?: number;
  fixProvinceBurg?: number;
  fixProvinceColor?: string;
};

export type CreateDirectWorkbenchRelationshipIssuesOptions = {
  activeStates: EngineEntitySummaryItem[];
  activeBurgs: EngineEntitySummaryItem[];
  activeCultures: EngineEntitySummaryItem[];
  activeProvinces: EngineProvinceSummaryItem[];
  language: StudioLanguage;
};

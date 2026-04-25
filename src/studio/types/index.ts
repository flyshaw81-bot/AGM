import type {EditorAction} from "../bridge/legacyActions";

export type PresetCategory = "desktop" | "mobile" | "custom";
export type Orientation = "landscape" | "portrait";
export type FitMode = "contain" | "cover" | "actual-size";

export interface CanvasPreset {
  id: string;
  label: string;
  category: PresetCategory;
  orientation: Orientation;
  width: number;
  height: number;
}

export type GameWorldProfile = "rpg" | "strategy" | "4x" | "tabletop" | "open-world" | "city-kingdom-continent";

export type GenerationProfileOverrideKey = "spawnFairnessWeight" | "settlementDensityTarget" | "routeConnectivityScore" | "biomeFrictionWeight" | "resourceCoverageTarget";

export interface GenerationProfileOverrideState {
  profile: GameWorldProfile;
  values: Partial<Record<GenerationProfileOverrideKey, number>>;
}

export interface GenerationProfileImpactChange {
  key: GenerationProfileOverrideKey;
  target: "states" | "burgs" | "growthRate" | "sizeVariety" | "provincesRatio";
  before: number | null;
  after: number;
}

export interface GenerationProfileImpactResultMetric {
  key: "spawnCandidates" | "averageSpawnScore" | "states" | "burgs" | "provinces" | "routes" | "routePointCount" | "resourceTaggedBiomes";
  before: number;
  after: number;
  delta: number;
}

export interface GenerationProfileImpactState {
  profile: GameWorldProfile;
  appliedAt: number;
  changes: GenerationProfileImpactChange[];
  resultMetrics: GenerationProfileImpactResultMetric[];
}

export interface DocumentState {
  name: string;
  documentWidth: number;
  documentHeight: number;
  seed: string;
  stylePreset: string;
  dirty: boolean;
  source: "legacy" | "agm";
  gameProfile: GameWorldProfile;
  designIntent: string;
}

export interface ViewportState {
  presetId: string;
  width: number;
  height: number;
  orientation: Orientation;
  fitMode: FitMode;
  zoom: number;
  panX: number;
  panY: number;
  safeAreaEnabled: boolean;
  guidesEnabled: boolean;
}

export type StudioSection = "project" | "canvas" | "style" | "layers" | "export" | "data" | "editors";

export interface ExportState {
  format: "svg" | "png" | "jpeg";
}

export interface EditorWorkflowState {
  activeEditor: EditorAction | null;
  editorDialogOpen: boolean;
  lastEditorSection: StudioSection | null;
}

export interface BalanceFocusState {
  targetType: "state" | "province" | "burg" | "biome";
  targetId: number;
  sourceLabel: string;
  action?: "focus" | "fix" | "adjust";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface AutoFixLegacyBiomeWritebackEntry {
  biomeId: number;
  previousHabitability: number | null;
  nextHabitability: number;
  previousAgmRuleWeight: number | null;
  nextAgmRuleWeight: number;
  previousAgmResourceTag: string | null;
  nextAgmResourceTag: string;
}

export interface AutoFixLegacyStateWritebackEntry {
  stateId: number;
  previousAgmFairStart: boolean | null;
  nextAgmFairStart: boolean;
  previousAgmFairStartScore: number | null;
  nextAgmFairStartScore: number;
  previousAgmPriority: string | null;
  nextAgmPriority: string;
}

export interface AutoFixLegacyProvinceWritebackEntry {
  provinceId: number;
  previousAgmConnectorTarget: number | null;
  nextAgmConnectorTarget: number;
  previousAgmConnectorType: string | null;
  nextAgmConnectorType: string;
}

export interface AutoFixLegacyWritebackEntry {
  createdBurgIds: number[];
  createdRouteIds: number[];
  updatedBiomes: AutoFixLegacyBiomeWritebackEntry[];
  updatedStates: AutoFixLegacyStateWritebackEntry[];
  updatedProvinces: AutoFixLegacyProvinceWritebackEntry[];
}

export interface AutoFixPreviewHistoryEntry {
  draftId: string;
  action: "apply" | "discard";
  changeCount: number;
  legacyWriteback?: AutoFixLegacyWritebackEntry;
  rulesPackImportVersion?: number;
}

export interface AutoFixPreviewState {
  appliedDraftIds: string[];
  discardedDraftIds: string[];
  undoStack: AutoFixPreviewHistoryEntry[];
  redoStack: AutoFixPreviewHistoryEntry[];
}

export interface StudioState {
  section: StudioSection;
  document: DocumentState;
  viewport: ViewportState;
  export: ExportState;
  editor: EditorWorkflowState;
  balanceFocus: BalanceFocusState | null;
  autoFixPreview: AutoFixPreviewState;
  generationProfileOverrides: GenerationProfileOverrideState;
  generationProfileImpact: GenerationProfileImpactState | null;
}

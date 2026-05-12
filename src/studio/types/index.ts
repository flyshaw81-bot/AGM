import type { EditorAction } from "../bridge/engineActionTypes";

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

export type GameWorldProfile =
  | "rpg"
  | "strategy"
  | "4x"
  | "tabletop"
  | "open-world"
  | "city-kingdom-continent";

export type GenerationProfileOverrideKey =
  | "spawnFairnessWeight"
  | "settlementDensityTarget"
  | "routeConnectivityScore"
  | "biomeFrictionWeight"
  | "resourceCoverageTarget";

export type StudioLanguage = "zh-CN" | "en";
export type StudioTheme = "daylight" | "night";

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
  key:
    | "spawnCandidates"
    | "averageSpawnScore"
    | "states"
    | "burgs"
    | "provinces"
    | "routes"
    | "routePointCount"
    | "resourceTaggedBiomes";
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
  source: "core" | "agm";
  gameProfile: GameWorldProfile;
  designIntent: string;
}

export type ProjectStatus = "draft" | "dirty" | "validated" | "export-ready";
export type ProjectDeliveryStatus = "unchecked" | "needs-repair" | "ready";

export interface RecentProjectEntry {
  id: string;
  name: string;
  gameProfile: GameWorldProfile;
  designIntent: string;
  width: number;
  height: number;
  seed: string;
  source: DocumentState["source"];
  status: ProjectStatus;
  updatedAt: number;
  hasLocalSnapshot: boolean;
  exportReady: boolean;
  deliveryStatus?: ProjectDeliveryStatus;
}

export interface ProjectCenterState {
  recentProjects: RecentProjectEntry[];
  activeProjectId: string;
  lastSavedAt: number | null;
}

export type StudioEditorModule =
  | "states"
  | "cultures"
  | "provinces"
  | "religions"
  | "burgs"
  | "routes"
  | "military"
  | "markers"
  | "diplomacy"
  | "zones"
  | "biomes";

export interface ShellState {
  navigationCollapsed: boolean;
  activeEditorModule: StudioEditorModule;
  generationBusy?: {
    title: string;
    detail: string;
  } | null;
  visibleLayerCards: string[];
}

export type CanvasToolMode =
  | "select"
  | "pan"
  | "brush"
  | "water"
  | "terrain"
  | "grid"
  | "measure";

export interface CanvasSelectionState {
  targetType: "state" | "burg";
  targetId: number;
  label: string;
  x: number;
  y: number;
}

export interface CanvasPaintPreviewState {
  tool: Extract<CanvasToolMode, "brush" | "water" | "terrain">;
  cellId: number;
  label: string;
  x: number;
  y: number;
  height: number | null;
  biomeId: number | null;
  stateId: number | null;
}

export interface CanvasEditHistoryEntry {
  id: number;
  tool: CanvasPaintPreviewState["tool"] | "biome-slider";
  cellId: number;
  beforeHeight: number | null;
  afterHeight: number | null;
  beforeBiomeId: number | null;
  afterBiomeId: number | null;
  label: string;
  undone: boolean;
  batch?: Array<{
    cellId: number;
    beforeBiomeId: number;
    afterBiomeId: number;
  }>;
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
  canvasTool: CanvasToolMode;
  selectedCanvasEntity: CanvasSelectionState | null;
  paintPreview: CanvasPaintPreviewState | null;
  canvasEditHistory: CanvasEditHistoryEntry[];
}

export type StudioSection =
  | "project"
  | "canvas"
  | "style"
  | "layers"
  | "export"
  | "data"
  | "editors"
  | "repair";

export interface ExportState {
  format: "svg" | "png" | "jpeg";
}

export interface EditorWorkflowState {
  activeEditor: EditorAction | null;
  editorDialogOpen: boolean;
  lastEditorSection: StudioSection | null;
}

export interface BalanceFocusState {
  targetType:
    | "state"
    | "province"
    | "burg"
    | "biome"
    | "route"
    | "culture"
    | "religion"
    | "zone";
  targetId: number;
  sourceLabel: string;
  action?: "focus" | "fix" | "adjust";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface AutoFixEngineBiomeWritebackEntry {
  biomeId: number;
  previousHabitability: number | null;
  nextHabitability: number;
  previousAgmRuleWeight: number | null;
  nextAgmRuleWeight: number;
  previousAgmResourceTag: string | null;
  nextAgmResourceTag: string;
}

export interface AutoFixEngineStateWritebackEntry {
  stateId: number;
  previousAgmFairStart: boolean | null;
  nextAgmFairStart: boolean;
  previousAgmFairStartScore: number | null;
  nextAgmFairStartScore: number;
  previousAgmPriority: string | null;
  nextAgmPriority: string;
}

export interface AutoFixEngineProvinceWritebackEntry {
  provinceId: number;
  previousAgmConnectorTarget: number | null;
  nextAgmConnectorTarget: number;
  previousAgmConnectorType: string | null;
  nextAgmConnectorType: string;
}

export interface AutoFixEngineWritebackEntry {
  createdBurgIds: number[];
  createdRouteIds: number[];
  updatedBiomes: AutoFixEngineBiomeWritebackEntry[];
  updatedStates: AutoFixEngineStateWritebackEntry[];
  updatedProvinces: AutoFixEngineProvinceWritebackEntry[];
}

export interface AutoFixPreviewHistoryEntry {
  draftId: string;
  action: "apply" | "discard";
  changeCount: number;
  engineWriteback?: AutoFixEngineWritebackEntry;
  rulesPackImportVersion?: number;
}

export interface AutoFixPreviewState {
  appliedDraftIds: string[];
  discardedDraftIds: string[];
  undoStack: AutoFixPreviewHistoryEntry[];
  redoStack: AutoFixPreviewHistoryEntry[];
}

export type DirectStateSortMode = "name" | "population" | "area" | "id";
export type DirectStateFilterMode = "all" | "populated" | "neighbors";
export type DirectBurgFilterMode = "all" | "selected-state" | "populated";
export type DirectProvinceFilterMode = "all" | "selected-state" | "has-burg";
export type DirectRouteFilterMode = "all" | "has-feature" | "has-points";
export type DirectBiomeFilterMode = "all" | "resource-tagged" | "habitable";
export type DirectCultureFilterMode = "all" | "populated" | "has-center";
export type DirectReligionFilterMode = "all" | "populated" | "has-center";
export type DirectZoneFilterMode = "all" | "populated" | "hidden";
export type DirectDiplomacyFilterMode = "all" | "conflict" | "positive";
export type DirectMarkerFilterMode = "all" | "pinned" | "locked";
export type DirectMilitaryFilterMode = "all" | "land" | "naval";

export interface DirectRelationshipQueueUndoChangeState {
  entity: "state" | "burg" | "province";
  id: number;
  field: string;
  beforeValue: string;
  afterValue: string;
  payload: Record<string, string>;
}

export interface DirectRelationshipQueueHistoryState {
  id: number;
  count: number;
  summary: string;
  target: string;
  resultText: string;
  undoChanges: DirectRelationshipQueueUndoChangeState[];
  undone: boolean;
  undoBlockedReason: string | null;
}

export interface DirectEditorState {
  selectedStateId: number | null;
  stateSearchQuery: string;
  stateSortMode: DirectStateSortMode;
  stateFilterMode: DirectStateFilterMode;
  lastAppliedStateId: number | null;
  selectedBurgId: number | null;
  burgSearchQuery: string;
  burgFilterMode: DirectBurgFilterMode;
  lastAppliedBurgId: number | null;
  selectedProvinceId: number | null;
  provinceSearchQuery: string;
  provinceFilterMode: DirectProvinceFilterMode;
  lastAppliedProvinceId: number | null;
  selectedRouteId: number | null;
  routeSearchQuery: string;
  routeFilterMode: DirectRouteFilterMode;
  lastAppliedRouteId: number | null;
  selectedBiomeId: number | null;
  biomeSearchQuery: string;
  biomeFilterMode: DirectBiomeFilterMode;
  lastAppliedBiomeId: number | null;
  selectedCultureId: number | null;
  cultureSearchQuery: string;
  cultureFilterMode: DirectCultureFilterMode;
  lastAppliedCultureId: number | null;
  selectedReligionId: number | null;
  religionSearchQuery: string;
  religionFilterMode: DirectReligionFilterMode;
  lastAppliedReligionId: number | null;
  selectedZoneId: number | null;
  zoneSearchQuery: string;
  zoneFilterMode: DirectZoneFilterMode;
  lastAppliedZoneId: number | null;
  selectedMarkerId: number | null;
  markerSearchQuery: string;
  markerFilterMode: DirectMarkerFilterMode;
  lastAppliedMarkerId: number | null;
  selectedDiplomacySubjectId: number | null;
  selectedDiplomacyObjectId: number | null;
  diplomacySearchQuery: string;
  diplomacyFilterMode: DirectDiplomacyFilterMode;
  lastAppliedDiplomacyPair: string | null;
  militarySearchQuery: string;
  militaryFilterMode: DirectMilitaryFilterMode;
  relationshipQueueHistory: DirectRelationshipQueueHistoryState | null;
  relationshipQueueHistoryLog: DirectRelationshipQueueHistoryState[];
}

export interface StudioState {
  language: StudioLanguage;
  theme: StudioTheme;
  shell: ShellState;
  section: StudioSection;
  document: DocumentState;
  projectCenter: ProjectCenterState;
  viewport: ViewportState;
  export: ExportState;
  editor: EditorWorkflowState;
  directEditor: DirectEditorState;
  balanceFocus: BalanceFocusState | null;
  autoFixPreview: AutoFixPreviewState;
  generationProfileOverrides: GenerationProfileOverrideState;
  generationProfileImpact: GenerationProfileImpactState | null;
}

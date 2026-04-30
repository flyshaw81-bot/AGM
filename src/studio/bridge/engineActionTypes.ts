export const LAYER_ACTIONS = [
  "toggleTexture",
  "toggleHeight",
  "toggleBiomes",
  "toggleCells",
  "toggleGrid",
  "toggleCoordinates",
  "toggleCompass",
  "toggleRivers",
  "toggleRelief",
  "toggleReligions",
  "toggleCultures",
  "toggleStates",
  "toggleProvinces",
  "toggleZones",
  "toggleBorders",
  "toggleRoutes",
  "toggleTemperature",
  "togglePopulation",
  "toggleIce",
  "togglePrecipitation",
  "toggleEmblems",
  "toggleBurgIcons",
  "toggleLabels",
  "toggleMilitary",
  "toggleMarkers",
  "toggleRulers",
  "toggleScaleBar",
  "toggleVignette",
] as const;

export const EDITOR_ACTIONS = [
  "editStates",
  "editCultures",
  "editReligions",
  "editBiomes",
  "editProvinces",
  "editZones",
  "editDiplomacy",
] as const;

export type LayerAction = (typeof LAYER_ACTIONS)[number];
export type EditorAction = (typeof EDITOR_ACTIONS)[number];

export type EngineEntitySummaryItem = {
  id: number;
  name: string;
  fullName?: string;
  formName?: string;
  form?: string;
  type?: string;
  state?: number;
  culture?: number;
  capital?: number;
  population?: number;
  cells?: number;
  area?: number;
  rural?: number;
  urban?: number;
  neighbors?: number[];
  diplomacy?: string[];
  color?: string;
};

export type EngineEntitySummary = {
  states: EngineEntitySummaryItem[];
  burgs: EngineEntitySummaryItem[];
  cultures: EngineEntitySummaryItem[];
  religions: EngineEntitySummaryItem[];
};

export type EngineBiomeSummaryItem = {
  id: number;
  name: string;
  color?: string;
  habitability?: number;
  movementCost?: number;
  iconDensity?: number;
  agmRuleWeight?: number;
  agmResourceTag?: string;
};

export type EngineProvinceSummaryItem = {
  id: number;
  name: string;
  fullName?: string;
  type?: string;
  state?: number;
  burg?: number;
  center?: number;
  color?: string;
};

export type EngineRouteSummaryItem = {
  id: number;
  group?: string;
  feature?: number;
  pointCount?: number;
  startCell?: number;
};

export type EngineZoneSummaryItem = {
  id: number;
  name: string;
  type?: string;
  color?: string;
  cellCount: number;
  hidden?: boolean;
  area?: number;
  population?: number;
};

export type EngineWorldResourceSummary = {
  biomes: EngineBiomeSummaryItem[];
  provinces: EngineProvinceSummaryItem[];
  routes: EngineRouteSummaryItem[];
  zones: EngineZoneSummaryItem[];
};

export type EngineFocusTarget = {
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
};

export type EngineFocusGeometry = EngineFocusTarget & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type EngineAutoFixPreviewChange = {
  id: string;
  operation: "create" | "update" | "link";
  entity: "state" | "province" | "burg" | "route" | "biome";
  summary: string;
  refs: Record<string, number[]>;
  fields?: Record<string, string | number | boolean | null>;
};

export type EngineAutoFixWritebackResult = {
  createdBurgIds: number[];
  createdRouteIds: number[];
  updatedBiomes: {
    biomeId: number;
    previousHabitability: number | null;
    nextHabitability: number;
    previousAgmRuleWeight: number | null;
    nextAgmRuleWeight: number;
    previousAgmResourceTag: string | null;
    nextAgmResourceTag: string;
  }[];
  updatedStates: {
    stateId: number;
    previousAgmFairStart: boolean | null;
    nextAgmFairStart: boolean;
    previousAgmFairStartScore: number | null;
    nextAgmFairStartScore: number;
    previousAgmPriority: string | null;
    nextAgmPriority: string;
  }[];
  updatedProvinces: {
    provinceId: number;
    previousAgmConnectorTarget: number | null;
    nextAgmConnectorTarget: number;
    previousAgmConnectorType: string | null;
    nextAgmConnectorType: string;
  }[];
};

export type AgmWritableBurg = {
  name?: string;
  state?: number;
  agmRole?: string;
  agmPriority?: string;
  agmSupportState?: number;
  removed?: boolean;
} & Record<string, unknown>;

export type AgmWritableBiomeData = {
  habitability: Record<number, number>;
  agmRuleWeight?: Record<number, number>;
  agmResourceTag?: Record<number, string>;
} & Record<string, unknown>;

export type AgmWritableProvince = {
  agmConnectorTarget?: number;
  agmConnectorType?: string;
  removed?: boolean;
} & Record<string, unknown>;

export type DataAction =
  | "quick-load"
  | "save-storage"
  | "save-machine"
  | "save-dropbox"
  | "connect-dropbox"
  | "load-dropbox"
  | "share-dropbox"
  | "new-map"
  | "open-file"
  | "load-url";

export type ProjectAction =
  | "seed-history"
  | "copy-seed-url"
  | "restore-default-canvas-size";

export type TopbarAction = "new" | "open" | "save" | "export";

export type EngineProjectSummary = {
  hasLocalSnapshot: boolean;
  stylePreset: string;
  lastLayersPreset: string;
  autosaveInterval: string;
  pendingSeed: string;
  pendingPoints: string;
  pendingCellsLabel: string;
  pendingStates: string;
  pendingProvincesRatio: string;
  pendingSizeVariety: string;
  pendingGrowthRate: string;
  pendingTemperatureEquator: string;
  pendingTemperatureEquatorF: string;
  pendingTemperatureNorthPole: string;
  pendingTemperatureNorthPoleF: string;
  pendingTemperatureSouthPole: string;
  pendingTemperatureSouthPoleF: string;
  pendingMapSize: string;
  pendingLatitude: string;
  pendingLongitude: string;
  pendingWindTier0: string;
  pendingWindTier1: string;
  pendingWindTier2: string;
  pendingWindTier3: string;
  pendingWindTier4: string;
  pendingWindTier5: string;
  pendingPrecipitation: string;
  pendingCultures: string;
  pendingBurgs: string;
  pendingBurgsLabel: string;
  pendingReligions: string;
  pendingStateLabelsMode: string;
  pendingStateLabelsModeLabel: string;
  pendingCultureSet: string;
  pendingCultureSetLabel: string;
  availableCultureSets: { value: string; label: string; max: string }[];
  pendingTemplate: string;
  pendingTemplateLabel: string;
  availableTemplates: { value: string; label: string }[];
  pendingWidth: string;
  pendingHeight: string;
  availableLayersPresets: string[];
  canSaveLayersPreset: boolean;
  canRemoveLayersPreset: boolean;
  canOpenSeedHistory: boolean;
  canCopySeedUrl: boolean;
  canSetSeed: boolean;
  canRestoreDefaultCanvasSize: boolean;
};

export type EngineDocumentSourceSummary = {
  sourceLabel: string;
  sourceDetail: string;
};

export type EngineSaveTargetSummary = {
  saveLabel: string;
  saveDetail: string;
};

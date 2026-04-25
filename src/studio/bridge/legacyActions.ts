const LAYER_ACTIONS = [
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

const EDITOR_ACTIONS = [
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
export type LegacyEntitySummaryItem = {
  id: number;
  name: string;
  type?: string;
  state?: number;
  culture?: number;
  capital?: number;
  population?: number;
  cells?: number;
  color?: string;
};
export type LegacyEntitySummary = {
  states: LegacyEntitySummaryItem[];
  burgs: LegacyEntitySummaryItem[];
  cultures: LegacyEntitySummaryItem[];
  religions: LegacyEntitySummaryItem[];
};
export type LegacyBiomeSummaryItem = {
  id: number;
  name: string;
  color?: string;
  habitability?: number;
  movementCost?: number;
  iconDensity?: number;
  agmRuleWeight?: number;
  agmResourceTag?: string;
};
export type LegacyProvinceSummaryItem = {
  id: number;
  name: string;
  fullName?: string;
  type?: string;
  state?: number;
  burg?: number;
  center?: number;
  color?: string;
};
export type LegacyRouteSummaryItem = {
  id: number;
  group?: string;
  feature?: number;
  pointCount?: number;
};
export type LegacyWorldResourceSummary = {
  biomes: LegacyBiomeSummaryItem[];
  provinces: LegacyProvinceSummaryItem[];
  routes: LegacyRouteSummaryItem[];
};
export type LegacyFocusTarget = {
  targetType: "state" | "province" | "burg" | "biome";
  targetId: number;
  sourceLabel: string;
  action?: "focus" | "fix" | "adjust";
};
export type LegacyFocusGeometry = LegacyFocusTarget & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};
export type LegacyAutoFixPreviewChange = {
  id: string;
  operation: "create" | "update" | "link";
  entity: "state" | "province" | "burg" | "route" | "biome";
  summary: string;
  refs: Record<string, number[]>;
  fields?: Record<string, string | number | boolean | null>;
};
export type LegacyAutoFixWritebackResult = {
  createdBurgIds: number[];
  createdRouteIds: number[];
  updatedBiomes: {biomeId: number; previousHabitability: number | null; nextHabitability: number; previousAgmRuleWeight: number | null; nextAgmRuleWeight: number; previousAgmResourceTag: string | null; nextAgmResourceTag: string}[];
  updatedStates: {stateId: number; previousAgmFairStart: boolean | null; nextAgmFairStart: boolean; previousAgmFairStartScore: number | null; nextAgmFairStartScore: number; previousAgmPriority: string | null; nextAgmPriority: string}[];
  updatedProvinces: {provinceId: number; previousAgmConnectorTarget: number | null; nextAgmConnectorTarget: number; previousAgmConnectorType: string | null; nextAgmConnectorType: string}[];
};

type AgmWritableBurg = {name?: string; state?: number; agmRole?: string; agmPriority?: string; agmSupportState?: number; removed?: boolean} & Record<string, unknown>;
type AgmWritableBiomeData = {habitability: Record<number, number>; agmRuleWeight?: Record<number, number>; agmResourceTag?: Record<number, string>} & Record<string, unknown>;
type AgmWritableProvince = {agmConnectorTarget?: number; agmConnectorType?: string; removed?: boolean} & Record<string, unknown>;

type DataAction =
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
type ProjectAction = "seed-history" | "copy-seed-url" | "restore-default-canvas-size";
type TopbarAction = "new" | "open" | "save" | "export";
export type LegacyProjectSummary = {
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
  availableCultureSets: {value: string; label: string; max: string}[];
  pendingTemplate: string;
  pendingTemplateLabel: string;
  availableTemplates: {value: string; label: string}[];
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
type LegacyDocumentSourceSummary = {
  sourceLabel: string;
  sourceDetail: string;
};
type LegacySaveTargetSummary = {
  saveLabel: string;
  saveDetail: string;
};
declare const ldb:
  | {
      get: (key: string) => Promise<unknown>;
    }
  | undefined;
const EDITOR_DIALOG_IDS = {
  editStates: "statesEditor",
  editCultures: "culturesEditor",
  editReligions: "religionsEditor",
  editBiomes: "biomesEditor",
  editProvinces: "provincesEditor",
  editZones: "zonesEditor",
  editDiplomacy: "diplomacyEditor",
} satisfies Record<EditorAction, string>;


declare global {
  interface Window {
    [key: string]: unknown;
  }
}

type LegacyDocumentSourceTracker = {
  quickLoadWrapped?: typeof window.quickLoad;
  loadFromDropboxWrapped?: typeof window.loadFromDropbox;
  loadMapFromURLWrapped?: typeof window.loadMapFromURL;
  uploadMapWrapped?: typeof window.uploadMap;
  generateMapOnLoadWrapped?: typeof window.generateMapOnLoad;
  saveMapWrapped?: typeof window.saveMap;
};

function getLegacyDocumentSourceStore() {
  return globalThis as typeof globalThis & {
    __studioLegacyDocumentSourceSummary?: LegacyDocumentSourceSummary;
    __studioLegacyPendingDocumentSource?: LegacyDocumentSourceSummary | null;
    __studioLegacyLastSaveTarget?: LegacySaveTargetSummary;
    __studioLegacyDocumentSourceTracker?: LegacyDocumentSourceTracker;
  };
}

function queueLegacyDocumentSource(summary: LegacyDocumentSourceSummary) {
  const store = getLegacyDocumentSourceStore();
  store.__studioLegacyPendingDocumentSource = summary;
}

function setLegacyDocumentSourceSummary(summary: LegacyDocumentSourceSummary) {
  const store = getLegacyDocumentSourceStore();
  store.__studioLegacyDocumentSourceSummary = summary;
  store.__studioLegacyPendingDocumentSource = null;
}

function getLegacyMapFileName() {
  const mapName = window.mapName?.value?.trim();
  return mapName ? `${mapName}.map` : "Current map";
}

function setLegacySaveTargetSummary(summary: LegacySaveTargetSummary) {
  getLegacyDocumentSourceStore().__studioLegacyLastSaveTarget = summary;
}

function getLegacySaveTargetSummary() {
  return getLegacyDocumentSourceStore().__studioLegacyLastSaveTarget || {
    saveLabel: "Not saved yet",
    saveDetail: "—",
  };
}

function getLegacySaveTargetSummaryForMethod(method: "storage" | "machine" | "dropbox") {
  const filename = getLegacyMapFileName();
  if (method === "storage") {
    return {
      saveLabel: "Browser snapshot",
      saveDetail: filename,
    } satisfies LegacySaveTargetSummary;
  }
  if (method === "machine") {
    return {
      saveLabel: "Downloads",
      saveDetail: filename,
    } satisfies LegacySaveTargetSummary;
  }
  return {
    saveLabel: "Dropbox",
    saveDetail: filename,
  } satisfies LegacySaveTargetSummary;
}

function formatLegacySourceUrl(maplink: string) {
  try {
    const url = new URL(decodeURIComponent(maplink));
    return `${url.host}${url.pathname}`;
  } catch {
    return decodeURIComponent(maplink);
  }
}

function inferLegacyDocumentSourceFromUpload(file: Blob | File): LegacyDocumentSourceSummary | null {
  if (file && typeof file === "object" && "name" in file && typeof file.name === "string" && file.name) {
    return {
      sourceLabel: "Local file",
      sourceDetail: file.name,
    };
  }

  return null;
}

function getLegacyDocumentSourceSummary() {
  return getLegacyDocumentSourceStore().__studioLegacyDocumentSourceSummary || {
    sourceLabel: "Generated",
    sourceDetail: "Current settings",
  };
}

function ensureLegacyDocumentSourceTracking() {
  const store = getLegacyDocumentSourceStore();
  const tracker = (store.__studioLegacyDocumentSourceTracker ??= {});

  if (typeof window.quickLoad === "function" && tracker.quickLoadWrapped !== window.quickLoad) {
    const originalQuickLoad = window.quickLoad;
    const wrappedQuickLoad: typeof window.quickLoad = async () => {
      queueLegacyDocumentSource({sourceLabel: "Browser snapshot", sourceDetail: "Quick load"});
      try {
        return await originalQuickLoad();
      } finally {
        const pendingSource = store.__studioLegacyPendingDocumentSource;
        if (pendingSource) setLegacyDocumentSourceSummary(pendingSource);
      }
    };
    tracker.quickLoadWrapped = wrappedQuickLoad;
    window.quickLoad = wrappedQuickLoad;
  }

  if (typeof window.loadFromDropbox === "function" && tracker.loadFromDropboxWrapped !== window.loadFromDropbox) {
    const originalLoadFromDropbox = window.loadFromDropbox;
    const wrappedLoadFromDropbox: typeof window.loadFromDropbox = async () => {
      const dropboxSelect = document.getElementById("loadFromDropboxSelect") as HTMLSelectElement | null;
      const selectedOption = dropboxSelect?.selectedOptions?.[0] ?? null;
      queueLegacyDocumentSource({
        sourceLabel: "Dropbox",
        sourceDetail: selectedOption?.textContent?.trim() || dropboxSelect?.value || "Selected file",
      });
      try {
        return await originalLoadFromDropbox();
      } finally {
        const pendingSource = store.__studioLegacyPendingDocumentSource;
        if (pendingSource) setLegacyDocumentSourceSummary(pendingSource);
      }
    };
    tracker.loadFromDropboxWrapped = wrappedLoadFromDropbox;
    window.loadFromDropbox = wrappedLoadFromDropbox;
  }

  if (typeof window.loadMapFromURL === "function" && tracker.loadMapFromURLWrapped !== window.loadMapFromURL) {
    const originalLoadMapFromURL = window.loadMapFromURL;
    const wrappedLoadMapFromURL: typeof window.loadMapFromURL = (maplink, random) => {
      queueLegacyDocumentSource({sourceLabel: "URL", sourceDetail: formatLegacySourceUrl(maplink)});
      try {
        return originalLoadMapFromURL(maplink, random);
      } finally {
        const pendingSource = store.__studioLegacyPendingDocumentSource;
        if (pendingSource) setLegacyDocumentSourceSummary(pendingSource);
      }
    };
    tracker.loadMapFromURLWrapped = wrappedLoadMapFromURL;
    window.loadMapFromURL = wrappedLoadMapFromURL;
  }

  if (typeof window.uploadMap === "function" && tracker.uploadMapWrapped !== window.uploadMap) {
    const originalUploadMap = window.uploadMap;
    const wrappedUploadMap: typeof window.uploadMap = (file, callback) => {
      const inferredSource = inferLegacyDocumentSourceFromUpload(file);
      const pendingSource = store.__studioLegacyPendingDocumentSource;
      const nextSource = inferredSource || pendingSource;
      if (nextSource) setLegacyDocumentSourceSummary(nextSource);
      return originalUploadMap(file, callback);
    };
    tracker.uploadMapWrapped = wrappedUploadMap;
    window.uploadMap = wrappedUploadMap;
  }

  if (typeof window.generateMapOnLoad === "function" && tracker.generateMapOnLoadWrapped !== window.generateMapOnLoad) {
    const originalGenerateMapOnLoad = window.generateMapOnLoad;
    const wrappedGenerateMapOnLoad: typeof window.generateMapOnLoad = async () => {
      const result = await originalGenerateMapOnLoad();
      setLegacyDocumentSourceSummary({sourceLabel: "Generated", sourceDetail: "Current settings"});
      return result;
    };
    tracker.generateMapOnLoadWrapped = wrappedGenerateMapOnLoad;
    window.generateMapOnLoad = wrappedGenerateMapOnLoad;
  }

  if (typeof window.saveMap === "function" && tracker.saveMapWrapped !== window.saveMap) {
    const originalSaveMap = window.saveMap;
    const wrappedSaveMap: typeof window.saveMap = async method => {
      const result = await originalSaveMap(method);
      setLegacySaveTargetSummary(getLegacySaveTargetSummaryForMethod(method));
      return result;
    };
    tracker.saveMapWrapped = wrappedSaveMap;
    window.saveMap = wrappedSaveMap;
  }
}

function averageCellPoints(cellIds: number[]) {
  const points = cellIds.map(cellId => globalThis.pack?.cells?.p?.[cellId]).filter((point): point is [number, number] => Array.isArray(point));
  if (!points.length) return null;

  return points.reduce(
    (sum, [x, y]) => ({x: sum.x + x, y: sum.y + y}),
    {x: 0, y: 0},
  );
}

function normalizeFocusGeometry(target: LegacyFocusTarget, x: number | undefined, y: number | undefined): LegacyFocusGeometry {
  const width = finiteNumberOrUndefined(globalThis.graphWidth) || finiteNumberOrUndefined(globalThis.svgWidth) || 1;
  const height = finiteNumberOrUndefined(globalThis.graphHeight) || finiteNumberOrUndefined(globalThis.svgHeight) || 1;
  if (x === undefined || y === undefined) return target;

  return {
    ...target,
    x: Math.max(0, Math.min(100, (x / width) * 100)),
    y: Math.max(0, Math.min(100, (y / height) * 100)),
    width,
    height,
  };
}

function resolveStateFocusGeometry(target: LegacyFocusTarget) {
  const state = globalThis.pack?.states?.[target.targetId];
  const center = finiteNumberOrUndefined(state?.center);
  const capital = finiteNumberOrUndefined(state?.capital);
  const capitalBurg = capital === undefined ? undefined : globalThis.pack?.burgs?.[capital];
  const cellPoint = center === undefined ? undefined : globalThis.pack?.cells?.p?.[center];
  if (cellPoint) return normalizeFocusGeometry(target, cellPoint[0], cellPoint[1]);
  if (finiteNumberOrUndefined(capitalBurg?.x) !== undefined && finiteNumberOrUndefined(capitalBurg?.y) !== undefined) return normalizeFocusGeometry(target, capitalBurg!.x, capitalBurg!.y);

  const cellIds = Array.from(globalThis.pack?.cells?.i || []).filter(cellId => globalThis.pack?.cells?.state?.[cellId] === target.targetId);
  const sum = averageCellPoints(cellIds);
  return sum ? normalizeFocusGeometry(target, sum.x / cellIds.length, sum.y / cellIds.length) : target;
}

function resolveProvinceFocusGeometry(target: LegacyFocusTarget) {
  const province = globalThis.pack?.provinces?.[target.targetId];
  const center = finiteNumberOrUndefined(province?.center);
  const burg = finiteNumberOrUndefined(province?.burg);
  const provinceBurg = burg === undefined ? undefined : globalThis.pack?.burgs?.[burg];
  const cellPoint = center === undefined ? undefined : globalThis.pack?.cells?.p?.[center];
  if (cellPoint) return normalizeFocusGeometry(target, cellPoint[0], cellPoint[1]);
  if (finiteNumberOrUndefined(provinceBurg?.x) !== undefined && finiteNumberOrUndefined(provinceBurg?.y) !== undefined) return normalizeFocusGeometry(target, provinceBurg!.x, provinceBurg!.y);

  const cellIds = Array.from(globalThis.pack?.cells?.i || []).filter(cellId => globalThis.pack?.cells?.province?.[cellId] === target.targetId);
  const sum = averageCellPoints(cellIds);
  return sum ? normalizeFocusGeometry(target, sum.x / cellIds.length, sum.y / cellIds.length) : target;
}

function resolveBurgFocusGeometry(target: LegacyFocusTarget) {
  const burg = globalThis.pack?.burgs?.[target.targetId];
  const x = finiteNumberOrUndefined(burg?.x);
  const y = finiteNumberOrUndefined(burg?.y);
  if (x !== undefined && y !== undefined) return normalizeFocusGeometry(target, x, y);

  const cell = finiteNumberOrUndefined(burg?.cell);
  const cellPoint = cell === undefined ? undefined : globalThis.pack?.cells?.p?.[cell];
  return cellPoint ? normalizeFocusGeometry(target, cellPoint[0], cellPoint[1]) : target;
}

function resolveBiomeFocusGeometry(target: LegacyFocusTarget) {
  const cellIds = Array.from(globalThis.pack?.cells?.i || []).filter(cellId => globalThis.pack?.cells?.biome?.[cellId] === target.targetId).slice(0, 240);
  const sum = averageCellPoints(cellIds);
  return sum ? normalizeFocusGeometry(target, sum.x / cellIds.length, sum.y / cellIds.length) : target;
}

export function resolveLegacyFocusGeometry(target: LegacyFocusTarget): LegacyFocusGeometry {
  if (target.targetType === "state") return resolveStateFocusGeometry(target);
  if (target.targetType === "province") return resolveProvinceFocusGeometry(target);
  if (target.targetType === "burg") return resolveBurgFocusGeometry(target);
  return resolveBiomeFocusGeometry(target);
}

export function getLegacyLayerStates() {
  return Object.fromEntries(
    LAYER_ACTIONS.map(action => [action, typeof window[action] === "function" ? Boolean(window.layerIsOn?.(action)) : false]),
  ) as Record<LayerAction, boolean>;
}

export function getLegacyLayerDetails() {
  const list = document.getElementById("mapLayers");
  const states = getLegacyLayerStates();
  if (!list) return [];

  return Array.from(list.querySelectorAll<HTMLLIElement>("li[id^='toggle']")).map(item => ({
    id: item.id as LayerAction,
    label: item.textContent?.replace(/\s+/g, " ").trim() || item.id,
    shortcut: item.dataset.shortcut || "",
    pinned: item.classList.contains("solid"),
    active: states[item.id as LayerAction] ?? false,
  }));
}

function finiteNumberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function compactEntity(item: Record<string, unknown>): LegacyEntitySummaryItem | null {
  const id = finiteNumberOrUndefined(item.i);
  const name = stringOrUndefined(item.name);
  if (!id || !name || item.removed === true) return null;

  return {
    id,
    name,
    type: stringOrUndefined(item.type) || stringOrUndefined(item.form) || stringOrUndefined(item.formName),
    state: finiteNumberOrUndefined(item.state),
    culture: finiteNumberOrUndefined(item.culture),
    capital: finiteNumberOrUndefined(item.capital),
    population: finiteNumberOrUndefined(item.population),
    cells: finiteNumberOrUndefined(item.cells),
    color: stringOrUndefined(item.color),
  };
}

function summarizeEntities(value: unknown, limit = 24) {
  if (!Array.isArray(value)) return [];
  return value.map(item => (item && typeof item === "object" && !Array.isArray(item) ? compactEntity(item as Record<string, unknown>) : null)).filter(item => item !== null).slice(0, limit);
}

function getLegacyBiomeData() {
  const data = globalThis.biomesData || globalThis.Biomes?.getDefault?.();
  if (data && !globalThis.biomesData) globalThis.biomesData = data;
  return data;
}

function summarizeBiomes(): LegacyBiomeSummaryItem[] {
  const data = getLegacyBiomeData() as (AgmWritableBiomeData & {i: number[]; name: Record<number, string>; color: Record<number, string>; cost: Record<number, number>; iconsDensity: Record<number, number>}) | undefined;
  if (!data) return [];

  return data.i.map(id => ({
    id,
    name: data.name[id],
    color: data.color[id],
    habitability: finiteNumberOrUndefined(data.habitability[id]),
    movementCost: finiteNumberOrUndefined(data.cost[id]),
    iconDensity: finiteNumberOrUndefined(data.iconsDensity[id]),
    agmRuleWeight: finiteNumberOrUndefined(data.agmRuleWeight?.[id]),
    agmResourceTag: stringOrUndefined(data.agmResourceTag?.[id]),
  })).filter(item => item.name);
}

function compactProvince(item: Record<string, unknown>): LegacyProvinceSummaryItem | null {
  const id = finiteNumberOrUndefined(item.i);
  const name = stringOrUndefined(item.name);
  if (!id || !name || item.removed === true) return null;

  return {
    id,
    name,
    fullName: stringOrUndefined(item.fullName),
    type: stringOrUndefined(item.formName) || stringOrUndefined(item.type),
    state: finiteNumberOrUndefined(item.state),
    burg: finiteNumberOrUndefined(item.burg),
    center: finiteNumberOrUndefined(item.center),
    color: stringOrUndefined(item.color),
  };
}

function summarizeProvinces(value: unknown, limit = 24) {
  if (!Array.isArray(value)) return [];
  return value.map(item => (item && typeof item === "object" && !Array.isArray(item) ? compactProvince(item as Record<string, unknown>) : null)).filter(item => item !== null).slice(0, limit);
}

function compactRoute(item: Record<string, unknown>): LegacyRouteSummaryItem | null {
  const id = finiteNumberOrUndefined(item.i);
  if (id === undefined) return null;

  return {
    id,
    group: stringOrUndefined(item.group),
    feature: finiteNumberOrUndefined(item.feature),
    pointCount: Array.isArray(item.points) ? item.points.length : undefined,
  };
}

function summarizeRoutes(value: unknown, limit = 24) {
  if (!Array.isArray(value)) return [];
  return value.map(item => (item && typeof item === "object" && !Array.isArray(item) ? compactRoute(item as Record<string, unknown>) : null)).filter(item => item !== null).slice(0, limit);
}

export function getLegacyWorldResourceSummary(): LegacyWorldResourceSummary {
  const legacyPack = globalThis.pack;
  return {
    biomes: summarizeBiomes(),
    provinces: summarizeProvinces(legacyPack?.provinces),
    routes: summarizeRoutes(legacyPack?.routes),
  };
}

export function getLegacyEntitySummary(): LegacyEntitySummary {
  const legacyPack = globalThis.pack;
  return {
    states: summarizeEntities(legacyPack?.states),
    burgs: summarizeEntities(legacyPack?.burgs),
    cultures: summarizeEntities(legacyPack?.cultures),
    religions: summarizeEntities(legacyPack?.religions),
  };
}

function resolveAgmSettlementWritebackPoint(change: LegacyAutoFixPreviewChange) {
  const stateId = change.refs.states?.[0];
  if (stateId !== undefined) {
    const existingStateBurg = globalThis.pack?.burgs?.find(burg => burg && !burg.removed && burg.state === stateId && typeof burg.x === "number" && typeof burg.y === "number");
    if (existingStateBurg) return {x: existingStateBurg.x, y: existingStateBurg.y};
    const stateCells = Array.from(globalThis.pack?.cells?.i || []).filter(cellId => globalThis.pack?.cells?.state?.[cellId] === stateId);
    const stateCenterCell = stateCells[Math.floor(stateCells.length / 2)];
    const statePoint = stateCenterCell === undefined ? undefined : globalThis.pack?.cells?.p?.[stateCenterCell];
    if (statePoint) return {x: statePoint[0], y: statePoint[1]};
  }

  const provinceId = change.refs.provinces?.[0];
  const province = provinceId === undefined ? undefined : globalThis.pack?.provinces?.[provinceId];
  const provincePoint = province?.center === undefined ? undefined : globalThis.pack?.cells?.p?.[province.center];
  if (provincePoint) return {x: provincePoint[0], y: provincePoint[1]};
  return null;
}

export function applyLegacySettlementPreviewChanges(changes: LegacyAutoFixPreviewChange[]): LegacyAutoFixWritebackResult {
  const createdBurgIds: number[] = [];
  const createdRouteIds: number[] = [];
  const updatedBiomes: LegacyAutoFixWritebackResult["updatedBiomes"] = [];
  const updatedStates: LegacyAutoFixWritebackResult["updatedStates"] = [];
  const updatedProvinces: LegacyAutoFixWritebackResult["updatedProvinces"] = [];
  const burgs = globalThis.Burgs as {add?: (point: [number, number]) => number; remove?: (burgId: number) => void} | undefined;
  const addBurg = burgs?.add?.bind(burgs);
  if (typeof addBurg !== "function") return {createdBurgIds, createdRouteIds, updatedBiomes, updatedStates, updatedProvinces};

  changes.forEach(change => {
    if (change.operation !== "create" || change.entity !== "burg") return;
    const point = resolveAgmSettlementWritebackPoint(change);
    if (!point) return;
    const burgId = addBurg([point.x, point.y]);
    const burg = globalThis.pack?.burgs?.[burgId] as unknown as AgmWritableBurg | undefined;
    const provisionalName = change.fields?.provisionalName;
    const agmRole = change.fields?.agmRole;
    const agmPriority = change.fields?.priority;
    const agmSupportState = change.fields?.agmSupportState;
    if (burg && typeof provisionalName === "string") burg.name = provisionalName;
    if (burg && typeof agmRole === "string") burg.agmRole = agmRole;
    if (burg && typeof agmPriority === "string") burg.agmPriority = agmPriority;
    if (burg && typeof agmSupportState === "number" && Number.isFinite(agmSupportState)) burg.agmSupportState = agmSupportState;
    if (typeof burgId === "number" && Number.isFinite(burgId)) createdBurgIds.push(burgId);
  });

  return {createdBurgIds, createdRouteIds, updatedBiomes, updatedStates, updatedProvinces};
}

function resolveAgmRouteProvinceCell(provinceId: number | undefined) {
  const cells = globalThis.pack?.cells;
  const province = provinceId === undefined ? undefined : globalThis.pack?.provinces?.[provinceId];
  if (!cells || !province) return undefined;

  const provinceCells = Array.from(cells.i || []).filter(cellId => cells.province?.[cellId] === provinceId && (cells.h?.[cellId] ?? 0) >= 20);
  const disconnectedCell = provinceCells.find(cellId => !cells.routes?.[cellId] || Object.keys(cells.routes[cellId]).length === 0);
  if (disconnectedCell !== undefined) return disconnectedCell;
  if (province.center !== undefined && (cells.h?.[province.center] ?? 0) >= 20) return province.center;
  return provinceCells[Math.floor(provinceCells.length / 2)];
}

function resolveAgmRouteWritebackCell(change: LegacyAutoFixPreviewChange) {
  const fromProvince = change.fields?.fromProvince;
  const toProvince = change.fields?.toProvince;
  const provinceIds = [fromProvince, toProvince, ...(change.refs.provinces || [])].filter((id): id is number => typeof id === "number" && Number.isFinite(id));

  for (const provinceId of provinceIds) {
    const cellId = resolveAgmRouteProvinceCell(provinceId);
    if (cellId !== undefined) return cellId;
  }

  const stateId = change.refs.states?.[0];
  if (stateId !== undefined) {
    const cells = globalThis.pack?.cells;
    const stateCells = Array.from(cells?.i || []).filter(cellId => cells?.state?.[cellId] === stateId && (cells?.h?.[cellId] ?? 0) >= 20);
    const disconnectedCell = stateCells.find(cellId => !cells?.routes?.[cellId] || Object.keys(cells.routes[cellId]).length === 0);
    return disconnectedCell ?? stateCells[Math.floor(stateCells.length / 2)];
  }

  return undefined;
}

export function applyLegacyRoutePreviewChanges(changes: LegacyAutoFixPreviewChange[]): LegacyAutoFixWritebackResult {
  const createdBurgIds: number[] = [];
  const createdRouteIds: number[] = [];
  const updatedBiomes: LegacyAutoFixWritebackResult["updatedBiomes"] = [];
  const updatedStates: LegacyAutoFixWritebackResult["updatedStates"] = [];
  const updatedProvinces: LegacyAutoFixWritebackResult["updatedProvinces"] = [];
  const routes = globalThis.Routes as {connect?: (cellId: number) => {i?: number} | undefined} | undefined;
  const connectRoute = routes?.connect?.bind(routes);
  if (typeof connectRoute !== "function") return {createdBurgIds, createdRouteIds, updatedBiomes, updatedStates, updatedProvinces};

  changes.forEach(change => {
    if (change.operation !== "link" || change.entity !== "route") return;
    const cellId = resolveAgmRouteWritebackCell(change);
    if (typeof cellId !== "number" || !Number.isFinite(cellId)) return;
    const route = connectRoute(cellId);
    if (route && typeof route.i === "number" && Number.isFinite(route.i)) {
      createdRouteIds.push(route.i);
      if (globalThis.layerIsOn?.("toggleRoutes")) globalThis.drawRoute?.(route);
    }

    const fromProvince = change.fields?.fromProvince;
    const toProvince = change.fields?.toProvince;
    const nextAgmConnectorType = change.fields?.connectorType;
    if (typeof fromProvince !== "number" || !Number.isFinite(fromProvince) || typeof toProvince !== "number" || !Number.isFinite(toProvince) || typeof nextAgmConnectorType !== "string") return;
    const province = globalThis.pack?.provinces?.[fromProvince] as unknown as AgmWritableProvince | undefined;
    if (!province || province.removed) return;
    const previousAgmConnectorTarget = typeof province.agmConnectorTarget === "number" && Number.isFinite(province.agmConnectorTarget) ? province.agmConnectorTarget : null;
    const previousAgmConnectorType = typeof province.agmConnectorType === "string" ? province.agmConnectorType : null;
    province.agmConnectorTarget = toProvince;
    province.agmConnectorType = nextAgmConnectorType;
    updatedProvinces.push({provinceId: fromProvince, previousAgmConnectorTarget, nextAgmConnectorTarget: toProvince, previousAgmConnectorType, nextAgmConnectorType});
  });

  return {createdBurgIds, createdRouteIds, updatedBiomes, updatedStates, updatedProvinces};
}

export function applyLegacyBiomePreviewChanges(changes: LegacyAutoFixPreviewChange[]): LegacyAutoFixWritebackResult {
  const createdBurgIds: number[] = [];
  const createdRouteIds: number[] = [];
  const updatedBiomes: LegacyAutoFixWritebackResult["updatedBiomes"] = [];
  const updatedStates: LegacyAutoFixWritebackResult["updatedStates"] = [];
  const updatedProvinces: LegacyAutoFixWritebackResult["updatedProvinces"] = [];
  const biomeData = getLegacyBiomeData() as AgmWritableBiomeData | undefined;
  if (!biomeData?.habitability) return {createdBurgIds, createdRouteIds, updatedBiomes, updatedStates, updatedProvinces};
  biomeData.agmRuleWeight ||= {};
  biomeData.agmResourceTag ||= {};
  const agmRuleWeight = biomeData.agmRuleWeight;
  const agmResourceTag = biomeData.agmResourceTag;

  changes.forEach(change => {
    if (change.operation !== "update" || change.entity !== "biome") return;
    const biomeId = change.refs.biomes?.[0];
    const nextHabitability = change.fields?.habitability;
    const nextAgmRuleWeight = change.fields?.agmRuleWeight;
    const nextAgmResourceTag = change.fields?.agmResourceTag;
    if (typeof biomeId !== "number" || !Number.isFinite(biomeId) || typeof nextHabitability !== "number" || !Number.isFinite(nextHabitability) || typeof nextAgmRuleWeight !== "number" || !Number.isFinite(nextAgmRuleWeight) || typeof nextAgmResourceTag !== "string") return;
    const previousHabitability = biomeData.habitability[biomeId];
    const previousAgmRuleWeight = agmRuleWeight[biomeId];
    const previousAgmResourceTag = agmResourceTag[biomeId];
    biomeData.habitability[biomeId] = nextHabitability;
    agmRuleWeight[biomeId] = nextAgmRuleWeight;
    agmResourceTag[biomeId] = nextAgmResourceTag;
    updatedBiomes.push({
      biomeId,
      previousHabitability: typeof previousHabitability === "number" && Number.isFinite(previousHabitability) ? previousHabitability : null,
      nextHabitability,
      previousAgmRuleWeight: typeof previousAgmRuleWeight === "number" && Number.isFinite(previousAgmRuleWeight) ? previousAgmRuleWeight : null,
      nextAgmRuleWeight,
      previousAgmResourceTag: typeof previousAgmResourceTag === "string" ? previousAgmResourceTag : null,
      nextAgmResourceTag,
    });
  });

  return {createdBurgIds, createdRouteIds, updatedBiomes, updatedStates, updatedProvinces};
}

export function applyLegacyStatePreviewChanges(changes: LegacyAutoFixPreviewChange[]): LegacyAutoFixWritebackResult {
  const createdBurgIds: number[] = [];
  const createdRouteIds: number[] = [];
  const updatedBiomes: LegacyAutoFixWritebackResult["updatedBiomes"] = [];
  const updatedStates: LegacyAutoFixWritebackResult["updatedStates"] = [];
  const updatedProvinces: LegacyAutoFixWritebackResult["updatedProvinces"] = [];

  changes.forEach(change => {
    if (change.operation !== "update" || change.entity !== "state") return;
    const stateId = change.refs.states?.[0];
    const nextAgmFairStart = change.fields?.agmFairStart;
    const nextAgmFairStartScore = change.fields?.agmFairStartScore;
    const nextAgmPriority = change.fields?.agmPriority;
    if (typeof stateId !== "number" || !Number.isFinite(stateId) || typeof nextAgmFairStart !== "boolean" || typeof nextAgmFairStartScore !== "number" || !Number.isFinite(nextAgmFairStartScore) || typeof nextAgmPriority !== "string") return;
    const state = globalThis.pack?.states?.[stateId] as unknown as ({agmFairStart?: boolean; agmFairStartScore?: number; agmPriority?: string; removed?: boolean} & Record<string, unknown>) | undefined;
    if (!state || state.removed) return;
    const previousAgmFairStart = typeof state.agmFairStart === "boolean" ? state.agmFairStart : null;
    const previousAgmFairStartScore = typeof state.agmFairStartScore === "number" && Number.isFinite(state.agmFairStartScore) ? state.agmFairStartScore : null;
    const previousAgmPriority = typeof state.agmPriority === "string" ? state.agmPriority : null;
    state.agmFairStart = nextAgmFairStart;
    state.agmFairStartScore = nextAgmFairStartScore;
    state.agmPriority = nextAgmPriority;
    updatedStates.push({stateId, previousAgmFairStart, nextAgmFairStart, previousAgmFairStartScore, nextAgmFairStartScore, previousAgmPriority, nextAgmPriority});
  });

  return {createdBurgIds, createdRouteIds, updatedBiomes, updatedStates, updatedProvinces};
}

export function undoLegacyAutoFixWriteback(writeback: LegacyAutoFixWritebackResult | undefined) {
  writeback?.updatedProvinces.slice().reverse().forEach(entry => {
    const province = globalThis.pack?.provinces?.[entry.provinceId] as unknown as AgmWritableProvince | undefined;
    if (!province || province.removed) return;
    if (entry.previousAgmConnectorTarget === null) delete province.agmConnectorTarget;
    else province.agmConnectorTarget = entry.previousAgmConnectorTarget;
    if (entry.previousAgmConnectorType === null) delete province.agmConnectorType;
    else province.agmConnectorType = entry.previousAgmConnectorType;
  });

  writeback?.updatedStates.slice().reverse().forEach(entry => {
    const state = globalThis.pack?.states?.[entry.stateId] as unknown as ({agmFairStart?: boolean; agmFairStartScore?: number; agmPriority?: string; removed?: boolean} & Record<string, unknown>) | undefined;
    if (!state || state.removed) return;
    if (entry.previousAgmFairStart === null) delete state.agmFairStart;
    else state.agmFairStart = entry.previousAgmFairStart;
    if (entry.previousAgmFairStartScore === null) delete state.agmFairStartScore;
    else state.agmFairStartScore = entry.previousAgmFairStartScore;
    if (entry.previousAgmPriority === null) delete state.agmPriority;
    else state.agmPriority = entry.previousAgmPriority;
  });

  const biomeData = getLegacyBiomeData() as AgmWritableBiomeData | undefined;
  if (biomeData?.habitability) {
    writeback?.updatedBiomes.slice().reverse().forEach(entry => {
      biomeData.habitability[entry.biomeId] = entry.previousHabitability ?? 0;
      if (entry.previousAgmRuleWeight === null) delete biomeData.agmRuleWeight?.[entry.biomeId];
      else (biomeData.agmRuleWeight ||= {})[entry.biomeId] = entry.previousAgmRuleWeight;
      if (entry.previousAgmResourceTag === null) delete biomeData.agmResourceTag?.[entry.biomeId];
      else (biomeData.agmResourceTag ||= {})[entry.biomeId] = entry.previousAgmResourceTag;
    });
  }

  const routes = globalThis.Routes as {remove?: (route: unknown) => void} | undefined;
  const removeRoute = routes?.remove?.bind(routes);
  if (typeof removeRoute === "function") {
    writeback?.createdRouteIds.slice().reverse().forEach(routeId => {
      const route = globalThis.pack?.routes?.find(item => item?.i === routeId);
      if (route) removeRoute(route);
    });
  }

  const burgs = globalThis.Burgs as {remove?: (burgId: number) => void} | undefined;
  const removeBurg = burgs?.remove?.bind(burgs);
  if (typeof removeBurg !== "function") return;
  writeback?.createdBurgIds.slice().reverse().forEach(burgId => removeBurg(burgId));
}

export function toggleLegacyLayer(action: LayerAction) {
  const handler = window[action];
  if (typeof handler === "function") handler();
}

export function getLegacyEditorAvailability() {
  return Object.fromEntries(EDITOR_ACTIONS.map(action => [action, typeof window[action] === "function"])) as Record<EditorAction, boolean>;
}

export function getLegacyEditorDialogId(action: EditorAction) {
  return EDITOR_DIALOG_IDS[action];
}

function isElementVisible(element: HTMLElement) {
  if (element.hidden) return false;
  if (element.offsetParent === null) return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

export function isLegacyEditorOpen(action: EditorAction) {
  const dialogId = getLegacyEditorDialogId(action);
  const dialog = document.getElementById(dialogId);
  if (!dialog) return false;
  return isElementVisible(dialog);
}

export function getOpenLegacyEditor() {
  return EDITOR_ACTIONS.find(isLegacyEditorOpen) ?? null;
}

export function syncLegacyEditorState() {
  const activeEditor = getOpenLegacyEditor();
  return {
    activeEditor,
    editorDialogOpen: Boolean(activeEditor),
  };
}

export function closeLegacyEditor(action: EditorAction) {
  const dialogId = getLegacyEditorDialogId(action);
  const dialog = document.getElementById(dialogId);
  if (!dialog) return;

  const wrapper = dialog.closest(".ui-dialog");
  if (!wrapper) return;

  const jquery = window.$;
  if (typeof jquery === "function") {
    const instance = jquery(dialog).data("ui-dialog");
    if (instance) {
      jquery(dialog).dialog("close");
      return;
    }
  }

  const closeButton = wrapper.querySelector<HTMLButtonElement>(".ui-dialog-titlebar-close");
  closeButton?.click();
}

export async function openLegacyEditor(action: EditorAction) {
  EDITOR_ACTIONS.filter(editorAction => editorAction !== action).forEach(closeLegacyEditor);

  const handler = window[action];
  if (typeof handler === "function") await handler();
}

export function getLegacyDataActions() {
  ensureLegacyDocumentSourceTracking();
  const documentSource = getLegacyDocumentSourceSummary();
  const saveTarget = getLegacySaveTargetSummary();
  const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
  const dropboxConnectButton = document.getElementById("dropboxConnectButton") as HTMLButtonElement | null;
  const dropboxSelect = document.getElementById("loadFromDropboxSelect") as HTMLSelectElement | null;
  const dropboxButtons = document.getElementById("loadFromDropboxButtons") as HTMLDivElement | null;
  const sharableLinkContainer = document.getElementById("sharableLinkContainer") as HTMLDivElement | null;
  const sharableLink = document.getElementById("sharableLink") as HTMLAnchorElement | null;
  const selectedDropboxFile = dropboxSelect?.value || "";
  const selectedDropboxOption = dropboxSelect?.selectedOptions?.[0] ?? null;
  const selectedDropboxLabel = selectedDropboxOption?.textContent?.trim() || "";
  const dropboxConnected = Boolean(dropboxSelect && dropboxSelect.style.display !== "none");
  const hasDropboxSelection = Boolean(selectedDropboxFile);

  return {
    canQuickLoad: typeof window.quickLoad === "function",
    canSaveToStorage: typeof window.saveMap === "function",
    canSaveToMachine: typeof window.saveMap === "function",
    canSaveToDropbox: typeof window.saveMap === "function",
    canConnectDropbox: typeof window.connectToDropbox === "function" && Boolean(dropboxConnectButton),
    canLoadFromDropbox:
      typeof window.loadFromDropbox === "function" &&
      dropboxConnected &&
      hasDropboxSelection &&
      Boolean(dropboxButtons && dropboxButtons.style.display !== "none"),
    canShareDropbox:
      typeof window.createSharableDropboxLink === "function" &&
      dropboxConnected &&
      hasDropboxSelection &&
      Boolean(dropboxButtons && dropboxButtons.style.display !== "none"),
    hasDropboxSelection,
    dropboxConnected,
    selectedDropboxFile,
    selectedDropboxLabel,
    hasDropboxShareLink: Boolean(sharableLinkContainer && sharableLinkContainer.style.display !== "none"),
    dropboxShareUrl: sharableLink?.href || "",
    sourceLabel: documentSource.sourceLabel,
    sourceDetail: documentSource.sourceDetail,
    saveLabel: saveTarget.saveLabel,
    saveDetail: saveTarget.saveDetail,
    canCreateNew: typeof window.generateMapOnLoad === "function",
    canOpenFile: Boolean(fileInput),
    canLoadUrl: typeof window.loadURL === "function",
  };
}

export async function runLegacyDataAction(action: DataAction) {
  ensureLegacyDocumentSourceTracking();

  if (action === "quick-load" && typeof window.quickLoad === "function") {
    await window.quickLoad();
    setLegacyDocumentSourceSummary({sourceLabel: "Browser snapshot", sourceDetail: "Quick load"});
    return;
  }

  if (action === "save-storage" && typeof window.saveMap === "function") {
    await window.saveMap("storage");
    return;
  }

  if (action === "save-machine" && typeof window.saveMap === "function") {
    await window.saveMap("machine");
    return;
  }

  if (action === "save-dropbox" && typeof window.saveMap === "function") {
    await window.saveMap("dropbox");
    return;
  }

  if (action === "connect-dropbox" && typeof window.connectToDropbox === "function") {
    await window.connectToDropbox();
    return;
  }

  if (action === "load-dropbox" && typeof window.loadFromDropbox === "function") {
    const dropboxSelect = document.getElementById("loadFromDropboxSelect") as HTMLSelectElement | null;
    const selectedOption = dropboxSelect?.selectedOptions?.[0] ?? null;
    await window.loadFromDropbox();
    setLegacyDocumentSourceSummary({
      sourceLabel: "Dropbox",
      sourceDetail: selectedOption?.textContent?.trim() || dropboxSelect?.value || "Selected file",
    });
    return;
  }

  if (action === "share-dropbox" && typeof window.createSharableDropboxLink === "function") {
    await window.createSharableDropboxLink();
    return;
  }

  if (action === "new-map" && typeof window.generateMapOnLoad === "function") {
    await window.generateMapOnLoad();
    setLegacyDocumentSourceSummary({sourceLabel: "Generated", sourceDetail: "Current settings"});
    return;
  }

  if (action === "open-file") {
    const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
    fileInput?.click();
    return;
  }

  if (action === "load-url" && typeof window.loadURL === "function") {
    window.loadURL();
  }
}

export function setLegacyLayersPreset(preset: string) {
  const select = document.getElementById("layersPreset") as HTMLSelectElement | null;
  if (!select) return;
  select.value = preset;
  select.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyAutosaveInterval(value: number) {
  const nextValue = String(Math.max(0, Math.min(60, Math.trunc(value))));
  const output = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
  const input = document.getElementById("autosaveIntervalInput") as HTMLInputElement | null;
  if (output) {
    output.value = nextValue;
    output.dispatchEvent(new Event("change", {bubbles: true}));
    output.dispatchEvent(new Event("input", {bubbles: true}));
  }
  if (input) {
    input.value = nextValue;
    input.dispatchEvent(new Event("change", {bubbles: true}));
    input.dispatchEvent(new Event("input", {bubbles: true}));
  }
}

export function runLegacyLayersPresetAction(action: "save" | "remove") {
  const buttonId = action === "save" ? "savePresetButton" : "removePresetButton";
  const button = document.getElementById(buttonId) as HTMLButtonElement | null;
  button?.click();
}

export function runLegacyProjectAction(action: ProjectAction) {
  const buttonId = action === "seed-history" ? "optionsMapHistory" : action === "copy-seed-url" ? "optionsCopySeed" : "restoreDefaultCanvasSize";
  const button = document.getElementById(buttonId) as HTMLElement | null;
  button?.click();
}

export function setLegacyPendingSeed(seed: string) {
  const input = document.getElementById("optionsSeed") as HTMLInputElement | null;
  if (!input) return;
  input.value = seed;
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingPoints(value: number) {
  const input = document.getElementById("pointsInput") as HTMLInputElement | null;
  if (!input) return;
  const nextValue = String(Math.max(1, Math.min(13, Math.trunc(value))));
  input.value = nextValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingCultures(value: number) {
  const input = document.getElementById("culturesInput") as HTMLInputElement | null;
  if (!input) return;
  const max = Number(input.max || "0");
  const nextValue = String(Math.max(1, Math.min(max || Number.MAX_SAFE_INTEGER, Math.trunc(value))));
  input.value = nextValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingBurgs(value: number) {
  const input = document.getElementById("manorsInput") as HTMLInputElement | null;
  const output = document.getElementById("manorsOutput") as HTMLOutputElement | null;
  if (!input) return;
  const min = Number(input.min || "0");
  const max = Number(input.max || "1000");
  const nextValue = String(Math.max(min, Math.min(max || Number.MAX_SAFE_INTEGER, Math.trunc(value))));
  input.value = nextValue;
  if (output) output.value = nextValue === "1000" ? "auto" : nextValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingReligions(value: number) {
  const input = document.getElementById("religionsNumber") as HTMLInputElement | null;
  if (!input) return;
  const min = Number(input.min || "0");
  const max = Number(input.max || "50");
  const nextValue = String(Math.max(min, Math.min(max || Number.MAX_SAFE_INTEGER, Math.trunc(value))));
  input.value = nextValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingStates(value: number) {
  const input = document.getElementById("statesNumber") as HTMLInputElement | null;
  if (!input) return;
  const max = Number(input.max || "100");
  const nextValue = String(Math.max(0, Math.min(max || Number.MAX_SAFE_INTEGER, Math.trunc(value))));
  input.value = nextValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingProvincesRatio(value: number) {
  const input = document.getElementById("provincesRatio") as HTMLInputElement | null;
  if (!input) return;
  const min = Number(input.min || "0");
  const max = Number(input.max || "100");
  const nextValue = String(Math.max(min, Math.min(max || Number.MAX_SAFE_INTEGER, Math.trunc(value))));
  input.value = nextValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingSizeVariety(value: number) {
  const input = document.getElementById("sizeVariety") as HTMLInputElement | null;
  if (!input || !Number.isFinite(value)) return;
  const min = Number(input.min || "0");
  const max = Number(input.max || "10");
  const nextValue = String(Math.max(min, Math.min(max, Math.round(value * 10) / 10)));
  input.value = nextValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingGrowthRate(value: number) {
  const input = document.getElementById("growthRate") as HTMLInputElement | null;
  if (!input || !Number.isFinite(value)) return;
  const min = Number(input.min || "0.1");
  const max = Number(input.max || "2");
  const nextValue = String(Math.max(min, Math.min(max, Math.round(value * 10) / 10)));
  input.value = nextValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyTemperatureEquator(value: number) {
  const input = document.getElementById("temperatureEquatorInput") as HTMLInputElement | null;
  const output = document.getElementById("temperatureEquatorOutput") as HTMLInputElement | null;
  const fahrenheit = document.getElementById("temperatureEquatorF") as HTMLSpanElement | null;
  if (!input || !output || !Number.isFinite(value)) return;
  const min = Number(input.min || output.min || "-50");
  const max = Number(input.max || output.max || "50");
  const nextValue = String(Math.max(min, Math.min(max, Math.round(value))));
  input.value = nextValue;
  output.value = nextValue;

  const stored = input.dataset.stored || output.dataset.stored || "temperatureEquator";
  const lock = window.lock;
  if (typeof lock === "function") lock(stored);

  const optionsRef = window.options as {temperatureEquator?: number} | undefined;
  if (optionsRef) optionsRef.temperatureEquator = Number(nextValue);

  const convertTemperature = window.convertTemperature;
  if (fahrenheit && typeof convertTemperature === "function") {
    const converted = convertTemperature(Number(nextValue), "°F");
    fahrenheit.textContent = typeof converted === "string" || typeof converted === "number" ? String(converted) : fahrenheit.textContent || "";
  }

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  input.dispatchEvent(new Event("input", {bubbles: true}));
  output.dispatchEvent(new Event("input", {bubbles: true}));

  if (!shouldAutoApply) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    input.dispatchEvent(new Event("change", {bubbles: true}));
    output.dispatchEvent(new Event("change", {bubbles: true}));
    return;
  }

  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);

  input.dispatchEvent(new Event("change", {bubbles: true}));
  output.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyTemperatureNorthPole(value: number) {
  const input = document.getElementById("temperatureNorthPoleInput") as HTMLInputElement | null;
  const output = document.getElementById("temperatureNorthPoleOutput") as HTMLInputElement | null;
  const fahrenheit = document.getElementById("temperatureNorthPoleF") as HTMLSpanElement | null;
  if (!input || !output || !Number.isFinite(value)) return;
  const min = Number(input.min || output.min || "-50");
  const max = Number(input.max || output.max || "50");
  const nextValue = String(Math.max(min, Math.min(max, Math.round(value))));
  input.value = nextValue;
  output.value = nextValue;

  const stored = input.dataset.stored || output.dataset.stored || "temperatureNorthPole";
  const lock = window.lock;
  if (typeof lock === "function") lock(stored);

  const optionsRef = window.options as {temperatureNorthPole?: number} | undefined;
  if (optionsRef) optionsRef.temperatureNorthPole = Number(nextValue);

  const convertTemperature = window.convertTemperature;
  if (fahrenheit && typeof convertTemperature === "function") {
    const converted = convertTemperature(Number(nextValue), "°F");
    fahrenheit.textContent = typeof converted === "string" || typeof converted === "number" ? String(converted) : fahrenheit.textContent || "";
  }

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  input.dispatchEvent(new Event("input", {bubbles: true}));
  output.dispatchEvent(new Event("input", {bubbles: true}));

  if (!shouldAutoApply) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    input.dispatchEvent(new Event("change", {bubbles: true}));
    output.dispatchEvent(new Event("change", {bubbles: true}));
    return;
  }

  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);

  input.dispatchEvent(new Event("change", {bubbles: true}));
  output.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyTemperatureSouthPole(value: number) {
  const input = document.getElementById("temperatureSouthPoleInput") as HTMLInputElement | null;
  const output = document.getElementById("temperatureSouthPoleOutput") as HTMLInputElement | null;
  const fahrenheit = document.getElementById("temperatureSouthPoleF") as HTMLSpanElement | null;
  if (!input || !output || !Number.isFinite(value)) return;
  const min = Number(input.min || output.min || "-50");
  const max = Number(input.max || output.max || "50");
  const nextValue = String(Math.max(min, Math.min(max, Math.round(value))));
  input.value = nextValue;
  output.value = nextValue;

  const stored = input.dataset.stored || output.dataset.stored || "temperatureSouthPole";
  const lock = window.lock;
  if (typeof lock === "function") lock(stored);

  const optionsRef = window.options as {temperatureSouthPole?: number} | undefined;
  if (optionsRef) optionsRef.temperatureSouthPole = Number(nextValue);

  const convertTemperature = window.convertTemperature;
  if (fahrenheit && typeof convertTemperature === "function") {
    const converted = convertTemperature(Number(nextValue), "°F");
    fahrenheit.textContent = typeof converted === "string" || typeof converted === "number" ? String(converted) : fahrenheit.textContent || "";
  }

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  input.dispatchEvent(new Event("input", {bubbles: true}));
  output.dispatchEvent(new Event("input", {bubbles: true}));

  if (!shouldAutoApply) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    input.dispatchEvent(new Event("change", {bubbles: true}));
    output.dispatchEvent(new Event("change", {bubbles: true}));
    return;
  }

  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);

  input.dispatchEvent(new Event("change", {bubbles: true}));
  output.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyMapSize(value: number) {
  const input = document.getElementById("mapSizeInput") as HTMLInputElement | null;
  const output = document.getElementById("mapSizeOutput") as HTMLInputElement | null;
  if (!input || !output || !Number.isFinite(value)) return;
  const min = Number(input.min || output.min || "1");
  const max = Number(input.max || output.max || "100");
  const nextValue = String(Math.max(min, Math.min(max, Math.round(value * 10) / 10)));
  input.value = nextValue;
  output.value = nextValue;

  const stored = input.dataset.stored || output.dataset.stored || "mapSize";
  const lock = window.lock;
  if (typeof lock === "function") lock(stored);

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const updateGlobeTemperature = window.updateGlobeTemperature;
  const updateGlobePosition = window.updateGlobePosition;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  input.dispatchEvent(new Event("input", {bubbles: true}));
  output.dispatchEvent(new Event("input", {bubbles: true}));

  if (!shouldAutoApply) return;
  if (
    typeof updateGlobePosition !== "function" ||
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    input.dispatchEvent(new Event("change", {bubbles: true}));
    output.dispatchEvent(new Event("change", {bubbles: true}));
    return;
  }

  if (typeof updateGlobeTemperature === "function") updateGlobeTemperature();
  updateGlobePosition();
  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);

  input.dispatchEvent(new Event("change", {bubbles: true}));
  output.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyLatitude(value: number) {
  const input = document.getElementById("latitudeInput") as HTMLInputElement | null;
  const output = document.getElementById("latitudeOutput") as HTMLInputElement | null;
  if (!input || !output || !Number.isFinite(value)) return;
  const min = Number(input.min || output.min || "0");
  const max = Number(input.max || output.max || "100");
  const nextValue = String(Math.max(min, Math.min(max, Math.round(value * 10) / 10)));
  input.value = nextValue;
  output.value = nextValue;

  const stored = input.dataset.stored || output.dataset.stored || "latitude";
  const lock = window.lock;
  if (typeof lock === "function") lock(stored);

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const updateGlobeTemperature = window.updateGlobeTemperature;
  const updateGlobePosition = window.updateGlobePosition;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  input.dispatchEvent(new Event("input", {bubbles: true}));
  output.dispatchEvent(new Event("input", {bubbles: true}));

  if (!shouldAutoApply) return;
  if (
    typeof updateGlobePosition !== "function" ||
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    input.dispatchEvent(new Event("change", {bubbles: true}));
    output.dispatchEvent(new Event("change", {bubbles: true}));
    return;
  }

  if (typeof updateGlobeTemperature === "function") updateGlobeTemperature();
  updateGlobePosition();
  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);

  input.dispatchEvent(new Event("change", {bubbles: true}));
  output.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyLongitude(value: number) {
  const input = document.getElementById("longitudeInput") as HTMLInputElement | null;
  const output = document.getElementById("longitudeOutput") as HTMLInputElement | null;
  if (!input || !output || !Number.isFinite(value)) return;
  const min = Number(input.min || output.min || "0");
  const max = Number(input.max || output.max || "100");
  const nextValue = String(Math.max(min, Math.min(max, Math.round(value * 10) / 10)));
  input.value = nextValue;
  output.value = nextValue;

  const stored = input.dataset.stored || output.dataset.stored || "longitude";
  const lock = window.lock;
  if (typeof lock === "function") lock(stored);

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const updateGlobeTemperature = window.updateGlobeTemperature;
  const updateGlobePosition = window.updateGlobePosition;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  input.dispatchEvent(new Event("input", {bubbles: true}));
  output.dispatchEvent(new Event("input", {bubbles: true}));

  if (!shouldAutoApply) return;
  if (
    typeof updateGlobePosition !== "function" ||
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    input.dispatchEvent(new Event("change", {bubbles: true}));
    output.dispatchEvent(new Event("change", {bubbles: true}));
    return;
  }

  if (typeof updateGlobeTemperature === "function") updateGlobeTemperature();
  updateGlobePosition();
  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);

  input.dispatchEvent(new Event("change", {bubbles: true}));
  output.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyWindTier0(value: number) {
  if (!Number.isFinite(value)) return;

  const nextValue = ((Math.round(value / 45) * 45) % 360 + 360) % 360;
  const windPath = document.querySelector("#globeWindArrows path[data-tier='0']") as SVGPathElement | null;
  if (!windPath) return;

  const transform = windPath.getAttribute("transform") || "rotate(225 210 6)";
  const match = transform.match(/rotate\(([-\d.]+)\s+([\d.-]+)\s+([\d.-]+)\)/);
  const cx = match?.[2] || "210";
  const cy = match?.[3] || "6";
  windPath.setAttribute("transform", `rotate(${nextValue} ${cx} ${cy})`);

  const appliesToCurrentMap =
    typeof window.eval === "function"
      ? Boolean(
          window.eval(`(() => {
            try {
              if (typeof options !== "undefined" && Array.isArray(options.winds)) {
                options.winds[0] = ${nextValue};
                localStorage.setItem("winds", options.winds);
              }
              if (typeof mapCoordinates === "undefined" || typeof d3 === "undefined") return false;
              const mapTiers = d3.range(mapCoordinates.latN, mapCoordinates.latS, -30).map(c => ((90 - c) / 30) | 0);
              return mapTiers.includes(0);
            } catch {
              return false;
            }
          })()`),
        )
      : false;

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const updateGlobeTemperature = window.updateGlobeTemperature;
  const updateGlobePosition = window.updateGlobePosition;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  if (!shouldAutoApply || !appliesToCurrentMap) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    return;
  }

  if (typeof updateGlobeTemperature === "function") updateGlobeTemperature();
  if (typeof updateGlobePosition === "function") updateGlobePosition();
  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);
}

export function setLegacyWindTier1(value: number) {
  if (!Number.isFinite(value)) return;

  const nextValue = ((Math.round(value / 45) * 45) % 360 + 360) % 360;
  const windPath = document.querySelector("#globeWindArrows path[data-tier='1']") as SVGPathElement | null;
  if (!windPath) return;

  const transform = windPath.getAttribute("transform") || "rotate(45 210 30)";
  const match = transform.match(/rotate\(([-\d.]+)\s+([\d.-]+)\s+([\d.-]+)\)/);
  const cx = match?.[2] || "210";
  const cy = match?.[3] || "30";
  windPath.setAttribute("transform", `rotate(${nextValue} ${cx} ${cy})`);

  const appliesToCurrentMap =
    typeof window.eval === "function"
      ? Boolean(
          window.eval(`(() => {
            try {
              if (typeof options !== "undefined" && Array.isArray(options.winds)) {
                options.winds[1] = ${nextValue};
                localStorage.setItem("winds", options.winds);
              }
              if (typeof mapCoordinates === "undefined" || typeof d3 === "undefined") return false;
              const mapTiers = d3.range(mapCoordinates.latN, mapCoordinates.latS, -30).map(c => ((90 - c) / 30) | 0);
              return mapTiers.includes(1);
            } catch {
              return false;
            }
          })()`),
        )
      : false;

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const updateGlobeTemperature = window.updateGlobeTemperature;
  const updateGlobePosition = window.updateGlobePosition;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  if (!shouldAutoApply || !appliesToCurrentMap) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    return;
  }

  if (typeof updateGlobeTemperature === "function") updateGlobeTemperature();
  if (typeof updateGlobePosition === "function") updateGlobePosition();
  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);
}

export function setLegacyWindTier2(value: number) {
  if (!Number.isFinite(value)) return;

  const nextValue = ((Math.round(value / 45) * 45) % 360 + 360) % 360;
  const windPath = document.querySelector("#globeWindArrows path[data-tier='2']") as SVGPathElement | null;
  if (!windPath) return;

  const transform = windPath.getAttribute("transform") || "rotate(225 210 75)";
  const match = transform.match(/rotate\(([-\d.]+)\s+([\d.-]+)\s+([\d.-]+)\)/);
  const cx = match?.[2] || "210";
  const cy = match?.[3] || "75";
  windPath.setAttribute("transform", `rotate(${nextValue} ${cx} ${cy})`);

  const appliesToCurrentMap =
    typeof window.eval === "function"
      ? Boolean(
          window.eval(`(() => {
            try {
              if (typeof options !== "undefined" && Array.isArray(options.winds)) {
                options.winds[2] = ${nextValue};
                localStorage.setItem("winds", options.winds);
              }
              if (typeof mapCoordinates === "undefined" || typeof d3 === "undefined") return false;
              const mapTiers = d3.range(mapCoordinates.latN, mapCoordinates.latS, -30).map(c => ((90 - c) / 30) | 0);
              return mapTiers.includes(2);
            } catch {
              return false;
            }
          })()`),
        )
      : false;

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const updateGlobeTemperature = window.updateGlobeTemperature;
  const updateGlobePosition = window.updateGlobePosition;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  if (!shouldAutoApply || !appliesToCurrentMap) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    return;
  }

  if (typeof updateGlobeTemperature === "function") updateGlobeTemperature();
  if (typeof updateGlobePosition === "function") updateGlobePosition();
  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);
}

export function setLegacyWindTier3(value: number) {
  if (!Number.isFinite(value)) return;

  const nextValue = ((Math.round(value / 45) * 45) % 360 + 360) % 360;
  const windPath = document.querySelector("#globeWindArrows path[data-tier='3']") as SVGPathElement | null;
  if (!windPath) return;

  const transform = windPath.getAttribute("transform") || "rotate(315 210 130)";
  const match = transform.match(/rotate\(([-\d.]+)\s+([\d.-]+)\s+([\d.-]+)\)/);
  const cx = match?.[2] || "210";
  const cy = match?.[3] || "130";
  windPath.setAttribute("transform", `rotate(${nextValue} ${cx} ${cy})`);

  const appliesToCurrentMap =
    typeof window.eval === "function"
      ? Boolean(
          window.eval(`(() => {
            try {
              if (typeof options !== "undefined" && Array.isArray(options.winds)) {
                options.winds[3] = ${nextValue};
                localStorage.setItem("winds", options.winds);
              }
              if (typeof mapCoordinates === "undefined" || typeof d3 === "undefined") return false;
              const mapTiers = d3.range(mapCoordinates.latN, mapCoordinates.latS, -30).map(c => ((90 - c) / 30) | 0);
              return mapTiers.includes(3);
            } catch {
              return false;
            }
          })()`),
        )
      : false;

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const updateGlobeTemperature = window.updateGlobeTemperature;
  const updateGlobePosition = window.updateGlobePosition;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  if (!shouldAutoApply || !appliesToCurrentMap) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    return;
  }

  if (typeof updateGlobeTemperature === "function") updateGlobeTemperature();
  if (typeof updateGlobePosition === "function") updateGlobePosition();
  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);
}

export function setLegacyWindTier4(value: number) {
  if (!Number.isFinite(value)) return;

  const nextValue = ((Math.round(value / 45) * 45) % 360 + 360) % 360;
  const windPath = document.querySelector("#globeWindArrows path[data-tier='4']") as SVGPathElement | null;
  if (!windPath) return;

  const transform = windPath.getAttribute("transform") || "rotate(135 210 173)";
  const match = transform.match(/rotate\(([-\d.]+)\s+([\d.-]+)\s+([\d.-]+)\)/);
  const cx = match?.[2] || "210";
  const cy = match?.[3] || "173";
  windPath.setAttribute("transform", `rotate(${nextValue} ${cx} ${cy})`);

  const appliesToCurrentMap =
    typeof window.eval === "function"
      ? Boolean(
          window.eval(`(() => {
            try {
              if (typeof options !== "undefined" && Array.isArray(options.winds)) {
                options.winds[4] = ${nextValue};
                localStorage.setItem("winds", options.winds);
              }
              if (typeof mapCoordinates === "undefined" || typeof d3 === "undefined") return false;
              const mapTiers = d3.range(mapCoordinates.latN, mapCoordinates.latS, -30).map(c => ((90 - c) / 30) | 0);
              return mapTiers.includes(4);
            } catch {
              return false;
            }
          })()`),
        )
      : false;

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const updateGlobeTemperature = window.updateGlobeTemperature;
  const updateGlobePosition = window.updateGlobePosition;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  if (!shouldAutoApply || !appliesToCurrentMap) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    return;
  }

  if (typeof updateGlobeTemperature === "function") updateGlobeTemperature();
  if (typeof updateGlobePosition === "function") updateGlobePosition();
  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);
}

export function setLegacyWindTier5(value: number) {
  if (!Number.isFinite(value)) return;

  const nextValue = ((Math.round(value / 45) * 45) % 360 + 360) % 360;
  const windPath = document.querySelector("#globeWindArrows path[data-tier='5']") as SVGPathElement | null;
  if (!windPath) return;

  const transform = windPath.getAttribute("transform") || "rotate(315 210 194)";
  const match = transform.match(/rotate\(([-\d.]+)\s+([\d.-]+)\s+([\d.-]+)\)/);
  const cx = match?.[2] || "210";
  const cy = match?.[3] || "194";
  windPath.setAttribute("transform", `rotate(${nextValue} ${cx} ${cy})`);

  const appliesToCurrentMap =
    typeof window.eval === "function"
      ? Boolean(
          window.eval(`(() => {
            try {
              if (typeof options !== "undefined" && Array.isArray(options.winds)) {
                options.winds[5] = ${nextValue};
                localStorage.setItem("winds", options.winds);
              }
              if (typeof mapCoordinates === "undefined" || typeof d3 === "undefined") return false;
              const mapTiers = d3.range(mapCoordinates.latN, mapCoordinates.latS, -30).map(c => ((90 - c) / 30) | 0);
              return mapTiers.includes(5);
            } catch {
              return false;
            }
          })()`),
        )
      : false;

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const updateGlobeTemperature = window.updateGlobeTemperature;
  const updateGlobePosition = window.updateGlobePosition;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  if (!shouldAutoApply || !appliesToCurrentMap) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    return;
  }

  if (typeof updateGlobeTemperature === "function") updateGlobeTemperature();
  if (typeof updateGlobePosition === "function") updateGlobePosition();
  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);
}

export function setLegacyPrecipitation(value: number) {
  const input = document.getElementById("precInput") as HTMLInputElement | null;
  const output = document.getElementById("precOutput") as HTMLInputElement | null;
  if (!input || !output || !Number.isFinite(value)) return;
  const min = Number(output.min || input.min || "0");
  const max = Number(output.max || input.max || "500");
  const nextValue = String(Math.max(min, Math.min(max, Math.round(value))));
  input.value = nextValue;
  output.value = nextValue;

  const stored = input.dataset.stored || output.dataset.stored || "prec";
  const lock = window.lock;
  if (typeof lock === "function") lock(stored);

  const wcAutoChange = document.getElementById("wcAutoChange") as HTMLInputElement | null;
  const shouldAutoApply = wcAutoChange ? wcAutoChange.checked : true;
  const calculateTemperatures = window.calculateTemperatures;
  const generatePrecipitation = window.generatePrecipitation;
  const riversGenerate = window.Rivers?.generate;
  const riversSpecify = window.Rivers?.specify;
  const biomesDefine = window.Biomes?.define;
  const featuresDefineGroups = window.Features?.defineGroups;
  const lakesDefineNames = window.Lakes?.defineNames;
  const layerIsOn = window.layerIsOn;
  const drawTemperature = window.drawTemperature;
  const drawPrecipitation = window.drawPrecipitation;
  const drawBiomes = window.drawBiomes;
  const drawCoordinates = window.drawCoordinates;
  const drawRivers = window.drawRivers;
  const setTimeoutRef = window.setTimeout;
  const updateThreeD = (window.ThreeD as {update?: () => void} | undefined)?.update;
  const packRef = window.pack as {cells?: {h?: ArrayLike<number>}} | undefined;

  input.dispatchEvent(new Event("input", {bubbles: true}));
  output.dispatchEvent(new Event("input", {bubbles: true}));

  if (!shouldAutoApply) return;
  if (
    typeof calculateTemperatures !== "function" ||
    typeof generatePrecipitation !== "function" ||
    typeof riversGenerate !== "function" ||
    typeof riversSpecify !== "function" ||
    typeof biomesDefine !== "function" ||
    typeof featuresDefineGroups !== "function" ||
    typeof lakesDefineNames !== "function" ||
    !packRef?.cells?.h
  ) {
    input.dispatchEvent(new Event("change", {bubbles: true}));
    output.dispatchEvent(new Event("change", {bubbles: true}));
    return;
  }

  calculateTemperatures();
  generatePrecipitation();
  const heights = new Uint8Array(packRef.cells.h);
  riversGenerate();
  riversSpecify();
  packRef.cells.h = new Float32Array(heights);
  biomesDefine();
  featuresDefineGroups();
  lakesDefineNames();

  if (typeof layerIsOn === "function" && layerIsOn("toggleTemperature") && typeof drawTemperature === "function") drawTemperature();
  if (typeof layerIsOn === "function" && layerIsOn("togglePrecipitation") && typeof drawPrecipitation === "function") drawPrecipitation();
  if (typeof layerIsOn === "function" && layerIsOn("toggleBiomes") && typeof drawBiomes === "function") drawBiomes();
  if (typeof layerIsOn === "function" && layerIsOn("toggleCoordinates") && typeof drawCoordinates === "function") drawCoordinates();
  if (typeof layerIsOn === "function" && layerIsOn("toggleRivers") && typeof drawRivers === "function") drawRivers();
  if (document.getElementById("canvas3d") && typeof updateThreeD === "function") setTimeoutRef(() => updateThreeD(), 500);

  input.dispatchEvent(new Event("change", {bubbles: true}));
  output.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyStateLabelsMode(value: string) {
  const select = document.getElementById("stateLabelsModeInput") as HTMLSelectElement | null;
  if (!select) return;
  select.value = value;
  select.dispatchEvent(new Event("input", {bubbles: true}));
  select.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyCultureSet(value: string) {
  const select = document.getElementById("culturesSet") as HTMLSelectElement | null;
  if (!select) return;
  select.value = value;
  select.dispatchEvent(new Event("input", {bubbles: true}));
  select.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingTemplate(template: string) {
  const select = document.getElementById("templateInput") as HTMLSelectElement | null;
  if (!select) return;

  const option = Array.from(select.options).find(({value}) => value === template);
  const label =
    option?.textContent ||
    ((globalThis as typeof globalThis & {
      heightmapTemplates?: Record<string, {name?: string}>;
      precreatedHeightmaps?: Record<string, {name?: string}>;
    }).heightmapTemplates?.[template]?.name ??
      (globalThis as typeof globalThis & {
        heightmapTemplates?: Record<string, {name?: string}>;
        precreatedHeightmaps?: Record<string, {name?: string}>;
      }).precreatedHeightmaps?.[template]?.name ??
      template);

  const applyOption = window.applyOption;
  if (typeof applyOption === "function") {
    applyOption(select, template, label);
  } else {
    if (!option) select.options.add(new Option(label, template));
    select.value = template;
  }

  select.dispatchEvent(new Event("input", {bubbles: true}));
  select.dispatchEvent(new Event("change", {bubbles: true}));
}

export function setLegacyPendingCanvasSize(dimension: "width" | "height", value: number) {
  const inputId = dimension === "width" ? "mapWidthInput" : "mapHeightInput";
  const input = document.getElementById(inputId) as HTMLInputElement | null;
  if (!input) return;
  input.value = String(value);
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export async function syncLegacyProjectSummary() {
  const state = globalThis as typeof globalThis & {__studioProjectSummary?: LegacyProjectSummary};
  const previous = state.__studioProjectSummary;
  let hasLocalSnapshot = Boolean(localStorage.getItem("lastMap") || sessionStorage.getItem("lastMap"));
  const templateSelect = document.getElementById("templateInput") as HTMLSelectElement | null;
  const availableTemplates = Array.from(templateSelect?.options || []).map(option => ({
    value: option.value,
    label: option.textContent?.trim() || option.value,
  }));
  const culturesSet = document.getElementById("culturesSet") as HTMLSelectElement | null;
  const availableCultureSets = Array.from(culturesSet?.options || []).map(option => ({
    value: option.value,
    label: option.textContent?.trim() || option.value,
    max: option.dataset.max || "",
  }));
  const statesInput = document.getElementById("statesNumber") as HTMLInputElement | null;
  const provincesRatioInput = document.getElementById("provincesRatio") as HTMLInputElement | null;
  const sizeVarietyInput = document.getElementById("sizeVariety") as HTMLInputElement | null;
  const growthRateInput = document.getElementById("growthRate") as HTMLInputElement | null;
  const temperatureEquatorInput = document.getElementById("temperatureEquatorInput") as HTMLInputElement | null;
  const temperatureEquatorF = document.getElementById("temperatureEquatorF") as HTMLSpanElement | null;
  const temperatureNorthPoleInput = document.getElementById("temperatureNorthPoleInput") as HTMLInputElement | null;
  const temperatureNorthPoleF = document.getElementById("temperatureNorthPoleF") as HTMLSpanElement | null;
  const temperatureSouthPoleInput = document.getElementById("temperatureSouthPoleInput") as HTMLInputElement | null;
  const temperatureSouthPoleF = document.getElementById("temperatureSouthPoleF") as HTMLSpanElement | null;
  const mapSizeInput = document.getElementById("mapSizeInput") as HTMLInputElement | null;
  const latitudeInput = document.getElementById("latitudeInput") as HTMLInputElement | null;
  const longitudeInput = document.getElementById("longitudeInput") as HTMLInputElement | null;
  const windTier0Path = document.querySelector("#globeWindArrows path[data-tier='0']") as SVGPathElement | null;
  const windTier1Path = document.querySelector("#globeWindArrows path[data-tier='1']") as SVGPathElement | null;
  const windTier2Path = document.querySelector("#globeWindArrows path[data-tier='2']") as SVGPathElement | null;
  const windTier3Path = document.querySelector("#globeWindArrows path[data-tier='3']") as SVGPathElement | null;
  const windTier4Path = document.querySelector("#globeWindArrows path[data-tier='4']") as SVGPathElement | null;
  const windTier5Path = document.querySelector("#globeWindArrows path[data-tier='5']") as SVGPathElement | null;
  const precipitationInput = document.getElementById("precInput") as HTMLInputElement | null;
  const culturesInput = document.getElementById("culturesInput") as HTMLInputElement | null;
  const burgsInput = document.getElementById("manorsInput") as HTMLInputElement | null;
  const burgsOutput = document.getElementById("manorsOutput") as HTMLOutputElement | null;
  const religionsInput = document.getElementById("religionsNumber") as HTMLInputElement | null;
  const stateLabelsModeSelect = document.getElementById("stateLabelsModeInput") as HTMLSelectElement | null;
  const pendingStates = statesInput?.value || "";
  const pendingProvincesRatio = provincesRatioInput?.value || "";
  const pendingSizeVariety = sizeVarietyInput?.value || "";
  const pendingGrowthRate = growthRateInput?.value || "";
  const pendingTemperatureEquator = temperatureEquatorInput?.value || "";
  const pendingTemperatureEquatorF = temperatureEquatorF?.textContent?.trim() || "";
  const pendingTemperatureNorthPole = temperatureNorthPoleInput?.value || "";
  const pendingTemperatureNorthPoleF = temperatureNorthPoleF?.textContent?.trim() || "";
  const pendingTemperatureSouthPole = temperatureSouthPoleInput?.value || "";
  const pendingTemperatureSouthPoleF = temperatureSouthPoleF?.textContent?.trim() || "";
  const pendingMapSize = mapSizeInput?.value || "";
  const pendingLatitude = latitudeInput?.value || "";
  const pendingLongitude = longitudeInput?.value || "";
  const pendingWindTier0FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[0] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier0FromTransform = windTier0Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier0 = pendingWindTier0FromTransform || pendingWindTier0FromOptions;
  const pendingWindTier1FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[1] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier1FromTransform = windTier1Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier1 = pendingWindTier1FromTransform || pendingWindTier1FromOptions;
  const pendingWindTier2FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[2] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier2FromTransform = windTier2Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier2 = pendingWindTier2FromTransform || pendingWindTier2FromOptions;
  const pendingWindTier3FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[3] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier3FromTransform = windTier3Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier3 = pendingWindTier3FromTransform || pendingWindTier3FromOptions;
  const pendingWindTier4FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[4] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier4FromTransform = windTier4Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier4 = pendingWindTier4FromTransform || pendingWindTier4FromOptions;
  const pendingWindTier5FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[5] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier5FromTransform = windTier5Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier5 = pendingWindTier5FromTransform || pendingWindTier5FromOptions;
  const pendingPrecipitation = precipitationInput?.value || "";
  const pendingCultures = culturesInput?.value || "";
  const pendingBurgs = burgsInput?.value || "";
  const pendingBurgsLabel = burgsOutput?.value || burgsOutput?.textContent?.trim() || (pendingBurgs === "1000" ? "auto" : pendingBurgs);
  const pendingReligions = religionsInput?.value || "";
  const pendingStateLabelsMode = stateLabelsModeSelect?.value || "";
  const pendingStateLabelsModeLabel = stateLabelsModeSelect?.selectedOptions?.[0]?.textContent?.trim() || pendingStateLabelsMode || "";
  const pendingCultureSet = culturesSet?.value || "";
  const pendingCultureSetLabel =
    availableCultureSets.find(option => option.value === pendingCultureSet)?.label || pendingCultureSet || "";
  const pointsInput = document.getElementById("pointsInput") as HTMLInputElement | null;
  const pointsOutput = document.getElementById("pointsOutputFormatted") as HTMLOutputElement | null;
  const pendingPoints = pointsInput?.value || "";
  const pendingCellsLabel = pointsOutput?.value || pointsOutput?.textContent?.trim() || "";
  const pendingTemplate = templateSelect?.value || "";
  const pendingTemplateLabel =
    availableTemplates.find(option => option.value === pendingTemplate)?.label || pendingTemplate || "";

  if (!hasLocalSnapshot) {
    try {
      if (typeof ldb !== "undefined" && typeof ldb.get === "function") {
        hasLocalSnapshot = Boolean(await ldb.get("lastMap"));
      }
    } catch {
      hasLocalSnapshot = false;
    }
  }

  const next = {
    hasLocalSnapshot,
    stylePreset: localStorage.getItem("presetStyle") || "default",
    lastLayersPreset: (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value || localStorage.getItem("preset") || "custom",
    autosaveInterval: (document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null)?.value || "0",
    pendingSeed: (document.getElementById("optionsSeed") as HTMLInputElement | null)?.value || "",
    pendingPoints,
    pendingCellsLabel,
    pendingStates,
    pendingProvincesRatio,
    pendingSizeVariety,
    pendingGrowthRate,
    pendingTemperatureEquator,
    pendingTemperatureEquatorF,
    pendingTemperatureNorthPole,
    pendingTemperatureNorthPoleF,
    pendingTemperatureSouthPole,
    pendingTemperatureSouthPoleF,
    pendingMapSize,
    pendingLatitude,
    pendingLongitude,
    pendingWindTier0,
    pendingWindTier1,
    pendingWindTier2,
    pendingWindTier3,
    pendingWindTier4,
    pendingWindTier5,
    pendingPrecipitation,
    pendingCultures,
    pendingBurgs,
    pendingBurgsLabel,
    pendingReligions,
    pendingStateLabelsMode,
    pendingStateLabelsModeLabel,
    pendingCultureSet,
    pendingCultureSetLabel,
    availableCultureSets,
    pendingTemplate,
    pendingTemplateLabel,
    availableTemplates,
    pendingWidth: (document.getElementById("mapWidthInput") as HTMLInputElement | null)?.value || "",
    pendingHeight: (document.getElementById("mapHeightInput") as HTMLInputElement | null)?.value || "",
    availableLayersPresets: Array.from((document.getElementById("layersPreset") as HTMLSelectElement | null)?.options || []).map(option => option.value),
    canSaveLayersPreset: ((document.getElementById("savePresetButton") as HTMLButtonElement | null)?.style.display || "none") !== "none",
    canRemoveLayersPreset: ((document.getElementById("removePresetButton") as HTMLButtonElement | null)?.style.display || "none") !== "none",
    canOpenSeedHistory: Boolean(document.getElementById("optionsMapHistory")),
    canCopySeedUrl: Boolean(document.getElementById("optionsCopySeed")),
    canSetSeed: Boolean(document.getElementById("optionsSeed")),
    canRestoreDefaultCanvasSize: Boolean(document.getElementById("restoreDefaultCanvasSize")),
  } satisfies LegacyProjectSummary;

  state.__studioProjectSummary = next;
  return (
    !previous ||
    previous.hasLocalSnapshot !== next.hasLocalSnapshot ||
    previous.stylePreset !== next.stylePreset ||
    previous.lastLayersPreset !== next.lastLayersPreset ||
    previous.autosaveInterval !== next.autosaveInterval ||
    previous.pendingSeed !== next.pendingSeed ||
    previous.pendingPoints !== next.pendingPoints ||
    previous.pendingCellsLabel !== next.pendingCellsLabel ||
    previous.pendingStates !== next.pendingStates ||
    previous.pendingProvincesRatio !== next.pendingProvincesRatio ||
    previous.pendingSizeVariety !== next.pendingSizeVariety ||
    previous.pendingGrowthRate !== next.pendingGrowthRate ||
    previous.pendingTemperatureEquator !== next.pendingTemperatureEquator ||
    previous.pendingTemperatureEquatorF !== next.pendingTemperatureEquatorF ||
    previous.pendingTemperatureNorthPole !== next.pendingTemperatureNorthPole ||
    previous.pendingTemperatureNorthPoleF !== next.pendingTemperatureNorthPoleF ||
    previous.pendingTemperatureSouthPole !== next.pendingTemperatureSouthPole ||
    previous.pendingTemperatureSouthPoleF !== next.pendingTemperatureSouthPoleF ||
    previous.pendingMapSize !== next.pendingMapSize ||
    previous.pendingLatitude !== next.pendingLatitude ||
    previous.pendingLongitude !== next.pendingLongitude ||
    previous.pendingWindTier0 !== next.pendingWindTier0 ||
    previous.pendingWindTier1 !== next.pendingWindTier1 ||
    previous.pendingWindTier2 !== next.pendingWindTier2 ||
    previous.pendingWindTier3 !== next.pendingWindTier3 ||
    previous.pendingWindTier4 !== next.pendingWindTier4 ||
    previous.pendingWindTier5 !== next.pendingWindTier5 ||
    previous.pendingPrecipitation !== next.pendingPrecipitation ||
    previous.pendingCultures !== next.pendingCultures ||
    previous.pendingBurgs !== next.pendingBurgs ||
    previous.pendingBurgsLabel !== next.pendingBurgsLabel ||
    previous.pendingReligions !== next.pendingReligions ||
    previous.pendingStateLabelsMode !== next.pendingStateLabelsMode ||
    previous.pendingStateLabelsModeLabel !== next.pendingStateLabelsModeLabel ||
    previous.pendingCultureSet !== next.pendingCultureSet ||
    previous.pendingCultureSetLabel !== next.pendingCultureSetLabel ||
    previous.pendingTemplate !== next.pendingTemplate ||
    previous.pendingTemplateLabel !== next.pendingTemplateLabel ||
    previous.pendingWidth !== next.pendingWidth ||
    previous.pendingHeight !== next.pendingHeight ||
    previous.canSaveLayersPreset !== next.canSaveLayersPreset ||
    previous.canRemoveLayersPreset !== next.canRemoveLayersPreset ||
    previous.canOpenSeedHistory !== next.canOpenSeedHistory ||
    previous.canCopySeedUrl !== next.canCopySeedUrl ||
    previous.canSetSeed !== next.canSetSeed ||
    previous.canRestoreDefaultCanvasSize !== next.canRestoreDefaultCanvasSize ||
    previous.availableCultureSets.length !== next.availableCultureSets.length ||
    previous.availableCultureSets.some(
      (option, index) =>
        option.value !== next.availableCultureSets[index]?.value || option.label !== next.availableCultureSets[index]?.label || option.max !== next.availableCultureSets[index]?.max,
    ) ||
    previous.availableTemplates.length !== next.availableTemplates.length ||
    previous.availableTemplates.some((option, index) => option.value !== next.availableTemplates[index]?.value || option.label !== next.availableTemplates[index]?.label) ||
    previous.availableLayersPresets.length !== next.availableLayersPresets.length ||
    previous.availableLayersPresets.some((option, index) => option !== next.availableLayersPresets[index])
  );
}

export function getLegacyProjectSummary() {
  const cachedSummary = (globalThis as typeof globalThis & {__studioProjectSummary?: LegacyProjectSummary}).__studioProjectSummary;
  const hasStorageSnapshot = Boolean(localStorage.getItem("lastMap") || sessionStorage.getItem("lastMap"));
  const liveLayersPreset = (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value;
  const liveAutosaveInterval = (document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null)?.value;
  const pointsInput = document.getElementById("pointsInput") as HTMLInputElement | null;
  const pointsOutput = document.getElementById("pointsOutputFormatted") as HTMLOutputElement | null;
  const statesInput = document.getElementById("statesNumber") as HTMLInputElement | null;
  const provincesRatioInput = document.getElementById("provincesRatio") as HTMLInputElement | null;
  const sizeVarietyInput = document.getElementById("sizeVariety") as HTMLInputElement | null;
  const growthRateInput = document.getElementById("growthRate") as HTMLInputElement | null;
  const precipitationInput = document.getElementById("precInput") as HTMLInputElement | null;
  const culturesInput = document.getElementById("culturesInput") as HTMLInputElement | null;
  const burgsInput = document.getElementById("manorsInput") as HTMLInputElement | null;
  const burgsOutput = document.getElementById("manorsOutput") as HTMLOutputElement | null;
  const religionsInput = document.getElementById("religionsNumber") as HTMLInputElement | null;
  const stateLabelsModeSelect = document.getElementById("stateLabelsModeInput") as HTMLSelectElement | null;
  const culturesSet = document.getElementById("culturesSet") as HTMLSelectElement | null;
  const templateSelect = document.getElementById("templateInput") as HTMLSelectElement | null;
  const availableCultureSets = Array.from(culturesSet?.options || []).map(option => ({
    value: option.value,
    label: option.textContent?.trim() || option.value,
    max: option.dataset.max || "",
  }));
  const availableTemplates = Array.from(templateSelect?.options || []).map(option => ({
    value: option.value,
    label: option.textContent?.trim() || option.value,
  }));
  const temperatureEquatorInput = document.getElementById("temperatureEquatorInput") as HTMLInputElement | null;
  const temperatureEquatorF = document.getElementById("temperatureEquatorF") as HTMLSpanElement | null;
  const temperatureNorthPoleInput = document.getElementById("temperatureNorthPoleInput") as HTMLInputElement | null;
  const temperatureNorthPoleF = document.getElementById("temperatureNorthPoleF") as HTMLSpanElement | null;
  const temperatureSouthPoleInput = document.getElementById("temperatureSouthPoleInput") as HTMLInputElement | null;
  const temperatureSouthPoleF = document.getElementById("temperatureSouthPoleF") as HTMLSpanElement | null;
  const mapSizeInput = document.getElementById("mapSizeInput") as HTMLInputElement | null;
  const latitudeInput = document.getElementById("latitudeInput") as HTMLInputElement | null;
  const longitudeInput = document.getElementById("longitudeInput") as HTMLInputElement | null;
  const windTier0Path = document.querySelector("#globeWindArrows path[data-tier='0']") as SVGPathElement | null;
  const windTier1Path = document.querySelector("#globeWindArrows path[data-tier='1']") as SVGPathElement | null;
  const windTier2Path = document.querySelector("#globeWindArrows path[data-tier='2']") as SVGPathElement | null;
  const windTier3Path = document.querySelector("#globeWindArrows path[data-tier='3']") as SVGPathElement | null;
  const windTier4Path = document.querySelector("#globeWindArrows path[data-tier='4']") as SVGPathElement | null;
  const windTier5Path = document.querySelector("#globeWindArrows path[data-tier='5']") as SVGPathElement | null;
  const pendingPoints = pointsInput?.value || cachedSummary?.pendingPoints || "";
  const pendingCellsLabel = pointsOutput?.value || pointsOutput?.textContent?.trim() || cachedSummary?.pendingCellsLabel || "";
  const pendingStates = statesInput?.value || cachedSummary?.pendingStates || "";
  const pendingProvincesRatio = provincesRatioInput?.value || cachedSummary?.pendingProvincesRatio || "";
  const pendingSizeVariety = sizeVarietyInput?.value || cachedSummary?.pendingSizeVariety || "";
  const pendingGrowthRate = growthRateInput?.value || cachedSummary?.pendingGrowthRate || "";
  const pendingTemperatureEquator = temperatureEquatorInput?.value || cachedSummary?.pendingTemperatureEquator || "";
  const pendingTemperatureEquatorF = temperatureEquatorF?.textContent?.trim() || cachedSummary?.pendingTemperatureEquatorF || "";
  const pendingTemperatureNorthPole = temperatureNorthPoleInput?.value || cachedSummary?.pendingTemperatureNorthPole || "";
  const pendingTemperatureNorthPoleF = temperatureNorthPoleF?.textContent?.trim() || cachedSummary?.pendingTemperatureNorthPoleF || "";
  const pendingTemperatureSouthPole = temperatureSouthPoleInput?.value || cachedSummary?.pendingTemperatureSouthPole || "";
  const pendingTemperatureSouthPoleF = temperatureSouthPoleF?.textContent?.trim() || cachedSummary?.pendingTemperatureSouthPoleF || "";
  const pendingMapSize = mapSizeInput?.value || cachedSummary?.pendingMapSize || "";
  const pendingLatitude = latitudeInput?.value || cachedSummary?.pendingLatitude || "";
  const pendingLongitude = longitudeInput?.value || cachedSummary?.pendingLongitude || "";
  const pendingWindTier0FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[0] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier0FromTransform = windTier0Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier0 = pendingWindTier0FromTransform || pendingWindTier0FromOptions || cachedSummary?.pendingWindTier0 || "";
  const pendingWindTier1FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[1] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier1FromTransform = windTier1Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier1 = pendingWindTier1FromTransform || pendingWindTier1FromOptions || cachedSummary?.pendingWindTier1 || "";
  const pendingWindTier2FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[2] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier2FromTransform = windTier2Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier2 = pendingWindTier2FromTransform || pendingWindTier2FromOptions || cachedSummary?.pendingWindTier2 || "";
  const pendingWindTier3FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[3] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier3FromTransform = windTier3Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier3 = pendingWindTier3FromTransform || pendingWindTier3FromOptions || cachedSummary?.pendingWindTier3 || "";
  const pendingWindTier4FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[4] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier4FromTransform = windTier4Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier4 = pendingWindTier4FromTransform || pendingWindTier4FromOptions || cachedSummary?.pendingWindTier4 || "";
  const pendingWindTier5FromOptions =
    typeof window.eval === "function"
      ? String(window.eval(`(() => {
          try {
            return typeof options !== "undefined" && Array.isArray(options.winds) ? options.winds[5] : "";
          } catch {
            return "";
          }
        })()` ) || "")
      : "";
  const pendingWindTier5FromTransform = windTier5Path?.getAttribute("transform")?.match(/rotate\(([-\d.]+)/)?.[1] || "";
  const pendingWindTier5 = pendingWindTier5FromTransform || pendingWindTier5FromOptions || cachedSummary?.pendingWindTier5 || "";
  const pendingPrecipitation = precipitationInput?.value || cachedSummary?.pendingPrecipitation || "";
  const pendingCultures = culturesInput?.value || cachedSummary?.pendingCultures || "";
  const pendingBurgs = burgsInput?.value || cachedSummary?.pendingBurgs || "";
  const pendingBurgsLabel = burgsOutput?.value || burgsOutput?.textContent?.trim() || cachedSummary?.pendingBurgsLabel || (pendingBurgs === "1000" ? "auto" : pendingBurgs);
  const pendingReligions = religionsInput?.value || cachedSummary?.pendingReligions || "";
  const pendingStateLabelsMode = stateLabelsModeSelect?.value || cachedSummary?.pendingStateLabelsMode || "";
  const pendingStateLabelsModeLabel =
    stateLabelsModeSelect?.selectedOptions?.[0]?.textContent?.trim() || cachedSummary?.pendingStateLabelsModeLabel || pendingStateLabelsMode || "";
  const pendingCultureSet = culturesSet?.value || cachedSummary?.pendingCultureSet || "";
  const pendingCultureSetLabel =
    availableCultureSets.find(option => option.value === pendingCultureSet)?.label || cachedSummary?.pendingCultureSetLabel || pendingCultureSet || "";
  const pendingTemplate = templateSelect?.value || cachedSummary?.pendingTemplate || "";
  const pendingTemplateLabel =
    availableTemplates.find(option => option.value === pendingTemplate)?.label || cachedSummary?.pendingTemplateLabel || pendingTemplate || "";
  const availableLayersPresets = Array.from((document.getElementById("layersPreset") as HTMLSelectElement | null)?.options || []).map(option => option.value);

  return {
    hasLocalSnapshot: hasStorageSnapshot || Boolean(cachedSummary?.hasLocalSnapshot),
    stylePreset: localStorage.getItem("presetStyle") || cachedSummary?.stylePreset || "default",
    lastLayersPreset: liveLayersPreset || cachedSummary?.lastLayersPreset || localStorage.getItem("preset") || "custom",
    autosaveInterval: liveAutosaveInterval || cachedSummary?.autosaveInterval || "0",
    pendingSeed: (document.getElementById("optionsSeed") as HTMLInputElement | null)?.value || cachedSummary?.pendingSeed || "",
    pendingPoints,
    pendingCellsLabel,
    pendingStates,
    pendingProvincesRatio,
    pendingSizeVariety,
    pendingGrowthRate,
    pendingTemperatureEquator,
    pendingTemperatureEquatorF,
    pendingTemperatureNorthPole,
    pendingTemperatureNorthPoleF,
    pendingTemperatureSouthPole,
    pendingTemperatureSouthPoleF,
    pendingMapSize,
    pendingLatitude,
    pendingLongitude,
    pendingWindTier0,
    pendingWindTier1,
    pendingWindTier2,
    pendingWindTier3,
    pendingWindTier4,
    pendingWindTier5,
    pendingPrecipitation,
    pendingCultures,
    pendingBurgs,
    pendingBurgsLabel,
    pendingReligions,
    pendingStateLabelsMode,
    pendingStateLabelsModeLabel,
    pendingCultureSet,
    pendingCultureSetLabel,
    availableCultureSets: availableCultureSets.length ? availableCultureSets : cachedSummary?.availableCultureSets || [],
    pendingTemplate,
    pendingTemplateLabel,
    availableTemplates: availableTemplates.length ? availableTemplates : cachedSummary?.availableTemplates || [],
    pendingWidth: (document.getElementById("mapWidthInput") as HTMLInputElement | null)?.value || cachedSummary?.pendingWidth || "",
    pendingHeight: (document.getElementById("mapHeightInput") as HTMLInputElement | null)?.value || cachedSummary?.pendingHeight || "",
    availableLayersPresets: availableLayersPresets.length ? availableLayersPresets : cachedSummary?.availableLayersPresets || [],
    canSaveLayersPreset: ((document.getElementById("savePresetButton") as HTMLButtonElement | null)?.style.display || (cachedSummary?.canSaveLayersPreset ? "inline-block" : "none")) !== "none",
    canRemoveLayersPreset: ((document.getElementById("removePresetButton") as HTMLButtonElement | null)?.style.display || (cachedSummary?.canRemoveLayersPreset ? "inline-block" : "none")) !== "none",
    canOpenSeedHistory: Boolean(document.getElementById("optionsMapHistory")) || Boolean(cachedSummary?.canOpenSeedHistory),
    canCopySeedUrl: Boolean(document.getElementById("optionsCopySeed")) || Boolean(cachedSummary?.canCopySeedUrl),
    canSetSeed: Boolean(document.getElementById("optionsSeed")) || Boolean(cachedSummary?.canSetSeed),
    canRestoreDefaultCanvasSize: Boolean(document.getElementById("restoreDefaultCanvasSize")) || Boolean(cachedSummary?.canRestoreDefaultCanvasSize),
  } satisfies LegacyProjectSummary;
}

export function getLegacyTopbarActions() {
  const dataActions = getLegacyDataActions();
  return {
    new: dataActions.canCreateNew,
    open: dataActions.canOpenFile,
    save: dataActions.canSaveToMachine,
    export: true,
  } satisfies Record<TopbarAction, boolean>;
}

export async function runLegacyTopbarAction(action: TopbarAction) {
  if (action === "new") return runLegacyDataAction("new-map");
  if (action === "open") return runLegacyDataAction("open-file");
  if (action === "save") return runLegacyDataAction("save-machine");
}

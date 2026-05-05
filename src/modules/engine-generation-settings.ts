import type { EngineRuntimeContext } from "./engine-runtime-context";

export type EngineGenerationSettings = {
  heightmapTemplateId?: string;
  pointsCount: number;
  heightExponent: number;
  lakeElevationLimit: number;
  resolveDepressionsSteps: number;
  statesCount?: number;
  manorsCount?: number;
  religionsCount: number;
  provincesRatio?: number;
  culturesCount?: number;
  cultureSet?: string;
  cultureSetMax?: number;
  cultureEmblemShape?: string;
  cultureNeutralRate?: number;
  stateSizeVariety: number;
  globalGrowthRate: number;
  statesGrowthRate: number;
};

export type EngineGenerationControlInput = Pick<
  Partial<HTMLInputElement>,
  "dataset" | "value" | "valueAsNumber"
>;

export type EngineGenerationControlSelect = Pick<
  Partial<HTMLSelectElement>,
  "selectedOptions" | "value"
>;

export type EngineGenerationSettingsTargets = {
  getInput: (id: string) => EngineGenerationControlInput | null;
  getSelect: (id: string) => EngineGenerationControlSelect | null;
  getPointsInput: () => EngineGenerationControlInput | undefined;
  getHeightExponentInput: () => EngineGenerationControlInput | undefined;
};

export type EngineGenerationDomTargets = {
  getElementById: (id: string) => Element | null;
};

export type EngineGenerationGlobalControlTargets = {
  getPointsInput: () => EngineGenerationControlInput | undefined;
  getHeightExponentInput: () => EngineGenerationControlInput | undefined;
};

export type EngineGenerationSettingsStore = {
  get: () => EngineGenerationSettings;
  replace: (nextSettings: EngineGenerationSettings) => EngineGenerationSettings;
  patch: (patch: Partial<EngineGenerationSettings>) => EngineGenerationSettings;
  refresh: (
    targets?: EngineGenerationSettingsTargets,
  ) => EngineGenerationSettings;
};

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function createGlobalGenerationDomTargets(): EngineGenerationDomTargets {
  return {
    getElementById: (id) => getDocument()?.getElementById(id) ?? null,
  };
}

export function createGlobalGenerationControlTargets(): EngineGenerationGlobalControlTargets {
  return {
    getPointsInput: () => globalThis.pointsInput,
    getHeightExponentInput: () => globalThis.heightExponentInput,
  };
}

export function createGenerationSettingsTargets(
  domTargets: EngineGenerationDomTargets,
  globalControlTargets: EngineGenerationGlobalControlTargets,
): EngineGenerationSettingsTargets {
  return {
    getInput: (id) =>
      domTargets.getElementById(id) as EngineGenerationControlInput | null,
    getSelect: (id) =>
      domTargets.getElementById(id) as EngineGenerationControlSelect | null,
    getPointsInput: globalControlTargets.getPointsInput,
    getHeightExponentInput: globalControlTargets.getHeightExponentInput,
  };
}

export function createGlobalGenerationSettingsTargets(
  domTargets: EngineGenerationDomTargets = createGlobalGenerationDomTargets(),
  globalControlTargets: EngineGenerationGlobalControlTargets = createGlobalGenerationControlTargets(),
): EngineGenerationSettingsTargets {
  return createGenerationSettingsTargets(domTargets, globalControlTargets);
}

function getInputNumber(
  targets: EngineGenerationSettingsTargets,
  id: string,
  fallback: number,
): number {
  return Number(targets.getInput(id)?.value ?? fallback);
}

function getInputValueAsNumber(
  targets: EngineGenerationSettingsTargets,
  id: string,
  fallback: number,
): number {
  return targets.getInput(id)?.valueAsNumber || fallback;
}

export function createGenerationSettings(
  targets: EngineGenerationSettingsTargets,
): EngineGenerationSettings {
  const cultureSetInput = targets.getSelect("culturesSet");

  return {
    heightmapTemplateId: targets.getInput("templateInput")?.value,
    pointsCount: Number(targets.getPointsInput()?.dataset?.cells ?? 0),
    heightExponent: Number(targets.getHeightExponentInput()?.value ?? 1),
    lakeElevationLimit: getInputNumber(targets, "lakeElevationLimitOutput", 0),
    resolveDepressionsSteps: getInputNumber(
      targets,
      "resolveDepressionsStepsOutput",
      0,
    ),
    statesCount: getInputNumber(targets, "statesNumber", 0),
    manorsCount: getInputNumber(targets, "manorsInput", 1000),
    religionsCount: getInputNumber(targets, "religionsNumber", 0),
    provincesRatio: getInputValueAsNumber(targets, "provincesRatio", 100),
    culturesCount: getInputNumber(targets, "culturesInput", 0),
    cultureSet: cultureSetInput?.value ?? "random",
    cultureSetMax: Number(
      cultureSetInput?.selectedOptions?.[0]?.dataset?.max ?? 0,
    ),
    cultureEmblemShape: targets.getInput("emblemShape")?.value ?? "",
    cultureNeutralRate: getInputValueAsNumber(targets, "neutralRate", 1),
    stateSizeVariety: getInputValueAsNumber(targets, "sizeVariety", 1),
    globalGrowthRate: getInputValueAsNumber(targets, "growthRate", 1),
    statesGrowthRate: getInputValueAsNumber(targets, "statesGrowthRate", 1),
  };
}

export function createGlobalGenerationSettings(): EngineGenerationSettings {
  return createGenerationSettings(createGlobalGenerationSettingsTargets());
}

export function createGenerationSettingsStore(
  getSettings: () => EngineGenerationSettings,
  setSettings: (nextSettings: EngineGenerationSettings) => void,
  readSettings: (
    targets?: EngineGenerationSettingsTargets,
  ) => EngineGenerationSettings = (
    targets = createGlobalGenerationSettingsTargets(),
  ) => createGenerationSettings(targets),
): EngineGenerationSettingsStore {
  return {
    get: getSettings,
    replace: (nextSettings) => {
      setSettings(nextSettings);
      return nextSettings;
    },
    patch: (patch) => {
      const nextSettings = { ...getSettings(), ...patch };
      setSettings(nextSettings);
      return nextSettings;
    },
    refresh: (targets) => {
      const nextSettings = readSettings(targets);
      setSettings(nextSettings);
      return nextSettings;
    },
  };
}

export function createRuntimeGenerationSettingsStore(
  context: EngineRuntimeContext,
): EngineGenerationSettingsStore {
  return createGenerationSettingsStore(
    () => context.generationSettings,
    (nextSettings) => {
      context.generationSettings = nextSettings;
    },
  );
}

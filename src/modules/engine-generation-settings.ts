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
  getGlobalInput: (name: string) => EngineGenerationControlInput | undefined;
};

export function createGlobalGenerationSettingsTargets(): EngineGenerationSettingsTargets {
  return {
    getInput: (id) => document.getElementById(id) as HTMLInputElement | null,
    getSelect: (id) => document.getElementById(id) as HTMLSelectElement | null,
    getGlobalInput: (name) =>
      globalThis[name as keyof typeof globalThis] as
        | HTMLInputElement
        | undefined,
  };
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
    pointsCount: Number(
      targets.getGlobalInput("pointsInput")?.dataset?.cells ?? 0,
    ),
    heightExponent: Number(
      targets.getGlobalInput("heightExponentInput")?.value ?? 1,
    ),
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

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

function getInput(id: string): HTMLInputElement | null {
  return document.getElementById(id) as HTMLInputElement | null;
}

function getSelect(id: string): HTMLSelectElement | null {
  return document.getElementById(id) as HTMLSelectElement | null;
}

function getGlobalInput(name: string): HTMLInputElement | undefined {
  return globalThis[name as keyof typeof globalThis] as
    | HTMLInputElement
    | undefined;
}

function getInputNumber(id: string, fallback: number): number {
  return Number(getInput(id)?.value ?? fallback);
}

function getInputValueAsNumber(id: string, fallback: number): number {
  return getInput(id)?.valueAsNumber || fallback;
}

export function createGlobalGenerationSettings(): EngineGenerationSettings {
  const cultureSetInput = getSelect("culturesSet");

  return {
    heightmapTemplateId: getInput("templateInput")?.value,
    pointsCount: Number(getGlobalInput("pointsInput")?.dataset?.cells ?? 0),
    heightExponent: Number(getGlobalInput("heightExponentInput")?.value ?? 1),
    lakeElevationLimit: getInputNumber("lakeElevationLimitOutput", 0),
    resolveDepressionsSteps: getInputNumber("resolveDepressionsStepsOutput", 0),
    statesCount: getInputNumber("statesNumber", 0),
    manorsCount: getInputNumber("manorsInput", 1000),
    religionsCount: getInputNumber("religionsNumber", 0),
    provincesRatio: getInputValueAsNumber("provincesRatio", 100),
    culturesCount: getInputNumber("culturesInput", 0),
    cultureSet: cultureSetInput?.value ?? "random",
    cultureSetMax: Number(
      cultureSetInput?.selectedOptions?.[0]?.dataset?.max ?? 0,
    ),
    cultureEmblemShape: getInput("emblemShape")?.value ?? "",
    cultureNeutralRate: getInputValueAsNumber("neutralRate", 1),
    stateSizeVariety: getInputValueAsNumber("sizeVariety", 1),
    globalGrowthRate: getInputValueAsNumber("growthRate", 1),
    statesGrowthRate: getInputValueAsNumber("statesGrowthRate", 1),
  };
}

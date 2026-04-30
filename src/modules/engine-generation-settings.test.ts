import { afterEach, describe, expect, it } from "vitest";
import { createGlobalGenerationSettings } from "./engine-generation-settings";

const originalDocument = globalThis.document;
const originalPointsInput = globalThis.pointsInput;
const originalHeightExponentInput = globalThis.heightExponentInput;

function installDocument(
  controls: Record<string, Partial<HTMLInputElement | HTMLSelectElement>>,
): void {
  globalThis.document = {
    getElementById: (id: string) => controls[id] ?? null,
  } as unknown as Document;
}

describe("createGlobalGenerationSettings", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.pointsInput = originalPointsInput;
    globalThis.heightExponentInput = originalHeightExponentInput;
  });

  it("uses stable defaults when optional generation controls are absent", () => {
    installDocument({});
    globalThis.pointsInput = undefined as unknown as HTMLInputElement;
    globalThis.heightExponentInput = undefined as unknown as HTMLInputElement;

    expect(createGlobalGenerationSettings()).toEqual({
      heightmapTemplateId: undefined,
      pointsCount: 0,
      heightExponent: 1,
      lakeElevationLimit: 0,
      resolveDepressionsSteps: 0,
      statesCount: 0,
      manorsCount: 1000,
      religionsCount: 0,
      provincesRatio: 100,
      culturesCount: 0,
      cultureSet: "random",
      cultureSetMax: 0,
      cultureEmblemShape: "",
      cultureNeutralRate: 1,
      stateSizeVariety: 1,
      globalGrowthRate: 1,
      statesGrowthRate: 1,
    });
  });

  it("reads generation settings from global controls and DOM controls", () => {
    installDocument({
      templateInput: { value: "continents" },
      lakeElevationLimitOutput: { value: "19" },
      resolveDepressionsStepsOutput: { value: "4" },
      statesNumber: { value: "32" },
      manorsInput: { value: "900" },
      religionsNumber: { value: "7" },
      provincesRatio: { valueAsNumber: 67 },
      culturesInput: { value: "11" },
      culturesSet: {
        selectedOptions: [{ dataset: { max: "14" } }] as any,
        value: "european",
      },
      emblemShape: { value: "heater" },
      neutralRate: { valueAsNumber: 1.25 },
      sizeVariety: { valueAsNumber: 1.5 },
      growthRate: { valueAsNumber: 1.75 },
      statesGrowthRate: { valueAsNumber: 2 },
    });
    globalThis.pointsInput = {
      dataset: { cells: "12000" },
    } as unknown as HTMLInputElement;
    globalThis.heightExponentInput = {
      value: "1.8",
    } as HTMLInputElement;

    expect(createGlobalGenerationSettings()).toMatchObject({
      heightmapTemplateId: "continents",
      pointsCount: 12000,
      heightExponent: 1.8,
      lakeElevationLimit: 19,
      resolveDepressionsSteps: 4,
      statesCount: 32,
      manorsCount: 900,
      religionsCount: 7,
      provincesRatio: 67,
      culturesCount: 11,
      cultureSet: "european",
      cultureSetMax: 14,
      cultureEmblemShape: "heater",
      cultureNeutralRate: 1.25,
      stateSizeVariety: 1.5,
      globalGrowthRate: 1.75,
      statesGrowthRate: 2,
    });
  });
});

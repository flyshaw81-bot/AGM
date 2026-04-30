import { afterEach, describe, expect, it } from "vitest";
import {
  createGenerationSettings,
  createGenerationSettingsStore,
  createGlobalGenerationSettings,
  createRuntimeGenerationSettingsStore,
  type EngineGenerationSettingsTargets,
} from "./engine-generation-settings";
import type { EngineRuntimeContext } from "./engine-runtime-context";

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

function createTargets(
  controls: Record<string, Partial<HTMLInputElement | HTMLSelectElement>>,
  globals: Record<string, Partial<HTMLInputElement>> = {},
): EngineGenerationSettingsTargets {
  return {
    getInput: (id) => controls[id] ?? null,
    getSelect: (id) => controls[id] ?? null,
    getGlobalInput: (name) => globals[name],
  };
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

  it("can read generation settings through explicit targets without globals", () => {
    expect(
      createGenerationSettings(
        createTargets(
          {
            templateInput: { value: "volcano" },
            lakeElevationLimitOutput: { value: "22" },
            resolveDepressionsStepsOutput: { value: "3" },
            statesNumber: { value: "17" },
            manorsInput: { value: "800" },
            religionsNumber: { value: "5" },
            provincesRatio: { valueAsNumber: 55 },
            culturesInput: { value: "9" },
            culturesSet: {
              selectedOptions: [{ dataset: { max: "12" } }] as any,
              value: "oriental",
            },
            emblemShape: { value: "round" },
            neutralRate: { valueAsNumber: 1.1 },
            sizeVariety: { valueAsNumber: 2.2 },
            growthRate: { valueAsNumber: 1.4 },
            statesGrowthRate: { valueAsNumber: 1.7 },
          },
          {
            pointsInput: { dataset: { cells: "18000" } },
            heightExponentInput: { value: "2.4" },
          },
        ),
      ),
    ).toMatchObject({
      heightmapTemplateId: "volcano",
      pointsCount: 18000,
      heightExponent: 2.4,
      lakeElevationLimit: 22,
      resolveDepressionsSteps: 3,
      statesCount: 17,
      manorsCount: 800,
      religionsCount: 5,
      provincesRatio: 55,
      culturesCount: 9,
      cultureSet: "oriental",
      cultureSetMax: 12,
      cultureEmblemShape: "round",
      cultureNeutralRate: 1.1,
      stateSizeVariety: 2.2,
      globalGrowthRate: 1.4,
      statesGrowthRate: 1.7,
    });
  });

  it("stores, patches, and refreshes generation settings through a runtime store", () => {
    const context = {
      generationSettings: createGenerationSettings(
        createTargets(
          {},
          {
            pointsInput: { dataset: { cells: "1000" } },
          },
        ),
      ),
    } as unknown as EngineRuntimeContext;
    const store = createRuntimeGenerationSettingsStore(context);

    store.patch({ statesCount: 23, cultureSet: "world" });

    expect(context.generationSettings.statesCount).toBe(23);
    expect(store.get().cultureSet).toBe("world");

    store.refresh(
      createTargets(
        {
          religionsNumber: { value: "8" },
          culturesSet: { value: "darkFantasy" },
        },
        {
          pointsInput: { dataset: { cells: "24000" } },
          heightExponentInput: { value: "1.6" },
        },
      ),
    );

    expect(context.generationSettings.pointsCount).toBe(24000);
    expect(context.generationSettings.heightExponent).toBe(1.6);
    expect(context.generationSettings.religionsCount).toBe(8);
    expect(context.generationSettings.cultureSet).toBe("darkFantasy");
  });

  it("can compose a generation settings store from explicit getters and setters", () => {
    let settings = createGenerationSettings(createTargets({}));
    const store = createGenerationSettingsStore(
      () => settings,
      (nextSettings) => {
        settings = nextSettings;
      },
      () =>
        createGenerationSettings(
          createTargets(
            { statesNumber: { value: "31" } },
            { pointsInput: { dataset: { cells: "9000" } } },
          ),
        ),
    );

    expect(store.patch({ culturesCount: 12 }).culturesCount).toBe(12);
    expect(store.refresh().statesCount).toBe(31);
    expect(settings.pointsCount).toBe(9000);
  });
});

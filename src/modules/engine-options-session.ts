import { rn } from "../utils/numberUtils";
import { gauss, P, rand, rw } from "../utils/probabilityUtils";

export function shouldForceDefaultOptions(
  searchParams: URLSearchParams,
): boolean {
  return searchParams.get("options") === "default";
}

export type EngineOptionsControlAdapter = {
  getSearchParams: () => URLSearchParams;
  isLocked: (settingId: string) => boolean;
  isStored: (settingId: string) => boolean;
  usesUsUnits: () => boolean;
};

export type EngineOptionsWriterAdapter = {
  setCellsDensity: (density: number) => void;
  applyHeightmapTemplate: (template: string, name: string) => void;
  setStatesCount: (value: number) => void;
  setProvincesRatio: (value: number) => void;
  setManorsAuto: () => void;
  setReligionsCount: (value: number) => void;
  setSizeVariety: (value: number) => void;
  setGrowthRate: (value: number) => void;
  setCulturesCount: (value: number) => void;
  setCultureSet: (value: string) => void;
  setTemperatureEquator: (value: number) => void;
  setTemperatureNorthPole: (value: number) => void;
  setTemperatureSouthPole: (value: number) => void;
  setPrecipitation: (value: number) => void;
  setDistanceScale: (value: number) => void;
  setDistanceUnit: (value: string) => void;
  setHeightUnit: (value: string) => void;
  setTemperatureScale: (value: string) => void;
  setYear: (value: number) => void;
  setEra: (value: string) => void;
  syncEraOptions: () => void;
};

export type EngineOptionsReaderAdapter = {
  getHeightmapTemplateWeights: () => Record<string, number>;
  getHeightmapTemplateName: (template: string) => string;
  getCultureSetWeights: () => Record<string, number>;
};

export type EngineOptionsNamingAdapter = {
  generateEraName: () => string;
};

export type EngineOptionsRandomAdapter = {
  random: () => number;
  gauss: typeof gauss;
  rand: typeof rand;
  rw: typeof rw;
};

export function createGlobalOptionsControlAdapter(): EngineOptionsControlAdapter {
  return {
    getSearchParams: () => new URL(location.href).searchParams,
    isLocked: (settingId) => locked(settingId),
    isStored: (settingId) => (globalThis as any).stored(settingId),
    usesUsUnits: () => navigator.language === "en-US",
  };
}

export function createGlobalOptionsReaderAdapter(): EngineOptionsReaderAdapter {
  return {
    getHeightmapTemplateWeights: () => {
      const templates: Record<string, number> = {};
      for (const key in heightmapTemplates) {
        templates[key] = heightmapTemplates[key].probability || 0;
      }

      return templates;
    },
    getHeightmapTemplateName: (template) => heightmapTemplates[template].name,
    getCultureSetWeights: () => ({
      world: 10,
      european: 10,
      oriental: 2,
      english: 5,
      antique: 3,
      highFantasy: 11,
      darkFantasy: 3,
      random: 1,
    }),
  };
}

export function createGlobalOptionsNamingAdapter(): EngineOptionsNamingAdapter {
  return {
    generateEraName: () =>
      `${Names.getBaseShort(P(0.7) ? 1 : rand(nameBases.length))} Era`,
  };
}

export function createGlobalOptionsRandomAdapter(): EngineOptionsRandomAdapter {
  return {
    random: () => Math.random(),
    gauss,
    rand,
    rw,
  };
}

export function createGlobalOptionsWriterAdapter(): EngineOptionsWriterAdapter {
  return {
    setCellsDensity: (density) =>
      (globalThis as any).changeCellsDensity(density),
    applyHeightmapTemplate: (template, name) =>
      (globalThis as any).applyOption(
        (globalThis as any).byId("templateInput"),
        template,
        name,
      ),
    setStatesCount: (value) => {
      (globalThis as any).statesNumber.value = value;
    },
    setProvincesRatio: (value) => {
      (globalThis as any).provincesRatio.value = value;
    },
    setManorsAuto: () => {
      (globalThis as any).manorsInput.value = 1000;
      (globalThis as any).manorsOutput.value = "auto";
    },
    setReligionsCount: (value) => {
      religionsNumber.value = String(value);
    },
    setSizeVariety: (value) => {
      (globalThis as any).sizeVariety.value = value;
    },
    setGrowthRate: (value) => {
      (globalThis as any).growthRate.value = value;
    },
    setCulturesCount: (value) => {
      culturesInput.value = (globalThis as any).culturesOutput.value =
        String(value);
    },
    setCultureSet: (value) => {
      culturesSet.value = value;
      (globalThis as any).changeCultureSet();
    },
    setTemperatureEquator: (value) => {
      options.temperatureEquator = value;
    },
    setTemperatureNorthPole: (value) => {
      options.temperatureNorthPole = value;
    },
    setTemperatureSouthPole: (value) => {
      options.temperatureSouthPole = value;
    },
    setPrecipitation: (value) => {
      precInput.value = (globalThis as any).precOutput.value = String(value);
    },
    setDistanceScale: (value) => {
      globalThis.distanceScale = (globalThis as any).distanceScaleInput.value =
        value;
    },
    setDistanceUnit: (value) => {
      distanceUnitInput.value = value;
    },
    setHeightUnit: (value) => {
      heightUnit.value = value;
    },
    setTemperatureScale: (value) => {
      (globalThis as any).temperatureScale.value = value;
    },
    setYear: (value) => {
      (globalThis as any).yearInput.value = value;
    },
    setEra: (value) => {
      (globalThis as any).eraInput.value = value;
    },
    syncEraOptions,
  };
}

function syncEraOptions() {
  options.year = +(globalThis as any).yearInput.value;
  options.era = (globalThis as any).eraInput.value;
  options.eraShort = options.era
    .split(" ")
    .map((word: string) => word[0].toUpperCase())
    .join("");
}

export class EngineOptionsSessionModule {
  randomizeOptions: (searchParams?: URLSearchParams) => void;
  randomizeHeightmapTemplate: () => void;
  randomizeCultureSet: () => void;
  generateEra: () => void;

  constructor(
    controls: EngineOptionsControlAdapter = createGlobalOptionsControlAdapter(),
    writer: EngineOptionsWriterAdapter = createGlobalOptionsWriterAdapter(),
    reader: EngineOptionsReaderAdapter = createGlobalOptionsReaderAdapter(),
    naming: EngineOptionsNamingAdapter = createGlobalOptionsNamingAdapter(),
    random: EngineOptionsRandomAdapter = createGlobalOptionsRandomAdapter(),
  ) {
    const isEditable = (settingId: string, forceDefault: boolean): boolean =>
      forceDefault || !controls.isLocked(settingId);

    this.randomizeHeightmapTemplate = () => {
      const template = random.rw(reader.getHeightmapTemplateWeights());
      const name = reader.getHeightmapTemplateName(template);
      writer.applyHeightmapTemplate(template, name);
    };

    this.randomizeCultureSet = () => {
      writer.setCultureSet(random.rw(reader.getCultureSetWeights()));
    };

    this.generateEra = () => {
      if (!controls.isStored("year")) {
        writer.setYear(random.rand(100, 2000));
      }
      if (!controls.isStored("era")) {
        writer.setEra(naming.generateEraName());
      }
      writer.syncEraOptions();
    };

    this.randomizeOptions = (searchParams = controls.getSearchParams()) => {
      const forceDefault = shouldForceDefaultOptions(searchParams);

      if (isEditable("points", forceDefault)) {
        writer.setCellsDensity(4);
      }
      if (isEditable("template", forceDefault)) {
        this.randomizeHeightmapTemplate();
      }
      if (isEditable("statesNumber", forceDefault)) {
        writer.setStatesCount(random.gauss(18, 5, 2, 30));
      }
      if (isEditable("provincesRatio", forceDefault)) {
        writer.setProvincesRatio(random.gauss(20, 10, 20, 100));
      }
      if (isEditable("manors", forceDefault)) {
        writer.setManorsAuto();
      }
      if (isEditable("religionsNumber", forceDefault)) {
        writer.setReligionsCount(random.gauss(6, 3, 2, 10));
      }
      if (isEditable("sizeVariety", forceDefault)) {
        writer.setSizeVariety(random.gauss(4, 2, 0, 10, 1));
      }
      if (isEditable("growthRate", forceDefault)) {
        writer.setGrowthRate(rn(1 + random.random(), 1));
      }
      if (isEditable("cultures", forceDefault)) {
        writer.setCulturesCount(random.gauss(12, 3, 5, 30));
      }
      if (isEditable("culturesSet", forceDefault)) {
        this.randomizeCultureSet();
      }

      if (isEditable("temperatureEquator", forceDefault)) {
        writer.setTemperatureEquator(random.gauss(25, 7, 20, 35, 0));
      }
      if (isEditable("temperatureNorthPole", forceDefault)) {
        writer.setTemperatureNorthPole(random.gauss(-25, 7, -40, 10, 0));
      }
      if (isEditable("temperatureSouthPole", forceDefault)) {
        writer.setTemperatureSouthPole(random.gauss(-15, 7, -40, 10, 0));
      }
      if (isEditable("prec", forceDefault)) {
        writer.setPrecipitation(random.gauss(100, 40, 5, 500));
      }

      const usesUsUnits = controls.usesUsUnits();
      if (isEditable("distanceScale", forceDefault)) {
        writer.setDistanceScale(random.gauss(3, 1, 1, 5));
      }
      if (!controls.isStored("distanceUnit")) {
        writer.setDistanceUnit(usesUsUnits ? "mi" : "km");
      }
      if (!controls.isStored("heightUnit")) {
        writer.setHeightUnit(usesUsUnits ? "ft" : "m");
      }
      if (!controls.isStored("temperatureScale")) {
        writer.setTemperatureScale(usesUsUnits ? "\u00b0F" : "\u00b0C");
      }

      this.generateEra();
    };
  }
}

export const EngineOptionsSession = new EngineOptionsSessionModule();

if (typeof window !== "undefined") {
  (
    window as typeof window & {
      EngineOptionsSession: EngineOptionsSessionModule;
    }
  ).EngineOptionsSession = EngineOptionsSession;
}

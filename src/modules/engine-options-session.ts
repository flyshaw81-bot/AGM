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
  constructor(
    private readonly controls: EngineOptionsControlAdapter = createGlobalOptionsControlAdapter(),
    private readonly writer: EngineOptionsWriterAdapter = createGlobalOptionsWriterAdapter(),
    private readonly reader: EngineOptionsReaderAdapter = createGlobalOptionsReaderAdapter(),
    private readonly naming: EngineOptionsNamingAdapter = createGlobalOptionsNamingAdapter(),
  ) {}

  private isEditable(settingId: string, forceDefault: boolean): boolean {
    return forceDefault || !this.controls.isLocked(settingId);
  }

  randomizeOptions(searchParams = this.controls.getSearchParams()) {
    const forceDefault = shouldForceDefaultOptions(searchParams);

    if (this.isEditable("points", forceDefault)) {
      this.writer.setCellsDensity(4);
    }
    if (this.isEditable("template", forceDefault)) {
      this.randomizeHeightmapTemplate();
    }
    if (this.isEditable("statesNumber", forceDefault)) {
      this.writer.setStatesCount(gauss(18, 5, 2, 30));
    }
    if (this.isEditable("provincesRatio", forceDefault)) {
      this.writer.setProvincesRatio(gauss(20, 10, 20, 100));
    }
    if (this.isEditable("manors", forceDefault)) {
      this.writer.setManorsAuto();
    }
    if (this.isEditable("religionsNumber", forceDefault)) {
      this.writer.setReligionsCount(gauss(6, 3, 2, 10));
    }
    if (this.isEditable("sizeVariety", forceDefault)) {
      this.writer.setSizeVariety(gauss(4, 2, 0, 10, 1));
    }
    if (this.isEditable("growthRate", forceDefault)) {
      this.writer.setGrowthRate(rn(1 + Math.random(), 1));
    }
    if (this.isEditable("cultures", forceDefault)) {
      this.writer.setCulturesCount(gauss(12, 3, 5, 30));
    }
    if (this.isEditable("culturesSet", forceDefault)) {
      this.randomizeCultureSet();
    }

    if (this.isEditable("temperatureEquator", forceDefault)) {
      this.writer.setTemperatureEquator(gauss(25, 7, 20, 35, 0));
    }
    if (this.isEditable("temperatureNorthPole", forceDefault)) {
      this.writer.setTemperatureNorthPole(gauss(-25, 7, -40, 10, 0));
    }
    if (this.isEditable("temperatureSouthPole", forceDefault)) {
      this.writer.setTemperatureSouthPole(gauss(-15, 7, -40, 10, 0));
    }
    if (this.isEditable("prec", forceDefault)) {
      this.writer.setPrecipitation(gauss(100, 40, 5, 500));
    }

    const usesUsUnits = this.controls.usesUsUnits();
    if (this.isEditable("distanceScale", forceDefault)) {
      this.writer.setDistanceScale(gauss(3, 1, 1, 5));
    }
    if (!this.controls.isStored("distanceUnit")) {
      this.writer.setDistanceUnit(usesUsUnits ? "mi" : "km");
    }
    if (!this.controls.isStored("heightUnit")) {
      this.writer.setHeightUnit(usesUsUnits ? "ft" : "m");
    }
    if (!this.controls.isStored("temperatureScale")) {
      this.writer.setTemperatureScale(usesUsUnits ? "\u00b0F" : "\u00b0C");
    }

    this.generateEra();
  }

  randomizeHeightmapTemplate() {
    const template = rw(this.reader.getHeightmapTemplateWeights());
    const name = this.reader.getHeightmapTemplateName(template);
    this.writer.applyHeightmapTemplate(template, name);
  }

  randomizeCultureSet() {
    this.writer.setCultureSet(rw(this.reader.getCultureSetWeights()));
  }

  generateEra() {
    if (!this.controls.isStored("year")) {
      this.writer.setYear(rand(100, 2000));
    }
    if (!this.controls.isStored("era")) {
      this.writer.setEra(this.naming.generateEraName());
    }
    this.writer.syncEraOptions();
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

import { afterEach, describe, expect, it } from "vitest";
import {
  createGlobalProjectFormTargets,
  createProjectFormTargets,
} from "./engineProjectFormTargets";

type TestFormGlobals = typeof globalThis & {
  options?: {
    winds?: unknown[];
    temperatureEquator?: unknown;
    temperatureNorthPole?: unknown;
    temperatureSouthPole?: unknown;
  };
  convertTemperature?: (value: number, unit: string) => unknown;
  mapSizePercent?: number;
  latitudePercent?: number;
  longitudePercent?: number;
};

const testGlobals = globalThis as TestFormGlobals;
const originalDocument = globalThis.document;
const originalOptions = testGlobals.options;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalOptionsDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "options",
);
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

describe("createGlobalProjectFormTargets", () => {
  afterEach(() => {
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
    } else {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        writable: true,
        value: originalDocument,
      });
    }
    if (originalOptionsDescriptor) {
      Object.defineProperty(globalThis, "options", originalOptionsDescriptor);
    } else {
      Object.defineProperty(globalThis, "options", {
        configurable: true,
        writable: true,
        value: originalOptions,
      });
    }
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
  });

  it("reads inputs, outputs, text, and visibility from the active document", () => {
    const elements = new Map<string, unknown>([
      ["pointsInput", { value: "10000" }],
      ["pointsOutputFormatted", { value: "", textContent: "10k" }],
      ["statusText", { textContent: "ready" }],
      ["savePresetButton", { style: { display: "inline-block" } }],
    ]);
    globalThis.document = {
      getElementById: (id: string) => elements.get(id) ?? null,
    } as unknown as Document;

    const targets = createGlobalProjectFormTargets();

    expect(targets.getInputValue("pointsInput")).toBe("10000");
    expect(targets.getOutputValue("pointsOutputFormatted")).toBe("10k");
    expect(targets.getTextValue("statusText")).toBe("ready");
    expect(targets.hasVisibleInlineDisplay("savePresetButton")).toBe(true);
  });

  it("reads select option metadata", () => {
    const select = {
      value: "european",
      selectedOptions: [{ textContent: "European" }],
      options: [
        {
          value: "european",
          textContent: "European",
          dataset: { max: "12" },
        },
      ],
    } as unknown as HTMLSelectElement;

    const targets = createGlobalProjectFormTargets();

    expect(targets.getSelectValue(select)).toBe("european");
    expect(targets.getSelectedOptionLabel(select)).toBe("European");
    expect(targets.getSelectOptions(select)).toEqual([
      { value: "european", label: "European" },
    ]);
    expect(targets.getCultureSetOptions(select)).toEqual([
      { value: "european", label: "European", max: "12" },
    ]);
  });

  it("reads wind values from runtime options", () => {
    testGlobals.options = {
      winds: [0, 45],
    };

    const targets = createGlobalProjectFormTargets();

    expect(targets.getWindOption(0)).toBe("0");
    expect(targets.getWindOption(1)).toBe("45");
  });

  it("keeps default form targets safe when document and options are absent", () => {
    globalThis.document = undefined as unknown as Document;
    testGlobals.options = undefined;

    const targets = createGlobalProjectFormTargets();

    expect(targets.getInputValue("pointsInput", "10000")).toBe("10000");
    expect(targets.getOutputValue("pointsOutputFormatted", "10k")).toBe("10k");
    expect(targets.getTextValue("statusText", "ready")).toBe("ready");
    expect(targets.getSelect("templateInput")).toBeNull();
    expect(targets.hasVisibleInlineDisplay("savePresetButton")).toBe(false);
    expect(targets.hasVisibleInlineDisplay("savePresetButton", true)).toBe(
      true,
    );
    expect(targets.getWindOption(1)).toBe("");
  });

  it("keeps default form targets safe when browser globals throw", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "options", {
      configurable: true,
      get: () => {
        throw new Error("options blocked");
      },
    });

    const targets = createGlobalProjectFormTargets();

    expect(targets.getInputValue("pointsInput", "10000")).toBe("10000");
    expect(targets.getOutputValue("pointsOutputFormatted", "10k")).toBe("10k");
    expect(targets.getTextValue("statusText", "ready")).toBe("ready");
    expect(targets.getSelect("templateInput")).toBeNull();
    expect(targets.hasVisibleInlineDisplay("savePresetButton")).toBe(false);
    expect(targets.getWindOption(1)).toBe("");
  });

  it("can read form values from injected DOM and runtime adapters", () => {
    const elements = new Map<string, HTMLElement>([
      ["pointsInput", { value: "20000" } as HTMLInputElement],
      ["savePresetButton", { style: { display: "none" } } as HTMLElement],
    ]);
    const targets = createProjectFormTargets(
      {
        getElementById: (id) => elements.get(id) ?? null,
      },
      {
        getWinds: () => [0, 45, 90],
        getPrecipitationPercent: () => 120,
        getTemperatureOption: (key) =>
          ({
            temperatureEquator: 28,
            temperatureNorthPole: -10,
            temperatureSouthPole: -20,
          })[key],
        convertTemperature: (value) => `${value}F`,
        getMapPlacementPercent: (key) =>
          ({ mapSize: 80, latitude: 45, longitude: 15 })[key],
      },
    );

    expect(targets.getInputValue("pointsInput")).toBe("20000");
    expect(targets.getInputValue("precInput")).toBe("120");
    expect(targets.getTemperatureValue("temperatureEquator")).toBe("28");
    expect(targets.getTemperatureFahrenheitLabel("temperatureEquator")).toBe(
      "28F",
    );
    expect(targets.getMapPlacementValue("mapSize")).toBe("80");
    expect(targets.getMapPlacementValue("latitude")).toBe("45");
    expect(targets.getMapPlacementValue("longitude")).toBe("15");
    expect(targets.hasVisibleInlineDisplay("savePresetButton")).toBe(false);
    expect(targets.getWindOption(2)).toBe("90");
  });
});

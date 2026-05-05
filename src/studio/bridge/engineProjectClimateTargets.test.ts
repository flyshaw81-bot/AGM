import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalProjectClimateTargets,
  createProjectClimateTargets,
} from "./engineProjectClimateTargets";

type TestClimateGlobals = typeof globalThis & {
  updateGlobePosition?: () => void;
  drawBiomes?: () => void;
  ThreeD?: {
    update?: () => void;
  };
};

const testGlobals = globalThis as TestClimateGlobals;
const originalDocument = globalThis.document;
const originalPack = globalThis.pack;
const originalUpdateGlobePosition = testGlobals.updateGlobePosition;
const originalCalculateTemperatures = globalThis.calculateTemperatures;
const originalGeneratePrecipitation = globalThis.generatePrecipitation;
const originalRivers = globalThis.Rivers;
const originalBiomes = globalThis.Biomes;
const originalFeatures = globalThis.Features;
const originalLakes = globalThis.Lakes;
const originalLayerIsOn = globalThis.layerIsOn;
const originalDrawBiomes = testGlobals.drawBiomes;
const originalThreeD = testGlobals.ThreeD;
const originalWindow = globalThis.window;

describe("createGlobalProjectClimateTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.pack = originalPack;
    testGlobals.updateGlobePosition = originalUpdateGlobePosition;
    globalThis.calculateTemperatures = originalCalculateTemperatures;
    globalThis.generatePrecipitation = originalGeneratePrecipitation;
    globalThis.Rivers = originalRivers;
    globalThis.Biomes = originalBiomes;
    globalThis.Features = originalFeatures;
    globalThis.Lakes = originalLakes;
    globalThis.layerIsOn = originalLayerIsOn;
    testGlobals.drawBiomes = originalDrawBiomes;
    testGlobals.ThreeD = originalThreeD;
    globalThis.window = originalWindow;
  });

  it("reads the auto-apply checkbox when present", () => {
    globalThis.document = {
      getElementById: vi.fn(() => ({ checked: false })),
    } as unknown as Document;

    const targets = createGlobalProjectClimateTargets();

    expect(targets.shouldAutoApplyClimate()).toBe(false);
  });

  it("detects whether the climate pipeline is available", () => {
    globalThis.pack = {
      cells: {
        h: new Uint8Array([1, 2]),
      },
    } as unknown as typeof pack;
    globalThis.calculateTemperatures = vi.fn();
    globalThis.generatePrecipitation = vi.fn();
    globalThis.Rivers = {
      generate: vi.fn(),
      specify: vi.fn(),
    } as unknown as typeof Rivers;
    globalThis.Biomes = {
      define: vi.fn(),
    } as unknown as typeof Biomes;
    globalThis.Features = {
      defineGroups: vi.fn(),
    } as unknown as typeof Features;
    globalThis.Lakes = {
      defineNames: vi.fn(),
    } as unknown as typeof Lakes;

    const targets = createGlobalProjectClimateTargets();

    expect(targets.canApplyClimatePipeline()).toBe(true);
  });

  it("clones and restores pack heights around river generation", () => {
    globalThis.pack = {
      cells: {
        h: new Uint8Array([4, 5, 6]),
      },
    } as unknown as typeof pack;

    const targets = createGlobalProjectClimateTargets();
    const heights = targets.cloneHeights();
    expect(heights).toEqual(new Uint8Array([4, 5, 6]));

    targets.restoreHeights(new Uint8Array([7, 8]));

    expect(globalThis.pack.cells.h).toEqual(new Float32Array([7, 8]));
  });

  it("forwards layer redraws and 3D refresh through global helpers", () => {
    const drawBiomes = vi.fn();
    const updateThreeD = vi.fn();
    globalThis.layerIsOn = vi.fn((layer) => layer === "toggleBiomes");
    testGlobals.drawBiomes = drawBiomes;
    testGlobals.ThreeD = { update: updateThreeD };
    globalThis.document = {
      getElementById: vi.fn((id) => (id === "canvas3d" ? {} : null)),
    } as unknown as Document;

    const targets = createGlobalProjectClimateTargets();

    expect(targets.isLayerOn("toggleBiomes")).toBe(true);
    targets.drawBiomes();
    expect(targets.hasCanvas3d()).toBe(true);
    targets.updateThreeD();

    expect(drawBiomes).toHaveBeenCalledWith();
    expect(updateThreeD).toHaveBeenCalledWith();
  });

  it("keeps climate targets safe when browser DOM and scheduler are absent", () => {
    globalThis.document = undefined as unknown as Document;
    globalThis.window = {} as Window & typeof globalThis;

    const targets = createGlobalProjectClimateTargets();

    expect(targets.shouldAutoApplyClimate()).toBe(true);
    expect(targets.hasCanvas3d()).toBe(false);
    expect(targets.canUpdateGlobePosition()).toBe(false);
    expect(targets.canApplyClimatePipeline()).toBe(false);
    expect(targets.cloneHeights()).toBeUndefined();
    expect(() => targets.schedule(vi.fn(), 10)).not.toThrow();
  });

  it("composes climate targets from injected DOM, pipeline, renderer, and scheduler adapters", () => {
    const calculateTemperatures = vi.fn();
    const drawBiomes = vi.fn();
    const schedule = vi.fn();
    const heights = new Uint8Array([1, 2]);
    const targets = createProjectClimateTargets(
      {
        shouldAutoApplyClimate: () => false,
        hasCanvas3d: () => true,
      },
      {
        canUpdateGlobePosition: () => true,
        canApplyClimatePipeline: () => true,
        updateGlobeTemperature: vi.fn(),
        updateGlobePosition: vi.fn(),
        calculateTemperatures,
        generatePrecipitation: vi.fn(),
        cloneHeights: () => heights,
        generateRivers: vi.fn(),
        specifyRivers: vi.fn(),
        restoreHeights: vi.fn(),
        defineBiomes: vi.fn(),
        defineFeatureGroups: vi.fn(),
        defineLakeNames: vi.fn(),
      },
      {
        isLayerOn: () => true,
        drawTemperature: vi.fn(),
        drawPrecipitation: vi.fn(),
        drawBiomes,
        drawCoordinates: vi.fn(),
        drawRivers: vi.fn(),
        updateThreeD: vi.fn(),
      },
      {
        schedule,
      },
    );

    expect(targets.shouldAutoApplyClimate()).toBe(false);
    expect(targets.canApplyClimatePipeline()).toBe(true);
    targets.calculateTemperatures();
    expect(calculateTemperatures).toHaveBeenCalledWith();
    expect(targets.cloneHeights()).toBe(heights);
    expect(targets.isLayerOn("toggleBiomes")).toBe(true);
    targets.drawBiomes();
    expect(drawBiomes).toHaveBeenCalledWith();
    expect(targets.hasCanvas3d()).toBe(true);
    const callback = vi.fn();
    targets.schedule(callback, 10);
    expect(schedule).toHaveBeenCalledWith(callback, 10);
  });
});

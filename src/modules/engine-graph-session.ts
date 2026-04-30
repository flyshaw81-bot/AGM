import type { EngineRuntimeContext } from "./engine-runtime-context";

declare global {
  var EngineGraphSession: EngineGraphSessionModule;
}

type AttributeTarget = {
  attr: (name: string, value: unknown) => AttributeTarget;
  select?: (selector: string) => AttributeTarget;
  selectAll?: (selector: string) => AttributeTarget;
};

function setRectBounds(target: AttributeTarget, width: number, height: number) {
  target.attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);
}

export type EngineGraphSessionTargets = {
  getMapWidth: () => number;
  getMapHeight: () => number;
  setGraphSize: (width: number, height: number) => void;
  setRectBounds: (
    target: AttributeTarget,
    width: number,
    height: number,
  ) => void;
  getLandmassRect: () => AttributeTarget;
  getOceanPatternRect: () => AttributeTarget;
  getOceanLayersRect: () => AttributeTarget;
  getFoggingRects: () => AttributeTarget;
  getFogMaskRect: () => AttributeTarget;
  getWaterMaskRect: () => AttributeTarget;
};

export type EngineGraphRuntimeTargets = Pick<
  EngineGraphSessionTargets,
  "getMapWidth" | "getMapHeight" | "setGraphSize"
>;

export type EngineGraphSvgTargets = Pick<
  EngineGraphSessionTargets,
  | "getLandmassRect"
  | "getOceanPatternRect"
  | "getOceanLayersRect"
  | "getFoggingRects"
  | "getFogMaskRect"
  | "getWaterMaskRect"
>;

export class EngineGraphSessionModule {
  applyGraphSize: () => void;

  constructor(
    targets: EngineGraphSessionTargets = createGlobalGraphSessionTargets(),
  ) {
    this.applyGraphSize = () => {
      const graphWidth = targets.getMapWidth();
      const graphHeight = targets.getMapHeight();
      targets.setGraphSize(graphWidth, graphHeight);

      targets.setRectBounds(targets.getLandmassRect(), graphWidth, graphHeight);
      targets.setRectBounds(
        targets.getOceanPatternRect(),
        graphWidth,
        graphHeight,
      );
      targets.setRectBounds(
        targets.getOceanLayersRect(),
        graphWidth,
        graphHeight,
      );
      targets.setRectBounds(targets.getFoggingRects(), graphWidth, graphHeight);
      targets
        .getFogMaskRect()
        .attr("width", graphWidth)
        .attr("height", graphHeight);
      targets
        .getWaterMaskRect()
        .attr("width", graphWidth)
        .attr("height", graphHeight);
    };
  }
}

export function createGlobalGraphRuntimeTargets(): EngineGraphRuntimeTargets {
  return {
    getMapWidth: () => Number((globalThis as any).mapWidthInput.value),
    getMapHeight: () => Number((globalThis as any).mapHeightInput.value),
    setGraphSize: (width, height) => {
      globalThis.graphWidth = width;
      globalThis.graphHeight = height;
    },
  };
}

export function createGlobalGraphSvgTargets(): EngineGraphSvgTargets {
  return {
    getLandmassRect: () => (globalThis as any).landmass.select("rect"),
    getOceanPatternRect: () => (globalThis as any).oceanPattern.select("rect"),
    getOceanLayersRect: () =>
      globalThis.oceanLayers.select("rect") as unknown as AttributeTarget,
    getFoggingRects: () => (globalThis as any).fogging.selectAll("rect"),
    getFogMaskRect: () => (globalThis as any).defs.select("mask#fog > rect"),
    getWaterMaskRect: () =>
      (globalThis as any).defs.select("mask#water > rect"),
  };
}

export function createGlobalGraphSessionTargets(
  runtimeTargets: EngineGraphRuntimeTargets = createGlobalGraphRuntimeTargets(),
  svgTargets: EngineGraphSvgTargets = createGlobalGraphSvgTargets(),
): EngineGraphSessionTargets {
  return {
    ...runtimeTargets,
    setRectBounds,
    ...svgTargets,
  };
}

export function createRuntimeGraphSessionTargets(
  context: EngineRuntimeContext,
  fallback: EngineGraphSessionTargets = createGlobalGraphSessionTargets(),
): EngineGraphSessionTargets {
  const getWorldSettings = () =>
    context.worldSettingsStore?.get() ?? context.worldSettings;

  return {
    getMapWidth: () =>
      Number(getWorldSettings().graphWidth) || fallback.getMapWidth(),
    getMapHeight: () =>
      Number(getWorldSettings().graphHeight) || fallback.getMapHeight(),
    setGraphSize: (width, height) => {
      const patch = { graphWidth: width, graphHeight: height };
      if (context.worldSettingsStore) {
        context.worldSettingsStore.patch(patch);
      } else {
        context.worldSettings = { ...context.worldSettings, ...patch };
      }
      fallback.setGraphSize(width, height);
    },
    setRectBounds: fallback.setRectBounds,
    getLandmassRect: fallback.getLandmassRect,
    getOceanPatternRect: fallback.getOceanPatternRect,
    getOceanLayersRect: fallback.getOceanLayersRect,
    getFoggingRects: fallback.getFoggingRects,
    getFogMaskRect: fallback.getFogMaskRect,
    getWaterMaskRect: fallback.getWaterMaskRect,
  };
}

export function createRuntimeGraphSession(
  context: EngineRuntimeContext,
  targets: EngineGraphSessionTargets = createRuntimeGraphSessionTargets(
    context,
  ),
): EngineGraphSessionModule {
  return new EngineGraphSessionModule(targets);
}

if (typeof window !== "undefined") {
  window.EngineGraphSession = new EngineGraphSessionModule();
}

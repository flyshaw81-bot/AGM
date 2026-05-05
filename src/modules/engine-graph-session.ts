import type { EngineRuntimeContext } from "./engine-runtime-context";

declare global {
  var EngineGraphSession: EngineGraphSessionModule;
}

function getWindow(): (Window & typeof globalThis) | undefined {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
}

type AttributeTarget = {
  attr: (name: string, value: unknown) => AttributeTarget;
  select?: (selector: string) => AttributeTarget;
  selectAll?: (selector: string) => AttributeTarget;
};

const inertAttributeTarget: AttributeTarget = {
  attr: () => inertAttributeTarget,
  select: () => inertAttributeTarget,
  selectAll: () => inertAttributeTarget,
};

function getGlobalValue<T = unknown>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}

function setGlobalValue(name: string, value: number) {
  try {
    (globalThis as Record<string, unknown>)[name] = value;
  } catch {
    // Ignore read-only compatibility globals.
  }
}

function getInputNumber(name: string): number {
  const input = getGlobalValue<{ value: string | number }>(name);
  return Number(input?.value ?? 0);
}

function selectFromGlobal(name: string, selector: string): AttributeTarget {
  return (
    getGlobalValue<{ select?: (selector: string) => AttributeTarget }>(
      name,
    )?.select?.(selector) ?? inertAttributeTarget
  );
}

function selectAllFromGlobal(name: string, selector: string): AttributeTarget {
  return (
    getGlobalValue<{ selectAll?: (selector: string) => AttributeTarget }>(
      name,
    )?.selectAll?.(selector) ?? inertAttributeTarget
  );
}

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
    getMapWidth: () => getInputNumber("mapWidthInput"),
    getMapHeight: () => getInputNumber("mapHeightInput"),
    setGraphSize: (width, height) => {
      setGlobalValue("graphWidth", width);
      setGlobalValue("graphHeight", height);
    },
  };
}

export function createGlobalGraphSvgTargets(): EngineGraphSvgTargets {
  return {
    getLandmassRect: () => selectFromGlobal("landmass", "rect"),
    getOceanPatternRect: () => selectFromGlobal("oceanPattern", "rect"),
    getOceanLayersRect: () => selectFromGlobal("oceanLayers", "rect"),
    getFoggingRects: () => selectAllFromGlobal("fogging", "rect"),
    getFogMaskRect: () => selectFromGlobal("defs", "mask#fog > rect"),
    getWaterMaskRect: () => selectFromGlobal("defs", "mask#water > rect"),
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

const runtimeWindow = getWindow();
if (runtimeWindow)
  runtimeWindow.EngineGraphSession = new EngineGraphSessionModule();

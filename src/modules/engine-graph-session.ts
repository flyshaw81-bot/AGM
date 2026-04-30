declare global {
  var EngineGraphSession: EngineGraphSessionModule;
}

type AttributeTarget = {
  attr: (name: string, value: unknown) => AttributeTarget;
  select?: (selector: string) => AttributeTarget;
  selectAll?: (selector: string) => AttributeTarget;
};

function setRectBounds(target: AttributeTarget) {
  target
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", globalThis.graphWidth)
    .attr("height", globalThis.graphHeight);
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

export function createGlobalGraphSessionTargets(): EngineGraphSessionTargets {
  return {
    getMapWidth: () => Number((globalThis as any).mapWidthInput.value),
    getMapHeight: () => Number((globalThis as any).mapHeightInput.value),
    setGraphSize: (width, height) => {
      globalThis.graphWidth = width;
      globalThis.graphHeight = height;
    },
    setRectBounds,
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

if (typeof window !== "undefined") {
  window.EngineGraphSession = new EngineGraphSessionModule();
}

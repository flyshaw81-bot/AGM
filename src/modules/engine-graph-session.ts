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

export class EngineGraphSessionModule {
  applyGraphSize() {
    globalThis.graphWidth = Number((globalThis as any).mapWidthInput.value);
    globalThis.graphHeight = Number((globalThis as any).mapHeightInput.value);

    setRectBounds((globalThis as any).landmass.select("rect"));
    setRectBounds((globalThis as any).oceanPattern.select("rect"));
    setRectBounds(
      globalThis.oceanLayers.select("rect") as unknown as AttributeTarget,
    );
    setRectBounds((globalThis as any).fogging.selectAll("rect"));
    (globalThis as any).defs
      .select("mask#fog > rect")
      .attr("width", globalThis.graphWidth)
      .attr("height", globalThis.graphHeight);
    (globalThis as any).defs
      .select("mask#water > rect")
      .attr("width", globalThis.graphWidth)
      .attr("height", globalThis.graphHeight);
  }
}

if (typeof window !== "undefined") {
  window.EngineGraphSession = new EngineGraphSessionModule();
}

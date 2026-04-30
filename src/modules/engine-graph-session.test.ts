import { describe, expect, it } from "vitest";
import { EngineGraphSessionModule } from "./engine-graph-session";

type Call = {
  selector: string;
  name: string;
  value: unknown;
};

function createSelection(calls: Call[], selector: string) {
  const target = {
    attr: (name: string, value: unknown) => {
      calls.push({ selector, name, value });
      return target;
    },
    select: (nextSelector: string) => createSelection(calls, nextSelector),
    selectAll: (nextSelector: string) => createSelection(calls, nextSelector),
  };

  return target;
}

describe("EngineGraphSessionModule", () => {
  it("applies graph dimensions to the runtime graph and canvas masks", () => {
    const calls: Call[] = [];
    const root = createSelection(calls, "root");
    (globalThis as any).mapWidthInput = { value: "1200" };
    (globalThis as any).mapHeightInput = { value: "800" };
    (globalThis as any).landmass = root;
    (globalThis as any).oceanPattern = root;
    globalThis.oceanLayers = root as any;
    (globalThis as any).fogging = root;
    (globalThis as any).defs = root;

    new EngineGraphSessionModule().applyGraphSize();

    expect(globalThis.graphWidth).toBe(1200);
    expect(globalThis.graphHeight).toBe(800);
    expect(calls).toContainEqual({
      selector: "mask#fog > rect",
      name: "width",
      value: 1200,
    });
    expect(calls).toContainEqual({
      selector: "mask#water > rect",
      name: "height",
      value: 800,
    });
  });
});

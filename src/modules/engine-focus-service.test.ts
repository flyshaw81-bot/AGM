import { describe, expect, it, vi } from "vitest";

import {
  createEngineFocusService,
  type EngineFocusTargets,
} from "./engine-focus-service";

function createLabel() {
  const label = {
    size: vi.fn(() => 1),
    text: vi.fn(() => label),
    classed: vi.fn(() => label),
    on: vi.fn(() => label),
  };
  return label;
}

function createTargets(
  overrides: Partial<EngineFocusTargets> = {},
): EngineFocusTargets {
  const label = createLabel();

  return {
    getUrl: vi.fn(() => new URL("https://agm.local/?scale=4&x=120&y=80")),
    getReferrer: vi.fn(() => ""),
    getPack: vi.fn(() => ({
      cells: {
        p: [
          [0, 0],
          [25, 30],
        ] as Array<[number, number]>,
        r: { 2: 1 },
        t: { 1: 0, 2: 1 },
      },
      burgs: [
        { i: 0, name: "", cell: 0, population: 0, x: 0, y: 0 },
        { i: 1, name: "Aster", cell: 1, population: 10, x: 11, y: 12 },
        {
          i: 2,
          name: "Harbor",
          cell: 2,
          port: 1,
          population: 90,
          x: 70,
          y: 80,
        },
      ],
    })),
    getGraphSize: vi.fn(() => ({ width: 1000, height: 700 })),
    zoomTo: vi.fn(),
    invokeActiveZooming: vi.fn(),
    tip: vi.fn(),
    logError: vi.fn(),
    scan: vi.fn((values, comparator) => {
      let selected = 0;
      for (let index = 1; index < values.length; index += 1) {
        if (comparator(values[index], values[selected]) < 0) selected = index;
      }
      return selected;
    }),
    getBurgLabel: vi.fn(() => label),
    markLabelDragInactive: vi.fn(),
    ...overrides,
  };
}

describe("engine focus service", () => {
  it("zooms to explicit coordinates from URL parameters", () => {
    const targets = createTargets();
    const service = createEngineFocusService(targets);

    service.focusOn();

    expect(targets.zoomTo).toHaveBeenCalledWith(120, 80, 4, 1600);
  });

  it("zooms to a requested cell", () => {
    const targets = createTargets({
      getUrl: vi.fn(() => new URL("https://agm.local/?cell=1&scale=6")),
    });
    const service = createEngineFocusService(targets);

    service.focusOn();

    expect(targets.zoomTo).toHaveBeenCalledWith(25, 30, 6, 1600);
  });

  it("selects and focuses a matching MFCG burg", () => {
    const targets = createTargets({
      getUrl: vi.fn(
        () =>
          new URL(
            "https://agm.local/?from=MFCG&size=100&coast=1&port=1&river=1&name=New%20Harbor",
          ),
      ),
      getReferrer: vi.fn(
        () =>
          "https://mfcg.local/?name=Old%20Harbor&size=120&seed=42&shantytown=1",
      ),
    });
    const service = createEngineFocusService(targets);

    service.focusOn();

    expect(targets.getBurgLabel).toHaveBeenCalledWith(2);
    expect(targets.zoomTo).toHaveBeenCalledWith(70, 80, 8, 1600);
    expect(targets.invokeActiveZooming).toHaveBeenCalledTimes(1);
    expect(targets.tip).toHaveBeenCalledWith(
      "Here stands the glorious city of New Harbor",
      true,
      "success",
      15000,
    );
  });
});

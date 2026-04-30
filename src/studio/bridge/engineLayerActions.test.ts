import { describe, expect, it, vi } from "vitest";
import type { LayerAction } from "./engineActionTypes";
import {
  getEngineLayerDetails,
  getEngineLayerStates,
  toggleEngineLayer,
} from "./engineLayerActions";
import type { EngineLayerTargets } from "./engineLayerTargets";

function createTargets(
  overrides: Partial<EngineLayerTargets> = {},
): EngineLayerTargets {
  const activeLayers = new Set<LayerAction>(["toggleRivers"]);
  return {
    hasLayerHandler: vi.fn((action) =>
      ["toggleRivers", "toggleBiomes"].includes(action),
    ),
    isLayerOn: vi.fn((action) => activeLayers.has(action)),
    toggleLayer: vi.fn(),
    getLayerDetails: vi.fn(() => [
      {
        id: "toggleRivers",
        label: "Rivers",
        shortcut: "R",
        pinned: true,
      },
      {
        id: "toggleBiomes",
        label: "Biomes",
        shortcut: "B",
        pinned: false,
      },
    ]),
    ...overrides,
  };
}

describe("engine layer actions", () => {
  it("builds layer states through injected targets", () => {
    const targets = createTargets();

    const states = getEngineLayerStates(targets);

    expect(states.toggleRivers).toBe(true);
    expect(states.toggleBiomes).toBe(false);
  });

  it("combines layer detail metadata with active state", () => {
    const targets = createTargets();

    expect(getEngineLayerDetails(targets)).toEqual([
      {
        id: "toggleRivers",
        label: "Rivers",
        shortcut: "R",
        pinned: true,
        active: true,
      },
      {
        id: "toggleBiomes",
        label: "Biomes",
        shortcut: "B",
        pinned: false,
        active: false,
      },
    ]);
  });

  it("toggles layers through injected targets", () => {
    const targets = createTargets();

    toggleEngineLayer("toggleRivers", targets);

    expect(targets.toggleLayer).toHaveBeenCalledWith("toggleRivers");
  });
});

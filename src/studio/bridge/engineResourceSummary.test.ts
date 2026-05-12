import { describe, expect, it, vi } from "vitest";
import {
  getEngineEntitySummary,
  getEngineWorldResourceSummary,
} from "./engineResourceSummary";
import type { EngineResourceSummaryTargets } from "./engineResourceSummaryTargets";

function createTargets(
  overrides: Partial<EngineResourceSummaryTargets>,
): EngineResourceSummaryTargets {
  return {
    getBiomeData: vi.fn(() => undefined),
    setBiomeData: vi.fn(),
    getStates: vi.fn(() => []),
    getBurgs: vi.fn(() => []),
    getCultures: vi.fn(() => []),
    getReligions: vi.fn(() => []),
    getProvinces: vi.fn(() => []),
    getRoutes: vi.fn(() => []),
    getZones: vi.fn(() => []),
    getMarkers: vi.fn(() => []),
    getCellArea: vi.fn(),
    getCellPopulation: vi.fn(),
    ...overrides,
  };
}

describe("engine resource summary", () => {
  it("summarizes world resources through injected targets", () => {
    const targets = createTargets({
      getBiomeData: vi.fn(() => ({
        i: [1],
        name: { 1: "Temperate forest" },
        color: { 1: "#446633" },
        habitability: { 1: 80 },
        cost: { 1: 2 },
        iconsDensity: { 1: 4 },
        agmRuleWeight: { 1: 1.2 },
        agmResourceTag: { 1: "wood" },
      })),
      getProvinces: vi.fn(() => [{ i: 2, name: "Northreach" }]),
      getRoutes: vi.fn(() => [{ i: 3, group: "roads", points: [12] }]),
      getZones: vi.fn(() => [{ i: 4, name: "Floodplain", cells: [7, 8] }]),
      getMarkers: vi.fn(() => [
        {
          i: 5,
          type: "volcano",
          icon: "marker",
          cell: 12,
          x: 10,
          y: 20,
          pinned: true,
        },
      ]),
      getStates: vi.fn(() => [
        undefined,
        {
          i: 1,
          name: "Aurelia",
          military: [
            {
              i: 6,
              name: "1st Guard",
              t: 1200,
              cell: 7,
              type: "infantry",
              n: 0,
            },
          ],
        },
      ]),
      getCellArea: vi.fn((cellId) => (cellId === 7 ? 10 : 20)),
      getCellPopulation: vi.fn((cellId) => (cellId === 7 ? 3 : 4)),
    });

    expect(getEngineWorldResourceSummary(targets)).toEqual({
      biomes: [
        {
          id: 1,
          name: "Temperate forest",
          color: "#446633",
          habitability: 80,
          movementCost: 2,
          iconDensity: 4,
          agmRuleWeight: 1.2,
          agmResourceTag: "wood",
        },
      ],
      provinces: [{ id: 2, name: "Northreach" }],
      routes: [{ id: 3, group: "roads", pointCount: 1, startCell: 12 }],
      zones: [
        {
          id: 4,
          name: "Floodplain",
          cellCount: 2,
          hidden: false,
          area: 30,
          population: 7,
        },
      ],
      markers: [
        {
          id: 5,
          type: "volcano",
          icon: "marker",
          cell: 12,
          x: 10,
          y: 20,
          dx: undefined,
          dy: undefined,
          px: undefined,
          size: undefined,
          pin: undefined,
          fill: undefined,
          stroke: undefined,
          hidden: false,
          pinned: true,
          locked: false,
        },
      ],
      military: [
        {
          id: "1:6",
          regimentId: 6,
          stateId: 1,
          stateName: "Aurelia",
          name: "1st Guard",
          type: "infantry",
          total: 1200,
          cell: 7,
          x: undefined,
          y: undefined,
          naval: false,
        },
      ],
    });
  });

  it("summarizes entities through injected targets", () => {
    const targets = createTargets({
      getStates: vi.fn(() => [
        undefined,
        { i: 1, name: "Aurelia", fullName: "Kingdom of Aurelia" },
      ]),
      getBurgs: vi.fn(() => [{ i: 2, name: "Port Dawn", population: 12 }]),
      getCultures: vi.fn(() => [{ i: 3, name: "Lowland", type: "Generic" }]),
      getReligions: vi.fn(() => [{ i: 4, name: "Sun Rite" }]),
    });

    const summary = getEngineEntitySummary(targets);

    expect(summary.states[0]).toMatchObject({
      id: 1,
      name: "Aurelia",
      fullName: "Kingdom of Aurelia",
    });
    expect(summary.burgs[0]).toMatchObject({
      id: 2,
      name: "Port Dawn",
      population: 12,
    });
    expect(summary.cultures[0]).toMatchObject({
      id: 3,
      name: "Lowland",
      type: "Generic",
    });
    expect(summary.religions[0]).toMatchObject({ id: 4, name: "Sun Rite" });
  });
});

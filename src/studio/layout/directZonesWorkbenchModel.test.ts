import { describe, expect, it } from "vitest";
import type { EngineZoneSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  filterAndSortDirectZones,
  getActiveDirectZones,
  getDirectZoneColor,
  selectDirectZone,
} from "./directZonesWorkbenchModel";

const zones = [
  { id: -1, name: "", cellCount: 0 },
  {
    id: 2,
    name: "Old Forest",
    type: "wild",
    cellCount: 9,
    population: 0,
    color: "broken",
  },
  {
    id: 1,
    name: "Northwatch",
    type: "admin",
    cellCount: 12,
    population: 400,
    hidden: true,
    color: "#446688",
  },
] satisfies EngineZoneSummaryItem[];

function directEditor(
  overrides: Partial<StudioState["directEditor"]> = {},
): StudioState["directEditor"] {
  return {
    zoneFilterMode: "all",
    selectedZoneId: null,
    zoneSearchQuery: "",
    ...overrides,
  } as StudioState["directEditor"];
}

describe("native zones workbench model", () => {
  it("filters inactive zones and sorts by type then name", () => {
    const activeZones = getActiveDirectZones(zones);

    expect(activeZones.map((zone) => zone.id)).toEqual([2, 1]);
    expect(
      filterAndSortDirectZones(activeZones, directEditor(), "").map(
        (zone) => zone.id,
      ),
    ).toEqual([1, 2]);
  });

  it("filters by population, hidden status, and query", () => {
    const activeZones = getActiveDirectZones(zones);

    expect(
      filterAndSortDirectZones(
        activeZones,
        directEditor({ zoneFilterMode: "populated" }),
        "",
      ).map((zone) => zone.id),
    ).toEqual([1]);
    expect(
      filterAndSortDirectZones(
        activeZones,
        directEditor({ zoneFilterMode: "hidden" }),
        "",
      ).map((zone) => zone.id),
    ).toEqual([1]);
    expect(
      filterAndSortDirectZones(activeZones, directEditor(), "forest").map(
        (zone) => zone.id,
      ),
    ).toEqual([2]);
  });

  it("selects fallback zones and validates color", () => {
    const activeZones = getActiveDirectZones(zones);
    const filteredZones = filterAndSortDirectZones(
      activeZones,
      directEditor(),
      "north",
    );

    expect(selectDirectZone(filteredZones, activeZones, 1)?.id).toBe(1);
    expect(selectDirectZone(filteredZones, activeZones, 2)?.id).toBe(2);
    expect(getDirectZoneColor(activeZones[1])).toBe("#446688");
    expect(getDirectZoneColor(activeZones[0])).toBe("#b88f42");
  });
});

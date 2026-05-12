import { describe, expect, it, vi } from "vitest";
import {
  updateEngineBurg,
  updateEngineCulture,
  updateEngineDiplomacy,
  updateEngineMarker,
  updateEngineRoute,
  updateEngineStateName,
} from "./engineEntityMutations";
import type { EngineEntityMutationTargets } from "./engineEntityMutationTargets";

function createTargets(overrides: Partial<EngineEntityMutationTargets>) {
  return {
    getState: vi.fn(),
    getCulture: vi.fn(),
    getReligion: vi.fn(),
    getBurg: vi.fn(),
    getProvince: vi.fn(),
    getRoute: vi.fn(),
    getZone: vi.fn(),
    getMarker: vi.fn(),
    redrawStates: vi.fn(),
    redrawStateLabels: vi.fn(),
    redrawCultures: vi.fn(),
    redrawReligions: vi.fn(),
    redrawBurgs: vi.fn(),
    redrawLabels: vi.fn(),
    redrawProvinces: vi.fn(),
    redrawRoute: vi.fn(),
    redrawZones: vi.fn(),
    redrawMarkers: vi.fn(),
    ...overrides,
  } as EngineEntityMutationTargets;
}

describe("engine entity mutations", () => {
  it("updates state fields through injected targets and redraws state layers", () => {
    const state = {
      name: "Old",
      formName: "Kingdom",
      fullName: "Old Kingdom",
      color: "#111111",
    };
    const targets = createTargets({
      getState: vi.fn(() => state),
      redrawStates: vi.fn(),
      redrawStateLabels: vi.fn(),
    });

    expect(
      updateEngineStateName(
        3,
        {
          name: "New",
          formName: "Realm",
          fullName: "New Realm",
          color: "#222222",
        },
        targets,
      ),
    ).toBe(true);

    expect(targets.getState).toHaveBeenCalledWith(3);
    expect(state).toMatchObject({
      name: "New",
      formName: "Realm",
      fullName: "New Realm",
      color: "#222222",
    });
    expect(targets.redrawStates).toHaveBeenCalledWith();
    expect(targets.redrawStateLabels).toHaveBeenCalledWith([3]);
  });

  it("updates culture fields and redraws dependent layers", () => {
    const culture = { name: "Old", type: "Generic", color: "#111111" };
    const targets = createTargets({
      getCulture: vi.fn(() => culture),
      redrawCultures: vi.fn(),
      redrawStates: vi.fn(),
      redrawLabels: vi.fn(),
    });

    expect(
      updateEngineCulture(
        2,
        { name: "New", type: "Nomadic", color: "#333333" },
        targets,
      ),
    ).toBe(true);

    expect(culture).toMatchObject({
      name: "New",
      form: "Nomadic",
      formName: "Nomadic",
      type: "Nomadic",
      color: "#333333",
    });
    expect(targets.redrawCultures).toHaveBeenCalledWith();
    expect(targets.redrawStates).toHaveBeenCalledWith();
    expect(targets.redrawLabels).toHaveBeenCalledWith();
  });

  it("updates burg fields and redraws burg and label layers", () => {
    const burg = { name: "Old", type: "Town", population: 1 };
    const targets = createTargets({
      getBurg: vi.fn(() => burg),
      redrawBurgs: vi.fn(),
      redrawLabels: vi.fn(),
    });

    expect(
      updateEngineBurg(
        7,
        { name: "New", type: "City", population: 2 },
        targets,
      ),
    ).toBe(true);

    expect(burg).toMatchObject({ name: "New", type: "City", population: 2 });
    expect(targets.redrawBurgs).toHaveBeenCalledWith();
    expect(targets.redrawLabels).toHaveBeenCalledWith();
  });

  it("updates routes through injected targets and redraws the route", () => {
    const route = { i: 4, group: "roads" };
    const targets = createTargets({
      getRoute: vi.fn(() => route),
      redrawRoute: vi.fn(),
    });

    expect(updateEngineRoute(4, { group: "trails" }, targets)).toBe(true);

    expect(route.group).toBe("trails");
    expect(targets.redrawRoute).toHaveBeenCalledWith(route);
  });

  it("updates markers through injected targets and redraws marker layer", () => {
    const marker = {
      i: 8,
      type: "ruins",
      icon: "R",
      size: 24,
      pinned: false,
    };
    const targets = createTargets({
      getMarker: vi.fn(() => marker),
      redrawMarkers: vi.fn(),
    });

    expect(
      updateEngineMarker(
        8,
        {
          type: "dungeon",
          icon: "D",
          size: 32,
          pin: "pin",
          fill: "#ffffff",
          stroke: "#111111",
          pinned: true,
          locked: true,
        },
        targets,
      ),
    ).toBe(true);

    expect(marker).toMatchObject({
      type: "dungeon",
      icon: "D",
      size: 32,
      pin: "pin",
      fill: "#ffffff",
      stroke: "#111111",
      pinned: true,
      lock: true,
    });
    expect(targets.redrawMarkers).toHaveBeenCalledWith();
  });

  it("updates diplomacy on both states through injected targets", () => {
    const subject = { diplomacy: [] as string[] };
    const object = { diplomacy: [] as string[] };
    const targets = createTargets({
      getState: vi
        .fn()
        .mockImplementation((stateId) =>
          stateId === 1 ? subject : stateId === 2 ? object : undefined,
        ),
      redrawStates: vi.fn(),
    });

    expect(updateEngineDiplomacy(1, 2, { relation: "Vassal" }, targets)).toBe(
      true,
    );

    expect(subject.diplomacy[2]).toBe("Vassal");
    expect(object.diplomacy[1]).toBe("Suzerain");
    expect(targets.redrawStates).toHaveBeenCalledWith();
  });
});

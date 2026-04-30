import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import {
  createEntityMutationTargets,
  createGlobalEntityMutationTargets,
  createRuntimeEntityMutationTargets,
} from "./engineEntityMutationTargets";

const originalPack = globalThis.pack;
const originalDrawStates = (globalThis as any).drawStates;
const originalDrawStateLabels = (globalThis as any).drawStateLabels;
const originalDrawRoutes = (globalThis as any).drawRoutes;
const originalDrawRoute = (globalThis as any).drawRoute;

describe("createGlobalEntityMutationTargets", () => {
  afterEach(() => {
    globalThis.pack = originalPack;
    (globalThis as any).drawStates = originalDrawStates;
    (globalThis as any).drawStateLabels = originalDrawStateLabels;
    (globalThis as any).drawRoutes = originalDrawRoutes;
    (globalThis as any).drawRoute = originalDrawRoute;
  });

  it("resolves entities from the current engine pack", () => {
    const state = { i: 1 };
    const zone = { i: 8 };
    globalThis.pack = {
      states: [undefined, state],
      zones: [zone],
    } as unknown as typeof pack;

    const targets = createGlobalEntityMutationTargets();

    expect(targets.getState(1)).toBe(state);
    expect(targets.getZone(8)).toBe(zone);
    expect(targets.getZone(99)).toBeUndefined();
  });

  it("forwards redraw calls to the current render helpers", () => {
    const drawStates = vi.fn();
    const drawStateLabels = vi.fn();
    const drawRoute = vi.fn();
    (globalThis as any).drawStates = drawStates;
    (globalThis as any).drawStateLabels = drawStateLabels;
    (globalThis as any).drawRoutes = undefined;
    (globalThis as any).drawRoute = drawRoute;

    const targets = createGlobalEntityMutationTargets();
    const route = { i: 4 };
    targets.redrawStates();
    targets.redrawStateLabels([1]);
    targets.redrawRoute(route);

    expect(drawStates).toHaveBeenCalledWith();
    expect(drawStateLabels).toHaveBeenCalledWith([1]);
    expect(drawRoute).toHaveBeenCalledWith(route);
  });

  it("composes entity mutation targets from injected lookup and redraw adapters", () => {
    const state = { i: 1 };
    const redrawStates = vi.fn();
    const redrawRoute = vi.fn();
    const targets = createEntityMutationTargets(
      {
        getState: () => state,
        getCulture: () => undefined,
        getReligion: () => undefined,
        getBurg: () => undefined,
        getProvince: () => undefined,
        getRoute: () => undefined,
        getZone: () => undefined,
      },
      {
        redrawStates,
        redrawStateLabels: vi.fn(),
        redrawCultures: vi.fn(),
        redrawReligions: vi.fn(),
        redrawBurgs: vi.fn(),
        redrawLabels: vi.fn(),
        redrawProvinces: vi.fn(),
        redrawRoute,
        redrawZones: vi.fn(),
      },
    );

    expect(targets.getState(1)).toBe(state);
    targets.redrawStates();
    targets.redrawRoute({ i: 4 });
    expect(redrawStates).toHaveBeenCalledWith();
    expect(redrawRoute).toHaveBeenCalledWith({ i: 4 });
  });

  it("creates entity mutation targets from an injected runtime context", () => {
    const state = { i: 1 };
    const burg = { i: 3 };
    const zone = { i: 8 };
    const redrawBurgs = vi.fn();
    const context = {
      pack: {
        states: [undefined, state],
        burgs: [undefined, undefined, undefined, burg],
        zones: [zone],
      },
    } as unknown as EngineRuntimeContext;
    const targets = createRuntimeEntityMutationTargets(context, {
      redrawStates: vi.fn(),
      redrawStateLabels: vi.fn(),
      redrawCultures: vi.fn(),
      redrawReligions: vi.fn(),
      redrawBurgs,
      redrawLabels: vi.fn(),
      redrawProvinces: vi.fn(),
      redrawRoute: vi.fn(),
      redrawZones: vi.fn(),
    });

    expect(targets.getState(1)).toBe(state);
    expect(targets.getBurg(3)).toBe(burg);
    expect(targets.getZone(8)).toBe(zone);
    expect(targets.getZone(99)).toBeUndefined();
    targets.redrawBurgs();
    expect(redrawBurgs).toHaveBeenCalledWith();
  });
});

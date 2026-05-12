import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import {
  createEntityMutationTargets,
  createGlobalEngineDrawFunctions,
  createGlobalEntityMutationTargets,
  createRuntimeEntityMutationTargets,
} from "./engineEntityMutationTargets";

const originalPack = globalThis.pack;
const originalDrawStates = (globalThis as any).drawStates;
const originalDrawStateLabels = (globalThis as any).drawStateLabels;
const originalDrawRoutes = (globalThis as any).drawRoutes;
const originalDrawRoute = (globalThis as any).drawRoute;
const originalDrawMarkers = (globalThis as any).drawMarkers;
const originalDescriptors = new Map(
  [
    "pack",
    "drawStates",
    "drawStateLabels",
    "drawRoutes",
    "drawRoute",
    "drawMarkers",
  ].map(
    (name) =>
      [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const,
  ),
);

describe("createGlobalEntityMutationTargets", () => {
  afterEach(() => {
    for (const [name, value] of [
      ["pack", originalPack],
      ["drawStates", originalDrawStates],
      ["drawStateLabels", originalDrawStateLabels],
      ["drawRoutes", originalDrawRoutes],
      ["drawRoute", originalDrawRoute],
      ["drawMarkers", originalDrawMarkers],
    ] as const) {
      const descriptor = originalDescriptors.get(name);
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
      } else {
        Object.defineProperty(globalThis, name, {
          configurable: true,
          value,
          writable: true,
        });
      }
    }
  });

  it("resolves entities from the current engine pack", () => {
    const state = { i: 1 };
    const zone = { i: 8 };
    const marker = { i: 9 };
    globalThis.pack = {
      states: [undefined, state],
      zones: [zone],
      markers: [marker],
    } as unknown as typeof pack;

    const targets = createGlobalEntityMutationTargets();

    expect(targets.getState(1)).toBe(state);
    expect(targets.getZone(8)).toBe(zone);
    expect(targets.getMarker(9)).toBe(marker);
    expect(targets.getZone(99)).toBeUndefined();
  });

  it("forwards redraw calls to the current render helpers", () => {
    const drawStates = vi.fn();
    const drawStateLabels = vi.fn();
    const drawRoute = vi.fn();
    const drawMarkers = vi.fn();
    (globalThis as any).drawStates = drawStates;
    (globalThis as any).drawStateLabels = drawStateLabels;
    (globalThis as any).drawRoutes = undefined;
    (globalThis as any).drawRoute = drawRoute;
    (globalThis as any).drawMarkers = drawMarkers;

    const targets = createGlobalEntityMutationTargets();
    const route = { i: 4 };
    targets.redrawStates();
    targets.redrawStateLabels([1]);
    targets.redrawRoute(route);
    targets.redrawMarkers();

    expect(drawStates).toHaveBeenCalledWith();
    expect(drawStateLabels).toHaveBeenCalledWith([1]);
    expect(drawRoute).toHaveBeenCalledWith(route);
    expect(drawMarkers).toHaveBeenCalledWith();
  });

  it("exposes a typed draw-function boundary with explicit missing-function diagnostics", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (globalThis as any).drawStates = undefined;
    (globalThis as any).drawRoutes = undefined;
    (globalThis as any).drawRoute = undefined;

    const draw = createGlobalEngineDrawFunctions();

    expect(() => draw.drawStates()).not.toThrow();
    expect(() => draw.drawRoute({ i: 4 })).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(
      "[AGM V2] Missing engine draw function: drawStates",
      "",
    );
    expect(consoleError).toHaveBeenCalledWith(
      "[AGM V2] Missing engine draw function: drawRoutes or drawRoute",
      "",
    );
  });

  it("keeps global entity targets safe when pack or redraw access throws", () => {
    for (const name of [
      "pack",
      "drawStates",
      "drawStateLabels",
      "drawRoutes",
      "drawRoute",
      "drawMarkers",
    ]) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        get: () => {
          throw new Error(`${name} blocked`);
        },
      });
    }
    const targets = createGlobalEntityMutationTargets();

    expect(targets.getState(1)).toBeUndefined();
    expect(targets.getCulture(1)).toBeUndefined();
    expect(targets.getReligion(1)).toBeUndefined();
    expect(targets.getBurg(1)).toBeUndefined();
    expect(targets.getProvince(1)).toBeUndefined();
    expect(targets.getRoute(1)).toBeUndefined();
    expect(targets.getZone(1)).toBeUndefined();
    expect(targets.getMarker(1)).toBeUndefined();
    expect(() => targets.redrawStates()).not.toThrow();
    expect(() => targets.redrawStateLabels([1])).not.toThrow();
    expect(() => targets.redrawRoute({ i: 4 })).not.toThrow();
    expect(() => targets.redrawMarkers()).not.toThrow();
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
        getMarker: () => undefined,
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
        redrawMarkers: vi.fn(),
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
    const marker = { i: 9 };
    const redrawBurgs = vi.fn();
    const context = {
      pack: {
        states: [undefined, state],
        burgs: [undefined, undefined, undefined, burg],
        zones: [zone],
        markers: [marker],
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
      redrawMarkers: vi.fn(),
    });

    expect(targets.getState(1)).toBe(state);
    expect(targets.getBurg(3)).toBe(burg);
    expect(targets.getZone(8)).toBe(zone);
    expect(targets.getMarker(9)).toBe(marker);
    expect(targets.getZone(99)).toBeUndefined();
    targets.redrawBurgs();
    expect(redrawBurgs).toHaveBeenCalledWith();
  });
});

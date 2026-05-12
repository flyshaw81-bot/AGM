import { describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type {
  EngineFocusGeometry,
  EngineFocusTarget,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import {
  createDirectEditorActionTargets,
  createRuntimeDirectEditorActionTargets,
} from "./directEditorActionTargets";

describe("createDirectEditorActionTargets", () => {
  it("composes direct editor targets from injected adapters", () => {
    const state = {} as StudioState;
    const focus = {
      targetType: "burg",
      targetId: 7,
      sourceLabel: "direct-burgs-workbench",
      action: "focus",
    } satisfies EngineFocusTarget;
    const focusGeometry = {
      ...focus,
      x: 20,
      y: 30,
    } satisfies EngineFocusGeometry;
    const syncDocument = vi.fn();
    const resolveFocusGeometry = vi.fn(() => focusGeometry);
    const updateBurg = vi.fn();
    const updateDiplomacy = vi.fn();

    const targets = createDirectEditorActionTargets(
      {
        syncDocument,
      },
      {
        resolveFocusGeometry,
      },
      {
        updateState: vi.fn(),
        updateBurg,
        updateCulture: vi.fn(),
        updateReligion: vi.fn(),
        updateProvince: vi.fn(),
        updateRoute: vi.fn(),
        updateZone: vi.fn(),
        updateMarker: vi.fn(),
        updateBiome: vi.fn(),
        updateDiplomacy,
      },
    );

    targets.syncDocument(state);
    expect(syncDocument).toHaveBeenCalledWith(state);
    expect(targets.resolveFocusGeometry(focus)).toBe(focusGeometry);
    targets.updateBurg(7, { name: "Harbor" });
    expect(updateBurg).toHaveBeenCalledWith(7, { name: "Harbor" });
    targets.updateDiplomacy(1, 2, { relation: "Ally" });
    expect(updateDiplomacy).toHaveBeenCalledWith(1, 2, {
      relation: "Ally",
    });
  });

  it("creates direct editor targets from an injected runtime context", () => {
    const state = { i: 1, name: "Old", formName: "Duchy", fullName: "Old" };
    const context = {
      worldSettings: {
        graphWidth: 1200,
        graphHeight: 800,
      },
      pack: {
        cells: {
          i: [1],
          p: { 1: [10, 20] },
          state: { 1: 1 },
        },
        states: [undefined, state],
      },
      biomesData: {
        i: [2],
        habitability: { 2: 10 },
      },
    } as unknown as EngineRuntimeContext;
    const targets = createRuntimeDirectEditorActionTargets(context);

    expect(
      targets.resolveFocusGeometry({
        targetType: "state",
        targetId: 1,
        sourceLabel: "direct-states-workbench",
      }),
    ).toMatchObject({ targetId: 1, width: 1200, height: 800 });
    targets.updateState(1, {
      name: "New",
      formName: "Duchy",
      fullName: "Duchy of New",
    });
    targets.updateBiome(2, { habitability: 30 });

    expect(state.name).toBe("New");
    expect(context.biomesData.habitability[2]).toBe(30);
  });

  it("allows runtime direct editor targets to inject document sync", () => {
    const state = { document: {} } as StudioState;
    const context = {
      worldSettings: {
        graphWidth: 1200,
        graphHeight: 800,
      },
      pack: {
        cells: {
          i: [],
          p: {},
        },
      },
      biomesData: {
        i: [],
        habitability: {},
      },
    } as unknown as EngineRuntimeContext;
    const syncDocument = vi.fn();
    const targets = createRuntimeDirectEditorActionTargets(context, {
      syncDocument,
    });

    targets.syncDocument(state);

    expect(syncDocument).toHaveBeenCalledWith(state);
  });
});

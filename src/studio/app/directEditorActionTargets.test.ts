import { describe, expect, it, vi } from "vitest";
import type {
  EngineFocusGeometry,
  EngineFocusTarget,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { createDirectEditorActionTargets } from "./directEditorActionTargets";

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
});

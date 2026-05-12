import { describe, expect, it, vi } from "vitest";
import type { EngineFocusGeometry } from "../bridge/engineActions";
import type { StudioState } from "../types";
import { createDirectEditorActionHandlers } from "./directEditorActionHandlers";
import type { DirectEditorActionTargets } from "./directEditorActionTargets";

function createState(): StudioState {
  return {
    section: "canvas",
    shell: {
      activeEditorModule: "states",
      navigationCollapsed: false,
    },
    document: {
      source: "agm",
    },
    directEditor: {
      selectedStateId: null,
      lastAppliedStateId: null,
      stateSearchQuery: "",
      selectedDiplomacySubjectId: null,
      selectedDiplomacyObjectId: null,
      lastAppliedDiplomacyPair: null,
      diplomacySearchQuery: "",
      relationshipQueueHistory: null,
      relationshipQueueHistoryLog: [],
    },
    balanceFocus: null,
  } as unknown as StudioState;
}

function createTargets(
  overrides: Partial<DirectEditorActionTargets> = {},
): DirectEditorActionTargets {
  return {
    syncDocument: vi.fn(),
    resolveFocusGeometry: vi.fn(
      (focus) =>
        ({
          ...focus,
          x: 10,
          y: 20,
        }) as EngineFocusGeometry,
    ),
    updateState: vi.fn(),
    updateBurg: vi.fn(),
    updateCulture: vi.fn(),
    updateReligion: vi.fn(),
    updateProvince: vi.fn(),
    updateRoute: vi.fn(),
    updateZone: vi.fn(),
    updateMarker: vi.fn(),
    updateBiome: vi.fn(),
    updateDiplomacy: vi.fn(),
    ...overrides,
  };
}

function createHandlers(state = createState(), targets = createTargets()) {
  const root = {} as HTMLElement;
  const render = vi.fn();
  const handlers = createDirectEditorActionHandlers({
    root,
    state,
    render,
    targets,
  });

  return { handlers, render, root, state, targets };
}

describe("direct editor action handlers", () => {
  it("selects entities through injected focus targets", () => {
    const { handlers, state, targets } = createHandlers();

    handlers.onDirectStateSelect(2);

    expect(state.directEditor.selectedStateId).toBe(2);
    expect(state.directEditor.lastAppliedStateId).toBeNull();
    expect(targets.resolveFocusGeometry).toHaveBeenCalledWith({
      targetType: "state",
      targetId: 2,
      sourceLabel: "direct-states-workbench",
      action: "focus",
    });
    expect(state.balanceFocus).toMatchObject({ targetId: 2, x: 10, y: 20 });
    expect(state.section).toBe("editors");
  });

  it("applies entity mutations through injected update targets", () => {
    const { handlers, state, targets } = createHandlers();

    handlers.onDirectStateApply(2, {
      name: "North",
      formName: "Kingdom",
      fullName: "Kingdom of North",
    });

    expect(targets.updateState).toHaveBeenCalledWith(2, {
      name: "North",
      formName: "Kingdom",
      fullName: "Kingdom of North",
    });
    expect(state.directEditor.selectedStateId).toBe(2);
    expect(state.directEditor.lastAppliedStateId).toBe(2);
    expect(state.document.source).toBe("core");
    expect(targets.syncDocument).toHaveBeenCalledWith(state);
  });

  it("applies diplomacy mutations through injected update targets", () => {
    const { handlers, state, targets } = createHandlers();

    handlers.onDirectDiplomacyApply(1, 2, { relation: "Ally" });

    expect(targets.updateDiplomacy).toHaveBeenCalledWith(1, 2, {
      relation: "Ally",
    });
    expect(state.directEditor.selectedDiplomacySubjectId).toBe(1);
    expect(state.directEditor.selectedDiplomacyObjectId).toBe(2);
    expect(state.directEditor.lastAppliedDiplomacyPair).toBe("1:2");
    expect(state.document.source).toBe("core");
  });

  it("applies marker mutations without requiring focus geometry", () => {
    const { handlers, state, targets } = createHandlers();

    handlers.onDirectMarkerApply(8, { type: "ruins", icon: "R" });

    expect(targets.updateMarker).toHaveBeenCalledWith(8, {
      type: "ruins",
      icon: "R",
    });
    expect(state.directEditor.selectedMarkerId).toBe(8);
    expect(state.directEditor.lastAppliedMarkerId).toBe(8);
    expect(state.document.source).toBe("core");
  });

  it("keeps relationship queue history unique and capped", () => {
    const { handlers, state } = createHandlers();
    state.directEditor.relationshipQueueHistoryLog = [
      { id: "old-1" },
      { id: "same" },
      { id: "old-2" },
      { id: "old-3" },
    ] as unknown as StudioState["directEditor"]["relationshipQueueHistoryLog"];
    const next = {
      id: "same",
    } as unknown as StudioState["directEditor"]["relationshipQueueHistory"];

    handlers.onDirectRelationshipQueueHistoryChange(next);

    expect(state.directEditor.relationshipQueueHistory).toBe(next);
    expect(
      state.directEditor.relationshipQueueHistoryLog.map((item) => item.id),
    ).toEqual(["same", "old-1", "old-2", "old-3"]);
  });
});

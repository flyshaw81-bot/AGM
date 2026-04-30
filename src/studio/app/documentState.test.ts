import { describe, expect, it, vi } from "vitest";
import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import {
  type DocumentStateTargets,
  restoreAgmDocumentState,
  syncDocumentState,
  syncEditorWorkflowState,
} from "./documentState";

function createState(): StudioState {
  return {
    section: "project",
    editor: {
      activeEditor: null,
      editorDialogOpen: false,
      lastEditorSection: null,
    },
    document: {
      name: "AGM Draft",
      documentWidth: 1000,
      documentHeight: 700,
      seed: "seed-a",
      stylePreset: "atlas",
      dirty: false,
      source: "agm",
      gameProfile: "strategy",
      designIntent: "balanced",
    },
    viewport: {
      zoom: 1,
      panX: 0,
      panY: 0,
    },
    export: {
      format: "png",
    },
    generationProfileOverrides: {
      profile: "strategy",
      values: {},
    },
  } as unknown as StudioState;
}

function createTargets(
  overrides: Partial<DocumentStateTargets> = {},
): DocumentStateTargets {
  return {
    syncEditorState: vi.fn(() => ({
      activeEditor: "states",
      editorDialogOpen: true,
    })),
    getDocumentState: vi.fn(() => ({
      name: "Engine Map",
      documentWidth: 1200,
      documentHeight: 800,
      seed: "seed-b",
      dirty: true,
    })),
    getStylePreset: vi.fn(() => "pencil"),
    setDocumentName: vi.fn((name) => `${name} saved`),
    setLayersPreset: vi.fn(),
    getLayerStates: vi.fn(() => ({
      biomes: false,
      states: true,
    })),
    toggleLayer: vi.fn(),
    ...overrides,
  } as unknown as DocumentStateTargets;
}

describe("documentState", () => {
  it("syncs editor workflow through injected targets", () => {
    const state = createState();
    const targets = createTargets();

    const changed = syncEditorWorkflowState(state, targets);

    expect(changed).toBe(true);
    expect(state.section).toBe("editors");
    expect(state.editor.lastEditorSection).toBe("project");
    expect(state.editor.activeEditor).toBe("states");
  });

  it("syncs document metadata through injected document/style targets", () => {
    const state = createState();
    const targets = createTargets();

    const changed = syncDocumentState(state, targets);

    expect(changed).toBe(true);
    expect(state.document).toMatchObject({
      name: "AGM Draft",
      documentWidth: 1200,
      documentHeight: 800,
      seed: "seed-b",
      stylePreset: "pencil",
      dirty: true,
      source: "agm",
    });
  });

  it("uses engine document name when the current source is core", () => {
    const state = createState();
    state.document.source = "core";

    syncDocumentState(state, createTargets());

    expect(state.document.name).toBe("Engine Map");
  });

  it("restores AGM draft document, viewport, export, generation, and layers through targets", () => {
    const state = createState();
    const targets = createTargets();
    const viewportRestored = vi.fn();
    const layers: WorldDocumentDraft["layers"] = {
      preset: "political",
      visible: {
        biomes: true,
        states: true,
      },
    } as unknown as WorldDocumentDraft["layers"];

    restoreAgmDocumentState(
      state,
      {
        document: {
          name: "Northwatch",
          gameProfile: "strategy",
          designIntent: "frontier",
        },
        world: {
          viewport: {
            presetId: "desktop-landscape",
            orientation: "landscape",
            fitMode: "cover",
            zoom: 2,
          } as WorldDocumentDraft["viewport"],
          export: { format: "svg" } as WorldDocumentDraft["export"],
          generation: {
            profileOverrides: {
              profile: "strategy",
              values: { spawnFairnessWeight: 5 },
            },
          } as WorldDocumentDraft["generation"],
          layers,
        },
      },
      viewportRestored,
      targets,
    );

    expect(state.document).toMatchObject({
      name: "Northwatch saved",
      source: "agm",
      designIntent: "frontier",
    });
    expect(state.viewport.zoom).toBe(2);
    expect(state.export.format).toBe("svg");
    expect(state.generationProfileOverrides.values).toMatchObject({
      spawnFairnessWeight: 5,
    });
    expect(targets.setLayersPreset).toHaveBeenCalledWith("political");
    expect(targets.toggleLayer).toHaveBeenCalledWith("biomes");
    expect(targets.toggleLayer).not.toHaveBeenCalledWith("states");
    expect(viewportRestored).toHaveBeenCalledWith(state);
  });
});

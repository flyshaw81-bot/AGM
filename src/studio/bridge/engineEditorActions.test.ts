import { describe, expect, it, vi } from "vitest";
import type { EditorAction } from "./engineActionTypes";
import {
  closeEngineEditor,
  getEngineEditorAvailability,
  getOpenEngineEditor,
  isEngineEditorOpen,
  openEngineEditor,
  syncEngineEditorState,
} from "./engineEditorActions";
import type { EngineEditorTargets } from "./engineEditorTargets";

function createTargets(overrides?: {
  handlers?: Partial<Record<EditorAction, boolean>>;
  openDialogs?: string[];
}) {
  const openDialogs = new Set(overrides?.openDialogs ?? []);
  const closedDialogs: string[] = [];
  const runEditorHandler = vi.fn(async (_action: EditorAction) => undefined);
  const targets: EngineEditorTargets = {
    hasEditorHandler: (action) => Boolean(overrides?.handlers?.[action]),
    runEditorHandler,
    isDialogOpen: (dialogId) => openDialogs.has(dialogId),
    closeDialog: vi.fn((dialogId) => {
      closedDialogs.push(dialogId);
      openDialogs.delete(dialogId);
    }),
  };
  return { targets, closedDialogs, runEditorHandler };
}

describe("engine editor actions", () => {
  it("builds editor availability through injected targets", () => {
    const { targets } = createTargets({
      handlers: {
        editStates: true,
        editBiomes: true,
      },
    });

    expect(getEngineEditorAvailability(targets)).toMatchObject({
      editStates: true,
      editCultures: false,
      editBiomes: true,
    });
  });

  it("resolves open editor state through injected dialog targets", () => {
    const { targets } = createTargets({ openDialogs: ["biomesEditor"] });

    expect(isEngineEditorOpen("editBiomes", targets)).toBe(true);
    expect(getOpenEngineEditor(targets)).toBe("editBiomes");
    expect(syncEngineEditorState(targets)).toEqual({
      activeEditor: "editBiomes",
      editorDialogOpen: true,
    });
  });

  it("closes editor dialogs and opens the requested editor through targets", async () => {
    const { targets, closedDialogs, runEditorHandler } = createTargets();

    closeEngineEditor("editStates", targets);
    await openEngineEditor("editBiomes", targets);

    expect(closedDialogs).toContain("statesEditor");
    expect(closedDialogs).toEqual([
      "statesEditor",
      "statesEditor",
      "culturesEditor",
      "religionsEditor",
      "provincesEditor",
      "zonesEditor",
      "diplomacyEditor",
    ]);
    expect(runEditorHandler).toHaveBeenCalledWith("editBiomes");
  });
});

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
        stateWorkbench: true,
        biomeWorkbench: true,
      },
    });

    expect(getEngineEditorAvailability(targets)).toMatchObject({
      stateWorkbench: true,
      cultureWorkbench: false,
      biomeWorkbench: true,
    });
  });

  it("does not infer native editor state from removed legacy dialogs", () => {
    const { targets } = createTargets({ openDialogs: ["studioEngineEditor"] });

    expect(isEngineEditorOpen("biomeWorkbench", targets)).toBe(false);
    expect(getOpenEngineEditor(targets)).toBeNull();
    expect(syncEngineEditorState(targets)).toEqual({
      activeEditor: null,
      editorDialogOpen: false,
    });
  });

  it("closes editor dialogs and opens the requested editor through targets", async () => {
    const { targets, closedDialogs, runEditorHandler } = createTargets();

    closeEngineEditor("stateWorkbench", targets);
    await openEngineEditor("biomeWorkbench", targets);

    expect(closedDialogs).toEqual(["studioEngineEditor", "studioEngineEditor"]);
    expect(runEditorHandler).toHaveBeenCalledWith("biomeWorkbench");
  });
});

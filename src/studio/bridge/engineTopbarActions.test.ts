import { describe, expect, it, vi } from "vitest";
import type { DataAction } from "./engineActionTypes";
import {
  getEngineTopbarActions,
  runEngineTopbarAction,
} from "./engineTopbarActions";
import type { EngineTopbarTargets } from "./engineTopbarTargets";

function createTargets(overrides?: {
  canCreateNew?: boolean;
  canOpenFile?: boolean;
  canSaveToMachine?: boolean;
}) {
  const runDataAction = vi.fn(async (_action: DataAction) => undefined);
  const targets: EngineTopbarTargets = {
    getDataActions: () => ({
      canCreateNew: overrides?.canCreateNew ?? true,
      canOpenFile: overrides?.canOpenFile ?? true,
      canSaveToMachine: overrides?.canSaveToMachine ?? true,
    }),
    runDataAction,
  };
  return { targets, runDataAction };
}

describe("engine topbar actions", () => {
  it("builds topbar availability from injected data action targets", () => {
    const { targets } = createTargets({
      canCreateNew: true,
      canOpenFile: false,
      canSaveToMachine: true,
    });

    expect(getEngineTopbarActions(targets)).toEqual({
      new: true,
      open: false,
      save: true,
      export: true,
    });
  });

  it("maps topbar commands to data commands through injected targets", async () => {
    const { targets, runDataAction } = createTargets();

    await runEngineTopbarAction("new", targets);
    await runEngineTopbarAction("open", targets);
    await runEngineTopbarAction("save", targets);
    await runEngineTopbarAction("export", targets);

    expect(runDataAction).toHaveBeenCalledTimes(3);
    expect(runDataAction).toHaveBeenNthCalledWith(1, "new-map");
    expect(runDataAction).toHaveBeenNthCalledWith(2, "open-file");
    expect(runDataAction).toHaveBeenNthCalledWith(3, "save-machine");
  });
});

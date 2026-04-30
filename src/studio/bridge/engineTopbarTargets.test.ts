import { describe, expect, it, vi } from "vitest";
import type { DataAction } from "./engineActionTypes";
import { createEngineTopbarTargets } from "./engineTopbarTargets";

describe("createEngineTopbarTargets", () => {
  it("composes topbar targets from an injected data-action adapter", async () => {
    const getActions = vi.fn(() => ({
      canCreateNew: true,
      canOpenFile: false,
      canSaveToMachine: true,
    }));
    const runAction = vi.fn(async (_action: DataAction) => undefined);

    const targets = createEngineTopbarTargets({
      getActions,
      runAction,
    });

    expect(targets.getDataActions()).toEqual({
      canCreateNew: true,
      canOpenFile: false,
      canSaveToMachine: true,
    });
    await targets.runDataAction("save-machine");

    expect(getActions).toHaveBeenCalledTimes(1);
    expect(runAction).toHaveBeenCalledWith("save-machine");
  });
});

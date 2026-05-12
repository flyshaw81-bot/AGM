import { describe, expect, it, vi } from "vitest";
import type { DataAction } from "./engineActionTypes";
import { createEngineTopbarTargets } from "./engineTopbarTargets";

describe("createEngineTopbarTargets", () => {
  it("composes topbar targets from an injected data-action adapter", async () => {
    const getActions = vi.fn(() => ({
      canCreateGeneratedWorld: true,
      canOpenFile: false,
      canDownloadProject: true,
    }));
    const runAction = vi.fn(async (_action: DataAction) => undefined);

    const targets = createEngineTopbarTargets({
      getActions,
      runAction,
    });

    expect(targets.getDataActions()).toEqual({
      canCreateGeneratedWorld: true,
      canOpenFile: false,
      canDownloadProject: true,
    });
    await targets.runDataAction("download-project");

    expect(getActions).toHaveBeenCalledTimes(1);
    expect(runAction).toHaveBeenCalledWith("download-project");
  });
});

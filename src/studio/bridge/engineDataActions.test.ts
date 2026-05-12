import { describe, expect, it, vi } from "vitest";
import { getEngineDataActions, runEngineDataAction } from "./engineDataActions";
import type { EngineDataActionTargets } from "./engineDataActionTargets";

function createTargets(
  overrides: Partial<EngineDataActionTargets> = {},
): EngineDataActionTargets {
  return {
    ensureDocumentSourceTracking: vi.fn(),
    getDocumentSourceSummary: vi.fn(() => ({
      sourceLabel: "Generated",
      sourceDetail: "Current settings",
    })),
    getSaveTargetSummary: vi.fn(() => ({
      saveLabel: "Not saved yet",
      saveDetail: "-",
    })),
    setDocumentSourceSummary: vi.fn(),
    hasFileInput: vi.fn(() => true),
    clickFileInput: vi.fn(),
    canLoadBrowserSnapshot: vi.fn(() => true),
    loadBrowserSnapshot: vi.fn(async () => undefined),
    canSaveProject: vi.fn(() => true),
    saveProject: vi.fn(async () => undefined),
    canCreateGeneratedWorld: vi.fn(() => true),
    createGeneratedWorld: vi.fn(async () => undefined),
    canOpenUrlSource: vi.fn(() => true),
    openUrlSource: vi.fn(),
    ...overrides,
  };
}

describe("engine data actions", () => {
  it("builds data action availability through targets", () => {
    const targets = createTargets();

    expect(getEngineDataActions(targets)).toEqual({
      canLoadBrowserSnapshot: true,
      canSaveBrowserSnapshot: true,
      canDownloadProject: true,
      sourceLabel: "Generated",
      sourceDetail: "Current settings",
      saveLabel: "Not saved yet",
      saveDetail: "-",
      canCreateGeneratedWorld: true,
      canOpenFile: true,
      canOpenUrlSource: true,
    });
    expect(targets.ensureDocumentSourceTracking).toHaveBeenCalledWith();
  });

  it("loads a browser snapshot and updates source summary", async () => {
    const targets = createTargets();

    await runEngineDataAction("load-browser-snapshot", targets);

    expect(targets.loadBrowserSnapshot).toHaveBeenCalledWith();
    expect(targets.setDocumentSourceSummary).toHaveBeenCalledWith({
      sourceLabel: "Browser snapshot",
      sourceDetail: "Browser snapshot",
    });
  });

  it("runs save actions through the project save target", async () => {
    const targets = createTargets();

    await runEngineDataAction("download-project", targets);

    expect(targets.saveProject).toHaveBeenCalledWith("machine");
  });

  it("runs generated world, open file, and URL source actions through targets", async () => {
    const targets = createTargets();

    await runEngineDataAction("create-generated-world", targets);
    await runEngineDataAction("open-file", targets);
    await runEngineDataAction("open-url-source", targets);

    expect(targets.createGeneratedWorld).toHaveBeenCalledWith();
    expect(targets.setDocumentSourceSummary).toHaveBeenCalledWith({
      sourceLabel: "Generated",
      sourceDetail: "Current settings",
    });
    expect(targets.clickFileInput).toHaveBeenCalledWith();
    expect(targets.openUrlSource).toHaveBeenCalledWith();
  });
});

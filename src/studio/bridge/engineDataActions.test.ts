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
    getDropboxState: vi.fn(() => ({
      connectButtonAvailable: true,
      connected: true,
      buttonsVisible: true,
      selectedFile: "world.map",
      selectedLabel: "World Map",
      hasShareLink: true,
      shareUrl: "https://example.test/world.map",
    })),
    hasFileInput: vi.fn(() => true),
    clickFileInput: vi.fn(),
    canQuickLoad: vi.fn(() => true),
    quickLoad: vi.fn(async () => undefined),
    canSaveMap: vi.fn(() => true),
    saveMap: vi.fn(async () => undefined),
    canConnectDropbox: vi.fn(() => true),
    connectDropbox: vi.fn(async () => undefined),
    canLoadFromDropbox: vi.fn(() => true),
    loadFromDropbox: vi.fn(async () => undefined),
    canShareDropbox: vi.fn(() => true),
    createSharableDropboxLink: vi.fn(async () => undefined),
    canGenerateMapOnLoad: vi.fn(() => true),
    generateMapOnLoad: vi.fn(async () => undefined),
    canLoadUrl: vi.fn(() => true),
    loadUrl: vi.fn(),
    ...overrides,
  };
}

describe("engine data actions", () => {
  it("builds data action availability and Dropbox state through targets", () => {
    const targets = createTargets();

    expect(getEngineDataActions(targets)).toEqual({
      canQuickLoad: true,
      canSaveToStorage: true,
      canSaveToMachine: true,
      canSaveToDropbox: true,
      canConnectDropbox: true,
      canLoadFromDropbox: true,
      canShareDropbox: true,
      hasDropboxSelection: true,
      dropboxConnected: true,
      selectedDropboxFile: "world.map",
      selectedDropboxLabel: "World Map",
      hasDropboxShareLink: true,
      dropboxShareUrl: "https://example.test/world.map",
      sourceLabel: "Generated",
      sourceDetail: "Current settings",
      saveLabel: "Not saved yet",
      saveDetail: "-",
      canCreateNew: true,
      canOpenFile: true,
      canLoadUrl: true,
    });
    expect(targets.ensureDocumentSourceTracking).toHaveBeenCalledWith();
  });

  it("runs quick load and updates source summary", async () => {
    const targets = createTargets();

    await runEngineDataAction("quick-load", targets);

    expect(targets.quickLoad).toHaveBeenCalledWith();
    expect(targets.setDocumentSourceSummary).toHaveBeenCalledWith({
      sourceLabel: "Browser snapshot",
      sourceDetail: "Quick load",
    });
  });

  it("runs save actions through the save map target", async () => {
    const targets = createTargets();

    await runEngineDataAction("save-machine", targets);

    expect(targets.saveMap).toHaveBeenCalledWith("machine");
  });

  it("runs Dropbox load and records the selected label", async () => {
    const targets = createTargets();

    await runEngineDataAction("load-dropbox", targets);

    expect(targets.loadFromDropbox).toHaveBeenCalledWith();
    expect(targets.setDocumentSourceSummary).toHaveBeenCalledWith({
      sourceLabel: "Dropbox",
      sourceDetail: "World Map",
    });
  });

  it("runs new map, open file, and load URL actions through targets", async () => {
    const targets = createTargets();

    await runEngineDataAction("new-map", targets);
    await runEngineDataAction("open-file", targets);
    await runEngineDataAction("load-url", targets);

    expect(targets.generateMapOnLoad).toHaveBeenCalledWith();
    expect(targets.setDocumentSourceSummary).toHaveBeenCalledWith({
      sourceLabel: "Generated",
      sourceDetail: "Current settings",
    });
    expect(targets.clickFileInput).toHaveBeenCalledWith();
    expect(targets.loadUrl).toHaveBeenCalledWith();
  });
});

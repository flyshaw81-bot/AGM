import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalDataActionTargets } from "./engineDataActionTargets";

type TestDataGlobals = typeof globalThis & {
  quickLoad?: () => Promise<void>;
  saveMap?: (method: "storage" | "machine" | "dropbox") => Promise<void>;
  loadURL?: () => void;
};

const testGlobals = globalThis as TestDataGlobals;
const originalDocument = globalThis.document;
const originalQuickLoad = testGlobals.quickLoad;
const originalSaveMap = testGlobals.saveMap;
const originalLoadUrl = testGlobals.loadURL;

describe("createGlobalDataActionTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    testGlobals.quickLoad = originalQuickLoad;
    testGlobals.saveMap = originalSaveMap;
    testGlobals.loadURL = originalLoadUrl;
  });

  it("reads Dropbox state and file input availability from the active document", () => {
    const fileInput = { click: vi.fn() };
    const dropboxSelect = {
      value: "world.map",
      selectedOptions: [{ textContent: " World Map " }],
      style: { display: "block" },
    };
    const dropboxButtons = { style: { display: "block" } };
    const shareContainer = { style: { display: "block" } };
    const shareLink = { href: "https://example.test/world.map" };
    globalThis.document = {
      getElementById: vi.fn((id) =>
        id === "mapToLoad"
          ? fileInput
          : id === "dropboxConnectButton"
            ? {}
            : id === "loadFromDropboxSelect"
              ? dropboxSelect
              : id === "loadFromDropboxButtons"
                ? dropboxButtons
                : id === "sharableLinkContainer"
                  ? shareContainer
                  : id === "sharableLink"
                    ? shareLink
                    : null,
      ),
    } as unknown as Document;

    const targets = createGlobalDataActionTargets();

    expect(targets.hasFileInput()).toBe(true);
    targets.clickFileInput();
    expect(fileInput.click).toHaveBeenCalledWith();
    expect(targets.getDropboxState()).toEqual({
      connectButtonAvailable: true,
      connected: true,
      buttonsVisible: true,
      selectedFile: "world.map",
      selectedLabel: "World Map",
      hasShareLink: true,
      shareUrl: "https://example.test/world.map",
    });
  });

  it("forwards runtime data operations when available", async () => {
    const quickLoad = vi.fn(async () => undefined);
    const saveMap = vi.fn(async () => undefined);
    const loadURL = vi.fn();
    testGlobals.quickLoad = quickLoad;
    testGlobals.saveMap = saveMap;
    testGlobals.loadURL = loadURL;

    const targets = createGlobalDataActionTargets();

    expect(targets.canQuickLoad()).toBe(true);
    await targets.quickLoad();
    await targets.saveMap("storage");
    targets.loadUrl();

    expect(quickLoad).toHaveBeenCalledWith();
    expect(saveMap).toHaveBeenCalledWith("storage");
    expect(loadURL).toHaveBeenCalledWith();
  });
});

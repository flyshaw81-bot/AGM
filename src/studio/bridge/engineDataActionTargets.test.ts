import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  EngineDocumentSourceSummary,
  EngineSaveTargetSummary,
} from "./engineActionTypes";
import {
  createDataActionTargets,
  createGlobalDataActionTargets,
} from "./engineDataActionTargets";

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
const originalWindow = globalThis.window;

describe("createGlobalDataActionTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    testGlobals.quickLoad = originalQuickLoad;
    testGlobals.saveMap = originalSaveMap;
    testGlobals.loadURL = originalLoadUrl;
    globalThis.window = originalWindow;
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

  it("keeps default DOM and runtime actions safe when browser helpers are absent", async () => {
    globalThis.document = undefined as unknown as Document;
    globalThis.window = {} as Window & typeof globalThis;

    const targets = createGlobalDataActionTargets();

    expect(targets.hasFileInput()).toBe(false);
    expect(() => targets.clickFileInput()).not.toThrow();
    expect(targets.getDropboxState()).toEqual({
      connectButtonAvailable: false,
      connected: false,
      buttonsVisible: false,
      selectedFile: "",
      selectedLabel: "",
      hasShareLink: false,
      shareUrl: "",
    });
    expect(targets.canQuickLoad()).toBe(false);
    expect(targets.canSaveMap()).toBe(false);
    expect(targets.canConnectDropbox()).toBe(false);
    expect(targets.canLoadFromDropbox()).toBe(false);
    expect(targets.canShareDropbox()).toBe(false);
    expect(targets.canGenerateMapOnLoad()).toBe(false);
    expect(targets.canLoadUrl()).toBe(false);
    await expect(targets.quickLoad()).resolves.toBeUndefined();
    await expect(targets.saveMap("machine")).resolves.toBeUndefined();
    await expect(targets.connectDropbox()).resolves.toBeUndefined();
    await expect(targets.loadFromDropbox()).resolves.toBeUndefined();
    await expect(targets.createSharableDropboxLink()).resolves.toBeUndefined();
    await expect(targets.generateMapOnLoad()).resolves.toBeUndefined();
    expect(() => targets.loadUrl()).not.toThrow();
  });

  it("composes data action targets from injected document, DOM, and runtime adapters", async () => {
    const documentSummary = {
      sourceLabel: "AGM Core",
      sourceDetail: "Current map",
    } as EngineDocumentSourceSummary;
    const saveSummary = {
      saveLabel: "Browser storage",
      saveDetail: "Local save",
    } satisfies EngineSaveTargetSummary;
    const ensureDocumentSourceTracking = vi.fn();
    const setDocumentSourceSummary = vi.fn();
    const clickFileInput = vi.fn();
    const quickLoad = vi.fn(async () => undefined);
    const saveMap = vi.fn(async () => undefined);
    const targets = createDataActionTargets(
      {
        ensureDocumentSourceTracking,
        getDocumentSourceSummary: () => documentSummary,
        getSaveTargetSummary: () => saveSummary,
        setDocumentSourceSummary,
      },
      {
        getDropboxState: () => ({
          connectButtonAvailable: true,
          connected: false,
          buttonsVisible: false,
          selectedFile: "",
          selectedLabel: "",
          hasShareLink: false,
          shareUrl: "",
        }),
        hasFileInput: () => true,
        clickFileInput,
      },
      {
        canQuickLoad: () => true,
        quickLoad,
        canSaveMap: () => true,
        saveMap,
        canConnectDropbox: () => false,
        connectDropbox: async () => undefined,
        canLoadFromDropbox: () => false,
        loadFromDropbox: async () => undefined,
        canShareDropbox: () => false,
        createSharableDropboxLink: async () => undefined,
        canGenerateMapOnLoad: () => false,
        generateMapOnLoad: async () => undefined,
        canLoadUrl: () => false,
        loadUrl: vi.fn(),
      },
    );

    targets.ensureDocumentSourceTracking();
    expect(ensureDocumentSourceTracking).toHaveBeenCalledWith();
    expect(targets.getDocumentSourceSummary()).toBe(documentSummary);
    expect(targets.getSaveTargetSummary()).toBe(saveSummary);
    targets.setDocumentSourceSummary(documentSummary);
    expect(setDocumentSourceSummary).toHaveBeenCalledWith(documentSummary);
    expect(targets.hasFileInput()).toBe(true);
    targets.clickFileInput();
    expect(clickFileInput).toHaveBeenCalledWith();
    expect(targets.canQuickLoad()).toBe(true);
    await targets.quickLoad();
    await targets.saveMap("dropbox");
    expect(quickLoad).toHaveBeenCalledWith();
    expect(saveMap).toHaveBeenCalledWith("dropbox");
  });
});

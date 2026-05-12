import { describe, expect, it, vi } from "vitest";

import {
  createEngineStartupLifecycle,
  createEngineStartupService,
  type EngineStartupLifecycleTargets,
  type EngineStartupTargets,
} from "./engine-startup-service";

function createTargets(
  overrides: Partial<EngineStartupTargets> = {},
): EngineStartupTargets {
  return {
    getUrl: vi.fn(() => new URL("https://agm.local/")),
    getOnloadBehavior: vi.fn(() => "newMap"),
    warn: vi.fn(),
    error: vi.fn(),
    openUrlSource: vi.fn(),
    showUploadErrorMessage: vi.fn(),
    getLastMap: vi.fn(async () => undefined),
    importProjectFile: vi.fn(),
    applyStyleOnLoad: vi.fn(async () => undefined),
    generate: vi.fn(async () => undefined),
    applyLayersPreset: vi.fn(),
    drawLayers: vi.fn(),
    fitMapToScreen: vi.fn(),
    focusOn: vi.fn(),
    toggleAssistant: vi.fn(),
    schedule: vi.fn((callback) => callback()),
    ...overrides,
  };
}

function createLifecycleTargets(
  overrides: Partial<EngineStartupLifecycleTargets> = {},
): EngineStartupLifecycleTargets {
  return {
    isServerless: vi.fn(() => false),
    showServerlessNotice: vi.fn(),
    hideLoading: vi.fn(),
    checkLoadParameters: vi.fn(async () => undefined),
    restoreDefaultEvents: vi.fn(),
    initiateAutosave: vi.fn(),
    getReadyState: vi.fn((): DocumentReadyState => "complete"),
    onDomContentLoaded: vi.fn(),
    ...overrides,
  };
}

describe("engine startup service", () => {
  it("loads a valid maplink through the delayed loader path", async () => {
    const targets = createTargets({
      getUrl: vi.fn(
        () =>
          new URL("https://agm.local/?maplink=https://maps.local/world.map"),
      ),
    });
    const service = createEngineStartupService(targets);

    await service.checkLoadParameters();

    expect(targets.warn).toHaveBeenCalledWith("Load map from URL");
    expect(targets.schedule).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(targets.openUrlSource).toHaveBeenCalledWith(
      "https://maps.local/world.map",
      1,
    );
    expect(targets.generate).not.toHaveBeenCalled();
  });

  it("reports invalid maplinks and falls through to random generation", async () => {
    const targets = createTargets({
      getUrl: vi.fn(() => new URL("https://agm.local/?maplink=not-a-url")),
    });
    const service = createEngineStartupService(targets);

    await service.checkLoadParameters();

    expect(targets.showUploadErrorMessage).toHaveBeenCalledWith(
      "Map link is not a valid URL",
      "not-a-url",
    );
    expect(targets.generate).toHaveBeenCalledTimes(1);
  });

  it("awaits full generation when a seed is supplied", async () => {
    const targets = createTargets({
      getUrl: vi.fn(() => new URL("https://agm.local/?seed=12345")),
    });
    const service = createEngineStartupService(targets);

    await service.checkLoadParameters();

    expect(targets.applyStyleOnLoad).toHaveBeenCalledTimes(1);
    expect(targets.generate).toHaveBeenCalledTimes(1);
    expect(targets.applyLayersPreset).toHaveBeenCalledTimes(1);
    expect(targets.drawLayers).toHaveBeenCalledTimes(1);
    expect(targets.fitMapToScreen).toHaveBeenCalledTimes(1);
    expect(targets.focusOn).toHaveBeenCalledTimes(1);
    expect(targets.toggleAssistant).toHaveBeenCalledTimes(1);
  });

  it("loads the last saved map when configured and available", async () => {
    const blob = new Blob(["map"]);
    const targets = createTargets({
      getOnloadBehavior: vi.fn(() => "lastSaved"),
      getLastMap: vi.fn(async () => blob),
    });
    const service = createEngineStartupService(targets);

    await service.checkLoadParameters();

    expect(targets.warn).toHaveBeenCalledWith("Loading last stored map");
    expect(targets.importProjectFile).toHaveBeenCalledWith(blob);
    expect(targets.generate).not.toHaveBeenCalled();
  });

  it("falls back to random generation when last saved loading fails", async () => {
    const error = new Error("indexeddb unavailable");
    const targets = createTargets({
      getOnloadBehavior: vi.fn(() => "lastSaved"),
      getLastMap: vi.fn(async () => {
        throw error;
      }),
    });
    const service = createEngineStartupService(targets);

    await service.checkLoadParameters();

    expect(targets.error).toHaveBeenCalledWith(error);
    expect(targets.warn).toHaveBeenCalledWith("Generate random map");
    expect(targets.generate).toHaveBeenCalledTimes(1);
  });

  it("runs initial map loading and post-load hooks immediately for a complete document", async () => {
    const targets = createLifecycleTargets();
    const lifecycle = createEngineStartupLifecycle(targets);

    lifecycle.install();
    await lifecycle.startPostLoadHooks();

    expect(targets.hideLoading).toHaveBeenCalledTimes(1);
    expect(targets.checkLoadParameters).toHaveBeenCalledTimes(1);
    expect(targets.restoreDefaultEvents).toHaveBeenCalledTimes(1);
    expect(targets.initiateAutosave).toHaveBeenCalledTimes(1);
    expect(targets.onDomContentLoaded).not.toHaveBeenCalled();
  });

  it("defers post-load hooks until DOMContentLoaded for loading documents", async () => {
    let listener: (() => void) | undefined;
    const targets = createLifecycleTargets({
      getReadyState: vi.fn((): DocumentReadyState => "loading"),
      onDomContentLoaded: vi.fn((callback) => {
        listener = callback;
      }),
    });
    const lifecycle = createEngineStartupLifecycle(targets);

    lifecycle.install();
    await lifecycle.startInitialMapLoad();

    expect(targets.checkLoadParameters).toHaveBeenCalledTimes(1);
    expect(targets.restoreDefaultEvents).not.toHaveBeenCalled();

    listener?.();
    await lifecycle.startPostLoadHooks();

    expect(targets.restoreDefaultEvents).toHaveBeenCalledTimes(1);
    expect(targets.initiateAutosave).toHaveBeenCalledTimes(1);
  });

  it("shows serverless notice without running map load", async () => {
    const targets = createLifecycleTargets({
      isServerless: vi.fn(() => true),
    });
    const lifecycle = createEngineStartupLifecycle(targets);

    await lifecycle.startInitialMapLoad();

    expect(targets.showServerlessNotice).toHaveBeenCalledTimes(1);
    expect(targets.hideLoading).not.toHaveBeenCalled();
    expect(targets.checkLoadParameters).not.toHaveBeenCalled();
  });
});

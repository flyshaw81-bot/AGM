import { describe, expect, it, vi } from "vitest";
import type { StudioViewportSync } from "./studioBootstrap";
import {
  createGlobalStudioBootstrapDomTargets,
  createStudioBootstrapDomTargets,
} from "./studioBootstrapDom";

describe("createGlobalStudioBootstrapDomTargets", () => {
  it("composes body, browser event, and viewport sync adapters", () => {
    const body = {
      enableStudioBody: vi.fn(),
      removeLoadingIndicator: vi.fn(),
    };
    const browserEvents = {
      addResizeListener: vi.fn(),
      getDocumentReadyState: vi.fn(() => "loading" as const),
      addDomContentLoadedListener: vi.fn(),
    };
    const viewportSync = {
      setViewportSync: vi.fn(),
    };

    const targets = createStudioBootstrapDomTargets(
      body,
      browserEvents,
      viewportSync,
    );
    const resize = vi.fn();
    const ready = vi.fn();
    const sync: StudioViewportSync = vi.fn();

    targets.enableStudioBody();
    targets.removeLoadingIndicator();
    targets.addResizeListener(resize);
    targets.addDomContentLoadedListener(ready);
    targets.setViewportSync(sync);

    expect(body.enableStudioBody).toHaveBeenCalled();
    expect(body.removeLoadingIndicator).toHaveBeenCalled();
    expect(browserEvents.addResizeListener).toHaveBeenCalledWith(resize);
    expect(targets.getDocumentReadyState()).toBe("loading");
    expect(browserEvents.addDomContentLoadedListener).toHaveBeenCalledWith(
      ready,
    );
    expect(viewportSync.setViewportSync).toHaveBeenCalledWith(sync);
  });

  it("wires browser DOM and window operations behind bootstrap targets", () => {
    const bodyClassList = { add: vi.fn() };
    const loading = { remove: vi.fn() };
    const addWindowEventListener = vi.fn();
    const addDocumentEventListener = vi.fn();
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    const windowMock = {
      addEventListener: addWindowEventListener,
    } as unknown as Window & typeof globalThis;
    const documentMock = {
      body: { classList: bodyClassList },
      getElementById: vi.fn(() => loading),
      readyState: "interactive",
      addEventListener: addDocumentEventListener,
    } as unknown as Document;
    globalThis.window = windowMock;
    globalThis.document = documentMock;

    try {
      const targets = createGlobalStudioBootstrapDomTargets();
      const resize = vi.fn();
      const ready = vi.fn();
      const sync: StudioViewportSync = vi.fn();

      targets.enableStudioBody();
      targets.removeLoadingIndicator();
      targets.addResizeListener(resize);
      targets.addDomContentLoadedListener(ready);
      targets.setViewportSync(sync);

      expect(bodyClassList.add).toHaveBeenCalledWith("studio-enabled");
      expect(documentMock.getElementById).toHaveBeenCalledWith("loading");
      expect(loading.remove).toHaveBeenCalled();
      expect(addWindowEventListener).toHaveBeenCalledWith("resize", resize);
      expect(targets.getDocumentReadyState()).toBe("interactive");
      expect(addDocumentEventListener).toHaveBeenCalledWith(
        "DOMContentLoaded",
        ready,
        { once: true },
      );
      expect(windowMock.studioViewportSync).toBe(sync);
    } finally {
      globalThis.document = originalDocument;
      globalThis.window = originalWindow;
    }
  });
});

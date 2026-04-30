import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalNoticeService,
  createJQueryNoticeDialogHost,
  type EngineNoticeDialogHost,
} from "./engine-notice-service";

const originalAlertMessage = globalThis.alertMessage;
const originalDollar = globalThis.$;
const originalParseError = globalThis.parseError;
const originalClearMainTip = globalThis.clearMainTip;
const originalCleanupData = globalThis.cleanupData;
const originalRegenerateMap = globalThis.regenerateMap;

function createDialogHost() {
  const host: EngineNoticeDialogHost = {
    setHtml: vi.fn(),
    open: vi.fn(),
    close: vi.fn(),
  };

  return host;
}

function installGenerationGlobals() {
  globalThis.parseError = vi.fn(() => "Parsed failure");
  globalThis.clearMainTip = vi.fn();
  globalThis.cleanupData = vi.fn();
  globalThis.regenerateMap = vi.fn();
}

describe("createGlobalNoticeService", () => {
  afterEach(() => {
    globalThis.alertMessage = originalAlertMessage;
    globalThis.$ = originalDollar;
    globalThis.parseError = originalParseError;
    globalThis.clearMainTip = originalClearMainTip;
    globalThis.cleanupData = originalCleanupData;
    globalThis.regenerateMap = originalRegenerateMap;
  });

  it("opens a modal through an injected dialog host", () => {
    const host = createDialogHost();

    createGlobalNoticeService(host).showModal({
      title: "Notice",
      html: "<p>Body</p>",
      resizable: true,
      width: "28em",
      position: { my: "left" },
    });

    expect(host.setHtml).toHaveBeenCalledWith("<p>Body</p>");
    expect(host.open).toHaveBeenCalledWith(
      expect.objectContaining({
        resizable: true,
        title: "Notice",
        width: "28em",
        position: { my: "left" },
      }),
    );
  });

  it("uses the default close button when no modal buttons are provided", () => {
    const host = createDialogHost();

    createGlobalNoticeService(host).showModal({
      title: "Notice",
      html: "Body",
    });

    const options = vi.mocked(host.open).mock.calls[0][0];
    options.buttons?.Ok.call("dialog-node");

    expect(host.close).toHaveBeenCalledWith("dialog-node");
  });

  it("routes generation errors through cleanup, regenerate, and ignore dialog actions", () => {
    installGenerationGlobals();
    const host = createDialogHost();
    const error = new Error("Boom");

    createGlobalNoticeService(host).showGenerationError(error);

    expect(globalThis.parseError).toHaveBeenCalledWith(error);
    expect(globalThis.clearMainTip).toHaveBeenCalledWith();
    expect(host.setHtml).toHaveBeenCalledWith(
      expect.stringContaining("Parsed failure"),
    );

    const options = vi.mocked(host.open).mock.calls[0][0];
    expect(options).toMatchObject({
      resizable: false,
      title: "Generation error",
      width: "32em",
      position: { my: "center", at: "center", of: "svg" },
    });

    options.buttons?.["Cleanup data"].call("dialog-node");
    options.buttons?.Regenerate.call("dialog-node");
    options.buttons?.Ignore.call("dialog-node");

    expect(globalThis.cleanupData).toHaveBeenCalledWith();
    expect(globalThis.regenerateMap).toHaveBeenCalledWith("generation error");
    expect(host.close).toHaveBeenCalledTimes(2);
    expect(host.close).toHaveBeenCalledWith("dialog-node");
  });

  it("keeps jQuery UI access inside the default compatibility host", () => {
    const dialog = vi.fn();
    const close = vi.fn();
    const dollar = vi.fn((selectorOrDialog: unknown) => {
      if (selectorOrDialog === "#alert") return { dialog };
      return { dialog: close };
    });
    globalThis.alertMessage = { innerHTML: "" } as HTMLElement;
    globalThis.$ = dollar as unknown as typeof $;

    const host = createJQueryNoticeDialogHost();
    host.setHtml("<p>Body</p>");
    host.open({ title: "Notice", resizable: false });
    host.close("dialog-node");

    expect(globalThis.alertMessage.innerHTML).toBe("<p>Body</p>");
    expect(dollar).toHaveBeenCalledWith("#alert");
    expect(dialog).toHaveBeenCalledWith({ title: "Notice", resizable: false });
    expect(close).toHaveBeenCalledWith("close");
  });
});

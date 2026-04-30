import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalNoticeService } from "./engine-notice-service";

const originalAlertMessage = globalThis.alertMessage;
const originalDollar = globalThis.$;
const originalParseError = globalThis.parseError;
const originalClearMainTip = globalThis.clearMainTip;
const originalCleanupData = globalThis.cleanupData;
const originalRegenerateMap = globalThis.regenerateMap;

function installNoticeGlobals() {
  const dialog = vi.fn();
  const close = vi.fn();
  const dollar = vi.fn((selectorOrThis: unknown) => {
    if (selectorOrThis === "#alert") return { dialog };
    return {
      dialog: close,
    };
  });

  globalThis.alertMessage = { innerHTML: "" } as HTMLElement;
  globalThis.$ = dollar as unknown as typeof $;
  globalThis.parseError = vi.fn(() => "Parsed failure");
  globalThis.clearMainTip = vi.fn();
  globalThis.cleanupData = vi.fn();
  globalThis.regenerateMap = vi.fn();

  return { dialog, close, dollar };
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

  it("opens a modal through the current alert dialog compatibility host", () => {
    const { dialog } = installNoticeGlobals();

    createGlobalNoticeService().showModal({
      title: "Notice",
      html: "<p>Body</p>",
      resizable: true,
      width: "28em",
      position: { my: "left" },
    });

    expect(globalThis.alertMessage.innerHTML).toBe("<p>Body</p>");
    expect(dialog).toHaveBeenCalledWith(
      expect.objectContaining({
        resizable: true,
        title: "Notice",
        width: "28em",
        position: { my: "left" },
      }),
    );
  });

  it("uses the default close button when no modal buttons are provided", () => {
    const { close, dialog } = installNoticeGlobals();

    createGlobalNoticeService().showModal({
      title: "Notice",
      html: "Body",
    });

    const options = dialog.mock.calls[0][0];
    options.buttons.Ok.call("dialog-node");

    expect(close).toHaveBeenCalledWith("close");
  });

  it("routes generation errors through cleanup, regenerate, and ignore dialog actions", () => {
    const { close, dialog } = installNoticeGlobals();
    const error = new Error("Boom");

    createGlobalNoticeService().showGenerationError(error);

    expect(globalThis.parseError).toHaveBeenCalledWith(error);
    expect(globalThis.clearMainTip).toHaveBeenCalledWith();
    expect(globalThis.alertMessage.innerHTML).toContain("Parsed failure");

    const options = dialog.mock.calls[0][0];
    expect(options).toMatchObject({
      resizable: false,
      title: "Generation error",
      width: "32em",
      position: { my: "center", at: "center", of: "svg" },
    });

    options.buttons["Cleanup data"]();
    options.buttons.Regenerate.call("dialog-node");
    options.buttons.Ignore.call("dialog-node");

    expect(globalThis.cleanupData).toHaveBeenCalledWith();
    expect(globalThis.regenerateMap).toHaveBeenCalledWith("generation error");
    expect(close).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledWith("close");
  });
});

type EngineNoticeButtons = Record<string, (this: unknown) => void>;

type EngineNoticeModal = {
  title: string;
  html: string;
  resizable?: boolean;
  width?: string;
  buttons?: EngineNoticeButtons;
  position?: unknown;
};

export type EngineNoticeDialogHost = {
  setHtml: (html: string) => void;
  open: (notice: Omit<EngineNoticeModal, "html">) => void;
  close: (dialog: unknown) => void;
};

export type EngineNoticeActionTargets = {
  parseError: (error: Error) => string;
  clearMainTip: () => void;
  cleanupData: () => void;
  regenerateMap: (reason: string) => void;
};

export type EngineNoticeService = {
  showModal: (notice: EngineNoticeModal) => void;
  showGenerationError: (error: unknown) => void;
};

export function createJQueryNoticeDialogHost(): EngineNoticeDialogHost {
  return {
    setHtml: (html) => {
      alertMessage.innerHTML = html;
    },
    open: (notice) => {
      $("#alert").dialog(notice);
    },
    close: (dialog) => {
      $(dialog).dialog("close");
    },
  };
}

export function createGlobalNoticeActionTargets(): EngineNoticeActionTargets {
  return {
    parseError: (error) => parseError(error),
    clearMainTip: () => clearMainTip(),
    cleanupData: () => cleanupData(),
    regenerateMap: (reason) => regenerateMap(reason),
  };
}

export function createEngineNoticeService(
  dialogHost: EngineNoticeDialogHost,
  actionTargets: EngineNoticeActionTargets = createGlobalNoticeActionTargets(),
): EngineNoticeService {
  return {
    showModal: ({
      title,
      html,
      resizable = false,
      width,
      buttons,
      position,
    }) => {
      dialogHost.setHtml(html);
      dialogHost.open({
        resizable,
        title,
        width,
        buttons: buttons ?? {
          Ok: function () {
            dialogHost.close(this);
          },
        },
        position,
      });
    },
    showGenerationError: (error) => {
      const parsedError = actionTargets.parseError(error as Error);
      actionTargets.clearMainTip();

      dialogHost.setHtml(/* html */ `An error has occurred on map generation. Please retry. <br />If error is critical, clear the stored data and try again.
      <p id="errorBox">${parsedError}</p>`);
      dialogHost.open({
        resizable: false,
        title: "Generation error",
        width: "32em",
        buttons: {
          "Cleanup data": () => actionTargets.cleanupData(),
          Regenerate: function () {
            actionTargets.regenerateMap("generation error");
            dialogHost.close(this);
          },
          Ignore: function () {
            dialogHost.close(this);
          },
        },
        position: { my: "center", at: "center", of: "svg" },
      });
    },
  };
}

export function createGlobalNoticeService(
  dialogHost: EngineNoticeDialogHost = createJQueryNoticeDialogHost(),
  actionTargets: EngineNoticeActionTargets = createGlobalNoticeActionTargets(),
): EngineNoticeService {
  return createEngineNoticeService(dialogHost, actionTargets);
}

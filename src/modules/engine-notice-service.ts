export type EngineNoticeService = {
  showModal: (notice: {
    title: string;
    html: string;
    resizable?: boolean;
    width?: string;
    buttons?: Record<string, () => void>;
    position?: unknown;
  }) => void;
  showGenerationError: (error: unknown) => void;
};

export function createGlobalNoticeService(): EngineNoticeService {
  return {
    showModal: ({
      title,
      html,
      resizable = false,
      width,
      buttons,
      position,
    }) => {
      alertMessage.innerHTML = html;
      $("#alert").dialog({
        resizable,
        title,
        width,
        buttons: buttons ?? {
          Ok: function () {
            $(this).dialog("close");
          },
        },
        position,
      });
    },
    showGenerationError: (error) => {
      const parsedError = parseError(error as Error);
      clearMainTip();

      alertMessage.innerHTML = /* html */ `An error has occurred on map generation. Please retry. <br />If error is critical, clear the stored data and try again.
      <p id="errorBox">${parsedError}</p>`;
      $("#alert").dialog({
        resizable: false,
        title: "Generation error",
        width: "32em",
        buttons: {
          "Cleanup data": () => cleanupData(),
          Regenerate: function () {
            regenerateMap("generation error");
            $(this).dialog("close");
          },
          Ignore: function () {
            $(this).dialog("close");
          },
        },
        position: { my: "center", at: "center", of: "svg" },
      });
    },
  };
}

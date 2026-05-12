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

declare global {
  var EngineNoticeService: EngineNoticeService;
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function getNoticeContainer(documentRef: Document) {
  const existing = documentRef.getElementById("dialogs");
  if (existing) return existing;

  const container = documentRef.createElement("div");
  container.id = "dialogs";
  documentRef.body?.appendChild(container);
  return container;
}

export function createBrowserNoticeDialogHost(): EngineNoticeDialogHost {
  let html = "";

  return {
    setHtml: (nextHtml) => {
      html = nextHtml;
      const documentRef = getDocument();
      if (!documentRef) return;

      const message = documentRef.getElementById("agmNoticeDialogMessage");
      if (message) message.innerHTML = html;
    },
    open: ({ title, buttons }) => {
      const documentRef = getDocument();
      if (!documentRef) return;

      const container = getNoticeContainer(documentRef);
      const dialog =
        documentRef.getElementById("agmNoticeDialog") ??
        documentRef.createElement("section");
      dialog.id = "agmNoticeDialog";
      dialog.dataset.agmEngineDialog = "notice";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.hidden = false;
      dialog.className = "studio-input-dialog";
      dialog.innerHTML = /* html */ `
        <div class="studio-input-dialog__scrim"></div>
        <div class="studio-input-dialog__panel">
          <div class="studio-input-dialog__label"></div>
          <div id="agmNoticeDialogMessage"></div>
          <div class="studio-input-dialog__actions"></div>
        </div>
      `;

      const titleNode = dialog.querySelector<HTMLElement>(
        ".studio-input-dialog__label",
      );
      if (titleNode) titleNode.textContent = title;

      const message = dialog.querySelector<HTMLElement>(
        "#agmNoticeDialogMessage",
      );
      if (message) message.innerHTML = html;

      const actions = dialog.querySelector<HTMLElement>(
        ".studio-input-dialog__actions",
      );
      if (actions) {
        actions.innerHTML = "";
        for (const [label, action] of Object.entries(buttons ?? {})) {
          const button = documentRef.createElement("button");
          button.type = "button";
          button.className = "studio-input-dialog__button";
          button.textContent = label;
          button.addEventListener("click", () => action.call(dialog));
          actions.appendChild(button);
        }
      }

      if (!dialog.parentElement) container.appendChild(dialog);
    },
    close: (dialog) => {
      if (typeof HTMLElement !== "undefined" && dialog instanceof HTMLElement) {
        dialog.hidden = true;
        return;
      }

      const documentRef = getDocument();
      const notice = documentRef?.getElementById("agmNoticeDialog");
      if (notice) notice.hidden = true;
    },
  };
}

export function createGlobalNoticeActionTargets(): EngineNoticeActionTargets {
  return {
    parseError: (error) =>
      globalThis.parseError?.(error) ?? error.stack ?? error.message,
    clearMainTip: () => globalThis.clearMainTip?.(),
    cleanupData: () => globalThis.cleanupData?.(),
    regenerateMap: (reason) => globalThis.regenerateMap?.(reason),
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
  dialogHost: EngineNoticeDialogHost = createBrowserNoticeDialogHost(),
  actionTargets: EngineNoticeActionTargets = createGlobalNoticeActionTargets(),
): EngineNoticeService {
  return createEngineNoticeService(dialogHost, actionTargets);
}

function getWindow(): (Window & typeof globalThis) | undefined {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow)
  runtimeWindow.EngineNoticeService = createGlobalNoticeService();

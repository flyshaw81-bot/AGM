type JsZipInstance = {
  file: (path: string, content: string | Blob) => void;
  generateAsync: (options: { type: "blob" }) => Promise<Blob>;
};

declare global {
  interface Window {
    JSZip?: new () => JsZipInstance;
  }
}

export type DraftDownloadLink =
  | HTMLAnchorElement
  | {
      href: string;
      download: string;
      click: () => void;
      remove: () => void;
    };

export type DraftFileIoTargets = {
  createObjectUrl: (blob: Blob) => string;
  revokeObjectUrl: (url: string) => void;
  createDownloadLink: () => DraftDownloadLink;
  appendToBody: (element: DraftDownloadLink) => void;
  getJsZip: () => Window["JSZip"];
  loadJsZipScript: () => Promise<void>;
};

export function createGlobalDraftFileIoTargets(): DraftFileIoTargets {
  return {
    createObjectUrl: (blob) => URL.createObjectURL(blob),
    revokeObjectUrl: (url) => URL.revokeObjectURL(url),
    createDownloadLink: () => document.createElement("a"),
    appendToBody: (element) =>
      document.body.appendChild(element as HTMLAnchorElement),
    getJsZip: () => window.JSZip,
    loadJsZipScript: () =>
      new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
          "script[data-agm-jszip]",
        );
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(), {
            once: true,
          });
          existingScript.addEventListener(
            "error",
            () => reject(new Error("JSZip failed to load")),
            { once: true },
          );
          return;
        }

        const script = document.createElement("script");
        script.dataset.agmJszip = "true";
        script.src = `${import.meta.env.BASE_URL}libs/jszip.min.js`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("JSZip failed to load"));
        document.head.appendChild(script);
      }),
  };
}

export function createSafeFilename(name: string, extension: string) {
  const safeName =
    name
      .trim()
      .replace(/[^\p{L}\p{N}._-]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "agm-world";
  return `${safeName}.${extension}`;
}

export function createSafeAgmFilename(name: string) {
  return createSafeFilename(name, "agm");
}

export function downloadBlobDraft(
  filename: string,
  blob: Blob,
  targets: DraftFileIoTargets = createGlobalDraftFileIoTargets(),
) {
  const url = targets.createObjectUrl(blob);
  const link = targets.createDownloadLink();
  link.href = url;
  link.download = filename;
  targets.appendToBody(link);
  link.click();
  link.remove();
  targets.revokeObjectUrl(url);
}

export function downloadJsonDraft(
  filename: string,
  draft: unknown,
  targets: DraftFileIoTargets = createGlobalDraftFileIoTargets(),
) {
  downloadBlobDraft(
    filename,
    new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }),
    targets,
  );
}

export async function loadJsZip(
  targets: DraftFileIoTargets = createGlobalDraftFileIoTargets(),
) {
  if (!targets.getJsZip()) await targets.loadJsZipScript();
  const JsZip = targets.getJsZip();
  if (!JsZip) throw new Error("JSZip is unavailable for Engine Package export");
  return JsZip;
}

export function stringifyPackageFile(value: unknown) {
  return JSON.stringify(value, null, 2);
}

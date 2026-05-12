import { ZipArchive } from "../../utils/zipArchive";

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
};

const createUnavailableDownloadLink = (): DraftDownloadLink => ({
  href: "",
  download: "",
  click: () => undefined,
  remove: () => undefined,
});

const getDocument = (): Document | undefined => {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
};

export function createGlobalDraftFileIoTargets(): DraftFileIoTargets {
  return {
    createObjectUrl: (blob) => URL.createObjectURL(blob),
    revokeObjectUrl: (url) => URL.revokeObjectURL(url),
    createDownloadLink: () => {
      try {
        return (
          getDocument()?.createElement("a") ?? createUnavailableDownloadLink()
        );
      } catch {
        return createUnavailableDownloadLink();
      }
    },
    appendToBody: (element) => {
      try {
        getDocument()?.body?.appendChild(element as HTMLAnchorElement);
      } catch {
        // Download fallback links may be detached in restricted runtimes.
      }
    },
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

/**
 * Returns the ZipArchive constructor for creating ZIP files.
 * This replaces the old JSZip lazy-loading mechanism.
 */
export function loadZipConstructor(): typeof ZipArchive {
  return ZipArchive;
}

export function stringifyPackageFile(value: unknown) {
  return JSON.stringify(value, null, 2);
}

type JsZipInstance = {
  file: (path: string, content: string | Blob) => void;
  generateAsync: (options: { type: "blob" }) => Promise<Blob>;
};

declare global {
  interface Window {
    JSZip?: new () => JsZipInstance;
  }
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

export function downloadBlobDraft(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadJsonDraft(filename: string, draft: unknown) {
  downloadBlobDraft(
    filename,
    new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }),
  );
}

export async function loadJsZip() {
  if (!window.JSZip) {
    await new Promise<void>((resolve, reject) => {
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
    });
  }
  if (!window.JSZip)
    throw new Error("JSZip is unavailable for Engine Package export");
  return window.JSZip;
}

export function stringifyPackageFile(value: unknown) {
  return JSON.stringify(value, null, 2);
}

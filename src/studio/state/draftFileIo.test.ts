import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalDraftFileIoTargets,
  createSafeAgmFilename,
  createSafeFilename,
  type DraftFileIoTargets,
  downloadBlobDraft,
  downloadJsonDraft,
  loadJsZip,
  stringifyPackageFile,
} from "./draftFileIo";

function createTargets(overrides: Partial<DraftFileIoTargets> = {}) {
  const link = {
    href: "",
    download: "",
    click: vi.fn(),
    remove: vi.fn(),
  };
  const targets: DraftFileIoTargets = {
    createObjectUrl: vi.fn(() => "blob:agm"),
    revokeObjectUrl: vi.fn(),
    createDownloadLink: vi.fn(() => link),
    appendToBody: vi.fn(),
    getJsZip: vi.fn(),
    loadJsZipScript: vi.fn(async () => undefined),
    ...overrides,
  };

  return { link, targets };
}

describe("draft file IO helpers", () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  it("creates stable export filenames from user document names", () => {
    expect(createSafeFilename("Northwatch Campaign", "agm-world.json")).toBe(
      "Northwatch-Campaign.agm-world.json",
    );
    expect(createSafeFilename("  A/B:C*D?  ", "json")).toBe("A-B-C-D.json");
    expect(createSafeAgmFilename("Project.01")).toBe("Project.01.agm");
  });

  it("falls back to a useful filename for blank or unsafe names", () => {
    expect(createSafeFilename("", "json")).toBe("agm-world.json");
    expect(createSafeFilename("///", "agm")).toBe("agm-world.agm");
  });

  it("serializes package files with deterministic JSON formatting", () => {
    expect(stringifyPackageFile({ name: "Arvia", seed: 42 })).toBe(
      '{\n  "name": "Arvia",\n  "seed": 42\n}',
    );
  });

  it("downloads blobs through injected browser file targets", () => {
    const blob = new Blob(["agm"]);
    const { link, targets } = createTargets();

    downloadBlobDraft("world.agm", blob, targets);

    expect(targets.createObjectUrl).toHaveBeenCalledWith(blob);
    expect(link.href).toBe("blob:agm");
    expect(link.download).toBe("world.agm");
    expect(targets.appendToBody).toHaveBeenCalledWith(link);
    expect(link.click).toHaveBeenCalledWith();
    expect(link.remove).toHaveBeenCalledWith();
    expect(targets.revokeObjectUrl).toHaveBeenCalledWith("blob:agm");
  });

  it("downloads JSON through the same injected blob targets", () => {
    const { targets } = createTargets();

    downloadJsonDraft("world.json", { name: "Northwatch" }, targets);

    expect(targets.createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(targets.revokeObjectUrl).toHaveBeenCalledWith("blob:agm");
  });

  it("loads JSZip through injected script targets when absent", async () => {
    class FakeZip {
      file() {}
      async generateAsync() {
        return new Blob(["zip"]);
      }
    }
    const getJsZip = vi
      .fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(FakeZip);
    const loadJsZipScript = vi.fn(async () => undefined);
    const { targets } = createTargets({ getJsZip, loadJsZipScript });

    await expect(loadJsZip(targets)).resolves.toBe(FakeZip);
    expect(loadJsZipScript).toHaveBeenCalledWith();
  });

  it("returns existing JSZip without loading the browser script", async () => {
    class FakeZip {
      file() {}
      async generateAsync() {
        return new Blob(["zip"]);
      }
    }
    const { targets } = createTargets({
      getJsZip: vi.fn(() => FakeZip),
      loadJsZipScript: vi.fn(async () => undefined),
    });

    await expect(loadJsZip(targets)).resolves.toBe(FakeZip);
    expect(targets.loadJsZipScript).not.toHaveBeenCalled();
  });

  it("keeps global file targets safe when document and window access throw", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    const targets = createGlobalDraftFileIoTargets();

    const link = targets.createDownloadLink();
    expect(() => targets.appendToBody(link)).not.toThrow();
    expect(targets.getJsZip()).toBeUndefined();
    await expect(targets.loadJsZipScript()).resolves.toBeUndefined();
  });

  it("keeps global download targets safe when element creation and append throw", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createElement: () => {
          throw new Error("element blocked");
        },
        body: {
          appendChild: () => {
            throw new Error("append blocked");
          },
        },
      },
      writable: true,
    });
    const targets = createGlobalDraftFileIoTargets();

    const link = targets.createDownloadLink();
    expect(link.href).toBe("");
    expect(() => targets.appendToBody(link)).not.toThrow();
  });

  it("reports JSZip script load failure when script DOM access is blocked", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector: () => {
          throw new Error("query blocked");
        },
      },
      writable: true,
    });
    const targets = createGlobalDraftFileIoTargets();

    await expect(targets.loadJsZipScript()).rejects.toThrow(
      "JSZip failed to load",
    );
  });
});

import { describe, expect, it, vi } from "vitest";
import {
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
});

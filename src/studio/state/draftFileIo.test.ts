import { describe, expect, it } from "vitest";
import {
  createSafeAgmFilename,
  createSafeFilename,
  stringifyPackageFile,
} from "./draftFileIo";

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
});

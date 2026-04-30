import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  AGM_DRAFT_STORAGE_KEY,
  exportAgmDocumentDraft,
  exportHeightmapRaw16Draft,
  saveAgmDocumentDraft,
  type WorldDocumentDraftTargets,
} from "./worldDocumentDraft";
import type { AgmDocumentDraft } from "./worldDocumentDraftBuilders";

function createDraft(): AgmDocumentDraft {
  return {
    schema: "agm.document.v0",
    document: {
      name: "Northwatch",
      gameProfile: "balanced",
      designIntent: "",
    },
    world: {
      package: {
        schema: "agm.world-package.v0",
        manifest: {
          id: "northwatch",
          name: "Northwatch",
          profile: "balanced",
          profileLabel: "Balanced",
        },
        map: {
          seed: "42",
          width: 1000,
          height: 800,
          style: "default",
          heightmap: "volcano",
        },
        maps: {
          resourceMap: {
            schema: "agm.resource-map.v0",
            tiles: [],
          },
          provinceMap: {
            schema: "agm.province-map.v0",
            tiles: [],
          },
          biomeMap: {
            schema: "agm.biome-map.v0",
            biomes: [],
          },
        },
      },
      rules: {
        profileRules: {
          profile: "balanced",
        },
      },
    },
  } as unknown as AgmDocumentDraft;
}

function createTargets(draft: AgmDocumentDraft): WorldDocumentDraftTargets {
  return {
    createDraft: vi.fn(() => draft),
    setStorageItem: vi.fn(),
    downloadJson: vi.fn(),
    downloadBlob: vi.fn(),
    createPngBlob: vi.fn(async () => new Blob(["png"])),
    createRaw16Blob: vi.fn(() => new Blob(["raw"])),
    exportEnginePackage: vi.fn(async () => ({
      filename: "Northwatch.agm-engine-package.zip",
      manifest: {},
      heightfield: {},
    })),
  } as unknown as WorldDocumentDraftTargets;
}

describe("worldDocumentDraft", () => {
  it("saves AGM drafts through injected storage targets", () => {
    const draft = createDraft();
    const targets = createTargets(draft);

    expect(
      saveAgmDocumentDraft(
        {} as StudioState,
        {} as EngineProjectSummary,
        targets,
      ),
    ).toBe(draft);
    expect(targets.setStorageItem).toHaveBeenCalledWith(
      AGM_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
  });

  it("exports AGM drafts through injected JSON download targets", () => {
    const draft = createDraft();
    const targets = createTargets(draft);

    expect(
      exportAgmDocumentDraft(
        {} as StudioState,
        {} as EngineProjectSummary,
        targets,
      ),
    ).toBe(draft);
    expect(targets.downloadJson).toHaveBeenCalledWith("Northwatch.agm", draft);
  });

  it("exports heightmap RAW16 through injected blob targets", () => {
    const draft = createDraft();
    const targets = createTargets(draft);

    const result = exportHeightmapRaw16Draft(
      {} as StudioState,
      {} as EngineProjectSummary,
      targets,
    );

    expect(result.filename).toBe("Northwatch.agm-heightmap-r16.raw");
    expect(targets.createRaw16Blob).toHaveBeenCalledWith(result.heightfield);
    expect(targets.downloadBlob).toHaveBeenCalledWith(
      result.filename,
      expect.any(Blob),
    );
  });
});

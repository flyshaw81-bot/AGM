import { describe, expect, it, vi } from "vitest";
import type { WorldDocumentDraft } from "./worldDocumentDraft";
import {
  createGlobalEnginePackageBundleTargets,
  type EnginePackageZipInstance,
  exportEnginePackageBundle,
} from "./worldDocumentEnginePackageDraft";
import type { HeightmapPngExportTargets } from "./worldDocumentMapExports";

function createPackageDraft(): WorldDocumentDraft["package"] {
  return {
    schema: "agm.world-package.v0",
    manifest: {
      id: "northwatch",
      name: "Northwatch",
      profile: "balanced",
      profileLabel: "Balanced",
      sourceSchema: "agm.document.v0",
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
        profile: "balanced",
        profileLabel: "Balanced",
        sourceRules: [],
        legend: [],
        tiles: [],
        coverageSummary: {
          tileCount: 0,
          starterTiles: 0,
          challengeTiles: 0,
          neutralTiles: 0,
          averageCoverageScore: 0,
        },
      },
      provinceMap: {
        schema: "agm.province-map.v0",
        profile: "balanced",
        profileLabel: "Balanced",
        sourceRules: [],
        tiles: [],
        structureSummary: {
          tileCount: 0,
          settlementAnchoredTiles: 0,
          primaryConnectorTiles: 0,
          secondaryConnectorTiles: 0,
          resourceFrontierTiles: 0,
          averageStructureScore: 0,
        },
      },
      biomeMap: {
        schema: "agm.biome-map.v0",
        profile: "balanced",
        profileLabel: "Balanced",
        sourceRules: [],
        legend: [],
        biomes: [],
        habitabilitySummary: {
          biomeCount: 0,
          lowFrictionBiomes: 0,
          balancedFrictionBiomes: 0,
          highFrictionBiomes: 0,
          averageAdjustedHabitability: 0,
        },
      },
    },
  } as unknown as WorldDocumentDraft["package"];
}

describe("exportEnginePackageBundle", () => {
  it("writes package files through injected zip and download targets", async () => {
    const files: { path: string; content: string | Blob }[] = [];
    const zipBlob = new Blob(["zip"]);
    class FakeZip implements EnginePackageZipInstance {
      file(path: string, content: string | Blob) {
        files.push({ path, content });
      }

      async generateAsync() {
        return zipBlob;
      }
    }
    const downloadBlob = vi.fn();

    const result = await exportEnginePackageBundle(
      "Northwatch Project",
      createPackageDraft(),
      {
        loadZip: vi.fn(async () => FakeZip),
        downloadBlob,
        createPngBlob: vi.fn(async () => new Blob(["png"])),
        createRaw16Blob: vi.fn(() => new Blob(["raw"])),
      },
    );

    expect(result.filename).toBe("Northwatch-Project.agm-engine-package.zip");
    expect(downloadBlob).toHaveBeenCalledWith(result.filename, zipBlob);
    expect(files.map((file) => file.path)).toEqual(
      expect.arrayContaining([
        "manifest/northwatch.agm-engine-manifest.json",
        "maps/northwatch.agm-world.json",
        "terrain/northwatch.agm-heightmap.png",
        "terrain/northwatch.agm-heightmap-r16.raw",
        "handoff/README.md",
      ]),
    );
  });

  it("composes global package targets from injected file IO targets", async () => {
    const link = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn(),
    };
    const fileIoTargets = {
      createObjectUrl: vi.fn(() => "blob:agm"),
      revokeObjectUrl: vi.fn(),
      createDownloadLink: vi.fn(() => link),
      appendToBody: vi.fn(),
    };

    const targets = createGlobalEnginePackageBundleTargets({ fileIoTargets });

    const ZipCtor = await targets.loadZip();
    expect(ZipCtor).toBeDefined();
    targets.downloadBlob("package.zip", new Blob(["zip"]));

    expect(fileIoTargets.createObjectUrl).toHaveBeenCalledWith(
      expect.any(Blob),
    );
    expect(fileIoTargets.revokeObjectUrl).toHaveBeenCalledWith("blob:agm");
  });

  it("composes global package targets from injected PNG canvas targets", async () => {
    const heightmapPngTargets: HeightmapPngExportTargets = {
      createCanvas: vi.fn(() => {
        const imageData = { data: new Uint8ClampedArray(4) } as ImageData;
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({
            createImageData: vi.fn(() => imageData),
            putImageData: vi.fn(),
          })),
          toBlob: vi.fn((callback: BlobCallback) =>
            callback(new Blob(["png"], { type: "image/png" })),
          ),
        } as unknown as ReturnType<HeightmapPngExportTargets["createCanvas"]>;
      }),
    };
    const targets = createGlobalEnginePackageBundleTargets({
      heightmapPngTargets,
    });

    await expect(
      targets.createPngBlob({
        grid: { width: 1, height: 1 },
        values: [50],
      } as Parameters<typeof targets.createPngBlob>[0]),
    ).resolves.toBeInstanceOf(Blob);

    expect(heightmapPngTargets.createCanvas).toHaveBeenCalledWith();
  });
});

import { describe, expect, it, vi } from "vitest";
import {
  createHeightmapPngBlob,
  createHeightmapRaw16Blob,
  type HeightmapPngCanvas,
} from "./worldDocumentHeightmapExports";

function createHeightfield() {
  return {
    schema: "agm.heightfield.v0",
    manifest: {
      id: "northwatch",
      name: "Northwatch",
      profile: "strategy",
      profileLabel: "Strategy",
    },
    map: {
      width: 1000,
      height: 800,
      style: "default",
      seed: "42",
      heightmapTemplate: "volcano",
    },
    grid: {
      width: 2,
      height: 1,
      coordinateSystem: "agm-layer-grid",
      sampleSpacing: 1,
    },
    normalization: {
      min: 0,
      max: 100,
      valueType: "normalized-height",
      units: "designer-scale",
    },
    source: {
      type: "reconstructable-layer-derived",
      baseTemplate: "volcano",
      sourceMaps: {
        resourceMap: "agm.resource-map.v0",
        provinceMap: "agm.province-map.v0",
        biomeMap: "agm.biome-map.v0",
      },
    },
    values: [0, 100],
  };
}

describe("worldDocumentHeightmapExports", () => {
  it("creates PNG blobs through injected canvas targets", async () => {
    const imageData = {
      data: new Uint8ClampedArray(8),
    } as ImageData;
    const context = {
      createImageData: vi.fn(() => imageData),
      putImageData: vi.fn(),
    };
    const blob = new Blob(["png"], { type: "image/png" });
    const canvas: HeightmapPngCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context as unknown as CanvasRenderingContext2D),
      toBlob: vi.fn((callback: BlobCallback) => callback(blob)),
    };
    const targets = {
      createCanvas: vi.fn(() => canvas),
    };

    await expect(
      createHeightmapPngBlob(createHeightfield(), targets),
    ).resolves.toBe(blob);

    expect(targets.createCanvas).toHaveBeenCalledWith();
    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(1);
    expect(context.createImageData).toHaveBeenCalledWith(2, 1);
    expect(Array.from(imageData.data)).toEqual([
      0, 0, 0, 255, 255, 255, 255, 255,
    ]);
    expect(context.putImageData).toHaveBeenCalledWith(imageData, 0, 0);
  });

  it("creates RAW16 blobs from normalized height values", async () => {
    const blob = createHeightmapRaw16Blob(createHeightfield());
    const view = new DataView(await blob.arrayBuffer());

    expect(blob.type).toBe("application/octet-stream");
    expect(view.getUint16(0, true)).toBe(0);
    expect(view.getUint16(2, true)).toBe(65535);
  });
});

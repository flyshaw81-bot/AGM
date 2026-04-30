import { describe, expect, it } from "vitest";
import {
  type HeightmapImageTargets,
  HeightmapModule,
} from "./heightmap-generator";

function createGraph() {
  return {
    cellsDesired: 4,
    cells: {
      h: new Uint8Array([1, 2, 3, 4]),
    },
    points: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  };
}

function createPrecreatedGraph() {
  return {
    cellsDesired: 4,
    cellsX: 2,
    cellsY: 2,
    cells: {
      h: new Uint8Array([0, 0, 0, 0]),
    },
    points: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  };
}

function createImageTargets(data: Uint8ClampedArray): HeightmapImageTargets {
  return {
    createCanvas: () =>
      ({
        width: 0,
        height: 0,
        getContext: () => ({
          drawImage: () => {},
          getImageData: () => ({ data }),
        }),
        remove: () => {},
      }) as unknown as HTMLCanvasElement,
    createImage: () => {
      const image = {
        onload: null as (() => void) | null,
        remove: () => {},
      };
      return Object.defineProperty(image, "src", {
        set: () => setTimeout(() => image.onload?.(), 0),
      }) as unknown as HTMLImageElement;
    },
  };
}

describe("HeightmapModule", () => {
  it("can initialize heights without browser globals", () => {
    const heightmap = new HeightmapModule();

    heightmap.setGraph(createGraph());

    expect(heightmap.getHeights()).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("loads precreated heightmaps through injected image targets", async () => {
    const heightmap = new HeightmapModule(
      createImageTargets(
        new Uint8ClampedArray([
          0, 0, 0, 255, 64, 64, 64, 255, 128, 128, 128, 255, 255, 255, 255, 255,
        ]),
      ),
    );

    const heights = await heightmap.fromPrecreated(
      createPrecreatedGraph(),
      "x",
    );

    expect(heights).toEqual(new Uint8Array([0, 29, 58, 100]));
  });
});

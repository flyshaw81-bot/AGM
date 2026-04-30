import { describe, expect, it } from "vitest";
import { HeightmapModule } from "./heightmap-generator";

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

describe("HeightmapModule", () => {
  it("can initialize heights without browser globals", () => {
    const heightmap = new HeightmapModule();

    heightmap.setGraph(createGraph());

    expect(heightmap.getHeights()).toEqual(new Uint8Array([1, 2, 3, 4]));
  });
});

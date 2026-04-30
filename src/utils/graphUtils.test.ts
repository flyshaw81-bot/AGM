import { describe, expect, it, vi } from "vitest";
import { type DrawHeightsTargets, drawHeights } from "./graphUtils";

describe("drawHeights", () => {
  it("renders height data through injected canvas targets", () => {
    const imageData = {
      data: new Uint8ClampedArray(8),
    } as ImageData;
    const createImageData = vi.fn(() => imageData);
    const putImageData = vi.fn();
    const toDataURL = vi.fn(() => "data:image/png;base64,preview");
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        createImageData,
        putImageData,
      })),
      toDataURL,
    };
    const targets: DrawHeightsTargets = {
      createCanvas: vi.fn((width, height) => {
        canvas.width = width;
        canvas.height = height;
        return canvas;
      }),
    };

    const result = drawHeights({
      heights: [10, 100],
      width: 2,
      height: 1,
      scheme: (value) => (value === 1 ? "#000000" : "#ffffff"),
      renderOcean: false,
      targets,
    });

    expect(targets.createCanvas).toHaveBeenCalledWith(2, 1);
    expect(createImageData).toHaveBeenCalledWith(2, 1);
    expect(putImageData).toHaveBeenCalledWith(imageData, 0, 0);
    expect(toDataURL).toHaveBeenCalledWith("image/png");
    expect(Array.from(imageData.data)).toEqual([
      0, 0, 0, 255, 255, 255, 255, 255,
    ]);
    expect(result).toBe("data:image/png;base64,preview");
  });
});

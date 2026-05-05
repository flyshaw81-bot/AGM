import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalDrawHeightsTargets,
  type DrawHeightsTargets,
  drawHeights,
} from "./graphUtils";

describe("drawHeights", () => {
  const originalDocument = globalThis.document;

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
  });

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

  it("keeps global draw heights targets safe when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    expect(() =>
      drawHeights({
        heights: [10],
        width: 1,
        height: 1,
        scheme: () => "#000000",
        renderOcean: false,
        targets: createGlobalDrawHeightsTargets(),
      }),
    ).toThrow("Cannot draw heights without a 2D canvas context");
  });
});

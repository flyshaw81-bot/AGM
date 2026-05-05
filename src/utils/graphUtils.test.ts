import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalDrawHeightsTargets,
  createGlobalGridPointSettingsTargets,
  type DrawHeightsTargets,
  drawHeights,
  generateGrid,
  shouldRegenerateGrid,
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

  it("keeps global draw heights targets safe when canvas creation throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createElement: () => {
          throw new Error("canvas creation blocked");
        },
      },
      writable: true,
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

describe("grid point settings", () => {
  const originalDocument = globalThis.document;
  const originalTime = globalThis.TIME;

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    globalThis.TIME = originalTime;
  });

  it("reads desired cells through injected grid targets", () => {
    globalThis.TIME = false;
    const targets = {
      getCellsDesired: vi.fn(() => 4),
    };

    const grid = generateGrid("agm-seed", 20, 20, targets);

    expect(targets.getCellsDesired).toHaveBeenCalledTimes(1);
    expect(grid.cellsDesired).toBe(4);
    expect(grid.spacing).toBe(10);
    expect(grid.cellsX).toBe(2);
    expect(grid.cellsY).toBe(2);
  });

  it("checks regeneration through injected grid targets", () => {
    const targets = {
      getCellsDesired: vi.fn(() => 4),
    };

    expect(
      shouldRegenerateGrid(
        {
          seed: "agm-seed",
          cellsDesired: 4,
          spacing: 10,
          cellsX: 2,
          cellsY: 2,
        },
        0,
        20,
        20,
        targets,
      ),
    ).toBe(false);
    expect(targets.getCellsDesired).toHaveBeenCalledTimes(1);
  });

  it("keeps global point settings safe when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    expect(createGlobalGridPointSettingsTargets().getCellsDesired()).toBe(0);
  });
});

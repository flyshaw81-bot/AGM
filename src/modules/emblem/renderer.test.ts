import { afterEach, describe, expect, it, vi } from "vitest";
import EmblemRenderModule, {
  createGlobalEmblemRendererTargets,
  type EmblemRendererTargets,
} from "./renderer";

function createTargets(
  overrides: Partial<EmblemRendererTargets> = {},
): EmblemRendererTargets {
  return {
    fetchText: vi.fn().mockResolvedValue("<svg><g><path /></g></svg>"),
    parseChargeGroup: vi.fn((_svg, id) => `<g id="${id}"><path /></g>`),
    insertCoaSvg: vi.fn(),
    getElementById: vi.fn(() => null),
    hasRenderedUses: vi.fn(() => false),
    isLayerOn: vi.fn(() => false),
    ...overrides,
  };
}

describe("EmblemRenderModule", () => {
  const originalDocument = globalThis.document;
  const originalEmblems = globalThis.emblems;
  const originalLayerIsOn = globalThis.layerIsOn;
  const originalFetch = globalThis.fetch;
  const originalError = globalThis.ERROR;

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: originalFetch,
      writable: true,
    });
    Object.defineProperty(globalThis, "emblems", {
      configurable: true,
      value: originalEmblems,
      writable: true,
    });
    Object.defineProperty(globalThis, "layerIsOn", {
      configurable: true,
      value: originalLayerIsOn,
      writable: true,
    });
    Object.defineProperty(globalThis, "ERROR", {
      configurable: true,
      value: originalError,
      writable: true,
    });
  });

  it("adds rendered use nodes through injected renderer targets", async () => {
    const insertAdjacentHTML = vi.fn();
    const getAttribute = vi.fn(() => "40");
    const targets = createTargets({
      getElementById: vi.fn(
        () =>
          ({
            getAttribute,
            insertAdjacentHTML,
          }) as unknown as HTMLElement,
      ),
      hasRenderedUses: vi.fn(() => true),
    });

    await new EmblemRenderModule(targets).add(
      "burg",
      7,
      { shield: "heater", t1: "gules" },
      50,
      60,
    );

    expect(targets.getElementById).toHaveBeenCalledWith("burgEmblems");
    expect(insertAdjacentHTML).toHaveBeenCalledWith(
      "beforeend",
      '<use data-i="7" x="30" y="40" width="1em" height="1em" href="#burgCOA7"/>',
    );
  });

  it("does not render existing emblems again", async () => {
    const targets = createTargets({
      getElementById: vi.fn(
        () =>
          ({
            id: "burgCOA7",
          }) as unknown as HTMLElement,
      ),
    });

    await new EmblemRenderModule(targets).trigger("burgCOA7", {
      shield: "heater",
      t1: "gules",
    });

    expect(targets.insertCoaSvg).not.toHaveBeenCalled();
  });

  it("draws missing emblems through injected fetch and insert targets", async () => {
    const targets = createTargets();

    await new EmblemRenderModule(targets).trigger("burgCOA7", {
      shield: "heater",
      t1: "gules",
      charges: [
        {
          stroke: "none",
          charge: "lion",
          t: "argent",
          p: [5],
        },
      ],
    });

    expect(targets.fetchText).toHaveBeenCalledWith("./charges/lion.svg");
    expect(targets.parseChargeGroup).toHaveBeenCalledWith(
      "<svg><g><path /></g></svg>",
      "lion_burgCOA7",
    );
    expect(targets.insertCoaSvg).toHaveBeenCalledWith(
      expect.stringContaining('id="burgCOA7"'),
    );
  });

  it("keeps global renderer targets safe when DOM and layer globals are absent", () => {
    globalThis.document = undefined as unknown as Document;
    globalThis.emblems = undefined as unknown as typeof emblems;
    globalThis.layerIsOn = undefined as unknown as typeof layerIsOn;
    const targets = createGlobalEmblemRendererTargets();

    expect(targets.parseChargeGroup("<svg><g /></svg>", "lion")).toBe(
      '<g id="lion"></g>',
    );
    expect(() => targets.insertCoaSvg("<svg />")).not.toThrow();
    expect(targets.getElementById("coas")).toBeNull();
    expect(targets.hasRenderedUses()).toBe(false);
    expect(targets.isLayerOn("toggleEmblems")).toBe(false);
  });

  it("keeps global renderer targets safe when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    const targets = createGlobalEmblemRendererTargets();

    expect(targets.parseChargeGroup("<svg><g /></svg>", "lion")).toBe(
      '<g id="lion"></g>',
    );
    expect(() => targets.insertCoaSvg("<svg />")).not.toThrow();
    expect(targets.getElementById("coas")).toBeNull();
  });

  it("keeps global renderer targets safe when optional global access throws", async () => {
    for (const name of ["fetch", "emblems", "layerIsOn", "ERROR"] as const) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        get: () => {
          throw new Error(`${name} blocked`);
        },
      });
    }

    const targets = createGlobalEmblemRendererTargets();

    await expect(targets.fetchText("./charges/lion.svg")).rejects.toThrow(
      "fetch is not available",
    );
    expect(targets.hasRenderedUses()).toBe(false);
    expect(targets.isLayerOn("toggleEmblems")).toBe(false);
    await expect(
      new EmblemRenderModule(targets).trigger("burgCOA7", {
        shield: "heater",
        t1: "gules",
        charges: [
          {
            stroke: "none",
            charge: "lion",
            t: "argent",
            p: [5],
          },
        ],
      }),
    ).resolves.toBe(true);
  });
});

import { describe, expect, it, vi } from "vitest";
import EmblemRenderModule, { type EmblemRendererTargets } from "./renderer";

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
});

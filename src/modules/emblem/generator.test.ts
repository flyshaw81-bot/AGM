import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type EmblemGeneratorModuleType from "./generator";
import type { EmblemShapeTargets } from "./generator";

const originalPack = globalThis.pack;
let EmblemGeneratorModule: typeof EmblemGeneratorModuleType;

function createEmblemGenerator(targets: EmblemShapeTargets) {
  return new EmblemGeneratorModule(targets);
}

function setPack() {
  globalThis.pack = {
    states: [{ i: 0 }, { i: 1, coa: { shield: "state-heater" } }],
    cultures: [{ i: 0 }, { i: 1, shield: "culture-round" }],
  } as typeof pack;
}

describe("EmblemGeneratorModule", () => {
  beforeAll(async () => {
    EmblemGeneratorModule = (await import("./generator")).default;
  });

  afterEach(() => {
    globalThis.pack = originalPack;
  });

  it("uses an injected fixed shield shape without reading document", () => {
    const generator = createEmblemGenerator({
      getSelectedShape: () => ({ value: "kite", group: "Medieval" }),
    });

    expect(generator.getShield(1, 1)).toBe("kite");
  });

  it("uses state shield fallback through injected shape selection", () => {
    setPack();
    const generator = createEmblemGenerator({
      getSelectedShape: () => ({ value: "state", group: "Diversiform" }),
    });

    expect(generator.getShield(1, 1)).toBe("state-heater");
  });

  it("uses culture shield when diversiform selection is not state-specific", () => {
    setPack();
    const generator = createEmblemGenerator({
      getSelectedShape: () => ({ value: "culture", group: "Diversiform" }),
    });

    expect(generator.getShield(1, 1)).toBe("culture-round");
  });
});

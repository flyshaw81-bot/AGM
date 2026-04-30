import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type EmblemGeneratorModuleType from "./generator";
import type { EmblemShapeTargets } from "./generator";

const originalPack = globalThis.pack;
const originalWindow = globalThis.window;
const originalNode = globalThis.Node;
const originalDocument = globalThis.document;
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
    globalThis.window = globalThis as Window & typeof globalThis;
    globalThis.Node = class {
      addEventListener() {}
    } as unknown as typeof Node;
    globalThis.document = {
      readyState: "loading",
      addEventListener: () => {},
    } as unknown as Document;
    EmblemGeneratorModule = (await import("./generator")).default;
  });

  afterEach(() => {
    globalThis.pack = originalPack;
  });

  afterAll(() => {
    globalThis.window = originalWindow;
    globalThis.Node = originalNode;
    globalThis.document = originalDocument;
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

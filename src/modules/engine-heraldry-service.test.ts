import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalHeraldryService } from "./engine-heraldry-service";

const originalCoa = globalThis.COA;
const originalMathRandom = Math.random;

describe("createGlobalHeraldryService", () => {
  afterEach(() => {
    globalThis.COA = originalCoa;
    Math.random = originalMathRandom;
  });

  it("forwards heraldry generation and shield lookup to the current COA service", () => {
    const coa = { shield: "heater" };
    const shield = "round";
    globalThis.COA = {
      generate: vi.fn(() => coa),
      getShield: vi.fn(() => shield),
      shields: { types: { heater: 1 }, heater: { heater: 1 } },
    } as unknown as typeof COA;

    const heraldry = createGlobalHeraldryService();

    expect(heraldry.generate("parent", 0.5, "dominion", "Naval")).toBe(coa);
    expect(heraldry.getShield(3, 4)).toBe(shield);

    expect(COA.generate).toHaveBeenCalledWith(
      "parent",
      0.5,
      "dominion",
      "Naval",
    );
    expect(COA.getShield).toHaveBeenCalledWith(3, 4);
  });

  it("selects a random shield through current COA shield weights", () => {
    Math.random = vi.fn(() => 0);
    globalThis.COA = {
      generate: vi.fn(),
      getShield: vi.fn(),
      shields: {
        types: { heater: 1 },
        heater: { pointed: 1 },
      },
    } as unknown as typeof COA;

    expect(createGlobalHeraldryService().getRandomShield()).toBe("pointed");
  });
});

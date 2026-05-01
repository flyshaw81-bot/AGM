import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineHeraldryService,
  createGlobalHeraldryService,
} from "./engine-heraldry-service";

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

  it("composes heraldry service from injected runtime targets", () => {
    const coa = { shield: "heater" };
    const heraldryModule = {
      generate: vi.fn(() => coa),
      getShield: vi.fn(() => "round"),
      shields: {
        types: { heater: 1 },
        heater: { pointed: 1 },
      },
    };
    const pickWeighted = vi
      .fn()
      .mockReturnValueOnce("heater")
      .mockReturnValueOnce("pointed");
    const heraldry = createEngineHeraldryService({
      getHeraldryModule: () => heraldryModule,
      pickWeighted,
    });

    expect(heraldry.generate("parent", null, "dominion")).toBe(coa);
    expect(heraldry.getShield(1, 2)).toBe("round");
    expect(heraldry.getRandomShield()).toBe("pointed");

    expect(heraldryModule.generate).toHaveBeenCalledWith(
      "parent",
      null,
      "dominion",
      undefined,
    );
    expect(heraldryModule.getShield).toHaveBeenCalledWith(1, 2);
    expect(pickWeighted).toHaveBeenCalledWith({ heater: 1 });
    expect(pickWeighted).toHaveBeenCalledWith({ pointed: 1 });
  });

  it("uses stable fallbacks when the heraldry module is not mounted", () => {
    globalThis.COA = undefined as unknown as typeof COA;

    const heraldry = createGlobalHeraldryService();

    expect(heraldry.generate("parent", null, "dominion")).toEqual({});
    expect(heraldry.getShield(1, 2)).toBe("heater");
    expect(heraldry.getRandomShield()).toBe("heater");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalBiomeWritebackTargets } from "./engineAutoFixBiomeTargets";

const originalBiomesData = globalThis.biomesData;
const originalDrawBiomes = (globalThis as any).drawBiomes;

describe("createGlobalBiomeWritebackTargets", () => {
  afterEach(() => {
    globalThis.biomesData = originalBiomesData;
    (globalThis as any).drawBiomes = originalDrawBiomes;
  });

  it("resolves writable biome data only when habitability exists", () => {
    const biomeData = {
      habitability: { 1: 20 },
    };
    globalThis.biomesData = biomeData as unknown as typeof biomesData;

    expect(createGlobalBiomeWritebackTargets().getWritableBiomeData()).toBe(
      biomeData,
    );

    globalThis.biomesData = {} as unknown as typeof biomesData;
    expect(
      createGlobalBiomeWritebackTargets().getWritableBiomeData(),
    ).toBeUndefined();
  });

  it("redraws biomes through the current render helper when available", () => {
    const drawBiomes = vi.fn();
    (globalThis as any).drawBiomes = drawBiomes;

    createGlobalBiomeWritebackTargets().redrawBiomes();

    expect(drawBiomes).toHaveBeenCalledWith();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalBurgService } from "./engine-burg-service";

const originalBurgs = globalThis.Burgs;
const originalPack = globalThis.pack;

describe("createGlobalBurgService", () => {
  afterEach(() => {
    globalThis.Burgs = originalBurgs;
    globalThis.pack = originalPack;
  });

  it("forwards burg commands to the current AGM Burgs module mount", () => {
    const burg = { i: 3, name: "Northford" };
    globalThis.Burgs = {
      add: vi.fn(() => 3),
      remove: vi.fn(),
    } as unknown as typeof Burgs;
    globalThis.pack = {
      burgs: [undefined, undefined, undefined, burg],
    } as unknown as typeof pack;

    const burgs = createGlobalBurgService();

    expect(burgs.add([10, 20])).toBe(3);
    burgs.remove(3);
    expect(burgs.findById(3)).toBe(burg);
    expect(burgs.findById(99)).toBeUndefined();

    expect(Burgs.add).toHaveBeenCalledWith([10, 20]);
    expect(Burgs.remove).toHaveBeenCalledWith(3);
  });

  it("keeps command calls safe when the burg module is not mounted", () => {
    globalThis.Burgs = undefined as unknown as typeof Burgs;
    globalThis.pack = undefined as unknown as typeof pack;

    const burgs = createGlobalBurgService();

    expect(burgs.add([10, 20])).toBeNull();
    expect(() => burgs.remove(3)).not.toThrow();
    expect(burgs.findById(3)).toBeUndefined();
  });
});

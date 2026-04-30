import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineBurgService,
  createGlobalBurgService,
  createRuntimeBurgService,
} from "./engine-burg-service";
import type { EngineRuntimeContext } from "./engine-runtime-context";

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

  it("composes burg service from injected runtime targets", () => {
    const burg = { i: 2, name: "Southport" };
    const burgModule = {
      add: vi.fn(() => 2),
      remove: vi.fn(),
    };
    const burgs = createEngineBurgService({
      getBurgModule: () => burgModule,
      getBurgs: () => [undefined, undefined, burg] as any,
    });

    expect(burgs.add([30, 40])).toBe(2);
    burgs.remove(2);
    expect(burgs.findById(2)).toBe(burg);

    expect(burgModule.add).toHaveBeenCalledWith([30, 40]);
    expect(burgModule.remove).toHaveBeenCalledWith(2);
  });

  it("keeps command calls safe when the burg module is not mounted", () => {
    globalThis.Burgs = undefined as unknown as typeof Burgs;
    globalThis.pack = undefined as unknown as typeof pack;

    const burgs = createGlobalBurgService();

    expect(burgs.add([10, 20])).toBeNull();
    expect(() => burgs.remove(3)).not.toThrow();
    expect(burgs.findById(3)).toBeUndefined();
  });

  it("reads runtime burg data from context pack instead of global pack", () => {
    const runtimeBurg = { i: 5, name: "Runtime Ford" };
    const globalBurg = { i: 5, name: "Global Ford" };
    globalThis.pack = {
      burgs: [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        globalBurg,
      ],
    } as unknown as typeof pack;
    const burgModule = {
      add: vi.fn(() => 5),
      remove: vi.fn(),
    };
    const context = {
      pack: {
        burgs: [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          runtimeBurg,
        ],
      },
    } as unknown as EngineRuntimeContext;

    const burgs = createRuntimeBurgService(context, burgModule);

    expect(burgs.findById(5)).toBe(runtimeBurg);
    expect(burgs.findById(5)).not.toBe(globalBurg);
    expect(burgs.add([1, 2])).toBe(5);
    burgs.remove(5);
    expect(burgModule.add).toHaveBeenCalledWith([1, 2]);
    expect(burgModule.remove).toHaveBeenCalledWith(5);
  });
});

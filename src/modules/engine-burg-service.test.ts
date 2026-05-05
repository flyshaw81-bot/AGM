import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineBurgService,
  createGlobalBurgService,
  createGlobalBurgServiceTargets,
  createRuntimeBurgService,
} from "./engine-burg-service";
import type { EngineRuntimeContext } from "./engine-runtime-context";

const originalBurgs = globalThis.Burgs;
const originalPack = globalThis.pack;
const originalBurgsDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Burgs",
);
const originalPackDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "pack",
);

describe("createGlobalBurgService", () => {
  afterEach(() => {
    for (const [name, descriptor, value] of [
      ["Burgs", originalBurgsDescriptor, originalBurgs],
      ["pack", originalPackDescriptor, originalPack],
    ] as const) {
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
      } else {
        Object.defineProperty(globalThis, name, {
          configurable: true,
          value,
          writable: true,
        });
      }
    }
  });

  it("forwards burg commands to the current AGM Burgs module mount", () => {
    const burg = { i: 3, name: "Northford" };
    globalThis.Burgs = {
      add: vi.fn(() => 3),
      remove: vi.fn(),
      getType: vi.fn(() => "River"),
    } as unknown as typeof Burgs;
    globalThis.pack = {
      burgs: [undefined, undefined, undefined, burg],
    } as unknown as typeof pack;

    const burgs = createGlobalBurgService();

    expect(burgs.add([10, 20])).toBe(3);
    burgs.remove(3);
    expect(burgs.findById(3)).toBe(burg);
    expect(burgs.findById(99)).toBeUndefined();
    expect(burgs.getType(12, 0)).toBe("River");

    expect(Burgs.add).toHaveBeenCalledWith([10, 20], undefined);
    expect(Burgs.remove).toHaveBeenCalledWith(3, undefined);
    expect(Burgs.getType).toHaveBeenCalledWith(12, 0, undefined);
  });

  it("keeps the default burg targets as the compatibility boundary", () => {
    const burg = { i: 3, name: "Northford" };
    globalThis.Burgs = {
      add: vi.fn(() => 3),
    } as unknown as typeof Burgs;
    globalThis.pack = {
      burgs: [undefined, undefined, undefined, burg],
    } as unknown as typeof pack;

    const targets = createGlobalBurgServiceTargets();

    expect(targets.getBurgModule()).toBe(globalThis.Burgs);
    expect(targets.getBurgs()).toEqual([undefined, undefined, undefined, burg]);
  });

  it("composes burg service from injected runtime targets", () => {
    const burg = { i: 2, name: "Southport" };
    const burgModule = {
      add: vi.fn(() => 2),
      remove: vi.fn(),
      getType: vi.fn(() => "Highland"),
    };
    const burgs = createEngineBurgService({
      getBurgModule: () => burgModule,
      getBurgs: () => [undefined, undefined, burg] as any,
    });

    expect(burgs.add([30, 40])).toBe(2);
    burgs.remove(2);
    expect(burgs.findById(2)).toBe(burg);
    expect(burgs.getType(7, 1)).toBe("Highland");

    expect(burgModule.add).toHaveBeenCalledWith([30, 40], undefined);
    expect(burgModule.remove).toHaveBeenCalledWith(2, undefined);
    expect(burgModule.getType).toHaveBeenCalledWith(7, 1, undefined);
  });

  it("keeps command calls safe when the burg module is not mounted", () => {
    globalThis.Burgs = undefined as unknown as typeof Burgs;
    globalThis.pack = undefined as unknown as typeof pack;

    const burgs = createGlobalBurgService();

    expect(burgs.add([10, 20])).toBeNull();
    expect(() => burgs.remove(3)).not.toThrow();
    expect(burgs.findById(3)).toBeUndefined();
    expect(burgs.getType(3, 0)).toBe("Generic");
  });

  it("keeps command calls safe when burg globals are blocked", () => {
    for (const name of ["Burgs", "pack"]) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        get: () => {
          throw new Error(`${name} blocked`);
        },
      });
    }

    const burgs = createGlobalBurgService();

    expect(burgs.add([10, 20])).toBeNull();
    expect(() => burgs.remove(3)).not.toThrow();
    expect(burgs.findById(3)).toBeUndefined();
    expect(burgs.getType(3, 0)).toBe("Generic");
    expect(() =>
      createRuntimeBurgService({
        pack: { burgs: [] },
      } as unknown as EngineRuntimeContext),
    ).not.toThrow();
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
      getType: vi.fn(() => "Lake"),
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
    expect(burgs.getType(5, 1)).toBe("Lake");
    expect(burgModule.add).toHaveBeenCalledWith([1, 2], context);
    expect(burgModule.remove).toHaveBeenCalledWith(5, context);
    expect(burgModule.getType).toHaveBeenCalledWith(5, 1, context);
  });
});

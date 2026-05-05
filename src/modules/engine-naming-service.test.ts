import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineNamingService,
  createGlobalNamingService,
  createGlobalNamingServiceTargets,
} from "./engine-naming-service";

const originalNames = globalThis.Names;

describe("createGlobalNamingService", () => {
  afterEach(() => {
    globalThis.Names = originalNames;
  });

  it("forwards naming calls to the current AGM Names module mount", () => {
    const nameBases = [{ name: "Base" }];
    globalThis.Names = {
      getCulture: vi.fn(() => "Culture"),
      getCultureShort: vi.fn(() => "Cult"),
      getState: vi.fn(() => "State"),
      getBase: vi.fn(() => "Base Name"),
      getBaseShort: vi.fn(() => "Base"),
      getNameBases: vi.fn(() => nameBases),
      getMapName: vi.fn(),
    } as unknown as typeof Names;

    const naming = createGlobalNamingService();

    expect(naming.getCulture(2, 4, 8, "x")).toBe("Culture");
    expect(naming.getCultureShort(2)).toBe("Cult");
    expect(naming.getState("Root", 3)).toBe("State");
    expect(naming.getBase?.(1, 5, 9, "")).toBe("Base Name");
    expect(naming.getBaseShort?.(1)).toBe("Base");
    expect(naming.getNameBases?.()).toBe(nameBases);
    naming.getMapName?.();

    expect(Names.getCulture).toHaveBeenCalledWith(2, 4, 8, "x");
    expect(Names.getCultureShort).toHaveBeenCalledWith(2);
    expect(Names.getState).toHaveBeenCalledWith("Root", 3);
    expect(Names.getBase).toHaveBeenCalledWith(1, 5, 9, "");
    expect(Names.getBaseShort).toHaveBeenCalledWith(1);
    expect(Names.getNameBases).toHaveBeenCalledWith();
    expect(Names.getMapName).toHaveBeenCalledWith(false);
  });

  it("keeps the default naming targets as the compatibility boundary", () => {
    globalThis.Names = {
      getCulture: vi.fn(() => "Culture"),
      getCultureShort: vi.fn(() => "Cult"),
      getState: vi.fn(() => "State"),
      getBase: vi.fn(() => "Base Name"),
      getBaseShort: vi.fn(() => "Base"),
      getNameBases: vi.fn(() => []),
      getMapName: vi.fn(),
    } as unknown as typeof Names;

    const targets = createGlobalNamingServiceTargets();

    expect(targets.getNamesModule()).toBe(globalThis.Names);
  });

  it("composes naming service from injected runtime targets", () => {
    const nameBases = [{ name: "Injected Base" }] as any;
    const namesModule = {
      getCulture: vi.fn(() => "Injected Culture"),
      getCultureShort: vi.fn(() => "Injected"),
      getState: vi.fn(() => "Injected State"),
      getBase: vi.fn(() => "Injected Base"),
      getBaseShort: vi.fn(() => "Base"),
      getNameBases: vi.fn(() => nameBases),
      getMapName: vi.fn(),
    };

    const naming = createEngineNamingService({
      getNamesModule: () => namesModule,
    });

    expect(naming.getCulture(1)).toBe("Injected Culture");
    expect(naming.getCultureShort(1)).toBe("Injected");
    expect(naming.getState("Root", 2)).toBe("Injected State");
    expect(naming.getBase?.(3)).toBe("Injected Base");
    expect(naming.getBaseShort?.(3)).toBe("Base");
    expect(naming.getNameBases?.()).toBe(nameBases);
    naming.getMapName?.();

    expect(namesModule.getMapName).toHaveBeenCalledWith(false);
  });

  it("uses stable fallbacks when the names module is not mounted", () => {
    globalThis.Names = undefined as unknown as typeof Names;

    const naming = createGlobalNamingService();

    expect(naming.getCulture(7)).toBe("Culture 7");
    expect(naming.getCultureShort(7)).toBe("C7");
    expect(naming.getState("North", 2)).toBe("North State");
    expect(naming.getBase?.(3)).toBe("Base 3");
    expect(naming.getBaseShort?.(3)).toBe("B3");
    expect(naming.getNameBases?.()).toEqual([]);
    expect(() => naming.getMapName?.()).not.toThrow();
  });
});

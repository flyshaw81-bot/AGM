import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalNamingService } from "./engine-naming-service";

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
});

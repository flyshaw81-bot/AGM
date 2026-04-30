import { describe, expect, it, vi } from "vitest";
import { createGlobalProjectCenterTargets } from "./projectCenterTargets";

describe("createGlobalProjectCenterTargets", () => {
  it("wires browser storage and clock behind project center targets", () => {
    const storage = {
      getItem: vi.fn(() => "[]"),
      setItem: vi.fn(),
    };
    const originalLocalStorage = globalThis.localStorage;
    const originalDateNow = Date.now;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    });
    Date.now = vi.fn(() => 4567);

    try {
      const targets = createGlobalProjectCenterTargets();

      expect(targets.getStorageItem("recent")).toBe("[]");
      targets.setStorageItem("recent", "[{}]");

      expect(storage.getItem).toHaveBeenCalledWith("recent");
      expect(storage.setItem).toHaveBeenCalledWith("recent", "[{}]");
      expect(targets.now()).toBe(4567);
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: originalLocalStorage,
      });
      Date.now = originalDateNow;
    }
  });
});

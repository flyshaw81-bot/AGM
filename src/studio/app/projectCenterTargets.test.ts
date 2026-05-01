import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActionTypes";
import {
  createGlobalProjectCenterTargets,
  createProjectCenterTargets,
} from "./projectCenterTargets";

describe("createGlobalProjectCenterTargets", () => {
  it("composes storage, summary, and clock project center adapters", () => {
    const storage = {
      getStorageItem: vi.fn(() => "[]"),
      setStorageItem: vi.fn(),
    };
    const summary = {
      getProjectSummary: vi.fn(
        () =>
          ({
            pendingSeed: "seed-1",
            hasLocalSnapshot: true,
          }) as EngineProjectSummary,
      ),
    };
    const clock = {
      now: vi.fn(() => 7890),
    };

    const targets = createProjectCenterTargets(storage, summary, clock);

    expect(targets.getStorageItem("recent")).toBe("[]");
    targets.setStorageItem("recent", "[{}]");
    expect(targets.getProjectSummary()).toMatchObject({
      pendingSeed: "seed-1",
    });
    expect(targets.now()).toBe(7890);
    expect(storage.setStorageItem).toHaveBeenCalledWith("recent", "[{}]");
  });

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

  it("keeps global project center storage safe when localStorage is absent", () => {
    const originalLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: undefined,
    });

    try {
      const targets = createGlobalProjectCenterTargets();

      expect(targets.getStorageItem("recent")).toBeNull();
      expect(() => targets.setStorageItem("recent", "[]")).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: originalLocalStorage,
      });
    }
  });
});

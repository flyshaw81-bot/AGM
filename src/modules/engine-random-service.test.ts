import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalRandomService } from "./engine-random-service";

const originalMathRandom = Math.random;

describe("createGlobalRandomService", () => {
  afterEach(() => {
    Math.random = originalMathRandom;
  });

  it("delegates random generation to Math.random", () => {
    Math.random = vi.fn(() => 0.42);

    expect(createGlobalRandomService().next()).toBe(0.42);
    expect(Math.random).toHaveBeenCalledWith();
  });
});

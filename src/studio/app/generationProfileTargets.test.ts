import { describe, expect, it, vi } from "vitest";
import { createGlobalGenerationProfileTargets } from "./generationProfileTargets";

describe("createGlobalGenerationProfileTargets", () => {
  it("wires the clock behind generation profile targets", () => {
    const originalDateNow = Date.now;
    Date.now = vi.fn(() => 7890);

    try {
      const targets = createGlobalGenerationProfileTargets();

      expect(targets.now()).toBe(7890);
      expect(typeof targets.getProjectSummary).toBe("function");
      expect(typeof targets.createWorldDraft).toBe("function");
      expect(typeof targets.setPendingStates).toBe("function");
      expect(typeof targets.setPendingBurgs).toBe("function");
      expect(typeof targets.setPendingGrowthRate).toBe("function");
      expect(typeof targets.setPendingSizeVariety).toBe("function");
      expect(typeof targets.setPendingProvincesRatio).toBe("function");
    } finally {
      Date.now = originalDateNow;
    }
  });
});

import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActions";
import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import {
  createGenerationProfileTargets,
  createGlobalGenerationProfileTargets,
} from "./generationProfileTargets";

describe("createGlobalGenerationProfileTargets", () => {
  it("composes summary, draft, settings, and clock adapters", () => {
    const summary = {
      getProjectSummary: vi.fn(
        () =>
          ({
            pendingStates: "4",
          }) as EngineProjectSummary,
      ),
    };
    const draft = {
      createWorldDraft: vi.fn(
        () =>
          ({
            playability: { generatorProfileSuggestions: [] },
          }) as unknown as WorldDocumentDraft,
      ),
    };
    const settings = {
      setPendingStates: vi.fn(),
      setPendingBurgs: vi.fn(),
      setPendingGrowthRate: vi.fn(),
      setPendingSizeVariety: vi.fn(),
      setPendingProvincesRatio: vi.fn(),
    };
    const clock = {
      now: vi.fn(() => 4321),
    };

    const targets = createGenerationProfileTargets(
      summary,
      draft,
      settings,
      clock,
    );

    expect(targets.getProjectSummary()).toMatchObject({ pendingStates: "4" });
    expect(targets.createWorldDraft({} as never, {} as never)).toMatchObject({
      playability: { generatorProfileSuggestions: [] },
    });
    targets.setPendingStates(8);
    expect(settings.setPendingStates).toHaveBeenCalledWith(8);
    expect(targets.now()).toBe(4321);
  });

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

import { describe, expect, it, vi } from "vitest";

import {
  createEngineCanvasClearService,
  type EngineCanvasClearTargets,
  MAP_CLEAR_SELECTOR,
} from "./engine-canvas-clear-service";

function createTargets(
  overrides: Partial<EngineCanvasClearTargets> = {},
): EngineCanvasClearTargets {
  return {
    clearMapNodes: vi.fn(),
    clearDefinitionNodes: vi.fn(),
    clearGeneratedEmblems: vi.fn(),
    resetNotes: vi.fn(),
    unfog: vi.fn(),
    ...overrides,
  };
}

describe("engine canvas clear service", () => {
  it("clears rendered map artifacts and resets transient note state", () => {
    const targets = createTargets();
    const service = createEngineCanvasClearService(targets);

    service.undraw();

    expect(targets.clearMapNodes).toHaveBeenCalledWith(MAP_CLEAR_SELECTOR);
    expect(targets.clearDefinitionNodes).toHaveBeenCalledTimes(1);
    expect(targets.clearGeneratedEmblems).toHaveBeenCalledTimes(1);
    expect(targets.resetNotes).toHaveBeenCalledTimes(1);
    expect(targets.unfog).toHaveBeenCalledTimes(1);
  });
});

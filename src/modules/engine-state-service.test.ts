import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineStateService,
  createGlobalStateService,
} from "./engine-state-service";

const originalStates = globalThis.States;

describe("createGlobalStateService", () => {
  afterEach(() => {
    globalThis.States = originalStates;
  });

  it("forwards state service calls to the current AGM States module mount", () => {
    const campaign = [{ name: "War" }];
    const state = { i: 1 };
    globalThis.States = {
      generateCampaign: vi.fn(() => campaign),
      getPoles: vi.fn(),
    } as unknown as typeof States;

    const states = createGlobalStateService();

    expect(states.generateCampaign(state)).toBe(campaign);
    states.getPoles();

    expect(States.generateCampaign).toHaveBeenCalledWith(state);
    expect(States.getPoles).toHaveBeenCalledWith();
  });

  it("composes state service from injected runtime targets", () => {
    const campaign = [{ name: "Campaign" }];
    const statesModule = {
      generateCampaign: vi.fn(() => campaign),
      getPoles: vi.fn(),
    };
    const states = createEngineStateService({
      getStatesModule: () => statesModule,
    });

    expect(states.generateCampaign({ i: 2 })).toBe(campaign);
    states.getPoles();

    expect(statesModule.generateCampaign).toHaveBeenCalledWith({ i: 2 });
    expect(statesModule.getPoles).toHaveBeenCalledWith();
  });
});

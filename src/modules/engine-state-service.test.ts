import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createEngineStateService,
  createGlobalStateService,
  createGlobalStateServiceTargets,
  createRuntimeStateService,
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

    expect(States.generateCampaign).toHaveBeenCalledWith(state, undefined);
    expect(States.getPoles).toHaveBeenCalledWith(undefined);
  });

  it("keeps the default state targets as the compatibility boundary", () => {
    globalThis.States = {
      generateCampaign: vi.fn(() => []),
      getPoles: vi.fn(),
    } as unknown as typeof States;

    const targets = createGlobalStateServiceTargets();

    expect(targets.getStatesModule()).toBe(globalThis.States);
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

    expect(statesModule.generateCampaign).toHaveBeenCalledWith(
      { i: 2 },
      undefined,
    );
    expect(statesModule.getPoles).toHaveBeenCalledWith(undefined);
  });

  it("keeps state service safe when the state module is not mounted", () => {
    globalThis.States = undefined as unknown as typeof States;

    const states = createGlobalStateService();

    expect(states.generateCampaign({ i: 9 })).toEqual([]);
    expect(() => states.getPoles()).not.toThrow();
  });

  it("forwards runtime context into state module calls", () => {
    const campaign = [{ name: "Runtime Campaign" }];
    const statesModule = {
      generateCampaign: vi.fn(() => campaign),
      getPoles: vi.fn(),
    };
    const context = {
      pack: {
        states: [],
      },
    } as unknown as EngineRuntimeContext;
    const states = createRuntimeStateService(context, statesModule);

    expect(states.generateCampaign({ i: 4 })).toBe(campaign);
    states.getPoles();

    expect(statesModule.generateCampaign).toHaveBeenCalledWith(
      { i: 4 },
      context,
    );
    expect(statesModule.getPoles).toHaveBeenCalledWith(context);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalMapGraphLifecycleService,
  createGlobalMapGraphLifecycleTargets,
  createMapGraphLifecycleService,
} from "./engine-map-graph-lifecycle-service";

const originalReGraph = globalThis.reGraph;
const originalCreateDefaultRuler = globalThis.createDefaultRuler;

describe("EngineMapGraphLifecycleService", () => {
  afterEach(() => {
    globalThis.reGraph = originalReGraph;
    globalThis.createDefaultRuler = originalCreateDefaultRuler;
  });

  it("routes graph lifecycle operations through injected targets", () => {
    const targets = {
      rebuildGraph: vi.fn(),
      createDefaultRuler: vi.fn(),
    };
    const service = createMapGraphLifecycleService(targets);

    service.rebuildGraph();
    service.createDefaultRuler();

    expect(targets.rebuildGraph).toHaveBeenCalledWith();
    expect(targets.createDefaultRuler).toHaveBeenCalledWith();
  });

  it("keeps public graph lifecycle helpers behind global targets", () => {
    globalThis.reGraph = vi.fn();
    globalThis.createDefaultRuler = vi.fn();
    const targets = createGlobalMapGraphLifecycleTargets();

    targets.rebuildGraph();
    targets.createDefaultRuler();

    expect(globalThis.reGraph).toHaveBeenCalledWith();
    expect(globalThis.createDefaultRuler).toHaveBeenCalledWith();
  });

  it("keeps global graph lifecycle targets safe when helpers are absent", () => {
    globalThis.reGraph = undefined as unknown as typeof reGraph;
    globalThis.createDefaultRuler =
      undefined as unknown as typeof createDefaultRuler;
    const targets = createGlobalMapGraphLifecycleTargets();

    expect(() => targets.rebuildGraph()).not.toThrow();
    expect(() => targets.createDefaultRuler()).not.toThrow();
  });

  it("creates a global graph lifecycle service from explicit targets", () => {
    const targets = {
      rebuildGraph: vi.fn(),
      createDefaultRuler: vi.fn(),
    };

    createGlobalMapGraphLifecycleService(targets).rebuildGraph();

    expect(targets.rebuildGraph).toHaveBeenCalledWith();
  });
});

import { afterEach, describe, expect, it } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type { EngineAutoFixPreviewChange } from "./engineActionTypes";
import {
  createGlobalRouteWritebackTargets,
  createRouteWritebackTargets,
  createRuntimeRouteWritebackTargets,
} from "./engineAutoFixRouteTargets";

const originalPack = globalThis.pack;
const originalPackDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "pack",
);

describe("createGlobalRouteWritebackTargets", () => {
  afterEach(() => {
    if (originalPackDescriptor) {
      Object.defineProperty(globalThis, "pack", originalPackDescriptor);
    } else {
      Object.defineProperty(globalThis, "pack", {
        configurable: true,
        value: originalPack,
        writable: true,
      });
    }
  });

  it("resolves a disconnected land cell from referenced provinces", () => {
    globalThis.pack = {
      cells: {
        i: [10, 11, 12],
        h: { 10: 30, 11: 34, 12: 10 },
        province: { 10: 4, 11: 4, 12: 4 },
        routes: { 10: { 11: 1 }, 11: {} },
      },
      provinces: {
        4: { i: 4, center: 10 },
      },
    } as unknown as typeof pack;

    const change = {
      id: "route:4",
      operation: "link",
      entity: "route",
      summary: "Connect province",
      refs: { provinces: [4] },
    } satisfies EngineAutoFixPreviewChange;

    expect(createGlobalRouteWritebackTargets().resolveRouteCell(change)).toBe(
      11,
    );
  });

  it("falls back to the province center when all land cells are connected", () => {
    globalThis.pack = {
      cells: {
        i: [20, 21],
        h: { 20: 30, 21: 34 },
        province: { 20: 6, 21: 6 },
        routes: { 20: { 21: 2 }, 21: { 20: 2 } },
      },
      provinces: {
        6: { i: 6, center: 20 },
      },
    } as unknown as typeof pack;

    const change = {
      id: "route:6",
      operation: "link",
      entity: "route",
      summary: "Connect province",
      refs: { provinces: [6] },
    } satisfies EngineAutoFixPreviewChange;

    expect(createGlobalRouteWritebackTargets().resolveRouteCell(change)).toBe(
      20,
    );
  });

  it("resolves from referenced state cells when no province target is available", () => {
    globalThis.pack = {
      cells: {
        i: [30, 31],
        h: { 30: 35, 31: 35 },
        state: { 30: 3, 31: 3 },
        routes: { 30: { 31: 1 }, 31: {} },
      },
      provinces: {},
    } as unknown as typeof pack;

    const change = {
      id: "route:state:3",
      operation: "link",
      entity: "route",
      summary: "Connect state",
      refs: { states: [3] },
    } satisfies EngineAutoFixPreviewChange;

    expect(createGlobalRouteWritebackTargets().resolveRouteCell(change)).toBe(
      31,
    );
  });

  it("keeps global route writeback safe when pack access throws", () => {
    Object.defineProperty(globalThis, "pack", {
      configurable: true,
      get: () => {
        throw new Error("pack blocked");
      },
    });
    const change = {
      id: "route:blocked",
      operation: "link",
      entity: "route",
      summary: "Connect province",
      refs: { provinces: [4], states: [3] },
    } satisfies EngineAutoFixPreviewChange;
    const targets = createGlobalRouteWritebackTargets();

    expect(targets.resolveRouteCell(change)).toBeUndefined();
    expect(targets.getWritableProvince(4)).toBeUndefined();
  });

  it("composes route writeback targets from an injected map adapter", () => {
    const province = { i: 4, center: 10 };
    const targets = createRouteWritebackTargets({
      getCellIds: () => [10, 11],
      getCellHeight: () => 30,
      getCellProvince: () => 4,
      getCellState: () => undefined,
      getCellRoutes: (cellId) => (cellId === 11 ? {} : { 11: 1 }),
      getProvince: (provinceId) =>
        provinceId === 4
          ? province
          : ({ i: provinceId, removed: true } as Record<string, unknown>),
    });
    const change = {
      id: "route:4",
      operation: "link",
      entity: "route",
      summary: "Connect province",
      refs: { provinces: [4] },
    } satisfies EngineAutoFixPreviewChange;

    expect(targets.resolveRouteCell(change)).toBe(11);
    expect(targets.getWritableProvince(4)).toBe(province);
    expect(targets.getWritableProvince(5)).toBeUndefined();
  });

  it("creates route writeback targets from an injected runtime context", () => {
    const province = { i: 4, center: 10 };
    const context = {
      pack: {
        cells: {
          i: [10, 11],
          h: { 10: 30, 11: 30 },
          province: { 10: 4, 11: 4 },
          routes: { 10: { 11: 1 }, 11: {} },
        },
        provinces: {
          4: province,
        },
      },
    } as unknown as EngineRuntimeContext;
    const change = {
      id: "route:runtime:4",
      operation: "link",
      entity: "route",
      summary: "Connect province",
      refs: { provinces: [4] },
    } satisfies EngineAutoFixPreviewChange;
    const targets = createRuntimeRouteWritebackTargets(context);

    expect(targets.resolveRouteCell(change)).toBe(11);
    expect(targets.getWritableProvince(4)).toBe(province);
  });
});

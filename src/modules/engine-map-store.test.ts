import { afterEach, describe, expect, it, vi } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import {
  createGlobalMapStore,
  createGlobalMapStoreRuntimeAdapter,
  createGlobalMapStoreTargets,
  createMapStore,
  createRuntimeMapStore,
  createRuntimeMapStoreRuntimeAdapter,
} from "./engine-map-store";
import type { EngineRuntimeContext } from "./engine-runtime-context";

const originalStructuredClone = globalThis.structuredClone;
const originalGrid = globalThis.grid;
const originalPack = globalThis.pack;
const originalNotes = globalThis.notes;
const originalSeed = globalThis.seed;
const originalGraphWidth = globalThis.graphWidth;
const originalGraphHeight = globalThis.graphHeight;
const originalDocument = globalThis.document;
const originalTime = globalThis.TIME;
const originalDescriptors = new Map(
  [
    "structuredClone",
    "grid",
    "pack",
    "notes",
    "seed",
    "graphWidth",
    "graphHeight",
    "document",
    "TIME",
  ].map(
    (name) =>
      [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const,
  ),
);

describe("createGlobalMapStore", () => {
  afterEach(() => {
    for (const [name, value] of [
      ["structuredClone", originalStructuredClone],
      ["grid", originalGrid],
      ["pack", originalPack],
      ["notes", originalNotes],
      ["seed", originalSeed],
      ["graphWidth", originalGraphWidth],
      ["graphHeight", originalGraphHeight],
      ["document", originalDocument],
      ["TIME", originalTime],
    ] as const) {
      const descriptor = originalDescriptors.get(name);
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
      } else {
        Object.defineProperty(globalThis, name, {
          configurable: true,
          value,
          writable: true,
        });
      }
    }
    vi.restoreAllMocks();
  });

  it("creates a structured snapshot of current map globals", () => {
    const clonedValues: unknown[] = [];
    globalThis.structuredClone = vi.fn((value) => {
      clonedValues.push(value);
      return { cloned: value };
    }) as typeof structuredClone;
    globalThis.grid = { cells: { i: [1] } } as typeof grid;
    globalThis.pack = { cells: { i: [2] } } as typeof pack;
    globalThis.notes = [{ id: "n1", name: "Note", legend: "Text" }];

    const snapshot = createGlobalMapStore(
      () => ({}) as EngineRuntimeContext,
    ).createSnapshot();

    expect(snapshot).toEqual({
      grid: { cloned: globalThis.grid },
      pack: { cloned: globalThis.pack },
      notes: { cloned: globalThis.notes },
    });
    expect(clonedValues).toEqual([
      globalThis.grid,
      globalThis.pack,
      globalThis.notes,
    ]);
  });

  it("composes the global runtime adapter from explicit targets", () => {
    const calls: string[] = [];
    const localGrid = { cells: { i: [1] } } as typeof grid;
    const localPack = { cells: { i: [2] } } as typeof pack;
    const localNotes = [{ id: "n10", name: "Target", legend: "Note" }];
    const nextGrid = { cells: { i: [3] } } as typeof grid;
    const adapter = createGlobalMapStoreRuntimeAdapter({
      clone: (value) => {
        calls.push("clone");
        return value;
      },
      createGrid: () => {
        calls.push("createGrid");
        return nextGrid;
      },
      getGrid: () => {
        calls.push("getGrid");
        return localGrid;
      },
      getNotes: () => {
        calls.push("getNotes");
        return localNotes;
      },
      getPack: () => {
        calls.push("getPack");
        return localPack;
      },
      setGrid: (value) => {
        calls.push(`setGrid:${value === nextGrid}`);
      },
      setNotes: (value) => {
        calls.push(`setNotes:${value === localNotes}`);
      },
      setPack: () => {
        calls.push("setPack");
      },
    });

    expect(adapter.getGrid()).toBe(localGrid);
    expect(adapter.getPack()).toBe(localPack);
    expect(adapter.getNotes()).toBe(localNotes);
    expect(adapter.clone(localPack)).toBe(localPack);
    expect(adapter.createGrid()).toBe(nextGrid);
    adapter.setGrid(nextGrid);
    adapter.setPack({} as PackedGraph);
    adapter.setNotes(localNotes);

    expect(calls).toEqual([
      "getGrid",
      "getPack",
      "getNotes",
      "clone",
      "createGrid",
      "setGrid:true",
      "setPack",
      "setNotes:true",
    ]);
  });

  it("keeps the default global target factory as the compatibility boundary", () => {
    globalThis.grid = { cells: { i: [11] } } as typeof grid;
    globalThis.pack = { cells: { i: [12] } } as typeof pack;
    globalThis.notes = [{ id: "n11", name: "Global", legend: "Note" }];
    const targets = createGlobalMapStoreTargets();

    expect(targets.getGrid()).toBe(globalThis.grid);
    expect(targets.getPack()).toBe(globalThis.pack);
    expect(targets.getNotes()).toBe(globalThis.notes);

    const nextGrid = { cells: { i: [13] } } as typeof grid;
    const nextPack = { cells: { i: [14] } } as typeof pack;
    const nextNotes = [{ id: "n12", name: "Next", legend: "Note" }];
    targets.setGrid(nextGrid);
    targets.setPack(nextPack);
    targets.setNotes(nextNotes);

    expect(globalThis.grid).toBe(nextGrid);
    expect(globalThis.pack).toBe(nextPack);
    expect(globalThis.notes).toBe(nextNotes);
  });

  it("resets pack for generation behind the map-store boundary", () => {
    globalThis.pack = { cells: { i: [1] } } as typeof pack;

    createGlobalMapStore(
      () => ({}) as EngineRuntimeContext,
    ).resetPackForGeneration();

    expect(globalThis.pack).toEqual({});
  });

  it("resets grid, pack, and notes for resample compatibility", () => {
    globalThis.seed = "map-store";
    globalThis.graphWidth = 300;
    globalThis.graphHeight = 200;
    globalThis.document = {
      getElementById: (id: string) =>
        id === "pointsInput" ? { dataset: { cells: "100" } } : null,
    } as unknown as Document;
    globalThis.TIME = false;
    const snapshotNotes = [{ id: "n2", name: "Parent", legend: "Legend" }];
    const store = createGlobalMapStore(() => ({}) as EngineRuntimeContext);

    store.resetForResample({
      grid: { cells: {} } as typeof grid,
      pack: { cells: {} } as typeof pack,
      notes: snapshotNotes,
    });

    expect(globalThis.grid).toMatchObject({
      spacing: expect.any(Number),
      points: expect.any(Array),
    });
    expect(globalThis.pack).toEqual({});
    expect(globalThis.notes).toBe(snapshotNotes);
  });

  it("keeps global map-store targets safe when global access throws", () => {
    for (const name of [
      "structuredClone",
      "grid",
      "pack",
      "notes",
      "seed",
      "graphWidth",
      "graphHeight",
    ]) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        get: () => {
          throw new Error(`${name} blocked`);
        },
        set: () => {
          throw new Error(`${name} blocked`);
        },
      });
    }
    const targets = createGlobalMapStoreTargets();

    expect(targets.getGrid()).toEqual({});
    expect(targets.getPack()).toEqual({});
    expect(targets.getNotes()).toEqual([]);
    expect(targets.clone({ ok: true })).toEqual({ ok: true });
    expect(() => targets.setGrid({} as typeof grid)).not.toThrow();
    expect(() => targets.setPack({} as PackedGraph)).not.toThrow();
    expect(() => targets.setNotes([])).not.toThrow();
  });

  it("returns the injected current context without reaching into globals", () => {
    const context = {
      seed: "current-context",
    } as unknown as EngineRuntimeContext;
    const store = createGlobalMapStore(() => context);

    expect(store.getCurrentContext()).toBe(context);
  });

  it("can run against an injected runtime adapter without mutating map globals", () => {
    const originalGlobalPack = { cells: { i: [99] } } as typeof pack;
    const localGrid = { cells: { i: [1] } } as typeof grid;
    const localPack = { cells: { i: [2] } } as typeof pack;
    const localNotes = [{ id: "n3", name: "Note", legend: "Text" }];
    const nextGrid = { cells: { i: [3] } } as typeof grid;
    const adapterState = {
      grid: localGrid,
      pack: localPack,
      notes: localNotes,
    };
    globalThis.pack = originalGlobalPack;
    const store = createMapStore(
      {
        getGrid: () => adapterState.grid,
        getPack: () => adapterState.pack,
        getNotes: () => adapterState.notes,
        clone: (value) => value,
        setGrid: (next) => {
          adapterState.grid = next;
        },
        setPack: (next) => {
          adapterState.pack = next;
        },
        setNotes: (next) => {
          adapterState.notes = next;
        },
        createGrid: () => nextGrid,
      },
      () => ({}) as EngineRuntimeContext,
    );

    expect(store.createSnapshot()).toEqual({
      grid: localGrid,
      pack: localPack,
      notes: localNotes,
    });
    store.resetPackForGeneration();
    expect(adapterState.pack).toEqual({});
    expect(globalThis.pack).toBe(originalGlobalPack);
    store.resetForResample({
      grid: localGrid,
      pack: localPack,
      notes: localNotes,
    });
    expect(adapterState.grid).toBe(nextGrid);
    expect(adapterState.pack).toEqual({});
    expect(adapterState.notes).toBe(localNotes);
    expect(globalThis.pack).toBe(originalGlobalPack);
  });

  it("uses the injected clone adapter when creating snapshots", () => {
    const clone = vi.fn((value) => ({ cloned: value }));
    const store = createMapStore(
      {
        getGrid: () => ({ cells: { i: [1] } }) as typeof grid,
        getPack: () => ({ cells: { i: [2] } }) as typeof pack,
        getNotes: () => [{ id: "n4", name: "Note", legend: "Text" }],
        clone: clone as never,
        setGrid: vi.fn(),
        setPack: vi.fn(),
        setNotes: vi.fn(),
        createGrid: vi.fn(),
      },
      () => ({}) as EngineRuntimeContext,
    );

    const snapshot = store.createSnapshot();

    expect(snapshot.grid).toEqual({ cloned: { cells: { i: [1] } } });
    expect(snapshot.pack).toEqual({ cloned: { cells: { i: [2] } } });
    expect(snapshot.notes).toEqual({
      cloned: [{ id: "n4", name: "Note", legend: "Text" }],
    });
    expect(clone).toHaveBeenCalledTimes(3);
  });

  it("creates a runtime adapter over context grid, pack, and notes service", () => {
    const clone = vi.fn((value) => ({ cloned: value }));
    globalThis.structuredClone = clone as typeof structuredClone;
    const nextGrid = { cells: { i: [8] } } as typeof grid;
    const notes = [
      { id: "n5", name: "Runtime", legend: "Note" },
      { id: "n6", name: "Second", legend: "Note" },
    ];
    const context = {
      grid: { cells: { i: [1] } } as typeof grid,
      pack: { cells: { i: [2] } } as typeof pack,
      notes: {
        all: () => notes,
      },
    } as unknown as EngineRuntimeContext;
    const adapter = createRuntimeMapStoreRuntimeAdapter(
      context,
      () => nextGrid,
    );

    expect(adapter.getGrid()).toBe(context.grid);
    expect(adapter.getPack()).toBe(context.pack);
    expect(adapter.getNotes()).toBe(notes);
    expect(adapter.clone(context.pack)).toEqual({ cloned: context.pack });

    adapter.setGrid(nextGrid);
    adapter.setPack({ cells: { i: [3] } } as typeof pack);
    adapter.setNotes([{ id: "n7", name: "Replacement", legend: "Note" }]);

    expect(context.grid).toBe(nextGrid);
    expect(context.pack).toEqual({ cells: { i: [3] } });
    expect(notes).toEqual([{ id: "n7", name: "Replacement", legend: "Note" }]);
    expect(adapter.createGrid()).toBe(nextGrid);
  });

  it("creates a map store over an injected runtime context", () => {
    const clone = vi.fn((value) => ({ cloned: value }));
    globalThis.structuredClone = clone as typeof structuredClone;
    const notes = [{ id: "n8", name: "Runtime", legend: "Note" }];
    const nextGrid = { cells: { i: [8] } } as typeof grid;
    const context = {
      grid: { cells: { i: [1] } } as typeof grid,
      pack: { cells: { i: [2] } } as typeof pack,
      notes: {
        all: () => notes,
      },
      seed: "runtime-map-store",
      worldSettings: { graphWidth: 100, graphHeight: 80 },
    } as unknown as EngineRuntimeContext;
    const store = createRuntimeMapStore(
      context,
      () => context,
      () => nextGrid,
    );

    expect(store.getCurrentContext()).toBe(context);
    expect(store.createSnapshot()).toEqual({
      grid: { cloned: context.grid },
      pack: { cloned: context.pack },
      notes: { cloned: notes },
    });

    store.resetForResample({
      grid: context.grid,
      pack: context.pack,
      notes: [{ id: "n9", name: "Restored", legend: "Note" }],
    });

    expect(context.grid).toBe(nextGrid);
    expect(context.pack).toEqual({});
    expect(notes).toEqual([{ id: "n9", name: "Restored", legend: "Note" }]);
  });
});

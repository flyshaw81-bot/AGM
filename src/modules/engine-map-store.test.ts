import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalMapStore, createMapStore } from "./engine-map-store";
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

describe("createGlobalMapStore", () => {
  afterEach(() => {
    globalThis.structuredClone = originalStructuredClone;
    globalThis.grid = originalGrid;
    globalThis.pack = originalPack;
    globalThis.notes = originalNotes;
    globalThis.seed = originalSeed;
    globalThis.graphWidth = originalGraphWidth;
    globalThis.graphHeight = originalGraphHeight;
    globalThis.document = originalDocument;
    globalThis.TIME = originalTime;
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
});

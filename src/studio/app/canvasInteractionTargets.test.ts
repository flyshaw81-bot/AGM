import { describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type { CanvasToolMode } from "../types";
import {
  createCanvasInteractionTargets,
  createGlobalCanvasInteractionDomTargets,
  createGlobalCanvasInteractionTargets,
  createRuntimeCanvasInteractionTargets,
} from "./canvasInteractionTargets";

describe("canvas interaction targets", () => {
  it("composes canvas interaction targets from injected adapters", () => {
    const targets = {
      getCanvasFrame: vi.fn(() => null),
      getMapHost: vi.fn(() => null),
      isControlEvent: vi.fn(() => false),
      getPaintPreviewAt: vi.fn(),
      getSelectionAt: vi.fn(),
      syncPaintPreview: vi.fn(),
      syncToolHud: vi.fn(),
      syncViewport: vi.fn(),
      isPaintTool: (
        _tool: CanvasToolMode,
      ): _tool is "terrain" | "water" | "brush" => false,
    };

    expect(createCanvasInteractionTargets(targets)).toBe(targets);
  });

  it("composes default canvas interaction adapters", () => {
    const originalDocument = globalThis.document;
    globalThis.document = {
      getElementById: vi.fn((id: string) => ({ id })),
    } as unknown as Document;

    try {
      const targets = createGlobalCanvasInteractionTargets();

      expect(targets.getCanvasFrame()).toMatchObject({
        id: "studioCanvasFrame",
      });
      expect(targets.getMapHost()).toMatchObject({ id: "studioMapHost" });
      expect(targets.getPaintPreviewAt).toEqual(expect.any(Function));
      expect(targets.getSelectionAt).toEqual(expect.any(Function));
      expect(targets.syncPaintPreview).toEqual(expect.any(Function));
      expect(targets.syncToolHud).toEqual(expect.any(Function));
      expect(targets.syncViewport).toEqual(expect.any(Function));
      expect(targets.isPaintTool).toEqual(expect.any(Function));
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it("keeps default canvas DOM lookups safe when document is absent", () => {
    const originalDocument = globalThis.document;
    globalThis.document = undefined as unknown as Document;

    try {
      const targets = createGlobalCanvasInteractionTargets();

      expect(targets.getCanvasFrame()).toBeNull();
      expect(targets.getMapHost()).toBeNull();
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it("keeps default canvas DOM adapter safe when document access throws", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "document",
    );
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("blocked document");
      },
    });

    try {
      const targets = createGlobalCanvasInteractionDomTargets();

      expect(targets.getCanvasFrame()).toBeNull();
      expect(targets.getMapHost()).toBeNull();
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, "document", originalDescriptor);
      }
    }
  });

  it("keeps default canvas DOM adapter safe when element lookup throws", () => {
    const originalDocument = globalThis.document;
    globalThis.document = {
      getElementById: () => {
        throw new Error("canvas lookup blocked");
      },
    } as unknown as Document;

    try {
      const targets = createGlobalCanvasInteractionDomTargets();

      expect(targets.getCanvasFrame()).toBeNull();
      expect(targets.getMapHost()).toBeNull();
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it("treats control events as non-control when Element is absent", () => {
    const originalElement = globalThis.Element;
    globalThis.Element = undefined as unknown as typeof Element;

    try {
      const targets = createGlobalCanvasInteractionTargets();

      expect(targets.isControlEvent({ target: {} } as unknown as Event)).toBe(
        false,
      );
    } finally {
      globalThis.Element = originalElement;
    }
  });

  it("treats control events as non-control when closest lookup throws", () => {
    const originalElement = globalThis.Element;
    class FakeElement {
      closest() {
        throw new Error("closest blocked");
      }
    }
    globalThis.Element = FakeElement as unknown as typeof Element;

    try {
      const targets = createGlobalCanvasInteractionTargets();

      expect(
        targets.isControlEvent({
          target: new FakeElement(),
        } as unknown as Event),
      ).toBe(false);
    } finally {
      globalThis.Element = originalElement;
    }
  });

  it("composes runtime canvas interaction geometry adapters", () => {
    const originalDocument = globalThis.document;
    globalThis.document = {
      getElementById: vi.fn((id: string) => ({ id })),
    } as unknown as Document;
    const context = {
      worldSettings: {
        graphWidth: 1000,
        graphHeight: 500,
      },
      pack: {
        cells: {
          p: { 4: [500, 250] },
          h: { 4: 30 },
          biome: { 4: 2 },
        },
      },
      grid: { cells: {} },
    } as unknown as EngineRuntimeContext;

    try {
      const targets = createRuntimeCanvasInteractionTargets(context);

      expect(targets.getCanvasFrame()).toMatchObject({
        id: "studioCanvasFrame",
      });
      expect(targets.getMapHost()).toMatchObject({ id: "studioMapHost" });
      expect(targets.getPaintPreviewAt).toEqual(expect.any(Function));
      expect(targets.getSelectionAt).toEqual(expect.any(Function));
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it("keeps runtime canvas DOM lookups safe when document is absent", () => {
    const originalDocument = globalThis.document;
    globalThis.document = undefined as unknown as Document;
    const context = {
      worldSettings: {
        graphWidth: 1000,
        graphHeight: 500,
      },
      pack: { cells: {} },
      grid: { cells: {} },
    } as unknown as EngineRuntimeContext;

    try {
      const targets = createRuntimeCanvasInteractionTargets(context);

      expect(targets.getCanvasFrame()).toBeNull();
      expect(targets.getMapHost()).toBeNull();
    } finally {
      globalThis.document = originalDocument;
    }
  });
});

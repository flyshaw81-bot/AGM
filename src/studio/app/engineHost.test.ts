import { describe, expect, it, vi } from "vitest";
import {
  ensureEngineDialogsContainer,
  ensureStudioRoot,
  preserveEngineNode,
  relocateEngineMapHost,
  syncEngineDialogsPosition,
} from "./engineHost";
import {
  createCompositeEngineHostDialogAdapter,
  createEngineHostTargets,
  createGlobalEngineHostDialogDomAdapter,
  createGlobalEngineHostDomAdapter,
  createGlobalEngineHostTargets,
  createJQueryEngineHostDialogAdapter,
  createStudioEngineHostDialogAdapter,
  type EngineHostTargets,
} from "./engineHostTargets";

function createElement(id = "") {
  const children = new Set<HTMLElement>();
  const element = {
    id,
    style: {} as CSSStyleDeclaration,
    dataset: {},
    appendChild: vi.fn((child: HTMLElement) => {
      children.add(child);
      return child;
    }),
    contains: vi.fn((child: HTMLElement) => children.has(child)),
    getBoundingClientRect: vi.fn(() => ({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
    })),
  } as unknown as HTMLElement;
  return { element, children };
}

function rect(
  left: number,
  top: number,
  right: number,
  bottom: number,
): DOMRect {
  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function createTargets(elements: Record<string, HTMLElement> = {}) {
  const appended: HTMLElement[] = [];
  const created: HTMLElement[] = [];
  const dialogs: HTMLElement[] = [];
  const targets: EngineHostTargets = {
    getElementById: (id) => elements[id] ?? null,
    createElement: vi.fn(() => {
      const { element } = createElement();
      created.push(element);
      return element;
    }),
    appendToBody: vi.fn((element) => {
      appended.push(element);
    }),
    queryDialogs: () => dialogs,
  };
  return { targets, appended, created, dialogs };
}

describe("engine host", () => {
  it("creates missing Studio root and dialogs container through targets", () => {
    const { targets, appended } = createTargets();

    const root = ensureStudioRoot(targets);
    const dialogs = ensureEngineDialogsContainer(targets);

    expect(root.id).toBe("studioRoot");
    expect(dialogs.id).toBe("dialogs");
    expect(appended).toEqual([root, dialogs]);
  });

  it("preserves engine nodes and relocates the map into the Studio host", () => {
    const { element: root, children: rootChildren } = createElement("root");
    const { element: map } = createElement("map");
    const { element: host } = createElement("studioMapHost");
    rootChildren.add(map);
    const { targets, appended } = createTargets({
      map,
      studioMapHost: host,
    });

    preserveEngineNode(root, "map", targets);
    relocateEngineMapHost(targets);

    expect(appended).toContain(map);
    expect(host.appendChild).toHaveBeenCalledWith(map);
  });

  it("clamps dialog positions inside the stage viewport", () => {
    const { element: stage } = createElement("studioStageViewport");
    stage.getBoundingClientRect = vi.fn(() =>
      rect(10, 20, 210, 220),
    ) as HTMLElement["getBoundingClientRect"];
    const { element: dialog } = createElement("dialog");
    dialog.style.left = "0px";
    dialog.style.top = "0px";
    dialog.getBoundingClientRect = vi.fn(() =>
      rect(0, 0, 80, 80),
    ) as HTMLElement["getBoundingClientRect"];
    const { targets, dialogs } = createTargets({
      studioStageViewport: stage,
    });
    dialogs.push(dialog);

    syncEngineDialogsPosition(targets);

    expect(dialog.style.left).toBe("18px");
    expect(dialog.style.top).toBe("28px");
  });

  it("combines injected DOM and dialog adapters for global host targets", () => {
    const { element: root } = createElement("studioRoot");
    const { element: dialog } = createElement("dialog");

    const targets = createEngineHostTargets(
      {
        getElementById: vi.fn(() => root),
        createElement: vi.fn(),
        appendToBody: vi.fn(),
      },
      {
        queryDialogs: vi.fn(() => [dialog]),
      },
    );

    expect(targets.getElementById("studioRoot")).toBe(root);
    expect(targets.queryDialogs()).toEqual([dialog]);
  });

  it("keeps the global host target factory compatible with injected adapters", () => {
    const { element: root } = createElement("studioRoot");
    const { element: dialog } = createElement("dialog");

    const targets = createGlobalEngineHostTargets(
      {
        getElementById: vi.fn(() => root),
        createElement: vi.fn(),
        appendToBody: vi.fn(),
      },
      {
        queryDialogs: vi.fn(() => [dialog]),
      },
    );

    expect(targets.getElementById("studioRoot")).toBe(root);
    expect(targets.queryDialogs()).toEqual([dialog]);
  });

  it("keeps old dialog wrapper queries inside the default dialog adapter", () => {
    const { element: dialog } = createElement("dialog");
    const domAdapter = {
      querySelectorAll: vi.fn(() => [dialog]),
    };

    const adapter = createJQueryEngineHostDialogAdapter(domAdapter);

    expect(adapter.queryDialogs()).toEqual([dialog]);
    expect(domAdapter.querySelectorAll).toHaveBeenCalledWith(
      "#dialogs > .ui-dialog",
    );
  });

  it("queries Studio-owned engine dialogs without jQuery UI selectors", () => {
    const { element: dialog } = createElement("dialog");
    const domAdapter = {
      querySelectorAll: vi.fn(() => [dialog]),
    };

    const adapter = createStudioEngineHostDialogAdapter(domAdapter);

    expect(adapter.queryDialogs()).toEqual([dialog]);
    expect(domAdapter.querySelectorAll).toHaveBeenCalledWith(
      "#dialogs > [data-agm-engine-dialog], #dialogs > [data-studio-engine-dialog]",
    );
  });

  it("deduplicates Studio and compatibility dialog query results", () => {
    const { element: studioDialog } = createElement("studio");
    const { element: compatibilityDialog } = createElement("compat");
    const adapter = createCompositeEngineHostDialogAdapter([
      { queryDialogs: () => [studioDialog, compatibilityDialog] },
      { queryDialogs: () => [compatibilityDialog] },
    ]);

    expect(adapter.queryDialogs()).toEqual([studioDialog, compatibilityDialog]);
  });

  it("keeps host dialog DOM queries inside the default DOM adapter", () => {
    const { element: dialog } = createElement("dialog");
    const querySelectorAll = vi.fn(() => [dialog]);
    const originalDocument = globalThis.document;
    globalThis.document = {
      querySelectorAll,
    } as unknown as Document;

    try {
      const adapter = createGlobalEngineHostDialogDomAdapter();

      expect(adapter.querySelectorAll("#dialogs > .ui-dialog")).toEqual([
        dialog,
      ]);
      expect(querySelectorAll).toHaveBeenCalledWith("#dialogs > .ui-dialog");
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it("keeps global host DOM adapter safe when document is absent", () => {
    const originalDocument = globalThis.document;
    globalThis.document = undefined as unknown as Document;

    try {
      const adapter = createGlobalEngineHostDomAdapter();
      const element = adapter.createElement("div");

      expect(adapter.getElementById("studioRoot")).toBeNull();
      expect(element.id).toBe("");
      expect(() => adapter.appendToBody(element)).not.toThrow();
    } finally {
      globalThis.document = originalDocument;
    }
  });
});

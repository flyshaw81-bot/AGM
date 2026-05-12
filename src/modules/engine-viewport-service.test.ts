import { describe, expect, it, vi } from "vitest";

import {
  createEngineViewportService,
  createEngineViewportSizeService,
  type EngineViewportTargets,
} from "./engine-viewport-service";

function createNode(
  options: {
    id?: string;
    dataset?: { size?: string };
    fontSize?: string;
    href?: string | null;
  } = {},
) {
  const hidden = new Set<string>();
  const attributes = new Map<string, string | number>();
  if (options.fontSize !== undefined)
    attributes.set("font-size", options.fontSize);

  return {
    id: options.id,
    dataset: options.dataset ?? {},
    children:
      options.href === undefined ? [] : [{ getAttribute: () => options.href }],
    classList: {
      add: vi.fn((name: string) => hidden.add(name)),
      remove: vi.fn((name: string) => hidden.delete(name)),
    },
    setAttribute: vi.fn((name: string, value: string | number) => {
      attributes.set(name, value);
    }),
    getAttribute: vi.fn((name: string) =>
      attributes.has(name) ? String(attributes.get(name)) : null,
    ),
    isHidden: () => hidden.has("hidden"),
    getAttributeValue: (name: string) => attributes.get(name),
  };
}

function createElement() {
  const attributes = new Map<string, string>();
  return {
    setAttribute: vi.fn((name: string, value: string) => {
      attributes.set(name, value);
    }),
    getAttributeValue: (name: string) => attributes.get(name),
  } as unknown as Element & {
    getAttributeValue: (name: string) => string | undefined;
  };
}

function createTargets(
  overrides: Partial<EngineViewportTargets> = {},
): EngineViewportTargets {
  return {
    getViewportSize: vi.fn(() => ({ svgWidth: 1000, svgHeight: 700 })),
    getScale: vi.fn(() => 2),
    getCustomization: vi.fn(() => 0),
    getShapeRenderingMode: vi.fn(() => "geometricPrecision"),
    createZoomTransform: vi.fn((x, y, scale) => ({ x, y, scale })),
    getIdentityTransform: vi.fn(() => ({ identity: true })),
    applyZoomTransform: vi.fn(),
    isCoastlineAutoFilterEnabled: vi.fn(() => false),
    setCoastlineFilter: vi.fn(),
    areLabelsVisible: vi.fn(() => false),
    forEachLabelGroup: vi.fn(),
    shouldRescaleLabels: vi.fn(() => true),
    shouldHideLabels: vi.fn(() => true),
    areEmblemsVisible: vi.fn(() => false),
    forEachEmblemGroup: vi.fn(),
    shouldHideEmblems: vi.fn(() => true),
    hasCoaRenderer: vi.fn(() => true),
    renderGroupCOAs: vi.fn(),
    getStatesHaloWidth: vi.fn(() => 4),
    setStatesHalo: vi.fn(),
    shouldRescaleMarkers: vi.fn(() => false),
    getMarkers: vi.fn(() => []),
    getElementById: vi.fn(() => null),
    isRulerVisible: vi.fn(() => false),
    setRulerTextSize: vi.fn(),
    round: vi.fn((value, digits = 0) => Number(value.toFixed(digits))),
    ...overrides,
  };
}

describe("engine viewport service", () => {
  it("zooms to a point using viewport-centered transform math", () => {
    const targets = createTargets();
    const service = createEngineViewportService(targets);

    service.zoomTo(100, 50, 4, 1600);

    expect(targets.createZoomTransform).toHaveBeenCalledWith(100, 150, 4);
    expect(targets.applyZoomTransform).toHaveBeenCalledWith(
      { x: 100, y: 150, scale: 4 },
      1600,
    );
  });

  it("resets zoom to identity transform", () => {
    const targets = createTargets();
    const service = createEngineViewportService(targets);

    service.resetZoom(250);

    expect(targets.applyZoomTransform).toHaveBeenCalledWith(
      { identity: true },
      250,
    );
  });

  it("updates zoom-sensitive labels, halo, markers, and ruler", () => {
    const label = createNode({ dataset: { size: "12" } });
    const burgLabel = createNode({ id: "burgLabels", dataset: { size: "12" } });
    const markerElement = createElement();
    const targets = createTargets({
      areLabelsVisible: vi.fn(() => true),
      forEachLabelGroup: vi.fn((callback) => {
        callback(label);
        callback(burgLabel);
      }),
      shouldRescaleMarkers: vi.fn(() => true),
      getMarkers: vi.fn(() => [{ i: 7, x: 80, y: 100, size: 30 }]),
      getElementById: vi.fn(() => markerElement),
      isRulerVisible: vi.fn(() => true),
    });
    const service = createEngineViewportService(targets);

    service.invokeActiveZooming();

    expect(label.setAttribute).toHaveBeenCalledWith("font-size", 9);
    expect(burgLabel.setAttribute).not.toHaveBeenCalled();
    expect(targets.setStatesHalo).toHaveBeenCalledWith(2.3, "block");
    expect(markerElement.getAttributeValue("width")).toBe("18");
    expect(markerElement.getAttributeValue("height")).toBe("18");
    expect(markerElement.getAttributeValue("x")).toBe("71");
    expect(markerElement.getAttributeValue("y")).toBe("82");
    expect(targets.setRulerTextSize).toHaveBeenCalledWith(16.25);
  });

  it("applies coastline filter thresholds and renders missing COAs", () => {
    const emblem = createNode({ fontSize: "20", href: null });
    const targets = createTargets({
      getScale: vi.fn(() => 3),
      isCoastlineAutoFilterEnabled: vi.fn(() => true),
      areEmblemsVisible: vi.fn(() => true),
      forEachEmblemGroup: vi.fn((callback) => callback(emblem)),
    });
    const service = createEngineViewportService(targets);

    service.invokeActiveZooming();

    expect(targets.setCoastlineFilter).toHaveBeenCalledWith("url(#blurFilter)");
    expect(targets.renderGroupCOAs).toHaveBeenCalledWith(emblem);
    expect(emblem.isHidden()).toBe(false);
  });
});

describe("engine viewport size service", () => {
  it("syncs Studio viewport size to local and runtime stores", () => {
    const targets = {
      setLocalViewportSize: vi.fn(),
      setRuntimeViewportSize: vi.fn(),
    };
    const service = createEngineViewportSizeService(targets);

    service.setStudioViewportSize(1440, 900);

    expect(targets.setLocalViewportSize).toHaveBeenCalledWith(1440, 900);
    expect(targets.setRuntimeViewportSize).toHaveBeenCalledWith(1440, 900);
  });

  it("mounts the legacy-compatible Studio viewport entrypoint through the service", () => {
    const service = createEngineViewportSizeService({
      setLocalViewportSize: vi.fn(),
      setRuntimeViewportSize: vi.fn(),
    });
    const runtime = {} as Pick<Window, "setStudioViewportSize">;

    service.mountGlobalEntry(runtime);

    expect(runtime.setStudioViewportSize).toBe(service.setStudioViewportSize);
  });
});

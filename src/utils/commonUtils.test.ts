import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type BrowserBlobReaderTargets,
  type BrowserEnvironmentTargets,
  type BrowserNavigationTargets,
  clipPoly,
  createGlobalBrowserBlobReaderTargets,
  createGlobalBrowserEnvironmentTargets,
  createGlobalBrowserNavigationTargets,
  createGlobalStudioInputPromptTargets,
  createGlobalUtilityWarningTargets,
  getBase64,
  getCoordinates,
  getLatitude,
  getLongitude,
  initializePrompt,
  openURL,
  parseError,
  type StudioInputPromptTargets,
  type StudioInputRequest,
  type UtilityWarningTargets,
  wiki,
} from "./commonUtils";

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
const originalNavigator = globalThis.navigator;
const originalXMLHttpRequest = globalThis.XMLHttpRequest;
const originalFileReader = globalThis.FileReader;

afterEach(() => {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument,
    writable: true,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
    writable: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: originalNavigator,
    writable: true,
  });
  Object.defineProperty(globalThis, "XMLHttpRequest", {
    configurable: true,
    value: originalXMLHttpRequest,
    writable: true,
  });
  Object.defineProperty(globalThis, "FileReader", {
    configurable: true,
    value: originalFileReader,
    writable: true,
  });
});

describe("getLongitude", () => {
  const mapCoordinates = { lonW: -10, lonT: 20 };
  const graphWidth = 1000;

  it("should calculate longitude at the left edge (x=0)", () => {
    expect(getLongitude(0, mapCoordinates, graphWidth, 2)).toBe(-10);
  });

  it("should calculate longitude at the right edge (x=graphWidth)", () => {
    expect(getLongitude(1000, mapCoordinates, graphWidth, 2)).toBe(10);
  });

  it("should calculate longitude at the center (x=graphWidth/2)", () => {
    expect(getLongitude(500, mapCoordinates, graphWidth, 2)).toBe(0);
  });

  it("should respect decimal precision", () => {
    // 333/1000 * 20 = 6.66, -10 + 6.66 = -3.34
    expect(getLongitude(333, mapCoordinates, graphWidth, 4)).toBe(-3.34);
  });

  it("should handle different map coordinate ranges", () => {
    const wideMap = { lonW: -180, lonT: 360 };
    expect(getLongitude(500, wideMap, graphWidth, 2)).toBe(0);
    expect(getLongitude(0, wideMap, graphWidth, 2)).toBe(-180);
    expect(getLongitude(1000, wideMap, graphWidth, 2)).toBe(180);
  });
});

describe("getLatitude", () => {
  const mapCoordinates = { latN: 60, latT: 40 };
  const graphHeight = 800;

  it("should calculate latitude at the top edge (y=0)", () => {
    expect(getLatitude(0, mapCoordinates, graphHeight, 2)).toBe(60);
  });

  it("should calculate latitude at the bottom edge (y=graphHeight)", () => {
    expect(getLatitude(800, mapCoordinates, graphHeight, 2)).toBe(20);
  });

  it("should calculate latitude at the center (y=graphHeight/2)", () => {
    expect(getLatitude(400, mapCoordinates, graphHeight, 2)).toBe(40);
  });

  it("should respect decimal precision", () => {
    // 60 - (333/800 * 40) = 60 - 16.65 = 43.35
    expect(getLatitude(333, mapCoordinates, graphHeight, 4)).toBe(43.35);
  });

  it("should handle equator-centered maps", () => {
    const equatorMap = { latN: 45, latT: 90 };
    expect(getLatitude(400, equatorMap, graphHeight, 2)).toBe(0);
  });
});

describe("getCoordinates", () => {
  const mapCoordinates = { lonW: -10, lonT: 20, latN: 60, latT: 40 };
  const graphWidth = 1000;
  const graphHeight = 800;

  it("should return [longitude, latitude] tuple", () => {
    const result = getCoordinates(
      500,
      400,
      mapCoordinates,
      graphWidth,
      graphHeight,
      2,
    );
    expect(result).toEqual([0, 40]);
  });

  it("should calculate coordinates at top-left corner", () => {
    const result = getCoordinates(
      0,
      0,
      mapCoordinates,
      graphWidth,
      graphHeight,
      2,
    );
    expect(result).toEqual([-10, 60]);
  });

  it("should calculate coordinates at bottom-right corner", () => {
    const result = getCoordinates(
      1000,
      800,
      mapCoordinates,
      graphWidth,
      graphHeight,
      2,
    );
    expect(result).toEqual([10, 20]);
  });

  it("should respect decimal precision for both coordinates", () => {
    const result = getCoordinates(
      333,
      333,
      mapCoordinates,
      graphWidth,
      graphHeight,
      4,
    );
    expect(result[0]).toBe(-3.34); // longitude
    expect(result[1]).toBe(43.35); // latitude
  });

  it("should use default precision of 2 decimals", () => {
    const result = getCoordinates(
      333,
      333,
      mapCoordinates,
      graphWidth,
      graphHeight,
    );
    expect(result[0]).toBe(-3.34);
    expect(result[1]).toBe(43.35);
  });

  it("should handle global map coordinates", () => {
    const globalMap = { lonW: -180, lonT: 360, latN: 90, latT: 180 };
    const result = getCoordinates(
      500,
      400,
      globalMap,
      graphWidth,
      graphHeight,
      2,
    );
    expect(result).toEqual([0, 0]); // center of the world
  });
});

describe("parseError", () => {
  it("uses injected browser environment targets for Firefox stack parsing", () => {
    const targets: BrowserEnvironmentTargets = {
      getUserAgent: vi.fn(() => "Mozilla/5.0 Firefox/120.0"),
    };
    const error = new Error("Broken map");
    error.stack = "open file:///D:/AGM/AGM-Studio/src/map.ts";

    const parsed = parseError(error, targets);

    expect(targets.getUserAgent).toHaveBeenCalled();
    expect(parsed).toContain("Error: Broken map");
    expect(parsed).toContain("<i>map.ts</i>");
  });

  it("keeps global browser environment targets safe when navigator access throws", () => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      get: () => {
        throw new Error("navigator blocked");
      },
    });
    const targets = createGlobalBrowserEnvironmentTargets();

    expect(targets.getUserAgent()).toBe("");
    expect(parseError(new Error("Broken map"), targets)).toContain(
      "Error: Broken map",
    );
  });
});

describe("clipPoly", () => {
  it("reports undefined points through injected warning targets", () => {
    const targets: UtilityWarningTargets = {
      isErrorEnabled: vi.fn(() => true),
      warnUndefinedPoint: vi.fn(),
    };
    const points = [[1, 1], undefined, [2, 2]] as unknown as [number, number][];

    const result = clipPoly(points, 100, 100, targets);

    expect(result).toBe(points);
    expect(targets.warnUndefinedPoint).toHaveBeenCalledWith(points);
  });

  it("keeps global warning targets safe when window access throws", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    expect(createGlobalUtilityWarningTargets().isErrorEnabled()).toBe(false);
  });
});

describe("browser compatibility helpers", () => {
  it("reads URL data through injected blob reader targets", () => {
    const blob = new Blob(["map"]);
    const callback = vi.fn();
    const targets: BrowserBlobReaderTargets = {
      requestBlob: vi.fn((_url, onBlob) => onBlob(blob)),
      readAsDataURL: vi.fn((_blob, onResult) =>
        onResult("data:text/plain;base64,bWFw"),
      ),
    };

    getBase64("map.svg", callback, targets);

    expect(targets.requestBlob).toHaveBeenCalledWith(
      "map.svg",
      expect.any(Function),
    );
    expect(targets.readAsDataURL).toHaveBeenCalledWith(
      blob,
      expect.any(Function),
    );
    expect(callback).toHaveBeenCalledWith("data:text/plain;base64,bWFw");
  });

  it("opens external and wiki URLs through injected navigation targets", () => {
    const targets: BrowserNavigationTargets = {
      open: vi.fn(),
    };

    openURL("https://example.test", targets);
    wiki("map-layers", targets);

    expect(targets.open).toHaveBeenNthCalledWith(
      1,
      "https://example.test",
      "_blank",
    );
    expect(targets.open).toHaveBeenNthCalledWith(
      2,
      "docs/map-layers",
      "_blank",
    );
  });

  it("keeps global blob reader targets safe when browser constructors are absent", () => {
    Object.defineProperty(globalThis, "XMLHttpRequest", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    Object.defineProperty(globalThis, "FileReader", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    const targets = createGlobalBrowserBlobReaderTargets();
    const callback = vi.fn();

    getBase64("map.svg", callback, targets);

    expect(callback).toHaveBeenCalledWith(null);
  });

  it("keeps global navigation targets safe when window access throws", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    const targets = createGlobalBrowserNavigationTargets();

    expect(() => openURL("https://example.test", targets)).not.toThrow();
    expect(() => wiki("map-layers", targets)).not.toThrow();
  });
});

describe("initializePrompt", () => {
  it("installs Studio input through injected prompt targets", () => {
    let installedRequest: StudioInputRequest | undefined;
    const addKeydownListener = vi.fn();
    const removeKeydownListener = vi.fn();
    const appendToBody = vi.fn();
    const removeElement = vi.fn();
    const callback = vi.fn();

    const form = {
      onsubmit: undefined as ((event: Event) => void) | undefined,
    } as unknown as HTMLFormElement;
    const input = {
      type: "",
      step: "",
      min: "",
      max: "",
      required: false,
      placeholder: "",
      value: "",
      focus: vi.fn(),
      select: vi.fn(),
    } as unknown as HTMLInputElement;
    const label = {
      innerHTML: "",
    } as HTMLElement;
    const cancelButton = {
      addEventListener: vi.fn(),
    } as unknown as HTMLElement;
    const dialog = {
      id: "",
      className: "",
      style: { display: "" },
      innerHTML: "",
      setAttribute: vi.fn(),
      querySelector: vi.fn((selector: string) => {
        if (selector === "#studioInputForm") return form;
        if (selector === "#studioInputValue") return input;
        if (selector === "#studioInputDialogTitle") return label;
        return null;
      }),
      querySelectorAll: vi.fn(() => [cancelButton]),
    } as unknown as HTMLElement;

    const targets: StudioInputPromptTargets = {
      getElementById: vi.fn(() => null),
      createElement: vi.fn(() => dialog),
      appendToBody,
      addKeydownListener,
      removeKeydownListener,
      removeElement,
      installRequest: vi.fn((request) => {
        installedRequest = request;
      }),
      isErrorEnabled: vi.fn(() => false),
    };

    initializePrompt(targets);
    installedRequest?.("Scale value", { default: 2, min: 1, max: 5 }, callback);
    form.onsubmit?.({ preventDefault: vi.fn() } as unknown as SubmitEvent);

    expect(removeElement).toHaveBeenCalledWith("prompt");
    expect(targets.createElement).toHaveBeenCalledWith("div");
    expect(appendToBody).toHaveBeenCalledWith(dialog);
    expect(label.innerHTML).toBe("Scale value");
    expect(input.type).toBe("number");
    expect(input.min).toBe("1");
    expect(input.max).toBe("5");
    expect(addKeydownListener).toHaveBeenCalledTimes(1);
    expect(removeKeydownListener).toHaveBeenCalledTimes(1);
    expect(input.focus).toHaveBeenCalled();
    expect(input.select).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(2);
  });

  it("keeps global Studio input targets safe when document and window access throw", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    const targets = createGlobalStudioInputPromptTargets();

    expect(() => initializePrompt(targets)).not.toThrow();
    expect(targets.getElementById("studioInputDialog")).toBeNull();
    expect(targets.isErrorEnabled()).toBe(false);
  });
});

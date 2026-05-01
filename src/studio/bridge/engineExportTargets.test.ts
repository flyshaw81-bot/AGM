import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineExportTargets,
  createGlobalEngineExportTargets,
} from "./engineExportTargets";

type TestExportGlobals = typeof globalThis & {
  exportToSvg?: () => void;
  exportToPng?: () => void;
};

const testGlobals = globalThis as TestExportGlobals;
const originalDocument = globalThis.document;
const originalEvent = globalThis.Event;
const originalExportToSvg = testGlobals.exportToSvg;
const originalExportToPng = testGlobals.exportToPng;

describe("createGlobalEngineExportTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.Event = originalEvent;
    testGlobals.exportToSvg = originalExportToSvg;
    testGlobals.exportToPng = originalExportToPng;
  });

  it("reads and writes export setting inputs from the active document", () => {
    const inputEvents: string[] = [];
    const inputs: Record<
      string,
      { value: string; dispatchEvent: (event: Event) => void }
    > = {
      pngResolutionInput: {
        value: "2",
        dispatchEvent: (event) => inputEvents.push(event.type),
      },
      tileColsOutput: {
        value: "6",
        dispatchEvent: (event) => inputEvents.push(event.type),
      },
    };
    globalThis.document = {
      getElementById: vi.fn((id) => inputs[id] ?? null),
    } as unknown as Document;

    const targets = createGlobalEngineExportTargets();

    expect(targets.readSetting("png-resolution", 1)).toBe(2);
    expect(targets.readSetting("tile-rows", 8)).toBe(8);
    targets.writeSetting("tile-cols", 12);

    expect(inputs.tileColsOutput.value).toBe("12");
    expect(inputEvents).toEqual(["input", "change"]);
  });

  it("keeps export setting writes safe when Event is absent", () => {
    const input = {
      value: "6",
      dispatchEvent: vi.fn(),
    };
    globalThis.Event = undefined as unknown as typeof Event;
    globalThis.document = {
      getElementById: vi.fn((id) => (id === "tileColsOutput" ? input : null)),
    } as unknown as Document;

    createGlobalEngineExportTargets().writeSetting("tile-cols", 12);

    expect(input.value).toBe("12");
    expect(input.dispatchEvent).not.toHaveBeenCalled();
  });

  it("forwards export format calls to the active runtime", () => {
    const exportToSvg = vi.fn();
    testGlobals.exportToSvg = exportToSvg;
    testGlobals.exportToPng = undefined;

    const targets = createGlobalEngineExportTargets();

    expect(targets.canExport("svg")).toBe(true);
    expect(targets.canExport("png")).toBe(false);
    targets.runExport("svg");

    expect(exportToSvg).toHaveBeenCalledWith();
  });

  it("composes export targets from injected settings and runtime adapters", () => {
    const writeSetting = vi.fn();
    const runExport = vi.fn();
    const targets = createEngineExportTargets(
      {
        readSetting: (setting, fallback) =>
          setting === "tile-scale" ? 4 : fallback,
        writeSetting,
      },
      {
        canExport: (format) => format === "jpeg",
        runExport,
      },
    );

    expect(targets.readSetting("tile-scale", 1)).toBe(4);
    expect(targets.readSetting("tile-cols", 3)).toBe(3);
    targets.writeSetting("tile-rows", 8);
    expect(writeSetting).toHaveBeenCalledWith("tile-rows", 8);
    expect(targets.canExport("jpeg")).toBe(true);
    expect(targets.canExport("svg")).toBe(false);
    targets.runExport("jpeg");
    expect(runExport).toHaveBeenCalledWith("jpeg");
  });
});

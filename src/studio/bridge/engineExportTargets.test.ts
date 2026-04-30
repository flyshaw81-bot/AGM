import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalEngineExportTargets } from "./engineExportTargets";

type TestExportGlobals = typeof globalThis & {
  exportToSvg?: () => void;
  exportToPng?: () => void;
};

const testGlobals = globalThis as TestExportGlobals;
const originalDocument = globalThis.document;
const originalExportToSvg = testGlobals.exportToSvg;
const originalExportToPng = testGlobals.exportToPng;

describe("createGlobalEngineExportTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
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
});

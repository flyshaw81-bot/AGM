import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalProjectActionTargets } from "./engineProjectActionTargets";

type TestActionGlobals = typeof globalThis & {
  applyOption?: (
    select: HTMLSelectElement,
    value: string,
    label: string,
  ) => void;
  heightmapTemplates?: Record<string, { name?: string }>;
  precreatedHeightmaps?: Record<string, { name?: string }>;
};

const testGlobals = globalThis as TestActionGlobals;
const originalDocument = globalThis.document;
const originalApplyOption = testGlobals.applyOption;
const originalHeightmapTemplates = testGlobals.heightmapTemplates;
const originalPrecreatedHeightmaps = testGlobals.precreatedHeightmaps;
const originalOption = globalThis.Option;

describe("createGlobalProjectActionTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    testGlobals.applyOption = originalApplyOption;
    testGlobals.heightmapTemplates = originalHeightmapTemplates;
    testGlobals.precreatedHeightmaps = originalPrecreatedHeightmaps;
    globalThis.Option = originalOption;
  });

  it("resolves form controls and clicks elements from the active document", () => {
    const input = {};
    const button = { click: vi.fn() };
    globalThis.document = {
      getElementById: vi.fn((id) =>
        id === "pointsInput" ? input : id === "optionsCopySeed" ? button : null,
      ),
    } as unknown as Document;

    const targets = createGlobalProjectActionTargets();

    expect(targets.getInput("pointsInput")).toBe(input);
    targets.clickElement("optionsCopySeed");
    expect(button.click).toHaveBeenCalledWith();
  });

  it("dispatches form events through DOM events", () => {
    const dispatchEvent = vi.fn();
    const element = { dispatchEvent } as unknown as HTMLElement;

    createGlobalProjectActionTargets().dispatchInputAndChange(element);

    expect(dispatchEvent).toHaveBeenCalledTimes(2);
  });

  it("forwards applyOption and resolves template labels from current globals", () => {
    const applyOption = vi.fn();
    testGlobals.applyOption = applyOption;
    testGlobals.heightmapTemplates = {
      volcano: { name: "Volcano" },
    };
    const select = {} as HTMLSelectElement;

    const targets = createGlobalProjectActionTargets();

    expect(targets.applyOption(select, "volcano", "Volcano")).toBe(true);
    expect(applyOption).toHaveBeenCalledWith(select, "volcano", "Volcano");
    expect(targets.getTemplateLabel("volcano")).toBe("Volcano");
  });

  it("adds select options with the browser Option constructor", () => {
    const add = vi.fn();
    globalThis.Option = function Option(label: string, value: string) {
      return { textContent: label, value } as HTMLOptionElement;
    } as unknown as typeof Option;
    const select = {
      options: { add },
    } as unknown as HTMLSelectElement;

    createGlobalProjectActionTargets().addSelectOption(
      select,
      "Custom",
      "custom",
    );

    expect(add).toHaveBeenCalledWith({
      textContent: "Custom",
      value: "custom",
    });
  });
});

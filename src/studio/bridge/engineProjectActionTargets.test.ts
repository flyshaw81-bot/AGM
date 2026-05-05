import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalProjectActionTargets,
  createProjectActionTargets,
} from "./engineProjectActionTargets";

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
const originalEvent = globalThis.Event;
const originalApplyOption = testGlobals.applyOption;
const originalHeightmapTemplates = testGlobals.heightmapTemplates;
const originalPrecreatedHeightmaps = testGlobals.precreatedHeightmaps;
const originalOption = globalThis.Option;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalEventDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Event",
);
const originalApplyOptionDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "applyOption",
);
const originalHeightmapTemplatesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "heightmapTemplates",
);
const originalPrecreatedHeightmapsDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "precreatedHeightmaps",
);
const originalOptionDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Option",
);
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

describe("createGlobalProjectActionTargets", () => {
  afterEach(() => {
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
    } else {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        writable: true,
        value: originalDocument,
      });
    }
    if (originalEventDescriptor) {
      Object.defineProperty(globalThis, "Event", originalEventDescriptor);
    } else {
      Object.defineProperty(globalThis, "Event", {
        configurable: true,
        writable: true,
        value: originalEvent,
      });
    }
    if (originalApplyOptionDescriptor) {
      Object.defineProperty(
        globalThis,
        "applyOption",
        originalApplyOptionDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "applyOption", {
        configurable: true,
        writable: true,
        value: originalApplyOption,
      });
    }
    if (originalHeightmapTemplatesDescriptor) {
      Object.defineProperty(
        globalThis,
        "heightmapTemplates",
        originalHeightmapTemplatesDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "heightmapTemplates", {
        configurable: true,
        writable: true,
        value: originalHeightmapTemplates,
      });
    }
    if (originalPrecreatedHeightmapsDescriptor) {
      Object.defineProperty(
        globalThis,
        "precreatedHeightmaps",
        originalPrecreatedHeightmapsDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "precreatedHeightmaps", {
        configurable: true,
        writable: true,
        value: originalPrecreatedHeightmaps,
      });
    }
    if (originalOptionDescriptor) {
      Object.defineProperty(globalThis, "Option", originalOptionDescriptor);
    } else {
      Object.defineProperty(globalThis, "Option", {
        configurable: true,
        writable: true,
        value: originalOption,
      });
    }
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
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

  it("keeps form dispatch helpers safe when Event is absent", () => {
    const dispatchEvent = vi.fn();
    const element = { dispatchEvent } as unknown as HTMLElement;
    globalThis.Event = undefined as unknown as typeof Event;
    const targets = createGlobalProjectActionTargets();

    expect(() => targets.dispatchInputAndChange(element)).not.toThrow();
    expect(() => targets.dispatchChange(element)).not.toThrow();
    expect(dispatchEvent).not.toHaveBeenCalled();
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

  it("keeps select option writes safe when Option is absent", () => {
    const add = vi.fn();
    globalThis.Option = undefined as unknown as typeof Option;
    const select = {
      options: { add },
    } as unknown as HTMLSelectElement;

    expect(() =>
      createGlobalProjectActionTargets().addSelectOption(
        select,
        "Custom",
        "custom",
      ),
    ).not.toThrow();
    expect(add).not.toHaveBeenCalled();
  });

  it("keeps default project action targets safe when browser globals throw", () => {
    const dispatchEvent = vi.fn(() => {
      throw new Error("dispatch blocked");
    });
    const select = {
      options: {
        get length() {
          throw new Error("options blocked");
        },
        add: () => {
          throw new Error("select add blocked");
        },
      },
    } as unknown as HTMLSelectElement;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "Event", {
      configurable: true,
      value: function Event() {
        return {} as Event;
      },
    });
    Object.defineProperty(globalThis, "Option", {
      configurable: true,
      value: function Option(label: string, value: string) {
        return { textContent: label, value } as HTMLOptionElement;
      },
    });
    Object.defineProperty(globalThis, "applyOption", {
      configurable: true,
      get: () => {
        throw new Error("applyOption blocked");
      },
    });
    Object.defineProperty(globalThis, "heightmapTemplates", {
      configurable: true,
      get: () => {
        throw new Error("templates blocked");
      },
    });

    const targets = createGlobalProjectActionTargets();

    expect(targets.getInput("pointsInput")).toBeNull();
    expect(targets.getOutput("pointsOutput")).toBeNull();
    expect(targets.getSelect("templateInput")).toBeNull();
    expect(() => targets.clickElement("optionsCopySeed")).not.toThrow();
    expect(() =>
      targets.dispatchInputAndChange({
        dispatchEvent,
      } as unknown as HTMLElement),
    ).not.toThrow();
    expect(targets.findSelectOption(select, "volcano")).toBeUndefined();
    expect(() =>
      targets.addSelectOption(select, "Custom", "custom"),
    ).not.toThrow();
    expect(targets.applyOption(select, "volcano", "Volcano")).toBe(false);
    expect(targets.getTemplateLabel("volcano")).toBe("volcano");
  });

  it("composes project action targets from injected adapters", () => {
    const input = {} as HTMLInputElement;
    const output = {} as HTMLOutputElement;
    const select = {
      options: [{ value: "volcano" }],
    } as unknown as HTMLSelectElement;
    const clickElement = vi.fn();
    const dispatchInputAndChange = vi.fn();
    const dispatchChange = vi.fn();
    const addSelectOption = vi.fn();
    const applyOption = vi.fn(() => true);
    const targets = createProjectActionTargets(
      {
        getInput: (id) => (id === "pointsInput" ? input : null),
        getOutput: (id) => (id === "pointsOutput" ? output : null),
        getSelect: (id) => (id === "templateInput" ? select : null),
        clickElement,
        dispatchInputAndChange,
        dispatchChange,
      },
      {
        findSelectOption: (currentSelect, value) =>
          Array.from(currentSelect.options).find(
            (option) => option.value === value,
          ),
        addSelectOption,
      },
      {
        applyOption,
        getTemplateLabel: (template) =>
          template === "volcano" ? "Volcano" : template,
      },
    );

    expect(targets.getInput("pointsInput")).toBe(input);
    expect(targets.getOutput("pointsOutput")).toBe(output);
    expect(targets.getSelect("templateInput")).toBe(select);
    targets.clickElement("optionsCopySeed");
    expect(clickElement).toHaveBeenCalledWith("optionsCopySeed");
    targets.dispatchInputAndChange(input);
    expect(dispatchInputAndChange).toHaveBeenCalledWith(input);
    expect(targets.findSelectOption(select, "volcano")?.value).toBe("volcano");
    targets.addSelectOption(select, "Custom", "custom");
    expect(addSelectOption).toHaveBeenCalledWith(select, "Custom", "custom");
    expect(targets.applyOption(select, "volcano", "Volcano")).toBe(true);
    expect(applyOption).toHaveBeenCalledWith(select, "volcano", "Volcano");
    expect(targets.getTemplateLabel("volcano")).toBe("Volcano");
  });
});

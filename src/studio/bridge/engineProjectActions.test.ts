import { describe, expect, it, vi } from "vitest";
import {
  runEngineProjectAction,
  setEngineAutosaveInterval,
  setEnginePendingBurgs,
  setEnginePendingTemplate,
} from "./engineProjectActions";
import type { EngineProjectActionTargets } from "./engineProjectActionTargets";

function createInput(
  value = "",
  bounds: Partial<Pick<HTMLInputElement, "min" | "max">> = {},
) {
  return {
    value,
    min: bounds.min ?? "",
    max: bounds.max ?? "",
  } as HTMLInputElement;
}

function createSelect(options: Array<{ value: string; label: string }> = []) {
  const optionItems = options.map(({ value, label }) => ({
    value,
    textContent: label,
  })) as HTMLOptionElement[];
  return {
    value: "",
    options: {
      add: vi.fn((option: HTMLOptionElement) => optionItems.push(option)),
      [Symbol.iterator]: function* () {
        yield* optionItems;
      },
      length: optionItems.length,
    },
  } as unknown as HTMLSelectElement;
}

function createTargets(
  overrides: Partial<EngineProjectActionTargets> = {},
): EngineProjectActionTargets {
  return {
    getInput: vi.fn(() => null),
    getOutput: vi.fn(() => null),
    getSelect: vi.fn(() => null),
    clickElement: vi.fn(),
    dispatchInputAndChange: vi.fn(),
    dispatchChange: vi.fn(),
    findSelectOption: vi.fn((select, value) =>
      (Array.from(select.options) as HTMLOptionElement[]).find(
        (option) => option.value === value,
      ),
    ),
    addSelectOption: vi.fn((select, label, value) => {
      select.options.add({ value, textContent: label } as HTMLOptionElement);
    }),
    applyOption: vi.fn(() => false),
    getTemplateLabel: vi.fn((template) => template),
    ...overrides,
  };
}

describe("engine project actions", () => {
  it("clamps and dispatches autosave interval inputs", () => {
    const output = createInput();
    const input = createInput();
    const targets = createTargets({
      getInput: vi.fn((id) =>
        id === "autosaveIntervalOutput"
          ? output
          : id === "autosaveIntervalInput"
            ? input
            : null,
      ),
    });

    setEngineAutosaveInterval(99, targets);

    expect(output.value).toBe("60");
    expect(input.value).toBe("60");
    expect(targets.dispatchInputAndChange).toHaveBeenCalledTimes(2);
  });

  it("updates burg count output label when the automatic value is selected", () => {
    const manorsInput = createInput("", { min: "0", max: "1000" });
    const manorsOutput = { value: "" } as HTMLOutputElement;
    const targets = createTargets({
      getInput: vi.fn((id) => (id === "manorsInput" ? manorsInput : null)),
      getOutput: vi.fn((id) => (id === "manorsOutput" ? manorsOutput : null)),
    });

    setEnginePendingBurgs(2000, targets);

    expect(manorsInput.value).toBe("1000");
    expect(manorsOutput.value).toBe("auto");
  });

  it("clicks mapped project action buttons through targets", () => {
    const targets = createTargets();

    runEngineProjectAction("copy-seed-url", targets);

    expect(targets.clickElement).toHaveBeenCalledWith("optionsCopySeed");
  });

  it("uses applyOption for pending templates when available", () => {
    const select = createSelect([{ value: "volcano", label: "Volcano" }]);
    const targets = createTargets({
      getSelect: vi.fn(() => select),
      applyOption: vi.fn(() => true),
    });

    setEnginePendingTemplate("volcano", targets);

    expect(targets.applyOption).toHaveBeenCalledWith(
      select,
      "volcano",
      "Volcano",
    );
    expect(targets.dispatchInputAndChange).toHaveBeenCalledWith(select);
  });

  it("adds a missing pending template when applyOption is unavailable", () => {
    const select = createSelect();
    const targets = createTargets({
      getSelect: vi.fn(() => select),
      getTemplateLabel: vi.fn(() => "Custom Template"),
    });

    setEnginePendingTemplate("custom", targets);

    expect(targets.addSelectOption).toHaveBeenCalledWith(
      select,
      "Custom Template",
      "custom",
    );
    expect(select.value).toBe("custom");
  });
});

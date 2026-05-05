import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type EmblemGeneratorModuleType from "./generator";
import type {
  EmblemRuntimeTargets,
  EmblemShapeDomTargets,
  EmblemShapeTargets,
} from "./generator";
import {
  createEmblemShapeTargets,
  createGlobalEmblemRuntimeTargets,
  createGlobalEmblemShapeTargets,
} from "./generator";

const originalPack = globalThis.pack;
const originalDocument = globalThis.document;
const originalError = globalThis.ERROR;
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
let EmblemGeneratorModule: typeof EmblemGeneratorModuleType;

function createEmblemGenerator(
  targets: EmblemShapeTargets,
  runtimeTargets?: EmblemRuntimeTargets,
) {
  return new EmblemGeneratorModule(targets, runtimeTargets);
}

function setPack() {
  globalThis.pack = {
    states: [{ i: 0 }, { i: 1, coa: { shield: "state-heater" } }],
    cultures: [{ i: 0 }, { i: 1, shield: "culture-round" }],
  } as typeof pack;
}

describe("EmblemGeneratorModule", () => {
  beforeAll(async () => {
    EmblemGeneratorModule = (await import("./generator")).default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, "pack", {
      configurable: true,
      value: originalPack,
      writable: true,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    Object.defineProperty(globalThis, "ERROR", {
      configurable: true,
      value: originalError,
      writable: true,
    });
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    }
  });

  it("can be imported when window access throws", async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./generator")).resolves.toBeDefined();
  });

  it("uses an injected fixed shield shape without reading document", () => {
    const generator = createEmblemGenerator({
      getSelectedShape: () => ({ value: "kite", group: "Medieval" }),
    });

    expect(generator.getShield(1, 1)).toBe("kite");
  });

  it("reads selected shield shape through injected DOM targets", () => {
    const domTargets: EmblemShapeDomTargets = {
      getElementById: () =>
        ({
          value: "lozenge",
          selectedOptions: [
            {
              parentElement: {
                getAttribute: () => "Modern",
              },
            },
          ],
        }) as unknown as Element,
    };
    const generator = createEmblemGenerator(
      createEmblemShapeTargets(domTargets),
    );

    expect(generator.getShield(1, 1)).toBe("lozenge");
  });

  it("keeps global shape targets safe when document is absent", () => {
    globalThis.document = undefined as unknown as Document;

    expect(createGlobalEmblemShapeTargets().getSelectedShape()).toBeNull();
  });

  it("keeps global shape targets safe when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    expect(createGlobalEmblemShapeTargets().getSelectedShape()).toBeNull();
  });

  it("uses state shield fallback through injected shape selection", () => {
    setPack();
    const generator = createEmblemGenerator({
      getSelectedShape: () => ({ value: "state", group: "Diversiform" }),
    });

    expect(generator.getShield(1, 1)).toBe("state-heater");
  });

  it("uses culture shield when diversiform selection is not state-specific", () => {
    setPack();
    const generator = createEmblemGenerator({
      getSelectedShape: () => ({ value: "culture", group: "Diversiform" }),
    });

    expect(generator.getShield(1, 1)).toBe("culture-round");
  });

  it("uses injected runtime shield targets without reading the global pack", () => {
    globalThis.pack = undefined as unknown as typeof pack;
    const runtimeTargets: EmblemRuntimeTargets = {
      getStateShield: vi.fn(() => undefined),
      getCultureShield: vi.fn(() => "runtime-round"),
      reportMissingCultureShield: vi.fn(),
    };
    const generator = createEmblemGenerator(
      {
        getSelectedShape: () => ({ value: "culture", group: "Diversiform" }),
      },
      runtimeTargets,
    );

    expect(generator.getShield(1, 1)).toBe("runtime-round");
    expect(runtimeTargets.getCultureShield).toHaveBeenCalledWith(1);
    expect(runtimeTargets.reportMissingCultureShield).not.toHaveBeenCalled();
  });

  it("keeps global runtime targets safe when pack and error access throws", () => {
    Object.defineProperty(globalThis, "pack", {
      configurable: true,
      get: () => {
        throw new Error("pack blocked");
      },
    });
    Object.defineProperty(globalThis, "ERROR", {
      configurable: true,
      get: () => {
        throw new Error("ERROR blocked");
      },
    });
    const generator = createEmblemGenerator(
      {
        getSelectedShape: () => ({ value: "culture", group: "Diversiform" }),
      },
      createGlobalEmblemRuntimeTargets(),
    );

    expect(generator.getShield(1, 1)).toBe("heater");
  });
});

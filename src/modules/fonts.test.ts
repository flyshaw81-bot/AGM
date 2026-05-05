import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  EngineBrowserFontResourceTargets,
  EngineFontResourceCompatibilityTarget,
  EngineFontResourceRuntime,
} from "./fonts";

const originalDocument = globalThis.document;
const originalFontFace = globalThis.FontFace;
const originalChangeFont = globalThis.changeFont;
const originalTip = globalThis.tip;
const originalProvs = globalThis.provs;
const originalError = globalThis.ERROR;
const originalFetch = globalThis.fetch;
const originalFileReader = globalThis.FileReader;

function installBrowserFontGlobals() {
  const select = {
    append: vi.fn(),
    value: "",
  };
  const fontSet = { add: vi.fn() };

  globalThis.document = {
    getElementById: vi.fn(() => select),
    createElement: vi.fn(() => ({
      innerText: "",
      style: {},
      value: "",
    })),
    fonts: fontSet,
  } as unknown as Document;
  globalThis.FontFace = class {
    load = vi.fn().mockResolvedValue(undefined);
  } as unknown as typeof FontFace;
  globalThis.changeFont = vi.fn();
  globalThis.tip = vi.fn();
  globalThis.provs = {
    attr: vi.fn(() => "Province Serif"),
  } as unknown as typeof provs;
  globalThis.ERROR = false;

  return { fontSet, select };
}

describe("font resource compatibility facade", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    globalThis.FontFace = originalFontFace;
    globalThis.changeFont = originalChangeFont;
    globalThis.tip = originalTip;
    globalThis.provs = originalProvs;
    globalThis.ERROR = originalError;
    globalThis.fetch = originalFetch;
    globalThis.FileReader = originalFileReader;
    delete (globalThis as { AGMFontResources?: EngineFontResourceRuntime })
      .AGMFontResources;
    delete (globalThis as { fonts?: unknown }).fonts;
    delete (globalThis as { declareFont?: unknown }).declareFont;
    delete (globalThis as { getUsedFonts?: unknown }).getUsedFonts;
    delete (globalThis as { loadFontsAsDataURI?: unknown }).loadFontsAsDataURI;
    delete (globalThis as { addGoogleFont?: unknown }).addGoogleFont;
    delete (globalThis as { addLocalFont?: unknown }).addLocalFont;
    delete (globalThis as { addWebFont?: unknown }).addWebFont;
  });

  it("composes the browser font adapter from injected targets", async () => {
    installBrowserFontGlobals();
    const { createBrowserFontResourceAdapter } = await import("./fonts");
    const option = {
      innerText: "",
      style: {} as CSSStyleDeclaration,
      value: "",
    };
    const loadedFontFace = { load: vi.fn().mockResolvedValue(undefined) };
    const targets: EngineBrowserFontResourceTargets = {
      getFontSelect: vi.fn(
        () => ({ append: vi.fn() }) as unknown as HTMLSelectElement,
      ),
      createOption: vi.fn(() => option as HTMLOptionElement),
      createFontFace: vi.fn(() => loadedFontFace as unknown as FontFace),
      addFontFace: vi.fn(),
      setSelectedFont: vi.fn(),
      applySelectedFont: vi.fn(),
      showToast: vi.fn(),
      logError: vi.fn(),
      fetchText: vi.fn().mockResolvedValue("font css"),
      fetchBlob: vi.fn().mockResolvedValue(new Blob(["font"])),
      readBlobAsDataUrl: vi
        .fn()
        .mockResolvedValue("data:font/woff2;base64,Zm9udA=="),
      getProvinceFont: vi.fn(() => "Province Serif"),
    };

    const adapter = createBrowserFontResourceAdapter(targets);

    adapter.addFontOption("Display Font");
    adapter.registerFontFace({
      family: "Display Font",
      src: "url(https://example.test/display.woff2)",
    });
    await adapter.loadFontFace({
      family: "Loaded Font",
      src: "url(https://example.test/loaded.woff2)",
    });

    expect(targets.getFontSelect).toHaveBeenCalled();
    expect(targets.createOption).toHaveBeenCalled();
    expect(option.value).toBe("Display Font");
    expect(option.innerText).toBe("Display Font");
    expect(option.style.fontFamily).toBe("Display Font");
    expect(targets.createFontFace).toHaveBeenCalledTimes(2);
    expect(loadedFontFace.load).toHaveBeenCalled();
    expect(targets.addFontFace).toHaveBeenCalledTimes(2);
  });

  it("installs the compatibility runtime on global targets", async () => {
    installBrowserFontGlobals();
    const {
      createFontResourceRuntime,
      installGlobalFontResourceCompatibility,
    } = await import("./fonts");
    const runtime = createFontResourceRuntime({
      getAllFonts: () => [{ family: "Runtime Font" }],
      declareFont: vi.fn(),
      getUsedFonts: vi.fn(),
      loadFontsAsDataURI: vi.fn(),
      addGoogleFont: vi.fn(),
      addLocalFont: vi.fn(),
      addWebFont: vi.fn(),
    } as never);
    const target = {} as EngineFontResourceCompatibilityTarget & {
      AGMFontResources?: EngineFontResourceRuntime;
    };

    installGlobalFontResourceCompatibility(runtime, target);

    expect(target.AGMFontResources).toBe(runtime);
    expect(target.fonts).toEqual([{ family: "Runtime Font" }]);
    expect(target.declareFont).toBe(runtime.declareFont);
  });

  it("keeps the default browser font targets safe without browser globals", async () => {
    globalThis.document = undefined as unknown as Document;
    globalThis.FontFace = undefined as unknown as typeof FontFace;
    globalThis.changeFont = undefined as unknown as typeof changeFont;
    globalThis.tip = undefined as unknown as typeof tip;
    globalThis.provs = undefined as unknown as typeof provs;
    globalThis.fetch = vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue(new Blob(["font"])),
      text: vi.fn().mockResolvedValue("font css"),
    }) as unknown as typeof fetch;

    const { createBrowserFontResourceAdapter } = await import("./fonts");
    const adapter = createBrowserFontResourceAdapter();

    expect(() => adapter.addFontOption("Display Font")).not.toThrow();
    expect(() =>
      adapter.registerFontFace({
        family: "Display Font",
        src: "url(https://example.test/display.woff2)",
      }),
    ).not.toThrow();
    await expect(
      adapter.loadFontFace({
        family: "Loaded Font",
        src: "url(https://example.test/loaded.woff2)",
      }),
    ).resolves.toBeUndefined();
    expect(() => adapter.setSelectedFont("Display Font")).not.toThrow();
    expect(() => adapter.applySelectedFont()).not.toThrow();
    expect(() => adapter.showToast("Loaded", "success")).not.toThrow();
    expect(adapter.getProvinceFont()).toBeNull();
  });

  it("keeps the default browser font targets safe when document access throws", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    globalThis.FontFace = undefined as unknown as typeof FontFace;

    const { createBrowserFontResourceAdapter } = await import("./fonts");
    const adapter = createBrowserFontResourceAdapter();

    expect(() => adapter.addFontOption("Display Font")).not.toThrow();
    expect(() =>
      adapter.registerFontFace({
        family: "Display Font",
        src: "url(https://example.test/display.woff2)",
      }),
    ).not.toThrow();
    expect(() => adapter.setSelectedFont("Display Font")).not.toThrow();
  });

  it("reports an explicit failure when the browser cannot read font blobs", async () => {
    globalThis.FileReader = undefined as unknown as typeof FileReader;

    const { createBrowserFontResourceAdapter } = await import("./fonts");
    const adapter = createBrowserFontResourceAdapter();

    await expect(adapter.readBlobAsDataUrl(new Blob(["font"]))).rejects.toThrow(
      "FileReader is not available",
    );
  });
});

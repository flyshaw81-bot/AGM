import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type EngineFontResourceAdapter,
  EngineFontResourceService,
  type FontDefinition,
} from "./engine-font-resource-service";

function createAdapter(overrides: Partial<EngineFontResourceAdapter> = {}) {
  const adapter: EngineFontResourceAdapter = {
    addFontOption: vi.fn(),
    registerFontFace: vi.fn(),
    loadFontFace: vi.fn().mockResolvedValue(undefined),
    setSelectedFont: vi.fn(),
    applySelectedFont: vi.fn(),
    showToast: vi.fn(),
    logError: vi.fn(),
    fetchText: vi.fn().mockResolvedValue(""),
    fetchBlob: vi.fn().mockResolvedValue(new Blob(["font"])),
    readBlobAsDataUrl: vi
      .fn()
      .mockResolvedValue("data:font/woff2;base64,Zm9udA=="),
    getProvinceFont: vi.fn().mockReturnValue(null),
    ...overrides,
  };

  return adapter;
}

function createSvgStub(fontFamilies: string[], legendFont?: string) {
  const labelGroups = fontFamilies.map((fontFamily) => ({
    getAttribute: (name: string) =>
      name === "font-family" ? fontFamily : null,
  }));

  return {
    querySelectorAll: (selector: string) =>
      selector === "#labels g" ? labelGroups : [],
    querySelector: (selector: string) =>
      selector === "#legend" && legendFont
        ? {
            getAttribute: (name: string) =>
              name === "font-family" ? legendFont : null,
          }
        : null,
  } as unknown as SVGSVGElement;
}

describe("EngineFontResourceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("declares default fonts through an injected adapter", () => {
    const fonts: FontDefinition[] = [
      { family: "Arial" },
      { family: "Cinzel", src: "url(https://example.test/cinzel.woff2)" },
    ];
    const adapter = createAdapter();

    new EngineFontResourceService(fonts, adapter).declareDefaultFonts();

    expect(adapter.addFontOption).toHaveBeenCalledWith("Arial");
    expect(adapter.addFontOption).toHaveBeenCalledWith("Cinzel");
    expect(adapter.registerFontFace).toHaveBeenCalledTimes(1);
    expect(adapter.registerFontFace).toHaveBeenCalledWith(fonts[1]);
  });

  it("finds used fonts from labels, provinces, and legend", () => {
    const fonts: FontDefinition[] = [
      { family: "Arial" },
      { family: "Cinzel" },
      { family: "Province Serif" },
      { family: "Unused" },
    ];
    const adapter = createAdapter({
      getProvinceFont: vi.fn().mockReturnValue("Province Serif"),
    });
    const service = new EngineFontResourceService(fonts, adapter);

    const usedFonts = service.getUsedFonts(createSvgStub(["Arial"], "Cinzel"));

    expect(usedFonts.map((font) => font.family)).toEqual([
      "Arial",
      "Cinzel",
      "Province Serif",
    ]);
  });

  it("converts remote font sources to data URIs", async () => {
    const adapter = createAdapter();
    const service = new EngineFontResourceService([], adapter);

    const fonts = await service.loadFontsAsDataURI([
      { family: "Remote", src: "url('https://example.test/font.woff2')" },
      { family: "Local" },
    ]);

    expect(adapter.fetchBlob).toHaveBeenCalledWith(
      "https://example.test/font.woff2",
    );
    expect(fonts).toEqual([
      {
        family: "Remote",
        src: "url('data:font/woff2;base64,Zm9udA==')",
      },
      { family: "Local" },
    ]);
  });

  it("adds local and web fonts without reading browser globals", () => {
    const fonts: FontDefinition[] = [];
    const adapter = createAdapter();
    const service = new EngineFontResourceService(fonts, adapter);

    service.addLocalFont("Local Display");
    service.addWebFont("Remote Display", "https://example.test/remote.woff2");

    expect(fonts).toEqual([
      { family: "Local Display" },
      {
        family: "Remote Display",
        src: "url('https://example.test/remote.woff2')",
      },
    ]);
    expect(adapter.registerFontFace).toHaveBeenCalledWith({
      family: "Local Display",
      src: "local(Local Display)",
    });
    expect(adapter.registerFontFace).toHaveBeenCalledWith({
      family: "Remote Display",
      src: "url('https://example.test/remote.woff2')",
    });
    expect(adapter.applySelectedFont).toHaveBeenCalledTimes(2);
  });

  it("loads Google font CSS through the adapter", async () => {
    const fonts: FontDefinition[] = [];
    const adapter = createAdapter({
      fetchText: vi.fn().mockResolvedValue(`
        @font-face {
          font-family: 'Example';
          font-style: normal;
          src: url(https://example.test/example.woff2) format('woff2');
          unicode-range: U+0000-00FF;
        }
      `),
    });
    const service = new EngineFontResourceService(fonts, adapter);

    await service.addGoogleFont("Example Font");

    expect(adapter.fetchText).toHaveBeenCalledWith(
      "https://fonts.googleapis.com/css2?family=Example+Font",
    );
    expect(adapter.loadFontFace).toHaveBeenCalledWith({
      family: "Example Font",
      src: "url(https://example.test/example.woff2)",
      unicodeRange: "U+0000-00FF",
    });
    expect(fonts).toEqual([
      {
        family: "Example Font",
        src: "url(https://example.test/example.woff2)",
        unicodeRange: "U+0000-00FF",
      },
    ]);
    expect(adapter.setSelectedFont).toHaveBeenCalledWith("Example Font");
    expect(adapter.applySelectedFont).toHaveBeenCalled();
  });
});

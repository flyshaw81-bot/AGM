export type FontDefinition = {
  family: string;
  src?: string;
  unicodeRange?: string;
  variant?: string;
};

export type FontFeedbackType = "error" | "success" | "warn";

export type EngineFontResourceAdapter = {
  addFontOption: (family: string) => void;
  registerFontFace: (font: FontDefinition) => void;
  loadFontFace: (font: FontDefinition) => Promise<void>;
  setSelectedFont: (family: string) => void;
  applySelectedFont: () => void;
  showToast: (
    message: string,
    type: FontFeedbackType,
    duration?: number,
  ) => void;
  logError: (error: unknown) => void;
  fetchText: (url: string) => Promise<string>;
  fetchBlob: (url: string) => Promise<Blob>;
  readBlobAsDataUrl: (blob: Blob) => Promise<string>;
  getProvinceFont: () => string | null;
};

function getFontSourceUrl(font: FontDefinition) {
  return font.src?.match(/url\(['"]?(.+?)['"]?\)/)?.[1] ?? null;
}

function createGoogleFontsUrl(family: string) {
  return `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}`;
}

function parseGoogleFontCss(family: string, text: string): FontDefinition[] {
  const fontFaceRules = text.match(/font-face\s*{[^}]+}/g);
  if (!fontFaceRules) return [];

  return fontFaceRules
    .map((fontFace) => {
      const srcURL = fontFace.match(/url\(['"]?(.+?)['"]?\)/)?.[1];
      if (!srcURL) return null;
      const unicodeRange = fontFace.match(/unicode-range: (.*?);/)?.[1];
      const variant = fontFace.match(/font-style: (.*?);/)?.[1];

      const font: FontDefinition = { family, src: `url(${srcURL})` };
      if (unicodeRange) font.unicodeRange = unicodeRange;
      if (variant && variant !== "normal") font.variant = variant;
      return font;
    })
    .filter((font): font is FontDefinition => Boolean(font));
}

export class EngineFontResourceService {
  constructor(
    private readonly fonts: FontDefinition[],
    private readonly adapter: EngineFontResourceAdapter,
  ) {}

  getAllFonts() {
    return this.fonts;
  }

  declareFont(font: FontDefinition) {
    this.adapter.addFontOption(font.family);
    if (font.src) this.adapter.registerFontFace(font);
  }

  declareDefaultFonts() {
    for (const font of this.fonts) {
      this.declareFont(font);
    }
  }

  getUsedFonts(svg: SVGSVGElement) {
    const usedFontFamilies = new Set<string>();

    const labelGroups = svg.querySelectorAll("#labels g");
    for (const labelGroup of labelGroups) {
      const font = labelGroup.getAttribute("font-family");
      if (font) usedFontFamilies.add(font);
    }

    const provinceFont = this.adapter.getProvinceFont();
    if (provinceFont) usedFontFamilies.add(provinceFont);

    const legend = svg.querySelector("#legend");
    const legendFont = legend?.getAttribute("font-family");
    if (legendFont) usedFontFamilies.add(legendFont);

    return this.fonts.filter((font) => usedFontFamilies.has(font.family));
  }

  async loadFontsAsDataURI(fonts: FontDefinition[]) {
    return Promise.all(
      fonts.map(async (font) => {
        const url = getFontSourceUrl(font);
        if (!url) return font;
        const blob = await this.adapter.fetchBlob(url);
        const dataURL = await this.adapter.readBlobAsDataUrl(blob);

        return { ...font, src: `url('${dataURL}')` };
      }),
    );
  }

  async addGoogleFont(family: string) {
    const fontRanges = await this.fetchGoogleFont(family);
    if (!fontRanges)
      return this.adapter.showToast(
        "Cannot fetch Google font for this value",
        "error",
      );
    this.adapter.showToast(`Google font ${family} is loading...`, "warn");

    try {
      await Promise.all(
        fontRanges.map((range) => this.adapter.loadFontFace(range)),
      );
      this.fonts.push(...fontRanges);
      this.adapter.showToast(
        `Google font ${family} is added to the list`,
        "success",
      );
      this.adapter.addFontOption(family);
      this.adapter.setSelectedFont(family);
      this.adapter.applySelectedFont();
    } catch (err) {
      this.adapter.showToast(`Failed to load Google font ${family}`, "error");
      this.adapter.logError(err);
    }
  }

  addLocalFont(family: string) {
    const font = { family };
    this.fonts.push(font);
    this.adapter.registerFontFace({ family, src: `local(${family})` });
    this.adapter.showToast(
      `Local font ${family} is added to the fonts list`,
      "success",
    );
    this.adapter.addFontOption(family);
    this.adapter.setSelectedFont(family);
    this.adapter.applySelectedFont();
  }

  addWebFont(family: string, url: string) {
    const src = `url('${url}')`;
    this.fonts.push({ family, src });
    this.adapter.registerFontFace({ family, src });
    this.adapter.showToast(`Font ${family} is added to the list`, "success");
    this.adapter.addFontOption(family);
    this.adapter.setSelectedFont(family);
    this.adapter.applySelectedFont();
  }

  private async fetchGoogleFont(family: string) {
    try {
      const text = await this.adapter.fetchText(createGoogleFontsUrl(family));
      const fonts = parseGoogleFontCss(family, text);
      return fonts.length ? fonts : null;
    } catch (err) {
      this.adapter.logError(err);
      return null;
    }
  }
}

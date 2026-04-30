import { byId } from "../utils/shorthands";
import {
  type EngineFontResourceAdapter,
  EngineFontResourceService,
  type FontDefinition,
} from "./engine-font-resource-service";

export type EngineFontResourceRuntime = {
  fonts: FontDefinition[];
  declareFont: (font: FontDefinition) => void;
  getUsedFonts: (svg: SVGSVGElement) => FontDefinition[];
  loadFontsAsDataURI: (fonts: FontDefinition[]) => Promise<FontDefinition[]>;
  addGoogleFont: (family: string) => Promise<void>;
  addLocalFont: (family: string) => void;
  addWebFont: (family: string, src: string) => void;
};

type EngineFontResourceCompatibilityTarget = typeof globalThis & {
  AGMFontResources?: EngineFontResourceRuntime;
  declareFont?: (font: FontDefinition) => void;
  getUsedFonts?: (svg: SVGSVGElement) => FontDefinition[];
  loadFontsAsDataURI?: (fonts: FontDefinition[]) => Promise<FontDefinition[]>;
  addGoogleFont?: (family: string) => Promise<void>;
  addLocalFont?: (family: string) => void;
  addWebFont?: (family: string, src: string) => void;
  fonts?: FontDefinition[];
};

const fontDefinitions: FontDefinition[] = [
  { family: "Arial" },
  { family: "Brush Script MT" },
  { family: "Century Gothic" },
  { family: "Comic Sans MS" },
  { family: "Copperplate" },
  { family: "Courier New" },
  { family: "Garamond" },
  { family: "Georgia" },
  { family: "Herculanum" },
  { family: "Impact" },
  { family: "Papyrus" },
  { family: "Party LET" },
  { family: "Times New Roman" },
  { family: "Verdana" },
  {
    family: "Almendra SC",
    src: "url(https://fonts.gstatic.com/s/almendrasc/v13/Iure6Yx284eebowr7hbyTaZOrLQ.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Amarante",
    src: "url(https://fonts.gstatic.com/s/amarante/v22/xMQXuF1KTa6EvGx9bp-wAXs.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Amatic SC",
    src: "url(https://fonts.gstatic.com/s/amaticsc/v11/TUZ3zwprpvBS1izr_vOMscGKfrUC.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Arima Madurai",
    src: "url(https://fonts.gstatic.com/s/arimamadurai/v14/t5tmIRoeKYORG0WNMgnC3seB3T7Prw.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Architects Daughter",
    src: "url(https://fonts.gstatic.com/s/architectsdaughter/v8/RXTgOOQ9AAtaVOHxx0IUBM3t7GjCYufj5TXV5VnA2p8.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Bitter",
    src: "url(https://fonts.gstatic.com/s/bitter/v12/zfs6I-5mjWQ3nxqccMoL2A.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Caesar Dressing",
    src: "url(https://fonts.gstatic.com/s/caesardressing/v6/yYLx0hLa3vawqtwdswbotmK4vrRHdrz7.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Cinzel",
    src: "url(https://fonts.gstatic.com/s/cinzel/v7/zOdksD_UUTk1LJF9z4tURA.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Dancing Script",
    src: "url(https://fonts.gstatic.com/s/dancingscript/v9/KGBfwabt0ZRLA5W1ywjowUHdOuSHeh0r6jGTOGdAKHA.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Eagle Lake",
    src: "url(https://fonts.gstatic.com/s/eaglelake/v24/ptRMTiqbbuNJDOiKj9wG1On4KCFtpe4.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Faster One",
    src: "url(https://fonts.gstatic.com/s/fasterone/v17/H4ciBXCHmdfClFb-vWhf-LyYhw.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Forum",
    src: "url(https://fonts.gstatic.com/s/forum/v16/6aey4Ky-Vb8Ew8IROpI.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Fredericka the Great",
    src: "url(https://fonts.gstatic.com/s/frederickathegreat/v6/9Bt33CxNwt7aOctW2xjbCstzwVKsIBVV--Sjxbc.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Gloria Hallelujah",
    src: "url(https://fonts.gstatic.com/s/gloriahallelujah/v9/CA1k7SlXcY5kvI81M_R28cNDay8z-hHR7F16xrcXsJw.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Great Vibes",
    src: "url(https://fonts.gstatic.com/s/greatvibes/v5/6q1c0ofG6NKsEhAc2eh-3Y4P5ICox8Kq3LLUNMylGO4.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Henny Penny",
    src: "url(https://fonts.gstatic.com/s/hennypenny/v17/wXKvE3UZookzsxz_kjGSfPQtvXI.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "IM Fell English",
    src: "url(https://fonts.gstatic.com/s/imfellenglish/v7/xwIisCqGFi8pff-oa9uSVAkYLEKE0CJQa8tfZYc_plY.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Kelly Slab",
    src: "url(https://fonts.gstatic.com/s/kellyslab/v15/-W_7XJX0Rz3cxUnJC5t6fkQLfg.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Kranky",
    src: "url(https://fonts.gstatic.com/s/kranky/v24/hESw6XVgJzlPsFn8oR2F.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Lobster Two",
    src: "url(https://fonts.gstatic.com/s/lobstertwo/v18/BngMUXZGTXPUvIoyV6yN5-fN5qU.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Lugrasimo",
    src: "url(https://fonts.gstatic.com/s/lugrasimo/v4/qkBXXvoF_s_eT9c7Y7au455KsgbLMA.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Kaushan Script",
    src: "url(https://fonts.gstatic.com/s/kaushanscript/v6/qx1LSqts-NtiKcLw4N03IEd0sm1ffa_JvZxsF_BEwQk.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Macondo",
    src: "url(https://fonts.gstatic.com/s/macondo/v21/RrQQboN9-iB1IXmOe2LE0Q.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "MedievalSharp",
    src: "url(https://fonts.gstatic.com/s/medievalsharp/v9/EvOJzAlL3oU5AQl2mP5KdgptMqhwMg.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Metal Mania",
    src: "url(https://fonts.gstatic.com/s/metalmania/v22/RWmMoKWb4e8kqMfBUdPFJdXFiaQ.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Metamorphous",
    src: "url(https://fonts.gstatic.com/s/metamorphous/v7/Wnz8HA03aAXcC39ZEX5y133EOyqs.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Montez",
    src: "url(https://fonts.gstatic.com/s/montez/v8/aq8el3-0osHIcFK6bXAPkw.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Nova Script",
    src: "url(https://fonts.gstatic.com/s/novascript/v10/7Au7p_IpkSWSTWaFWkumvlQKGFw.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Orbitron",
    src: "url(https://fonts.gstatic.com/s/orbitron/v9/HmnHiRzvcnQr8CjBje6GQvesZW2xOQ-xsNqO47m55DA.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Oregano",
    src: "url(https://fonts.gstatic.com/s/oregano/v13/If2IXTPxciS3H4S2oZDVPg.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Pirata One",
    src: "url(https://fonts.gstatic.com/s/pirataone/v22/I_urMpiDvgLdLh0fAtofhi-Org.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Sail",
    src: "url(https://fonts.gstatic.com/s/sail/v16/DPEjYwiBxwYJJBPJAQ.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Satisfy",
    src: "url(https://fonts.gstatic.com/s/satisfy/v8/2OzALGYfHwQjkPYWELy-cw.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Shadows Into Light",
    src: "url(https://fonts.gstatic.com/s/shadowsintolight/v7/clhLqOv7MXn459PTh0gXYFK2TSYBz0eNcHnp4YqE4Ts.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
  {
    family: "Tapestry",
    src: "url(https://fonts.gstatic.com/s/macondo/v21/RrQQboN9-iB1IXmOe2LE0Q.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Uncial Antiqua",
    src: "url(https://fonts.gstatic.com/s/uncialantiqua/v5/N0bM2S5WOex4OUbESzoESK-i-MfWQZQ.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Underdog",
    src: "url(https://fonts.gstatic.com/s/underdog/v6/CHygV-jCElj7diMroWSlWV8.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "UnifrakturMaguntia",
    src: "url(https://fonts.gstatic.com/s/unifrakturmaguntia/v16/WWXPlieVYwiGNomYU-ciRLRvEmK7oaVemGZM.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    family: "Yellowtail",
    src: "url(https://fonts.gstatic.com/s/yellowtail/v8/GcIHC9QEwVkrA19LJU1qlPk_vArhqVIZ0nv9q090hN8.woff2)",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
  },
];

function readBlobAsDataURL(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function addFontOption(family: string) {
  const options = document.getElementById("styleSelectFont");
  if (!options) return;

  const option = document.createElement("option");
  option.value = family;
  option.innerText = family;
  option.style.fontFamily = family;
  options.append(option);
}

function createFontFace(font: FontDefinition) {
  const { family, src, ...rest } = font;
  if (!src) return null;
  return new FontFace(family, src, { ...rest, display: "block" });
}

export function createBrowserFontResourceAdapter(): EngineFontResourceAdapter {
  return {
    addFontOption,
    registerFontFace: (font) => {
      const fontFace = createFontFace(font);
      if (fontFace) document.fonts.add(fontFace);
    },
    loadFontFace: async (font) => {
      const fontFace = createFontFace(font);
      if (!fontFace) return;
      await fontFace.load();
      document.fonts.add(fontFace);
    },
    setSelectedFont: (family) => {
      const select = byId<HTMLSelectElement>("styleSelectFont");
      if (select) select.value = family;
    },
    applySelectedFont: () => changeFont(),
    showToast: (message, type, duration = 4000) =>
      tip(message, true, type, duration),
    logError: (error) => {
      globalThis.ERROR && console.error(error);
    },
    fetchText: async (url) => {
      const response = await fetch(url);
      return response.text();
    },
    fetchBlob: async (url) => {
      const response = await fetch(url);
      return response.blob();
    },
    readBlobAsDataUrl: readBlobAsDataURL,
    getProvinceFont: () => provs.attr("font-family") || null,
  };
}

export function createFontResourceRuntime(
  service: EngineFontResourceService,
): EngineFontResourceRuntime {
  return {
    fonts: service.getAllFonts(),
    declareFont: (font) => service.declareFont(font),
    getUsedFonts: (svg) => service.getUsedFonts(svg),
    loadFontsAsDataURI: (fonts) => service.loadFontsAsDataURI(fonts),
    addGoogleFont: (family) => service.addGoogleFont(family),
    addLocalFont: (family) => service.addLocalFont(family),
    addWebFont: (family, src) => service.addWebFont(family, src),
  };
}

export function installGlobalFontResourceCompatibility(
  runtime: EngineFontResourceRuntime,
  target: EngineFontResourceCompatibilityTarget = globalThis,
) {
  target.AGMFontResources = runtime;
  target.fonts = runtime.fonts;
  target.declareFont = runtime.declareFont;
  target.getUsedFonts = runtime.getUsedFonts;
  target.loadFontsAsDataURI = runtime.loadFontsAsDataURI;
  target.addGoogleFont = runtime.addGoogleFont;
  target.addLocalFont = runtime.addLocalFont;
  target.addWebFont = runtime.addWebFont;
}

export const fontResourceService = new EngineFontResourceService(
  fontDefinitions,
  createBrowserFontResourceAdapter(),
);

export const fontResourceRuntime =
  createFontResourceRuntime(fontResourceService);

installGlobalFontResourceCompatibility(fontResourceRuntime);

fontResourceService.declareDefaultFonts();

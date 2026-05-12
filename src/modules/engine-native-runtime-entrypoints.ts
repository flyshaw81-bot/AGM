import { findClosestCell, findGridCell } from "../utils/graphUtils";

type RuntimeFunctionMap = {
  applyLayersPreset: () => void;
  applyStoredOptions: () => void;
  applyStyleOnLoad: () => Promise<void>;
  clearLegend: () => void;
  drawLayers: () => void;
  editUnits: () => void;
  getFriendlyHeight: (coords: [number, number]) => string;
  getColor: (height: number, scheme: (value: number) => string) => string;
  getColorScheme: (schemeName: string | null) => (value: number) => string;
  initiateAutosave: () => Promise<void>;
  layerIsOn: (layerId: string) => boolean;
  locked: (settingId: string) => boolean;
  randomizeOptions: () => void;
  stored: (settingId: string) => string | null;
  unlock: (settingId: string) => void;
  restoreDefaultEvents: () => void;
  tip: (
    message: string,
    main?: boolean,
    type?: "info" | "warn" | "error" | "success",
    timeout?: number,
  ) => void;
};

type RuntimeGlobal = typeof globalThis &
  Partial<RuntimeFunctionMap> & {
    EngineNoticeService?: {
      showModal?: (notice: { title: string; html: string }) => void;
    };
    EngineOptionsSession?: { randomizeOptions?: () => void };
    Rulers?: new () => { data: unknown[]; remove: (id: number) => void };
    d3?: {
      color?: (color: string) => { darker: (value?: number) => string };
      interpolateSpectral?: (value: number) => string;
      interpolateYlGnBu?: (value: number) => string;
      interpolateGreens?: (value: number) => string;
      interpolateGreys?: (value: number) => string;
      interpolateViridis?: (value: number) => string;
      scaleSequential?: (
        interpolator: (value: number) => string,
      ) => (value: number) => string;
    };
    legend?: { selectAll?: (selector: string) => { remove?: () => void } };
    pack?: {
      cells?: {
        i?: number[];
        h?: ArrayLike<number>;
        state?: ArrayLike<number>;
        v?: number[][];
      };
      vertices?: { p?: [number, number][] };
      states?: Array<{
        i?: number;
        color?: string;
        removed?: boolean;
        lock?: boolean;
      }>;
    };
    style?: {
      burgLabels?: Record<string, Record<string, string>>;
      burgIcons?: Record<string, Record<string, string>>;
      anchors?: Record<string, Record<string, string>>;
    };
  };

const LAYER_ACTIONS = [
  "toggleTexture",
  "toggleHeight",
  "toggleBiomes",
  "toggleCells",
  "toggleGrid",
  "toggleCoordinates",
  "toggleCompass",
  "toggleRivers",
  "toggleRelief",
  "toggleReligions",
  "toggleCultures",
  "toggleStates",
  "toggleProvinces",
  "toggleZones",
  "toggleBorders",
  "toggleRoutes",
  "toggleTemperature",
  "togglePopulation",
  "toggleIce",
  "togglePrecipitation",
  "toggleEmblems",
  "toggleBurgIcons",
  "toggleLabels",
  "toggleMilitary",
  "toggleMarkers",
  "toggleRulers",
  "toggleScaleBar",
  "toggleVignette",
] as const;

const DEFAULT_LAYER_PRESETS: Record<string, string[]> = {
  political: [
    "toggleBorders",
    "toggleBurgIcons",
    "toggleIce",
    "toggleLabels",
    "toggleRivers",
    "toggleRoutes",
    "toggleScaleBar",
    "toggleStates",
    "toggleVignette",
  ],
  cultural: [
    "toggleBorders",
    "toggleBurgIcons",
    "toggleCultures",
    "toggleLabels",
    "toggleRivers",
    "toggleRoutes",
    "toggleScaleBar",
    "toggleVignette",
  ],
  religions: [
    "toggleBorders",
    "toggleBurgIcons",
    "toggleLabels",
    "toggleReligions",
    "toggleRivers",
    "toggleRoutes",
    "toggleScaleBar",
    "toggleVignette",
  ],
  provinces: [
    "toggleBorders",
    "toggleBurgIcons",
    "toggleProvinces",
    "toggleRivers",
    "toggleScaleBar",
    "toggleVignette",
  ],
  biomes: [
    "toggleBiomes",
    "toggleIce",
    "toggleRivers",
    "toggleScaleBar",
    "toggleVignette",
  ],
  heightmap: ["toggleHeight", "toggleRivers", "toggleVignette"],
  physical: [
    "toggleCoordinates",
    "toggleHeight",
    "toggleIce",
    "toggleRivers",
    "toggleScaleBar",
    "toggleVignette",
  ],
  poi: [
    "toggleBorders",
    "toggleBurgIcons",
    "toggleHeight",
    "toggleIce",
    "toggleMarkers",
    "toggleRivers",
    "toggleRoutes",
    "toggleScaleBar",
    "toggleVignette",
  ],
  military: [
    "toggleBorders",
    "toggleBurgIcons",
    "toggleLabels",
    "toggleMilitary",
    "toggleRivers",
    "toggleRoutes",
    "toggleScaleBar",
    "toggleStates",
    "toggleVignette",
  ],
  emblems: [
    "toggleBorders",
    "toggleBurgIcons",
    "toggleIce",
    "toggleEmblems",
    "toggleRivers",
    "toggleRoutes",
    "toggleScaleBar",
    "toggleStates",
    "toggleVignette",
  ],
  landmass: ["toggleScaleBar"],
};

const DEFAULT_VISIBLE_LAYERS = DEFAULT_LAYER_PRESETS.political;

const DEFAULT_STYLE_PRESETS = [
  "default",
  "ancient",
  "gloom",
  "pale",
  "light",
  "watercolor",
  "clean",
  "atlas",
  "darkSeas",
  "cyberpunk",
  "night",
  "monochrome",
];

const LAYER_GROUP_TARGETS: Partial<
  Record<(typeof LAYER_ACTIONS)[number], string[]>
> = {
  toggleHeight: ["#terrs"],
  toggleBiomes: ["#biomes"],
  toggleCells: ["#cells"],
  toggleGrid: ["#gridOverlay"],
  toggleCoordinates: ["#coordinates"],
  toggleCompass: ["#compass"],
  toggleRivers: ["#rivers"],
  toggleRelief: ["#terrain"],
  toggleCultures: ["#cults"],
  toggleReligions: ["#relig"],
  toggleStates: ["#regions"],
  toggleProvinces: ["#provs"],
  toggleZones: ["#zones"],
  toggleBorders: ["#borders"],
  toggleRoutes: ["#routes"],
  toggleTemperature: ["#temperature"],
  togglePopulation: ["#population"],
  toggleIce: ["#ice"],
  togglePrecipitation: ["#prec"],
  toggleEmblems: ["#emblems"],
  toggleBurgIcons: ["#icons"],
  toggleLabels: ["#labels"],
  toggleMilitary: ["#armies"],
  toggleMarkers: ["#markers"],
  toggleRulers: ["#ruler"],
  toggleScaleBar: ["#scaleBar"],
  toggleTexture: ["#texture"],
  toggleVignette: ["#vignette"],
};

function getRuntime(): RuntimeGlobal | undefined {
  try {
    return globalThis as RuntimeGlobal;
  } catch {
    return undefined;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function getLocalStorageItem(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function parseStoredJson(value: string | null): unknown | null {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function installFallback<K extends keyof RuntimeFunctionMap>(
  runtime: RuntimeGlobal,
  name: K,
  fallback: RuntimeFunctionMap[K],
) {
  const runtimeFunctions = runtime as Partial<RuntimeFunctionMap>;
  if (typeof runtimeFunctions[name] !== "function") {
    runtimeFunctions[name] = fallback;
  }
}

function isPressedLayerControl(layerId: string): boolean {
  const control = getDocument()?.getElementById(layerId);
  if (!control) return false;

  if (control instanceof HTMLInputElement) return control.checked;

  const pressed = control.getAttribute("aria-pressed");
  if (pressed) return pressed === "true";

  if (control.dataset.visible) return control.dataset.visible === "true";
  if (control.dataset.state) return control.dataset.state === "on";

  return control.classList.contains("pressed");
}

function setLayerVisible(layerId: string, visible: boolean) {
  const document = getDocument();
  const control = document?.getElementById(layerId);
  if (!control) return;

  control.classList.toggle("pressed", visible);
  control.classList.toggle("buttonoff", !visible);
  control.setAttribute("aria-pressed", visible ? "true" : "false");
  control.dataset.visible = visible ? "true" : "false";
  control.dataset.state = visible ? "on" : "off";
  if (control instanceof HTMLInputElement) control.checked = visible;

  for (const selector of LAYER_GROUP_TARGETS[
    layerId as keyof typeof LAYER_GROUP_TARGETS
  ] || []) {
    const element = document?.querySelector<SVGElement>(selector);
    if (element) element.style.display = visible ? "" : "none";
  }
}

function applyNativeLayersPreset() {
  const document = getDocument();
  const select = document?.querySelector<HTMLSelectElement>("#layersPreset");
  const storedPreset = getLocalStorageItem("preset");
  const preset =
    (storedPreset && DEFAULT_LAYER_PRESETS[storedPreset]
      ? storedPreset
      : select?.value) || "political";
  const visibleLayers = DEFAULT_LAYER_PRESETS[preset] || DEFAULT_VISIBLE_LAYERS;
  if (select)
    select.value = DEFAULT_LAYER_PRESETS[preset] ? preset : "political";
  try {
    globalThis.localStorage?.setItem("preset", select?.value || preset);
  } catch {
    // Layer preset persistence is optional in native runtime.
  }

  for (const layerId of LAYER_ACTIONS) {
    setLayerVisible(layerId, visibleLayers.includes(layerId));
  }
}

function applyStyleAttributes(
  styleJson: Record<string, Record<string, unknown>>,
) {
  const document = getDocument();
  const runtime = getRuntime();
  for (const selector in styleJson) {
    const values = styleJson[selector];
    if (!values || typeof values !== "object") continue;

    if (selector.startsWith("#burgLabels")) {
      const group = selector.split("#").pop() || "";
      if (!runtime?.style)
        runtime!.style = { burgLabels: {}, burgIcons: {}, anchors: {} };
      if (!runtime!.style.burgLabels) runtime!.style.burgLabels = {};
      runtime!.style.burgLabels[group] = values as Record<string, string>;
    }
    if (selector.startsWith("#burgIcons")) {
      const group = selector.split("#").pop() || "";
      if (!runtime?.style)
        runtime!.style = { burgLabels: {}, burgIcons: {}, anchors: {} };
      if (!runtime!.style.burgIcons) runtime!.style.burgIcons = {};
      runtime!.style.burgIcons[group] = values as Record<string, string>;
    }
    if (selector.startsWith("#anchors")) {
      const group = selector.split("#").pop() || "";
      if (!runtime?.style)
        runtime!.style = { burgLabels: {}, burgIcons: {}, anchors: {} };
      if (!runtime!.style.anchors) runtime!.style.anchors = {};
      runtime!.style.anchors[group] = values as Record<string, string>;
    }

    const element = document?.querySelector(selector);
    if (!element) continue;
    for (const attribute in values) {
      const value = values[attribute];
      if (value === null || value === "null") {
        element.removeAttribute(attribute);
      } else {
        element.setAttribute(attribute, String(value));
      }
    }
  }
}

async function applyNativeStyleOnLoad() {
  const document = getDocument();
  const desiredPreset = getLocalStorageItem("presetStyle") || "default";
  const storedStyle =
    desiredPreset.startsWith("fmgStyle_") &&
    parseStoredJson(getLocalStorageItem(desiredPreset));
  let appliedPreset = desiredPreset;
  let styleJson = storedStyle as Record<string, Record<string, unknown>> | null;

  if (!styleJson) {
    const presetName = DEFAULT_STYLE_PRESETS.includes(desiredPreset)
      ? desiredPreset
      : "default";
    appliedPreset = presetName;
    const response = await fetch(`./styles/${presetName}.json`);
    styleJson = (await response.json()) as Record<
      string,
      Record<string, unknown>
    >;
  }

  applyStyleAttributes(styleJson);
  ensureNativeHeightmapStyleDefaults();

  const select = document?.querySelector<HTMLSelectElement>("#stylePreset");
  if (select) {
    if (
      !Array.from(select.options).some(
        (option) => option.value === appliedPreset,
      )
    ) {
      select.add(new Option(appliedPreset, appliedPreset));
    }
    select.value = appliedPreset;
    select.dataset.old = appliedPreset;
  }
}

function ensureNativeHeightmapStyleDefaults() {
  const document = getDocument();
  const land = document?.querySelector<SVGGElement>("#landHeights");
  const ocean = document?.querySelector<SVGGElement>("#oceanHeights");
  const vignette = document?.querySelector<SVGGElement>("#vignette");
  const vignetteRect =
    document?.querySelector<SVGRectElement>("#vignette-rect");

  land?.setAttribute("scheme", land.getAttribute("scheme") || "bright");
  land?.setAttribute("skip", land.getAttribute("skip") || "5");
  land?.setAttribute("relax", land.getAttribute("relax") || "0");
  land?.setAttribute("curve", land.getAttribute("curve") || "curveBasisClosed");
  land?.setAttribute("terracing", land.getAttribute("terracing") || "0");

  ocean?.setAttribute("scheme", ocean.getAttribute("scheme") || "bright");
  ocean?.setAttribute("skip", ocean.getAttribute("skip") || "5");
  ocean?.setAttribute("relax", ocean.getAttribute("relax") || "0");
  ocean?.setAttribute(
    "curve",
    ocean.getAttribute("curve") || "curveBasisClosed",
  );
  ocean?.setAttribute("terracing", ocean.getAttribute("terracing") || "0");
  ocean?.setAttribute("data-render", ocean.getAttribute("data-render") || "0");

  vignette?.setAttribute("opacity", vignette.getAttribute("opacity") || "0.3");
  vignette?.setAttribute("fill", vignette.getAttribute("fill") || "#000000");
  vignetteRect?.setAttribute("x", vignetteRect.getAttribute("x") || "0.3%");
  vignetteRect?.setAttribute("y", vignetteRect.getAttribute("y") || "0.4%");
  vignetteRect?.setAttribute(
    "width",
    vignetteRect.getAttribute("width") || "99.6%",
  );
  vignetteRect?.setAttribute(
    "height",
    vignetteRect.getAttribute("height") || "99.2%",
  );
  vignetteRect?.setAttribute("rx", vignetteRect.getAttribute("rx") || "5%");
  vignetteRect?.setAttribute("ry", vignetteRect.getAttribute("ry") || "5%");
  vignetteRect?.setAttribute(
    "filter",
    vignetteRect.getAttribute("filter") || "blur(20px)",
  );
}

function nativeGetColorScheme(schemeName: string | null) {
  const runtime = getRuntime();
  const interpolators = runtime?.d3;
  const interpolator =
    schemeName === "natural"
      ? interpolators?.interpolateYlGnBu
      : schemeName === "olive"
        ? interpolators?.interpolateGreens
        : schemeName === "monochrome"
          ? interpolators?.interpolateGreys
          : schemeName === "livid"
            ? interpolators?.interpolateViridis
            : interpolators?.interpolateSpectral;

  const fallback = (value: number) => {
    const normalized = Math.max(0, Math.min(1, value));
    const channel = Math.round(80 + normalized * 140);
    return `rgb(${channel}, ${channel}, ${channel})`;
  };
  return interpolator || fallback;
}

function nativeGetColor(
  height: number,
  scheme: (value: number) => string,
): string {
  const value = Math.max(0, Math.min(1, 1 - height / 100));
  return scheme(value);
}

function getNativePack(): {
  cells?: {
    i?: number[];
    h?: ArrayLike<number>;
    state?: ArrayLike<number>;
    v?: number[][];
  };
  vertices?: { p?: [number, number][] };
  states?: Array<{
    i?: number;
    color?: string;
    removed?: boolean;
    lock?: boolean;
  }>;
} | undefined {
  // Prefer the active engine runtime context (DPAGM native mode).
  const ctx = (
    window as unknown as {
      __agmActiveEngineRuntimeContext?: {
        pack?: {
          cells?: {
            i?: number[];
            h?: ArrayLike<number>;
            state?: ArrayLike<number>;
            v?: number[][];
          };
          vertices?: { p?: [number, number][] };
          states?: Array<{
            i?: number;
            color?: string;
            removed?: boolean;
            lock?: boolean;
          }>;
        };
      };
    }
  ).__agmActiveEngineRuntimeContext;
  if (ctx?.pack) return ctx.pack;
  // Fall back to legacy global (window.pack).
  return getRuntime()?.pack as ReturnType<typeof getNativePack>;
}

function drawNativeStates() {
  const document = getDocument();
  const pack = getNativePack();
  const statesBody = document?.querySelector<SVGGElement>("#statesBody");
  const cells = pack?.cells;
  const vertices = pack?.vertices;
  const states = pack?.states;
  if (!statesBody || !cells?.i || !cells.h || !cells.state || !cells.v) return;
  if (!vertices?.p || !states) return;

  statesBody.replaceChildren();
  const paths = new Map<number, string[]>();

  for (const cellId of cells.i) {
    const stateId = cells.state[cellId];
    if (!stateId || cells.h[cellId] < 20) continue;

    const points = cells.v[cellId]
      ?.map((vertexId) => vertices.p?.[vertexId])
      .filter(Boolean) as [number, number][];
    if (!points?.length) continue;

    if (!paths.has(stateId)) paths.set(stateId, []);
    paths
      .get(stateId)
      ?.push(`M${points.map(([x, y]) => `${x},${y}`).join("L")}Z`);
  }

  for (const [stateId, pathParts] of paths) {
    const state = states[stateId];
    if (!state?.i || state.removed || state.lock) continue;

    const path = statesBody.ownerDocument.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    path.setAttribute("d", pathParts.join(""));
    path.setAttribute("id", `state${stateId}`);
    path.setAttribute("data-state", String(stateId));
    path.setAttribute("fill", state.color || "#9fb6d8");
    statesBody.append(path);
  }
}

// ---------------------------------------------------------------------------
// Native draw functions for layers that have no legacy engine counterpart.
// ---------------------------------------------------------------------------

function drawNativeGrid() {
  const gridOverlay = getDocument()?.getElementById("gridOverlay");
  if (!gridOverlay) return;
  // Clear previous content.
  gridOverlay.innerHTML = "";
  const patternType = gridOverlay.getAttribute("type") ?? "pointyHex";
  const patternId = `#pattern_${patternType}`;
  const stroke = gridOverlay.getAttribute("stroke") ?? "#808080";
  const strokeWidth = gridOverlay.getAttribute("stroke-width") ?? "0.5";
  const dasharray = gridOverlay.getAttribute("stroke-dasharray");
  const linecap = gridOverlay.getAttribute("stroke-linecap");
  const scale = Number(gridOverlay.getAttribute("scale") ?? 1);
  const dx = Number(gridOverlay.getAttribute("dx") ?? 0);
  const dy = Number(gridOverlay.getAttribute("dy") ?? 0);
  const tr = `scale(${scale}) translate(${dx} ${dy})`;

  const g = window as unknown as { graphWidth?: number; graphHeight?: number };
  const graphW = g.graphWidth ?? 960;
  const graphH = g.graphHeight ?? 540;

  const pattern = getDocument()?.querySelector(patternId);
  if (pattern) {
    pattern.setAttribute("stroke", stroke);
    pattern.setAttribute("stroke-width", strokeWidth);
    if (dasharray) pattern.setAttribute("stroke-dasharray", dasharray);
    if (linecap) pattern.setAttribute("stroke-linecap", linecap);
    pattern.setAttribute("patternTransform", tr);
  }

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", String(graphW));
  rect.setAttribute("height", String(graphH));
  rect.setAttribute("fill", `url(${patternId})`);
  rect.setAttribute("stroke", "none");
  gridOverlay.appendChild(rect);
}

function drawNativeTexture() {
  const texture = getDocument()?.getElementById("texture");
  if (!texture) return;
  // Don't redraw if already has children.
  if (texture.children.length > 0) return;
  const href = texture.getAttribute("data-href");
  if (!href) return;
  const x = Number(texture.getAttribute("data-x") ?? 0);
  const y = Number(texture.getAttribute("data-y") ?? 0);
  const g = window as unknown as { graphWidth?: number; graphHeight?: number };
  const w = (g.graphWidth ?? 960) - x;
  const h = (g.graphHeight ?? 540) - y;

  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.setAttribute("preserveAspectRatio", "xMidYMid slice");
  image.setAttribute("x", String(x));
  image.setAttribute("y", String(y));
  image.setAttribute("width", String(w));
  image.setAttribute("height", String(h));
  image.setAttribute("href", href);
  texture.appendChild(image);
}

function getNativePackCells(): {
  p?: [number, number][];
  pop?: ArrayLike<number>;
  i?: number[];
} | undefined {
  const ctx = (
    window as unknown as {
      __agmActiveEngineRuntimeContext?: { pack?: { cells?: { p?: [number, number][]; pop?: ArrayLike<number>; i?: number[] } } };
    }
  ).__agmActiveEngineRuntimeContext;
  return ctx?.pack?.cells;
}

function drawNativeCells() {
  const cellsEl = getDocument()?.getElementById("cells");
  if (!cellsEl) return;
  // Only render once — toggle visibility via display.
  if (cellsEl.children.length > 0) return;
  const cellsData = getNativePackCells();
  const points = cellsData?.p;
  if (!points || points.length === 0) return;

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  // Limit to prevent huge DOM from slowing down the browser.
  const maxCircles = 3000;
  const step = Math.max(1, Math.floor(points.length / maxCircles));
  for (let i = 0; i < points.length; i += step) {
    const pt = points[i];
    if (!pt || pt.length < 2) continue;
    const cx = pt[0];
    const cy = pt[1];
    if (cx === undefined || cy === undefined) continue;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(cx));
    circle.setAttribute("cy", String(cy));
    circle.setAttribute("r", "0.8");
    circle.setAttribute("fill", "#ffffff44");
    circle.setAttribute("stroke", "#99999988");
    circle.setAttribute("stroke-width", "0.3");
    g.appendChild(circle);
  }
  cellsEl.appendChild(g);
}

function drawNativePopulation() {
  const population = getDocument()?.getElementById("population");
  if (!population) return;
  // Remove previous content so we can re-render.
  population.innerHTML = "";

  const cellsData = getNativePackCells();
  const points = cellsData?.p;
  const pop = cellsData?.pop;
  const cellIndices = cellsData?.i;
  const burgs = (
    window as unknown as {
      __agmActiveEngineRuntimeContext?: {
        pack?: {
          burgs?: Array<{ i?: number; removed?: boolean; x?: number; y?: number; population?: number }>;
        };
      };
    }
  ).__agmActiveEngineRuntimeContext?.pack?.burgs;
  if (!points || !pop || !cellIndices) return;

  // Rural population lines
  const ruralG = document.createElementNS("http://www.w3.org/2000/svg", "g");
  ruralG.setAttribute("id", "rural");
  for (let idx = 0; idx < cellIndices.length; idx++) {
    const i = cellIndices[idx];
    const populationValue = pop[i];
    if (!populationValue || populationValue <= 0) continue;
    const [x, y] = points[i];
    if (x === undefined || y === undefined) continue;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(x));
    line.setAttribute("y1", String(y));
    line.setAttribute("x2", String(x));
    line.setAttribute("y2", String(y - populationValue / 5));
    line.setAttribute("stroke", "#333333");
    line.setAttribute("stroke-width", "0.5");
    ruralG.appendChild(line);
  }
  population.appendChild(ruralG);

  // Urban population lines
  if (burgs) {
    const urbanG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    urbanG.setAttribute("id", "urban");
    for (const burg of burgs) {
      if (!burg.i || burg.removed) continue;
      const bx = burg.x;
      const by = burg.y;
      const bp = burg.population ?? 0;
      if (bx === undefined || by === undefined || bp <= 0) continue;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(bx));
      line.setAttribute("y1", String(by));
      line.setAttribute("x2", String(bx));
      line.setAttribute("y2", String(by - bp / 5));
      line.setAttribute("stroke", "#cc0000");
      line.setAttribute("stroke-width", "0.7");
      urbanG.appendChild(line);
    }
    population.appendChild(urbanG);
  }
}

function callOptionalDraw(name: string) {
  const runtime = getRuntime() as Record<string, unknown> | undefined;
  // Try the global function first (legacy or native renderers assigned to window).
  let candidate: (() => void) | undefined;
  if (typeof runtime?.[name] === "function") {
    candidate = runtime[name] as () => void;
  } else {
    // Fall back to the engine runtime context rendering adapter (e.g. drawCells).
    const agmCtx = (
      runtime as { __agmActiveEngineRuntimeContext?: { rendering?: Record<string, unknown> } }
    )?.__agmActiveEngineRuntimeContext;
    const adapterFn = agmCtx?.rendering?.[name];
    if (typeof adapterFn === "function") candidate = adapterFn as () => void;
  }
  if (!candidate) return;
  try {
    candidate();
  } catch (error) {
    if (getRuntime()?.ERROR) {
      console.error(`[AGM native renderer] ${name} failed`, error);
    }
  }
}

const runtime = getRuntime();
if (runtime) {
  if (typeof runtime.Rulers !== "function") {
    runtime.Rulers = class NativeRulers {
      data: unknown[] = [];

      remove(id: number) {
        this.data.splice(id, 1);
      }
    };
  }

  installFallback(runtime, "tip", (message, _main, type = "info") => {
    const method =
      type === "error" ? "error" : type === "warn" ? "warn" : "log";
    console[method](message);
  });

  installFallback(runtime, "applyStyleOnLoad", applyNativeStyleOnLoad);
  installFallback(runtime, "applyStoredOptions", () => undefined);
  installFallback(runtime, "applyLayersPreset", applyNativeLayersPreset);
  installFallback(runtime, "getColorScheme", nativeGetColorScheme);
  installFallback(runtime, "getColor", nativeGetColor);
  installFallback(runtime, "getFriendlyHeight", ([x, y]) => {
    const runtimeRecord = runtime as Record<string, any>;
    const packCell = runtimeRecord.pack?.cells?.p
      ? findClosestCell(x, y, undefined, runtimeRecord.pack)
      : undefined;
    const gridCell = runtimeRecord.grid
      ? findGridCell(x, y, runtimeRecord.grid)
      : undefined;
    const packHeight =
      packCell === undefined
        ? undefined
        : runtimeRecord.pack?.cells?.h?.[packCell];
    const gridHeight =
      gridCell === undefined
        ? undefined
        : runtimeRecord.grid?.cells?.h?.[gridCell];
    const rawHeight =
      packHeight === undefined || packHeight < 20 ? gridHeight : packHeight;
    if (typeof rawHeight !== "number") return "0 m";

    const unit =
      typeof runtimeRecord.heightUnit === "string"
        ? runtimeRecord.heightUnit
        : "m";
    const exponent = Number(runtimeRecord.heightExponent) || 1.8;
    let unitRatio = 3.281;
    if (unit === "m") unitRatio = 1;
    else if (unit === "f") unitRatio = 0.5468;

    let height = -990;
    if (rawHeight >= 20) height = (rawHeight - 18) ** exponent;
    else if (rawHeight > 0) height = ((rawHeight - 20) / rawHeight) * 50;

    const rounded =
      typeof runtimeRecord.rn === "function"
        ? runtimeRecord.rn(height * unitRatio)
        : Math.round(height * unitRatio);
    return `${rounded} ${unit}`;
  });
  installFallback(runtime, "restoreDefaultEvents", () => undefined);
  installFallback(runtime, "initiateAutosave", async () => undefined);
  installFallback(
    runtime,
    "locked",
    (settingId) =>
      getDocument()?.getElementById(settingId)?.classList.contains("locked") ??
      false,
  );
  installFallback(runtime, "stored", (settingId) => {
    try {
      return globalThis.localStorage?.getItem(settingId) ?? null;
    } catch {
      return null;
    }
  });
  installFallback(runtime, "unlock", (settingId) => {
    getDocument()?.getElementById(settingId)?.classList.remove("locked");
  });
  installFallback(runtime, "randomizeOptions", () => {
    runtime.EngineOptionsSession?.randomizeOptions?.();
  });
  installFallback(runtime, "layerIsOn", (layerId) =>
    isPressedLayerControl(layerId),
  );

  // Install native draw functions for layers that have no legacy engine counterpart.
  // These only install if no existing function of the same name is already on globalThis.
  if (typeof (runtime as Record<string, unknown>).drawGrid !== "function") {
    (runtime as Record<string, unknown>).drawGrid = drawNativeGrid;
  }
  if (typeof (runtime as Record<string, unknown>).drawTexture !== "function") {
    (runtime as Record<string, unknown>).drawTexture = drawNativeTexture;
  }
  if (typeof (runtime as Record<string, unknown>).drawCells !== "function") {
    (runtime as Record<string, unknown>).drawCells = drawNativeCells;
  }
  if (typeof (runtime as Record<string, unknown>).drawPopulation !== "function") {
    (runtime as Record<string, unknown>).drawPopulation = drawNativePopulation;
  }
  if (typeof (runtime as Record<string, unknown>).drawCoordinates !== "function") {
    // Coordinates require D3 geo + mapCoordinates globals which are not available natively.
    // The toggle still works for CSS show/hide on the #coordinates SVG element.
    (runtime as Record<string, unknown>).drawCoordinates = () => {};
  }
  if (typeof (runtime as Record<string, unknown>).drawPrecipitation !== "function") {
    // Precipitation requires per-cell precip data which is not currently generated in native mode.
    // The toggle still works for CSS show/hide on the #prec SVG element.
    (runtime as Record<string, unknown>).drawPrecipitation = () => {};
  }

  installFallback(runtime, "drawLayers", () => {
    ensureNativeHeightmapStyleDefaults();
    if (!DEFAULT_VISIBLE_LAYERS.some(isPressedLayerControl)) {
      applyNativeLayersPreset();
    }

    callOptionalDraw("drawFeatures");
    if (isPressedLayerControl("toggleTexture")) callOptionalDraw("drawTexture");
    if (isPressedLayerControl("toggleHeight"))
      callOptionalDraw("drawHeightmap");
    if (isPressedLayerControl("toggleBiomes")) callOptionalDraw("drawBiomes");
    if (isPressedLayerControl("toggleCells")) callOptionalDraw("drawCells");
    if (isPressedLayerControl("toggleGrid")) callOptionalDraw("drawGrid");
    if (isPressedLayerControl("toggleCoordinates"))
      callOptionalDraw("drawCoordinates");
    if (isPressedLayerControl("toggleCompass"))
      setLayerVisible("toggleCompass", true);
    else setLayerVisible("toggleCompass", false);
    if (isPressedLayerControl("toggleRivers")) callOptionalDraw("drawRivers");
    if (isPressedLayerControl("toggleRelief"))
      callOptionalDraw("drawReliefIcons");
    if (isPressedLayerControl("toggleReligions"))
      callOptionalDraw("drawReligions");
    if (isPressedLayerControl("toggleCultures"))
      callOptionalDraw("drawCultures");
    if (isPressedLayerControl("toggleStates")) callOptionalDraw("drawStates");
    if (isPressedLayerControl("toggleProvinces"))
      callOptionalDraw("drawProvinces");
    if (isPressedLayerControl("toggleZones")) callOptionalDraw("drawZones");
    if (isPressedLayerControl("toggleBorders")) callOptionalDraw("drawBorders");
    if (isPressedLayerControl("toggleRoutes")) callOptionalDraw("drawRoutes");
    if (isPressedLayerControl("toggleTemperature"))
      callOptionalDraw("drawTemperature");
    if (isPressedLayerControl("togglePopulation"))
      callOptionalDraw("drawPopulation");
    if (isPressedLayerControl("toggleIce")) callOptionalDraw("drawIce");
    if (isPressedLayerControl("togglePrecipitation"))
      callOptionalDraw("drawPrecipitation");
    if (isPressedLayerControl("toggleEmblems")) callOptionalDraw("drawEmblems");
    if (isPressedLayerControl("toggleLabels")) callOptionalDraw("drawLabels");
    if (isPressedLayerControl("toggleBurgIcons"))
      callOptionalDraw("drawBurgIcons");
    if (isPressedLayerControl("toggleMilitary"))
      callOptionalDraw("drawMilitary");
    if (isPressedLayerControl("toggleMarkers")) callOptionalDraw("drawMarkers");
    if (isPressedLayerControl("toggleRulers")) {
      const rulers = (runtime as Record<string, any>).rulers;
      if (typeof rulers?.draw === "function") rulers.draw();
    }
  });
  if (typeof (runtime as Record<string, unknown>).drawStates !== "function") {
    (runtime as Record<string, unknown>).drawStates = drawNativeStates;
  }
  for (const layerId of LAYER_ACTIONS) {
    installFallback(
      runtime,
      layerId as keyof RuntimeFunctionMap,
      (() => {
        const nextVisible = !isPressedLayerControl(layerId);
        setLayerVisible(layerId, nextVisible);
        runtime.drawLayers?.();
      }) as RuntimeFunctionMap[keyof RuntimeFunctionMap],
    );
  }
  installFallback(runtime, "clearLegend", () => {
    try {
      runtime.legend?.selectAll?.("*")?.remove?.();
    } catch {
      // Legend cleanup is optional in the native shell.
    }
  });
  installFallback(runtime, "editUnits", () => {
    runtime.EngineNoticeService?.showModal?.({
      title: "Units",
      html: "Units are not available in the native zero-legacy shell yet.",
    });
  });
}

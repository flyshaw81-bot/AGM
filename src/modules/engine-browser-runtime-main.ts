import { interpolateSpectral } from "../utils/interpolateUtils";
import { scaleSequential } from "../utils/scaleUtils";
import { curveBasis, line as lineGenerator } from "../utils/shapeUtils";
import { select } from "../utils/svgSelection";
import { type ZoomTransform, zoom, zoomIdentity } from "../utils/zoomBehavior";
import { installAgmRuntimeDataFacade } from "./agm-runtime-data-facade";

type RuntimeWindow = Window &
  Record<string, any> & {
    [key: string]: any;
  };

function getRuntime(): RuntimeWindow {
  return window as RuntimeWindow;
}

const runtime = getRuntime();

// set debug options
const PRODUCTION =
  location.hostname &&
  location.hostname !== "localhost" &&
  location.hostname !== "127.0.0.1";
const DEBUG = JSON.safeParse(localStorage.getItem("debug") || "{}") || {};
const INFO = true;
const TIME = true;
const WARN = true;
const ERROR = true;

Object.assign(runtime, { DEBUG, INFO, TIME, WARN, ERROR });
installAgmRuntimeDataFacade(
  {
    createGeneratedWorld: () =>
      runtime.EngineStartupService.generateMapOnLoad(),
  },
  runtime,
);

// detect device
const MOBILE =
  window.innerWidth < 600 || (navigator as any).userAgentData?.mobile;
runtime.MOBILE = MOBILE;

if (PRODUCTION && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("ServiceWorker registration failed: ", error);
    });
  });
}

// append svg layers (in default order)
const svg = select<SVGSVGElement>("#map");
const defs = svg.select("#deftemp");
const viewbox = svg.select("#viewbox");
const scaleBar = svg.select("#scaleBar");
const legend = svg.append("g").attr("id", "legend");
const ocean = viewbox.append("g").attr("id", "ocean");
const oceanLayers = ocean.append("g").attr("id", "oceanLayers");
const oceanPattern = ocean.append("g").attr("id", "oceanPattern");
const lakes = viewbox.append("g").attr("id", "lakes");
const landmass = viewbox.append("g").attr("id", "landmass");
const texture = viewbox.append("g").attr("id", "texture");
const terrs = viewbox.append("g").attr("id", "terrs");
const biomes = viewbox.append("g").attr("id", "biomes");
const cells = viewbox.append("g").attr("id", "cells");
const gridOverlay = viewbox.append("g").attr("id", "gridOverlay");
const coordinates = viewbox.append("g").attr("id", "coordinates");
const compass = viewbox
  .append("g")
  .attr("id", "compass")
  .style("display", "none");
const rivers = viewbox.append("g").attr("id", "rivers");
const terrain = viewbox.append("g").attr("id", "terrain");
const relig = viewbox.append("g").attr("id", "relig");
const cults = viewbox.append("g").attr("id", "cults");
const regions = viewbox.append("g").attr("id", "regions");
const statesBody = regions.append("g").attr("id", "statesBody");
const statesHalo = regions.append("g").attr("id", "statesHalo");
const provs = viewbox.append("g").attr("id", "provs");
const zones = viewbox.append("g").attr("id", "zones");
const borders = viewbox.append("g").attr("id", "borders");
const stateBorders = borders.append("g").attr("id", "stateBorders");
const provinceBorders = borders.append("g").attr("id", "provinceBorders");
const routes = viewbox.append("g").attr("id", "routes");
const roads = routes.append("g").attr("id", "roads");
const trails = routes.append("g").attr("id", "trails");
const searoutes = routes.append("g").attr("id", "searoutes");
const temperature = viewbox.append("g").attr("id", "temperature");
const coastline = viewbox.append("g").attr("id", "coastline");
const ice = viewbox.append("g").attr("id", "ice");
const prec = viewbox.append("g").attr("id", "prec").style("display", "none");
const population = viewbox.append("g").attr("id", "population");
const emblems = viewbox
  .append("g")
  .attr("id", "emblems")
  .style("display", "none");
const icons = viewbox.append("g").attr("id", "icons");
const labels = viewbox.append("g").attr("id", "labels");
const burgIcons = icons.append("g").attr("id", "burgIcons");
const anchors = icons.append("g").attr("id", "anchors");
const armies = viewbox.append("g").attr("id", "armies");
const markers = viewbox.append("g").attr("id", "markers");
const fogging = viewbox
  .append("g")
  .attr("id", "fogging-cont")
  .attr("mask", "url(#fog)")
  .append("g")
  .attr("id", "fogging")
  .style("display", "none");
const ruler = viewbox.append("g").attr("id", "ruler").style("display", "none");
const debug = viewbox.append("g").attr("id", "debug");

Object.assign(runtime, {
  svg,
  defs,
  viewbox,
  scaleBar,
  legend,
  ocean,
  oceanLayers,
  oceanPattern,
  lakes,
  landmass,
  texture,
  terrs,
  biomes,
  cells,
  gridOverlay,
  coordinates,
  compass,
  rivers,
  terrain,
  relig,
  cults,
  regions,
  statesBody,
  statesHalo,
  provs,
  zones,
  borders,
  stateBorders,
  provinceBorders,
  routes,
  roads,
  trails,
  searoutes,
  temperature,
  coastline,
  ice,
  prec,
  population,
  emblems,
  icons,
  labels,
  burgIcons,
  anchors,
  armies,
  markers,
  fogging,
  ruler,
  debug,
});

lakes.append("g").attr("id", "freshwater");
lakes.append("g").attr("id", "salt");
lakes.append("g").attr("id", "sinkhole");
lakes.append("g").attr("id", "frozen");
lakes.append("g").attr("id", "lava");
lakes.append("g").attr("id", "dry");

coastline.append("g").attr("id", "sea_island");
coastline.append("g").attr("id", "lake_island");

terrs.append("g").attr("id", "oceanHeights");
terrs.append("g").attr("id", "landHeights");

labels.append("g").attr("id", "states");
labels.append("g").attr("id", "addedLabels");
const burgLabels = labels.append("g").attr("id", "burgLabels");
runtime.burgLabels = burgLabels;

// population groups
population.append("g").attr("id", "rural");
population.append("g").attr("id", "urban");

// emblem groups
emblems.append("g").attr("id", "burgEmblems");
emblems.append("g").attr("id", "provinceEmblems");
emblems.append("g").attr("id", "stateEmblems");

// compass
compass.append("use").attr("xlink:href", "#defs-compass-rose");

// fogging
fogging
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", "100%")
  .attr("height", "100%");
fogging
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "#e8f0f6")
  .attr("filter", "url(#splotch)");

// assign events separately as not a viewbox child
scaleBar
  .on("mousemove", () => runtime.tip("Click to open Units Editor"))
  .on("click", () => runtime.editUnits());
legend
  .on("mousemove", () =>
    runtime.tip("Drag to change the position. Click to hide the legend"),
  )
  .on("click", () => runtime.clearLegend());

// main data variables
runtime.grid = {}; // initial graph based on jittered square grid and data
runtime.pack = {}; // packed graph and data
runtime.seed = undefined;
runtime.mapHistory = [];
runtime.elSelected = undefined;
runtime.modules = {};
runtime.notes = [];
runtime.rulers = new runtime.Rulers();
runtime.customization = 0;

runtime.EngineCanvasClearService = runtime.createEngineCanvasClearService({
  clearMapNodes: (selector: string) => viewbox.selectAll(selector).remove(),
  clearDefinitionNodes: () => {
    const deftemp = runtime.byId("deftemp");
    if (!deftemp) return;
    deftemp
      .querySelectorAll("path, clipPath, svg")
      .forEach((element: Element) => {
        element.remove();
      });
  },
  clearGeneratedEmblems: () => {
    const coas = runtime.byId("coas");
    if (coas) coas.innerHTML = "";
  },
  resetNotes: () => {
    runtime.notes = [];
  },
  unfog: () => runtime.unfog(),
});
runtime.undraw = () => runtime.EngineCanvasClearService.undraw();

// global options; in v2.0 to be used for all UI settings
runtime.options = {
  pinNotes: false,
  winds: [225, 45, 225, 315, 135, 315],
  temperatureEquator: 27,
  temperatureNorthPole: -30,
  temperatureSouthPole: -15,
  stateLabelsMode: "auto",
  showBurgPreview: true,
  burgs: {
    groups:
      JSON.safeParse(localStorage.getItem("burg-groups") || "null") ||
      runtime.Burgs.getDefaultGroups(),
  },
};

// global style object; in v2.0 to be used for all map styles and render settings
runtime.style = { burgLabels: {}, burgIcons: {}, anchors: {} };

runtime.biomesData = runtime.Biomes.getDefault();
runtime.nameBases = runtime.Names.getNameBases(); // cultures-related data
runtime.color = scaleSequential(interpolateSpectral); // default color scheme
runtime.lineGen = lineGenerator().curve(curveBasis); // line generator with default curve interpolation

// d3 zoom behavior
runtime.scale = 1;
runtime.viewX = 0;
runtime.viewY = 0;

let rafId: number | null = null;
let pendingScaleChange = false;
let pendingPositionChange = false;

function zoomRaf(event: { transform: ZoomTransform }) {
  const { k, x, y } = event.transform;

  const isScaleChanged = Boolean(runtime.scale - k);
  const isPositionChanged = Boolean(runtime.viewX - x || runtime.viewY - y);
  if (!isScaleChanged && !isPositionChanged) return;

  runtime.scale = k;
  runtime.viewX = x;
  runtime.viewY = y;

  pendingScaleChange = pendingScaleChange || isScaleChanged;
  pendingPositionChange = pendingPositionChange || isPositionChanged;

  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;

    const didScaleChange = pendingScaleChange;
    const didPositionChange = pendingPositionChange;
    pendingScaleChange = false;
    pendingPositionChange = false;

    viewbox.attr(
      "transform",
      `translate(${runtime.viewX} ${runtime.viewY}) scale(${runtime.scale})`,
    );

    if (didPositionChange) {
      if (runtime.layerIsOn("toggleCoordinates")) runtime.drawCoordinates();
    }

    if (runtime.customization === 1) {
      const canvas = runtime.byId("canvas") as HTMLCanvasElement | null;
      if (canvas && canvas.style.opacity !== "0") {
        const image = runtime.byId("imageToConvert") as HTMLImageElement | null;
        if (image) {
          const context = canvas.getContext("2d");
          context?.clearRect(0, 0, canvas.width, canvas.height);
          context?.setTransform(
            runtime.scale,
            0,
            0,
            runtime.scale,
            runtime.viewX,
            runtime.viewY,
          );
          context?.drawImage(image, 0, 0, canvas.width, canvas.height);
        }
      }
    }

    if (didScaleChange) postZoom();
  });
}

const postZoom = () => {
  runtime.invokeActiveZooming();
  runtime.drawScaleBar(scaleBar, runtime.scale);
  runtime.fitScaleBar(scaleBar, runtime.svgWidth, runtime.svgHeight);
};

const zoomBehavior = zoom().scaleExtent([1, 20]).on("zoom", zoomRaf);
svg.call((sel) => zoomBehavior.apply(sel));

runtime.EngineViewportService = runtime.createEngineViewportService({
  getViewportSize: () => ({
    svgWidth: runtime.svgWidth,
    svgHeight: runtime.svgHeight,
  }),
  getScale: () => runtime.scale,
  getCustomization: () => runtime.customization,
  getShapeRenderingMode: () => runtime.shapeRendering.value,
  createZoomTransform: (x: number, y: number, z: number) =>
    zoomIdentity.translate(x, y).scale(z),
  getIdentityTransform: () => zoomIdentity,
  applyZoomTransform: (transform: unknown, duration: number) =>
    zoomBehavior.transformTo(
      { _config: { _duration: duration, _ease: (t: number) => t } },
      transform as ZoomTransform,
    ),
  isCoastlineAutoFilterEnabled: () =>
    Boolean(
      coastline.select("#sea_island").size() &&
        +coastline.select("#sea_island").attr("auto-filter"),
    ),
  setCoastlineFilter: (filter: string | null) =>
    coastline.select("#sea_island").attr("filter", filter),
  areLabelsVisible: () => labels.style("display") !== "none",
  forEachLabelGroup: (callback) =>
    labels.selectAll("g").each(function eachLabelGroup(this: Element) {
      callback(this as any);
    }),
  shouldRescaleLabels: () => runtime.rescaleLabels.checked,
  shouldHideLabels: () => runtime.hideLabels.checked,
  areEmblemsVisible: () => emblems.style("display") !== "none",
  forEachEmblemGroup: (callback) =>
    emblems.selectAll("g").each(function eachEmblemGroup(this: Element) {
      callback(this as any);
    }),
  shouldHideEmblems: () => runtime.hideEmblems.checked,
  hasCoaRenderer: () => Boolean(runtime.COArenderer),
  renderGroupCOAs: (node) => runtime.renderGroupCOAs(node as any),
  getStatesHaloWidth: () => +statesHalo.attr("data-width"),
  setStatesHalo: (strokeWidth: number, display: string) =>
    statesHalo.attr("stroke-width", strokeWidth).style("display", display),
  shouldRescaleMarkers: () => Boolean(+markers.attr("rescale")),
  getMarkers: () => runtime.pack.markers || [],
  getElementById: (id: string) => runtime.byId(id) || null,
  isRulerVisible: () => ruler.style("display") !== "none",
  setRulerTextSize: (fontSize: number) =>
    ruler.selectAll("text").attr("font-size", fontSize),
  round: runtime.rn,
});
runtime.zoomTo = (x: number, y: number, z?: number, d?: number) =>
  runtime.EngineViewportService.zoomTo(x, y, z, d);
runtime.resetZoom = (duration?: number) =>
  runtime.EngineViewportService.resetZoom(duration);
runtime.invokeActiveZooming = () =>
  runtime.EngineViewportService.invokeActiveZooming();

runtime.mapCoordinates = {}; // map coordinates on globe
if (!runtime.EngineRuntimeDefaults) {
  throw new Error("EngineRuntimeDefaults is not installed");
}
runtime.EngineRuntimeDefaults.mountDefaults(runtime);

runtime.applyStoredOptions();

// voronoi graph extension, cannot be changed after generation
runtime.graphWidth = +runtime.mapWidthInput.value;
runtime.graphHeight = +runtime.mapHeightInput.value;

// svg canvas resolution, can be changed
runtime.svgWidth = runtime.graphWidth;
runtime.svgHeight = runtime.graphHeight;

runtime.EngineViewportSizeService = runtime.createEngineViewportSizeService({
  setLocalViewportSize: (width: number, height: number) => {
    runtime.svgWidth = width;
    runtime.svgHeight = height;
  },
  setRuntimeViewportSize: (width: number, height: number) => {
    runtime.svgWidth = width;
    runtime.svgHeight = height;
  },
});
runtime.EngineViewportSizeService.mountGlobalEntry(runtime);

landmass
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", runtime.graphWidth)
  .attr("height", runtime.graphHeight);
oceanPattern
  .append("rect")
  .attr("fill", "url(#oceanic)")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", runtime.graphWidth)
  .attr("height", runtime.graphHeight);
oceanLayers
  .append("rect")
  .attr("id", "oceanBase")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", runtime.graphWidth)
  .attr("height", runtime.graphHeight);

runtime
  .createEngineStartupLifecycle({
    isServerless: () => !location.hostname,
    showServerlessNotice: () =>
      runtime.EngineNoticeService.showModal({
        title: "Loading error",
        html: `AGM Studio cannot run serverless. Follow the <a href="docs/Run-AGM-locally" target="_blank">instructions</a> on how you can easily run a local web-server`,
        width: "28em",
        position: { my: "center center-4em", at: "center", of: "svg" },
      }),
    hideLoading: () => runtime.hideLoading(),
    checkLoadParameters: () =>
      runtime.EngineStartupService.checkLoadParameters(),
    restoreDefaultEvents: () => runtime.restoreDefaultEvents(),
    initiateAutosave: () => runtime.initiateAutosave(),
    getReadyState: () => document.readyState,
    onDomContentLoaded: (callback: () => void) =>
      document.addEventListener("DOMContentLoaded", callback, { once: true }),
  })
  .install();

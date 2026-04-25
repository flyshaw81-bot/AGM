import {getPresetById} from "../canvas/presets";
import type {FitMode, Orientation} from "../types";

const STAGE_PADDING = 48;

type LegacyDocumentBaseline = {
  mapId: string;
  name: string;
  documentWidth: number;
  documentHeight: number;
  seed: string;
  stylePreset: string;
};

function getLegacyDocumentBaselineStore() {
  return globalThis as typeof globalThis & {
    __studioLegacyDocumentBaseline?: LegacyDocumentBaseline;
  };
}

function getLegacyDocumentBaselineCandidate() {
  const stylePreset = (window as any).stylePreset?.value || localStorage.getItem("presetStyle") || "default";
  const seed = (window as any).seed || (window as any).optionsSeed?.value || "";
  const name = (window as any).mapName?.value || "Untitled map";
  const map = document.getElementById("map") as SVGSVGElement | null;
  const viewBox = document.getElementById("viewbox");
  const mapWidthAttr = +(map?.getAttribute("width") || 0);
  const mapHeightAttr = +(map?.getAttribute("height") || 0);
  const documentWidth =
    (window as any).graphWidth ||
    +(window as any).mapWidthInput?.value ||
    mapWidthAttr ||
    viewBox?.getBoundingClientRect().width ||
    0;
  const documentHeight =
    (window as any).graphHeight ||
    +(window as any).mapHeightInput?.value ||
    mapHeightAttr ||
    viewBox?.getBoundingClientRect().height ||
    0;

  return {
    mapId: String((window as any).mapId || ""),
    name,
    documentWidth,
    documentHeight,
    seed,
    stylePreset,
  } satisfies LegacyDocumentBaseline;
}

export function markLegacyDocumentClean() {
  getLegacyDocumentBaselineStore().__studioLegacyDocumentBaseline = getLegacyDocumentBaselineCandidate();
}

export function getLegacyDocumentState() {
  const baselineStore = getLegacyDocumentBaselineStore();
  const current = getLegacyDocumentBaselineCandidate();
  const baseline = baselineStore.__studioLegacyDocumentBaseline;

  if (!baseline || (!baseline.mapId && current.mapId) || baseline.mapId !== current.mapId) {
    baselineStore.__studioLegacyDocumentBaseline = current;
  }

  const effectiveBaseline = baselineStore.__studioLegacyDocumentBaseline!;
  const dirty =
    effectiveBaseline.name !== current.name ||
    effectiveBaseline.seed !== current.seed ||
    effectiveBaseline.stylePreset !== current.stylePreset ||
    effectiveBaseline.documentWidth !== current.documentWidth ||
    effectiveBaseline.documentHeight !== current.documentHeight;

  return {
    name: current.name,
    documentWidth: current.documentWidth,
    documentHeight: current.documentHeight,
    seed: current.seed,
    stylePreset: current.stylePreset,
    dirty,
    source: "legacy" as const,
  };
}

export function setLegacyDocumentName(name: string) {
  const nextName = name.trim() || "Untitled map";
  const mapName = (window as any).mapName as HTMLInputElement | undefined;
  if (mapName) {
    mapName.value = nextName;
    mapName.dispatchEvent(new Event("input", {bubbles: true}));
    mapName.dispatchEvent(new Event("change", {bubbles: true}));
  }
  return nextName;
}

export function syncLegacyViewport(presetId: string, orientation: Orientation, fitMode: FitMode) {
  const preset = getPresetById(presetId);
  const width = orientation === preset.orientation ? preset.width : preset.height;
  const height = orientation === preset.orientation ? preset.height : preset.width;

  const frame = document.getElementById("studioCanvasFrame");
  const stage = document.getElementById("studioStageViewport");
  const map = document.getElementById("map") as SVGSVGElement | null;
  if (!frame || !stage || !map) return;

  frame.style.width = `${width}px`;
  frame.style.height = `${height}px`;
  frame.dataset.orientation = orientation;
  frame.dataset.fitMode = fitMode;

  const stageRect = stage.getBoundingClientRect();
  const availableWidth = Math.max(stageRect.width - STAGE_PADDING * 2, 320);
  const availableHeight = Math.max(stageRect.height - STAGE_PADDING * 2, 320);
  const scaleX = availableWidth / width;
  const scaleY = availableHeight / height;
  const scale = fitMode === "cover" ? Math.max(scaleX, scaleY) : fitMode === "actual-size" ? 1 : Math.min(scaleX, scaleY);

  frame.style.transform = `scale(${Math.max(scale, 0.1)})`;

  if ((window as any).svg) {
    const nextWidth = Math.round(width);
    const nextHeight = Math.round(height);
    (window as any).svgWidth = nextWidth;
    (window as any).svgHeight = nextHeight;
    (window as any).svg.attr("width", nextWidth).attr("height", nextHeight);

    if ((window as any).zoom && (window as any).graphWidth && (window as any).graphHeight) {
      const graphWidth = (window as any).graphWidth;
      const graphHeight = (window as any).graphHeight;
      const zoomMin = (window as any).rn ? (window as any).rn(Math.max(nextWidth / graphWidth, nextHeight / graphHeight), 3) : Math.max(nextWidth / graphWidth, nextHeight / graphHeight);
      const zoomMax = +(window as any).zoomExtentMax?.value || 20;
      (window as any).zoom.translateExtent([[0, 0], [graphWidth, graphHeight]]).scaleExtent([zoomMin, zoomMax]);
    }

    if ((window as any).fitScaleBar && (window as any).scaleBar) {
      (window as any).fitScaleBar((window as any).scaleBar, nextWidth, nextHeight);
    }
    if ((window as any).fitLegendBox) {
      (window as any).fitLegendBox();
    }
  }
}

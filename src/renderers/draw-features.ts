import type { EngineRuntimeContext } from "../modules/engine-runtime-context";
import type { PackedGraphFeature } from "../modules/features";
import { clipPoly, round } from "../utils";
import { curveBasisClosed, line } from "../utils/shapeUtils";
import { simplify } from "../utils/simplify";
import { select } from "../utils/svgSelection";
import { createBrowserRendererContext } from "./renderer-runtime-context";

declare global {
  var drawFeatures: () => void;
  var getFeaturePath: (feature: PackedGraphFeature) => string;
}

interface FeaturesHtml {
  paths: string[];
  landMask: string[];
  waterMask: string[];
  coastline: { [key: string]: string[] };
  lakes: { [key: string]: string[] };
}

export type FeatureRendererLogTargets = {
  error: (...args: unknown[]) => void;
};

const getWindow = (): (Window & typeof globalThis) | undefined => {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
};

const getErrorFlag = (): boolean => {
  try {
    return Boolean(globalThis.ERROR);
  } catch {
    return false;
  }
};

export function createGlobalFeatureRendererLogTargets(): FeatureRendererLogTargets {
  return {
    error: (...args) => {
      if (getErrorFlag()) console.error(...args);
    },
  };
}

function getBrowserContext(): EngineRuntimeContext {
  return createBrowserRendererContext();
}

export const featuresRenderer = (context: EngineRuntimeContext): void => {
  context.timing.shouldTime && console.time("drawFeatures");

  const html: FeaturesHtml = {
    paths: [],
    landMask: [],
    waterMask: ['<rect x="0" y="0" width="100%" height="100%" fill="white" />'],
    coastline: {},
    lakes: {},
  };

  for (const feature of context.pack.features) {
    if (!feature || feature.type === "ocean") continue;

    html.paths.push(
      `<path d="${renderFeaturePath(feature, context)}" id="feature_${feature.i}" data-f="${feature.i}"></path>`,
    );

    if (feature.type === "lake") {
      html.landMask.push(
        `<use href="#feature_${feature.i}" data-f="${feature.i}" fill="black"></use>`,
      );

      const lakeGroup = feature.group || "freshwater";
      if (!html.lakes[lakeGroup]) html.lakes[lakeGroup] = [];
      html.lakes[lakeGroup].push(
        `<use href="#feature_${feature.i}" data-f="${feature.i}"></use>`,
      );
    } else {
      html.landMask.push(
        `<use href="#feature_${feature.i}" data-f="${feature.i}" fill="white"></use>`,
      );
      html.waterMask.push(
        `<use href="#feature_${feature.i}" data-f="${feature.i}" fill="black"></use>`,
      );

      const coastlineGroup =
        feature.group === "lake_island" ? "lake_island" : "sea_island";
      if (!html.coastline[coastlineGroup]) html.coastline[coastlineGroup] = [];
      html.coastline[coastlineGroup].push(
        `<use href="#feature_${feature.i}" data-f="${feature.i}"></use>`,
      );
    }
  }

  defs.select("#featurePaths").html(html.paths.join(""));
  defs.select("#land").html(html.landMask.join(""));
  defs.select("#water").html(html.waterMask.join(""));

  coastline.selectAll<SVGGElement, unknown>("g").each(function () {
    const paths = html.coastline[this.id] || [];
    select(this).html(paths.join(""));
  });

  lakes.selectAll<SVGGElement, unknown>("g").each(function () {
    const paths = html.lakes[this.id] || [];
    select(this).html(paths.join(""));
  });

  context.timing.shouldTime && console.timeEnd("drawFeatures");
};

export function renderFeaturePath(
  feature: PackedGraphFeature,
  contextOrLogTargets:
    | EngineRuntimeContext
    | FeatureRendererLogTargets = getBrowserContext(),
  logTargets: FeatureRendererLogTargets = createGlobalFeatureRendererLogTargets(),
): string {
  const context =
    "pack" in contextOrLogTargets ? contextOrLogTargets : getBrowserContext();
  const logger =
    "pack" in contextOrLogTargets ? logTargets : contextOrLogTargets;
  const points: [number, number][] = feature.vertices.map(
    (vertex: number) => context.pack.vertices.p[vertex],
  );
  if (points.some((point) => point === undefined)) {
    logger.error("Undefined point in getFeaturePath");
    return "";
  }

  const simplifiedPoints = simplify(points, 0.3);
  const clippedPoints = clipPoly(
    simplifiedPoints,
    context.worldSettings.graphWidth ?? 0,
    context.worldSettings.graphHeight ?? 0,
  );

  const lineGen = line().curve(curveBasisClosed);
  const path = `${round(lineGen(clippedPoints) || "")}Z`;

  return path;
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.drawFeatures = () => featuresRenderer(getBrowserContext());
  runtimeWindow.getFeaturePath = renderFeaturePath;
}

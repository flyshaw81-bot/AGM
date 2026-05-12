import type { EngineRuntimeContext } from "../modules/engine-runtime-context";
import { createBrowserRendererContext } from "./renderer-runtime-context";

declare global {
  var drawIce: () => void;
  var redrawIceberg: (id: number) => void;
  var redrawGlacier: (id: number) => void;
}

interface IceElement {
  i: number;
  points: string | [number, number][];
  type: "glacier" | "iceberg";
  offset?: [number, number];
}

const getWindow = (): (Window & typeof globalThis) | undefined => {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
};

export const iceRenderer = (context: EngineRuntimeContext): void => {
  context.timing.shouldTime && console.time("drawIce");

  // Clear existing ice SVG
  ice.selectAll("*").remove();

  let html = "";

  // Draw all ice elements
  context.pack.ice.forEach((iceElement: IceElement) => {
    if (iceElement.type === "glacier") {
      html += getGlacierHtml(iceElement);
    } else if (iceElement.type === "iceberg") {
      html += getIcebergHtml(iceElement);
    }
  });

  ice.html(html);

  context.timing.shouldTime && console.timeEnd("drawIce");
};

export const redrawIcebergRenderer = (
  context: EngineRuntimeContext,
  id: number,
): void => {
  context.timing.shouldTime && console.time("redrawIceberg");
  const iceberg = context.pack.ice.find(
    (element: IceElement) => element.i === id,
  );
  let el = ice.selectAll<SVGPolygonElement, unknown>(
    `polygon[data-id="${id}"]:not([type="glacier"])`,
  );
  if (!iceberg && !el.empty()) {
    el.remove();
  } else if (iceberg) {
    if (el.empty()) {
      // Create new element if it doesn't exist
      const polygon = getIcebergHtml(iceberg);
      (ice.node() as SVGGElement).insertAdjacentHTML("beforeend", polygon);
      el = ice.selectAll<SVGPolygonElement, unknown>(
        `polygon[data-id="${id}"]:not([type="glacier"])`,
      );
    }
    el.attr("points", iceberg.points as string);
    el.attr(
      "transform",
      iceberg.offset
        ? `translate(${iceberg.offset[0]},${iceberg.offset[1]})`
        : null,
    );
  }
  context.timing.shouldTime && console.timeEnd("redrawIceberg");
};

export const redrawGlacierRenderer = (
  context: EngineRuntimeContext,
  id: number,
): void => {
  context.timing.shouldTime && console.time("redrawGlacier");
  const glacier = context.pack.ice.find(
    (element: IceElement) => element.i === id,
  );
  let el = ice.selectAll<SVGPolygonElement, unknown>(
    `polygon[data-id="${id}"][type="glacier"]`,
  );
  if (!glacier && !el.empty()) {
    el.remove();
  } else if (glacier) {
    if (el.empty()) {
      // Create new element if it doesn't exist
      const polygon = getGlacierHtml(glacier);
      (ice.node() as SVGGElement).insertAdjacentHTML("beforeend", polygon);
      el = ice.selectAll<SVGPolygonElement, unknown>(
        `polygon[data-id="${id}"][type="glacier"]`,
      );
    }
    el.attr("points", glacier.points as string);
    el.attr(
      "transform",
      glacier.offset
        ? `translate(${glacier.offset[0]},${glacier.offset[1]})`
        : null,
    );
  }
  context.timing.shouldTime && console.timeEnd("redrawGlacier");
};

function getGlacierHtml(glacier: IceElement): string {
  return `<polygon points="${glacier.points}" type="glacier" data-id="${glacier.i}" ${glacier.offset ? `transform="translate(${glacier.offset[0]},${glacier.offset[1]})"` : ""}/>`;
}

function getIcebergHtml(iceberg: IceElement): string {
  return `<polygon points="${iceberg.points}" data-id="${iceberg.i}" ${iceberg.offset ? `transform="translate(${iceberg.offset[0]},${iceberg.offset[1]})"` : ""}/>`;
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.drawIce = () => iceRenderer(createBrowserRendererContext());
  runtimeWindow.redrawIceberg = (id) =>
    redrawIcebergRenderer(createBrowserRendererContext(), id);
  runtimeWindow.redrawGlacier = (id) =>
    redrawGlacierRenderer(createBrowserRendererContext(), id);
}

import type { FitMode, StudioState } from "../types";

type CanvasViewportGeometry = Pick<
  StudioState["viewport"],
  "fitMode" | "panX" | "panY" | "zoom"
>;

export function calculateCanvasFitScale(
  frameWidth: number,
  frameHeight: number,
  graphWidth: number,
  graphHeight: number,
  fitMode: FitMode,
) {
  if (fitMode === "actual-size") return 1;
  const scaleX = frameWidth / graphWidth;
  const scaleY = frameHeight / graphHeight;
  return fitMode === "cover"
    ? Math.max(scaleX, scaleY)
    : Math.min(scaleX, scaleY);
}

export function calculateCanvasWorldPoint(
  point: { x: number; y: number },
  frame: { width: number; height: number },
  graph: { width: number; height: number },
  viewport: CanvasViewportGeometry,
) {
  const fitScale = calculateCanvasFitScale(
    frame.width,
    frame.height,
    graph.width,
    graph.height,
    viewport.fitMode,
  );
  const contentScale = fitScale * Math.max(viewport.zoom, 0.1);
  const originX =
    (frame.width - graph.width * contentScale) / 2 + viewport.panX;
  const originY =
    (frame.height - graph.height * contentScale) / 2 + viewport.panY;

  return {
    graphHeight: graph.height,
    graphWidth: graph.width,
    x: Math.max(0, Math.min(graph.width, (point.x - originX) / contentScale)),
    y: Math.max(0, Math.min(graph.height, (point.y - originY) / contentScale)),
  };
}

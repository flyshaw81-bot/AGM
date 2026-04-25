import type {FitMode} from "../types";

export function getStageScale(
  frameWidth: number,
  frameHeight: number,
  contentWidth: number,
  contentHeight: number,
  fitMode: FitMode,
): number {
  if (!frameWidth || !frameHeight || !contentWidth || !contentHeight) return 1;

  const scaleX = frameWidth / contentWidth;
  const scaleY = frameHeight / contentHeight;

  if (fitMode === "cover") return Math.max(scaleX, scaleY);
  if (fitMode === "actual-size") return 1;
  return Math.min(scaleX, scaleY);
}

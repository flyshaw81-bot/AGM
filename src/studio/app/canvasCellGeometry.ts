export type CanvasCellPoint = [number, number];

export type NearestCanvasCell = {
  cellId: number;
  distance: number;
  point: CanvasCellPoint;
};

export function toCanvasCellPoint(value: unknown): CanvasCellPoint | null {
  if (
    !Array.isArray(value) ||
    !Number.isFinite(value[0]) ||
    !Number.isFinite(value[1])
  ) {
    return null;
  }

  return [value[0], value[1]];
}

export function findNearestCanvasCell(
  cellIds: ArrayLike<number> | undefined,
  cellPoints: Record<number, unknown> | undefined,
  point: { x: number; y: number },
): NearestCanvasCell | null {
  return (
    Array.from(cellIds || []) as number[]
  ).reduce<NearestCanvasCell | null>((nearest, cellId) => {
    const cellPoint = toCanvasCellPoint(cellPoints?.[cellId]);
    if (!cellPoint) return nearest;

    const distance = Math.hypot(cellPoint[0] - point.x, cellPoint[1] - point.y);
    return !nearest || distance < nearest.distance
      ? { cellId, distance, point: cellPoint }
      : nearest;
  }, null);
}

export function getCanvasPointPercent(value: number, max: number): number {
  return Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
}

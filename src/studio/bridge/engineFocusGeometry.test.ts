import { describe, expect, it, vi } from "vitest";
import { resolveEngineFocusGeometry } from "./engineFocusGeometry";
import type {
  EngineFocusGeometryTargets,
  EngineFocusPoint,
} from "./engineFocusGeometryTargets";

function createTargets(
  overrides: Partial<EngineFocusGeometryTargets>,
): EngineFocusGeometryTargets {
  return {
    getWidth: vi.fn(() => 1000),
    getHeight: vi.fn(() => 500),
    getCellIds: vi.fn(() => []),
    getCellPoint: vi.fn(),
    getCellFieldValue: vi.fn(),
    getState: vi.fn(),
    getProvince: vi.fn(),
    getBurg: vi.fn(),
    getRoute: vi.fn(),
    getZone: vi.fn(),
    ...overrides,
  };
}

describe("resolveEngineFocusGeometry", () => {
  it("resolves state focus from center cell through injected targets", () => {
    const targets = createTargets({
      getState: vi.fn(() => ({ center: 3 })),
      getCellPoint: vi.fn((): EngineFocusPoint => [250, 125]),
    });

    expect(
      resolveEngineFocusGeometry(
        {
          targetType: "state",
          targetId: 2,
          sourceLabel: "test",
        },
        targets,
      ),
    ).toMatchObject({
      targetType: "state",
      targetId: 2,
      x: 25,
      y: 25,
      width: 1000,
      height: 500,
    });
    expect(targets.getState).toHaveBeenCalledWith(2);
    expect(targets.getCellPoint).toHaveBeenCalledWith(3);
  });

  it("resolves province focus from average province cells", () => {
    const targets = createTargets({
      getProvince: vi.fn(() => ({})),
      getCellIds: vi.fn(() => [1, 2, 3]),
      getCellFieldValue: vi.fn((field, cellId) =>
        field === "province" && cellId !== 3 ? 7 : 0,
      ),
      getCellPoint: vi.fn((cellId) =>
        cellId === 1
          ? ([100, 100] as EngineFocusPoint)
          : cellId === 2
            ? ([300, 200] as EngineFocusPoint)
            : undefined,
      ),
    });

    expect(
      resolveEngineFocusGeometry(
        {
          targetType: "province",
          targetId: 7,
          sourceLabel: "test",
        },
        targets,
      ),
    ).toMatchObject({
      x: 20,
      y: 30,
    });
  });

  it("resolves route focus from route cells fallback", () => {
    const targets = createTargets({
      getRoute: vi.fn(() => ({ cells: [4, 5] })),
      getCellPoint: vi.fn((cellId) =>
        cellId === 4 ? ([500, 250] as EngineFocusPoint) : undefined,
      ),
    });

    expect(
      resolveEngineFocusGeometry(
        {
          targetType: "route",
          targetId: 4,
          sourceLabel: "test",
        },
        targets,
      ),
    ).toMatchObject({
      x: 50,
      y: 50,
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  DIRECT_WORKBENCH_TARGETS,
  getDirectRelationshipSourceWorkbenchTarget,
  getDirectWorkbenchModuleForTarget,
  getNativeRelationshipSourceWorkbenchTarget,
} from "./directWorkbenchTargets";

describe("directWorkbenchTargets", () => {
  it("maps relationship source entities to their editable workbench panels", () => {
    expect(getDirectRelationshipSourceWorkbenchTarget("state")).toBe(
      DIRECT_WORKBENCH_TARGETS.states,
    );
    expect(getDirectRelationshipSourceWorkbenchTarget("burg")).toBe(
      DIRECT_WORKBENCH_TARGETS.burgs,
    );
    expect(getDirectRelationshipSourceWorkbenchTarget("province")).toBe(
      DIRECT_WORKBENCH_TARGETS.provinces,
    );
    expect(getDirectRelationshipSourceWorkbenchTarget("culture")).toBeNull();
  });

  it("keeps the previous relationship workbench helper as a compatibility alias", () => {
    expect(getNativeRelationshipSourceWorkbenchTarget("state")).toBe(
      DIRECT_WORKBENCH_TARGETS.states,
    );
  });

  it("maps direct workbench targets back to product editor modules", () => {
    expect(
      getDirectWorkbenchModuleForTarget(DIRECT_WORKBENCH_TARGETS.states),
    ).toBe("states");
    expect(
      getDirectWorkbenchModuleForTarget(DIRECT_WORKBENCH_TARGETS.cultures),
    ).toBe("cultures");
    expect(
      getDirectWorkbenchModuleForTarget(DIRECT_WORKBENCH_TARGETS.military),
    ).toBe("military");
    expect(
      getDirectWorkbenchModuleForTarget(DIRECT_WORKBENCH_TARGETS.markers),
    ).toBe("markers");
    expect(getDirectWorkbenchModuleForTarget("missing")).toBeNull();
  });
});

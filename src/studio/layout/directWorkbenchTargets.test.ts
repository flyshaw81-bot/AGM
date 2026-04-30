import { describe, expect, it } from "vitest";
import {
  DIRECT_WORKBENCH_TARGETS,
  getNativeRelationshipSourceWorkbenchTarget,
} from "./directWorkbenchTargets";

describe("directWorkbenchTargets", () => {
  it("maps relationship source entities to their editable workbench panels", () => {
    expect(getNativeRelationshipSourceWorkbenchTarget("state")).toBe(
      DIRECT_WORKBENCH_TARGETS.states,
    );
    expect(getNativeRelationshipSourceWorkbenchTarget("burg")).toBe(
      DIRECT_WORKBENCH_TARGETS.burgs,
    );
    expect(getNativeRelationshipSourceWorkbenchTarget("province")).toBe(
      DIRECT_WORKBENCH_TARGETS.provinces,
    );
    expect(getNativeRelationshipSourceWorkbenchTarget("culture")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { createRelationshipRepairExportReadyOptions } from "./relationshipRepairExportReadiness";

describe("relationshipRepairExportReadiness", () => {
  it("allows project export-ready state only when the relationship gate passed", () => {
    expect(createRelationshipRepairExportReadyOptions("ready")).toEqual({
      deliveryStatus: "ready",
      exportReady: true,
    });
    expect(createRelationshipRepairExportReadyOptions("blocked")).toEqual({
      deliveryStatus: "needs-repair",
      exportReady: false,
    });
  });
});

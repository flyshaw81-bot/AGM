import { describe, expect, it } from "vitest";
import type { StudioState } from "../types";
import { renderProjectDeliveryStatusSection } from "./projectDeliveryStatusSection";

type ActiveProject = StudioState["projectCenter"]["recentProjects"][number];

const state = {
  language: "en",
  autoFixPreview: {
    appliedDraftIds: [],
  },
} as unknown as StudioState;

const activeProject: ActiveProject = {
  id: "northwatch-42",
  name: "Northwatch",
  gameProfile: "rpg",
  designIntent: "",
  width: 1000,
  height: 800,
  seed: "42",
  source: "agm",
  status: "export-ready",
  updatedAt: 100,
  hasLocalSnapshot: true,
  exportReady: true,
  deliveryStatus: "ready",
};

describe("projectDeliveryStatusSection", () => {
  it("shows blocked relationship repair health at project level", () => {
    const html = renderProjectDeliveryStatusSection(state, activeProject, {
      issueCount: 3,
      blockingIssueCount: 3,
      lastAppliedRepairId: 9,
      exportGate: "blocked",
      deliveryStatus: "needs-repair",
    });

    expect(html).toContain('data-project-delivery-relationship-gate="blocked"');
    expect(html).toContain('data-project-delivery-status="needs-repair"');
    expect(html).toContain("Needs repair");
    expect(html).toContain("Relationship gate blocked");
    expect(html).toContain("Blocking issues");
    expect(html).toContain("<strong>3</strong>");
    expect(html).not.toContain(
      "<span>Engine package</span><strong>Ready</strong>",
    );
  });

  it("keeps engine package ready when the relationship gate has passed", () => {
    const html = renderProjectDeliveryStatusSection(state, activeProject, {
      issueCount: 0,
      blockingIssueCount: 0,
      lastAppliedRepairId: null,
      exportGate: "ready",
      deliveryStatus: "ready",
    });

    expect(html).toContain('data-project-delivery-relationship-gate="ready"');
    expect(html).toContain('data-project-delivery-status="ready"');
    expect(html).toContain("Ready to deliver");
    expect(html).toContain("Relationship gate passed");
    expect(html).toContain("<span>Engine package</span><strong>Ready</strong>");
  });

  it("uses persisted project delivery status when live repair health is not available", () => {
    const html = renderProjectDeliveryStatusSection(
      state,
      {
        ...activeProject,
        status: "draft",
        exportReady: false,
        deliveryStatus: "needs-repair",
      },
      undefined,
    );

    expect(html).toContain('data-project-delivery-status="needs-repair"');
    expect(html).toContain('data-project-delivery-relationship-gate="blocked"');
    expect(html).toContain("Needs repair");
    expect(html).toContain("Relationship gate blocked");
  });
});

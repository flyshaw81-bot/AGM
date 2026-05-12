import { describe, expect, it } from "vitest";
import type { StudioState } from "../types";
import { renderProjectRecentProjectsSection } from "./projectRecentProjectsSection";

function createState(): StudioState {
  return {
    language: "en",
    projectCenter: {
      activeProjectId: "northwatch-42",
      lastSavedAt: 10,
      recentProjects: [
        {
          id: "northwatch-42",
          name: "Northwatch",
          gameProfile: "strategy",
          designIntent: "",
          width: 1200,
          height: 800,
          seed: "42",
          source: "agm",
          status: "validated",
          updatedAt: 10,
          hasLocalSnapshot: true,
          exportReady: false,
          deliveryStatus: "ready",
        },
      ],
    },
  } as unknown as StudioState;
}

describe("projectRecentProjectsSection", () => {
  it("renders persisted delivery status for recent projects", () => {
    const html = renderProjectRecentProjectsSection(createState());

    expect(html).toContain('data-project-delivery-status="ready"');
    expect(html).toContain("<span>Delivery</span>");
    expect(html).toContain("Ready to deliver");
  });
});

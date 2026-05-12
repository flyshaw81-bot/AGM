import { describe, expect, it } from "vitest";
import type { getEngineExportSettings } from "../bridge/engineExport";
import type { StudioState } from "../types";
import { renderExportPanel } from "./exportPanel";

const state = {
  language: "en",
  export: { format: "png" },
  viewport: { width: 100, height: 50 },
} as StudioState;

const exportSettings = {
  pngResolution: 2,
  tileCols: 2,
  tileRows: 2,
  tileScale: 1,
} as ReturnType<typeof getEngineExportSettings>;

describe("exportPanel", () => {
  it("renders the native export surface with delivery cards and live controls", () => {
    const html = renderExportPanel(state, exportSettings, {
      issueCount: 0,
      blockingIssueCount: 0,
      lastAppliedRepairId: null,
      exportGate: "ready",
      deliveryStatus: "ready",
    });

    expect(html).toContain('data-native-export-panel="true"');
    expect(html).toContain("studio-native-export__hero");
    expect(
      html.match(/<section class="studio-native-export__card/g)?.length,
    ).toBe(5);
    expect(html).toContain('data-studio-action="run-export"');
    expect(html).toContain('data-value="export-agm-draft"');
    expect(html).toContain('data-value="export-engine-package"');
    expect(html).toContain('id="studioPngResolutionInput"');
    expect(html).toContain('id="studioTileColsInput"');
    expect(html).toContain('id="studioTileRowsInput"');
    expect(html).toContain('id="studioTileScaleInput"');
  });

  it("shows blocked relationship health without blocking export commands", () => {
    const html = renderExportPanel(state, exportSettings, {
      issueCount: 2,
      blockingIssueCount: 2,
      lastAppliedRepairId: 123,
      exportGate: "blocked",
      deliveryStatus: "needs-repair",
    });

    expect(html).toContain('data-relationship-export-gate="blocked"');
    expect(html).toContain('data-relationship-delivery-status="needs-repair"');
    expect(html).toContain('data-relationship-repair-issue-count="2"');
    expect(html).toContain('data-relationship-repair-blocking-count="2"');
    expect(html).toContain(
      "Relationship blocking issues remain; this world should not be treated as export-ready yet.",
    );
    expect(html).toContain('data-export-delivery-decision="needs-repair"');
    expect(html).toContain(
      'data-export-run-policy="image-export-allowed-delivery-blocked"',
    );
    expect(html).toContain("Needs repair before delivery");
    expect(html).toContain(
      "Image export remains available, but engine handoff should wait for relationship repair.",
    );
    expect(html).toContain("Open Repair Center");
    expect(html).toContain('data-studio-action="run-export"');
    expect(html).toContain('data-value="export-engine-package" disabled');
    expect(html).toContain(
      'data-disabled-reason="Repair relationship issues before exporting the formal engine package"',
    );
    expect(html).toContain('data-export-package-blocked-hint="true"');
    expect(html).toContain(
      "Engine package export is blocked by the relationship repair gate.",
    );
    expect(html).toContain('data-value="export-engine-manifest"');
  });

  it("shows ready relationship health when the repair gate has passed", () => {
    const html = renderExportPanel(state, exportSettings, {
      issueCount: 0,
      blockingIssueCount: 0,
      lastAppliedRepairId: null,
      exportGate: "ready",
      deliveryStatus: "ready",
    });

    expect(html).toContain('data-relationship-export-gate="ready"');
    expect(html).toContain('data-relationship-delivery-status="ready"');
    expect(html).toContain("Relationship repair gate passed");
    expect(html).toContain(
      "Relationship repair passed; export readiness can continue.",
    );
    expect(html).toContain('data-export-delivery-decision="ready"');
    expect(html).toContain('data-export-run-policy="package-export-ready"');
    expect(html).toContain("Ready to deliver");
    expect(html).toContain(
      "Relationship repair has passed; export the engine package or review repair details.",
    );
    expect(html).toContain(
      'data-studio-action="project" data-value="export-engine-package"',
    );
    expect(html).toContain("Export Engine Package ZIP");
    expect(html).toContain("Review Repair Center");
  });

  it("uses product-readable Chinese copy for blocked delivery status", () => {
    const html = renderExportPanel(
      { ...state, language: "zh-CN" },
      exportSettings,
      {
        issueCount: 4,
        blockingIssueCount: 4,
        lastAppliedRepairId: null,
        exportGate: "blocked",
        deliveryStatus: "needs-repair",
      },
    );

    expect(html).toContain("关系修复未完成");
    expect(html).toContain("需要修复");
    expect(html).toContain("交付前需要修复");
    expect(html).toContain("打开修复中心");
    expect(html).toContain('data-export-delivery-decision="needs-repair"');
    expect(html).toContain('data-relationship-delivery-status="needs-repair"');
  });
});

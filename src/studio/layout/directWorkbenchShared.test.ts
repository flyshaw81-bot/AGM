import { describe, expect, it } from "vitest";
import {
  DIRECT_WORKBENCH_ROW_LIMITS,
  getDirectWorkbenchEditStatus,
  getDirectWorkbenchEditStatusLabel,
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
  renderDirectWorkbenchEditStatus,
  renderDirectWorkbenchFormActions,
} from "./directWorkbenchShared";

describe("directWorkbenchShared", () => {
  it("normalizes edit status labels", () => {
    expect(getDirectWorkbenchEditStatus(false)).toBe("clean");
    expect(getDirectWorkbenchEditStatus(true)).toBe("saved");
    expect(getDirectWorkbenchEditStatusLabel("en", "clean")).toBe("No changes");
    expect(getDirectWorkbenchEditStatusLabel("zh-CN", "saved")).toBe("已应用");
  });

  it("renders escaped select options and preserves the selected value", () => {
    expect(
      renderDirectSelectOptions(
        [
          { value: "safe", label: "Safe" },
          { value: "risky", label: "<Risky>" },
        ],
        "risky",
      ),
    ).toContain('<option value="risky" selected>&lt;Risky&gt;</option>');
  });

  it("renders status metadata used by dirty-state controls", () => {
    expect(renderDirectWorkbenchEditStatus("statusId", "en", "saved")).toBe(
      '<span id="statusId" class="studio-state-edit-status" aria-live="polite" data-status="saved" data-clean-label="No changes" data-dirty-label="Unsaved changes" data-saved-label="Applied" hidden></span>',
    );
  });

  it("renders a shared native editor action bar with escaped data attributes", () => {
    const html = renderDirectWorkbenchFormActions({
      applyAction: "direct-route-apply",
      attributes: { "route-id": 7, scope: "safe<value>" },
      language: "en",
      resetAction: "direct-route-reset",
      status: "clean",
      statusId: "routeStatus",
    });

    expect(html).toContain("studio-native-identity-detail__actions");
    expect(html).toContain('id="routeStatus"');
    expect(html).toContain('data-studio-action="direct-route-apply"');
    expect(html).toContain('data-route-id="7"');
    expect(html).toContain('data-scope="safe&lt;value&gt;"');
    expect(html).toContain(">Apply changes</button>");
    expect(html).toContain(">Reset</button>");
  });

  it("limits visible workbench rows from shared policy", () => {
    expect(limitDirectWorkbenchRows([1, 2, 3], 2)).toEqual([1, 2]);
    expect(DIRECT_WORKBENCH_ROW_LIMITS.states).toBe(40);
  });
});

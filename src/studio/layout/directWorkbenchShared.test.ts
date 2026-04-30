import { describe, expect, it } from "vitest";
import {
  DIRECT_WORKBENCH_ROW_LIMITS,
  getDirectWorkbenchEditStatus,
  getDirectWorkbenchEditStatusLabel,
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
  renderDirectWorkbenchEditStatus,
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
      '<div id="statusId" class="studio-state-edit-status" aria-live="polite" data-status="saved" data-clean-label="No changes" data-dirty-label="Unsaved changes" data-saved-label="Applied">Applied</div>',
    );
  });

  it("limits visible workbench rows from shared policy", () => {
    expect(limitDirectWorkbenchRows([1, 2, 3], 2)).toEqual([1, 2]);
    expect(DIRECT_WORKBENCH_ROW_LIMITS.states).toBe(40);
  });
});

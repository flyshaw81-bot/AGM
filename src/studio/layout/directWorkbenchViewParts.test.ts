import { describe, expect, it } from "vitest";
import {
  renderDirectWorkbenchEntityRow,
  renderDirectWorkbenchHeader,
  renderDirectWorkbenchSearchControls,
  renderDirectWorkbenchStats,
} from "./directWorkbenchViewParts";

describe("directWorkbenchViewParts", () => {
  it("renders common native workbench chrome", () => {
    expect(
      renderDirectWorkbenchHeader({
        eyebrow: "AGM editor",
        title: "States Workbench",
        badge: "Direct edit",
      }),
    ).toContain("States Workbench");
    expect(
      renderDirectWorkbenchStats([
        { label: "States", value: 12 },
        { label: "Current list", value: "8" },
      ]),
    ).toContain("<strong>8</strong>");
  });

  it("renders escaped search controls and selected options", () => {
    const html = renderDirectWorkbenchSearchControls({
      searchId: "stateSearch",
      searchLabel: "Search",
      searchPlaceholder: 'Name "ID"',
      searchValue: "<north>",
      selects: [
        {
          id: "filter",
          label: "Filter",
          options: [
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
          ],
          value: "active",
        },
      ],
      summary: { label: "Current", value: 3 },
    });

    expect(html).toContain('value="&lt;north&gt;"');
    expect(html).toContain('<option value="active" selected>Active</option>');
    expect(html).toContain("<strong>3</strong>");
  });

  it("renders escaped entity rows with active state metadata", () => {
    expect(
      renderDirectWorkbenchEntityRow({
        action: "direct-state-select",
        color: "#3366aa",
        id: 4,
        idDataAttribute: "state-id",
        meta: "Culture #2",
        metric: "12K",
        selected: true,
        title: "Northwatch",
      }),
    ).toContain('data-state-id="4"');
    expect(
      renderDirectWorkbenchEntityRow({
        action: "direct-state-select",
        color: "#3366aa",
        id: 4,
        idDataAttribute: "state-id",
        meta: "Culture #2",
        metric: "12K",
        selected: true,
        title: "Northwatch",
      }),
    ).toContain("is-active");
  });
});

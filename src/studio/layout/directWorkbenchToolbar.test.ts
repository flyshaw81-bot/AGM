import { describe, expect, it } from "vitest";
import { renderDirectWorkbenchToolbar } from "./directWorkbenchToolbar";

describe("direct workbench toolbar", () => {
  it("renders a stable Chinese filter label without mixed-language truncation", () => {
    const html = renderDirectWorkbenchToolbar({
      filterId: "studioCultureFilterSelect",
      filterOptions: [{ value: "all", label: "全部文化" }],
      filterValue: "all",
      language: "zh-CN",
      searchId: "studioCultureSearchInput",
      searchPlaceholder: "搜索文化、ID 或形态",
      searchValue: "",
    });

    expect(html).toContain("<span>筛选</span>");
    expect(html).not.toContain("筛选 Filter");
  });
});

import { describe, expect, it } from "vitest";
import type {
  getEngineDataActions,
  getEngineProjectSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { localizeEngineDisplayValue, renderDataPanel } from "./dataPanel";

const state = {
  language: "zh-CN",
  document: {
    name: "Fleia",
    documentWidth: 1600,
    documentHeight: 1000,
    seed: "231417800",
    dirty: true,
  },
} as StudioState;

const dataActions = {
  canLoadBrowserSnapshot: true,
  canSaveBrowserSnapshot: true,
  canDownloadProject: true,
  sourceLabel: "Browser snapshot",
  sourceDetail: "Browser snapshot",
  saveLabel: "Not saved yet",
  saveDetail: "Local file",
  canCreateGeneratedWorld: true,
  canOpenFile: true,
  canOpenUrlSource: true,
} as ReturnType<typeof getEngineDataActions>;

const projectSummary = {
  hasLocalSnapshot: true,
  autosaveInterval: "5",
  pendingWidth: "1600",
  pendingHeight: "1000",
  pendingSeed: "231417800",
  pendingPoints: "10000",
  pendingCellsLabel: "10k",
  pendingStates: "12",
  pendingProvincesRatio: "40",
  pendingCultures: "8",
  pendingReligions: "4",
} as ReturnType<typeof getEngineProjectSummary>;

describe("data panel", () => {
  it("localizes stable engine display labels", () => {
    expect(localizeEngineDisplayValue("Browser snapshot", "zh-CN")).toBe(
      "浏览器快照",
    );
    expect(localizeEngineDisplayValue("Local file", "en")).toBe("Local file");
  });

  it("renders a native data center while preserving data action hooks", () => {
    const html = renderDataPanel(state, dataActions, projectSummary);

    expect(html).toContain('data-native-data-center="true"');
    expect(html).toContain("数据检查中心");
    expect(html).toContain("项目参数快照");
    expect(html).toContain(
      'data-studio-action="data" data-value="load-browser-snapshot"',
    );
    expect(html).toContain(
      'data-studio-action="data" data-value="save-browser-snapshot"',
    );
    expect(html).toContain(
      'data-studio-action="data" data-value="open-url-source"',
    );
    expect(html).not.toContain("studio-panel__title");
  });
});

import { describe, expect, it, vi } from "vitest";
import { injectStudioStyles, type StudioStyleTargets } from "./styles";

function createTargets(existing = false) {
  const style = {
    id: "",
    textContent: "",
  } as HTMLStyleElement;
  const targets: StudioStyleTargets = {
    getStyleElement: vi.fn(() =>
      existing ? ({ id: "studioShellStyles" } as HTMLElement) : null,
    ),
    createStyleElement: vi.fn(() => style),
    appendToHead: vi.fn(),
  };
  return { style, targets };
}

function getCssBlock(css: string, selector: string) {
  const start = css.indexOf(selector);
  expect(start).toBeGreaterThanOrEqual(0);
  const end = css.indexOf("}", start);
  expect(end).toBeGreaterThan(start);
  return css.slice(start, end);
}

describe("injectStudioStyles", () => {
  it("injects composed Studio styles through injected document targets", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    expect(targets.getStyleElement).toHaveBeenCalledWith("studioShellStyles");
    expect(targets.createStyleElement).toHaveBeenCalled();
    expect(style.id).toBe("studioShellStyles");
    expect(style.textContent).toContain("body.studio-enabled");
    expect(style.textContent).toContain("#studioRoot");
    expect(targets.appendToHead).toHaveBeenCalledWith(style);
  });

  it("keeps native shell chrome and editor surfaces on shared theme tokens", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    expect(style.textContent).toContain(
      '--agm-font-ui: "Satoshi", "Geist Sans", "SF Pro Display", "Segoe UI Variable", "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", "Segoe UI", system-ui, sans-serif',
    );
    expect(style.textContent).toMatch(
      /#studioRoot \{[\s\S]*font-family: var\(--agm-font-ui\);/,
    );
    expect(style.textContent).toContain("--studio-native-bar-bg");
    expect(style.textContent).toContain(
      '#studioRoot[data-studio-theme="daylight"] .studio-native-app',
    );
    expect(style.textContent).toContain(
      "--studio-native-editor-primary: #111827",
    );
    expect(style.textContent).toContain("--studio-native-panel: #ffffff");
    expect(style.textContent).toContain("--studio-native-stage-bg: #eef1f6");
    expect(style.textContent).toContain(
      "--studio-native-map-gutter-bg: #052f5f",
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-stage \{[\s\S]*background: var\(--studio-native-map-gutter-bg\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-app \.studio-native-stage \.studio-stage__viewport \{[\s\S]*background: var\(--studio-native-map-gutter-bg\);/,
    );
    expect(style.textContent).toContain(
      "--studio-native-map-zoom-bg: rgba(255, 255, 255, 0.9)",
    );
    expect(style.textContent).toContain(
      "background: var(--studio-native-bar-bg)",
    );
    expect(style.textContent).toContain("--studio-native-panel-raised");
    expect(style.textContent).toContain(
      "background: var(--studio-native-panel-raised)",
    );
    expect(style.textContent).toContain("--studio-native-field-bg");
    expect(style.textContent).toContain(
      "background: var(--studio-native-field-bg)",
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-app \.studio-map-zoom \{[\s\S]*background: var\(--studio-native-map-zoom-bg\);[\s\S]*color: var\(--studio-native-map-zoom-text\);[\s\S]*box-shadow: var\(--studio-native-map-zoom-shadow\);/,
    );
  });

  it("ships the AGM v8 design pass as the official UI surface", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    expect(style.textContent).toContain(
      '#studioRoot[data-studio-ui="v8"] .studio-native-app',
    );
    expect(style.textContent).toContain("--studio-v8-topbar: oklch");
    expect(style.textContent).toContain("--studio-v8-panel: oklch");
    expect(style.textContent).toContain("--studio-v8-layer-bg: oklch");
    expect(style.textContent).toContain("--studio-v8-layer-active-bg: oklch");
    expect(style.textContent).toContain("--studio-v8-accent: oklch");
    expect(style.textContent).toContain(
      "--studio-v8-cyan: var(--studio-v8-accent)",
    );
    expect(style.textContent).toContain("--studio-v8-ease: cubic-bezier");
    expect(style.textContent).toContain("@keyframes studio-v8-enter");
    expect(style.textContent).not.toContain("119, 114, 255");
    expect(style.textContent).not.toContain("#c7a56b");
    expect(style.textContent).toContain(
      "--studio-native-map-gutter-bg: var(--studio-v8-bg)",
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-app\[data-native-shell="workbench"\] \{[\s\S]*grid-template-rows: 56px minmax\(0, 1fr\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-workbench \{[\s\S]*grid-template-columns: 204px minmax\(0, 1fr\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-workbench--v8 \{[\s\S]*grid-template-rows: minmax\(0, 1fr\) 34px 34px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-topbar \{[\s\S]*grid-template-columns: minmax\(220px, 272px\) minmax\(220px, 300px\) minmax\(360px, max-content\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-topbar__context \{[\s\S]*grid-template-columns: minmax\(0, 1fr\);[\s\S]*align-items: center;/,
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-topbar__context-label",
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-viewport \{[\s\S]*display: grid;[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-viewport__trigger \{[\s\S]*width: 100%;[\s\S]*height: 30px;[\s\S]*min-width: 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-canvas-tools \{[\s\S]*flex: 0 0 auto;[\s\S]*display: grid;[\s\S]*grid-template-columns: repeat\(4, 36px\);[\s\S]*gap: 8px;[\s\S]*justify-content: center;[\s\S]*border-top: 1px solid var\(--studio-v8-border\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-canvas-tool \{[\s\S]*width: 36px;[\s\S]*height: 36px;[\s\S]*min-height: 36px;[\s\S]*border: 1px solid color-mix\(in srgb, var\(--studio-v8-muted\) 22%, transparent\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-canvas-tool\.is-active \{[\s\S]*border-color: #2f83ff;[\s\S]*background: color-mix\(in srgb, #141a20 92%, #2f83ff 8%\);[\s\S]*color: #5da2ff;/,
    );
    expect(style.textContent).not.toContain(".studio-native-v8-tool-status");
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-iconbar \{[\s\S]*grid-row: 1 \/ 3;[\s\S]*grid-template-rows: minmax\(0, 1fr\) auto;[\s\S]*padding: 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-iconbar__module-area \{[\s\S]*display: flex;[\s\S]*flex-direction: column;[\s\S]*overflow: auto;[\s\S]*padding: var\(--studio-v8-space-3\) var\(--studio-v8-space-3\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-iconbar__nav \{[\s\S]*flex: 0 0 auto;[\s\S]*display: grid;[\s\S]*gap: 6px;[\s\S]*overflow: visible;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-iconbar__item \{[\s\S]*min-height: 46px;[\s\S]*border: 0;[\s\S]*border-radius: var\(--studio-v8-radius-md\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-iconbar__item\.is-active \{[\s\S]*background: transparent;[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-bottom \{[\s\S]*position: relative;[\s\S]*grid-column: 1 \/ -1;[\s\S]*grid-row: 2 \/ 4;[\s\S]*grid-template-columns: var\(--studio-v8-iconbar-width\) minmax\(0, 1fr\) var\(--studio-v8-info-panel-width\);[\s\S]*grid-template-rows: 34px 34px;[\s\S]*min-height: 68px;[\s\S]*background: transparent;[\s\S]*pointer-events: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-app\.is-nav-collapsed \.studio-native-v8-bottom \{[\s\S]*grid-template-columns: var\(--studio-v8-iconbar-width\) minmax\(0, 1fr\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-bottom::after \{[\s\S]*content: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-bottom::before \{[\s\S]*content: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-bottom__cards \{[\s\S]*display: grid;[\s\S]*grid-column: 2;[\s\S]*grid-row: 1;[\s\S]*align-items: center;[\s\S]*grid-template-columns: repeat\(8, minmax\(88px, 1fr\)\);[\s\S]*gap: 8px;[\s\S]*width: 100%;[\s\S]*overflow-x: auto;[\s\S]*background: transparent;[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-app\.is-nav-collapsed \.studio-native-v8-bottom__cards \{[\s\S]*max-width: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-layer-card \{[\s\S]*grid-template-columns: 16px minmax\(0, 1fr\) 16px;[\s\S]*min-width: 0;[\s\S]*min-height: 28px;[\s\S]*border: 1px solid transparent;[\s\S]*background: transparent;[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-layer-card__state \{[\s\S]*display: inline-flex;[\s\S]*color: var\(--studio-v8-accent\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-bottom__status \{[\s\S]*grid-column: 1 \/ -1;[\s\S]*grid-row: 2;[\s\S]*grid-template-columns: auto minmax\(0, 1fr\) auto auto;[\s\S]*height: 34px;[\s\S]*#03101d[\s\S]*pointer-events: auto;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-topbar__action \{[\s\S]*min-width: 52px;[\s\S]*height: 30px;[\s\S]*background: transparent;[\s\S]*color: var\(--studio-v8-muted-strong\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-topbar__action--repair,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-topbar__action--export \{[\s\S]*background: transparent;[\s\S]*color: var\(--studio-v8-muted-strong\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-topbar__action--generate \{[\s\S]*color: var\(--studio-v8-text-strong\);[\s\S]*font-weight: 760;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-topbar__action-icon \{[\s\S]*display: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-main \{[\s\S]*grid-row: 1 \/ 3;[\s\S]*grid-template-columns: minmax\(0, 1fr\) var\(--studio-v8-info-panel-width\);[\s\S]*grid-template-rows: minmax\(0, 1fr\) 34px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-app\.is-nav-collapsed \.studio-native-v8-main \{[\s\S]*grid-template-columns: minmax\(0, 1fr\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \{[\s\S]*grid-row: 1 \/ 3;[\s\S]*grid-template-rows: minmax\(0, 1fr\);[\s\S]*border-left: 1px solid var\(--studio-v8-border-strong\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-app\.is-nav-collapsed \.studio-native-v8-info-panel \{[\s\S]*display: none;/,
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-info-panel__header",
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-info-panel__summary",
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-info-panel__summary-item",
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-info-panel__summary-icon",
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-info-panel__tabs",
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-info-panel__tab",
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-info-panel__icon",
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-info-panel__svg",
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel\[data-native-v8-panel-mode="workbench"\] \{[\s\S]*grid-template-rows: auto minmax\(0, 1fr\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel\[data-native-v8-panel-mode="workbench"\]\[data-native-v8-panel-tabs="none"\] \{[\s\S]*grid-template-rows: minmax\(0, 1fr\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-workbench-tabs \{[\s\S]*display: grid;[\s\S]*justify-self: start;[\s\S]*grid-template-columns: repeat\(6, minmax\(0, 1fr\)\);[\s\S]*gap: 0;[\s\S]*width: 100%;[\s\S]*max-width: 100%;[\s\S]*min-height: 40px;[\s\S]*border-bottom: 0;[\s\S]*background: transparent;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-workbench-tab \{[\s\S]*min-height: 40px;[\s\S]*border: 0;[\s\S]*border-bottom: 0;[\s\S]*border-radius: 0;[\s\S]*background: transparent;[\s\S]*padding: 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-workbench-tab\.is-active \{[\s\S]*background: transparent;[\s\S]*color: var\(--studio-v8-text-strong\);[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).toContain(
      ".studio-native-v8-workbench-tab.is-active::before {\n      content: none;",
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-workbench-tab\.is-active::after \{[\s\S]*width: 22px;[\s\S]*height: 2px;[\s\S]*background: color-mix\(in srgb, var\(--studio-v8-cyan\) 70%, white\);/,
    );
    expect(style.textContent).not.toContain(
      ".studio-native-v8-workbench-tab {\n      border-right: 1px solid color-mix",
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel__body \{[\s\S]*gap: 22px;[\s\S]*padding: 30px 30px 20px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights \{[\s\S]*display: grid;[\s\S]*gap: 24px;[\s\S]*border: 0;[\s\S]*background: transparent;[\s\S]*padding: 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__body \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) 154px;[\s\S]*gap: 22px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__row \{[\s\S]*border: 0;[\s\S]*border-radius: 0;[\s\S]*background: transparent;[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__row:hover,[\s\S]*\.studio-biome-insights__row\[data-biome-active='true'\] \{[\s\S]*background: transparent;[\s\S]*box-shadow: none;[\s\S]*transform: translateX\(2px\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__row\[data-biome-active='true'\] \.studio-biome-insights__swatch \{[\s\S]*color-mix\(in srgb, var\(--biome-color\) 24%, transparent\)[\s\S]*;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__row\[data-biome-active='true'\] em \{[\s\S]*color: color-mix\(in srgb, var\(--biome-color\) 78%, white\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__donut \{[\s\S]*width: 128px;[\s\S]*height: 128px;[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__slice\[data-biome-active='true'\] \{[\s\S]*stroke: color-mix\(in srgb, var\(--biome-color\) 82%, white\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__control \{[\s\S]*border: 0;[\s\S]*border-radius: 0;[\s\S]*background: transparent;[\s\S]*box-shadow: none;[\s\S]*padding: 2px 0 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__control-head span \{[\s\S]*color: color-mix\(in srgb, var\(--biome-color\) 78%, white\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-biome-insights__control input\[type='range'\] \{[\s\S]*accent-color: var\(--biome-color\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity \{[\s\S]*grid-template-columns: minmax\(208px, 0\.42fr\) minmax\(0, 1fr\);[\s\S]*grid-template-rows: auto minmax\(0, 1fr\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__list,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity__list \{[\s\S]*grid-column: 1;[\s\S]*grid-row: 2;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__detail-wrap,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity__detail-wrap \{[\s\S]*grid-column: 2;[\s\S]*grid-row: 2;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__toolbar \{[\s\S]*grid-column: 1 \/ -1;[\s\S]*grid-template-columns: minmax\(0, 1fr\) minmax\(146px, 160px\);[\s\S]*border-bottom: 1px solid var\(--studio-v8-border\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__list,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity__list \{[\s\S]*display: flex;[\s\S]*height: 100%;[\s\S]*max-height: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__filters \{[\s\S]*grid-template-columns: minmax\(0, 1fr\);[\s\S]*width: 100%;[\s\S]*min-width: 146px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__select--filter \{[\s\S]*position: relative;[\s\S]*grid-template-columns: 16px auto 12px;[\s\S]*min-width: 146px;[\s\S]*min-height: 40px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__toolbar \.studio-native-identity__filters \{[\s\S]*grid-template-columns: minmax\(146px, 1fr\);[\s\S]*min-width: 146px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity__list > \.studio-native-identity__filters \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto;[\s\S]*gap: 10px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__select--filter:hover,[\s\S]*\.studio-native-states__select--filter:focus-within \{[\s\S]*border-color: rgba\(142, 174, 218, 0\.42\);[\s\S]*background: rgba\(17, 24, 32, 0\.94\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__select--compat-sort \{[\s\S]*position: absolute;[\s\S]*width: 1px;[\s\S]*opacity: 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-states__rows,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity__rows \{[\s\S]*flex: 1 1 auto;[\s\S]*max-height: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-entity-row\.is-active \{[\s\S]*background: transparent;[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-state-detail,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity-detail \{[\s\S]*border: 0;[\s\S]*background: transparent;[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-state-detail__hero,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity-detail__hero \{[\s\S]*display: flex;[\s\S]*align-items: center;[\s\S]*min-height: 24px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-state-detail__title-line,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity-detail__title-line \{[\s\S]*display: inline-flex;[\s\S]*width: 100%;[\s\S]*min-width: 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-state-detail__hero h3,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity-detail__hero h3 \{[\s\S]*flex: 1 1 auto;[\s\S]*margin: 0;[\s\S]*font-size: 17px;[\s\S]*line-height: 1\.18;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-state-field,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity-field \{[\s\S]*border: 0;[\s\S]*background: transparent;[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-state-readonly-grid \{[\s\S]*position: relative;[\s\S]*align-self: start;[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[\s\S]*grid-auto-rows: minmax\(30px, auto\);[\s\S]*border-top: 0;[\s\S]*border-bottom: 0;[\s\S]*padding: 8px 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-state-detail__kv \{[\s\S]*gap: 1px;[\s\S]*min-height: 30px;[\s\S]*border-radius: 0;[\s\S]*padding: 2px 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-state-detail__kv::before \{[\s\S]*content: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-state-detail__color-ring input \{[\s\S]*position: absolute;[\s\S]*opacity: 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-state-detail__actions,[\s\S]*#studioRoot\[data-studio-ui="v8"\] \.studio-native-v8-info-panel \.studio-native-identity-detail__actions \{[\s\S]*position: sticky;[\s\S]*border-top: 0;[\s\S]*background: var\(--studio-v8-panel\);[\s\S]*box-shadow: none;/,
    );
    expect(style.textContent).not.toContain(
      '#studioRoot[data-studio-ui="v8"] .studio-map-zoom button',
    );
  });

  it("centers the native canvas frame scaler in the stage viewport", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    expect(style.textContent).toMatch(
      /\.studio-native-app \.studio-canvas-frame-scaler \{[\s\S]*left: 50%;[\s\S]*transform: translate\(-50%, -50%\);/,
    );
  });

  it("keeps native topbar utility icons compact and subdued", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    expect(style.textContent).toMatch(
      /\.studio-topbar__native-menu-icon,[\s\S]*\.studio-topbar__utility-icon \{[\s\S]*width: 24px;[\s\S]*height: 24px;[\s\S]*stroke-width: 1\.78;/,
    );
    expect(style.textContent).toContain(
      "family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0",
    );
    expect(style.textContent).toMatch(
      /\.studio-material-symbol-icon \{[\s\S]*color: var\(--studio-native-text-muted\);[\s\S]*font-family: "Material Symbols Outlined";[\s\S]*font-size: 24px;[\s\S]*font-weight: 300;/,
    );
    expect(style.textContent).toMatch(
      /\.studio-topbar__native-menu:hover \.studio-material-symbol-icon,[\s\S]*color: var\(--studio-native-topbar-hover-text\);/,
    );
    const nativeUtilityGroup = getCssBlock(
      style.textContent,
      ".studio-native-topbar .studio-topbar__utility-group",
    );
    expect(nativeUtilityGroup).toContain("padding: 0;");
    expect(nativeUtilityGroup).toContain("border: 0;");
    expect(nativeUtilityGroup).toContain("border-radius: 0;");
    expect(nativeUtilityGroup).toContain("outline: 0;");
    expect(nativeUtilityGroup).toContain("background: transparent;");
    expect(nativeUtilityGroup).toContain("box-shadow: none;");

    const nativeGhost = getCssBlock(
      style.textContent,
      ".studio-native-topbar .studio-ghost {",
    );
    expect(nativeGhost).toContain("width: 28px;");
    expect(nativeGhost).toContain("height: 28px;");
    expect(nativeGhost).toContain("padding: 0;");
    expect(nativeGhost).toContain("border: 0;");
    expect(nativeGhost).toContain("border-radius: 0;");
    expect(nativeGhost).toContain("outline: 0;");
    expect(nativeGhost).toContain("box-shadow: none;");

    const themedUtilityGroup = getCssBlock(
      style.textContent,
      "#studioRoot[data-studio-theme] .studio-topbar__utility-group {",
    );
    expect(themedUtilityGroup).toContain("padding: 0;");
    expect(themedUtilityGroup).toContain("border: 0;");
    expect(themedUtilityGroup).toContain("border-radius: 0;");
    expect(themedUtilityGroup).toContain("outline: 0;");
    expect(themedUtilityGroup).toContain("background: transparent;");
    expect(themedUtilityGroup).toContain("box-shadow: none;");

    const themedGhost = getCssBlock(
      style.textContent,
      "#studioRoot[data-studio-theme] .studio-topbar__utility-group .studio-ghost {",
    );
    expect(themedGhost).toContain("width: 28px;");
    expect(themedGhost).toContain("height: 28px;");
    expect(themedGhost).toContain("padding: 0;");
    expect(themedGhost).toContain("border: 0;");
    expect(themedGhost).toContain("outline: 0;");
    expect(themedGhost).toContain("background: transparent;");
    expect(themedGhost).toContain("box-shadow: none;");
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-topbar__utility-group \.studio-topbar__utility-icon \{[\s\S]*width: 19px;[\s\S]*height: 19px;[\s\S]*color: var\(--studio-native-utility-icon\);[\s\S]*font-size: 19px;[\s\S]*opacity: 0\.88;[\s\S]*stroke-width: 1\.58;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-topbar__utility-group \.studio-ghost:hover \.studio-topbar__utility-icon,[\s\S]*color: var\(--studio-native-utility-icon-hover\);[\s\S]*opacity: 0\.96;[\s\S]*transform: translateY\(-1px\) scale\(1\.03\);/,
    );
  });

  it("keeps native icon-font surfaces on the Pencil icon rhythm", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    expect(style.textContent).toMatch(
      /\.studio-native-iconbar__toggle,[\s\S]*\.studio-native-iconbar__item \{[\s\S]*height: 46px;[\s\S]*color: var\(--studio-native-iconbar-text\);[\s\S]*font-size: 15px;[\s\S]*font-weight: 500;[\s\S]*gap: 13px;/,
    );
    expect(style.textContent).toMatch(
      /\.studio-native-iconbar__nav \{[\s\S]*gap: 6px;/,
    );
    expect(style.textContent).toMatch(
      /\.studio-native-iconbar__item span \{[\s\S]*font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Noto Sans SC", system-ui, sans-serif;[\s\S]*font-weight: 500;[\s\S]*line-height: 1\.48;[\s\S]*letter-spacing: 0\.045em;/,
    );
    expect(style.textContent).toMatch(
      /\.studio-native-iconbar__svg \{[\s\S]*width: 18px;[\s\S]*height: 18px;[\s\S]*stroke-width: 1\.85;/,
    );
    expect(style.textContent).toMatch(
      /\.studio-floating-toolbar__tool-icon \{[\s\S]*width: 16px;[\s\S]*height: 16px;[\s\S]*stroke-width: 1\.85;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-app \.studio-floating-toolbar__group--tools \{[\s\S]*margin-left: 4px;[\s\S]*padding-left: 10px;[\s\S]*box-shadow: inset 1px 0 0 color-mix\(in srgb, var\(--studio-native-border-strong\) 52%, transparent\);/,
    );
    expect(style.textContent).toMatch(
      /\.studio-native-layerbar__icon \{[\s\S]*width: 14px;[\s\S]*height: 14px;[\s\S]*stroke-width: 1\.85;/,
    );
  });

  it("keeps editor primary content text theme-aware while labels stay muted", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-state-detail__hero h3 \{[\s\S]*color: var\(--studio-native-editor-primary\);[\s\S]*opacity: 1;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-state-field \.studio-input \{[\s\S]*color: var\(--studio-native-editor-primary\);[\s\S]*-webkit-text-fill-color: var\(--studio-native-editor-primary\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-state-field span \{[\s\S]*color: var\(--studio-native-muted\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-states__list-section strong,[\s\S]*\.studio-native-identity__kv strong,[\s\S]*\.studio-native-identity-field \.studio-input \{[\s\S]*color: var\(--studio-native-editor-primary\);[\s\S]*opacity: 1;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-state-detail__actions \.studio-primary-action,[\s\S]*\.studio-native-state-detail__actions \.studio-ghost \{[\s\S]*color: var\(--studio-native-editor-primary\);/,
    );
    expect(style.textContent).toContain(
      "--studio-native-editor-actions-shadow",
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme="daylight"\] \.studio-native-app \{[\s\S]*--studio-native-editor-actions-shadow: 0 -14px 24px rgba\(255, 255, 255, 0\.92\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-state-detail__actions \{[\s\S]*box-shadow: var\(--studio-native-editor-actions-shadow\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-states__rows \{[\s\S]*padding-right: 10px;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-states__rows,[\s\S]*\.studio-native-state-detail__scroll \{[\s\S]*scrollbar-gutter: stable;[\s\S]*scrollbar-width: none;[\s\S]*-ms-overflow-style: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \* \{[\s\S]*scrollbar-width: none;[\s\S]*-ms-overflow-style: none;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-states__rows::-webkit-scrollbar-button,[\s\S]*\.studio-native-state-detail__scroll::-webkit-scrollbar-button,[\s\S]*\*::-webkit-scrollbar-button \{[\s\S]*display: none;[\s\S]*width: 0;[\s\S]*height: 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-states__rows::-webkit-scrollbar,[\s\S]*\.studio-native-state-detail__scroll::-webkit-scrollbar,[\s\S]*\*::-webkit-scrollbar \{[\s\S]*width: 0;[\s\S]*height: 0;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-states__rows::-webkit-scrollbar-thumb,[\s\S]*\.studio-native-state-detail__scroll::-webkit-scrollbar-thumb,[\s\S]*\*::-webkit-scrollbar-thumb \{[\s\S]*background: transparent;/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-identity__search input,[\s\S]*\.studio-native-identity-field \.studio-input \{[\s\S]*-webkit-text-fill-color: var\(--studio-native-editor-primary\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-identity__search input::placeholder,[\s\S]*\.studio-native-identity-field \.studio-input::placeholder \{[\s\S]*color: var\(--studio-native-muted\);[\s\S]*-webkit-text-fill-color: var\(--studio-native-muted\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-state-detail__top-actions \.studio-ghost,[\s\S]*\.studio-native-identity-detail__actions \.studio-ghost \{[\s\S]*color: var\(--studio-native-editor-primary\);/,
    );
    expect(style.textContent).toMatch(
      /\.studio-native-identity-detail__advanced-title \{[\s\S]*cursor: default;/,
    );
    expect(style.textContent).not.toContain(
      ".studio-native-identity-detail__advanced > summary",
    );
    expect(style.textContent).not.toContain(
      ".studio-native-state-detail__advanced > summary",
    );
    expect(style.textContent).not.toContain(
      ".studio-native-repair__context summary",
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-identity-detail__top-actions \.studio-ghost \{[\s\S]*background: var\(--studio-native-panel\);[\s\S]*color: var\(--studio-native-top-action-text\);/,
    );
    expect(style.textContent).toMatch(
      /#studioRoot\[data-studio-theme\] \.studio-native-drawer\[data-native-drawer="editors"\] \.studio-native-identity-detail__top-actions \.studio-ghost:hover \{[\s\S]*background: rgba\(168, 85, 247, 0\.12\);[\s\S]*color: var\(--studio-native-top-action-hover-text\);/,
    );
  });

  it("keeps the military contract page static on hover", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    expect(style.textContent).toContain(
      '.studio-native-contract[data-native-module-contract="military"] .studio-native-contract__row:hover',
    );
    expect(style.textContent).toContain(
      '.studio-native-contract[data-native-module-contract="military"]:focus-within',
    );
    expect(style.textContent).toMatch(
      /\.studio-native-contract\[data-native-module-contract="military"\] \.studio-native-contract__metric:hover \{[\s\S]*transform: none;/,
    );
    expect(style.textContent).toMatch(
      /\.studio-native-contract\[data-native-module-contract="military"\],[\s\S]*cursor: default;/,
    );
  });

  it("does not create duplicate style elements", () => {
    const { targets } = createTargets(true);

    injectStudioStyles(targets);

    expect(targets.createStyleElement).not.toHaveBeenCalled();
    expect(targets.appendToHead).not.toHaveBeenCalled();
  });

  it("keeps important overrides limited to environment guards", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    const importantCount = style.textContent.match(/!important/g)?.length ?? 0;
    expect(importantCount).toBeLessThan(20);
  });
});

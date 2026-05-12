export const experimentalV8Styles = `    #studioRoot[data-studio-ui="v8"] .studio-native-app {
      --studio-v8-bg: oklch(12.8% 0.004 260);
      --studio-v8-topbar: oklch(14.4% 0.004 260);
      --studio-v8-panel: oklch(15.8% 0.005 260);
      --studio-v8-surface: oklch(18.6% 0.005 260);
      --studio-v8-surface-raised: oklch(22.4% 0.006 260);
      --studio-v8-hover: oklch(26% 0.007 260);
      --studio-v8-active: oklch(29% 0.008 260);
      --studio-v8-border: oklch(27% 0.005 260);
      --studio-v8-border-strong: oklch(36% 0.006 260);
      --studio-v8-text: oklch(88% 0.003 260);
      --studio-v8-text-strong: oklch(97% 0.002 260);
      --studio-v8-muted: oklch(55% 0.004 260);
      --studio-v8-muted-strong: oklch(70% 0.004 260);
      --studio-v8-accent: oklch(78% 0.05 240);
      --studio-v8-accent-muted: oklch(88% 0.03 240);
      --studio-v8-cyan: var(--studio-v8-accent);
      --studio-v8-cyan-deep: oklch(34% 0.03 240);
      --studio-v8-blue: var(--studio-v8-accent);
      --studio-v8-blue-muted: var(--studio-v8-accent-muted);
      --studio-v8-green: oklch(72% 0.04 150);
      --studio-v8-green-bg: oklch(21% 0.02 150);
      --studio-v8-green-border: oklch(36% 0.025 150);
      --studio-v8-warning: oklch(74% 0.06 80);
      --studio-v8-danger: oklch(62% 0.12 22);
      --studio-v8-export-bg: oklch(17% 0.004 260);
      --studio-v8-export-border: oklch(34% 0.005 260);
      --studio-v8-layer-bg: oklch(14% 0.004 260);
      --studio-v8-layer-active-bg: oklch(26% 0.007 260);
      --studio-v8-layer-border: oklch(28% 0.005 260);
      --studio-v8-layer-icon: oklch(60% 0.004 260);
      --studio-v8-space-1: 4px;
      --studio-v8-space-2: 8px;
      --studio-v8-space-3: 12px;
      --studio-v8-space-4: 16px;
      --studio-v8-space-5: 20px;
      --studio-v8-radius-sm: 6px;
      --studio-v8-radius-md: 8px;
      --studio-v8-radius-lg: 12px;
      --studio-v8-radius-xl: 16px;
      --studio-native-border: var(--studio-v8-border);
      --studio-native-border-strong: var(--studio-v8-border-strong);
      --studio-native-muted: var(--studio-v8-muted);
      --studio-native-text: var(--studio-v8-text);
      --studio-native-text-strong: var(--studio-v8-text-strong);
      --studio-native-text-muted: var(--studio-v8-muted-strong);
      --studio-native-accent: var(--studio-v8-blue);
      --studio-native-accent-hover: oklch(85% 0.04 240);
      --studio-native-accent-strong: var(--studio-v8-blue);
      --studio-native-accent-muted: oklch(78% 0.05 240 / 0.14);
      --studio-native-editor-primary: var(--studio-v8-text-strong);
      --studio-native-topbar-hover-text: var(--studio-v8-text-strong);
      --studio-native-top-action-text: var(--studio-v8-muted-strong);
      --studio-native-top-action-hover-text: var(--studio-v8-text);
      --studio-native-utility-icon: oklch(75% 0.003 260 / 0.82);
      --studio-native-utility-icon-hover: oklch(97% 0.002 260 / 0.94);
      --studio-native-iconbar-text: oklch(75% 0.003 260 / 0.88);
      --studio-native-iconbar-active-text: var(--studio-v8-text-strong);
      --studio-native-iconbar-hover-bg: var(--studio-v8-hover);
      --studio-native-toolbar-text: var(--studio-v8-text);
      --studio-native-toolbar-control-bg: transparent;
      --studio-native-toolbar-control-hover-bg: oklch(78% 0.05 240 / 0.09);
      --studio-native-toolbar-dropdown-bg: oklch(13% 0.004 260 / 0.98);
      --studio-native-layerbar-popover-bg: oklch(13% 0.004 260 / 0.98);
      --studio-native-map-zoom-bg: var(--studio-v8-surface);
      --studio-native-map-zoom-text: var(--studio-v8-text);
      --studio-native-map-zoom-hover-bg: oklch(78% 0.05 240 / 0.12);
      --studio-native-map-zoom-shadow: 0 8px 22px rgba(0, 0, 0, 0.28);
      --studio-native-chrome: oklch(13.6% 0.004 260 / 0.94);
      --studio-native-chrome-solid: var(--studio-v8-topbar);
      --studio-native-chrome-hover: var(--studio-v8-hover);
      --studio-native-bar-bg: var(--studio-v8-topbar);
      --studio-native-panel: var(--studio-v8-panel);
      --studio-native-panel-raised: oklch(13% 0.004 260 / 0.98);
      --studio-native-field-bg: var(--studio-v8-surface);
      --studio-native-field-focus-bg: var(--studio-v8-surface-raised);
      --studio-native-row-hover: var(--studio-v8-hover);
      --studio-native-stage-bg: var(--studio-v8-bg);
      --studio-native-map-gutter-bg: var(--studio-v8-bg);
      --studio-native-focus-ring: oklch(78% 0.05 240 / 0.28);
      --studio-native-layerbar-height: 52px;
      --studio-v8-ease: cubic-bezier(0.22, 1, 0.36, 1);
      --studio-v8-ease-press: cubic-bezier(0.2, 0.8, 0.2, 1);
      --studio-v8-mono: "Geist Mono", "SF Mono", "JetBrains Mono", "Cascadia Mono", Consolas, monospace;
      font-family: "Satoshi", "Geist Sans", "SF Pro Display", "Segoe UI Variable", "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", var(--agm-font-ui);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0;
      background: var(--studio-v8-bg);
      color: var(--studio-v8-text);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app::before {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0.12;
      background-image:
        linear-gradient(rgba(205, 225, 230, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(205, 225, 230, 0.035) 1px, transparent 1px);
      background-size: 48px 48px, 48px 48px;
      content: "";
      mix-blend-mode: normal;
    }

    @keyframes studio-v8-enter {
      from {
        opacity: 0;
        transform: translate3d(0, 8px, 0);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app svg {
      vector-effect: non-scaling-stroke;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-state-row,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-entity-row {
      animation: studio-v8-enter 520ms var(--studio-v8-ease) both;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card:nth-child(2),
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-state-row:nth-child(2),
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-entity-row:nth-child(2) {
      animation-delay: 30ms;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card:nth-child(3),
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-state-row:nth-child(3),
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-entity-row:nth-child(3) {
      animation-delay: 60ms;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card:nth-child(4),
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-state-row:nth-child(4),
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-entity-row:nth-child(4) {
      animation-delay: 90ms;
    }

    @media (prefers-reduced-motion: reduce) {
      #studioRoot[data-studio-ui="v8"] .studio-native-app *,
      #studioRoot[data-studio-ui="v8"] .studio-native-app *::before,
      #studioRoot[data-studio-ui="v8"] .studio-native-app *::after {
        animation-duration: 1ms;
        animation-delay: 0ms;
        transition-duration: 1ms;
      }
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app[data-native-shell="workbench"] {
      grid-template-rows: 56px minmax(0, 1fr);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-workbench--v8 {
      --studio-v8-iconbar-width: 204px;
      --studio-v8-info-panel-width: clamp(500px, 32vw, 560px);
      grid-template-columns: var(--studio-v8-iconbar-width) minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr) 34px 34px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-workbench--v8 {
      --studio-v8-iconbar-width: 68px;
      grid-template-columns: var(--studio-v8-iconbar-width) minmax(0, 1fr);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-main {
      display: grid;
      grid-column: 2;
      grid-row: 1 / 3;
      grid-template-columns: minmax(0, 1fr) var(--studio-v8-info-panel-width);
      grid-template-rows: minmax(0, 1fr) 34px;
      min-width: 0;
      min-height: 0;
      background: var(--studio-v8-bg);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-v8-main {
      grid-template-columns: minmax(0, 1fr);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-main .studio-native-stage {
      grid-column: 1;
      grid-row: 1;
      min-width: 0;
      min-height: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel {
      display: grid;
      grid-column: 2;
      grid-row: 1 / 3;
      grid-template-rows: minmax(0, 1fr);
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      border-left: 1px solid var(--studio-v8-border-strong);
      background:
        linear-gradient(180deg, oklch(15% 0.004 260 / 0.72), transparent 180px),
        var(--studio-v8-panel);
      color: var(--studio-v8-text);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-v8-info-panel {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel[data-native-v8-panel-mode="workbench"] {
      grid-template-rows: auto minmax(0, 1fr);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel[data-native-v8-panel-mode="workbench"][data-native-v8-panel-tabs="none"] {
      grid-template-rows: minmax(0, 1fr);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tabs {
      display: grid;
      justify-self: start;
      align-items: flex-end;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 0;
      min-width: 0;
      width: 100%;
      max-width: 100%;
      min-height: 40px;
      overflow-x: auto;
      border-bottom: 0;
      background: transparent;
      padding: 0 24px;
      scrollbar-width: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tabs::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tabs[data-native-v8-workbench-tabs-count="3"] {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tab {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 1 auto;
      min-width: 0;
      min-height: 40px;
      border: 0;
      border-bottom: 0;
      border-radius: 0;
      background: transparent;
      color: var(--studio-v8-muted-strong);
      cursor: pointer;
      font: inherit;
      padding: 0;
      text-align: center;
      transition:
        color 180ms var(--studio-v8-ease),
        background-color 180ms var(--studio-v8-ease),
        border-color 180ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tab:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tab:focus-visible {
      background: transparent;
      color: var(--studio-v8-text-strong);
      outline: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tab.is-active {
      background: transparent;
      color: var(--studio-v8-text-strong);
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tab:active {
      transform: translateY(1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tab.is-active::before {
      content: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tab.is-active::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 4px;
      width: 22px;
      height: 2px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--studio-v8-cyan) 70%, white);
      transform: translateX(-50%);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-workbench-tab strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: inherit;
      font-size: 12.5px;
      font-weight: 720;
      line-height: 1.15;
    }


    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel__body {
      display: grid;
      align-content: start;
      gap: 22px;
      min-width: 0;
      min-height: 0;
      overflow: auto;
      padding: 30px 30px 20px;
      scrollbar-color: var(--studio-v8-border-strong) transparent;
      scrollbar-width: thin;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel[data-native-v8-panel-mode="workbench"] .studio-native-v8-info-panel__body {
      align-content: stretch;
      gap: 0;
      overflow: hidden;
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights {
      display: grid;
      gap: 24px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      color: var(--studio-v8-text);
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__header {
      color: var(--studio-v8-text-strong);
      font-size: 18px;
      font-weight: 760;
      letter-spacing: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__body {
      grid-template-columns: minmax(0, 1fr) 154px;
      align-items: center;
      gap: 22px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__legend {
      gap: 11px;
      max-height: none;
      overflow: visible;
      padding-right: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__header span,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights p,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__row em {
      color: var(--studio-v8-muted-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__row {
      gap: 10px;
      border: 0;
      border-color: transparent;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      color: var(--studio-v8-text);
      font-size: 13px;
      padding: 0;
      transform: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__row:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__row:focus-visible,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__row[data-biome-active='true'] {
      border-color: transparent;
      background: transparent;
      box-shadow: none;
      color: var(--studio-v8-text-strong);
      transform: translateX(2px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__row[data-biome-active='true'] .studio-biome-insights__swatch {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--biome-color) 24%, transparent), 0 0 18px color-mix(in srgb, var(--biome-color) 28%, transparent);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__row[data-biome-active='true'] strong {
      color: var(--studio-v8-text-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__row[data-biome-active='true'] em {
      color: color-mix(in srgb, var(--biome-color) 78%, white);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__donut {
      width: 128px;
      height: 128px;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__donut svg {
      width: 128px;
      height: 128px;
      filter: drop-shadow(0 16px 24px rgba(0, 0, 0, 0.24));
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__slice[data-biome-active='true'] {
      stroke: color-mix(in srgb, var(--biome-color) 82%, white);
      filter: drop-shadow(0 0 10px color-mix(in srgb, var(--biome-color) 32%, transparent));
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__hole {
      fill: var(--studio-v8-panel);
      stroke: var(--studio-v8-border);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__control {
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      gap: 12px;
      padding: 2px 0 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__control-head {
      color: var(--studio-v8-text-strong);
      font-size: 13px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__control-head span {
      color: color-mix(in srgb, var(--biome-color) 78%, white);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__control label {
      color: var(--studio-v8-text);
      gap: 8px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-biome-insights__control input[type='range'] {
      accent-color: var(--biome-color);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-topbar {
      min-height: 56px;
      height: 56px;
      padding: 0 14px;
      border-bottom: 1px solid color-mix(in srgb, var(--studio-v8-border) 72%, transparent);
      background: var(--studio-v8-topbar);
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar {
      display: grid;
      grid-template-columns: minmax(220px, 272px) minmax(220px, 300px) minmax(360px, max-content);
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      overflow: visible;
    }

    #studioRoot[data-studio-ui="v8"][data-studio-theme] .studio-native-app .studio-native-v8-topbar {
      grid-template-columns: minmax(220px, 272px) minmax(220px, 300px) minmax(360px, max-content);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__brand,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__actions {
      display: flex;
      align-items: center;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__brand {
      gap: 8px;
      height: 36px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__name {
      display: grid;
      gap: 1px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__name strong {
      overflow: hidden;
      color: var(--studio-v8-text-strong);
      font-size: 13.5px;
      font-weight: 760;
      line-height: 1.05;
      letter-spacing: 0;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__name span {
      overflow: hidden;
      color: var(--studio-v8-muted);
      font-family: var(--studio-v8-mono);
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.035em;
      line-height: 1.1;
      text-transform: uppercase;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__context {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-items: center;
      gap: 0;
      justify-content: stretch;
      min-width: 0;
      min-height: 36px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__viewport-cluster {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-items: center;
      gap: 0;
      min-width: 0;
      min-height: 34px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
      box-shadow: none;
    }


    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-content: center;
      min-width: 0;
      min-height: 30px;
      height: 30px;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--studio-v8-text);
      padding: 0 2px;
      text-align: left;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] button.studio-native-v8-topbar__field {
      cursor: pointer;
      transition:
        color 200ms var(--studio-v8-ease),
        transform 200ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] button.studio-native-v8-topbar__field:hover {
      color: var(--studio-v8-text-strong);
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-ui="v8"] button.studio-native-v8-topbar__field:active {
      transform: translateY(1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__field span,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__field strong {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__field span {
      grid-column: 1 / -1;
      color: var(--studio-v8-muted);
      font-size: 9.5px;
      font-weight: 600;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__field strong {
      color: var(--studio-v8-text-strong);
      font-size: 12.5px;
      font-weight: 680;
      line-height: 1.1;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__field-caret {
      width: 12px;
      height: 12px;
      color: var(--studio-v8-muted);
      stroke-width: 1.7;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__actions {
      justify-content: flex-end;
      gap: 0;
      min-height: 36px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__command-deck {
      display: inline-flex;
      align-items: center;
      gap: 0;
      min-width: 0;
      min-height: 36px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__command-divider {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action-group,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__utility-island {
      display: inline-flex;
      align-items: center;
      gap: 0;
      min-width: 0;
      min-height: 30px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action-group--commit {
      background: transparent;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__dropdown {
      position: relative;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__trigger {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 5px;
      width: 100%;
      height: 30px;
      min-width: 0;
      border: 0;
      border-radius: var(--studio-v8-radius-sm);
      background: transparent;
      color: var(--studio-v8-muted-strong);
      cursor: pointer;
      list-style: none;
      padding: 0 6px;
      font-size: 11.5px;
      font-weight: 650;
      box-shadow: none;
      transition:
        color 180ms var(--studio-v8-ease),
        background-color 180ms var(--studio-v8-ease),
        transform 180ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__trigger:hover {
      background: transparent;
      color: var(--studio-v8-text-strong);
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__dropdown[open] .studio-native-v8-viewport__trigger {
      background: transparent;
      color: var(--studio-v8-text-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__trigger::-webkit-details-marker {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__icon,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__caret,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__check {
      width: 14px;
      height: 14px;
      flex: 0 0 auto;
      stroke-width: 1.7;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__menu {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      z-index: 40;
      display: grid;
      gap: 4px;
      min-width: 132px;
      border: 1px solid var(--studio-v8-border-strong);
      border-radius: 7px;
      background: rgba(13, 19, 26, 0.98);
      box-shadow: 0 18px 38px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.035);
      padding: 6px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-height: 30px;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: var(--studio-v8-muted-strong);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 640;
      padding: 0 8px;
      text-align: left;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__option:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-viewport__option.is-selected {
      background: transparent;
      color: var(--studio-v8-text-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      min-width: 52px;
      height: 30px;
      border: 0;
      border-radius: var(--studio-v8-radius-sm);
      background: transparent;
      color: var(--studio-v8-muted-strong);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 680;
      box-shadow: none;
      padding: 0 10px;
      transition:
        color 180ms var(--studio-v8-ease),
        background-color 180ms var(--studio-v8-ease),
        transform 180ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action:hover:not(:disabled) {
      background: transparent;
      color: var(--studio-v8-text-strong);
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action:active:not(:disabled) {
      transform: translateY(1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action:disabled {
      cursor: default;
      opacity: 0.46;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action--repair,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action--export {
      min-width: 50px;
      border-color: transparent;
      background: transparent;
      color: var(--studio-v8-muted-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action--generate {
      color: var(--studio-v8-text-strong);
      font-weight: 760;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action--generate:hover:not(:disabled) {
      color: var(--studio-v8-text-strong);
      background: transparent;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar__action-icon {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-topbar .studio-topbar__utility-group {
      display: inline-flex;
      gap: 3px;
      margin-left: 0;
      padding-left: 0;
      border-left: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-topbar .studio-topbar__group--brand {
      gap: 12px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-topbar__native-menu,
    #studioRoot[data-studio-ui="v8"] .studio-topbar__project-center,
    #studioRoot[data-studio-ui="v8"] .studio-native-topbar .studio-ghost {
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      border-radius: 4px;
      color: var(--studio-v8-muted-strong);
      transition:
        background-color 220ms var(--studio-v8-ease),
        color 140ms var(--studio-native-ease),
        transform 160ms var(--studio-native-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-topbar__native-menu:hover,
    #studioRoot[data-studio-ui="v8"] .studio-topbar__project-center:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-topbar .studio-ghost:hover {
      color: var(--studio-v8-text-strong);
      background: transparent;
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-topbar .studio-brand--native {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: 7px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-topbar .studio-brand__logo {
      width: 32px;
      height: 32px;
      border-radius: 7px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-topbar__native-name {
      color: var(--studio-v8-text-strong);
      font-size: 14px;
      font-weight: 700;
    }

    #studioRoot[data-studio-ui="v8"] .studio-topbar__native-menu-icon,
    #studioRoot[data-studio-ui="v8"] .studio-topbar__utility-icon,
    #studioRoot[data-studio-ui="v8"] .studio-material-symbol-icon {
      width: 21px;
      height: 21px;
      font-size: 21px;
      stroke-width: 1.7;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-workbench {
      grid-template-columns: 204px minmax(0, 1fr);
      background: var(--studio-v8-bg);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-workbench {
      grid-template-columns: 68px minmax(0, 1fr);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar {
      grid-row: 1 / 3;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 0;
      padding: 0;
      border-right: 1px solid var(--studio-v8-border);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--studio-v8-topbar) 88%, var(--studio-v8-surface) 12%), var(--studio-v8-bg)),
        var(--studio-v8-topbar);
      box-shadow: inset -1px 0 0 rgba(218, 238, 242, 0.02);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__module-area {
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: auto;
      padding: var(--studio-v8-space-3) var(--studio-v8-space-3);
      scrollbar-width: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__header {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__kicker {
      overflow: hidden;
      color: var(--studio-v8-muted);
      font-size: 10px;
      font-weight: 780;
      letter-spacing: 0.08em;
      line-height: 1;
      text-transform: uppercase;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__header strong {
      overflow: hidden;
      color: var(--studio-v8-text-strong);
      font-size: 16px;
      font-weight: 780;
      line-height: 1.05;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__module-area::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__nav {
      flex: 0 0 auto;
      display: grid;
      gap: 6px;
      overflow: visible;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__nav--secondary {
      margin: 12px 0 0;
      border-top: 0;
      overflow: auto;
      padding: 6px 0 0;
      scrollbar-width: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__nav--secondary::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__global-area {
      border-top: 1px solid var(--studio-v8-border);
      padding: 10px 0 12px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item {
      position: relative;
      min-height: 46px;
      height: auto;
      border: 0;
      border-radius: var(--studio-v8-radius-md);
      gap: var(--studio-v8-space-3);
      padding: 7px var(--studio-v8-space-3);
      color: var(--studio-v8-muted);
      font-size: 13px;
      font-weight: 600;
      transform: none;
      transition:
        background-color 240ms var(--studio-v8-ease),
        color 240ms var(--studio-v8-ease),
        box-shadow 240ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item-mark {
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      flex: 0 0 26px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      transition:
        border-color 240ms var(--studio-v8-ease),
        background-color 240ms var(--studio-v8-ease),
        transform 260ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item-copy {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item-label,
    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item-hint {
      overflow: hidden;
      letter-spacing: 0;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item-label {
      color: inherit;
      font-size: 13px;
      font-weight: 720;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item-hint {
      color: var(--studio-v8-muted);
      font-size: 10.5px;
      font-weight: 620;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__svg {
      width: 17px;
      height: 17px;
      stroke-width: 1.7;
      opacity: 0.9;
      transition:
        color 240ms var(--studio-v8-ease),
        opacity 240ms var(--studio-v8-ease),
        transform 260ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item:hover {
      background: transparent;
      color: var(--studio-v8-text);
      transform: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item.is-active {
      background: transparent;
      color: var(--studio-v8-text-strong);
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item.is-active::after {
      content: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item:active {
      transform: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item.is-active .studio-native-iconbar__svg {
      color: var(--studio-v8-accent);
      opacity: 1;
      transform: translateX(1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item.is-active .studio-native-iconbar__item-mark {
      border-color: rgba(142, 174, 218, 0.5);
      background: transparent;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-iconbar__item.is-active::before {
      content: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-canvas-tools {
      flex: 0 0 auto;
      display: grid;
      grid-template-columns: repeat(4, 36px);
      gap: 8px;
      justify-content: center;
      margin: var(--studio-v8-space-4) 0 0;
      border-top: 1px solid var(--studio-v8-border);
      padding: var(--studio-v8-space-3) 0 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-canvas-tool {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-height: 36px;
      border: 1px solid color-mix(in srgb, var(--studio-v8-muted) 22%, transparent);
      border-radius: 5px;
      background: color-mix(in srgb, #141a20 92%, transparent);
      color: color-mix(in srgb, var(--studio-v8-muted-strong) 82%, white);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 640;
      padding: 0;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.035),
        0 0 0 1px rgba(0, 0, 0, 0.22);
      transition:
        background-color 220ms var(--studio-v8-ease),
        border-color 220ms var(--studio-v8-ease),
        box-shadow 220ms var(--studio-v8-ease),
        color 220ms var(--studio-v8-ease),
        transform 260ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-canvas-tool:hover {
      border-color: color-mix(in srgb, var(--studio-v8-cyan) 34%, transparent);
      background: color-mix(in srgb, #171e25 94%, transparent);
      color: var(--studio-v8-text);
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-canvas-tool.is-active {
      border-color: #2f83ff;
      background: color-mix(in srgb, #141a20 92%, #2f83ff 8%);
      color: #5da2ff;
      box-shadow:
        0 0 0 1px color-mix(in srgb, #2f83ff 74%, transparent),
        0 0 14px color-mix(in srgb, #2f83ff 22%, transparent),
        inset 0 0 0 1px color-mix(in srgb, #2f83ff 20%, transparent);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-canvas-tool:active {
      transform: translateY(1px) scale(0.97);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-canvas-tool.is-active::before {
      content: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-canvas-tool__icon {
      width: 18px;
      height: 18px;
      stroke-width: 1.85;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-canvas-tool span {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-iconbar__module-area {
      padding: 10px 7px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-iconbar__header {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-iconbar__item {
      justify-content: center;
      min-height: 44px;
      padding: 5px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-iconbar__item-copy {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-iconbar__item-mark {
      width: 34px;
      height: 34px;
      flex-basis: 34px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-v8-canvas-tools {
      grid-template-columns: 1fr;
      margin-top: 10px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-stage,
    #studioRoot[data-studio-ui="v8"] .studio-native-stage .studio-stage__viewport {
      background: var(--studio-native-map-gutter-bg);
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar {
      top: 16px;
      min-height: 38px;
      gap: 8px;
      padding: 0 10px;
      border: 1px solid var(--studio-v8-border-strong);
      border-radius: 8px;
      background: rgba(14, 24, 34, 0.94);
      color: var(--studio-v8-text);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__group--view {
      padding-right: 10px;
      border-right: 1px solid var(--studio-v8-border);
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__group--tools {
      margin-left: 0;
      padding-left: 0;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__dropdown-trigger,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__tool,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__icon-command {
      height: 32px;
      border-radius: 4px;
      color: var(--studio-v8-muted-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__dropdown-trigger {
      min-width: 72px;
      padding: 0 7px;
      font-size: 12px;
      font-weight: 600;
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__tool,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__icon-command {
      width: 32px;
      color: var(--studio-v8-muted-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__dropdown-trigger:hover,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__dropdown[open] .studio-floating-toolbar__dropdown-trigger,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__tool:hover,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__icon-command:hover {
      color: var(--studio-v8-text-strong);
      background: rgba(142, 174, 218, 0.08);
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__tool.is-active {
      color: var(--studio-v8-cyan);
      background: rgba(142, 174, 218, 0.12);
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__icon-command--generate,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__icon-command--generate:hover {
      color: var(--studio-v8-cyan);
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__icon-command--biome,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__icon-command--biome:hover,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__icon-command--biome.is-active {
      color: var(--studio-v8-green);
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__tool-icon,
    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__select-icon {
      width: 16px;
      height: 16px;
      stroke-width: 1.7;
    }

    #studioRoot[data-studio-ui="v8"] .studio-floating-toolbar__dropdown-menu,
    #studioRoot[data-studio-ui="v8"] .studio-native-biome-popover {
      border-color: var(--studio-v8-border-strong);
      background: rgba(14, 24, 34, 0.98);
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.38);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-layerbar,
    #studioRoot[data-studio-ui="v8"] .studio-native-layerbar__track,
    #studioRoot[data-studio-ui="v8"] .studio-native-layerbar__item {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom {
      position: relative;
      z-index: 12;
      display: grid;
      grid-column: 1 / -1;
      grid-row: 2 / 4;
      grid-template-columns: var(--studio-v8-iconbar-width) minmax(0, 1fr) var(--studio-v8-info-panel-width);
      grid-template-rows: 34px 34px;
      min-width: 0;
      min-height: 68px;
      border-top: 0;
      background: transparent;
      color: var(--studio-v8-text);
      box-shadow: none;
      pointer-events: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-v8-bottom {
      grid-template-columns: var(--studio-v8-iconbar-width) minmax(0, 1fr);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom::after {
      content: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom::before {
      content: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__cards {
      display: grid;
      grid-column: 2;
      grid-row: 1;
      align-items: center;
      align-self: center;
      grid-template-columns: repeat(8, minmax(88px, 1fr));
      gap: 8px;
      min-width: 0;
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      border: 0;
      background: transparent;
      box-shadow: none;
      padding: 0 8px;
      scrollbar-width: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-app.is-nav-collapsed .studio-native-v8-bottom__cards {
      max-width: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__cards::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card {
      position: relative;
      display: grid;
      grid-template-columns: 16px minmax(0, 1fr) 16px;
      align-items: center;
      gap: 8px;
      min-width: 0;
      min-height: 28px;
      border: 1px solid transparent;
      border-radius: 7px;
      background: transparent;
      color: color-mix(in srgb, var(--studio-v8-cyan) 50%, var(--studio-v8-text-strong));
      cursor: pointer;
      font: inherit;
      padding: 0 9px;
      text-align: left;
      box-shadow: none;
      will-change: auto;
      transition:
        border-color 180ms var(--studio-v8-ease),
        color 180ms var(--studio-v8-ease),
        background-color 180ms var(--studio-v8-ease),
        transform 180ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card::before {
      content: "";
      position: absolute;
      left: 5px;
      top: 7px;
      bottom: 7px;
      width: 2px;
      border-radius: 999px;
      background: transparent;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card:focus-visible {
      border-color: transparent;
      background: transparent;
      color: var(--studio-v8-text-strong);
      outline: none;
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card.is-active {
      border-color: transparent;
      background: transparent;
      color: var(--studio-v8-text-strong);
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card.is-active::before {
      background: var(--studio-v8-cyan);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card:active {
      transform: translateY(1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__glyph {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      color: color-mix(in srgb, var(--studio-v8-cyan) 44%, var(--studio-v8-text));
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card.is-active .studio-native-v8-layer-card__glyph {
      color: var(--studio-v8-accent);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__status,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__x {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__status {
      justify-content: flex-end;
      color: var(--studio-v8-muted);
      font-family: var(--studio-v8-mono);
      font-size: 10px;
      font-weight: 650;
      letter-spacing: 0.04em;
      line-height: 1;
      text-transform: uppercase;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__state-icon,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__x-icon,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__svg {
      width: 12px;
      height: 12px;
      stroke-width: 1.7;
      flex: 0 0 auto;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__copy {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-items: center;
      gap: 0;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__title {
      overflow: hidden;
      color: inherit;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0;
      line-height: 1.14;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__state {
      display: inline-flex;
      justify-content: center;
      color: var(--studio-v8-accent);
      opacity: 0.9;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card[data-layer-state="hidden"] .studio-native-v8-layer-card__state {
      color: color-mix(in srgb, var(--studio-v8-cyan) 34%, #0a2940);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__x {
      display: inline-flex;
      justify-content: center;
      color: var(--studio-v8-muted);
      opacity: 0.9;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-layer-card__x:hover {
      background: transparent;
      color: var(--studio-v8-text-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__status {
      position: relative;
      z-index: 2;
      display: grid;
      grid-column: 1 / -1;
      grid-row: 2;
      grid-template-columns: auto minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 10px;
      min-width: 0;
      height: 34px;
      border-top: 1px solid color-mix(in srgb, var(--studio-v8-cyan) 22%, transparent);
      background:
        linear-gradient(90deg, color-mix(in srgb, var(--studio-v8-cyan) 8%, transparent), transparent 42%),
        color-mix(in srgb, #03101d 88%, var(--studio-v8-cyan) 12%);
      color: color-mix(in srgb, var(--studio-v8-cyan) 48%, var(--studio-v8-text));
      box-shadow: none;
      padding: 0 10px;
      pointer-events: auto;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__status-main,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__status-meta,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__health {
      display: inline-flex;
      align-items: center;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__status-main {
      gap: 9px;
      color: var(--studio-v8-text-strong);
      font-size: 11px;
      font-weight: 720;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__status-dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: var(--studio-v8-cyan);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--studio-v8-cyan) 14%, transparent);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__status-dot.is-dirty {
      background: var(--studio-v8-warning);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--studio-v8-warning) 14%, transparent);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__status-meta {
      gap: 0;
      overflow: hidden;
      color: color-mix(in srgb, var(--studio-v8-cyan) 38%, var(--studio-v8-muted-strong));
      font-size: 11px;
      font-weight: 560;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__status-meta span {
      overflow: hidden;
      max-width: 190px;
      padding: 0 10px;
      border-left: 1px solid color-mix(in srgb, var(--studio-v8-cyan) 18%, transparent);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__status-meta strong {
      color: var(--studio-v8-text-strong);
      font-weight: 760;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__health {
      gap: 12px;
      justify-content: flex-end;
      color: color-mix(in srgb, var(--studio-v8-cyan) 48%, var(--studio-v8-muted-strong));
      font-size: 11px;
      font-weight: 650;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__health-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__health-item.has-warning {
      color: var(--studio-v8-warning);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__health-item.has-error {
      color: var(--studio-v8-danger);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__health-icon {
      width: 13px;
      height: 13px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__details {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 22px;
      min-width: 56px;
      border: 1px solid color-mix(in srgb, var(--studio-v8-cyan) 22%, transparent);
      border-radius: var(--studio-v8-radius-sm);
      background: color-mix(in srgb, #03101d 82%, var(--studio-v8-cyan) 18%);
      color: var(--studio-v8-text-strong);
      cursor: pointer;
      font: inherit;
      font-size: 11px;
      font-weight: 700;
      padding: 0 10px;
      transition:
        border-color 160ms var(--studio-v8-ease),
        background-color 160ms var(--studio-v8-ease),
        color 160ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__details:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-bottom__details:focus-visible {
      border-color: color-mix(in srgb, var(--studio-v8-cyan) 48%, transparent);
      background: transparent;
      color: white;
      outline: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-drawer {
      border: 1px solid var(--studio-v8-border-strong);
      border-radius: 8px;
      background: var(--studio-v8-panel);
      color: var(--studio-v8-text);
      box-shadow: 0 18px 52px rgba(0, 0, 0, 0.48);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-drawer__list,
    #studioRoot[data-studio-ui="v8"] .studio-native-drawer__detail {
      background: var(--studio-v8-panel);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-drawer__search,
    #studioRoot[data-studio-ui="v8"] .studio-input,
    #studioRoot[data-studio-ui="v8"] .studio-native-identity__select select,
    #studioRoot[data-studio-ui="v8"] .studio-native-states__select select {
      border-color: var(--studio-v8-border);
      background: #0a1625;
      color: var(--studio-v8-text-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-drawer__close:hover,
    #studioRoot[data-studio-ui="v8"] .studio-state-row:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-identity .studio-state-row:hover {
      background: transparent;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-module-drawer {
      display: grid;
      height: 100%;
      min-height: 0;
      gap: 0;
      overflow: hidden;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity {
      display: grid;
      grid-template-columns: minmax(208px, 0.42fr) minmax(0, 1fr);
      grid-template-rows: auto minmax(0, 1fr);
      height: 100%;
      min-height: 0;
      overflow: hidden;
      border: 0;
      border-radius: 0;
      background: transparent;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__divider,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__divider {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__toolbar {
      display: grid;
      grid-column: 1 / -1;
      grid-row: 1;
      grid-template-columns: minmax(0, 1fr) minmax(146px, 160px);
      align-items: center;
      gap: 12px;
      min-width: 0;
      border-bottom: 1px solid var(--studio-v8-border);
      background: rgba(9, 13, 18, 0.72);
      padding: 11px 18px 12px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__list,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: 100%;
      max-height: none;
      min-height: 0;
      overflow: hidden;
      border-right: 1px solid var(--studio-v8-border);
      border-bottom: 0;
      background: rgba(9, 13, 18, 0.54);
      padding: 15px 13px 14px 18px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__list,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__list {
      grid-column: 1;
      grid-row: 2;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__filters {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      width: 100%;
      min-width: 146px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__list-title h3,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__list-title h3 {
      color: var(--studio-v8-text-strong);
      font-size: 14px;
      font-weight: 760;
      letter-spacing: 0;
      line-height: 1.2;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__list-title strong,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__list-title strong,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__list-section strong,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__count strong {
      color: var(--studio-v8-accent-muted);
      font-size: 12px;
      font-weight: 760;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__search,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__search {
      min-height: 40px;
      border-color: rgba(51, 66, 81, 0.8);
      border-radius: 8px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.024), transparent),
        rgba(13, 19, 26, 0.88);
      color: var(--studio-v8-muted-strong);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.024);
      transition: border-color 220ms var(--studio-v8-ease), background 220ms var(--studio-v8-ease), color 220ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__search input,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__search input {
      color: var(--studio-v8-text-strong);
      font-size: 12px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__search:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__search:focus-within,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__search:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__search:focus-within {
      border-color: rgba(142, 174, 218, 0.42);
      background: rgba(16, 23, 31, 0.96);
      color: var(--studio-v8-text-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__toolbar .studio-native-states__search {
      display: grid;
      grid-template-columns: 16px minmax(0, 1fr);
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__select span,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__select span {
      color: var(--studio-v8-muted);
      font-size: 11px;
      font-weight: 650;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__select-icon {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__select--filter {
      position: relative;
      display: grid;
      grid-template-columns: 16px auto 12px;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-width: 146px;
      min-height: 40px;
      border: 1px solid rgba(51, 66, 81, 0.82);
      border-radius: 8px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.024), transparent),
        rgba(13, 19, 26, 0.9);
      color: var(--studio-v8-text);
      padding: 0 12px;
      overflow: visible;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.026);
      transition: border-color 220ms var(--studio-v8-ease), background 220ms var(--studio-v8-ease), color 220ms var(--studio-v8-ease), transform 260ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__select--filter::after {
      content: "";
      width: 7px;
      height: 7px;
      border-right: 1.5px solid currentColor;
      border-bottom: 1.5px solid currentColor;
      transform: rotate(45deg) translateY(-2px);
      opacity: 0.78;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__select--filter span {
      overflow: visible;
      color: var(--studio-v8-text);
      font-size: 12px;
      font-weight: 760;
      line-height: 1;
      text-overflow: clip;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__select--filter:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__select--filter:focus-within {
      border-color: rgba(142, 174, 218, 0.42);
      background: rgba(17, 24, 32, 0.94);
      color: var(--studio-v8-text-strong);
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__select--filter select {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__select--compat-sort {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__filters,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__form,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__related-grid,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__readonly,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__form,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__related-grid,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__advanced-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__toolbar .studio-native-identity__filters {
      grid-template-columns: minmax(146px, 1fr);
      min-width: 146px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__list > .studio-native-identity__filters {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__list > .studio-native-identity__filters .studio-native-identity__select span {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__list > .studio-native-identity__filters .studio-native-identity__select select {
      height: 40px;
      border-color: rgba(51, 66, 81, 0.82);
      border-radius: 8px;
      background: rgba(13, 19, 26, 0.9);
      color: var(--studio-v8-text-strong);
      padding: 0 34px 0 12px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__list > .studio-native-identity__filters .studio-native-identity__count {
      display: grid;
      align-content: center;
      min-width: 52px;
      height: 40px;
      border: 1px solid rgba(51, 66, 81, 0.6);
      border-radius: 8px;
      background: rgba(13, 19, 26, 0.58);
      padding: 0 10px;
      text-align: right;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__rows,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__rows {
      flex: 1 1 auto;
      max-height: none;
      min-height: 0;
      overflow: auto;
      padding-right: 6px;
      scrollbar-gutter: stable;
      scrollbar-color: var(--studio-v8-border-strong) transparent;
      scrollbar-width: thin;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__detail-wrap,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__detail-wrap {
      display: grid;
      grid-template-rows: minmax(0, 1fr);
      gap: 0;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      padding: 18px 18px 14px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__detail-wrap,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__detail-wrap {
      grid-column: 2;
      grid-row: 2;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-states__stats {
      display: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 12px;
      height: 100%;
      min-height: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail {
      grid-template-rows: auto;
      align-content: start;
      overflow: auto;
      padding-right: 6px;
      scrollbar-gutter: stable;
      scrollbar-color: var(--studio-v8-border-strong) transparent;
      scrollbar-width: thin;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__scroll {
      display: grid;
      align-content: start;
      grid-auto-rows: max-content;
      gap: 12px;
      min-height: 0;
      overflow: auto;
      padding: 0 6px 0 0;
      scrollbar-gutter: stable;
      scrollbar-color: var(--studio-v8-border-strong) transparent;
      scrollbar-width: thin;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__hero,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__hero {
      display: flex;
      align-items: center;
      min-height: 24px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
      gap: 8px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__title-line,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__title-line {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__color-ring,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__color-ring {
      order: 2;
      display: inline-flex;
      position: relative;
      flex: 0 0 auto;
      width: 15px;
      height: 15px;
      border: 0;
      border-radius: 999px;
      background: var(--state-color, var(--studio-v8-cyan));
      cursor: pointer;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.14), 0 8px 16px rgba(0, 0, 0, 0.18);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__color-ring input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__hero h3,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__hero h3 {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      margin: 0;
      color: var(--studio-v8-text-strong);
      font-size: 17px;
      font-weight: 760;
      line-height: 1.18;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-entity-row {
      min-height: 54px;
      border: 1px solid transparent;
      border-radius: 7px;
      background: transparent;
      color: var(--studio-v8-text);
      padding: 0 8px;
      will-change: transform;
      transition:
        border-color 220ms var(--studio-v8-ease),
        background-color 220ms var(--studio-v8-ease),
        color 220ms var(--studio-v8-ease),
        transform 260ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-entity-row:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-entity-row:focus-visible {
      border-color: transparent;
      background: transparent;
      color: var(--studio-v8-text-strong);
      outline: none;
      transform: translateX(2px);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-entity-row.is-active {
      border-color: transparent;
      background: transparent;
      color: var(--studio-v8-text-strong);
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-state-row__main strong {
      color: var(--studio-v8-text-strong);
      font-size: 13px;
      font-weight: 770;
      line-height: 1.2;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-state-row__main small,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-state-row__metric {
      color: var(--studio-v8-muted);
      font-family: var(--studio-v8-mono);
      font-size: 11px;
      line-height: 1.2;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__section,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__advanced,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__section,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__advanced {
      display: grid;
      gap: 8px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__stat-row,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__readonly {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 16px;
      row-gap: 14px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__readonly {
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 2px 0 4px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-state-readonly-grid {
      position: relative;
      display: grid;
      align-self: start;
      align-content: start;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: minmax(30px, auto);
      gap: 0 18px;
      min-height: 0;
      border: 0;
      border-top: 0;
      border-bottom: 0;
      border-radius: 0;
      background: transparent;
      padding: 8px 0;
      overflow: hidden;
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__kv {
      display: grid;
      align-content: start;
      gap: 4px;
      min-height: 48px;
      border: 0;
      border-radius: 0;
      border-bottom: 1px solid rgba(73, 103, 132, 0.42);
      background: transparent;
      padding: 0 0 12px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__kv {
      display: grid;
      align-content: center;
      gap: 1px;
      min-height: 30px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 2px 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__kv::before {
      content: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__kv span,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__kv span {
      color: var(--studio-v8-muted);
      font-size: 11px;
      font-weight: 680;
      line-height: 1.1;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__kv strong,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity__kv strong {
      color: var(--studio-v8-text-strong);
      font-size: 15px;
      font-weight: 840;
      line-height: 1.12;
      letter-spacing: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__kv span {
      color: rgba(150, 178, 204, 0.82);
      font-size: 9.5px;
      font-weight: 680;
      line-height: 1.1;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__kv strong {
      color: rgba(241, 248, 255, 0.98);
      font-size: 14px;
      font-weight: 820;
      line-height: 1.08;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-field,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-field {
      gap: 5px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-field span,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-field span,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__section-label,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__section-label {
      color: var(--studio-v8-muted-strong);
      font-size: 11px;
      font-weight: 690;
      line-height: 1.2;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-field .studio-input,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-field .studio-input {
      min-height: 36px;
      border-color: rgba(51, 66, 81, 0.82);
      border-radius: var(--studio-v8-radius-sm);
      background: rgba(9, 13, 18, 0.72);
      color: var(--studio-v8-text-strong);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
      font-size: 12px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__form > .studio-native-state-field:only-child,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__related-grid > .studio-native-state-field:only-child,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__form > .studio-native-identity-field:only-child,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__related-grid > .studio-native-identity-field:only-child {
      grid-column: 1 / -1;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-field .studio-input:focus,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-field .studio-input:focus {
      border-color: var(--studio-v8-cyan);
      background: rgba(14, 20, 27, 0.94);
      box-shadow: 0 0 0 3px rgba(142, 174, 218, 0.12);
      outline: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-color-field {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-items: stretch;
      gap: 5px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-color-control {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 28px;
      align-items: center;
      min-height: 36px;
      border: 1px solid rgba(51, 66, 81, 0.82);
      border-radius: var(--studio-v8-radius-sm);
      background: rgba(9, 13, 18, 0.72);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
      padding: 0 7px 0 10px;
      transition:
        border-color 140ms var(--studio-native-ease),
        background-color 140ms var(--studio-native-ease),
        box-shadow 140ms var(--studio-native-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-color-control code {
      overflow: hidden;
      color: var(--studio-v8-text-strong);
      font-family: inherit;
      font-size: 12px;
      font-weight: 650;
      letter-spacing: 0;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-color-control:focus-within {
      border-color: var(--studio-v8-cyan);
      background: rgba(14, 20, 27, 0.94);
      box-shadow: 0 0 0 3px rgba(142, 174, 218, 0.12);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-color-field input[type='color'] {
      justify-self: end;
      width: 24px;
      height: 24px;
      border: 1px solid rgba(220, 235, 255, 0.16);
      border-radius: 5px;
      background: transparent;
      cursor: pointer;
      padding: 2px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-color-field input[type='color']::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-color-field input[type='color']::-webkit-color-swatch {
      border: 0;
      border-radius: 4px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__top-actions,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__related-actions,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__top-actions,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__related-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__top-actions .studio-ghost,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__related-actions .studio-ghost,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__top-actions .studio-ghost,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__related-actions .studio-ghost {
      min-height: 30px;
      border: 1px solid var(--studio-v8-border);
      border-radius: 4px;
      background: var(--studio-v8-panel);
      color: var(--studio-v8-muted-strong);
      padding: 0 9px;
      font-size: 11px;
      font-weight: 600;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__top-actions .studio-ghost:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__related-actions .studio-ghost:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__top-actions .studio-ghost:hover,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__related-actions .studio-ghost:hover {
      border-color: var(--studio-v8-border-strong);
      background: transparent;
      color: var(--studio-v8-text-strong);
      box-shadow: none;
      transform: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel {
      display: grid;
      gap: 12px;
      border-top: 1px solid var(--studio-v8-border);
      border-bottom: 1px solid var(--studio-v8-border);
      padding: 14px 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__header div {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__header h4 {
      margin: 0;
      color: var(--studio-v8-text-strong);
      font-size: 13px;
      font-weight: 760;
      line-height: 1.2;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__header strong {
      flex: 0 0 auto;
      color: var(--studio-v8-cyan);
      font-size: 11px;
      font-weight: 780;
      line-height: 1.2;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__header-icon,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__unit-icon {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__header-icon {
      color: var(--studio-v8-muted-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__compare {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__side {
      display: grid;
      gap: 8px;
      min-width: 0;
      border: 1px solid var(--studio-v8-border);
      border-radius: 8px;
      background: rgba(7, 19, 29, 0.66);
      padding: 11px 12px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__side > span,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__unit small {
      overflow: hidden;
      color: var(--studio-v8-muted);
      font-size: 10px;
      font-weight: 650;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__side > strong {
      overflow: hidden;
      color: var(--studio-v8-text-strong);
      font-size: 13px;
      font-weight: 780;
      line-height: 1.15;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__stats div {
      display: grid;
      gap: 3px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__stats em {
      overflow: hidden;
      color: var(--studio-v8-text-strong);
      font-size: 13px;
      font-style: normal;
      font-weight: 800;
      line-height: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__stats small {
      color: var(--studio-v8-muted);
      font-size: 9px;
      font-weight: 620;
      line-height: 1;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__samples {
      display: grid;
      gap: 6px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__unit {
      display: grid;
      grid-template-columns: 16px minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
      min-width: 0;
      border-radius: 6px;
      color: var(--studio-v8-muted-strong);
      padding: 6px 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__unit div {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__unit strong {
      overflow: hidden;
      color: var(--studio-v8-text);
      font-size: 12px;
      font-weight: 720;
      line-height: 1.15;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__unit em {
      color: var(--studio-v8-cyan);
      font-size: 12px;
      font-style: normal;
      font-weight: 800;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-diplomacy-intel__empty {
      border-radius: 7px;
      background: rgba(8, 20, 31, 0.58);
      color: var(--studio-v8-muted);
      font-size: 12px;
      font-weight: 600;
      line-height: 1.45;
      padding: 10px 12px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__actions,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__actions {
      position: sticky;
      bottom: 0;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin: 0;
      border-top: 0;
      background: var(--studio-v8-panel);
      box-shadow: none;
      padding: 12px 0 0;
      z-index: 2;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__actions .studio-primary-action,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__actions .studio-primary-action {
      border-color: var(--studio-v8-cyan);
      background: var(--studio-v8-cyan-deep);
      color: var(--studio-v8-text-strong);
      box-shadow: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-state-detail__actions .studio-ghost,
    #studioRoot[data-studio-ui="v8"] .studio-native-v8-info-panel .studio-native-identity-detail__actions .studio-ghost {
      background: transparent;
      color: var(--studio-v8-text);
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector {
      display: grid;
      gap: 12px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1px;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--studio-v8-border) 86%, transparent);
      border-radius: 5px;
      background: color-mix(in srgb, var(--studio-v8-border) 64%, transparent);
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__kv {
      display: grid;
      gap: 4px;
      min-width: 0;
      min-height: 54px;
      border: 0;
      border-radius: 0;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent),
        var(--studio-v8-surface);
      padding: 9px 10px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__kv span {
      overflow: hidden;
      color: var(--studio-v8-muted);
      font-size: 10px;
      font-weight: 760;
      letter-spacing: 0.055em;
      line-height: 1.1;
      text-transform: uppercase;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__kv strong {
      overflow: hidden;
      color: var(--studio-v8-text-strong);
      font-family: var(--studio-v8-mono);
      font-size: 14px;
      font-weight: 760;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__preset {
      display: grid;
      gap: 6px;
      margin: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__preset > span {
      color: var(--studio-v8-muted-strong);
      font-size: 11px;
      font-weight: 700;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__preset select {
      min-height: 34px;
      border: 1px solid var(--studio-v8-border);
      border-radius: 4px;
      background: color-mix(in srgb, var(--studio-v8-bg) 70%, var(--studio-v8-surface));
      color: var(--studio-v8-text-strong);
      font: inherit;
      font-size: 12px;
      font-weight: 680;
      padding: 0 9px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin: 0;
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__actions .studio-ghost {
      min-height: 32px;
      border: 1px solid var(--studio-v8-border);
      border-radius: 4px;
      background: transparent;
      color: var(--studio-v8-muted-strong);
      font-size: 12px;
      font-weight: 700;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__actions .studio-ghost:hover:not(:disabled) {
      border-color: var(--studio-v8-border-strong);
      background: transparent;
      color: var(--studio-v8-text-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-inspector__groups {
      display: grid;
      gap: 10px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-group {
      display: grid;
      gap: 7px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      padding: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-group__header {
      display: flex;
      align-items: center;
      min-height: 18px;
      border-bottom: 1px solid color-mix(in srgb, var(--studio-v8-border) 62%, transparent);
      padding: 0 0 5px;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-group__title {
      margin: 0;
      color: var(--studio-v8-muted-strong);
      font-size: 10.5px;
      font-weight: 820;
      letter-spacing: 0.07em;
      line-height: 1;
      text-transform: uppercase;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-group__strip {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
      min-width: 0;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 28px;
      min-width: 0;
      min-height: 32px;
      border: 1px solid color-mix(in srgb, var(--studio-v8-border) 78%, transparent);
      border-radius: 4px;
      background: color-mix(in srgb, var(--studio-v8-bg) 64%, var(--studio-v8-surface));
      overflow: hidden;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token.is-active {
      border-color: transparent;
      background: transparent;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token.is-pinned {
      box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--studio-v8-accent) 32%, transparent);
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token__toggle {
      display: grid;
      grid-template-columns: 10px minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      min-width: 0;
      min-height: 30px;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--studio-v8-muted-strong);
      cursor: pointer;
      font: inherit;
      padding: 0 8px;
      text-align: left;
      transition:
        background-color 160ms var(--studio-v8-ease),
        color 160ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token__toggle:hover,
    #studioRoot[data-studio-ui="v8"] .studio-layer-token__toggle:focus-visible {
      background: transparent;
      color: var(--studio-v8-text-strong);
      outline: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token__toggle.is-active {
      color: var(--studio-v8-text-strong);
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token__state {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--studio-v8-muted);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.07);
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token__toggle.is-active .studio-layer-token__state {
      background: var(--studio-v8-accent);
      box-shadow: 0 0 0 1px rgba(142, 174, 218, 0.18);
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token__label {
      overflow: hidden;
      font-size: 11.5px;
      font-weight: 700;
      line-height: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token__pin {
      display: grid;
      place-items: center;
      width: 28px;
      min-height: 30px;
      border: 0;
      border-left: 1px solid color-mix(in srgb, var(--studio-v8-border) 72%, transparent);
      border-radius: 0;
      background: transparent;
      color: var(--studio-v8-muted);
      cursor: pointer;
      padding: 0;
      transition:
        background-color 160ms var(--studio-v8-ease),
        color 160ms var(--studio-v8-ease);
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token__pin:hover,
    #studioRoot[data-studio-ui="v8"] .studio-layer-token__pin:focus-visible,
    #studioRoot[data-studio-ui="v8"] .studio-layer-token__pin.is-pinned {
      background: transparent;
      color: var(--studio-v8-accent);
      outline: none;
    }

    #studioRoot[data-studio-ui="v8"] .studio-layer-token__pin-icon {
      width: 14px;
      height: 14px;
      stroke-width: 1.7;
    }
`;

export const nativeShellStyles = `    .studio-native-app {
      grid-template-rows: 48px minmax(0, 1fr);
      background: var(--studio-native-chrome-solid);
      color: var(--studio-native-text);
      --studio-native-border: #1f1f23;
      --studio-native-border-strong: #2f2f35;
      --studio-native-muted: #71717a;
      --studio-native-text: #f4f4f5;
      --studio-native-text-strong: #ffffff;
      --studio-native-text-muted: #a1a1aa;
      --studio-native-accent: #7fa8bf;
      --studio-native-accent-hover: #6f98ae;
      --studio-native-accent-strong: #9fc2d2;
      --studio-native-accent-muted: rgba(168, 85, 247, 0.14);
      --studio-native-on-accent: #ffffff;
      --studio-native-editor-primary: #ffffff;
      --studio-native-topbar-hover-text: #ffffff;
      --studio-native-top-action-text: #d4d4d8;
      --studio-native-top-action-hover-text: #e4e4e7;
      --studio-native-editor-actions-shadow: 0 -16px 24px rgba(10, 10, 10, 0.94);
      --studio-native-utility-icon: rgba(190, 200, 216, 0.88);
      --studio-native-utility-icon-hover: rgba(226, 232, 240, 0.96);
      --studio-native-iconbar-text: rgba(218, 220, 229, 0.86);
      --studio-native-iconbar-active-text: rgba(238, 241, 248, 0.94);
      --studio-native-iconbar-hover-bg: rgba(255, 255, 255, 0.06);
      --studio-native-toolbar-text: #f4f4f5;
      --studio-native-toolbar-control-bg: rgba(255, 255, 255, 0.04);
      --studio-native-toolbar-control-hover-bg: rgba(255, 255, 255, 0.08);
      --studio-native-toolbar-dropdown-bg: rgba(10, 10, 10, 0.96);
      --studio-native-layerbar-popover-bg: rgba(7, 7, 7, 0.94);
      --studio-native-map-zoom-bg: rgba(10, 10, 10, 0.94);
      --studio-native-map-zoom-text: #f4f4f5;
      --studio-native-map-zoom-hover-bg: rgba(255, 255, 255, 0.08);
      --studio-native-map-zoom-shadow: 0 14px 30px rgba(0, 0, 0, 0.32);
      --studio-native-chrome: rgba(10, 10, 10, 0.94);
      --studio-native-chrome-solid: #0a0a0a;
      --studio-native-chrome-hover: #151517;
      --studio-native-bar-bg:
        linear-gradient(180deg, rgba(24, 24, 27, 0.92), rgba(10, 10, 10, 0)),
        var(--studio-native-chrome-solid);
      --studio-native-icon-bg: #141416;
      --studio-native-icon-border: #2a2a2e;
      --studio-native-icon-color: #a1a1aa;
      --studio-native-panel: #0f0f10;
      --studio-native-panel-raised: rgba(18, 18, 20, 0.94);
      --studio-native-field-bg: #0a0a0a;
      --studio-native-field-focus-bg: #0f0f10;
      --studio-native-row-hover: #151517;
      --studio-native-stage-bg: #050505;
      --studio-native-map-gutter-bg: #052f5f;
      --studio-native-layerbar-height: 48px;
      --studio-native-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
      --studio-native-ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);
      --studio-native-focus-ring: rgba(124, 58, 237, 0.28);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-native-app {
      --studio-native-border: #d9dee8;
      --studio-native-border-strong: #c1c8d4;
      --studio-native-muted: #6b7280;
      --studio-native-text: #253044;
      --studio-native-text-strong: #111827;
      --studio-native-text-muted: #647084;
      --studio-native-accent: #7c3aed;
      --studio-native-accent-hover: #6d28d9;
      --studio-native-accent-strong: #6d28d9;
      --studio-native-accent-muted: rgba(124, 58, 237, 0.12);
      --studio-native-on-accent: #ffffff;
      --studio-native-editor-primary: #111827;
      --studio-native-topbar-hover-text: #111827;
      --studio-native-top-action-text: #475569;
      --studio-native-top-action-hover-text: #2f1a54;
      --studio-native-editor-actions-shadow: 0 -14px 24px rgba(255, 255, 255, 0.92);
      --studio-native-utility-icon: rgba(84, 95, 113, 0.9);
      --studio-native-utility-icon-hover: rgba(17, 24, 39, 0.96);
      --studio-native-iconbar-text: rgba(71, 85, 105, 0.9);
      --studio-native-iconbar-active-text: rgba(17, 24, 39, 0.96);
      --studio-native-iconbar-hover-bg: #eef2f7;
      --studio-native-toolbar-text: #253044;
      --studio-native-toolbar-control-bg: rgba(15, 23, 42, 0.04);
      --studio-native-toolbar-control-hover-bg: rgba(15, 23, 42, 0.08);
      --studio-native-toolbar-dropdown-bg: rgba(255, 255, 255, 0.98);
      --studio-native-layerbar-popover-bg: rgba(255, 255, 255, 0.96);
      --studio-native-map-zoom-bg: rgba(255, 255, 255, 0.9);
      --studio-native-map-zoom-text: #475569;
      --studio-native-map-zoom-hover-bg: rgba(124, 58, 237, 0.1);
      --studio-native-map-zoom-shadow: 0 10px 24px rgba(31, 41, 55, 0.18);
      --studio-native-chrome: rgba(247, 249, 252, 0.92);
      --studio-native-chrome-solid: #f7f8fb;
      --studio-native-chrome-hover: #eef2f7;
      --studio-native-bar-bg:
        linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(247, 248, 251, 0)),
        var(--studio-native-chrome-solid);
      --studio-native-icon-bg: #f2f4f8;
      --studio-native-icon-border: #d9dee8;
      --studio-native-icon-color: #647084;
      --studio-native-panel: #ffffff;
      --studio-native-panel-raised: rgba(255, 255, 255, 0.96);
      --studio-native-field-bg: #f8fafc;
      --studio-native-field-focus-bg: #ffffff;
      --studio-native-row-hover: #eef2f7;
      --studio-native-stage-bg: #eef1f6;
      --studio-native-map-gutter-bg: #052f5f;
      --studio-native-focus-ring: rgba(124, 58, 237, 0.2);
    }

    .studio-project-home-app {
      display: block;
      height: 100%;
      background: #0a0a0a;
    }

    .studio-project-home {
      position: relative;
      display: grid;
      place-items: center;
      min-height: 100%;
      overflow: auto;
      background: #0a0a0a;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-project-home-app,
    #studioRoot[data-studio-theme="daylight"] .studio-project-home {
      background: var(--studio-native-chrome-solid);
      color: var(--studio-native-text);
    }

    .studio-project-home__utility {
      position: absolute;
      top: 16px;
      right: 18px;
      z-index: 2;
    }

    .studio-project-home__content {
      display: grid;
      width: min(720px, calc(100vw - 48px));
      gap: 28px;
      padding: 80px 0 40px;
    }

    .studio-project-home__brand {
      display: grid;
      justify-items: center;
      gap: 10px;
      text-align: center;
    }

    .studio-project-home__brand-mark {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: #1a1124;
      color: #7fa8bf;
    }

    .studio-project-home__brand-icon {
      width: 28px;
      height: 28px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-project-home h1,
    .studio-project-home h2,
    .studio-native-drawer h2 {
      margin: 0;
      letter-spacing: 0;
    }

    .studio-project-home h1 {
      font-size: 28px;
      line-height: 1.1;
      font-weight: 720;
    }

    .studio-project-home p {
      margin: 0;
      color: var(--studio-native-muted);
      font-size: 14px;
    }

    .studio-project-home__actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      min-width: 0;
    }

    .studio-project-home__action,
    .studio-project-home__recent-row,
    .studio-project-home__template {
      border: 1px solid var(--studio-native-border);
      background: var(--studio-native-panel);
      color: var(--studio-native-editor-primary);
      font: inherit;
      cursor: pointer;
    }

    .studio-project-home__action {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 36px;
      border-radius: 4px;
      padding: 0 18px;
      font-size: 13px;
      font-weight: 650;
    }

    .studio-project-home__action--primary {
      border-color: #7fa8bf;
      background: #7fa8bf;
    }

    .studio-project-home__action-icon,
    .studio-project-home__recent-svg,
    .studio-project-home__recent-arrow {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-project-home__section {
      display: grid;
      gap: 10px;
    }

    .studio-project-home__section h2 {
      color: var(--studio-native-text-muted);
      font-size: 15px;
      font-weight: 700;
    }

    .studio-project-home__recent-list {
      display: grid;
      gap: 8px;
    }

    .studio-project-home__recent-row {
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr) 14px;
      align-items: center;
      gap: 12px;
      min-height: 48px;
      border-radius: 4px;
      padding: 8px 16px;
      text-align: left;
    }

    .studio-project-home__recent-icon {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background: #1a1124;
      color: #7fa8bf;
    }

    .studio-project-home__recent-main {
      display: grid;
      min-width: 0;
      gap: 2px;
    }

    .studio-project-home__recent-main strong,
    .studio-project-home__template strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 700;
    }

    .studio-project-home__recent-main span,
    .studio-project-home__template span {
      overflow: hidden;
      color: var(--studio-native-muted);
      font-size: 11px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-project-home__templates {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .studio-project-home__template {
      display: grid;
      min-width: 0;
      overflow: hidden;
      border-radius: 8px;
      text-align: left;
    }

    .studio-project-home__template-art {
      height: 80px;
      background:
        linear-gradient(135deg, rgba(168, 85, 247, 0.2), transparent 42%),
        linear-gradient(180deg, #334155, #111827);
    }

    .studio-project-home__template-body {
      display: grid;
      min-width: 0;
      gap: 2px;
      padding: 9px 12px 12px;
    }

    .studio-project-home__footer,
    .studio-project-home__empty {
      color: var(--studio-native-muted);
      font-size: 11px;
      text-align: center;
    }

    #studioRoot[data-studio-theme] .studio-native-app {
      background: var(--studio-native-chrome-solid);
      color: var(--studio-native-text);
    }

    .studio-native-topbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      height: 48px;
      min-height: 48px;
      box-sizing: border-box;
      padding: 0 14px 0 12px;
      border-bottom: 1px solid var(--studio-native-border);
      background: var(--studio-native-bar-bg);
      color: var(--studio-native-text);
      overflow: hidden;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-native-topbar {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      min-height: 48px;
      padding: 0 14px 0 12px;
      background: var(--studio-native-bar-bg);
      border-bottom-color: var(--studio-native-border);
    }

    .studio-native-topbar .studio-topbar__group--brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-native-topbar .studio-topbar__group--brand {
      width: auto;
      min-width: 0;
      gap: 10px;
    }

    .studio-native-topbar .studio-topbar__group--actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 0;
    }

    .studio-topbar__native-menu,
    .studio-topbar__project-center {
      display: inline-grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: var(--studio-native-text-muted);
      cursor: pointer;
      padding: 0;
      transition:
        background-color 150ms var(--studio-native-ease),
        color 150ms var(--studio-native-ease);
    }

    .studio-topbar__native-menu:hover,
    .studio-topbar__project-center:hover,
    .studio-topbar__project-center:focus-visible {
      background: transparent;
      color: var(--studio-native-topbar-hover-text);
    }

    .studio-topbar__project-center:focus-visible {
      outline: none;
    }

    .studio-topbar__native-menu-icon,
    .studio-topbar__utility-icon {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.78;
      stroke-linecap: round;
      stroke-linejoin: round;
      transform-origin: 50% 50%;
      transition:
        color 150ms var(--studio-native-ease),
        transform 160ms var(--studio-native-ease);
    }

    .studio-material-symbol-icon {
      display: inline-grid;
      place-items: center;
      overflow: hidden;
      color: var(--studio-native-text-muted);
      font-family: "Material Symbols Outlined";
      font-size: 24px;
      font-style: normal;
      font-weight: 300;
      font-feature-settings: "liga";
      line-height: 1;
      text-transform: none;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
    }

    .studio-topbar__native-menu:hover .studio-material-symbol-icon,
    .studio-topbar__native-menu:focus-visible .studio-material-symbol-icon,
    .studio-topbar__project-center:hover .studio-material-symbol-icon,
    .studio-topbar__project-center:focus-visible .studio-material-symbol-icon,
    .studio-native-topbar .studio-ghost:hover .studio-material-symbol-icon,
    .studio-native-topbar .studio-ghost:focus-visible .studio-material-symbol-icon {
      color: var(--studio-native-topbar-hover-text);
    }

    .studio-brand--native {
      display: inline-grid;
      place-items: center;
      width: 28px;
      height: 28px;
      flex: 0 0 auto;
      border: 0;
      background: transparent;
      padding: 0;
      cursor: pointer;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-brand--native {
      width: 28px;
      min-width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 6px;
    }

    .studio-native-topbar .studio-brand__logo {
      width: 26px;
      height: 26px;
      border-radius: 6px;
    }

    .studio-topbar__native-name {
      min-width: 0;
      overflow: hidden;
      color: var(--studio-native-text-strong);
      font-size: 13px;
      font-weight: 760;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-topbar .studio-topbar__utility-group {
      height: 32px;
      padding: 0;
      border: 0;
      border-color: transparent;
      border-radius: 0;
      outline: 0;
      background: transparent;
      box-shadow: none;
      gap: 10px;
    }

    .studio-native-topbar .studio-ghost {
      width: 28px;
      height: 28px;
      min-width: 28px;
      min-height: 28px;
      padding: 0;
      border: 0;
      border-color: transparent;
      border-radius: 0;
      outline: 0;
      appearance: none;
      background: transparent;
      box-shadow: none;
      color: var(--studio-native-text-muted);
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-native-topbar .studio-topbar__utility-group,
    #studioRoot[data-studio-theme] .studio-native-app .studio-native-topbar .studio-ghost {
      padding: 0;
      border: 0;
      border-color: transparent;
      border-radius: 0;
      outline: 0;
      background: transparent;
      box-shadow: none;
    }

    .studio-native-topbar .studio-topbar__utility-group::before,
    .studio-native-topbar .studio-topbar__utility-group::after,
    .studio-native-topbar .studio-topbar__utility-group .studio-ghost::before,
    .studio-native-topbar .studio-topbar__utility-group .studio-ghost::after {
      content: none;
      display: none;
      border: 0;
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme] .studio-topbar__utility-group {
      padding: 0;
      border: 0;
      border-color: transparent;
      border-radius: 0;
      outline: 0;
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme] .studio-topbar__utility-group .studio-ghost {
      width: 28px;
      height: 28px;
      min-width: 28px;
      min-height: 28px;
      padding: 0;
      border: 0;
      border-color: transparent;
      border-radius: 0;
      outline: 0;
      appearance: none;
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme] .studio-topbar__utility-group .studio-ghost:hover:not(:disabled),
    #studioRoot[data-studio-theme] .studio-topbar__utility-group .studio-ghost:focus-visible {
      border: 0;
      border-color: transparent;
      outline: 0;
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme] .studio-topbar__utility-group::before,
    #studioRoot[data-studio-theme] .studio-topbar__utility-group::after,
    #studioRoot[data-studio-theme] .studio-topbar__utility-group .studio-ghost::before,
    #studioRoot[data-studio-theme] .studio-topbar__utility-group .studio-ghost::after {
      content: none;
      display: none;
      border: 0;
      background: transparent;
      box-shadow: none;
    }

    .studio-native-topbar .studio-ghost:hover,
    .studio-native-topbar .studio-ghost:focus-visible {
      background: transparent;
      box-shadow: none;
      color: var(--studio-native-topbar-hover-text);
    }

    .studio-native-topbar .studio-topbar__utility-group .studio-topbar__utility-icon {
      width: 24px;
      height: 24px;
      color: currentColor;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.78;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #studioRoot[data-studio-theme] .studio-topbar__utility-group .studio-topbar__utility-icon {
      width: 19px;
      height: 19px;
      color: var(--studio-native-utility-icon);
      font-size: 19px;
      opacity: 0.88;
      stroke-width: 1.58;
    }

    .studio-native-topbar .studio-ghost:hover .studio-topbar__utility-icon,
    .studio-native-topbar .studio-ghost:focus-visible .studio-topbar__utility-icon {
      transform: translateY(-1px) scale(1.04);
    }

    #studioRoot[data-studio-theme] .studio-topbar__utility-group .studio-ghost:hover .studio-topbar__utility-icon,
    #studioRoot[data-studio-theme] .studio-topbar__utility-group .studio-ghost:focus-visible .studio-topbar__utility-icon {
      color: var(--studio-native-utility-icon-hover);
      opacity: 0.96;
      transform: translateY(-1px) scale(1.03);
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-native-topbar .studio-ghost:hover,
    #studioRoot[data-studio-theme] .studio-native-app .studio-native-topbar .studio-ghost:focus-visible {
      border: 0;
      background: transparent;
      box-shadow: none;
    }

    .studio-native-workbench {
      display: grid;
      grid-template-columns: 56px minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr) auto;
      height: 100%;
      min-height: 0;
      background: var(--studio-native-stage-bg);
    }

    .studio-native-app:not(.is-nav-collapsed) .studio-native-workbench {
      grid-template-columns: 172px minmax(0, 1fr);
    }

    .studio-native-iconbar {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 0;
      min-height: 0;
      grid-column: 1;
      grid-row: 1;
      overflow: hidden;
      border-right: 1px solid var(--studio-native-border);
      background: var(--studio-native-bar-bg);
      padding: 12px 8px;
      box-shadow: 1px 0 0 rgba(255, 255, 255, 0.03);
    }

    .studio-native-iconbar__toggle,
    .studio-native-iconbar__item {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 46px;
      border: 1px solid transparent;
      border-radius: 11px;
      background: transparent;
      color: var(--studio-native-iconbar-text);
      cursor: pointer;
      font: inherit;
      font-size: 15px;
      font-weight: 500;
      gap: 13px;
      padding: 0 14px;
      text-align: left;
      transition:
        background-color 160ms var(--studio-native-ease),
        border-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        box-shadow 180ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    .studio-native-app.is-nav-collapsed .studio-native-iconbar__toggle,
    .studio-native-app.is-nav-collapsed .studio-native-iconbar__item {
      justify-content: center;
      padding: 0;
    }

    .studio-native-app.is-nav-collapsed .studio-native-iconbar__item span,
    .studio-native-app.is-nav-collapsed .studio-native-iconbar__toggle span {
      display: none;
    }

    .studio-native-iconbar__nav {
      display: grid;
      align-content: start;
      gap: 6px;
      min-height: 0;
      overflow: auto;
      scrollbar-width: thin;
    }

    .studio-native-iconbar__global-area {
      align-self: end;
      padding-top: 12px;
    }

    .studio-native-iconbar__nav--global {
      overflow: visible;
      padding: 0;
    }

    .studio-native-iconbar__item.is-active {
      border-color: transparent;
      background: rgba(168, 85, 247, 0.16);
      color: var(--studio-native-iconbar-active-text);
      box-shadow: none;
    }

    .studio-native-iconbar__item.is-active::before {
      position: absolute;
      top: 10px;
      bottom: 10px;
      left: 5px;
      width: 3px;
      border-radius: 999px;
      background: var(--studio-native-accent);
      content: "";
    }

    .studio-native-iconbar__item.is-disabled,
    .studio-native-iconbar__item:disabled {
      cursor: not-allowed;
      opacity: 0.42;
    }

    .studio-native-iconbar__item:hover,
    .studio-native-iconbar__toggle:hover {
      border-color: transparent;
      background: var(--studio-native-iconbar-hover-bg);
      color: var(--studio-native-iconbar-active-text);
      transform: none;
    }

    .studio-native-iconbar__item.is-disabled:hover,
    .studio-native-iconbar__item:disabled:hover {
      background: transparent;
      color: var(--studio-native-muted);
    }

    .studio-native-iconbar__item span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Noto Sans SC", system-ui, sans-serif;
      font-weight: 500;
      line-height: 1.48;
      letter-spacing: 0.045em;
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
    }

    .studio-native-iconbar__svg {
      flex: 0 0 auto;
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.85;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition:
        opacity 160ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    .studio-native-iconbar__item:hover .studio-native-iconbar__svg,
    .studio-native-iconbar__item.is-active .studio-native-iconbar__svg,
    .studio-native-iconbar__toggle:hover .studio-native-iconbar__svg {
      transform: none;
    }

    .studio-native-stage {
      display: grid;
      grid-column: 2;
      grid-row: 1;
      grid-template-rows: minmax(0, 1fr);
      height: 100%;
      min-width: 0;
      min-height: 0;
      background: var(--studio-native-map-gutter-bg);
    }

    #studioRoot[data-studio-theme] .studio-native-app {
      grid-template-rows: 48px minmax(0, 1fr);
    }

    #studioRoot[data-studio-theme] .studio-native-stage {
      grid-template-rows: minmax(0, 1fr);
      padding: 0;
      background: var(--studio-native-map-gutter-bg);
    }

    .studio-native-stage .studio-stage__viewport {
      position: relative;
      display: grid;
      place-items: center;
      height: 100%;
      padding: 0;
      overflow: hidden;
      background: var(--studio-native-map-gutter-bg);
      --studio-canvas-frame-scaled-width: 100%;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-native-stage .studio-stage__viewport {
      position: relative;
      padding: 0;
      align-items: center;
      justify-items: center;
      overflow: hidden;
      background: var(--studio-native-map-gutter-bg);
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-native-stage .studio-stage__viewport:has(.studio-canvas-frame[data-orientation='portrait']) {
      align-items: center;
      justify-items: center;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-canvas-frame-scaler {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: auto;
      isolation: auto;
      overflow: hidden;
      transform: translate(-50%, -50%);
      border: 0;
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-stage__viewport:has(.studio-canvas-frame[data-orientation='portrait']) .studio-canvas-frame-scaler {
      transform: translate(-50%, -50%);
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-canvas-frame-scaler::before,
    #studioRoot[data-studio-theme] .studio-native-app .studio-canvas-frame-scaler::after {
      display: none;
      content: none;
    }

    .studio-native-stage .studio-canvas-frame,
    #studioRoot[data-studio-theme] .studio-native-app .studio-canvas-frame {
      border: 0;
      border-radius: 0;
      background: #466eab;
      box-shadow: none;
      overflow: hidden;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-map-host {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    #studioRoot[data-studio-theme] .studio-native-app #map {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      overflow: hidden;
    }

    .studio-generation-busy {
      position: absolute;
      inset: 0;
      z-index: 18;
      display: grid;
      place-items: center;
      pointer-events: all;
      background: rgba(0, 0, 0, 0.28);
    }

    .studio-generation-busy__panel {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      min-width: 218px;
      max-width: min(360px, calc(100% - 48px));
      box-sizing: border-box;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      background: rgba(6, 6, 6, 0.92);
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.42);
      padding: 14px 16px;
      color: #f6f7fb;
    }

    .studio-generation-busy__spinner {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      border: 2px solid rgba(255, 255, 255, 0.18);
      border-top-color: #ffffff;
      border-radius: 999px;
      animation: studio-generation-busy-spin 0.8s linear infinite;
    }

    .studio-generation-busy__copy {
      display: grid;
      gap: 3px;
      min-width: 0;
    }

    .studio-generation-busy__copy strong {
      overflow: hidden;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-generation-busy__copy span {
      color: #aab2c2;
      font-size: 11px;
      line-height: 1.2;
    }

    @keyframes studio-generation-busy-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .studio-generation-busy__spinner {
        animation: none;
      }
    }

    @keyframes studioMenuIn {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .studio-floating-toolbar {
      position: absolute;
      top: 14px;
      left: min(50%, calc(var(--studio-canvas-frame-scaled-width, 100%) / 2));
      z-index: 12;
      display: flex;
      align-items: center;
      justify-content: center;
      width: fit-content;
      max-width: calc(100% - 96px);
      min-height: 48px;
      box-sizing: border-box;
      gap: 10px;
      transform: translateX(-50%);
      border: 1px solid var(--studio-native-border);
      border-radius: 20px;
      background: var(--studio-native-chrome);
      color: var(--studio-native-toolbar-text);
      box-shadow:
        0 18px 42px rgba(0, 0, 0, 0.34),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
      padding: 6px 10px;
      backdrop-filter: blur(18px);
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-stage__viewport:has(.studio-canvas-frame[data-orientation='portrait']) .studio-floating-toolbar {
      left: 50%;
    }

    .studio-floating-toolbar__group {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
    }

    .studio-floating-toolbar__group--view {
      gap: 6px;
      padding-right: 8px;
      border-right: 1px solid var(--studio-native-border);
    }

    .studio-floating-toolbar__group--tools {
      gap: 3px;
      padding: 0 2px;
    }

    .studio-floating-toolbar__select {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 88px;
      height: 34px;
      border: 1px solid var(--studio-native-border);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.68);
      color: var(--studio-native-text-muted);
      cursor: pointer;
      font: inherit;
      font-size: 11.5px;
      font-weight: 650;
      padding: 0 8px;
      white-space: nowrap;
      transition:
        background-color 160ms var(--studio-native-ease),
        border-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    .studio-floating-toolbar__dropdown {
      position: relative;
      display: inline-flex;
      height: 32px;
      color: var(--studio-native-text-muted);
    }

    .studio-floating-toolbar__dropdown-trigger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 78px;
      height: 34px;
      box-sizing: border-box;
      border: 1px solid var(--studio-native-border);
      border-radius: 12px;
      background: var(--studio-native-toolbar-control-bg);
      color: inherit;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 720;
      list-style: none;
      padding: 0 8px;
      user-select: none;
      white-space: nowrap;
      transition:
        background-color 160ms var(--studio-native-ease),
        border-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    .studio-floating-toolbar__dropdown-trigger::-webkit-details-marker {
      display: none;
    }

    .studio-floating-toolbar__dropdown-trigger:hover,
    .studio-floating-toolbar__dropdown[open] .studio-floating-toolbar__dropdown-trigger {
      border-color: var(--studio-native-border-strong);
      background: var(--studio-native-toolbar-control-hover-bg);
      color: var(--studio-native-editor-primary);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
    }

    .studio-floating-toolbar__dropdown-trigger:focus-visible,
    .studio-floating-toolbar__dropdown-option:focus-visible,
    .studio-floating-toolbar__tool:focus-visible,
    .studio-floating-toolbar__icon-command:focus-visible {
      outline: 2px solid var(--studio-native-focus-ring);
      outline-offset: 2px;
    }

    .studio-floating-toolbar__dropdown-trigger span {
      max-width: 72px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-floating-toolbar__dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      z-index: 40;
      display: grid;
      min-width: 150px;
      gap: 2px;
      padding: 6px;
      border: 1px solid var(--studio-native-border);
      border-radius: 14px;
      background: var(--studio-native-toolbar-dropdown-bg);
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.38);
      animation: studioMenuIn 140ms var(--studio-native-ease-emphasis) both;
    }

    .studio-floating-toolbar__dropdown-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      min-height: 30px;
      border: 0;
      border-radius: 10px;
      background: transparent;
      color: var(--studio-native-text-muted);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 620;
      padding: 0 9px;
      text-align: left;
      white-space: nowrap;
      transition:
        background-color 140ms var(--studio-native-ease),
        color 140ms var(--studio-native-ease),
        transform 140ms var(--studio-native-ease);
    }

    .studio-floating-toolbar__dropdown-option:hover,
    .studio-floating-toolbar__dropdown-option.is-selected {
      background: rgba(168, 85, 247, 0.16);
      color: var(--studio-native-editor-primary);
    }

    .studio-floating-toolbar__dropdown-option:hover {
      transform: translateX(2px);
    }

    .studio-floating-toolbar__dropdown-check {
      width: 14px;
      height: 14px;
      color: var(--studio-native-accent);
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-floating-toolbar__select:hover,
    .studio-floating-toolbar__select:focus-within {
      border-color: var(--studio-native-border-strong);
      background: var(--studio-native-toolbar-control-hover-bg);
      color: var(--studio-native-editor-primary);
      transform: translateY(-1px);
    }

    .studio-floating-toolbar__select-icon {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-floating-toolbar__select-caret {
      position: absolute;
      right: 8px;
      width: 10px;
      height: 10px;
      color: #8593a6;
      fill: none;
      pointer-events: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-floating-toolbar__dropdown-trigger .studio-floating-toolbar__select-caret {
      position: static;
      flex: 0 0 auto;
      margin-left: 0;
      pointer-events: none;
    }

    .studio-floating-toolbar__tool,
    .studio-floating-toolbar__icon-command {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border: 1px solid transparent;
      border-radius: 12px;
      background: transparent;
      color: var(--studio-native-text-muted);
      cursor: pointer;
      transition:
        background-color 160ms var(--studio-native-ease),
        border-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        box-shadow 180ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    .studio-floating-toolbar__tool.is-active,
    .studio-floating-toolbar__tool:hover,
    .studio-floating-toolbar__icon-command.is-active,
    .studio-floating-toolbar__icon-command:hover {
      border-color: var(--studio-native-border-strong);
      background: var(--studio-native-toolbar-control-hover-bg);
      color: var(--studio-native-editor-primary);
      transform: translateY(-1px);
      box-shadow: 0 7px 18px rgba(0, 0, 0, 0.24);
    }

    .studio-floating-toolbar__tool.is-active {
      border-color: rgba(168, 85, 247, 0.36);
      background: rgba(168, 85, 247, 0.16);
      color: var(--studio-native-accent-strong);
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.04),
        0 8px 18px rgba(124, 58, 237, 0.18);
    }

    .studio-floating-toolbar__icon-command--generate {
      border-color: rgba(124, 58, 237, 0.42);
      background: linear-gradient(145deg, #8b5cf6, #6d28d9);
      color: #ffffff;
      box-shadow: 0 9px 20px rgba(124, 58, 237, 0.22);
    }

    .studio-floating-toolbar__icon-command--generate:hover {
      background: linear-gradient(145deg, #7c3aed, #5b21b6);
      box-shadow: 0 11px 24px rgba(124, 58, 237, 0.3);
    }

    .studio-floating-toolbar__icon-command--biome {
      border-color: rgba(16, 185, 129, 0.42);
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 9px 20px rgba(16, 185, 129, 0.18);
    }

    .studio-floating-toolbar__icon-command--biome:hover,
    .studio-floating-toolbar__icon-command--biome.is-active {
      background: #059669;
    }

    .studio-floating-toolbar__icon-command.is-disabled,
    .studio-floating-toolbar__icon-command:disabled {
      cursor: not-allowed;
      opacity: 1;
    }

    .studio-floating-toolbar__tool-icon {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.85;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform 180ms var(--studio-native-ease);
    }

    .studio-floating-toolbar__tool:hover .studio-floating-toolbar__tool-icon,
    .studio-floating-toolbar__tool.is-active .studio-floating-toolbar__tool-icon,
    .studio-floating-toolbar__icon-command:hover .studio-floating-toolbar__tool-icon,
    .studio-floating-toolbar__icon-command.is-active .studio-floating-toolbar__tool-icon {
      transform: scale(1.08);
    }

    .studio-floating-toolbar .studio-ghost {
      min-height: 36px;
      border-radius: 4px;
      background: #7fa8bf;
      color: #ffffff;
    }

    .studio-floating-toolbar .studio-ghost:not(.studio-ghost--generate) {
      width: 36px;
      min-width: 36px;
      padding: 0;
    }

    .studio-floating-toolbar .studio-ghost:not(.studio-ghost--generate) {
      font-size: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__group--view {
      border-right: 0;
      padding-right: 4px;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__group--tools {
      margin-left: 4px;
      padding-left: 10px;
      box-shadow: inset 1px 0 0 color-mix(in srgb, var(--studio-native-border-strong) 52%, transparent);
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__select,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__dropdown-trigger,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__tool,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__icon-command {
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__select:hover,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__select:focus-within,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__dropdown-trigger:hover,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__dropdown[open] .studio-floating-toolbar__dropdown-trigger,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__tool:hover,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__tool.is-active,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__icon-command:hover,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__icon-command.is-active {
      border: 0;
      background: transparent;
      box-shadow: none;
      transform: none;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__tool.is-active,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__icon-command--generate,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__icon-command--generate:hover {
      color: var(--studio-native-accent-strong);
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__icon-command--biome,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__icon-command--biome:hover,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__icon-command--biome.is-active {
      color: #10b981;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__tool:hover,
    #studioRoot[data-studio-theme] .studio-native-app .studio-floating-toolbar__icon-command:hover {
      color: var(--studio-native-editor-primary);
    }

    .studio-native-biome-popover {
      position: absolute;
      top: 156px;
      right: 28px;
      z-index: 11;
      width: 264px;
      max-width: calc(100% - 56px);
      pointer-events: auto;
    }

    .studio-native-biome-popover .studio-biome-insights {
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      background: var(--studio-native-layerbar-popover-bg);
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.36);
      padding: 10px;
      backdrop-filter: blur(18px);
    }

    .studio-native-biome-popover .studio-biome-insights__header {
      color: var(--studio-native-text-strong);
      font-size: 10.5px;
      font-weight: 650;
    }

    .studio-biome-insights__close {
      display: inline-grid;
      place-items: center;
      width: 18px;
      height: 18px;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: var(--studio-native-text-muted);
      cursor: pointer;
      font: inherit;
      font-size: 16px;
      line-height: 1;
      padding: 0;
    }

    .studio-biome-insights__close:hover,
    .studio-biome-insights__close:focus-visible {
      background: var(--studio-native-iconbar-hover-bg);
      color: var(--studio-native-editor-primary);
      outline: none;
    }

    .studio-native-biome-popover .studio-biome-insights__body {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        "donut"
        "legend"
        "editors";
      gap: 8px;
    }

    .studio-native-biome-popover .studio-biome-insights__donut {
      grid-area: donut;
      justify-self: center;
      width: 92px;
      height: 92px;
      box-shadow: none;
    }

    .studio-native-biome-popover .studio-biome-insights__donut svg {
      width: 94px;
      height: 94px;
      filter: none;
    }

    .studio-native-biome-popover .studio-biome-insights__hole {
      fill: var(--studio-native-field-bg);
      stroke: transparent;
    }

    .studio-native-biome-popover .studio-biome-insights__legend {
      grid-area: legend;
      gap: 2px;
      max-height: 118px;
      overflow: hidden;
      padding-right: 0;
    }

    .studio-native-biome-popover .studio-biome-insights__row {
      grid-template-columns: 9px minmax(0, 1fr) 36px;
      min-height: 17px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--studio-native-text-muted);
      font-size: 10px;
      font-weight: 600;
      padding: 0 2px;
      transform: none;
    }

    .studio-native-biome-popover .studio-biome-insights__row:hover,
    .studio-native-biome-popover .studio-biome-insights__row:focus-visible,
    .studio-native-biome-popover .studio-biome-insights__row[data-biome-active='true'] {
      background: rgba(168, 85, 247, 0.16);
      color: var(--studio-native-editor-primary);
      transform: none;
    }

    .studio-native-biome-popover .studio-biome-insights__swatch {
      width: 6px;
      height: 6px;
      box-shadow: none;
    }

    .studio-native-biome-popover .studio-biome-insights__row[data-biome-active='true'] .studio-biome-insights__swatch {
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
    }

    .studio-native-biome-popover .studio-biome-insights__row em {
      color: #d8d8df;
      font-size: 9.5px;
      font-weight: 650;
      text-align: right;
    }

    .studio-native-biome-popover .studio-biome-insights__editors {
      grid-area: editors;
      gap: 0;
    }

    .studio-native-biome-popover .studio-biome-insights__control {
      gap: 5px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
    }

    .studio-native-biome-popover .studio-biome-insights__control-head {
      display: none;
    }

    .studio-native-biome-popover .studio-biome-insights__control label {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr);
      align-items: center;
      gap: 6px;
      color: #c7c8d2;
      font-size: 10px;
      font-weight: 600;
    }

    .studio-native-biome-popover .studio-biome-insights__control input[type='range'] {
      min-width: 0;
      height: 14px;
      accent-color: var(--studio-native-accent);
    }

    .studio-native-biome-popover .studio-biome-insights__control p,
    .studio-native-biome-popover .studio-biome-insights__hint {
      display: none;
    }

    .studio-native-layerbar {
      position: relative;
      z-index: 11;
      display: grid;
      grid-column: 1 / -1;
      grid-row: 2;
      grid-template-columns: minmax(0, auto);
      align-items: center;
      justify-content: center;
      min-height: var(--studio-native-layerbar-height);
      border-top: 1px solid var(--studio-native-border);
      background: var(--studio-native-bar-bg);
      color: var(--studio-native-text-muted);
      padding: 6px 24px;
      box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.04);
      backdrop-filter: none;
    }

    .studio-native-layerbar__track {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-width: 0;
    }

    .studio-native-layerbar__item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 34px;
      border: 1px solid transparent;
      border-radius: 999px;
      background: transparent;
      color: var(--studio-native-text-muted);
      cursor: pointer;
      font: inherit;
      font-size: 11.5px;
      font-weight: 680;
      padding: 0 11px;
      transition:
        background 150ms ease,
        color 150ms ease;
    }

    .studio-native-layerbar__item:hover,
    .studio-native-layerbar__item:focus-visible {
      border-color: var(--studio-native-border);
      background: var(--studio-native-iconbar-hover-bg);
      color: var(--studio-native-editor-primary);
      outline: none;
    }

    .studio-native-layerbar__item.is-active {
      border-color: rgba(168, 85, 247, 0.28);
      background: rgba(168, 85, 247, 0.14);
      color: var(--studio-native-accent-strong);
      font-weight: 760;
    }

    .studio-native-layerbar__state {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: #aab6c4;
      box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.15);
    }

    .studio-native-layerbar__item.is-active .studio-native-layerbar__state {
      background: var(--studio-native-accent);
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.14);
    }

    .studio-native-layerbar__icon {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.85;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-native-drawer {
      position: absolute;
      left: 196px;
      top: 104px;
      z-index: 14;
      display: block;
      width: min(1000px, calc(100% - 236px));
      height: min(520px, calc(100% - 144px));
      overflow: hidden;
      border: 1px solid var(--studio-native-border);
      border-radius: 16px;
      background: var(--studio-native-panel-raised);
      box-shadow: 0 18px 52px rgba(0, 0, 0, 0.48);
    }

    .studio-native-drawer--single {
      width: min(1000px, calc(100% - 236px));
      height: min(520px, calc(100% - 144px));
    }

    .studio-native-drawer__list,
    .studio-native-drawer__detail {
      min-width: 0;
      min-height: 0;
      background: var(--studio-native-panel);
    }

    .studio-native-drawer__list {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: 12px;
      overflow: hidden;
      padding: 16px;
    }

    .studio-native-drawer__divider {
      background: var(--studio-native-border);
    }

    .studio-native-drawer__search {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 34px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-muted);
      font-size: 12px;
      padding: 0 12px;
    }

    .studio-native-drawer__search-icon,
    .studio-native-drawer__nav-icon,
    .studio-native-drawer__header-icon,
    .studio-native-drawer__close-icon,
    .studio-map-zoom__icon {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-native-drawer__nav {
      display: grid;
      align-content: start;
      gap: 6px;
      overflow: auto;
      scrollbar-width: thin;
    }

    .studio-native-drawer__nav-item {
      display: grid;
      grid-template-columns: 18px minmax(0, 1fr);
      align-items: center;
      gap: 10px;
      min-height: 44px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--studio-native-text-muted);
      cursor: pointer;
      font: inherit;
      padding: 6px 8px;
      text-align: left;
    }

    .studio-native-drawer__nav-item strong,
    .studio-native-drawer__nav-item em {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-drawer__nav-item strong {
      color: inherit;
      font-size: 12px;
      font-style: normal;
      font-weight: 700;
    }

    .studio-native-drawer__nav-item em {
      color: var(--studio-native-muted);
      font-size: 10px;
      font-style: normal;
    }

    .studio-native-drawer__nav-item.is-active,
    .studio-native-drawer__nav-item:hover {
      background: var(--studio-native-row-hover);
      color: var(--studio-native-text-strong);
    }

    .studio-native-drawer__detail {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
    }

    .studio-native-drawer__header {
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr) 28px;
      align-items: center;
      gap: 12px;
      min-height: 68px;
      border-bottom: 1px solid var(--studio-native-border);
      padding: 12px 16px;
    }

    .studio-native-drawer__header > span {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background: var(--studio-native-accent-muted);
      color: var(--studio-native-accent-strong);
    }

    .studio-native-drawer__header p {
      margin: 0 0 2px;
      color: var(--studio-native-muted);
      font-size: 10px;
    }

    .studio-native-drawer__header h2 {
      overflow: hidden;
      color: var(--studio-native-text-strong);
      font-size: 18px;
      font-weight: 720;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-drawer__close {
      position: absolute;
      top: 18px;
      right: 18px;
      z-index: 2;
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--studio-native-muted);
      cursor: pointer;
    }

    .studio-native-drawer__close:hover {
      background: var(--studio-native-row-hover);
      color: var(--studio-native-text-strong);
    }

    .studio-native-drawer__body {
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      overflow: auto;
      padding: 16px;
      scrollbar-width: thin;
    }

    .studio-native-drawer[data-native-drawer="editors"] .studio-native-drawer__body {
      overflow: hidden;
      padding: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__rows,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__rows,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__detail-wrap,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__detail-wrap,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__scroll {
      scrollbar-gutter: stable;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] * {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__rows::-webkit-scrollbar,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__rows::-webkit-scrollbar,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__detail-wrap::-webkit-scrollbar,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__detail-wrap::-webkit-scrollbar,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__scroll::-webkit-scrollbar,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] *::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__rows::-webkit-scrollbar-button,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__rows::-webkit-scrollbar-button,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__detail-wrap::-webkit-scrollbar-button,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__detail-wrap::-webkit-scrollbar-button,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__scroll::-webkit-scrollbar-button,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] *::-webkit-scrollbar-button {
      display: none;
      width: 0;
      height: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__rows::-webkit-scrollbar-track,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__rows::-webkit-scrollbar-track,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__detail-wrap::-webkit-scrollbar-track,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__detail-wrap::-webkit-scrollbar-track,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__scroll::-webkit-scrollbar-track,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] *::-webkit-scrollbar-track {
      background: transparent;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__rows::-webkit-scrollbar-thumb,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__rows::-webkit-scrollbar-thumb,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__detail-wrap::-webkit-scrollbar-thumb,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__detail-wrap::-webkit-scrollbar-thumb,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__scroll::-webkit-scrollbar-thumb,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] *::-webkit-scrollbar-thumb {
      background: transparent;
    }

    .studio-native-drawer[data-native-drawer="editors"] .studio-native-editor-compat {
      display: none;
    }

    .studio-native-editor-compat {
      display: grid;
      gap: 10px;
      margin-top: 12px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-stage-bg);
    }

    .studio-native-editor-compat > summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      cursor: pointer;
      color: var(--studio-native-text-strong);
      font-size: 12px;
      font-weight: 720;
      list-style: none;
      padding: 12px;
    }

    .studio-native-editor-compat > summary::-webkit-details-marker {
      display: none;
    }

    .studio-native-editor-compat > summary strong {
      color: var(--studio-native-muted);
      font-size: 11px;
      font-weight: 650;
    }

    .studio-native-editor-compat__body {
      display: grid;
      gap: 12px;
      border-top: 1px solid var(--studio-native-border);
      padding: 12px;
    }

    .studio-native-module-drawer {
      display: grid;
      gap: 12px;
      height: 100%;
      min-width: 0;
      min-height: 0;
    }

    .studio-native-drawer[data-native-drawer="editors"] .studio-native-module-drawer {
      gap: 0;
    }

    .studio-native-module-drawer > .studio-panel.studio-direct-editor {
      margin: 0;
      border-color: var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-stage-bg);
      box-shadow: none;
    }

    .studio-map-feature-tabs {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      min-width: 0;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-panel);
      padding: 8px;
    }

    .studio-native-drawer[data-native-drawer="editors"] .studio-map-feature-tabs {
      border: 0;
      border-bottom: 1px solid var(--studio-native-border);
      border-radius: 16px 16px 0 0;
      padding: 10px 12px;
    }

    .studio-native-drawer[data-native-drawer="editors"] .studio-map-feature-tabs + .studio-native-identity {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    .studio-map-feature-tab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      height: 34px;
      border: 1px solid rgba(148, 163, 184, 0.16);
      border-radius: 7px;
      background: rgba(15, 23, 42, 0.34);
      color: var(--studio-native-text-soft);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      gap: 8px;
      padding: 0 10px;
      transition:
        background-color 160ms var(--studio-native-ease),
        border-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease);
    }

    .studio-map-feature-tab:hover,
    .studio-map-feature-tab:focus-visible {
      border-color: rgba(168, 85, 247, 0.36);
      background: rgba(168, 85, 247, 0.14);
      color: var(--studio-native-text);
    }

    .studio-map-feature-tab.is-active {
      border-color: rgba(168, 85, 247, 0.62);
      background: rgba(168, 85, 247, 0.24);
      color: var(--studio-native-iconbar-active-text);
    }

    .studio-map-feature-tab__icon {
      flex: 0 0 auto;
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-map-feature-tab strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-identity {
      display: grid;
      grid-template-columns: minmax(240px, 320px) 1px minmax(0, 1fr);
      grid-template-rows: auto minmax(0, 1fr);
      min-height: 520px;
      overflow: hidden;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-stage-bg);
    }

    .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity {
      height: 100%;
      min-height: 0;
      border: 0;
      border-radius: 16px;
      background: var(--studio-native-panel);
    }

    .studio-native-identity.is-jump-highlight {
      border-color: rgba(168, 85, 247, 0.72);
      background: var(--studio-native-stage-bg);
    }

    .studio-native-identity > .studio-native-identity__toolbar {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(128px, 180px);
      align-items: end;
      gap: 10px;
      border-bottom: 1px solid var(--studio-native-border);
      padding: 12px;
    }

    .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity > .studio-native-identity__toolbar {
      background: var(--studio-native-panel);
      padding: 12px 16px;
    }

    .studio-native-identity__list,
    .studio-native-identity__detail-wrap {
      min-width: 0;
      min-height: 0;
    }

    .studio-native-identity__list {
      display: grid;
      grid-template-rows: auto auto auto minmax(0, 1fr);
      gap: 10px;
      overflow: hidden;
      padding: 12px;
    }

    .studio-native-identity__list--relations {
      grid-template-rows: auto auto auto auto minmax(0, 1fr);
    }

    .studio-native-identity__divider {
      background: var(--studio-native-border);
    }

    .studio-native-identity__list-title {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      min-height: 30px;
    }

    .studio-native-identity__list-title h3 {
      margin: 0;
    }

    .studio-native-identity__list-title h3 {
      overflow: hidden;
      color: var(--studio-native-text-strong);
      font-size: 15px;
      font-weight: 760;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-identity__list-title strong {
      color: var(--studio-native-text-muted);
      font-size: 11px;
      font-weight: 700;
    }

    .studio-native-identity__search-icon {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-native-identity__search {
      display: grid;
      grid-template-columns: 16px minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      min-height: 34px;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-muted);
      padding: 0 10px;
    }

    .studio-native-identity__search input,
    .studio-native-identity__select select,
    .studio-native-identity-field .studio-input {
      min-width: 0;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-text-strong);
      font: inherit;
      font-size: 12px;
    }

    .studio-native-identity__search input {
      height: 32px;
      border: 0;
      background: transparent;
      outline: none;
    }

    .studio-native-identity__filters {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }

    .studio-native-identity__select,
    .studio-native-identity-field {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    .studio-native-identity__select span,
    .studio-native-identity__count span,
    .studio-native-identity-field span {
      overflow: hidden;
      color: var(--studio-native-text-muted);
      font-size: 10px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-identity__select select {
      height: 32px;
      padding: 0 8px;
    }

    .studio-native-identity__count {
      display: none;
      align-content: center;
      gap: 2px;
      min-height: 32px;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      padding: 6px 8px;
    }

    .studio-native-identity__count strong {
      color: var(--studio-native-text-strong);
      font-size: 13px;
      line-height: 1;
    }

    .studio-native-identity__rows {
      display: grid;
      align-content: start;
      gap: 6px;
      overflow: auto;
      scrollbar-width: thin;
    }

    .studio-native-identity .studio-state-row {
      display: grid;
      grid-template-columns: 12px minmax(0, 1fr) auto;
      align-items: center;
      gap: 9px;
      min-height: 44px;
      border: 1px solid transparent;
      border-radius: 6px;
      background: transparent;
      color: var(--studio-native-text-strong);
      cursor: pointer;
      font: inherit;
      padding: 7px 9px;
      text-align: left;
    }

    .studio-native-identity .studio-state-row.is-active,
    .studio-native-identity .studio-state-row:hover {
      border-color: rgba(168, 85, 247, 0.55);
      background: var(--studio-native-accent-muted);
    }

    .studio-native-identity .studio-state-row__swatch {
      width: 10px;
      height: 24px;
      border-radius: 999px;
    }

    .studio-native-identity .studio-state-row__main {
      display: grid;
      min-width: 0;
      gap: 2px;
    }

    .studio-native-identity .studio-state-row__main strong,
    .studio-native-identity .studio-state-row__main small,
    .studio-native-identity .studio-state-row__metric {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-identity .studio-state-row__main strong {
      font-size: 12px;
      font-weight: 740;
    }

    .studio-native-identity .studio-state-row__main small,
    .studio-native-identity .studio-state-row__metric {
      color: var(--studio-native-muted);
      font-size: 10px;
    }

    .studio-native-identity__empty {
      border: 1px dashed var(--studio-native-border);
      border-radius: 6px;
      color: var(--studio-native-muted);
      font-size: 12px;
      padding: 16px;
      text-align: center;
    }

    .studio-native-identity__detail-wrap {
      display: grid;
      min-width: 0;
      overflow: auto;
      padding: 12px;
      scrollbar-width: thin;
    }

    .studio-native-identity-detail {
      display: grid;
      align-content: start;
      gap: 12px;
      min-width: 0;
    }

    .studio-native-identity-detail__hero {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      min-height: 44px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
    }

    .studio-native-identity-detail__color-ring {
      position: relative;
      order: 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: 18px;
      height: 18px;
      border: 0;
      border-radius: 999px;
      background: var(--identity-color, var(--studio-native-accent));
      cursor: pointer;
      box-shadow: none;
    }

    .studio-native-identity-detail__color-ring input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      padding: 0;
    }

    .studio-native-identity-detail__hero > div {
      order: 1;
      min-width: 0;
    }

    .studio-native-identity-detail__title-line {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .studio-native-identity-detail__hero h3 {
      overflow: hidden;
      margin: 0;
      color: var(--studio-native-text-strong);
      font-size: 18px;
      font-weight: 760;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-identity-detail__eyebrow {
      display: none;
    }

    .studio-native-identity-detail__section {
      display: grid;
      gap: 9px;
    }

    .studio-native-identity-detail__section-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--studio-native-text-strong);
      font-size: 12px;
      font-weight: 760;
    }

    .studio-native-identity-detail__section-icon {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }

    .studio-native-identity-detail__form,
    .studio-native-identity-detail__related-grid,
    .studio-native-identity__readonly {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 16px;
    }

    .studio-native-identity-field .studio-input {
      min-height: 34px;
      padding: 0 10px;
      transition:
        border-color 160ms var(--studio-native-ease),
        background-color 160ms var(--studio-native-ease),
        box-shadow 180ms var(--studio-native-ease);
    }

    .studio-native-identity-field .studio-input:focus {
      border-color: rgba(168, 85, 247, 0.68);
      background: var(--studio-native-field-focus-bg);
      box-shadow: 0 0 0 3px var(--studio-native-focus-ring);
      outline: none;
    }

    .studio-native-identity-field__color {
      padding: 4px;
    }

    .studio-native-identity__kv {
      display: grid;
      gap: 3px;
      min-height: 48px;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      padding: 8px 10px;
      transition:
        border-color 160ms var(--studio-native-ease),
        background-color 160ms var(--studio-native-ease);
    }

    .studio-native-identity__kv span {
      overflow: hidden;
      color: var(--studio-native-muted);
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-identity__kv strong {
      overflow: hidden;
      color: var(--studio-native-text-strong);
      font-size: 14px;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-identity-detail__related-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .studio-native-identity-detail__related-actions .studio-ghost {
      min-height: 31px;
      border: 1px solid var(--studio-native-border);
      border-radius: 999px;
      background: var(--studio-native-panel);
      color: var(--studio-native-top-action-text);
      cursor: pointer;
      padding: 0 10px;
      font-size: 11.5px;
      font-weight: 640;
      transition:
        background-color 160ms var(--studio-native-ease),
        border-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        box-shadow 180ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    .studio-native-identity-detail__related-actions .studio-ghost:hover {
      border-color: rgba(168, 85, 247, 0.52);
      background: rgba(168, 85, 247, 0.12);
      color: var(--studio-native-text-strong);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.24);
      transform: translateY(-1px);
    }

    .studio-native-identity-detail__advanced {
      display: grid;
      gap: 10px;
      border-top: 0;
      padding-top: 0;
    }

    .studio-native-identity-detail__advanced-title {
      display: grid;
      grid-template-columns: 15px auto;
      align-items: center;
      gap: 8px;
      min-height: 30px;
      color: var(--studio-native-text-muted);
      cursor: default;
      font-size: 11px;
      font-weight: 680;
      list-style: none;
    }

    .studio-native-identity-detail__advanced-title {
      color: var(--studio-native-text-strong);
    }

    .studio-native-identity-detail__actions {
      position: sticky;
      bottom: 0;
      z-index: 2;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      background: var(--studio-native-panel);
      box-shadow: var(--studio-native-editor-actions-shadow);
      padding: 12px 0 14px;
    }

    .studio-native-identity-detail__actions .studio-primary-action,
    .studio-native-identity-detail__actions .studio-ghost {
      min-height: 44px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-text-strong);
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
      padding: 0 11px;
      transition:
        border-color 160ms var(--studio-native-ease),
        background-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        box-shadow 180ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    .studio-native-identity-detail__actions .studio-primary-action {
      border-color: var(--studio-native-accent);
      background: var(--studio-native-accent);
      box-shadow: 0 10px 22px rgba(168, 85, 247, 0.2);
    }

    .studio-native-identity-detail__actions .studio-primary-action:hover {
      background: var(--studio-native-accent-hover);
      box-shadow: 0 12px 28px rgba(168, 85, 247, 0.3);
      transform: translateY(-1px);
    }

    .studio-native-identity-detail__actions .studio-ghost:hover {
      border-color: var(--studio-native-border-strong);
      background: var(--studio-native-chrome-hover);
      transform: translateY(-1px);
    }

    .studio-native-states {
      display: grid;
      grid-template-columns: minmax(240px, 320px) 1px minmax(0, 1fr);
      min-height: 520px;
      overflow: hidden;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-stage-bg);
    }

    .studio-native-drawer[data-native-drawer="editors"] .studio-native-states {
      height: 100%;
      min-height: 0;
      border: 0;
      border-radius: 16px;
      background: var(--studio-native-panel);
    }

    .studio-native-states.is-jump-highlight {
      border-color: rgba(168, 85, 247, 0.72);
      background: var(--studio-native-stage-bg);
    }

    .studio-native-states__list,
    .studio-native-states__detail-wrap {
      min-width: 0;
      min-height: 0;
    }

    .studio-native-states__list {
      display: grid;
      grid-template-rows: auto auto auto auto minmax(0, 1fr) auto;
      gap: 10px;
      overflow: hidden;
      padding: 12px;
    }

    .studio-native-states__divider {
      background: var(--studio-native-border);
    }

    .studio-native-states__list-title {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      min-height: 30px;
    }

    .studio-native-states__list-title h3 {
      margin: 0;
    }

    .studio-native-states__list-title h3 {
      overflow: hidden;
      color: var(--studio-native-text-strong);
      font-size: 15px;
      font-weight: 760;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-states__list-title strong {
      color: var(--studio-native-text-muted);
      font-size: 11px;
      font-weight: 700;
    }

    .studio-native-states__search-icon,
    .studio-native-states__select-icon,
    .studio-native-states__new-icon,
    .studio-native-state-detail__section-icon {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-native-states__search {
      display: grid;
      grid-template-columns: 16px minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      min-height: 34px;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-muted);
      padding: 0 10px;
    }

    .studio-native-states__search input,
    .studio-native-states__select select,
    .studio-native-state-field .studio-input {
      min-width: 0;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-text-strong);
      font: inherit;
      font-size: 12px;
    }

    .studio-native-states__search input {
      height: 32px;
      border: 0;
      background: transparent;
      outline: none;
    }

    .studio-native-states__filters {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .studio-native-states__select,
    .studio-native-state-field {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    .studio-native-states__select span,
    .studio-native-state-field span {
      overflow: hidden;
      color: var(--studio-native-text-muted);
      font-size: 10px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-states__select select {
      height: 32px;
      padding: 0 8px;
    }

    .studio-native-states__list-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--studio-native-text-muted);
      font-size: 11px;
      font-weight: 700;
    }

    .studio-native-states__rows {
      display: grid;
      align-content: start;
      gap: 6px;
      overflow: auto;
      scrollbar-width: thin;
    }

    .studio-native-states .studio-state-row {
      display: grid;
      grid-template-columns: 12px minmax(0, 1fr) auto;
      align-items: center;
      gap: 9px;
      min-height: 44px;
      border: 1px solid transparent;
      border-radius: 6px;
      background: transparent;
      color: var(--studio-native-text-strong);
      cursor: pointer;
      font: inherit;
      padding: 7px 9px;
      text-align: left;
    }

    .studio-native-states .studio-state-row.is-active,
    .studio-native-states .studio-state-row:hover {
      border-color: rgba(168, 85, 247, 0.55);
      background: var(--studio-native-accent-muted);
    }

    .studio-native-states .studio-state-row__swatch {
      width: 10px;
      height: 24px;
      border-radius: 999px;
    }

    .studio-native-states .studio-state-row__main {
      display: grid;
      min-width: 0;
      gap: 2px;
    }

    .studio-native-states .studio-state-row__main strong,
    .studio-native-states .studio-state-row__main small,
    .studio-native-states .studio-state-row__metric {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-states .studio-state-row__main strong {
      font-size: 12px;
      font-weight: 740;
    }

    .studio-native-states .studio-state-row__main small,
    .studio-native-states .studio-state-row__metric {
      color: var(--studio-native-muted);
      font-size: 10px;
    }

    .studio-native-states__empty {
      border: 1px dashed var(--studio-native-border);
      border-radius: 6px;
      color: var(--studio-native-muted);
      font-size: 12px;
      padding: 16px;
      text-align: center;
    }

    .studio-native-states__new {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-height: 34px;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-text-muted);
      cursor: not-allowed;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      opacity: 0.58;
    }

    .studio-native-states__detail-wrap {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: 12px;
      overflow: auto;
      padding: 12px;
      scrollbar-width: thin;
    }

    .studio-native-states__stats,
    .studio-native-state-detail__stat-row,
    .studio-native-state-detail__readonly {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }

    .studio-native-states__stat,
    .studio-native-state-detail__stat-row div,
    .studio-native-state-detail__kv {
      display: grid;
      gap: 3px;
      min-height: 48px;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      padding: 8px 10px;
    }

    .studio-native-states__stat strong,
    .studio-native-state-detail__stat-row strong,
    .studio-native-state-detail__kv strong {
      overflow: hidden;
      color: var(--studio-native-text-strong);
      font-size: 14px;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-states__stat span,
    .studio-native-state-detail__stat-row span,
    .studio-native-state-detail__kv span {
      overflow: hidden;
      color: var(--studio-native-muted);
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-state-detail {
      display: grid;
      align-content: start;
      gap: 12px;
      min-width: 0;
    }

    .studio-native-state-detail__hero {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr);
      align-items: center;
      gap: 12px;
      min-height: 76px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--state-color) 20%, var(--studio-native-field-bg)),
        var(--studio-native-field-bg) 42%
      );
      padding: 12px;
    }

    .studio-native-state-detail__color-ring {
      width: 34px;
      height: 34px;
      border: 2px solid var(--state-color);
      border-radius: 999px;
      background: var(--studio-native-field-bg);
      box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.04);
    }

    .studio-native-state-detail__hero h3,
    .studio-native-state-detail__hero div,
    .studio-native-state-detail__eyebrow {
      min-width: 0;
    }

    .studio-native-state-detail__hero h3 {
      overflow: hidden;
      color: var(--studio-native-text-strong);
      font-size: 18px;
      font-weight: 780;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-state-detail__eyebrow {
      color: var(--studio-native-text-muted);
      font-size: 10px;
      font-weight: 720;
    }

    .studio-native-state-detail__stat-row {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .studio-native-state-detail__section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--studio-native-text-strong);
      font-size: 12px;
      font-weight: 760;
    }

    .studio-native-state-detail__form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .studio-native-state-field .studio-input {
      min-height: 34px;
      padding: 0 10px;
    }

    .studio-native-state-field textarea.studio-input {
      min-height: 72px;
      resize: vertical;
      padding: 8px 10px;
    }

    .studio-native-state-field__color {
      padding: 4px;
    }

    .studio-state-field--wide {
      grid-column: 1 / -1;
    }

    .studio-native-state-detail__readonly {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }

    .studio-native-state-detail__actions {
      position: sticky;
      bottom: 0;
      z-index: 2;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background: var(--studio-native-panel);
      box-shadow: 0 -18px 24px var(--studio-native-panel);
      padding: 12px 0 14px;
    }

    .studio-native-state-detail__actions .studio-primary-action,
    .studio-native-state-detail__actions .studio-ghost {
      min-height: 32px;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-text-strong);
      cursor: pointer;
      font-size: 11px;
      font-weight: 740;
      padding: 0 11px;
    }

    .studio-native-state-detail__actions .studio-primary-action {
      border-color: var(--studio-native-accent);
      background: var(--studio-native-accent);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] {
      left: 50%;
      top: 50%;
      width: min(1000px, calc(100% - 236px));
      height: min(520px, calc(100% - 188px));
      border: 1px solid var(--studio-native-border-strong);
      border-radius: 16px;
      background: var(--studio-native-panel-raised);
      box-shadow:
        0 22px 70px rgba(0, 0, 0, 0.56),
        inset 0 1px 0 rgba(255, 255, 255, 0.035);
      transform: translate(-50%, -50%);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"]:has(.studio-native-contract[data-native-module-contract="military"]) {
      border-color: var(--studio-native-border-strong);
      background: var(--studio-native-panel-raised);
      cursor: default;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-drawer__close {
      top: 14px;
      right: 14px;
      color: var(--studio-native-muted);
      transition:
        background-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-drawer__close:hover {
      color: var(--studio-native-text-strong);
      transform: rotate(90deg) scale(1.04);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-field .studio-input:focus {
      border-color: rgba(168, 85, 247, 0.68);
      background: var(--studio-native-field-focus-bg);
      box-shadow: 0 0 0 3px var(--studio-native-focus-ring);
      outline: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states {
      grid-template-columns: 320px 1px minmax(0, 1fr);
      border-radius: 16px;
      color: var(--studio-native-text-strong);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__list {
      grid-template-rows: auto auto auto minmax(0, 1fr);
      gap: 12px;
      max-height: none;
      padding: 16px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__list-title {
      display: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__search {
      min-height: 34px;
      border-radius: 8px;
      background: var(--studio-native-field-bg);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__filters {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__select {
      gap: 6px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__select select {
      height: 36px;
      border-radius: 8px;
      padding: 0 12px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__list-section {
      color: var(--studio-native-text-muted);
      font-size: 11px;
      font-weight: 650;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__rows {
      gap: 8px;
      padding-right: 10px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__rows {
      padding-right: 10px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states .studio-state-row {
      min-height: 42px;
      border-color: transparent;
      border-radius: 8px;
      background: transparent;
      padding: 7px 10px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states .studio-state-row.is-active {
      border-color: var(--studio-native-accent);
      background: var(--studio-native-accent-muted);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states .studio-state-row:hover {
      border-color: var(--studio-native-border);
      background: var(--studio-native-row-hover);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states .studio-state-row__swatch {
      width: 12px;
      height: 12px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__new {
      height: 36px;
      border-radius: 8px;
      background: transparent;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__detail-wrap {
      grid-template-rows: minmax(0, 1fr);
      gap: 0;
      padding: 20px 24px 16px;
      overflow: hidden;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__stats {
      display: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 18px;
      min-height: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      padding-right: 12px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail.studio-direct-states__detail {
      height: 100%;
      padding: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__scroll {
      display: grid;
      align-content: start;
      gap: 18px;
      min-height: 0;
      margin-right: -12px;
      overflow: auto;
      padding-right: 12px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__hero {
      min-height: 44px;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
      grid-template-columns: minmax(0, 1fr);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__title-line {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__color-ring {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: 18px;
      height: 18px;
      border: 0;
      border-radius: 999px;
      background: var(--state-color, var(--studio-native-accent));
      cursor: pointer;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__color-ring input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      padding: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__hero h3 {
      min-width: 0;
      margin: 0;
      overflow: hidden;
      color: var(--studio-native-editor-primary);
      font-size: 18px;
      font-weight: 760;
      line-height: 1.2;
      opacity: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__top-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: -6px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__top-actions .studio-ghost {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 31px;
      border: 1px solid var(--studio-native-border);
      border-radius: 999px;
      background: var(--studio-native-panel);
      color: var(--studio-native-top-action-text);
      cursor: pointer;
      padding: 0 10px;
      font-size: 11.5px;
      font-weight: 640;
      transition:
        background-color 160ms var(--studio-native-ease),
        border-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        box-shadow 180ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__top-actions .studio-ghost:hover {
      border-color: rgba(168, 85, 247, 0.52);
      background: rgba(168, 85, 247, 0.12);
      color: var(--studio-native-text-strong);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.24);
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__eyebrow {
      color: var(--studio-native-muted);
      font-size: 10px;
      font-weight: 600;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__stat-row {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 28px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__stat-row div {
      min-height: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__stat-row strong {
      color: var(--studio-native-editor-primary);
      font-family: "Geist Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 14px;
      font-weight: 760;
      opacity: 1;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__section-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--studio-native-muted);
      font-size: 11px;
      font-weight: 650;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__section-label--readonly {
      display: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__section {
      display: grid;
      gap: 8px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-state-readonly-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      padding: 0;
      border: 0;
      background: transparent;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__kv {
      min-height: 54px;
      padding: 8px 12px;
      border-color: var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      transition:
        border-color 160ms var(--studio-native-ease),
        background-color 160ms var(--studio-native-ease);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__form,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__related-grid,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__advanced-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 16px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-field {
      gap: 6px;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-field span {
      color: var(--studio-native-muted);
      font-size: 11px;
      font-weight: 500;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-field .studio-input {
      min-height: 36px;
      border-color: var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-editor-primary);
      -webkit-text-fill-color: var(--studio-native-editor-primary);
      padding: 0 12px;
      transition:
        border-color 160ms var(--studio-native-ease),
        box-shadow 180ms var(--studio-native-ease),
        background-color 160ms var(--studio-native-ease);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-field .studio-input:focus {
      border-color: rgba(168, 85, 247, 0.68);
      background: var(--studio-native-field-focus-bg);
      box-shadow: 0 0 0 3px var(--studio-native-focus-ring);
      color: var(--studio-native-editor-primary);
      outline: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-field .studio-input::placeholder {
      color: var(--studio-native-muted);
      -webkit-text-fill-color: var(--studio-native-muted);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-field textarea.studio-input {
      padding: 10px 12px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__related-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__related-actions .studio-ghost {
      min-height: 30px;
      border: 1px solid var(--studio-native-border);
      border-radius: 999px;
      background: var(--studio-native-panel);
      color: var(--studio-native-top-action-text);
      padding: 0 11px;
      font-size: 11px;
      font-weight: 620;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__related-actions .studio-ghost:hover {
      border-color: rgba(168, 85, 247, 0.52);
      color: var(--studio-native-text-strong);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__advanced {
      display: grid;
      gap: 10px;
      padding-top: 0;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__advanced-grid {
      padding-top: 8px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__readonly,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__section-label + .studio-native-state-detail__readonly {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__actions {
      position: relative;
      z-index: 3;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-right: -12px;
      background: var(--studio-native-panel-raised);
      box-shadow: var(--studio-native-editor-actions-shadow);
      padding: 12px 12px 14px 0;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__actions .studio-state-edit-status {
      display: none;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__actions .studio-primary-action,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__actions .studio-ghost {
      min-height: 36px;
      border-radius: 8px;
      color: var(--studio-native-editor-primary);
      font-size: 12px;
      font-weight: 700;
      transition:
        border-color 160ms var(--studio-native-ease),
        background-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        box-shadow 180ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__actions .studio-primary-action {
      border-color: var(--studio-native-accent);
      background: var(--studio-native-accent);
      color: var(--studio-native-on-accent);
      box-shadow: 0 10px 22px rgba(168, 85, 247, 0.2);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__actions .studio-primary-action:hover {
      background: var(--studio-native-accent-hover);
      box-shadow: 0 12px 28px rgba(168, 85, 247, 0.3);
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__actions .studio-ghost:hover {
      border-color: var(--studio-native-border-strong);
      background: var(--studio-native-chrome-hover);
      color: var(--studio-native-editor-primary);
      transform: translateY(-1px);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states__list-section strong,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-states .studio-state-row__main strong,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__list-title h3,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__count strong,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity .studio-state-row__main strong,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-detail__hero h3,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__kv strong,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__search input,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__select select,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-field .studio-input {
      color: var(--studio-native-editor-primary);
      opacity: 1;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__search input,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__select select,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-field .studio-input {
      -webkit-text-fill-color: var(--studio-native-editor-primary);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity__search input::placeholder,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-field .studio-input::placeholder {
      color: var(--studio-native-muted);
      -webkit-text-fill-color: var(--studio-native-muted);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__top-actions .studio-ghost,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-state-detail__related-actions .studio-ghost,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-detail__related-actions .studio-ghost,
    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-detail__actions .studio-ghost {
      color: var(--studio-native-editor-primary);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-detail__actions .studio-primary-action {
      color: var(--studio-native-on-accent);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-detail__top-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: -6px;
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-detail__top-actions .studio-ghost {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 31px;
      border: 1px solid var(--studio-native-border);
      border-radius: 999px;
      background: var(--studio-native-panel);
      color: var(--studio-native-top-action-text);
      cursor: pointer;
      padding: 0 10px;
      font-size: 11.5px;
      font-weight: 640;
      transition:
        background-color 160ms var(--studio-native-ease),
        border-color 160ms var(--studio-native-ease),
        color 160ms var(--studio-native-ease),
        box-shadow 180ms var(--studio-native-ease),
        transform 180ms var(--studio-native-ease);
    }

    #studioRoot[data-studio-theme] .studio-native-drawer[data-native-drawer="editors"] .studio-native-identity-detail__top-actions .studio-ghost:hover {
      border-color: rgba(168, 85, 247, 0.52);
      background: rgba(168, 85, 247, 0.12);
      color: var(--studio-native-top-action-hover-text);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.24);
      transform: translateY(-1px);
    }

    .studio-native-data {
      display: grid;
      gap: 12px;
      min-width: 0;
    }

    .studio-native-data__hero,
    .studio-native-data__section {
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: #0d0d0d;
    }

    .studio-native-data__hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: 16px;
      padding: 14px;
    }

    .studio-native-data__hero p,
    .studio-native-data__hero h3,
    .studio-native-data__hero span,
    .studio-native-data__section-head h3,
    .studio-native-data__section-head p {
      margin: 0;
    }

    .studio-native-data__hero p {
      color: var(--studio-native-muted);
      font-size: 11px;
      font-weight: 720;
    }

    .studio-native-data__hero h3 {
      margin-top: 2px;
      color: var(--studio-native-editor-primary);
      font-size: 18px;
      font-weight: 780;
    }

    .studio-native-data__hero span,
    .studio-native-data__section-head p {
      display: block;
      margin-top: 7px;
      color: var(--studio-native-text-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .studio-native-data__status {
      border: 1px solid var(--studio-native-border);
      border-radius: 999px;
      color: var(--studio-native-editor-primary);
      font-size: 12px;
      padding: 7px 10px;
      white-space: nowrap;
    }

    .studio-native-data__status.is-ready {
      border-color: rgba(16, 185, 129, 0.42);
      background: rgba(16, 185, 129, 0.12);
      color: #c9ffe5;
    }

    .studio-native-data__metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }

    .studio-native-data__metrics--compact {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }

    .studio-native-data__metric {
      display: grid;
      gap: 3px;
      min-height: 52px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      padding: 9px 10px;
    }

    .studio-native-data__metric span,
    .studio-native-data__metric strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-data__metric span {
      color: var(--studio-native-muted);
      font-size: 10px;
    }

    .studio-native-data__metric strong {
      color: var(--studio-native-editor-primary);
      font-size: 13px;
      line-height: 1.1;
    }

    .studio-native-data__section {
      display: grid;
      gap: 12px;
      padding: 12px;
    }

    .studio-native-data__section-head {
      min-width: 0;
    }

    .studio-native-data__section-head h3 {
      color: var(--studio-native-editor-primary);
      font-size: 14px;
      font-weight: 760;
    }

    .studio-native-data__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .studio-native-data__action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 34px;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-panel);
      color: var(--studio-native-editor-primary);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 730;
      padding: 0 12px;
    }

    .studio-native-data__action--primary {
      border-color: #7fa8bf;
      background: #7fa8bf;
    }

    .studio-native-data__action:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .studio-native-data__action-icon {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-native-contract {
      display: grid;
      gap: 12px;
      min-width: 0;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      cursor: default;
      padding: 12px;
    }

    .studio-native-contract__hero,
    .studio-native-contract__section {
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: #0d0d0d;
    }

    .studio-native-contract__hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: 12px;
      padding: 14px;
    }

    .studio-native-contract__row-icon {
      width: 17px;
      height: 17px;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.9;
    }

    .studio-native-contract__hero p,
    .studio-native-contract__hero h3,
    .studio-native-contract__hero span,
    .studio-native-contract__section-head h4,
    .studio-native-contract__section-head p {
      margin: 0;
    }

    .studio-native-contract__hero p {
      color: var(--studio-native-muted);
      font-size: 11px;
      font-weight: 720;
    }

    .studio-native-contract__hero h3 {
      margin-top: 2px;
      color: var(--studio-native-editor-primary);
      font-size: 18px;
      font-weight: 780;
    }

    .studio-native-contract__hero span,
    .studio-native-contract__section-head p {
      display: block;
      margin-top: 7px;
      color: var(--studio-native-text-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .studio-native-contract__status {
      max-width: 220px;
      border: 1px solid rgba(245, 158, 11, 0.42);
      border-radius: 999px;
      background: rgba(245, 158, 11, 0.1);
      color: #fde68a;
      font-size: 12px;
      line-height: 1.25;
      padding: 7px 10px;
      text-align: center;
    }

    .studio-native-contract__status.is-readable {
      border-color: rgba(59, 130, 246, 0.42);
      background: rgba(59, 130, 246, 0.12);
      color: #bfdbfe;
    }

    .studio-native-contract__metrics {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 8px;
    }

    .studio-native-contract__metric {
      display: grid;
      gap: 3px;
      min-height: 52px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-panel);
      padding: 9px 10px;
    }

    .studio-native-contract__metric span,
    .studio-native-contract__metric strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-contract__metric span {
      color: var(--studio-native-muted);
      font-size: 10px;
    }

    .studio-native-contract__metric strong {
      color: var(--studio-native-editor-primary);
      font-size: 13px;
      line-height: 1.1;
    }

    .studio-native-contract__section {
      display: grid;
      gap: 12px;
      padding: 12px;
    }

    .studio-native-contract__section-head {
      min-width: 0;
    }

    .studio-native-contract__section-head h4 {
      color: var(--studio-native-editor-primary);
      font-size: 14px;
      font-weight: 760;
    }

    .studio-native-contract__rows {
      display: grid;
      gap: 7px;
    }

    .studio-native-contract__row {
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr) auto;
      align-items: center;
      gap: 9px;
      min-height: 44px;
      border: 1px solid var(--studio-native-border);
      border-radius: 6px;
      background: var(--studio-native-field-bg);
      padding: 7px 9px;
    }

    .studio-native-contract__row > span {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      background: var(--studio-native-icon-bg);
      color: var(--studio-native-top-action-text);
    }

    .studio-native-contract__row div {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    .studio-native-contract__row strong,
    .studio-native-contract__row small,
    .studio-native-contract__row em {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-contract__row strong {
      color: var(--studio-native-editor-primary);
      font-size: 12px;
      font-style: normal;
      font-weight: 740;
    }

    .studio-native-contract__row small,
    .studio-native-contract__row em {
      color: var(--studio-native-muted);
      font-size: 10px;
      font-style: normal;
    }

    .studio-native-contract__requirements {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .studio-native-contract__requirements span {
      max-width: 100%;
      border: 1px solid var(--studio-native-border-strong);
      border-radius: 999px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-top-action-text);
      font-size: 11px;
      line-height: 1.25;
      padding: 7px 10px;
    }

    .studio-native-contract__empty {
      border: 1px dashed #242424;
      border-radius: 6px;
      color: var(--studio-native-text-muted);
      font-size: 12px;
      line-height: 1.45;
      padding: 14px;
    }

    .studio-native-contract[data-native-module-contract="military"] .studio-native-contract__hero,
    .studio-native-contract[data-native-module-contract="military"] .studio-native-contract__section,
    .studio-native-contract[data-native-module-contract="military"] .studio-native-contract__metric,
    .studio-native-contract[data-native-module-contract="military"] .studio-native-contract__row,
    .studio-native-contract[data-native-module-contract="military"] .studio-native-contract__requirements span {
      transition: none;
    }

    .studio-native-contract[data-native-module-contract="military"],
    .studio-native-contract[data-native-module-contract="military"]:hover,
    .studio-native-contract[data-native-module-contract="military"]:focus,
    .studio-native-contract[data-native-module-contract="military"]:focus-within {
      border-color: #1a1a1a;
      background: var(--studio-native-field-bg);
      box-shadow: none;
      cursor: default;
      outline: none;
    }

    .studio-native-contract[data-native-module-contract="military"] .studio-native-contract__metric:hover {
      border-color: #1a1a1a;
      background: var(--studio-native-panel);
      box-shadow: none;
      transform: none;
    }

    .studio-native-contract[data-native-module-contract="military"] .studio-native-contract__row:hover {
      border-color: #171717;
      background: var(--studio-native-field-bg);
      box-shadow: none;
      transform: none;
    }

    .studio-native-contract[data-native-module-contract="military"] .studio-native-contract__requirements span:hover {
      border-color: #242424;
      background: var(--studio-native-field-bg);
      box-shadow: none;
      transform: none;
    }

    .studio-native-workflow {
      display: grid;
      gap: 12px;
      margin-bottom: 14px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: #0d0d0d;
      padding: 14px;
    }

    .studio-native-workflow__hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: 16px;
    }

    .studio-native-workflow__hero p,
    .studio-native-workflow__hero h3,
    .studio-native-workflow__hero span {
      margin: 0;
    }

    .studio-native-workflow__hero p {
      color: var(--studio-native-muted);
      font-size: 11px;
      font-weight: 700;
    }

    .studio-native-workflow__hero h3 {
      margin-top: 2px;
      color: var(--studio-native-editor-primary);
      font-size: 18px;
      line-height: 1.15;
      font-weight: 760;
      letter-spacing: 0;
    }

    .studio-native-workflow__hero span {
      display: block;
      margin-top: 8px;
      color: var(--studio-native-text-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .studio-native-workflow__pill {
      border: 1px solid var(--studio-native-border);
      border-radius: 999px;
      color: var(--studio-native-editor-primary);
      font-size: 11px;
      line-height: 1;
      padding: 8px 10px;
      white-space: nowrap;
    }

    .studio-native-workflow__pill.is-blocked {
      border-color: #7fa8bf;
      background: #1a1124;
      color: var(--studio-native-editor-primary);
    }

    .studio-native-workflow__pill.is-ready {
      border-color: rgba(16, 185, 129, 0.46);
      background: rgba(16, 185, 129, 0.12);
      color: #c9ffe5;
    }

    .studio-native-workflow__stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .studio-native-workflow__stat {
      display: grid;
      gap: 3px;
      min-height: 54px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: #111418;
      padding: 10px 12px;
    }

    .studio-native-workflow__stat span {
      overflow: hidden;
      color: var(--studio-native-text-muted);
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-workflow__stat strong {
      overflow: hidden;
      color: var(--studio-native-editor-primary);
      font-family: var(--agm-font-ui);
      font-size: 18px;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-workflow__decision {
      display: grid;
      gap: 8px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-panel);
      padding: 10px;
    }

    .studio-native-workflow__decision strong {
      color: var(--studio-native-editor-primary);
      font-size: 12px;
      font-weight: 760;
      line-height: 1.2;
    }

    .studio-native-workflow__decision span {
      color: var(--studio-native-text-muted);
      font-size: 11px;
      line-height: 1.4;
    }

    .studio-native-workflow__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .studio-native-workflow__button {
      min-height: 34px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-panel);
      color: var(--studio-native-editor-primary);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      padding: 0 14px;
    }

    .studio-native-workflow__button--primary {
      border-color: #7fa8bf;
      background: #7fa8bf;
    }

    .studio-native-workflow__button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .studio-native-drawer__body .studio-repair-center > .studio-direct-editor__header,
    .studio-native-drawer__body .studio-repair-center > .studio-panel__text,
    .studio-native-drawer__body > .studio-slim-panel {
      display: none;
    }

    .studio-native-drawer__body .studio-panel,
    .studio-native-drawer__body .studio-advanced-section {
      border-radius: 8px;
      background: #0d0d0d;
      border-color: #1a1a1a;
      box-shadow: none;
    }

    .studio-native-repair {
      display: grid;
      gap: 12px;
    }

    .studio-native-repair__hero,
    .studio-native-repair__health,
    .studio-native-repair__queue,
    .studio-native-repair__issue-group,
    .studio-native-repair__context {
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: #0d0d0d;
      box-shadow: none;
    }

    .studio-native-repair__hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: 14px;
      padding: 14px;
    }

    .studio-native-repair__hero-copy,
    .studio-native-repair__health-copy {
      min-width: 0;
    }

    .studio-native-repair__hero-copy p,
    .studio-native-repair__hero-copy h3,
    .studio-native-repair__hero-copy span,
    .studio-native-repair__health-copy p,
    .studio-native-repair__health-copy span,
    .studio-native-repair__section-head span {
      margin: 0;
    }

    .studio-native-repair__hero-copy p,
    .studio-native-repair__health-copy p {
      color: var(--studio-native-muted);
      font-size: 11px;
      font-weight: 720;
    }

    .studio-native-repair__hero-copy h3 {
      margin: 2px 0 0;
      color: var(--studio-native-editor-primary);
      font-size: 18px;
      font-weight: 780;
    }

    .studio-native-repair__hero-copy span,
    .studio-native-repair__health-copy span {
      display: block;
      margin-top: 7px;
      color: var(--studio-native-text-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .studio-native-repair__gate {
      border: 1px solid var(--studio-native-border);
      border-radius: 999px;
      color: var(--studio-native-editor-primary);
      font-size: 12px;
      padding: 7px 10px;
      white-space: nowrap;
    }

    .studio-native-repair__gate.is-blocked,
    .studio-native-repair__health.is-blocked {
      border-color: rgba(168, 85, 247, 0.48);
    }

    .studio-native-repair__gate.is-blocked {
      background: #1a1124;
    }

    .studio-native-repair__gate.is-ready,
    .studio-native-repair__health.is-ready {
      border-color: rgba(16, 185, 129, 0.42);
    }

    .studio-native-repair__gate.is-ready {
      background: rgba(16, 185, 129, 0.12);
      color: #c9ffe5;
    }

    .studio-native-repair__health {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(240px, auto);
      align-items: center;
      gap: 12px;
      padding: 12px;
    }

    .studio-native-repair__stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(70px, 1fr));
      gap: 6px;
    }

    .studio-native-repair__stat {
      display: grid;
      gap: 3px;
      min-height: 44px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      padding: 8px;
    }

    .studio-native-repair__stat span {
      overflow: hidden;
      color: var(--studio-native-text-muted);
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-repair__stat strong {
      overflow: hidden;
      color: var(--studio-native-editor-primary);
      font-family: var(--agm-font-ui);
      font-size: 13px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-repair__issues {
      display: grid;
      gap: 10px;
    }

    .studio-native-repair__section-head,
    .studio-native-repair__queue-head,
    .studio-native-repair__issue-group-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .studio-native-repair__section-head {
      color: var(--studio-native-editor-primary);
      font-size: 13px;
      font-weight: 740;
      padding: 2px 0;
    }

    .studio-native-repair__section-head strong {
      border: 1px solid var(--studio-native-border);
      border-radius: 999px;
      background: #0d0d0d;
      color: var(--studio-native-editor-primary);
      font-size: 11px;
      padding: 4px 8px;
    }

    .studio-native-repair__queue,
    .studio-native-repair__issue-group,
    .studio-native-repair__context {
      display: grid;
      gap: 10px;
      padding: 12px;
    }

    .studio-native-repair__queue-head span,
    .studio-native-repair__issue-group-main span {
      color: var(--studio-native-editor-primary);
      font-size: 13px;
      font-weight: 740;
    }

    .studio-native-repair .studio-direct-workbench-directory__queue-review,
    .studio-native-repair .studio-direct-workbench-directory__queue-action-scope,
    .studio-native-repair .studio-direct-workbench-directory__queue-summary,
    .studio-native-repair .studio-direct-workbench-directory__queue-result,
    .studio-native-repair .studio-direct-workbench-directory__batch-guard,
    .studio-native-repair .studio-direct-workbench-directory__group-preview,
    .studio-native-repair .studio-direct-workbench-directory__issue-preview,
    .studio-native-repair .studio-direct-workbench-directory__issue-navigation,
    .studio-native-repair .studio-direct-workbench-directory__issue-candidates {
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      color: var(--studio-native-text-muted);
    }

    .studio-native-repair .studio-direct-workbench-directory__queue-review,
    .studio-native-repair .studio-direct-workbench-directory__queue-action-scope,
    .studio-native-repair .studio-direct-workbench-directory__queue-summary,
    .studio-native-repair .studio-direct-workbench-directory__queue-result {
      padding: 8px;
      font-size: 12px;
      line-height: 1.4;
    }

    .studio-native-repair .studio-direct-workbench-directory__queue-details {
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      padding: 8px;
    }

    .studio-native-repair .studio-direct-workbench-directory__queue-list {
      display: grid;
      gap: 8px;
    }

    .studio-native-repair .studio-direct-workbench-directory__queue-item {
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: #0d0d0d;
      padding: 8px;
    }

    .studio-native-repair .studio-direct-workbench-directory__queue-history {
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      padding: 8px;
    }

    .studio-native-repair .studio-direct-workbench-directory__queue-history summary {
      cursor: pointer;
      color: var(--studio-native-editor-primary);
      font-size: 12px;
      font-weight: 700;
    }

    .studio-native-repair .studio-primary-action,
    .studio-native-repair .studio-ghost {
      min-height: 30px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-icon-bg);
      color: var(--studio-native-editor-primary);
      font-size: 11px;
      font-weight: 700;
      padding: 0 10px;
    }

    .studio-native-repair .studio-primary-action {
      border-color: #7fa8bf;
      background: #7fa8bf;
    }

    .studio-native-repair .studio-primary-action:disabled,
    .studio-native-repair .studio-ghost:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .studio-native-repair__issue-group-main,
    .studio-native-repair__issue-main {
      width: 100%;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;
    }

    .studio-native-repair__issue {
      display: grid;
      gap: 8px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-field-bg);
      padding: 10px;
    }

    .studio-native-repair__issue-main {
      display: grid;
      gap: 4px;
      padding: 0;
    }

    .studio-native-repair .studio-direct-workbench-directory__issue-title {
      color: var(--studio-native-editor-primary);
      font-size: 13px;
      font-weight: 740;
    }

    .studio-native-repair .studio-direct-workbench-directory__issue-meta,
    .studio-native-repair .studio-direct-workbench-directory__issue-detail {
      color: var(--studio-native-text-muted);
      font-size: 11px;
      line-height: 1.4;
    }

    .studio-native-repair .studio-direct-workbench-directory__issue-context,
    .studio-native-repair .studio-direct-workbench-directory__issue-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .studio-native-repair__batch-guard {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, auto)) minmax(0, 1fr);
      gap: 8px;
      padding: 8px;
      font-size: 11px;
    }

    .studio-native-repair__batch-guard code,
    .studio-native-repair .studio-direct-workbench-directory__group-preview code,
    .studio-native-repair .studio-direct-workbench-directory__issue-preview code {
      overflow: hidden;
      color: var(--studio-native-editor-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-repair__context {
      color: var(--studio-native-text-muted);
    }

    .studio-native-export {
      display: grid;
      gap: 12px;
    }

    .studio-native-export__hero,
    .studio-native-export__gate,
    .studio-native-export__card {
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: #0d0d0d;
    }

    .studio-native-export__hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 14px;
      padding: 14px;
    }

    .studio-native-export__hero-copy {
      min-width: 0;
    }

    .studio-native-export__hero-copy p,
    .studio-native-export__hero-copy h3,
    .studio-native-export__hero-copy span,
    .studio-native-export__gate-copy p,
    .studio-native-export__gate-copy span,
    .studio-native-export__card header h3,
    .studio-native-export__card header p {
      margin: 0;
    }

    .studio-native-export__hero-copy p,
    .studio-native-export__gate-copy p {
      color: var(--studio-native-muted);
      font-size: 11px;
      font-weight: 720;
    }

    .studio-native-export__hero-copy h3 {
      margin-top: 2px;
      color: var(--studio-native-editor-primary);
      font-size: 18px;
      line-height: 1.15;
      font-weight: 760;
      letter-spacing: 0;
    }

    .studio-native-export__hero-copy span,
    .studio-native-export__gate-copy span,
    .studio-native-export__card header p {
      display: block;
      margin-top: 7px;
      color: var(--studio-native-text-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .studio-native-export__format-switch {
      min-width: 156px;
      height: 34px;
      border-radius: 8px;
      background: var(--studio-native-panel);
    }

    .studio-native-export__button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 34px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-panel);
      color: var(--studio-native-editor-primary);
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 720;
      padding: 0 13px;
      text-align: center;
      text-decoration: none;
      white-space: nowrap;
    }

    .studio-native-export__button--primary {
      border-color: #7fa8bf;
      background: #7fa8bf;
    }

    .studio-native-export__button:hover {
      border-color: rgba(168, 85, 247, 0.5);
      background: #161616;
    }

    .studio-native-export__button--primary:hover {
      background: #6f98ae;
    }

    .studio-native-export__gate {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(240px, auto) minmax(220px, auto);
      align-items: center;
      gap: 12px;
      padding: 12px;
    }

    .studio-native-export__gate.is-blocked {
      border-color: rgba(168, 85, 247, 0.46);
      background: linear-gradient(90deg, rgba(168, 85, 247, 0.12), #0d0d0d 46%);
    }

    .studio-native-export__gate.is-ready {
      border-color: rgba(16, 185, 129, 0.4);
      background: linear-gradient(90deg, rgba(16, 185, 129, 0.1), #0d0d0d 46%);
    }

    .studio-native-export__gate-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(70px, 1fr));
      gap: 6px;
    }

    .studio-native-export__gate-stats div {
      display: grid;
      gap: 3px;
      min-height: 44px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: #111418;
      padding: 8px 10px;
    }

    .studio-native-export__gate-stats span {
      overflow: hidden;
      color: var(--studio-native-text-muted);
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-export__gate-stats strong {
      overflow: hidden;
      color: var(--studio-native-editor-primary);
      font-size: 13px;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-native-export__decision {
      display: grid;
      gap: 7px;
      min-width: 0;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: var(--studio-native-panel);
      padding: 9px;
    }

    .studio-native-export__decision strong {
      color: var(--studio-native-editor-primary);
      font-size: 12px;
      font-weight: 760;
      line-height: 1.2;
    }

    .studio-native-export__decision span {
      color: var(--studio-native-text-muted);
      font-size: 11px;
      line-height: 1.35;
    }

    .studio-native-export__decision-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .studio-native-export__decision-actions .studio-native-export__button {
      min-height: 30px;
      padding: 0 10px;
    }

    .studio-native-export__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .studio-native-export__card {
      display: grid;
      align-content: start;
      gap: 12px;
      min-width: 0;
      padding: 14px;
    }

    .studio-native-export__card--settings {
      grid-column: 1 / -1;
    }

    .studio-native-export__card header h3 {
      color: var(--studio-native-editor-primary);
      font-size: 14px;
      font-weight: 760;
      letter-spacing: 0;
    }

    .studio-native-export__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-width: 0;
    }

    .studio-native-export__field {
      display: grid;
      flex: 1 1 150px;
      min-width: 140px;
      gap: 5px;
    }

    .studio-native-export__field span,
    .studio-native-export__kv span {
      color: var(--studio-native-text-muted);
      font-size: 11px;
      font-weight: 650;
    }

    .studio-native-export__field .studio-input {
      height: 34px;
      border-radius: 8px;
      border-color: #1a1a1a;
      background: var(--studio-native-panel);
    }

    .studio-native-export__kv {
      display: grid;
      flex: 1 1 150px;
      min-height: 34px;
      align-content: center;
      gap: 3px;
      border: 1px solid var(--studio-native-border);
      border-radius: 8px;
      background: #111418;
      padding: 7px 10px;
    }

    .studio-native-export__kv strong {
      color: var(--studio-native-editor-primary);
      font-family: var(--agm-font-ui);
      font-size: 13px;
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-map-zoom {
      right: 12px;
      bottom: 12px;
      z-index: 13;
      border-radius: 12px;
      border-color: var(--studio-native-border);
      background: var(--studio-native-map-zoom-bg);
      color: var(--studio-native-map-zoom-text);
      box-shadow: var(--studio-native-map-zoom-shadow);
      backdrop-filter: blur(14px);
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-map-zoom button {
      color: var(--studio-native-map-zoom-text);
      transition:
        background-color 150ms var(--studio-native-ease),
        color 150ms var(--studio-native-ease);
    }

    #studioRoot[data-studio-theme] .studio-native-app .studio-map-zoom button:hover {
      background: var(--studio-native-map-zoom-hover-bg);
      color: var(--studio-native-accent-strong);
    }

    .studio-native-app .studio-statusbar {
      display: none;
      min-height: 28px;
      border-top: 1px solid var(--studio-native-border);
      background: rgba(10, 10, 10, 0.94);
      color: var(--studio-native-text-muted);
      font-size: 11px;
      padding: 0 12px;
    }

    .studio-native-app .studio-statusbar__preferences {
      display: none;
    }

    @media (max-width: 1100px) {
      .studio-native-app:not(.is-nav-collapsed) .studio-native-workbench {
        grid-template-columns: 48px minmax(0, 1fr);
      }

      .studio-native-app:not(.is-nav-collapsed) .studio-native-iconbar__item span,
      .studio-native-app:not(.is-nav-collapsed) .studio-native-iconbar__toggle span {
        display: none;
      }

      .studio-native-drawer {
        left: 64px;
        width: calc(100% - 80px);
      }

      .studio-floating-toolbar {
        width: calc(100% - 32px);
        gap: 10px;
        padding: 0 12px;
      }

      .studio-floating-toolbar__group--view {
        display: none;
      }
    }

    @media (max-width: 820px) {
      .studio-project-home__templates {
        grid-template-columns: 1fr;
      }

      .studio-native-topbar .studio-topbar__command-group {
        display: none;
      }

      .studio-native-drawer {
        grid-template-columns: 1fr;
        left: 56px;
        top: 72px;
        width: calc(100% - 64px);
        height: calc(100% - 128px);
      }

      .studio-native-states {
        grid-template-columns: 1fr;
      }

      .studio-native-identity {
        grid-template-columns: 1fr;
      }

      .studio-native-drawer__list,
      .studio-native-drawer__divider,
      .studio-native-identity__divider,
      .studio-native-states__divider {
        display: none;
      }

      .studio-native-identity__list {
        max-height: 260px;
      }

      .studio-native-states__list {
        max-height: 260px;
      }

      .studio-native-identity-detail__form,
      .studio-native-identity__readonly {
        grid-template-columns: 1fr;
      }

      .studio-native-states__stats,
      .studio-native-state-detail__readonly {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .studio-native-contract__hero,
      .studio-native-contract__metrics {
        grid-template-columns: 1fr;
      }

      .studio-native-contract__status {
        max-width: none;
      }

      .studio-native-export__hero,
      .studio-native-export__gate,
      .studio-native-export__grid {
        grid-template-columns: 1fr;
      }

      .studio-native-export__format-switch,
      .studio-native-export__button {
        width: 100%;
      }

      .studio-native-state-detail__form,
      .studio-native-state-detail__stat-row {
        grid-template-columns: 1fr;
      }
    }

`;

export const foundationEnvironmentStyles = `    body.studio-enabled {
      background: #111820;
      overflow: hidden;
    }

    html[data-studio-theme="daylight"] body.studio-enabled {
      background: #eef2f5;
    }

    html[data-studio-theme="night"] body.studio-enabled {
      background: #0f151c;
    }

    body.studio-enabled #optionsContainer,
    body.studio-enabled #optionsTrigger,
    body.studio-enabled #loading,
    body.studio-enabled #mapOverlay {
      display: none !important;
    }

    body.studio-enabled #map {
      position: relative;
      display: block;
      background: transparent;
    }

    #studioRoot {
      --agm-black: #111820;
      --agm-white: #ffffff;
      --agm-surface-dark: #17202a;
      --agm-surface-dark-2: #1d2833;
      --agm-surface-panel: #1d2833;
      --agm-core-accent: #7fa8bf;
      --agm-generation-mid: #a9bbc6;
      --agm-matrix-violet: #7fa8bf;
      --agm-text-secondary-dark: #92a4af;
      --agm-gradient-generation: linear-gradient(90deg, var(--agm-core-accent) 0%, var(--agm-generation-mid) 54%, #d2dde2 100%);
      --agm-font-latin: "Satoshi", "Geist Sans", "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
      --agm-font-zh: "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", system-ui, sans-serif;
      --agm-font-ui: "Satoshi", "Geist Sans", "SF Pro Display", "Segoe UI Variable", "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", "Segoe UI", system-ui, sans-serif;
      --studio-bg: var(--agm-surface-dark);
      --studio-panel: rgba(29, 40, 51, 0.92);
      --studio-panel-strong: rgba(35, 48, 60, 0.96);
      --studio-border: var(--studio-accent-18);
      --studio-border-strong: var(--studio-accent-58);
      --studio-text: #e9eef1;
      --studio-muted: var(--agm-text-secondary-dark);
      --studio-dim: #63717b;
      --studio-accent: var(--agm-core-accent);
      --studio-cyan: var(--agm-generation-mid);
      --studio-green: var(--studio-accent);
      --studio-warning: var(--studio-cyan);
      --studio-accent-08: color-mix(in srgb, var(--studio-accent) 8%, transparent);
      --studio-accent-10: color-mix(in srgb, var(--studio-accent) 10%, transparent);
      --studio-accent-12: color-mix(in srgb, var(--studio-accent) 12%, transparent);
      --studio-accent-14: color-mix(in srgb, var(--studio-accent) 14%, transparent);
      --studio-accent-16: color-mix(in srgb, var(--studio-accent) 16%, transparent);
      --studio-accent-18: color-mix(in srgb, var(--studio-accent) 18%, transparent);
      --studio-accent-22: color-mix(in srgb, var(--studio-accent) 22%, transparent);
      --studio-accent-28: color-mix(in srgb, var(--studio-accent) 28%, transparent);
      --studio-accent-34: color-mix(in srgb, var(--studio-accent) 34%, transparent);
      --studio-accent-48: color-mix(in srgb, var(--studio-accent) 48%, transparent);
      --studio-accent-58: color-mix(in srgb, var(--studio-accent) 58%, transparent);
      --studio-accent-72: color-mix(in srgb, var(--studio-accent) 72%, transparent);
      --studio-accent-78: color-mix(in srgb, var(--studio-accent) 78%, transparent);
      --studio-accent-86: color-mix(in srgb, var(--studio-accent) 86%, transparent);
      --studio-accent-text: color-mix(in srgb, var(--studio-accent) 72%, #e9eef1);
      --studio-accent-panel: linear-gradient(180deg, color-mix(in srgb, var(--studio-accent) 10%, rgba(29, 40, 51, 0.92)), rgba(23, 32, 42, 0.96));
      position: fixed;
      inset: 0;
      z-index: 20;
      pointer-events: none;
      font-family: var(--agm-font-ui);
      color: var(--studio-text);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    #studioRoot [hidden] {
      display: none !important;
    }

    #studioRoot[data-studio-theme="daylight"] {
      --agm-surface-dark: #eef2f5;
      --agm-surface-dark-2: #ffffff;
      --studio-panel: rgba(255, 255, 255, 0.96);
      --studio-panel-strong: #ffffff;
      --studio-border: rgba(21, 36, 48, 0.1);
      --studio-border-strong: rgba(21, 36, 48, 0.2);
      --studio-text: #152430;
      --studio-muted: #62717c;
      --studio-dim: #9aa6ae;
      --studio-accent: #5d879d;
      --studio-cyan: #5d879d;
      --studio-green: #152430;
      --studio-warning: #52616c;
      --studio-accent-text: #152430;
      --studio-accent-panel: #f1f4f6;
      --agm-text-secondary-dark: #62717c;
      --agm-gradient-generation: linear-gradient(90deg, #152430 0%, #52616c 100%);
    }

    #studioRoot[data-studio-theme="night"] {
      --agm-surface-dark: #111820;
      --agm-surface-dark-2: #17202a;
      --studio-panel: rgba(29, 40, 51, 0.92);
      --studio-panel-strong: rgba(35, 48, 60, 0.96);
      --studio-border: var(--studio-accent-18);
      --studio-border-strong: var(--studio-accent-58);
      --studio-text: #e9eef1;
      --studio-muted: #92a4af;
      --studio-dim: #63717b;
      --studio-accent: #7fa8bf;
      --studio-cyan: #a9bbc6;
      --studio-green: var(--studio-accent);
      --studio-warning: var(--studio-cyan);
      --studio-accent-text: color-mix(in srgb, var(--studio-accent) 72%, #e9eef1);
      --studio-accent-panel: linear-gradient(180deg, color-mix(in srgb, var(--studio-accent) 10%, rgba(29, 40, 51, 0.92)), rgba(23, 32, 42, 0.96));
    }

    #studioRoot * {
      box-sizing: border-box;
      pointer-events: auto;
    }

`;

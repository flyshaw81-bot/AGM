export const foundationEnvironmentStyles = `    body.studio-enabled {
      background: #12110f;
      overflow: hidden;
    }

    html[data-studio-theme="daylight"] body.studio-enabled {
      background: #f1eee7;
    }

    html[data-studio-theme="night"] body.studio-enabled {
      background: #0d0d0c;
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
      --agm-black: #12110f;
      --agm-white: #ffffff;
      --agm-surface-dark: #1f1f1f;
      --agm-surface-dark-2: #242424;
      --agm-surface-panel: #242424;
      --agm-core-accent: #a78bfa;
      --agm-generation-mid: #d4d4d8;
      --agm-matrix-violet: #a78bfa;
      --agm-text-secondary-dark: #a1a1aa;
      --agm-gradient-generation: linear-gradient(90deg, var(--agm-core-accent) 0%, var(--agm-generation-mid) 54%, var(--agm-matrix-violet) 100%);
      --agm-font-latin: "Inter Display", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --agm-font-zh: "Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
      --studio-bg: var(--agm-surface-dark);
      --studio-panel: rgba(36, 36, 36, 0.92);
      --studio-panel-strong: rgba(42, 42, 42, 0.96);
      --studio-border: var(--studio-accent-18);
      --studio-border-strong: var(--studio-accent-58);
      --studio-text: #f4f4f5;
      --studio-muted: var(--agm-text-secondary-dark);
      --studio-dim: #71717a;
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
      --studio-accent-text: color-mix(in srgb, var(--studio-accent) 72%, #fff8ec);
      --studio-accent-panel: linear-gradient(180deg, color-mix(in srgb, var(--studio-accent) 10%, rgba(36, 36, 36, 0.92)), rgba(31, 31, 31, 0.96));
      position: fixed;
      inset: 0;
      z-index: 20;
      pointer-events: none;
      font-family: var(--agm-font-latin);
      color: var(--studio-text);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    #studioRoot [hidden] {
      display: none !important;
    }

    #studioRoot[data-studio-theme="daylight"] {
      --agm-surface-dark: #eef0f3;
      --agm-surface-dark-2: #ffffff;
      --studio-panel: rgba(255, 255, 255, 0.96);
      --studio-panel-strong: #ffffff;
      --studio-border: rgba(17, 24, 39, 0.1);
      --studio-border-strong: rgba(17, 24, 39, 0.2);
      --studio-text: #111827;
      --studio-muted: #6b7280;
      --studio-dim: #9ca3af;
      --studio-accent: #6d5dfc;
      --studio-cyan: #6d5dfc;
      --studio-green: #111827;
      --studio-warning: #4b5563;
      --studio-accent-text: #111827;
      --studio-accent-panel: #f3f4f6;
      --agm-text-secondary-dark: #6b7280;
      --agm-gradient-generation: linear-gradient(90deg, #111827 0%, #374151 100%);
    }

    #studioRoot[data-studio-theme="night"] {
      --agm-surface-dark: #0f1014;
      --agm-surface-dark-2: #15161b;
      --studio-panel: rgba(20, 21, 26, 0.96);
      --studio-panel-strong: #18191f;
      --studio-border: rgba(255, 255, 255, 0.08);
      --studio-border-strong: rgba(255, 255, 255, 0.18);
      --studio-text: #f4f4f5;
      --studio-muted: #a1a1aa;
      --studio-dim: #71717a;
      --studio-accent: #e5e7eb;
      --studio-cyan: #a5b4fc;
      --studio-green: #e5e7eb;
      --studio-warning: #d4d4d8;
      --studio-accent-text: #f4f4f5;
      --studio-accent-panel: #22232a;
      --agm-gradient-generation: linear-gradient(90deg, #f4f4f5 0%, #a1a1aa 100%);
    }

    #studioRoot * {
      box-sizing: border-box;
      pointer-events: auto;
    }

`;

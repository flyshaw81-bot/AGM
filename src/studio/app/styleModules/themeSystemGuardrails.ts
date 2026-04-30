export const themeSystemGuardrailStyles = `    /* Final dual-theme guardrails from the Pencil handoff.
       Night keeps the deep graphite shell; daylight keeps the Carbon Frost shell. */
    #studioRoot[data-studio-theme="night"] {
      --pencil-bg: #1b1b1b;
      --pencil-canvas: #101010;
      --pencil-sidebar: #151616;
      --pencil-surface: #151616;
      --pencil-surface-muted: #202124;
      --pencil-hover: #242528;
      --pencil-active: #2a2119;
      --pencil-border: #2a2a2a;
      --pencil-border-soft: #303030;
      --pencil-text: #f8fafc;
      --pencil-muted: #9aa3b5;
      --pencil-faint: #6f7787;
      --pencil-accent: #ff8a00;
      --agm-surface-dark: #101010;
      --agm-surface-dark-2: #151616;
      --studio-panel: #151616;
      --studio-panel-strong: #1b1b1b;
      --studio-border: #2a2a2a;
      --studio-border-strong: #3a3a3a;
      --studio-text: #f8fafc;
      --studio-muted: #9aa3b5;
      --studio-dim: #6f7787;
      --studio-accent: #ff8a00;
      --studio-cyan: #8deeb9;
      --studio-green: #8deeb9;
      --studio-warning: #ffd166;
      --studio-accent-text: #ffb45f;
      --studio-accent-panel: #241832;
      --cascade-ground: #101010;
      --cascade-layer: #151616;
      --cascade-layer-border: #2a2a2a;
      --cascade-device-border: #303030;
      --cascade-shadow-a: #00000028;
      --cascade-shadow-b: #00000056;
    }

    #studioRoot[data-studio-theme="daylight"] {
      --pencil-bg: #f5f6f8;
      --pencil-canvas: #f8fafc;
      --pencil-sidebar: #f1f3f6;
      --pencil-surface: #ffffff;
      --pencil-surface-muted: #eef1f5;
      --pencil-hover: #e7ebf0;
      --pencil-active: #dde3ea;
      --pencil-border: #d8dee7;
      --pencil-border-soft: #e6ebf1;
      --pencil-text: #15181d;
      --pencil-muted: #5f6b7a;
      --pencil-faint: #8b96a6;
      --pencil-accent: #1f2937;
      --agm-surface-dark: #f5f6f8;
      --agm-surface-dark-2: #ffffff;
      --studio-panel: #ffffff;
      --studio-panel-strong: #ffffff;
      --studio-border: #d8dee7;
      --studio-border-strong: #aeb7c4;
      --studio-text: #15181d;
      --studio-muted: #5f6b7a;
      --studio-dim: #8b96a6;
      --studio-accent: #1f2937;
      --studio-cyan: #475569;
      --studio-green: #334155;
      --studio-warning: #475569;
      --studio-accent-text: #15181d;
      --studio-accent-panel: #eef1f5;
      --cascade-ground: #f8fafc;
      --cascade-layer: #ffffff;
      --cascade-layer-border: #e6ebf1;
      --cascade-device-border: #d8dee7;
      --cascade-shadow-a: #10182808;
      --cascade-shadow-b: #10182814;
    }

    html[data-studio-theme="night"] body.studio-enabled,
    #studioRoot[data-studio-theme="night"],
    #studioRoot[data-studio-theme="night"] .studio-app {
      background: #1b1b1b;
      color: var(--pencil-text);
    }

    html[data-studio-theme="daylight"] body.studio-enabled,
    #studioRoot[data-studio-theme="daylight"],
    #studioRoot[data-studio-theme="daylight"] .studio-app {
      background: #f5f6f8;
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="night"] .studio-body,
    #studioRoot[data-studio-theme="daylight"] .studio-body {
      grid-template-columns: 224px minmax(0, 1fr) 388px;
      background: var(--cascade-ground);
    }

    #studioRoot[data-studio-theme="night"] .studio-app.is-nav-collapsed .studio-body,
    #studioRoot[data-studio-theme="daylight"] .studio-app.is-nav-collapsed .studio-body {
      grid-template-columns: 72px minmax(0, 1fr) 388px;
    }

    #studioRoot[data-studio-theme="night"] .studio-topbar,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar {
      background: var(--pencil-surface);
      color: var(--pencil-text);
      border-bottom: 1px solid var(--pencil-border-soft);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="night"] .studio-sidebar,
    #studioRoot[data-studio-theme="night"] .studio-stage,
    #studioRoot[data-studio-theme="night"] .studio-stage__viewport,
    #studioRoot[data-studio-theme="night"] .studio-statusbar {
      background: var(--pencil-canvas);
      color: var(--pencil-text);
      border-color: var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-sidebar,
    #studioRoot[data-studio-theme="daylight"] .studio-stage,
    #studioRoot[data-studio-theme="daylight"] .studio-stage__viewport,
    #studioRoot[data-studio-theme="daylight"] .studio-statusbar {
      background: var(--pencil-canvas);
      color: var(--pencil-text);
      border-color: var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="night"] .studio-sidebar--left,
    #studioRoot[data-studio-theme="daylight"] .studio-sidebar--left {
      background: var(--pencil-sidebar);
      box-shadow: inset -1px 0 0 var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="night"] .studio-sidebar--right,
    #studioRoot[data-studio-theme="daylight"] .studio-sidebar--right {
      background: var(--pencil-canvas);
      box-shadow: inset 1px 0 0 var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar,
    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar {
      background: var(--pencil-canvas);
      border-bottom: 0;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group,
    #studioRoot[data-studio-theme="night"] .studio-topbar__utility-group,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field,
    #studioRoot[data-studio-theme="night"] .studio-ghost,
    #studioRoot[data-studio-theme="night"] .studio-nav__item,
    #studioRoot[data-studio-theme="night"] .studio-chip,
    #studioRoot[data-studio-theme="night"] .studio-segment__button,
    #studioRoot[data-studio-theme="night"] .studio-map-tool,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar__utility-group,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field,
    #studioRoot[data-studio-theme="daylight"] .studio-ghost,
    #studioRoot[data-studio-theme="daylight"] .studio-nav__item,
    #studioRoot[data-studio-theme="daylight"] .studio-chip,
    #studioRoot[data-studio-theme="daylight"] .studio-segment__button,
    #studioRoot[data-studio-theme="daylight"] .studio-map-tool {
      background: transparent;
      color: var(--pencil-text);
      border-color: var(--pencil-border-soft);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="night"] .studio-topbar-field,
    #studioRoot[data-studio-theme="night"] .studio-field input,
    #studioRoot[data-studio-theme="night"] .studio-field select,
    #studioRoot[data-studio-theme="night"] .studio-stack-field select,
    #studioRoot[data-studio-theme="night"] .studio-stack-field textarea,
    #studioRoot[data-studio-theme="night"] textarea.studio-input,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field,
    #studioRoot[data-studio-theme="daylight"] .studio-field input,
    #studioRoot[data-studio-theme="daylight"] .studio-field select,
    #studioRoot[data-studio-theme="daylight"] .studio-stack-field select,
    #studioRoot[data-studio-theme="daylight"] .studio-stack-field textarea,
    #studioRoot[data-studio-theme="daylight"] textarea.studio-input {
      background: var(--pencil-surface-muted);
      color: var(--pencil-text);
      border-color: var(--pencil-border);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="night"] .studio-topbar-field option,
    #studioRoot[data-studio-theme="night"] .studio-field option,
    #studioRoot[data-studio-theme="night"] .studio-stack-field option,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field option,
    #studioRoot[data-studio-theme="daylight"] .studio-field option,
    #studioRoot[data-studio-theme="daylight"] .studio-stack-field option {
      background: var(--pencil-surface);
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="night"] .studio-panel,
    #studioRoot[data-studio-theme="night"] .studio-biome-insights,
    #studioRoot[data-studio-theme="daylight"] .studio-panel,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights {
      background: var(--pencil-surface);
      color: var(--pencil-text);
      border-color: var(--pencil-border-soft);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="night"] .studio-panel__title,
    #studioRoot[data-studio-theme="night"] .studio-panel__hero,
    #studioRoot[data-studio-theme="night"] .studio-canvas-summary strong,
    #studioRoot[data-studio-theme="daylight"] .studio-panel__title,
    #studioRoot[data-studio-theme="daylight"] .studio-panel__hero,
    #studioRoot[data-studio-theme="daylight"] .studio-canvas-summary strong {
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="night"] .studio-panel__eyebrow,
    #studioRoot[data-studio-theme="night"] .studio-panel__text,
    #studioRoot[data-studio-theme="night"] .studio-stage__meta,
    #studioRoot[data-studio-theme="daylight"] .studio-panel__eyebrow,
    #studioRoot[data-studio-theme="daylight"] .studio-panel__text,
    #studioRoot[data-studio-theme="daylight"] .studio-stage__meta {
      color: var(--pencil-muted);
    }

    #studioRoot[data-studio-theme="night"] .studio-nav__item:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-ghost:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-chip:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-segment__button:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-map-tool:hover,
    #studioRoot[data-studio-theme="daylight"] .studio-nav__item:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-ghost:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-chip:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-segment__button:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-map-tool:hover {
      background: var(--pencil-hover);
      color: var(--pencil-text);
      border-color: var(--pencil-border);
    }

    #studioRoot[data-studio-theme="night"] .studio-nav__item.is-active,
    #studioRoot[data-studio-theme="night"] .studio-chip.is-active,
    #studioRoot[data-studio-theme="night"] .studio-segment__button.is-selected,
    #studioRoot[data-studio-theme="night"] .studio-map-tool.is-active,
    #studioRoot[data-studio-theme="daylight"] .studio-nav__item.is-active,
    #studioRoot[data-studio-theme="daylight"] .studio-chip.is-active,
    #studioRoot[data-studio-theme="daylight"] .studio-segment__button.is-selected,
    #studioRoot[data-studio-theme="daylight"] .studio-map-tool.is-active {
      background: var(--pencil-active);
      color: var(--pencil-text);
      border-color: var(--pencil-border);
      box-shadow: inset 2px 0 0 var(--pencil-accent);
    }

    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar .studio-chip.is-active::after,
    #studioRoot[data-studio-theme="night"] .studio-segment--viewport .studio-segment__button.is-selected::after,
    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar .studio-chip.is-active::after,
    #studioRoot[data-studio-theme="daylight"] .studio-segment--viewport .studio-segment__button.is-selected::after {
      background: var(--pencil-accent);
    }

    #studioRoot[data-studio-theme="night"] .studio-map-zoom,
    #studioRoot[data-studio-theme="daylight"] .studio-map-zoom {
      background: var(--pencil-surface);
      color: var(--pencil-text);
      border-color: var(--pencil-border);
      box-shadow:
        0 4px 6px var(--cascade-shadow-a),
        0 16px 40px var(--cascade-shadow-b);
    }

    #studioRoot[data-studio-theme="night"] .studio-map-zoom button,
    #studioRoot[data-studio-theme="daylight"] .studio-map-zoom button {
      color: var(--pencil-text);
      border-bottom-color: var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="night"] .studio-canvas-frame-scaler::before,
    #studioRoot[data-studio-theme="night"] .studio-canvas-frame-scaler::after,
    #studioRoot[data-studio-theme="daylight"] .studio-canvas-frame-scaler::before,
    #studioRoot[data-studio-theme="daylight"] .studio-canvas-frame-scaler::after {
      background: var(--cascade-layer);
      border-color: var(--cascade-layer-border);
    }

    #studioRoot[data-studio-theme="night"] .studio-canvas-frame,
    #studioRoot[data-studio-theme="daylight"] .studio-canvas-frame {
      background: var(--cascade-ground);
      border-color: var(--cascade-device-border);
    }

    #studioRoot[data-studio-theme="night"] .studio-stage__viewport:has(.studio-canvas-frame[data-fit-mode='actual-size']),
    #studioRoot[data-studio-theme="daylight"] .studio-stage__viewport:has(.studio-canvas-frame[data-fit-mode='actual-size']) {
      place-items: start center;
      overflow: auto;
    }

    #studioRoot[data-studio-theme="night"] .studio-statusbar__preferences,
    #studioRoot[data-studio-theme="daylight"] .studio-statusbar__preferences {
      display: none;
    }

    #studioRoot .studio-app.studio-app--dark-project {
      display: block;
      width: 100vw;
      height: 100vh;
      padding: 0;
      background: #1B1B1B;
      overflow: hidden;
    }

    #studioRoot .studio-app.studio-app--dark-project::before {
      display: none;
    }
`;

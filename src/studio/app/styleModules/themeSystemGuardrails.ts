export const themeSystemGuardrailStyles = `    /* Final dual-theme guardrails from the Pencil handoff.
       Night uses a mineral-blue graphite shell; daylight uses a cool frost shell. */
    #studioRoot[data-studio-theme="night"] {
      --pencil-bg: #0f151c;
      --pencil-canvas: #111820;
      --pencil-sidebar: #17202a;
      --pencil-surface: #17202a;
      --pencil-surface-muted: #1d2833;
      --pencil-hover: #243240;
      --pencil-active: #213447;
      --pencil-border: #2e3d49;
      --pencil-border-soft: #273641;
      --pencil-text: #e9eef1;
      --pencil-muted: #92a4af;
      --pencil-faint: #63717b;
      --pencil-accent: #7fa8bf;
      --agm-surface-dark: #111820;
      --agm-surface-dark-2: #17202a;
      --studio-panel: #17202a;
      --studio-panel-strong: #111820;
      --studio-border: #2e3d49;
      --studio-border-strong: #435766;
      --studio-text: #e9eef1;
      --studio-muted: #92a4af;
      --studio-dim: #63717b;
      --studio-accent: #7fa8bf;
      --studio-cyan: #a9bbc6;
      --studio-green: #89b8a4;
      --studio-warning: #c7ad74;
      --studio-accent-text: #bdd2dc;
      --studio-accent-panel: #1d3342;
      --cascade-ground: #111820;
      --cascade-layer: #17202a;
      --cascade-layer-border: #2e3d49;
      --cascade-device-border: #273641;
      --cascade-shadow-a: #08111a28;
      --cascade-shadow-b: #08111a56;
    }

    #studioRoot[data-studio-theme="daylight"] {
      --pencil-bg: #eef2f5;
      --pencil-canvas: #f7f9fb;
      --pencil-sidebar: #e7edf1;
      --pencil-surface: #ffffff;
      --pencil-surface-muted: #e8eef2;
      --pencil-hover: #dce5eb;
      --pencil-active: #d1dee6;
      --pencil-border: #c9d5dd;
      --pencil-border-soft: #dde6ec;
      --pencil-text: #152430;
      --pencil-muted: #62717c;
      --pencil-faint: #8697a2;
      --pencil-accent: #5d879d;
      --agm-surface-dark: #eef2f5;
      --agm-surface-dark-2: #ffffff;
      --studio-panel: #ffffff;
      --studio-panel-strong: #ffffff;
      --studio-border: #c9d5dd;
      --studio-border-strong: #9dafba;
      --studio-text: #152430;
      --studio-muted: #62717c;
      --studio-dim: #8697a2;
      --studio-accent: #5d879d;
      --studio-cyan: #5d879d;
      --studio-green: #587f70;
      --studio-warning: #8f7950;
      --studio-accent-text: #24495c;
      --studio-accent-panel: #e3edf2;
      --cascade-ground: #f7f9fb;
      --cascade-layer: #ffffff;
      --cascade-layer-border: #dde6ec;
      --cascade-device-border: #c9d5dd;
      --cascade-shadow-a: #10182808;
      --cascade-shadow-b: #10182814;
    }

    html[data-studio-theme="night"] body.studio-enabled,
    #studioRoot[data-studio-theme="night"],
    #studioRoot[data-studio-theme="night"] .studio-app {
      background: #0f151c;
      color: var(--pencil-text);
    }

    html[data-studio-theme="daylight"] body.studio-enabled,
    #studioRoot[data-studio-theme="daylight"],
    #studioRoot[data-studio-theme="daylight"] .studio-app {
      background: #eef2f5;
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

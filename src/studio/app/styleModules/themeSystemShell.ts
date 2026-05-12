export const themeSystemShellStyles = `    /* AGMUI v2: topbar as a quiet command strip, not a brand banner. */
    #studioRoot[data-studio-theme="daylight"] .studio-app,
    #studioRoot[data-studio-theme="night"] .studio-app {
      grid-template-rows: 50px minmax(0, 1fr) 34px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-app::before,
    #studioRoot[data-studio-theme="night"] .studio-app::before {
      inset: 50px 430px 34px 232px;
      opacity: 0;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar,
    #studioRoot[data-studio-theme="night"] .studio-topbar {
      grid-template-columns: 36px minmax(430px, 500px) minmax(0, 1fr);
      gap: 12px;
      min-height: 50px;
      padding: 7px 10px;
      background: var(--pencil-surface);
      border-bottom: 1px solid var(--pencil-border-soft);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar::after,
    #studioRoot[data-studio-theme="night"] .studio-topbar::after {
      display: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__group--brand,
    #studioRoot[data-studio-theme="night"] .studio-topbar__group--brand {
      width: 36px;
      min-width: 36px;
      gap: 0;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand,
    #studioRoot[data-studio-theme="night"] .studio-brand {
      width: 36px;
      min-width: 36px;
      height: 36px;
      justify-content: center;
      padding: 0;
      border-radius: 7px;
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand:hover,
    #studioRoot[data-studio-theme="night"] .studio-brand:hover {
      background: var(--pencil-hover);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand__logo,
    #studioRoot[data-studio-theme="night"] .studio-brand__logo {
      width: 28px;
      height: 28px;
      flex-basis: 28px;
      border-radius: 6px;
      object-fit: cover;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand__wordmark,
    #studioRoot[data-studio-theme="daylight"] .studio-brand__title,
    #studioRoot[data-studio-theme="daylight"] .studio-brand__rule,
    #studioRoot[data-studio-theme="daylight"] .studio-brand__subtitle,
    #studioRoot[data-studio-theme="night"] .studio-brand__wordmark,
    #studioRoot[data-studio-theme="night"] .studio-brand__title,
    #studioRoot[data-studio-theme="night"] .studio-brand__rule,
    #studioRoot[data-studio-theme="night"] .studio-brand__subtitle {
      display: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__context,
    #studioRoot[data-studio-theme="night"] .studio-topbar__context {
      gap: 8px;
      height: 36px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field {
      height: 36px;
      padding: 4px 10px;
      border-radius: 6px;
      border-color: var(--pencil-border-soft);
      background: var(--pencil-surface-muted);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field--profile,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field--profile {
      flex-basis: 146px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field--preset,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field--preset {
      flex-basis: 190px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field--seed,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field--seed {
      flex-basis: 124px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field > span,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field > span {
      font-size: 10px;
      line-height: 1;
      font-weight: 560;
      letter-spacing: 0;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field select,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field input,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field select,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field input {
      height: 18px;
      font-size: 12.5px;
      line-height: 18px;
      font-weight: 650;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__group--actions,
    #studioRoot[data-studio-theme="night"] .studio-topbar__group--actions {
      gap: 0;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group {
      height: 36px;
      gap: 0;
      padding: 0;
      overflow: hidden;
      border-radius: 6px;
      border-color: var(--pencil-border-soft);
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group .studio-ghost,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group .studio-ghost {
      height: 34px;
      min-height: 34px;
      min-width: 62px;
      padding: 0 12px;
      border: 0;
      border-radius: 0;
      background: transparent;
      font-size: 12.5px;
      font-weight: 650;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group .studio-ghost:first-child,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group .studio-ghost:first-child {
      border-radius: 5px 0 0 5px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group .studio-ghost:last-child,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group .studio-ghost:last-child {
      border-radius: 0 5px 5px 0;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group .studio-ghost + .studio-ghost::before,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group .studio-ghost + .studio-ghost::before {
      left: 0;
      top: 8px;
      bottom: 8px;
      background: var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group .studio-ghost__icon,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group .studio-ghost__icon {
      width: 15px;
      height: 15px;
    }

    /* AGMUI v2: canvas options are a thin tool strip, not button cards. */
    #studioRoot[data-studio-theme="daylight"] .studio-stage,
    #studioRoot[data-studio-theme="night"] .studio-stage {
      grid-template-rows: 38px minmax(0, 1fr);
      background: var(--pencil-canvas);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar,
    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar {
      height: 38px;
      min-height: 38px;
      gap: 0;
      padding: 0 10px;
      border-bottom: 1px solid var(--pencil-border-soft);
      background: var(--pencil-surface);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-controls,
    #studioRoot[data-studio-theme="night"] .studio-map-controls {
      width: 100%;
      height: 100%;
      gap: 2px;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      scrollbar-width: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-controls::-webkit-scrollbar,
    #studioRoot[data-studio-theme="night"] .studio-map-controls::-webkit-scrollbar {
      display: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-segment--viewport,
    #studioRoot[data-studio-theme="night"] .studio-segment--viewport {
      position: relative;
      gap: 2px;
      padding-right: 8px;
      margin-right: 4px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-segment--viewport::after,
    #studioRoot[data-studio-theme="night"] .studio-segment--viewport::after {
      content: "";
      position: absolute;
      top: 10px;
      right: 1px;
      bottom: 10px;
      width: 1px;
      background: var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar .studio-chip,
    #studioRoot[data-studio-theme="daylight"] .studio-segment--viewport .studio-segment__button,
    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar .studio-chip,
    #studioRoot[data-studio-theme="night"] .studio-segment--viewport .studio-segment__button {
      position: relative;
      height: 28px;
      min-height: 28px;
      padding: 0 9px;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: var(--pencil-muted);
      font-size: 12.5px;
      font-weight: 650;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar .studio-chip:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-segment--viewport .studio-segment__button:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar .studio-chip:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-segment--viewport .studio-segment__button:hover:not(:disabled) {
      background: var(--pencil-hover);
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar .studio-chip.is-active,
    #studioRoot[data-studio-theme="daylight"] .studio-segment--viewport .studio-segment__button.is-selected,
    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar .studio-chip.is-active,
    #studioRoot[data-studio-theme="night"] .studio-segment--viewport .studio-segment__button.is-selected {
      background: var(--pencil-active);
      color: var(--pencil-text);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar .studio-chip.is-active::after,
    #studioRoot[data-studio-theme="daylight"] .studio-segment--viewport .studio-segment__button.is-selected::after,
    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar .studio-chip.is-active::after,
    #studioRoot[data-studio-theme="night"] .studio-segment--viewport .studio-segment__button.is-selected::after {
      content: "";
      position: absolute;
      left: 8px;
      right: 8px;
      bottom: 3px;
      height: 2px;
      border-radius: 999px;
      background: var(--pencil-accent);
      opacity: 0.86;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__viewport,
    #studioRoot[data-studio-theme="night"] .studio-stage__viewport {
      padding: 8px 10px 10px;
    }

    /* Pencil style translation: Centered Device Cascade for the AGM workbench. */
    #studioRoot[data-studio-theme="daylight"] {
      --cascade-ground: #ffffff;
      --cascade-layer: #f0f2f5;
      --cascade-layer-border: #dfe3ea;
      --cascade-device-border: #eef0f3;
      --cascade-shadow-a: #08111a08;
      --cascade-shadow-b: #08111a12;
    }

    #studioRoot[data-studio-theme="night"] {
      --cascade-ground: #1f1f1f;
      --cascade-layer: #2b2b2b;
      --cascade-layer-border: #383838;
      --cascade-device-border: #303030;
      --cascade-shadow-a: #08111a24;
      --cascade-shadow-b: #08111a44;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-body,
    #studioRoot[data-studio-theme="night"] .studio-body {
      grid-template-columns: 224px minmax(0, 1fr) 388px;
      background: var(--cascade-ground);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar,
    #studioRoot[data-studio-theme="night"] .studio-topbar {
      background: var(--cascade-ground);
      border-bottom-color: transparent;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-sidebar,
    #studioRoot[data-studio-theme="night"] .studio-sidebar {
      background: var(--cascade-ground);
      border-color: transparent;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-sidebar--left,
    #studioRoot[data-studio-theme="night"] .studio-sidebar--left {
      box-shadow: inset -1px 0 0 var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-sidebar--right,
    #studioRoot[data-studio-theme="night"] .studio-sidebar--right {
      padding: 16px 16px 18px;
      background: var(--cascade-ground);
      box-shadow: inset 1px 0 0 var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage,
    #studioRoot[data-studio-theme="night"] .studio-stage {
      grid-template-rows: 36px minmax(0, 1fr);
      padding: 0 18px 18px;
      background: var(--cascade-ground);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar,
    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar {
      height: 36px;
      min-height: 36px;
      padding: 0;
      border-bottom: 0;
      background: transparent;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-controls,
    #studioRoot[data-studio-theme="night"] .studio-map-controls {
      justify-content: center;
      gap: 3px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar .studio-chip,
    #studioRoot[data-studio-theme="daylight"] .studio-segment--viewport .studio-segment__button,
    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar .studio-chip,
    #studioRoot[data-studio-theme="night"] .studio-segment--viewport .studio-segment__button {
      height: 26px;
      min-height: 26px;
      padding-inline: 8px;
      font-size: 12px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__viewport,
    #studioRoot[data-studio-theme="night"] .studio-stage__viewport {
      padding: 14px 28px 22px;
      place-items: center;
      overflow: hidden;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-canvas-frame-scaler,
    #studioRoot[data-studio-theme="night"] .studio-canvas-frame-scaler {
      position: relative;
      z-index: 0;
      isolation: isolate;
      overflow: visible;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-canvas-frame-scaler::before,
    #studioRoot[data-studio-theme="daylight"] .studio-canvas-frame-scaler::after,
    #studioRoot[data-studio-theme="night"] .studio-canvas-frame-scaler::before,
    #studioRoot[data-studio-theme="night"] .studio-canvas-frame-scaler::after {
      content: "";
      position: absolute;
      border-radius: 16px;
      border: 1px solid var(--cascade-layer-border);
      background: var(--cascade-layer);
      pointer-events: none;
      z-index: 0;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-canvas-frame-scaler::before,
    #studioRoot[data-studio-theme="night"] .studio-canvas-frame-scaler::before {
      inset: 16px -24px -16px 22px;
      transform: rotate(-1.35deg);
      opacity: 0.82;
      box-shadow:
        0 4px 6px var(--cascade-shadow-a),
        0 16px 40px var(--cascade-shadow-b);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-canvas-frame-scaler::after,
    #studioRoot[data-studio-theme="night"] .studio-canvas-frame-scaler::after {
      inset: 30px -40px -28px 40px;
      transform: rotate(1.15deg);
      opacity: 0.58;
      box-shadow:
        0 4px 6px var(--cascade-shadow-a),
        0 16px 40px var(--cascade-shadow-b);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-canvas-frame,
    #studioRoot[data-studio-theme="night"] .studio-canvas-frame {
      z-index: 1;
      border-radius: 12px;
      border: 1px solid var(--cascade-device-border);
      background: var(--cascade-ground);
      box-shadow:
        0 4px 6px var(--cascade-shadow-a),
        0 16px 40px var(--cascade-shadow-b);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-panel,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights,
    #studioRoot[data-studio-theme="night"] .studio-panel,
    #studioRoot[data-studio-theme="night"] .studio-biome-insights {
      border-color: var(--pencil-border-soft);
      background: var(--pencil-surface);
      box-shadow:
        0 4px 6px var(--cascade-shadow-a),
        0 16px 40px color-mix(in srgb, var(--cascade-shadow-b) 70%, transparent);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-zoom,
    #studioRoot[data-studio-theme="night"] .studio-map-zoom {
      right: 18px;
      bottom: 18px;
      border-radius: 8px;
      box-shadow:
        0 4px 6px var(--cascade-shadow-a),
        0 16px 40px var(--cascade-shadow-b);
    }

`;

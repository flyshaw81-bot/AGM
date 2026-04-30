export const themeSystemBaseStyles = `    #studioRoot[data-studio-theme="daylight"] {
      --pencil-bg: #eef0f3;
      --pencil-canvas: #ffffff;
      --pencil-sidebar: #e9eaed;
      --pencil-surface: #ffffff;
      --pencil-surface-muted: #f3f4f6;
      --pencil-hover: #e4e7eb;
      --pencil-active: #dde1e7;
      --pencil-border: #dde1e6;
      --pencil-border-soft: #eaedf1;
      --pencil-text: #111827;
      --pencil-muted: #6b7280;
      --pencil-faint: #9ca3af;
      --pencil-accent: #6f5cff;
    }

    #studioRoot[data-studio-theme="night"] {
      --pencil-bg: #1f1f1f;
      --pencil-canvas: #1f1f1f;
      --pencil-sidebar: #2a2a2a;
      --pencil-surface: #242424;
      --pencil-surface-muted: #2f2f2f;
      --pencil-hover: #343434;
      --pencil-active: #3a3a3a;
      --pencil-border: #3a3a3a;
      --pencil-border-soft: #2d2d2d;
      --pencil-text: #f4f4f5;
      --pencil-muted: #a1a1aa;
      --pencil-faint: #71717a;
      --pencil-accent: #a78bfa;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-app,
    #studioRoot[data-studio-theme="night"] .studio-app {
      background: var(--pencil-bg);
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-app::before,
    #studioRoot[data-studio-theme="night"] .studio-app::before,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar::after,
    #studioRoot[data-studio-theme="night"] .studio-topbar::after {
      display: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar,
    #studioRoot[data-studio-theme="night"] .studio-topbar {
      background: var(--pencil-canvas);
      border-bottom: 1px solid var(--pencil-border-soft);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-statusbar,
    #studioRoot[data-studio-theme="night"] .studio-statusbar {
      background: var(--pencil-canvas);
      border-top: 1px solid var(--pencil-border-soft);
      color: var(--pencil-muted);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-sidebar,
    #studioRoot[data-studio-theme="night"] .studio-sidebar {
      background: var(--pencil-sidebar);
      border-color: var(--pencil-border-soft);
      box-shadow: none;
      scrollbar-color: var(--pencil-faint) transparent;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-sidebar--right,
    #studioRoot[data-studio-theme="night"] .studio-sidebar--right {
      background: var(--pencil-canvas);
      border-left-color: var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage,
    #studioRoot[data-studio-theme="night"] .studio-stage {
      background: var(--pencil-canvas);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar,
    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar {
      background: var(--pencil-canvas);
      border-bottom: 1px solid var(--pencil-border-soft);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand,
    #studioRoot[data-studio-theme="night"] .studio-brand {
      border-radius: 6px;
      padding: 0;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand:hover,
    #studioRoot[data-studio-theme="night"] .studio-brand:hover {
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand__logo,
    #studioRoot[data-studio-theme="night"] .studio-brand__logo {
      width: 34px;
      height: 34px;
      flex-basis: 34px;
      border-radius: 7px;
      box-shadow: none;
      filter: grayscale(1) contrast(1.08);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand__wordmark,
    #studioRoot[data-studio-theme="night"] .studio-brand__wordmark {
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand__rule,
    #studioRoot[data-studio-theme="night"] .studio-brand__rule {
      background: var(--pencil-text);
      opacity: 0.18;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand__subtitle,
    #studioRoot[data-studio-theme="night"] .studio-brand__subtitle {
      color: var(--pencil-muted);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar__utility-group,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group,
    #studioRoot[data-studio-theme="night"] .studio-topbar__utility-group,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field {
      border-color: var(--pencil-border);
      border-radius: 6px;
      background: var(--pencil-surface);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-controls,
    #studioRoot[data-studio-theme="night"] .studio-map-controls {
      gap: 6px;
      min-height: 32px;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field:hover,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field:focus-within,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field:hover,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field:focus-within {
      border-color: var(--pencil-faint);
      background: var(--pencil-surface);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field > span,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field > span {
      color: var(--pencil-muted);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field select,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field input,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field select,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field input {
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field option,
    #studioRoot[data-studio-theme="night"] .studio-topbar-field option {
      background: var(--pencil-surface);
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-ghost,
    #studioRoot[data-studio-theme="daylight"] .studio-nav__item,
    #studioRoot[data-studio-theme="daylight"] .studio-chip,
    #studioRoot[data-studio-theme="daylight"] .studio-segment__button,
    #studioRoot[data-studio-theme="daylight"] .studio-map-tool,
    #studioRoot[data-studio-theme="night"] .studio-ghost,
    #studioRoot[data-studio-theme="night"] .studio-nav__item,
    #studioRoot[data-studio-theme="night"] .studio-chip,
    #studioRoot[data-studio-theme="night"] .studio-segment__button,
    #studioRoot[data-studio-theme="night"] .studio-map-tool {
      border-radius: 5px;
      color: var(--pencil-text);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-ghost,
    #studioRoot[data-studio-theme="night"] .studio-ghost {
      background: transparent;
      border-color: transparent;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group {
      padding: 2px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group .studio-ghost,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group .studio-ghost {
      min-width: 62px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-ghost:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-chip:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-segment__button:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-ghost:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-chip:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-segment__button:hover:not(:disabled) {
      border-color: transparent;
      background: var(--pencil-hover);
      color: var(--pencil-text);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar__command-group .studio-ghost + .studio-ghost::before,
    #studioRoot[data-studio-theme="night"] .studio-topbar__command-group .studio-ghost + .studio-ghost::before {
      background: var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-ghost__icon,
    #studioRoot[data-studio-theme="daylight"] .studio-nav__icon,
    #studioRoot[data-studio-theme="daylight"] .studio-map-tool__icon,
    #studioRoot[data-studio-theme="night"] .studio-ghost__icon,
    #studioRoot[data-studio-theme="night"] .studio-nav__icon,
    #studioRoot[data-studio-theme="night"] .studio-map-tool__icon {
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-nav__group-label,
    #studioRoot[data-studio-theme="daylight"] .studio-map-tools__title,
    #studioRoot[data-studio-theme="night"] .studio-nav__group-label,
    #studioRoot[data-studio-theme="night"] .studio-map-tools__title {
      color: var(--pencil-muted);
      letter-spacing: 0;
      text-transform: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-nav__item,
    #studioRoot[data-studio-theme="night"] .studio-nav__item {
      background: transparent;
      border-color: transparent;
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-nav__item:hover:not(:disabled),
    #studioRoot[data-studio-theme="night"] .studio-nav__item:hover:not(:disabled) {
      background: var(--pencil-hover);
      border-color: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-nav__item.is-active,
    #studioRoot[data-studio-theme="night"] .studio-nav__item.is-active {
      background: var(--pencil-active);
      border-color: transparent;
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-nav__item.is-active::before,
    #studioRoot[data-studio-theme="night"] .studio-nav__item.is-active::before {
      background: var(--pencil-accent);
      opacity: 0.9;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-nav__icon,
    #studioRoot[data-studio-theme="night"] .studio-nav__icon {
      background: transparent;
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-nav__hint,
    #studioRoot[data-studio-theme="night"] .studio-nav__hint {
      display: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-tools,
    #studioRoot[data-studio-theme="night"] .studio-map-tools {
      border-color: var(--pencil-border-soft);
      background: transparent;
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-tool,
    #studioRoot[data-studio-theme="night"] .studio-map-tool {
      border-color: var(--pencil-border-soft);
      background: transparent;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-tool:hover,
    #studioRoot[data-studio-theme="night"] .studio-map-tool:hover {
      border-color: transparent;
      background: var(--pencil-hover);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-tool.is-active,
    #studioRoot[data-studio-theme="night"] .studio-map-tool.is-active {
      border-color: transparent;
      background: var(--pencil-active);
      color: var(--pencil-text);
      box-shadow: inset 2px 0 0 var(--pencil-accent);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-segment__button.is-selected,
    #studioRoot[data-studio-theme="daylight"] .studio-chip.is-active,
    #studioRoot[data-studio-theme="night"] .studio-segment__button.is-selected,
    #studioRoot[data-studio-theme="night"] .studio-chip.is-active {
      border-color: transparent;
      background: var(--pencil-active);
      color: var(--pencil-text);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar .studio-chip,
    #studioRoot[data-studio-theme="daylight"] .studio-segment--viewport .studio-segment__button,
    #studioRoot[data-studio-theme="night"] .studio-stage__toolbar .studio-chip,
    #studioRoot[data-studio-theme="night"] .studio-segment--viewport .studio-segment__button {
      height: 28px;
      min-height: 28px;
      padding-inline: 10px;
      border-radius: 5px;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-panel,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights,
    #studioRoot[data-studio-theme="night"] .studio-panel,
    #studioRoot[data-studio-theme="night"] .studio-biome-insights {
      border-color: var(--pencil-border-soft);
      border-radius: 8px;
      background: var(--pencil-surface);
      color: var(--pencil-text);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-panel__title,
    #studioRoot[data-studio-theme="daylight"] .studio-panel__hero,
    #studioRoot[data-studio-theme="daylight"] .studio-canvas-summary strong,
    #studioRoot[data-studio-theme="night"] .studio-panel__title,
    #studioRoot[data-studio-theme="night"] .studio-panel__hero,
    #studioRoot[data-studio-theme="night"] .studio-canvas-summary strong {
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-panel__eyebrow,
    #studioRoot[data-studio-theme="daylight"] .studio-panel__text,
    #studioRoot[data-studio-theme="night"] .studio-panel__eyebrow,
    #studioRoot[data-studio-theme="night"] .studio-panel__text {
      color: var(--pencil-muted);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-field input,
    #studioRoot[data-studio-theme="daylight"] .studio-field select,
    #studioRoot[data-studio-theme="daylight"] .studio-stack-field select,
    #studioRoot[data-studio-theme="daylight"] .studio-stack-field textarea,
    #studioRoot[data-studio-theme="daylight"] textarea.studio-input,
    #studioRoot[data-studio-theme="night"] .studio-field input,
    #studioRoot[data-studio-theme="night"] .studio-field select,
    #studioRoot[data-studio-theme="night"] .studio-stack-field select,
    #studioRoot[data-studio-theme="night"] .studio-stack-field textarea,
    #studioRoot[data-studio-theme="night"] textarea.studio-input {
      border-color: var(--pencil-border);
      border-radius: 6px;
      background: var(--pencil-surface-muted);
      color: var(--pencil-text);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-canvas-summary,
    #studioRoot[data-studio-theme="night"] .studio-canvas-summary {
      border-color: var(--pencil-border-soft);
      border-radius: 7px;
      background: var(--pencil-surface-muted);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-canvas-summary div,
    #studioRoot[data-studio-theme="night"] .studio-canvas-summary div {
      border-left-color: var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-zoom,
    #studioRoot[data-studio-theme="night"] .studio-map-zoom {
      border-color: var(--pencil-border);
      border-radius: 6px;
      background: var(--pencil-surface);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-zoom button,
    #studioRoot[data-studio-theme="night"] .studio-map-zoom button {
      color: var(--pencil-text);
      border-bottom-color: var(--pencil-border-soft);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-statusbar .studio-theme-select,
    #studioRoot[data-studio-theme="daylight"] .studio-statusbar .studio-language-switch,
    #studioRoot[data-studio-theme="night"] .studio-statusbar .studio-theme-select,
    #studioRoot[data-studio-theme="night"] .studio-statusbar .studio-language-switch {
      border-color: var(--pencil-border-soft);
      border-radius: 5px;
      background: var(--pencil-surface-muted);
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-theme-select__swatch,
    #studioRoot[data-studio-theme="night"] .studio-theme-select__swatch {
      box-shadow: none;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-theme-select select,
    #studioRoot[data-studio-theme="night"] .studio-theme-select select,
    #studioRoot[data-studio-theme="daylight"] .studio-language-switch .studio-segment__button,
    #studioRoot[data-studio-theme="night"] .studio-language-switch .studio-segment__button {
      color: var(--pencil-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-language-switch .studio-segment__button.is-selected,
    #studioRoot[data-studio-theme="night"] .studio-language-switch .studio-segment__button.is-selected {
      background: var(--pencil-canvas);
      color: var(--pencil-text);
      box-shadow: none;
    }

`;

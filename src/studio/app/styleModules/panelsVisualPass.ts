export const panelsVisualPassStyles = `    /* AGMUI visual pass: flatter editor plates, quieter borders, stronger icon discipline. */
    .studio-topbar {
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--agm-surface-dark) 86%, #000000), color-mix(in srgb, var(--agm-surface-dark) 96%, #000000)),
        var(--agm-surface-dark);
      border-bottom-color: rgba(255, 255, 255, 0.045);
      box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.72);
    }

    .studio-topbar::after {
      opacity: 0.18;
    }

    .studio-topbar__command-group,
    .studio-topbar__utility-group,
    .studio-topbar-field,
    .studio-map-controls {
      border-color: rgba(255, 255, 255, 0.07);
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.032), rgba(0, 0, 0, 0.18)),
        color-mix(in srgb, var(--agm-surface-dark-2) 78%, #050505);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.035),
        inset 0 -1px 0 rgba(0, 0, 0, 0.52);
    }

    .studio-topbar-field:hover,
    .studio-topbar-field:focus-within {
      border-color: var(--studio-accent-28);
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.16)),
        color-mix(in srgb, var(--agm-surface-dark-2) 82%, var(--studio-accent) 4%);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.045),
        0 0 0 1px color-mix(in srgb, var(--studio-accent) 10%, transparent);
    }

    .studio-topbar__command-group .studio-ghost {
      min-width: 68px;
      background: transparent;
      border-color: transparent;
      color: color-mix(in srgb, var(--studio-text) 86%, var(--studio-accent));
      box-shadow: none;
    }

    .studio-topbar__command-group .studio-ghost + .studio-ghost::before {
      background: rgba(255, 255, 255, 0.06);
    }

    .studio-ghost--generate,
    .studio-ghost--export {
      border-color: transparent;
      background: transparent;
      color: color-mix(in srgb, var(--studio-text) 88%, var(--studio-accent));
    }

    .studio-ghost:hover:not(:disabled),
    .studio-nav__item:hover:not(:disabled),
    .studio-chip:hover:not(:disabled),
    .studio-segment__button:hover:not(:disabled) {
      border-color: var(--studio-accent-28);
      background: color-mix(in srgb, var(--studio-accent) 9%, rgba(255, 255, 255, 0.025));
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .studio-ghost__icon,
    .studio-nav__svg,
    .studio-map-tool__svg {
      stroke-width: 1.65;
    }

    .studio-sidebar {
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--agm-surface-dark) 94%, #000000), color-mix(in srgb, var(--agm-surface-dark) 98%, #000000));
      border-right-color: rgba(255, 255, 255, 0.055);
    }

    .studio-sidebar--right {
      border-left-color: rgba(255, 255, 255, 0.055);
      background: color-mix(in srgb, var(--agm-surface-dark) 96%, #000000);
    }

    .studio-nav {
      gap: 4px;
      padding-top: 6px;
    }

    .studio-nav__group-label,
    .studio-map-tools__title {
      color: color-mix(in srgb, var(--studio-accent) 62%, var(--studio-muted));
      letter-spacing: 0.045em;
    }

    .studio-nav__item {
      min-height: 38px;
      padding: 6px 10px;
      border: 1px solid transparent;
      background: rgba(255, 255, 255, 0.018);
      color: color-mix(in srgb, var(--studio-text) 80%, var(--studio-muted));
    }

    .studio-nav__item.is-active {
      border-color: var(--studio-accent-18);
      background:
        linear-gradient(90deg, var(--studio-accent-10), rgba(255, 255, 255, 0.012) 64%),
        rgba(255, 255, 255, 0.018);
      color: var(--studio-text);
    }

    .studio-nav__item.is-active::before {
      left: -4px;
      top: 8px;
      bottom: 8px;
      width: 2px;
      opacity: 0.9;
    }

    .studio-nav__icon {
      width: 24px;
      height: 24px;
      background: transparent;
      color: color-mix(in srgb, var(--studio-accent) 74%, var(--studio-muted));
    }

    .studio-nav__item.is-active .studio-nav__icon {
      background: transparent;
      color: var(--studio-accent-text);
    }

    .studio-nav__label {
      font-size: 12.5px;
      font-weight: 840;
    }

    .studio-nav__hint {
      display: none;
      font-size: 10.5px;
      color: color-mix(in srgb, var(--studio-muted) 78%, var(--studio-accent));
    }

    .studio-map-tools {
      gap: 10px;
      margin-top: 12px;
      border-color: transparent;
      border-top: 1px solid rgba(255, 255, 255, 0.055);
      border-radius: 0;
      background: transparent;
    }

    .studio-map-tools__grid {
      gap: 5px;
    }

    .studio-map-tool {
      grid-template-columns: 26px minmax(0, 1fr);
      place-items: center start;
      min-height: 40px;
      padding: 0 10px;
      border-color: transparent;
      background: rgba(255, 255, 255, 0.014);
      color: color-mix(in srgb, var(--studio-text) 78%, var(--studio-muted));
    }

    .studio-map-tool__svg {
      width: 20px;
      height: 20px;
    }

    .studio-map-tool strong {
      font-size: 12.5px;
      font-weight: 850;
      justify-self: start;
    }

    .studio-map-tool.is-active {
      border-color: var(--studio-accent-24);
      background:
        linear-gradient(90deg, var(--studio-accent-12), rgba(255, 255, 255, 0.018)),
        color-mix(in srgb, var(--agm-surface-dark-2) 82%, #000000);
      color: var(--studio-text);
      box-shadow: inset 2px 0 0 var(--studio-accent);
    }

    .studio-stage__toolbar {
      background: color-mix(in srgb, var(--agm-surface-dark-2) 72%, #000000);
      border-bottom-color: rgba(255, 255, 255, 0.055);
    }

    .studio-segment {
      gap: 3px;
    }

    .studio-segment__button,
    .studio-stage__toolbar .studio-chip {
      border-color: transparent;
      background: transparent;
      color: color-mix(in srgb, var(--studio-text) 76%, var(--studio-muted));
    }

    .studio-segment__button.is-selected,
    .studio-chip.is-active {
      border-color: var(--studio-accent-34);
      background: color-mix(in srgb, var(--studio-accent) 14%, rgba(255, 255, 255, 0.024));
      color: var(--studio-text);
    }

    .studio-panel,
    .studio-biome-insights {
      border-color: rgba(255, 255, 255, 0.065);
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.028), rgba(0, 0, 0, 0.14)),
        color-mix(in srgb, var(--agm-surface-dark-2) 76%, #000000);
      box-shadow: 0 18px 38px rgba(0, 0, 0, 0.18);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-topbar,
    #studioRoot[data-studio-theme="daylight"] .studio-statusbar,
    #studioRoot[data-studio-theme="daylight"] .studio-sidebar,
    #studioRoot[data-studio-theme="daylight"] .studio-stage,
    #studioRoot[data-studio-theme="daylight"] .studio-stage__toolbar,
    #studioRoot[data-studio-theme="daylight"] .studio-sidebar--right {
      color: var(--studio-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-brand__wordmark,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field select,
    #studioRoot[data-studio-theme="daylight"] .studio-topbar-field input,
    #studioRoot[data-studio-theme="daylight"] .studio-panel__title,
    #studioRoot[data-studio-theme="daylight"] .studio-panel__hero,
    #studioRoot[data-studio-theme="daylight"] .studio-canvas-summary strong,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__control-head {
      color: var(--studio-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-statusbar,
    #studioRoot[data-studio-theme="daylight"] .studio-panel__text,
    #studioRoot[data-studio-theme="daylight"] .studio-stage__meta,
    #studioRoot[data-studio-theme="daylight"] .studio-nav__hint,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights p {
      color: var(--studio-muted);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-ghost,
    #studioRoot[data-studio-theme="daylight"] .studio-nav__item,
    #studioRoot[data-studio-theme="daylight"] .studio-chip,
    #studioRoot[data-studio-theme="daylight"] .studio-segment__button,
    #studioRoot[data-studio-theme="daylight"] .studio-map-tool,
    #studioRoot[data-studio-theme="daylight"] .studio-language-switch .studio-segment__button {
      color: color-mix(in srgb, var(--studio-text) 82%, var(--studio-accent));
    }

    #studioRoot[data-studio-theme="daylight"] .studio-ghost--generate,
    #studioRoot[data-studio-theme="daylight"] .studio-ghost--export,
    #studioRoot[data-studio-theme="daylight"] .studio-ghost--primary,
    #studioRoot[data-studio-theme="daylight"] .studio-ghost:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-nav__item:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-chip:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-segment__button:hover:not(:disabled),
    #studioRoot[data-studio-theme="daylight"] .studio-segment__button.is-selected,
    #studioRoot[data-studio-theme="daylight"] .studio-chip.is-active,
    #studioRoot[data-studio-theme="daylight"] .studio-nav__item.is-active,
    #studioRoot[data-studio-theme="daylight"] .studio-map-tool.is-active,
    #studioRoot[data-studio-theme="daylight"] .studio-language-switch .studio-segment__button.is-selected {
      color: #15120f;
    }

    #studioRoot[data-studio-theme="daylight"] .studio-field,
    #studioRoot[data-studio-theme="daylight"] .studio-stack-field,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__control label {
      color: var(--studio-muted);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-field input,
    #studioRoot[data-studio-theme="daylight"] .studio-field select,
    #studioRoot[data-studio-theme="daylight"] .studio-stack-field select,
    #studioRoot[data-studio-theme="daylight"] .studio-stack-field textarea,
    #studioRoot[data-studio-theme="daylight"] textarea.studio-input {
      border-color: rgba(36, 28, 18, 0.16);
      background: rgba(255, 255, 255, 0.74);
      color: var(--studio-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-canvas-summary {
      border-color: rgba(36, 28, 18, 0.12);
      background: rgba(255, 255, 255, 0.54);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-tool {
      border-color: rgba(36, 28, 18, 0.12);
      background: rgba(255, 255, 255, 0.58);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.62);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-map-tool:hover,
    #studioRoot[data-studio-theme="daylight"] .studio-map-tool.is-active {
      background: linear-gradient(180deg, rgba(255, 122, 0, 0.16), rgba(255, 255, 255, 0.78));
    }

    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights {
      background:
        radial-gradient(circle at 85% 18%, rgba(255, 106, 0, 0.12), transparent 34%),
        linear-gradient(145deg, rgba(255, 252, 246, 0.96), rgba(237, 232, 222, 0.96));
      box-shadow: 0 18px 42px rgba(37, 27, 14, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.74);
      color: var(--studio-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__header,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__row,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__row:hover,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__row:focus-visible,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__row[data-biome-active='true'] {
      color: var(--studio-text);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__header span,
    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__row em {
      color: var(--studio-muted);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-biome-insights__control {
      background: color-mix(in srgb, var(--biome-color, #8dc0ff) 13%, rgba(255, 255, 255, 0.68));
    }

    #studioRoot[data-studio-theme="daylight"] .studio-statusbar .studio-theme-select,
    #studioRoot[data-studio-theme="daylight"] .studio-statusbar .studio-language-switch {
      border: 1px solid rgba(36, 28, 18, 0.12);
      background: rgba(255, 255, 255, 0.62);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
    }

    #studioRoot[data-studio-theme="daylight"] .studio-theme-select select {
      color: var(--studio-text);
    }

`;

export const foundationAppChromeStyles = `    .studio-app {
      display: grid;
      grid-template-rows: 66px minmax(0, 1fr) 34px;
      height: 100%;
      background: var(--agm-surface-dark);
    }

    .studio-app::before {
      content: "";
      position: fixed;
      inset: 66px 430px 34px 232px;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
      background-size: 48px 48px;
      opacity: 0.28;
    }

    .studio-topbar,
    .studio-statusbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      background: var(--agm-surface-dark-2);
      border-bottom: 1px solid var(--studio-accent-16);
      box-shadow: none;
      backdrop-filter: none;
    }

    .studio-topbar {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 212px minmax(520px, 640px) minmax(0, 1fr);
      gap: 12px;
      padding: 8px 10px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--agm-surface-dark-2) 94%, var(--studio-accent) 4%), color-mix(in srgb, var(--agm-surface-dark) 98%, #000000)),
        var(--agm-surface-dark-2);
      border-bottom-color: var(--studio-accent-18);
      box-shadow:
        inset 0 -1px 0 rgba(0, 0, 0, 0.62),
        0 8px 24px rgba(0, 0, 0, 0.18);
    }

    .studio-topbar::after {
      content: "";
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: 0;
      height: 1px;
      pointer-events: none;
      background: linear-gradient(90deg, transparent, var(--studio-accent-34), transparent);
      opacity: 0.54;
    }

    .studio-statusbar {
      justify-content: space-between;
      gap: 16px;
      border-top: 1px solid var(--studio-accent-14);
      border-bottom: 0;
      font-size: 12px;
      color: #b8ad99;
    }

    .studio-statusbar__meta,
    .studio-statusbar__preferences {
      display: inline-flex;
      align-items: center;
      min-width: 0;
    }

    .studio-statusbar__meta {
      gap: 16px;
      overflow: hidden;
    }

    .studio-statusbar__meta span {
      white-space: nowrap;
    }

    .studio-statusbar__preferences {
      flex: 0 0 auto;
      gap: 6px;
    }

    .studio-statusbar .studio-theme-select {
      height: 26px;
      padding: 0 7px;
      border-radius: 8px;
      background: rgba(8, 8, 7, 0.64);
    }

    .studio-statusbar .studio-theme-select__label {
      display: none;
    }

    .studio-statusbar .studio-theme-select select {
      width: 72px;
      min-height: 22px;
      font-size: 11px;
      padding-right: 16px;
    }

    .studio-statusbar .studio-language-switch {
      height: 26px;
      padding: 2px;
      border-radius: 8px;
      background: rgba(8, 8, 7, 0.64);
    }

    .studio-statusbar .studio-language-switch .studio-segment__button {
      height: 20px;
      min-height: 20px;
      padding: 0 8px;
      font-size: 10px;
    }

    .studio-topbar__group {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .studio-topbar__group--actions {
      grid-column: 3;
      justify-self: end;
      gap: 8px;
      align-self: center;
    }

    .studio-topbar__command-group,
    .studio-topbar__utility-group {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      height: 36px;
      padding: 3px;
      border-radius: 6px;
      border: 1px solid var(--studio-accent-14);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--agm-surface-dark-2) 90%, var(--studio-accent) 6%), color-mix(in srgb, var(--agm-surface-dark) 96%, #000000)),
        var(--agm-surface-dark-2);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.035),
        inset 0 -1px 0 rgba(0, 0, 0, 0.48),
        0 8px 20px rgba(0, 0, 0, 0.16);
    }

    .studio-topbar__utility-group {
      gap: 4px;
      padding-left: 4px;
      padding-right: 4px;
    }

    .studio-topbar__utility-group .studio-ghost {
      min-width: 30px;
      padding: 0 8px;
    }

    .studio-topbar__utility-group .studio-ghost--icon {
      width: 30px;
      padding: 0;
    }

    .studio-language-glyph {
      color: var(--studio-accent-text);
      font-size: 11px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: 0;
      white-space: nowrap;
    }

`;

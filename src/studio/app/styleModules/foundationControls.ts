export const foundationControlsStyles = `    .studio-ghost,
    .studio-nav__item,
    .studio-chip,
    .studio-segment__button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 32px;
      border: 1px solid transparent;
      background: transparent;
      color: #dfe7ec;
      border-radius: 6px;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 780;
      cursor: pointer;
      box-shadow: none;
      transition: transform 120ms ease, border-color 120ms ease, background-color 120ms ease, color 120ms ease, opacity 120ms ease, box-shadow 120ms ease;
    }

    .studio-topbar__command-group .studio-ghost {
      position: relative;
      min-width: 72px;
      background: color-mix(in srgb, var(--agm-surface-dark) 84%, #08111a);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
    }

    .studio-topbar__command-group .studio-ghost + .studio-ghost::before {
      content: "";
      position: absolute;
      left: -3px;
      top: 7px;
      bottom: 7px;
      width: 1px;
      background: var(--studio-accent-14);
    }

    .studio-ghost:hover:not(:disabled),
    .studio-nav__item:hover:not(:disabled),
    .studio-chip:hover:not(:disabled),
    .studio-segment__button:hover:not(:disabled) {
      transform: none;
      border-color: var(--studio-accent-48);
      background: color-mix(in srgb, var(--studio-accent) 14%, var(--agm-surface-dark-2));
      color: #f8fbfc;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.055),
        0 10px 22px rgba(0, 0, 0, 0.22);
    }

    .studio-ghost:focus-visible,
    .studio-nav__item:focus-visible,
    .studio-chip:focus-visible,
    .studio-segment__button:focus-visible,
    .studio-primary-action:focus-visible,
    .studio-input:focus-visible,
    .studio-field input:focus-visible,
    .studio-field select:focus-visible,
    .studio-stack-field select:focus-visible,
    .studio-stack-field textarea:focus-visible {
      outline: 2px solid var(--studio-accent-78);
      outline-offset: 2px;
    }

    .studio-ghost:disabled,
    .studio-nav__item:disabled,
    .studio-chip:disabled,
    .studio-segment__button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
      transform: none;
    }

    .studio-ghost__icon::before {
      content: attr(data-icon);
      color: var(--studio-accent-text);
      font-weight: 900;
    }

    .studio-ghost__icon,
    .studio-nav__svg,
    .studio-map-tool__svg {
      display: block;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.85;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex: 0 0 auto;
    }

    .studio-ghost__icon {
      width: 15px;
      height: 15px;
      color: var(--studio-accent-text);
    }

    .studio-ghost--generate {
      border-color: var(--studio-accent-34);
      background: color-mix(in srgb, var(--agm-surface-dark-2) 86%, #08111a);
      color: #dfe7ec;
    }

    .studio-ghost--export {
      border-color: var(--studio-accent-34);
      background: color-mix(in srgb, var(--agm-surface-dark-2) 86%, #08111a);
      color: #dfe7ec;
    }

    .studio-segment {
      display: inline-flex;
      gap: 6px;
    }

    .studio-language-switch {
      height: 32px;
      gap: 2px;
      padding: 3px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: color-mix(in srgb, var(--agm-surface-dark) 86%, #08111a);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
    }

    .studio-language-switch .studio-segment__button {
      min-height: 24px;
      height: 24px;
      padding: 0 10px;
      border: 0;
      background: transparent;
      color: #8fa0aa;
      font-size: 11px;
      font-weight: 850;
      border-radius: 4px;
    }

    .studio-language-switch .studio-segment__button.is-selected {
      background: var(--studio-accent-panel);
      color: #f8fbfc;
      box-shadow:
        inset 0 0 0 1px var(--studio-accent-34),
        0 6px 14px rgba(0, 0, 0, 0.18);
    }
`;

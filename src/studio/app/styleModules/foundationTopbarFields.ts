export const foundationTopbarFieldsStyles = `    .studio-topbar__context {
      grid-column: 2;
      align-self: center;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .studio-topbar-field {
      display: grid;
      align-content: center;
      gap: 2px;
      height: 36px;
      min-width: 0;
      padding: 4px 10px 5px;
      border-radius: 8px;
      border: 1px solid var(--studio-accent-14);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--agm-surface-dark-2) 90%, var(--studio-accent) 5%), color-mix(in srgb, var(--agm-surface-dark) 94%, #08111a)),
        var(--agm-surface-dark-2);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.035),
        inset 0 -1px 0 rgba(0, 0, 0, 0.45);
      transition: border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease;
    }

    .studio-topbar-field:hover,
    .studio-topbar-field:focus-within {
      border-color: var(--studio-accent-34);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--agm-surface-dark-2) 84%, var(--studio-accent) 10%), color-mix(in srgb, var(--agm-surface-dark) 92%, #08111a));
    }

    .studio-topbar-field--profile {
      flex: 0 0 150px;
    }

    .studio-topbar-field--preset {
      flex: 0 0 190px;
    }

    .studio-topbar-field--seed {
      flex: 0 0 124px;
    }

    .studio-topbar-field > span {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 9px;
      line-height: 1;
      font-weight: 900;
      letter-spacing: 0.02em;
      color: color-mix(in srgb, var(--studio-accent) 66%, #8fa0aa);
    }

    .studio-topbar-field select,
    .studio-topbar-field input {
      min-width: 0;
      width: 100%;
      height: 16px;
      border: 0;
      background: transparent;
      color: #e9eef1;
      font: inherit;
      font-size: 12px;
      line-height: 1;
      font-weight: 900;
      padding: 0;
      outline: none;
    }

    .studio-topbar-field select {
      appearance: auto;
      cursor: pointer;
    }

    .studio-topbar-field input {
      font-variant-numeric: tabular-nums;
    }

    .studio-topbar-field input:disabled {
      opacity: 0.75;
      cursor: not-allowed;
    }

    .studio-topbar-field option {
      background: var(--agm-surface-dark-2);
      color: var(--studio-text);
    }

`;

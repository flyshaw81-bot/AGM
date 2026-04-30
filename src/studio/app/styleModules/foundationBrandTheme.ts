export const foundationBrandThemeStyles = `    .studio-brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      width: 202px;
      min-width: 202px;
      height: 44px;
      padding: 0 4px;
      color: inherit;
      text-decoration: none;
      border-radius: 13px;
      transition: background-color 140ms ease, box-shadow 140ms ease;
    }

    .studio-brand:hover {
      background: var(--studio-accent-08);
      box-shadow: inset 0 0 0 1px var(--studio-accent-12);
    }

    .studio-brand__logo {
      display: block;
      width: 42px;
      height: 42px;
      flex: 0 0 42px;
      border-radius: 10px;
      object-fit: cover;
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--studio-accent) 32%, rgba(255, 255, 255, 0.12)),
        0 10px 22px rgba(0, 0, 0, 0.32);
    }

    .studio-brand__wordmark {
      display: grid;
      align-content: center;
      gap: 2px;
      min-width: 0;
      width: 134px;
      color: #fff8ec;
    }

    .studio-brand__title {
      display: block;
      font-size: 17px;
      line-height: 1;
      font-weight: 950;
      letter-spacing: 0.12em;
      white-space: nowrap;
    }

    .studio-brand__rule {
      display: block;
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--studio-accent) 74%, #fff), transparent);
      opacity: 0.82;
    }

    .studio-brand__subtitle {
      display: block;
      font-size: 9px;
      line-height: 1;
      font-weight: 760;
      letter-spacing: 0.11em;
      color: color-mix(in srgb, var(--studio-accent) 36%, #f6efe5);
      white-space: nowrap;
    }

    .studio-brand:focus-visible {
      outline: 2px solid var(--studio-accent-86);
      outline-offset: 4px;
      border-radius: 10px;
    }

    .studio-theme-select {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 32px;
      padding: 0 9px;
      border: 1px solid transparent;
      border-radius: 10px;
      background: color-mix(in srgb, var(--agm-surface-dark) 86%, #000000);
      color: color-mix(in srgb, var(--studio-accent) 48%, #cfc3ae);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.02em;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
      transition: border-color 120ms ease, background-color 120ms ease;
    }

    .studio-theme-select:hover,
    .studio-theme-select:focus-within {
      border-color: var(--studio-accent-34);
      background: color-mix(in srgb, var(--studio-accent) 10%, var(--agm-surface-dark));
    }

    .studio-theme-select__swatch {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: var(--theme-accent, var(--studio-accent));
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.18),
        0 0 14px color-mix(in srgb, var(--theme-accent, var(--studio-accent)) 45%, transparent);
    }

    .studio-theme-select select {
      width: 104px;
      min-height: 28px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--studio-text);
      font: inherit;
      font-weight: 800;
      padding: 0 20px 0 0;
      outline: none;
    }

    .studio-theme-select select:focus-visible {
      border-color: var(--studio-border-strong);
      box-shadow: 0 0 0 3px var(--studio-accent-18);
    }

    .studio-theme-select option {
      background: var(--agm-surface-dark-2);
      color: var(--studio-text);
    }

`;

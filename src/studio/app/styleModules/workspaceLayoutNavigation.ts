export const workspaceLayoutNavigationStyles = `    .studio-body {
      display: grid;
      grid-template-columns: 232px minmax(0, 1fr) 430px;
      min-height: 0;
    }

    .studio-sidebar {
      position: relative;
      z-index: 2;
      border-right: 1px solid var(--studio-accent-18);
      background: color-mix(in srgb, var(--agm-surface-dark) 92%, #000000);
      overflow: auto;
      box-shadow: none;
      scrollbar-width: thin;
      scrollbar-color: rgba(92, 122, 154, 0.56) rgba(6, 13, 22, 0.82);
    }

    .studio-sidebar--right {
      border-right: 0;
      border-left: 1px solid var(--studio-accent-16);
      padding: 14px;
      background: color-mix(in srgb, var(--agm-surface-dark) 94%, #000000);
    }

    .studio-nav-collapse-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      width: calc(100% - 28px);
      min-height: 36px;
      margin: 12px 14px 2px;
      border: 1px solid var(--studio-accent-18);
      border-radius: 7px;
      background: color-mix(in srgb, var(--agm-surface-dark-2) 88%, #000000);
      color: var(--studio-accent-text);
      font: inherit;
      font-size: 11px;
      font-weight: 850;
      padding: 0 10px;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .studio-nav-collapse-toggle:hover,
    .studio-nav-collapse-toggle:focus-visible {
      border-color: var(--studio-accent-34);
      background: var(--studio-accent-10);
      color: #fff8ec;
      outline: none;
    }

    .studio-nav-collapse-toggle__icon {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      display: block;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.85;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .studio-nav-collapse-toggle__label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 14px 12px;
    }

    .studio-nav__group-label {
      margin: 14px 14px 4px;
      color: var(--studio-accent-text);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .studio-nav__item {
      position: relative;
      justify-content: flex-start;
      min-height: 48px;
      padding: 8px 10px;
      border-radius: 7px;
      text-align: left;
      background: color-mix(in srgb, var(--agm-surface-dark-2) 86%, #000000);
    }

    .studio-nav__item.is-active::before {
      content: "";
      position: absolute;
      left: -5px;
      top: 12px;
      bottom: 12px;
      width: 3px;
      border-radius: 2px;
      background: var(--studio-accent);
    }

    .studio-nav__icon {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border-radius: 5px;
      background: var(--studio-accent-12);
      color: var(--studio-accent-text);
      font-weight: 760;
      box-shadow: none;
    }

    .studio-nav__svg {
      width: 18px;
      height: 18px;
    }

    .studio-nav__label-wrap {
      min-width: 0;
      display: grid;
      gap: 2px;
    }

    .studio-nav__label,
    .studio-nav__hint {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-nav__label {
      font-weight: 760;
    }

    .studio-nav__hint {
      font-size: 10px;
      color: #9a8d76;
    }

    .studio-app.is-nav-collapsed .studio-body {
      grid-template-columns: 72px minmax(0, 1fr) 430px;
    }

    .studio-app.is-nav-collapsed .studio-sidebar--left {
      overflow-x: hidden;
    }

    .studio-app.is-nav-collapsed .studio-nav-collapse-toggle {
      justify-content: center;
      width: 44px;
      min-height: 42px;
      margin-inline: auto;
      padding: 0;
    }

    .studio-app.is-nav-collapsed .studio-nav-collapse-toggle__label,
    .studio-app.is-nav-collapsed .studio-nav__group-label,
    .studio-app.is-nav-collapsed .studio-nav__label-wrap,
    .studio-app.is-nav-collapsed .studio-map-tools__title,
    .studio-app.is-nav-collapsed .studio-map-tool strong {
      display: none;
    }

    .studio-app.is-nav-collapsed .studio-nav {
      gap: 8px;
      padding: 8px 10px 12px;
    }

    .studio-app.is-nav-collapsed .studio-nav__item {
      justify-content: center;
      min-height: 44px;
      padding: 8px;
    }

    .studio-app.is-nav-collapsed .studio-nav__item.is-active::before {
      left: -3px;
    }

    .studio-app.is-nav-collapsed .studio-nav__icon {
      width: 30px;
      height: 30px;
    }

    .studio-app.is-nav-collapsed .studio-map-tools {
      margin: 4px 10px 14px;
      padding: 8px;
    }

    .studio-app.is-nav-collapsed .studio-map-tools__grid {
      grid-template-columns: 1fr;
    }

    .studio-app.is-nav-collapsed .studio-map-tool {
      min-height: 42px;
      padding: 8px;
    }

    .studio-map-tools {
      display: grid;
      gap: 9px;
      margin: 4px 14px 14px;
      padding: 11px;
      border: 1px solid var(--studio-accent-22);
      border-radius: 8px;
      background: linear-gradient(180deg, color-mix(in srgb, var(--studio-accent) 8%, var(--agm-surface-dark-2)), color-mix(in srgb, var(--agm-surface-dark) 94%, #000));
    }

    .studio-map-tools__title {
      color: var(--studio-accent-text);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .studio-map-tools__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .studio-map-tool {
      display: grid;
      place-items: center;
      gap: 6px;
      min-height: 76px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 7px;
      background: rgba(5, 9, 14, 0.78);
      color: #cbd7e4;
      font-weight: 850;
      cursor: pointer;
    }

    .studio-map-tool__icon {
      color: var(--studio-accent-text);
      line-height: 1;
    }

    .studio-map-tool__svg {
      width: 23px;
      height: 23px;
    }

    .studio-map-tool strong {
      font-size: 12px;
      line-height: 1;
    }

    .studio-map-tool:hover {
      border-color: var(--studio-accent-48);
      background: color-mix(in srgb, var(--studio-accent) 10%, var(--agm-surface-dark-2));
    }

    .studio-map-tool.is-active {
      border-color: var(--studio-accent-72);
      background: var(--studio-accent-panel);
      color: #ffffff;
      box-shadow: inset 0 0 0 1px var(--studio-accent-12), 0 12px 24px rgba(0, 0, 0, 0.24);
    }

`;

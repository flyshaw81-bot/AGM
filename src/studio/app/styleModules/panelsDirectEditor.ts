export const panelsDirectEditorStyles = `    .studio-direct-editor {
      --studio-direct-editor-bg: color-mix(in srgb, var(--agm-surface-dark) 88%, black);
      --studio-direct-editor-control-bg: color-mix(in srgb, var(--agm-surface-dark) 94%, black);
      --studio-direct-editor-row-bg: color-mix(in srgb, var(--agm-surface-dark-2) 90%, black);
      --studio-direct-editor-row-hover-bg: color-mix(in srgb, var(--studio-accent) 18%, var(--agm-surface-dark-2));
      --studio-direct-editor-text: var(--studio-text);
      --studio-direct-editor-text-strong: color-mix(in srgb, var(--studio-text) 94%, white);
      --studio-direct-editor-text-soft: color-mix(in srgb, var(--studio-text) 76%, var(--studio-muted));
      --studio-direct-editor-muted: var(--studio-muted);
      --studio-direct-editor-muted-strong: color-mix(in srgb, var(--studio-muted) 72%, var(--studio-text));
      --studio-direct-editor-success: color-mix(in srgb, var(--studio-green) 72%, white);
      --studio-direct-editor-warning: color-mix(in srgb, var(--studio-warning) 80%, white);
      --studio-biome-panel-text: color-mix(in srgb, var(--studio-warning) 32%, var(--studio-text));
      --studio-biome-panel-text-strong: color-mix(in srgb, var(--studio-warning) 16%, var(--studio-text));
      --studio-biome-panel-muted: color-mix(in srgb, var(--studio-warning) 30%, var(--studio-muted));
      --studio-biome-panel-row: color-mix(in srgb, var(--studio-warning) 34%, var(--studio-text));
      --studio-biome-panel-active: white;
      --studio-biome-fallback-color: color-mix(in srgb, var(--studio-cyan) 72%, white);
      border-color: rgba(78, 104, 132, 0.44);
      background: var(--studio-direct-editor-bg);
      box-shadow: none;
    }

    .studio-direct-editor__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 4px;
    }

    .studio-direct-editor__badge {
      padding: 5px 9px;
      border-radius: 999px;
      border: 1px solid rgba(79, 209, 165, 0.32);
      background: rgba(79, 209, 165, 0.13);
      color: var(--studio-direct-editor-success);
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
    }

    .studio-direct-editor__stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-top: 12px;
    }

    .studio-direct-editor__stats > div {
      padding: 10px;
      border-radius: 14px;
      border: 1px solid rgba(140, 160, 190, 0.14);
      background: rgba(8, 12, 20, 0.32);
      display: grid;
      gap: 4px;
    }

    .studio-direct-editor__stats span {
      color: var(--studio-direct-editor-muted);
      font-size: 11px;
    }

    .studio-direct-editor__stats strong {
      color: var(--studio-direct-editor-text-strong);
      font-size: 16px;
    }

    .studio-direct-state-controls {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.9fr) minmax(0, 0.9fr);
      gap: 8px;
      margin-top: 12px;
      padding: 10px;
      border-radius: 12px;
      border: 1px solid rgba(78, 104, 132, 0.34);
      background: var(--studio-direct-editor-control-bg);
    }

    .studio-direct-state-controls .studio-stack-field {
      margin-bottom: 0;
    }

    .studio-state-search-field input[type='search']::-webkit-search-cancel-button {
      cursor: pointer;
    }

    .studio-direct-states {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
      margin-top: 12px;
    }

    .studio-direct-states__list {
      display: grid;
      gap: 7px;
      max-height: 324px;
      overflow: auto;
      padding: 2px 5px 2px 0;
      scrollbar-width: thin;
      scrollbar-color: var(--studio-accent-48) rgba(8, 13, 22, 0.6);
    }

    .studio-state-row {
      width: 100%;
      display: grid;
      grid-template-columns: 12px minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border: 1px solid rgba(78, 104, 132, 0.36);
      border-radius: 12px;
      background: var(--studio-direct-editor-row-bg);
      color: var(--studio-direct-editor-text);
      text-align: left;
      cursor: pointer;
      transition: border-color 120ms ease, background-color 120ms ease;
    }

    .studio-state-row.is-active,
    .studio-state-row:hover {
      border-color: rgba(111, 151, 205, 0.62);
      background: var(--studio-direct-editor-row-hover-bg);
      transform: none;
    }

    .studio-state-row:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--studio-cyan) 88%, transparent);
      outline-offset: 2px;
    }

    .studio-state-row__swatch {
      width: 12px;
      height: 32px;
      border-radius: 999px;
      box-shadow: none;
    }

    .studio-state-row__main {
      min-width: 0;
      display: grid;
      gap: 2px;
    }

    .studio-state-row__main strong,
    .studio-state-row__main small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-state-row__main strong {
      font-size: 12px;
      color: var(--studio-direct-editor-text-strong);
    }

    .studio-state-row__main small,
    .studio-state-row__metric {
      font-size: 11px;
      color: var(--studio-direct-editor-muted);
    }

    .studio-direct-states__detail {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: 14px;
      border: 1px solid rgba(78, 104, 132, 0.4);
      background: var(--studio-direct-editor-control-bg);
      box-shadow: none;
    }

    .studio-state-inspector__hero {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      background: var(--studio-direct-editor-bg);
      border: 1px solid rgba(78, 104, 132, 0.38);
    }

    .studio-state-inspector__color-ring {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--state-color, var(--studio-accent));
      box-shadow: none;
      flex: 0 0 auto;
    }

    .studio-state-editor-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .studio-state-field {
      margin: 0;
      padding: 10px;
      border-radius: 15px;
      border: 1px solid rgba(140, 160, 190, 0.13);
      background: rgba(11, 18, 31, 0.66);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.035);
    }

    .studio-state-field span {
      color: var(--studio-direct-editor-muted-strong);
      font-size: 11px;
      font-weight: 720;
    }

    .studio-state-field input {
      min-width: 0;
      height: 34px;
      border-radius: 10px;
      border: 1px solid rgba(130, 166, 210, 0.22);
      background: rgba(5, 10, 18, 0.6);
      color: var(--studio-direct-editor-text-strong);
      padding: 0 10px;
    }

    .studio-state-field input:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--studio-cyan) 88%, transparent);
      outline-offset: 2px;
    }

    .studio-state-field input[type='color'] {
      padding: 3px;
      cursor: pointer;
    }

    .studio-state-readonly-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px 12px;
      padding: 10px;
      border-radius: 14px;
      border: 1px solid rgba(140, 160, 190, 0.12);
      background: rgba(255, 255, 255, 0.035);
    }

    .studio-state-inspector__actions {
      position: sticky;
      bottom: -14px;
      padding-top: 10px;
      background: linear-gradient(180deg, transparent, rgba(8, 12, 20, 0.92) 34%);
    }

    .studio-state-edit-status {
      display: inline-flex;
      align-items: center;
      min-height: 34px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid rgba(78, 104, 132, 0.38);
      background: var(--studio-direct-editor-control-bg);
      color: var(--studio-direct-editor-text-soft);
      font-size: 11px;
      font-weight: 700;
    }

    .studio-state-edit-status[data-status='dirty'] {
      border-color: rgba(246, 196, 83, 0.5);
      background: rgba(246, 196, 83, 0.1);
      color: var(--studio-direct-editor-warning);
    }

    .studio-state-edit-status[data-status='saved'] {
      border-color: rgba(79, 209, 165, 0.42);
      background: rgba(79, 209, 165, 0.1);
      color: var(--studio-direct-editor-success);
    }

    @supports not (color: color-mix(in srgb, red 10%, transparent)) {
      .studio-direct-states__detail {
        background: rgba(8, 12, 20, 0.46);
      }

      .studio-state-inspector__color-ring {
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08), 0 12px 28px var(--studio-accent-22);
      }
    }

    .studio-biome-insights {
      display: grid;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--studio-accent-22);
      border-radius: 14px;
      background: radial-gradient(circle at 85% 18%, var(--studio-accent-12), transparent 34%), linear-gradient(145deg, rgba(24, 21, 16, 0.96), rgba(13, 12, 10, 0.98));
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      color: var(--studio-biome-panel-text);
    }

    .studio-biome-insights__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--studio-biome-panel-text-strong);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.01em;
    }

    .studio-biome-insights__header span {
      color: var(--studio-biome-panel-muted);
      font-size: 14px;
    }

    .studio-biome-insights__body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 104px;
      align-items: start;
      gap: 14px;
    }

    .studio-biome-insights__legend {
      display: grid;
      gap: 6px;
      min-width: 0;
      max-height: 186px;
      overflow: auto;
      padding-right: 2px;
    }

    .studio-biome-insights__row {
      display: grid;
      grid-template-columns: 16px minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
      width: 100%;
      border: 1px solid transparent;
      border-radius: 999px;
      background: transparent;
      color: var(--studio-biome-panel-row);
      font: inherit;
      font-size: 12px;
      font-weight: 780;
      padding: 3px 6px;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease, transform 0.16s ease;
    }

    .studio-biome-insights__row:hover,
    .studio-biome-insights__row:focus-visible {
      border-color: var(--studio-accent-34);
      background: var(--studio-accent-10);
      color: var(--studio-biome-panel-text-strong);
      outline: none;
    }

    .studio-biome-insights__row[data-biome-active='true'] {
      border-color: color-mix(in srgb, var(--biome-color, var(--studio-biome-fallback-color)) 58%, rgba(255, 255, 255, 0.24));
      background: color-mix(in srgb, var(--biome-color, var(--studio-biome-fallback-color)) 16%, rgba(255, 255, 255, 0.08));
      color: var(--studio-biome-panel-active);
      transform: translateX(2px);
    }

    .studio-biome-insights__row[data-biome-active='true'] .studio-biome-insights__swatch {
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--biome-color) 28%, transparent), 0 0 18px color-mix(in srgb, var(--biome-color) 72%, transparent);
    }

    .studio-biome-insights__row strong {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-biome-insights__row em {
      color: var(--studio-biome-panel-muted);
      font-size: 11.5px;
      font-style: normal;
      font-variant-numeric: tabular-nums;
      font-weight: 850;
    }

    .studio-biome-insights__swatch {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: var(--biome-color);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--biome-color) 18%, transparent), 0 4px 10px color-mix(in srgb, var(--biome-color) 24%, transparent);
    }

    .studio-biome-insights__donut {
      width: 104px;
      height: 104px;
      display: grid;
      place-items: center;
      justify-self: end;
      border-radius: 999px;
      box-shadow: inset 0 0 0 1px var(--studio-accent-16), 0 16px 34px rgba(0, 0, 0, 0.3);
    }

    .studio-biome-insights__donut svg {
      width: 112px;
      height: 112px;
      overflow: visible;
      filter: drop-shadow(0 16px 24px rgba(0, 0, 0, 0.24));
    }

    .studio-biome-insights__slice {
      cursor: pointer;
      opacity: 0.9;
      stroke: rgba(7, 16, 26, 0.28);
      stroke-width: 0.8;
      transform-box: fill-box;
      transform-origin: center;
      transition: opacity 0.16s ease, stroke 0.16s ease, stroke-width 0.16s ease, transform 0.16s ease, filter 0.16s ease;
    }

    .studio-biome-insights__slice:hover,
    .studio-biome-insights__slice:focus-visible {
      opacity: 1;
      stroke: rgba(255, 255, 255, 0.82);
      stroke-width: 2;
      outline: none;
    }

    .studio-biome-insights__slice[data-biome-active='true'] {
      opacity: 1;
      stroke: var(--studio-biome-panel-active);
      stroke-width: 3;
      transform: scale(1.045);
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.55)) drop-shadow(0 0 18px var(--studio-accent-34));
    }

    .studio-biome-insights__hole {
      fill: color-mix(in srgb, var(--agm-surface-dark) 92%, black);
      stroke: var(--studio-accent-16);
      stroke-width: 1;
      filter: drop-shadow(0 0 22px rgba(0, 0, 0, 0.2));
      pointer-events: none;
    }

    .studio-biome-insights p {
      margin: 0;
      color: var(--studio-biome-panel-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .studio-biome-insights__control {
      grid-column: 1 / -1;
      display: grid;
      gap: 10px;
      border: 1px solid color-mix(in srgb, var(--biome-color, var(--studio-biome-fallback-color)) 32%, rgba(255, 255, 255, 0.12));
      border-radius: 16px;
      background: color-mix(in srgb, var(--biome-color, var(--studio-biome-fallback-color)) 10%, rgba(255, 255, 255, 0.05));
      padding: 11px;
    }

    .studio-biome-insights__editors {
      grid-column: 1 / -1;
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .studio-biome-insights__control-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      color: var(--studio-direct-editor-text-strong);
      font-size: 12px;
      font-weight: 900;
    }

    .studio-biome-insights__control-head span {
      color: color-mix(in srgb, var(--biome-color, var(--studio-biome-fallback-color)) 68%, white);
      font-variant-numeric: tabular-nums;
    }

    .studio-biome-insights__control label {
      display: grid;
      gap: 7px;
      color: var(--studio-direct-editor-text);
      font-size: 11.5px;
      font-weight: 820;
    }

    .studio-biome-insights__control input[type='range'] {
      width: 100%;
      accent-color: var(--biome-color, var(--studio-biome-fallback-color));
      cursor: ew-resize;
    }

    .studio-topbar-field,
    .studio-theme-select,
    .studio-field input,
    .studio-field select,
    .studio-stack-field select,
    .studio-stack-field textarea,
    textarea.studio-input {
      border-radius: 6px;
    }

    .studio-panel,
    .studio-biome-insights,
    .studio-advanced-section,
    .studio-direct-editor,
    .studio-state-inspector {
      border-radius: 8px;
    }

    .studio-chip,
    .studio-segment__button,
    .studio-statusbar .studio-theme-select,
    .studio-statusbar .studio-language-switch {
      border-radius: 5px;
    }

    .studio-biome-insights__row {
      border-radius: 5px;
    }

`;

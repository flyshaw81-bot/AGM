export const panelsBaseStyles = `    .studio-panel {
      background: color-mix(in srgb, var(--agm-surface-dark-2) 88%, #000000);
      border: 1px solid var(--studio-accent-22);
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 12px;
      box-shadow: none;
    }

    .studio-panel__title {
      margin: 0 0 12px;
      font-size: 13px;
      color: #fff8ec;
      letter-spacing: 0;
    }

    .studio-panel__eyebrow {
      margin-bottom: 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--studio-accent-text);
      font-weight: 760;
    }

    .studio-panel__hero {
      margin: 0 0 14px;
      font-size: 20px;
      line-height: 1.18;
      color: #ffffff;
      letter-spacing: -0.015em;
    }

    .studio-panel__text {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: #b8ad99;
    }

    .studio-panel__actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .studio-slim-panel {
      border-color: var(--studio-accent-28);
      background: linear-gradient(180deg, rgba(31, 27, 20, 0.94), rgba(18, 16, 13, 0.92));
    }

    .studio-advanced-section {
      background: rgba(9, 16, 28, 0.78);
      border: 1px solid rgba(78, 104, 132, 0.28);
      border-radius: 14px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }

    .studio-advanced-section summary {
      cursor: pointer;
      color: #dbeafe;
      font-size: 12px;
      font-weight: 760;
      list-style: none;
    }

    .studio-advanced-section summary::-webkit-details-marker {
      display: none;
    }

    .studio-advanced-section summary::after {
      content: "-";
      float: right;
      color: #7e91a8;
      font-size: 11px;
      font-weight: 680;
    }

    .studio-advanced-section[open] summary::after {
      content: "-";
    }

    .studio-advanced-section > .studio-panel {
      margin: 12px 0 0;
      border-color: rgba(78, 104, 132, 0.22);
      background: rgba(11, 23, 36, 0.72);
    }

    .studio-export-group {
      border-color: rgba(56, 189, 248, 0.22);
    }

    .studio-ghost--primary {
      background: color-mix(in srgb, var(--studio-accent) 22%, rgba(14, 12, 9, 0.94));
      border-color: color-mix(in srgb, var(--studio-accent) 48%, rgba(255, 255, 255, 0.1));
      color: white;
    }

    .studio-canvas-summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      overflow: hidden;
      border: 1px solid rgba(247, 239, 229, 0.1);
      border-radius: 12px;
      background: rgba(8, 8, 7, 0.42);
    }

    .studio-project-center .studio-canvas-summary {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .studio-canvas-summary div {
      display: grid;
      place-items: center;
      gap: 4px;
      min-height: 58px;
      padding: 8px 6px;
      text-align: center;
      border-left: 1px solid rgba(247, 239, 229, 0.08);
    }

    .studio-canvas-summary div:first-child {
      border-left: 0;
    }

    .studio-canvas-summary span {
      color: color-mix(in srgb, var(--studio-accent) 55%, var(--studio-muted));
      font-size: 11px;
      font-weight: 820;
      line-height: 1;
    }

    .studio-canvas-summary strong {
      color: #fff8ec;
      font-size: 14px;
      font-weight: 920;
      line-height: 1.05;
    }

    .studio-kv {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 12px;
      color: #9eb0c7;
      margin-bottom: 8px;
    }

    .studio-kv strong {
      color: #eef4fb;
      font-weight: 600;
    }

    .studio-code-preview {
      max-height: 220px;
      overflow: auto;
      margin: 8px 0 0;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid rgba(140, 160, 190, 0.16);
      background: rgba(8, 12, 20, 0.72);
      color: #cfe0f6;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11px;
      line-height: 1.45;
      white-space: pre-wrap;
    }

    .studio-balance-list {
      display: grid;
      gap: 8px;
      margin-top: 10px;
    }

    .studio-balance-card {
      padding: 10px;
      border-radius: 10px;
      border: 1px solid rgba(140, 160, 190, 0.16);
      background: rgba(8, 12, 20, 0.54);
    }

    .studio-balance-card--warning {
      border-color: rgba(246, 196, 83, 0.42);
      background: rgba(246, 196, 83, 0.08);
    }

    .studio-balance-card--draft {
      border-color: var(--studio-accent-34);
      background: var(--studio-accent-08);
    }

    .studio-balance-card__title {
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #eef4fb;
    }

    .studio-balance-card__refs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 8px 0;
      color: #9eb0c7;
      font-size: 11px;
    }

    .studio-balance-card__refs span {
      padding: 3px 7px;
      border-radius: 999px;
      background: rgba(140, 160, 190, 0.1);
      border: 1px solid rgba(140, 160, 190, 0.12);
    }

    .studio-balance-card__reasons {
      display: grid;
      gap: 5px;
      margin: 8px 0 0;
      padding-left: 18px;
      color: #9eb0c7;
      font-size: 11px;
      line-height: 1.45;
    }

    .studio-balance-preview {
      display: grid;
      gap: 8px;
      margin-top: 8px;
      padding: 10px;
      border-radius: 10px;
      background: rgba(8, 12, 20, 0.36);
      border: 1px solid var(--studio-accent-18);
    }

    .studio-balance-change {
      padding: 8px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid rgba(140, 160, 190, 0.12);
    }

`;

export const directWorkbenchBaseStyles = `    .studio-chip-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .studio-chip-row {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .studio-chip-pin {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      padding: 0;
      margin-left: 2px;
      border: none;
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
      opacity: 0.3;
      transition: opacity 0.15s, color 0.15s, background 0.15s;
      color: var(--studio-text);
    }

    .studio-chip-row:hover .studio-chip-pin {
      opacity: 0.55;
    }

    .studio-chip-pin:hover {
      opacity: 1 !important;
      background: color-mix(in srgb, var(--studio-accent) 12%, transparent);
    }

    .studio-chip-pin.is-pinned {
      opacity: 1;
      color: var(--studio-accent);
    }

    .studio-chip-pin__icon {
      width: 14px;
      height: 14px;
      pointer-events: none;
    }

    .studio-chip-pin__icon svg {
      width: 14px;
      height: 14px;
    }

    .studio-direct-workbench-directory__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-top: 12px;
    }

    .studio-repair-center {
      border-color: rgba(167, 139, 250, 0.32);
      background: linear-gradient(180deg, rgba(35, 24, 62, 0.86), rgba(12, 17, 28, 0.92));
    }

    .studio-repair-center .studio-direct-editor__badge {
      border-color: rgba(167, 139, 250, 0.36);
      background: rgba(167, 139, 250, 0.13);
      color: #ddd6fe;
    }

    .studio-direct-workbench-directory__summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 12px;
      padding: 10px;
      border-radius: 14px;
      border: 1px solid rgba(140, 160, 190, 0.14);
      background: rgba(8, 12, 20, 0.32);
    }

    .studio-direct-workbench-directory__summary div {
      display: grid;
      gap: 3px;
      min-width: 0;
      border: 1px solid rgba(141, 192, 255, 0.12);
      border-radius: 12px;
      background: rgba(141, 192, 255, 0.05);
      padding: 8px;
    }

    .studio-direct-workbench-directory__summary span {
      color: #9eb0c7;
      font-size: 10.5px;
      white-space: nowrap;
    }

    .studio-direct-workbench-directory__summary strong {
      min-width: 0;
      color: #eef6ff;
      font-size: 13px;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-direct-workbench-directory__summary .studio-ghost {
      min-height: 30px;
      padding: 0 10px;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__repair-health {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
      align-items: stretch;
      gap: 8px;
      margin-top: 12px;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid rgba(245, 158, 11, 0.32);
      background: rgba(82, 52, 6, 0.18);
    }

    .studio-direct-workbench-directory__repair-health[data-relationship-repair-health="ready"] {
      border-color: rgba(34, 197, 94, 0.32);
      background: rgba(8, 64, 42, 0.2);
    }

    .studio-direct-workbench-directory__repair-health div {
      display: grid;
      gap: 3px;
      min-width: 0;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(8, 12, 20, 0.22);
    }

    .studio-direct-workbench-directory__repair-health span {
      color: #a7b4c7;
      font-size: 10.5px;
      white-space: nowrap;
    }

    .studio-direct-workbench-directory__repair-health strong {
      min-width: 0;
      color: #f8fafc;
      font-size: 13px;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-direct-workbench-directory__repair-health p {
      min-width: 0;
      margin: 0;
      color: #d7deea;
      font-size: 12px;
      line-height: 1.45;
    }

    .studio-direct-workbench-directory__repair-health p strong {
      display: block;
      color: #fef3c7;
      font-size: 12px;
    }

    .studio-direct-workbench-directory__repair-health[data-relationship-repair-health="ready"] p strong {
      color: #bbf7d0;
    }

    .studio-direct-workbench-directory__repair-health .studio-ghost {
      align-self: center;
      min-height: 32px;
      padding: 0 10px;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__issues {
      display: grid;
      gap: 8px;
      margin-top: 12px;
      padding: 10px;
      border-radius: 14px;
      border: 1px solid rgba(47, 128, 255, 0.22);
      background: rgba(13, 17, 26, 0.78);
    }

    .studio-direct-workbench-directory__issues.is-healthy {
      border-color: rgba(83, 216, 143, 0.22);
    }

    .studio-direct-workbench-directory__issues-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      color: #b7becf;
      font-size: 11px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .studio-direct-workbench-directory__issues-head strong {
      color: #f7f9ff;
      font-size: 12px;
    }

    .studio-direct-workbench-directory__issues p {
      margin: 0;
      color: #9eb0c7;
      font-size: 12px;
      line-height: 1.45;
    }

`;

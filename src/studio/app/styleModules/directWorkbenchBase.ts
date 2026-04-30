export const directWorkbenchBaseStyles = `    .studio-chip-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
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

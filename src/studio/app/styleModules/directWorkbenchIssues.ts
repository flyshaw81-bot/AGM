export const directWorkbenchIssuesStyles = `    .studio-direct-workbench-directory__issue-group {
      display: grid;
      gap: 8px;
      border: 1px solid rgba(47, 128, 255, 0.18);
      border-radius: 14px;
      background: rgba(47, 128, 255, 0.045);
      padding: 8px;
    }

    .studio-direct-workbench-directory__issue-group-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .studio-direct-workbench-directory__issue-group-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 6px;
    }

    .studio-direct-workbench-directory__issue-group-main {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 0;
      background: transparent;
      color: #eaf1ff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 800;
      padding: 0;
      text-align: left;
    }

    .studio-direct-workbench-directory__issue-group-main strong {
      color: #8dc0ff;
      font-size: 12px;
    }

    .studio-direct-workbench-directory__issue-batch {
      min-height: 28px;
      padding: 0 10px;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__issue {
      display: grid;
      gap: 8px;
      width: 100%;
      border: 1px solid rgba(183, 190, 207, 0.14);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.035);
      padding: 10px;
    }

    .studio-direct-workbench-directory__issue:has(.studio-direct-workbench-directory__issue-main:hover) {
      border-color: rgba(47, 128, 255, 0.48);
      background: rgba(47, 128, 255, 0.1);
    }

    .studio-direct-workbench-directory__issue-main {
      display: grid;
      gap: 4px;
      width: 100%;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 0;
      text-align: left;
    }

    .studio-direct-workbench-directory__issue-context,
    .studio-direct-workbench-directory__issue-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }

    .studio-direct-workbench-directory__issue-context {
      color: #9eb0c7;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__issue-context-button {
      min-height: 26px;
      padding: 0 9px;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__issue-fix {
      justify-self: flex-start;
      min-height: 28px;
      padding: 0 10px;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__group-preview,
    .studio-direct-workbench-directory__issue-preview,
    .studio-direct-workbench-directory__issue-navigation,
    .studio-direct-workbench-directory__batch-guard {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(141, 192, 255, 0.18);
      border-radius: 10px;
      background: rgba(141, 192, 255, 0.07);
      color: #b7c7de;
      font-size: 11px;
      padding: 6px 8px;
    }

    .studio-direct-workbench-directory__issue-navigation {
      border-color: rgba(169, 155, 255, 0.2);
      background: rgba(169, 155, 255, 0.075);
    }

    .studio-direct-workbench-directory__batch-guard {
      border-color: rgba(255, 189, 96, 0.26);
      background: rgba(255, 189, 96, 0.08);
      color: #ffdba6;
    }

    .studio-direct-workbench-directory__issue-navigation button {
      margin-left: auto;
    }

    .studio-direct-workbench-directory__group-preview strong,
    .studio-direct-workbench-directory__issue-preview strong,
    .studio-direct-workbench-directory__issue-navigation strong,
    .studio-direct-workbench-directory__batch-guard strong {
      color: #eef6ff;
    }

    .studio-direct-workbench-directory__group-preview code,
    .studio-direct-workbench-directory__issue-preview code,
    .studio-direct-workbench-directory__issue-navigation code,
    .studio-direct-workbench-directory__batch-guard code {
      color: #8dc0ff;
      font-family: inherit;
      font-weight: 800;
    }

    .studio-direct-workbench-directory__issue-navigation code {
      color: #d8d2ff;
    }

    .studio-direct-workbench-directory__batch-guard code {
      flex: 1 0 100%;
      color: #ffdba6;
      line-height: 1.35;
    }

    .studio-direct-workbench-directory__group-preview.is-candidate {
      border-color: rgba(98, 212, 159, 0.18);
      background: rgba(98, 212, 159, 0.07);
    }

    .studio-direct-workbench-directory__group-preview.is-candidate code {
      color: #bdf4d7;
    }

    .studio-direct-workbench-directory__issue-candidates {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      padding-top: 2px;
    }

    .studio-direct-workbench-directory__issue-candidates > span {
      color: #9eb0c7;
      font-size: 11px;
      font-weight: 750;
    }

    .studio-direct-workbench-directory__issue-candidates small {
      flex: 1 0 100%;
      border-left: 2px solid rgba(98, 212, 159, 0.36);
      color: #bdf4d7;
      font-size: 11px;
      font-weight: 750;
      line-height: 1.35;
      padding-left: 8px;
    }

    .studio-direct-workbench-directory__issue-candidate-wrap {
      display: inline-flex;
      align-items: stretch;
      gap: 4px;
      max-width: 100%;
    }

    .studio-direct-workbench-directory__issue-candidate {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 26px;
      padding: 0 9px;
      border-color: rgba(47, 128, 255, 0.34);
      color: #dfe9ff;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__issue-candidate[data-candidate-recommended="true"] {
      border-color: rgba(98, 212, 159, 0.44);
      background: rgba(98, 212, 159, 0.12);
      color: #e7fff2;
    }

    .studio-direct-workbench-directory__issue-candidate-badge {
      border-radius: 999px;
      background: rgba(98, 212, 159, 0.2);
      color: #bdf4d7;
      font-size: 9.5px;
      font-weight: 900;
      letter-spacing: 0.02em;
      padding: 2px 5px;
      text-transform: uppercase;
    }

    .studio-direct-workbench-directory__issue-candidates .studio-direct-workbench-directory__issue-candidate-preview {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex: 0 1 auto;
      border: 1px solid rgba(141, 192, 255, 0.2);
      border-left: 2px solid rgba(141, 192, 255, 0.42);
      border-radius: 7px;
      background: rgba(141, 192, 255, 0.07);
      color: #cfe0fb;
      padding: 4px 7px;
      white-space: nowrap;
    }

    .studio-direct-workbench-directory__issue-candidate-preview strong {
      color: #eef6ff;
    }

    .studio-direct-workbench-directory__issue-candidate-preview code {
      color: #8dc0ff;
      font-family: inherit;
      font-weight: 800;
    }

    .studio-direct-workbench-directory__issue-candidate-preview em {
      color: #bdf4d7;
      font-style: normal;
      font-weight: 850;
    }

    .studio-direct-workbench-directory__issue-title {
      color: #f7f9ff;
      font-size: 12px;
      font-weight: 800;
    }

    .studio-direct-workbench-directory__issue-meta,
    .studio-direct-workbench-directory__issue-detail,
    .studio-direct-workbench-directory__issue-more {
      color: #9eb0c7;
      font-size: 11px;
      line-height: 1.4;
    }

    .studio-direct-workbench-directory__issue-more {
      padding: 2px 4px;
    }

    .studio-direct-workbench-directory__hidden-issues {
      display: grid;
      gap: 8px;
      border: 1px dashed rgba(255, 189, 96, 0.28);
      border-radius: 12px;
      background: rgba(255, 189, 96, 0.045);
      padding: 7px;
    }

    .studio-direct-workbench-directory__hidden-issues summary {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
      color: #ffdba6;
      cursor: pointer;
      font-size: 11px;
      font-weight: 850;
      list-style-position: inside;
    }

    .studio-direct-workbench-directory__hidden-issues summary strong {
      color: #eef6ff;
    }

    .studio-direct-workbench-directory__hidden-issues summary code {
      flex: 1 0 100%;
      color: #ffdba6;
      font-family: inherit;
      font-weight: 750;
      line-height: 1.35;
    }

    .studio-direct-workbench-directory__hidden-pagination {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .studio-direct-workbench-directory__hidden-pagination button {
      min-height: 26px;
      padding: 0 9px;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__hidden-pagination button.is-active {
      border-color: rgba(255, 189, 96, 0.42);
      background: rgba(255, 189, 96, 0.14);
      color: #fff4d8;
    }

    .studio-direct-workbench-directory__hidden-issue-list,
    .studio-direct-workbench-directory__hidden-page {
      display: grid;
      gap: 8px;
    }

    .studio-direct-workbench-directory__hidden-page[hidden] {
      display: none;
    }

    .studio-direct-workbench-directory__hidden-page-scope {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
      border: 1px solid rgba(255, 189, 96, 0.22);
      border-radius: 10px;
      background: rgba(255, 189, 96, 0.07);
      color: #ffdba6;
      font-size: 11px;
      padding: 6px 8px;
    }

    .studio-direct-workbench-directory__hidden-page-scope span {
      color: #fff4d8;
      font-weight: 850;
    }

    .studio-direct-workbench-directory__hidden-page-scope code {
      flex: 1 1 220px;
      color: #ffdba6;
      font-family: inherit;
      font-weight: 750;
      line-height: 1.35;
    }

    .studio-direct-workbench-directory__hidden-page-scope small {
      flex: 1 0 100%;
      color: #fff4d8;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.35;
    }

    .studio-direct-workbench-directory__hidden-page-scope [data-direct-relationship-hidden-page-recovery-path="true"] {
      color: #ffd08a;
    }

    .studio-direct-workbench-directory__hidden-page-scope button {
      min-height: 26px;
      padding: 0 9px;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__hidden-issue-list .studio-direct-workbench-directory__issue {
      border-style: dashed;
      background: rgba(255, 255, 255, 0.028);
    }

    .studio-direct-workbench-directory__item {
      align-items: flex-start;
      justify-content: flex-start;
      flex-direction: column;
      gap: 7px;
      min-height: 86px;
      text-align: left;
    }

    .studio-direct-workbench-directory__label {
      font-size: 12px;
      font-weight: 800;
      color: #eef6ff;
    }

    .studio-direct-workbench-directory__meta {
      display: grid;
      gap: 3px;
      color: #9eb0c7;
      font-size: 10px;
      font-weight: 650;
      line-height: 1.25;
    }

    .studio-direct-workbench-directory .studio-chip {
      justify-content: flex-start;
    }

    .studio-direct-editor.is-jump-highlight {
      border-color: var(--studio-accent-72);
      background: color-mix(in srgb, var(--studio-accent) 14%, var(--agm-surface-dark-2));
    }

    .studio-segment__button.is-selected,
    .studio-chip.is-active,
    .studio-nav__item.is-active {
      background: color-mix(in srgb, var(--studio-accent) 16%, var(--agm-surface-dark-2));
      border-color: var(--studio-accent-58);
      color: #ffffff;
    }
`;

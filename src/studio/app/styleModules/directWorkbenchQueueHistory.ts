export const directWorkbenchQueueHistoryStyles = `    .studio-direct-workbench-directory__queue-history {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      color: #aebbd2;
      font-size: 11px;
      padding: 6px 8px;
    }

    .studio-direct-workbench-directory__queue-action-scope {
      border-color: rgba(169, 155, 255, 0.22);
      background: rgba(169, 155, 255, 0.08);
      color: #d8d2ff;
      font-weight: 800;
    }

    .studio-direct-workbench-directory__queue-action-scope[data-action-state="queued"] {
      border-color: rgba(98, 212, 159, 0.3);
      background: rgba(98, 212, 159, 0.08);
      color: #bdf4d7;
    }

    .studio-direct-workbench-directory__queue-action-scope[data-action-state="conflict"] {
      border-color: rgba(255, 189, 96, 0.34);
      background: rgba(255, 189, 96, 0.1);
      color: #ffdba6;
    }

    .studio-direct-workbench-directory__queue-action-scope[data-action-state="applied"] {
      border-color: color-mix(in srgb, var(--studio-cyan) 34%, transparent);
      background: color-mix(in srgb, var(--studio-cyan) 10%, transparent);
      color: #b6fff9;
    }

    .studio-direct-workbench-directory__queue-summary {
      border-color: rgba(141, 192, 255, 0.2);
      background: rgba(141, 192, 255, 0.07);
      color: #c7d9f4;
      font-weight: 750;
    }

    .studio-direct-workbench-directory__queue-result {
      border-color: rgba(98, 212, 159, 0.28);
      background: rgba(98, 212, 159, 0.08);
      color: #bdf4d7;
      font-weight: 750;
    }

    .studio-direct-workbench-directory__queue-history {
      display: grid;
      gap: 8px;
      border-color: rgba(141, 192, 255, 0.18);
      background: rgba(141, 192, 255, 0.055);
    }

    .studio-direct-workbench-directory__queue-history summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      cursor: pointer;
      list-style: none;
    }

    .studio-direct-workbench-directory__queue-history summary::-webkit-details-marker {
      display: none;
    }

    .studio-direct-workbench-directory__queue-history summary::after {
      content: "-";
      color: #8dc0ff;
      transition: transform 0.16s ease;
    }

    .studio-direct-workbench-directory__queue-history:not([open]) summary::after {
      transform: rotate(-90deg);
    }

    .studio-direct-workbench-directory__queue-history span {
      min-width: 0;
      color: #d9e7fb;
      font-weight: 750;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-direct-workbench-directory__queue-history summary strong {
      border-radius: 999px;
      background: rgba(141, 192, 255, 0.12);
      color: #cfe0fb;
      padding: 2px 7px;
    }

    .studio-direct-workbench-directory__queue-history-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .studio-direct-workbench-directory__queue-history-action {
      min-height: 26px;
      padding: 0 9px;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__queue-history-scope {
      flex: 1 0 100%;
      border-left: 2px solid rgba(169, 155, 255, 0.36);
      color: #d8d2ff;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.35;
      padding-left: 8px;
    }

    .studio-direct-workbench-directory__queue-history-filters {
      flex: 1 0 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(141, 192, 255, 0.16);
      border-radius: 10px;
      background: rgba(5, 10, 22, 0.18);
      padding: 5px;
    }

    .studio-direct-workbench-directory__queue-history-filters .studio-ghost {
      min-height: 24px;
      padding: 0 9px;
      font-size: 10.5px;
    }

    .studio-direct-workbench-directory__queue-history-filters small {
      flex: 1 0 100%;
      color: #c9d7f4;
      font-size: 10.5px;
      font-weight: 800;
      line-height: 1.35;
    }

    .studio-direct-workbench-directory__queue-history-filters strong {
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: inherit;
      font-size: 10px;
      line-height: 1;
      padding: 2px 5px;
    }

    .studio-direct-workbench-directory__queue-history-filters .studio-ghost.is-active {
      border-color: rgba(98, 212, 159, 0.36);
      background: rgba(98, 212, 159, 0.14);
      color: #d8ffe9;
      box-shadow: inset 0 0 0 1px rgba(98, 212, 159, 0.1);
    }

    .studio-direct-workbench-directory__queue-history-filter-empty {
      flex: 1 0 100%;
      border: 1px dashed rgba(141, 192, 255, 0.2);
      border-radius: 10px;
      background: rgba(141, 192, 255, 0.06);
      color: #c9d7f4;
      font-size: 11px;
      font-weight: 800;
      padding: 7px 9px;
    }

    .studio-direct-workbench-directory__queue-history-filter-empty[hidden] {
      display: none;
    }

    .studio-direct-workbench-directory__queue-history-list {
      flex: 1 0 100%;
      display: grid;
      gap: 6px;
    }

    .studio-direct-workbench-directory__queue-history-row[hidden] {
      display: none;
    }

    .studio-direct-workbench-directory__queue-history-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      padding-top: 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .studio-direct-workbench-directory__queue-history-row em {
      border: 1px solid rgba(141, 192, 255, 0.22);
      border-radius: 999px;
      color: #91a3bf;
      font-style: normal;
      font-weight: 750;
      padding: 3px 8px;
    }

    .studio-direct-workbench-directory__queue-history-row-target {
      flex: 1 0 100%;
      color: #d8d2ff;
      font-size: 10.5px;
      font-weight: 800;
      line-height: 1.35;
    }

    .studio-direct-workbench-directory__queue-history-row em[data-history-status="undoable"] {
      border-color: rgba(98, 212, 159, 0.32);
      background: rgba(98, 212, 159, 0.1);
      color: #bdf4d7;
    }

    .studio-direct-workbench-directory__queue-history-row em[data-history-status="undone"] {
      border-color: rgba(169, 155, 255, 0.3);
      background: rgba(169, 155, 255, 0.1);
      color: #d8d2ff;
    }

    .studio-direct-workbench-directory__queue-history-row em[data-history-status="blocked"] {
      border-color: rgba(255, 189, 96, 0.36);
      background: rgba(255, 189, 96, 0.12);
      color: #ffdba6;
    }

    .studio-direct-workbench-directory__queue-history-detail {
      flex: 1 0 100%;
      display: grid;
      gap: 4px;
      padding: 6px;
      border-radius: 8px;
      background: rgba(5, 10, 22, 0.28);
    }

    .studio-direct-workbench-directory__queue-history-detail.is-compact {
      gap: 4px;
      padding: 5px 6px;
    }

    .studio-direct-workbench-directory__queue-history-detail[hidden] {
      display: none;
    }

    .studio-direct-workbench-directory__queue-history-detail p {
      margin: 0;
      color: #c6d6ee;
      font-weight: 750;
    }

    .studio-direct-workbench-directory__queue-history-batch {
      border: 1px solid rgba(141, 192, 255, 0.24);
      border-radius: 8px;
      background: rgba(141, 192, 255, 0.08);
      color: #cfe0fb;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.35;
      padding: 5px 7px;
    }

    .studio-direct-workbench-directory__queue-history-audit {
      border: 1px solid rgba(169, 155, 255, 0.24);
      border-radius: 8px;
      background: rgba(169, 155, 255, 0.08);
      color: #d8d2ff;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.35;
      padding: 5px 7px;
    }

    .studio-direct-workbench-directory__queue-history-recovery {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border: 1px solid rgba(255, 189, 96, 0.32);
      border-radius: 8px;
      background: rgba(255, 189, 96, 0.1);
      color: #ffdba6;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 7px;
    }

    .studio-direct-workbench-directory__queue-history-recovery small {
      flex: 1 0 100%;
      color: #fff4d8;
      font-size: 10.5px;
      line-height: 1.35;
    }

    .studio-direct-workbench-directory__queue-history-restore-all {
      flex: 0 0 auto;
      min-height: 24px;
      padding: 0 8px;
      font-size: 10.5px;
    }

    .studio-direct-workbench-directory__queue-history-recovery[data-recovery-state="ready"] {
      border-color: rgba(98, 212, 159, 0.32);
      background: rgba(98, 212, 159, 0.1);
      color: #bdf4d7;
    }

    .studio-direct-workbench-directory__queue-history-recovery[hidden] {
      display: none;
    }

    .studio-direct-workbench-directory__queue-history-change {
      display: grid;
      grid-template-columns: minmax(92px, 1fr) minmax(54px, 0.5fr) minmax(104px, 0.95fr) minmax(104px, 0.95fr) minmax(138px, 1.05fr);
      align-items: center;
      column-gap: 5px;
      row-gap: 3px;
    }

    .studio-direct-workbench-directory__queue-history-change strong {
      color: #f0f5ff;
    }

    .studio-direct-workbench-directory__queue-history-change code {
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.07);
      color: #dfe7ff;
      padding: 2px 5px;
      text-align: center;
    }

    .studio-direct-workbench-directory__queue-history-change span {
      color: #bfd0ea;
      font-weight: 650;
    }

    .studio-direct-workbench-directory__queue-history-change b {
      color: #8dc0ff;
    }

    .studio-direct-workbench-directory__queue-history-change small {
      grid-column: 3 / -1;
      border-left: 2px solid rgba(141, 192, 255, 0.34);
      color: #aebbd2;
      font-size: 10.5px;
      font-weight: 700;
      line-height: 1.3;
      padding-left: 7px;
    }

    .studio-direct-workbench-directory__queue-history-current {
      border: 1px solid rgba(141, 192, 255, 0.18);
      border-radius: 7px;
      padding: 2px 5px;
      background: rgba(141, 192, 255, 0.06);
    }

    .studio-direct-workbench-directory__queue-history-field-audit {
      grid-column: 1 / -1;
      border-left-color: rgba(197, 171, 255, 0.42);
      background: rgba(197, 171, 255, 0.07);
      border-radius: 7px;
      color: #d8d2ff;
      padding: 5px 7px;
    }

    .studio-direct-workbench-directory__queue-history-change[data-history-current-state="match"] .studio-direct-workbench-directory__queue-history-current {
      border-color: rgba(98, 212, 159, 0.3);
      background: rgba(98, 212, 159, 0.08);
      color: #bdf4d7;
    }

    .studio-direct-workbench-directory__queue-history-change[data-history-current-state="stale"] .studio-direct-workbench-directory__queue-history-current {
      border-color: rgba(255, 189, 96, 0.34);
      background: rgba(255, 189, 96, 0.1);
      color: #ffdba6;
    }

    .studio-direct-workbench-directory__queue-history-change[data-history-current-state="match"] small {
      border-left-color: rgba(98, 212, 159, 0.4);
      color: #bdf4d7;
    }

    .studio-direct-workbench-directory__queue-history-change[data-history-current-state="stale"] small {
      border-left-color: rgba(255, 189, 96, 0.48);
      color: #ffdba6;
    }

    .studio-direct-workbench-directory__queue-history-target {
      grid-column: 3 / 5;
      border-left-color: rgba(141, 192, 255, 0.28);
      color: #c9d7ef;
    }

    .studio-direct-workbench-directory__queue-history-change[data-history-current-state="match"] .studio-direct-workbench-directory__queue-history-target,
    .studio-direct-workbench-directory__queue-history-change[data-history-current-state="stale"] .studio-direct-workbench-directory__queue-history-target {
      border-left-color: rgba(141, 192, 255, 0.28);
      color: #c9d7ef;
    }

    .studio-direct-workbench-directory__queue-history-change-actions {
      grid-column: 5;
      display: flex;
      justify-self: end;
      gap: 5px;
    }

    .studio-direct-workbench-directory__queue-history-review-field,
    .studio-direct-workbench-directory__queue-history-restore {
      font-size: 11px;
      padding: 4px 7px;
      white-space: nowrap;
    }

    .studio-direct-workbench-directory__queue-history-restore[hidden] {
      display: none;
    }

`;

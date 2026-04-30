export const directWorkbenchQueueItemsStyles = `    .studio-direct-workbench-directory__queue-review[data-review-state="ready"] {
      border-color: rgba(98, 212, 159, 0.28);
      background: rgba(98, 212, 159, 0.08);
      color: #bdf4d7;
    }

    .studio-direct-workbench-directory__queue-review[data-review-state="conflict"] {
      border-color: rgba(255, 189, 96, 0.34);
      background: rgba(255, 189, 96, 0.1);
      color: #ffdba6;
    }

    .studio-direct-workbench-directory__queue-details[hidden] {
      display: none;
    }

    .studio-direct-workbench-directory__queue-list {
      display: grid;
      gap: 6px;
    }

    .studio-direct-workbench-directory__queue-empty {
      color: #9eb0c7;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__queue-item {
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      padding: 7px 8px;
    }

    .studio-direct-workbench-directory__queue-item.is-duplicate,
    .studio-direct-workbench-directory__queue-item.is-stale {
      border-color: rgba(255, 189, 96, 0.34);
      background: rgba(255, 189, 96, 0.08);
    }

    .studio-direct-workbench-directory__queue-item span {
      display: grid;
      gap: 3px;
      min-width: 0;
    }

    .studio-direct-workbench-directory__queue-item strong,
    .studio-direct-workbench-directory__queue-item code,
    .studio-direct-workbench-directory__queue-item em {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-direct-workbench-directory__queue-item strong {
      color: #f7f9ff;
      font-size: 11px;
    }

    .studio-direct-workbench-directory__queue-item code {
      color: #a99bff;
      font-family: inherit;
      font-size: 11px;
      font-weight: 800;
    }

    .studio-direct-workbench-directory__queue-item em {
      color: #8d9ab2;
      font-size: 10px;
      font-style: normal;
      font-weight: 750;
    }

    .studio-direct-workbench-directory__queue-item.is-duplicate em,
    .studio-direct-workbench-directory__queue-item.is-stale em {
      color: #ffdba6;
    }

    .studio-direct-workbench-directory__queue-remove {
      min-width: 28px;
      min-height: 28px;
      padding: 0;
    }

    .studio-direct-workbench-directory__queue-apply {
      justify-self: flex-start;
      min-height: 30px;
      padding: 0 12px;
      font-size: 11px;
    }

`;

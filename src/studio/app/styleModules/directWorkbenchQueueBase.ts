export const directWorkbenchQueueBaseStyles = `    .studio-direct-workbench-directory__queue {
      display: grid;
      gap: 7px;
      border: 1px solid rgba(119, 91, 255, 0.18);
      border-radius: 14px;
      background: rgba(119, 91, 255, 0.055);
      padding: 9px;
    }

    .studio-direct-workbench-directory__queue-head,
    .studio-direct-workbench-directory__queue-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .studio-direct-workbench-directory__queue-head {
      color: #dfe7ff;
      font-size: 12px;
      font-weight: 800;
    }

    .studio-direct-workbench-directory__queue-head strong {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      border-radius: 999px;
      background: rgba(169, 155, 255, 0.14);
      color: #d8d2ff;
      padding: 2px 7px;
    }

    .studio-direct-workbench-directory__queue-toggle {
      min-height: 24px;
      padding: 0 8px;
      font-size: 10.5px;
    }

    .studio-direct-workbench-directory__queue-review,
    .studio-direct-workbench-directory__queue-action-scope,
    .studio-direct-workbench-directory__queue-summary,
    .studio-direct-workbench-directory__queue-result,
`;

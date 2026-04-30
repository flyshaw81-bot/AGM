export const workspaceLayoutControlsStyles = `    .studio-field {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #9eb0c7;
    }

    .studio-stack-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 12px;
      color: #9eb0c7;
    }

    .studio-stack-field select {
      height: 34px;
      width: 100%;
      border-radius: 10px;
      border: 1px solid rgba(140, 160, 190, 0.22);
      background: rgba(11, 18, 31, 0.9);
      color: #e5edf7;
      padding: 0 10px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .studio-input,
    .studio-field input {
      height: 34px;
      width: 100%;
      border-radius: 10px;
      border: 1px solid rgba(140, 160, 190, 0.22);
      background: rgba(11, 18, 31, 0.9);
      color: #e5edf7;
      padding: 0 10px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    textarea.studio-input {
      height: auto;
      min-height: 78px;
      padding: 10px;
      resize: vertical;
      line-height: 1.45;
    }

    .studio-primary-action {
      min-height: 34px;
      border: 0;
      border-radius: 10px;
      background: var(--agm-gradient-generation);
      color: var(--agm-white);
      font-weight: 760;
      cursor: pointer;
      padding: 0 14px;
      box-shadow: none;
      transition: filter 120ms ease, opacity 120ms ease;
    }

    .studio-primary-action:hover:not(:disabled) {
      transform: none;
      filter: brightness(1.08);
    }

    .studio-field select {
      height: 34px;
      min-width: 170px;
      border-radius: 10px;
      border: 1px solid rgba(140, 160, 190, 0.22);
      background: rgba(11, 18, 31, 0.9);
      color: #e5edf7;
      padding: 0 10px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .studio-stage__toolbar .studio-field--compact > span {
      display: none;
    }

`;

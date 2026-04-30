export const workspaceLayoutSelectionStyles = `    .studio-canvas-selection-card {
      position: static;
      display: grid;
      gap: 10px;
      width: 100%;
      overflow: auto;
      border: 1px solid var(--studio-accent-34);
      border-radius: 18px;
      background: linear-gradient(145deg, rgba(9, 16, 28, 0.92), rgba(13, 22, 38, 0.84));
      color: #eaf2ff;
      padding: 14px;
      pointer-events: auto;
      box-shadow: 0 18px 36px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
    }

    .studio-canvas-selection-card__head {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 10px;
      align-items: center;
    }

    .studio-canvas-selection-card__swatch {
      width: 38px;
      height: 38px;
      border: 2px solid rgba(255, 255, 255, 0.58);
      border-radius: 12px;
      background: var(--selection-color, var(--studio-accent));
      box-shadow: 0 0 0 5px var(--studio-accent-12), 0 0 24px color-mix(in srgb, var(--selection-color, var(--studio-accent)) 58%, transparent);
    }

    .studio-canvas-selection-card small,
    .studio-canvas-selection-card em,
    .studio-canvas-selection-card__footer,
    .studio-canvas-selection-card p {
      color: #aebbd2;
      font-style: normal;
      font-size: 11px;
    }

    .studio-canvas-selection-card strong {
      display: block;
      color: #f7fbff;
      font-size: 14px;
      line-height: 1.25;
    }

    .studio-canvas-selection-card__head strong {
      font-size: 17px;
    }

    .studio-canvas-selection-card__metrics {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .studio-canvas-selection-card__metrics span {
      display: grid;
      gap: 3px;
      min-width: 0;
      border: 1px solid rgba(130, 166, 210, 0.16);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.055);
      padding: 8px;
    }

    .studio-canvas-selection-card__metrics strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-canvas-selection-card__editor {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      border-top: 1px solid rgba(130, 166, 210, 0.16);
      padding-top: 10px;
    }

    .studio-canvas-selection-card__field {
      display: grid;
      gap: 4px;
      min-width: 0;
      color: #aebbd2;
      font-size: 10px;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .studio-canvas-selection-card__field input {
      min-width: 0;
      height: 30px;
      border: 1px solid rgba(130, 166, 210, 0.22);
      border-radius: 10px;
      background: rgba(5, 10, 18, 0.62);
      color: #f7fbff;
      font: inherit;
      font-size: 12px;
      font-weight: 800;
      padding: 0 9px;
      outline: none;
      pointer-events: auto;
    }

    .studio-canvas-selection-card__field input:focus {
      border-color: var(--studio-accent-72);
      box-shadow: 0 0 0 3px var(--studio-accent-16);
    }

    .studio-canvas-selection-card__field--color input {
      padding: 3px;
    }

    .studio-canvas-selection-card__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .studio-canvas-selection-card__actions button {
      border: 1px solid var(--studio-accent-34);
      border-radius: 999px;
      background: var(--studio-accent-14);
      color: #dbeaff;
      font-size: 11px;
      font-weight: 900;
      padding: 7px 11px;
      pointer-events: auto;
      cursor: pointer;
    }

    .studio-canvas-selection-card__actions button:first-of-type {
      border-color: var(--studio-accent-48);
      background: var(--studio-accent-16);
      color: #ffe1aa;
    }

    .studio-canvas-selection-card__status {
      margin-right: auto;
      color: #93a6c3;
      font-size: 11px;
      font-weight: 850;
    }

    .studio-canvas-selection-card__status[data-status='dirty'] {
      color: #ffd27a;
    }

    .studio-canvas-selection-card__status[data-status='saved'] {
      color: #82e6ba;
    }

    .studio-canvas-selection-card__footer {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .studio-canvas-selection-card__footer span {
      border: 1px solid var(--studio-accent-18);
      border-radius: 999px;
      background: var(--studio-accent-08);
      color: #ffdca6;
      padding: 4px 8px;
      font-weight: 800;
    }

    .studio-canvas-selection-card p {
      margin: 0;
      line-height: 1.45;
    }

    .studio-canvas-tool-hud {
      position: absolute;
      left: 18px;
      bottom: 18px;
      z-index: 7;
      display: grid;
      gap: 2px;
      max-width: 220px;
      border: 1px solid rgba(130, 166, 210, 0.24);
      border-radius: 12px;
      background: rgba(8, 13, 22, 0.78);
      color: #e7f1ff;
      padding: 8px 10px;
      pointer-events: none;
      box-shadow: 0 16px 34px rgba(0, 0, 0, 0.26);
    }

    .studio-canvas-tool-hud strong {
      color: #f1bd6d;
      font-size: 12px;
    }

    .studio-canvas-tool-hud span {
      color: #aebbd2;
      font-size: 11px;
    }

    .studio-canvas-tool-hud__actions {
      display: flex;
      gap: 6px;
      margin-top: 5px;
    }

    .studio-canvas-tool-hud__actions button {
      border: 1px solid var(--studio-accent-34);
      border-radius: 999px;
      background: var(--studio-accent-12);
      color: #ffd79a;
      font-size: 10px;
      font-weight: 900;
      padding: 4px 8px;
      pointer-events: auto;
      cursor: pointer;
    }

    .studio-canvas-tool-hud__actions button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .studio-balance-focus-overlay {
      position: absolute;
      inset: 18%;
      z-index: 4;
      pointer-events: none;
      display: grid;
      place-items: center;
    }

    .studio-balance-focus-overlay.is-positioned {
      inset: auto;
      width: min(28%, 260px);
      aspect-ratio: 1;
      transform: translate(-50%, -50%);
    }

    .studio-balance-focus-overlay__ring {
      position: absolute;
      width: min(44%, 320px);
      aspect-ratio: 1;
      border-radius: 999px;
      border: 2px solid var(--studio-accent-86);
      box-shadow: 0 0 0 8px var(--studio-accent-14), 0 0 40px var(--studio-accent-48);
    }

    .studio-balance-focus-overlay.is-positioned .studio-balance-focus-overlay__ring {
      width: 100%;
    }

    .studio-balance-focus-overlay__outline {
      position: absolute;
      width: 116%;
      aspect-ratio: 1.35;
      border-radius: 42% 58% 48% 52%;
      border: 2px dashed rgba(79, 209, 165, 0.82);
      box-shadow: 0 0 28px rgba(79, 209, 165, 0.28);
      transform: rotate(-8deg);
    }

    .studio-balance-focus-overlay.is-fix .studio-balance-focus-overlay__outline {
      border-style: solid;
      border-color: rgba(246, 196, 83, 0.9);
      box-shadow: 0 0 34px rgba(246, 196, 83, 0.34);
    }

    .studio-balance-focus-overlay.is-adjust .studio-balance-focus-overlay__outline {
      border-color: var(--studio-accent-86);
      box-shadow: 0 0 34px var(--studio-accent-34);
    }

    .studio-balance-focus-overlay.is-fix .studio-balance-focus-overlay__label {
      border-color: rgba(246, 196, 83, 0.55);
    }

    .studio-balance-focus-overlay.is-adjust .studio-balance-focus-overlay__label {
      border-color: var(--studio-accent-58);
    }

    .studio-balance-focus-overlay__label {
      align-self: end;
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(8, 12, 20, 0.88);
      border: 1px solid var(--studio-accent-48);
      color: #eaf2ff;
      font-size: 12px;
      box-shadow: 0 12px 28px rgba(0,0,0,0.35);
    }

    .studio-canvas-frame[data-fit-mode='cover'] {
      box-shadow: 0 28px 96px rgba(0,0,0,0.62);
    }

    .studio-canvas-frame[data-orientation='portrait'] {
      border-radius: 24px;
    }

`;

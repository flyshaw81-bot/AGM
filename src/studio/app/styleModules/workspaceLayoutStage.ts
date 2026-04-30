export const workspaceLayoutStageStyles = `    .studio-stage {
      position: relative;
      display: grid;
      grid-template-rows: 50px minmax(0, 1fr);
      min-width: 0;
      min-height: 0;
      background: color-mix(in srgb, var(--agm-surface-dark) 92%, #000000);
    }

    .studio-stage__toolbar {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 16px;
      border-bottom: 1px solid var(--studio-accent-16);
      background: color-mix(in srgb, var(--agm-surface-dark-2) 88%, #000000);
      backdrop-filter: none;
    }

    .studio-map-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      padding: 6px;
      border-radius: 7px;
      background: color-mix(in srgb, var(--agm-surface-dark) 90%, #000000);
      border: 1px solid var(--studio-accent-22);
      overflow-x: auto;
      scrollbar-width: thin;
      box-shadow: none;
    }

    .studio-segment--viewport {
      flex: 0 0 auto;
    }

    .studio-stage__meta {
      margin-left: auto;
      font-size: 12px;
      color: #b8ad99;
    }

    .studio-stage__viewport {
      position: relative;
      min-height: 0;
      display: grid;
      place-items: center;
      padding: 10px;
      overflow: hidden;
    }

    .studio-stage__viewport:has(.studio-canvas-frame[data-fit-mode='actual-size']) {
      place-items: start center;
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--studio-accent-58) rgba(8, 13, 22, 0.72);
    }

    .studio-stage__viewport:has(.studio-canvas-frame[data-fit-mode='actual-size'])::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    .studio-stage__viewport:has(.studio-canvas-frame[data-fit-mode='actual-size'])::-webkit-scrollbar-track {
      border-radius: 999px;
      background: rgba(8, 13, 22, 0.72);
      border: 1px solid rgba(130, 166, 210, 0.12);
    }

    .studio-stage__viewport:has(.studio-canvas-frame[data-fit-mode='actual-size'])::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: linear-gradient(180deg, color-mix(in srgb, var(--studio-accent) 68%, transparent), color-mix(in srgb, var(--studio-cyan) 42%, transparent));
      border: 2px solid rgba(8, 13, 22, 0.72);
      box-shadow: 0 0 18px rgba(90, 168, 255, 0.22);
    }

    .studio-stage__viewport:has(.studio-canvas-frame[data-fit-mode='actual-size'])::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, var(--studio-accent-86), color-mix(in srgb, var(--studio-cyan) 58%, transparent));
    }

    .studio-canvas-frame-scaler {
      position: relative;
    }

    .studio-canvas-frame {
      position: relative;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 45% 40%, var(--studio-accent-12), transparent 48%),
        color-mix(in srgb, var(--agm-surface-dark) 92%, #000000);
      border-radius: 12px;
      box-shadow: inset 0 0 120px rgba(0,0,0,0.38), 0 28px 80px rgba(0,0,0,0.34);
      border: 1px solid var(--studio-accent-18);
      overflow: hidden;
      transform-origin: top left;
    }

    .studio-map-host {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      filter: saturate(1.05) contrast(1.04);
    }

    .studio-map-host[data-canvas-tool='select'] {
      cursor: crosshair;
    }

    .studio-map-host[data-canvas-tool='pan'] {
      cursor: grab;
    }

    .studio-map-host[data-canvas-tool='pan'].is-panning {
      cursor: grabbing;
    }

    .studio-map-zoom {
      position: absolute;
      right: 28px;
      bottom: 28px;
      z-index: 8;
      display: grid;
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid rgba(130, 166, 210, 0.24);
      background: rgba(8, 13, 22, 0.76);
      box-shadow: 0 16px 38px rgba(0, 0, 0, 0.32);
    }

    .studio-map-zoom button {
      width: 36px;
      height: 34px;
      border: 0;
      border-bottom: 1px solid rgba(130, 166, 210, 0.16);
      background: transparent;
      color: #e7f1ff;
      font-size: 18px;
    }

    .studio-map-zoom button:last-child {
      border-bottom: 0;
      font-size: 14px;
    }

    .studio-dialogs-host {
      position: absolute;
      inset: 24px;
      z-index: 3;
      pointer-events: none;
    }

    body.studio-enabled > #dialogs {
      position: fixed;
      inset: 0;
      z-index: 30;
      pointer-events: none;
      background: transparent !important;
    }

    body.studio-enabled > #dialogs .ui-dialog,
    body.studio-enabled > #dialogs .ui-dialog * {
      pointer-events: auto;
    }

    body.studio-enabled > #dialogs .ui-dialog {
      overflow: hidden;
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      background: var(--studio-panel-strong);
      color: var(--studio-text);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
      font-family: var(--agm-font-latin);
    }

    body.studio-enabled > #dialogs .ui-dialog-titlebar {
      display: flex;
      align-items: center;
      min-height: 44px;
      border: 0;
      border-bottom: 1px solid var(--studio-border);
      background: var(--studio-panel);
      color: var(--studio-text);
      padding: 0 12px 0 16px;
    }

    body.studio-enabled > #dialogs .ui-dialog-title {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      color: var(--studio-text);
      font-size: 13px;
      font-weight: 760;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    body.studio-enabled > #dialogs .ui-dialog-titlebar-close {
      display: inline-grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--studio-panel-strong) 82%, transparent);
      color: var(--studio-muted);
      cursor: pointer;
    }

    body.studio-enabled > #dialogs .ui-dialog-titlebar-close:hover {
      border-color: var(--studio-border-strong);
      color: var(--studio-text);
    }

    body.studio-enabled > #dialogs .ui-dialog-content {
      background: var(--studio-panel-strong);
      color: var(--studio-text);
    }

    #studioRoot[data-studio-theme="daylight"] ~ #dialogs .ui-dialog,
    html[data-studio-theme="daylight"] body.studio-enabled > #dialogs .ui-dialog {
      box-shadow: 0 22px 56px rgba(15, 23, 42, 0.18);
    }

    body.studio-enabled .studio-input-dialog {
      position: fixed;
      inset: 0;
      z-index: 48;
      font-family: var(--agm-font-latin);
      pointer-events: none;
    }

    body.studio-enabled .studio-input-dialog__scrim {
      position: absolute;
      inset: 0;
      background: rgba(5, 9, 16, 0.36);
      pointer-events: auto;
    }

    body.studio-enabled .studio-input-dialog__panel {
      position: absolute;
      top: 50%;
      left: 50%;
      display: grid;
      width: min(420px, calc(100vw - 40px));
      max-height: min(70vh, 420px);
      gap: 14px;
      overflow: auto;
      transform: translate(-50%, -50%);
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      background: var(--studio-panel-strong);
      color: var(--studio-text);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
      margin: 0;
      padding: 18px;
      pointer-events: auto;
    }

    body.studio-enabled .studio-input-dialog__label {
      color: var(--studio-text);
      font-size: 14px;
      font-weight: 720;
      line-height: 1.45;
    }

    body.studio-enabled .studio-input-dialog__input {
      width: 100% !important;
      min-height: 40px;
      box-sizing: border-box;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--studio-panel) 82%, transparent);
      color: var(--studio-text);
      padding: 0 12px;
      font: inherit;
      outline: 0;
    }

    body.studio-enabled .studio-input-dialog__input:focus {
      border-color: var(--studio-border-strong);
      box-shadow: 0 0 0 3px var(--studio-accent-12);
    }

    body.studio-enabled .studio-input-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    body.studio-enabled .studio-input-dialog__button {
      min-height: 38px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      background: var(--studio-panel);
      color: var(--studio-text);
      padding: 0 14px;
      font: inherit;
      font-weight: 720;
      cursor: pointer;
    }

    body.studio-enabled .studio-input-dialog__button--primary {
      border-color: var(--studio-border-strong);
      background: var(--studio-accent);
      color: #ffffff;
    }

    #studioRoot[data-studio-theme="daylight"] ~ .studio-input-dialog .studio-input-dialog__panel,
    html[data-studio-theme="daylight"] body.studio-enabled .studio-input-dialog__panel {
      box-shadow: 0 22px 56px rgba(15, 23, 42, 0.18);
    }

    .studio-canvas-frame__overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 2;
    }

    .studio-canvas-frame__overlay--safe-area {
      border: 1px dashed rgba(131, 169, 255, 0.3);
      margin: 5%;
      display: none;
    }

    .studio-canvas-frame__overlay--guides {
      display: none;
      background-image:
        linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 24px 24px;
      opacity: 0.35;
    }

    .studio-canvas-frame__overlay--tool-grid {
      display: none;
      background-image:
        linear-gradient(to right, var(--studio-accent-16) 1px, transparent 1px),
        linear-gradient(to bottom, var(--studio-accent-16) 1px, transparent 1px),
        linear-gradient(to right, rgba(141, 192, 255, 0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(141, 192, 255, 0.08) 1px, transparent 1px);
      background-size: 72px 72px, 72px 72px, 18px 18px, 18px 18px;
      opacity: 0.7;
    }

    .studio-canvas-frame__overlay--measure {
      display: none;
      place-items: center;
      background: linear-gradient(135deg, transparent 0 49%, var(--studio-accent-48) 49.5% 50.5%, transparent 51%), rgba(7, 12, 18, 0.16);
    }

    .studio-canvas-frame__overlay--measure span {
      border: 1px solid var(--studio-accent-34);
      border-radius: 999px;
      background: rgba(7, 12, 18, 0.78);
      color: #ffd79a;
      font-size: 12px;
      font-weight: 850;
      padding: 8px 12px;
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
    }

    .studio-canvas-paint-preview {
      position: absolute;
      inset: 0;
      z-index: 5;
      display: none;
      pointer-events: none;
    }

    .studio-canvas-paint-preview__marker {
      position: absolute;
      width: 34px;
      height: 34px;
      border: 2px solid color-mix(in srgb, var(--studio-accent) 92%, transparent);
      border-radius: 999px;
      background: radial-gradient(circle, var(--studio-accent-28), transparent 62%);
      box-shadow: 0 0 22px var(--studio-accent-34);
      transform: translate(-50%, -50%);
    }

    .studio-canvas-paint-preview[data-preview-tool='water'] .studio-canvas-paint-preview__marker {
      border-color: rgba(91, 196, 255, 0.94);
      background: radial-gradient(circle, rgba(91, 196, 255, 0.26), transparent 62%);
      box-shadow: 0 0 22px rgba(91, 196, 255, 0.32);
    }

    .studio-canvas-paint-preview[data-preview-tool='terrain'] .studio-canvas-paint-preview__marker {
      border-color: rgba(113, 225, 157, 0.94);
      background: radial-gradient(circle, rgba(113, 225, 157, 0.24), transparent 62%);
      box-shadow: 0 0 22px rgba(113, 225, 157, 0.3);
    }

    .studio-canvas-paint-preview__label {
      position: absolute;
      margin: 18px 0 0 16px;
      border: 1px solid rgba(130, 166, 210, 0.26);
      border-radius: 999px;
      background: rgba(8, 13, 22, 0.82);
      color: #e7f1ff;
      font-size: 11px;
      font-weight: 850;
      padding: 6px 9px;
      box-shadow: 0 12px 26px rgba(0, 0, 0, 0.28);
      transform: translate(0, -50%);
      white-space: nowrap;
    }

    #statesBody .is-studio-selected-state {
      fill: #ffd166 !important;
      fill-opacity: 0.38 !important;
      stroke: #fff2a8 !important;
      stroke-width: 11px !important;
      stroke-linejoin: round;
      stroke-opacity: 1 !important;
      vector-effect: non-scaling-stroke;
      filter: drop-shadow(0 0 10px rgba(255, 242, 168, 1)) drop-shadow(0 0 26px rgba(255, 180, 64, 0.96)) drop-shadow(0 0 44px rgba(90, 170, 255, 0.82));
      paint-order: stroke fill markers;
      pointer-events: none;
    }

    #statesHalo .is-studio-selected-state-border {
      stroke: #ffffff !important;
      stroke-width: 18px !important;
      stroke-opacity: 1 !important;
      vector-effect: non-scaling-stroke;
      filter: drop-shadow(0 0 14px rgba(255, 255, 255, 1)) drop-shadow(0 0 34px color-mix(in srgb, var(--studio-accent) 92%, transparent)) drop-shadow(0 0 52px rgba(255, 190, 92, 0.72));
      pointer-events: none;
    }

`;

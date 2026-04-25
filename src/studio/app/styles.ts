export function injectStudioStyles() {
  if (document.getElementById("studioShellStyles")) return;

  const style = document.createElement("style");
  style.id = "studioShellStyles";
  style.textContent = `
    body.studio-enabled {
      background: #0c111b;
      overflow: hidden;
    }

    body.studio-enabled #optionsContainer,
    body.studio-enabled #optionsTrigger,
    body.studio-enabled #loading,
    body.studio-enabled #mapOverlay {
      display: none !important;
    }

    body.studio-enabled #map {
      position: relative;
      display: block;
      background: transparent;
    }

    #studioRoot {
      position: fixed;
      inset: 0;
      z-index: 20;
      pointer-events: none;
      font-family: Inter, system-ui, sans-serif;
      color: #e5edf7;
    }

    #studioRoot * {
      box-sizing: border-box;
      pointer-events: auto;
    }

    .studio-app {
      display: grid;
      grid-template-rows: 56px minmax(0, 1fr) 32px;
      height: 100%;
      background: linear-gradient(180deg, rgba(8,12,20,0.96), rgba(8,12,20,0.88));
    }

    .studio-topbar,
    .studio-statusbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background: rgba(13, 18, 29, 0.94);
      border-bottom: 1px solid rgba(140, 160, 190, 0.14);
      backdrop-filter: blur(12px);
    }

    .studio-statusbar {
      justify-content: flex-start;
      gap: 16px;
      border-top: 1px solid rgba(140, 160, 190, 0.14);
      border-bottom: 0;
      font-size: 12px;
      color: #9eb0c7;
    }

    .studio-topbar__group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .studio-brand {
      font-weight: 700;
      letter-spacing: 0.02em;
      margin-right: 8px;
    }

    .studio-ghost,
    .studio-nav__item,
    .studio-chip,
    .studio-segment__button {
      border: 1px solid rgba(140, 160, 190, 0.18);
      background: rgba(25, 34, 52, 0.84);
      color: #dbe7f5;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 12px;
      cursor: pointer;
    }

    .studio-segment {
      display: inline-flex;
      gap: 6px;
    }

    .studio-chip-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .studio-segment__button.is-selected,
    .studio-chip.is-active,
    .studio-nav__item.is-active {
      background: rgba(70, 109, 196, 0.9);
      border-color: rgba(120, 165, 255, 0.45);
      color: white;
    }

    .studio-field {
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
      border: 1px solid rgba(140, 160, 190, 0.18);
      background: rgba(25, 34, 52, 0.84);
      color: #e5edf7;
      padding: 0 10px;
    }

    .studio-input {
      height: 34px;
      width: 100%;
      border-radius: 10px;
      border: 1px solid rgba(140, 160, 190, 0.18);
      background: rgba(25, 34, 52, 0.84);
      color: #e5edf7;
      padding: 0 10px;
    }

    .studio-field select {
      height: 34px;
      min-width: 170px;
      border-radius: 10px;
      border: 1px solid rgba(140, 160, 190, 0.18);
      background: rgba(25, 34, 52, 0.84);
      color: #e5edf7;
      padding: 0 10px;
    }

    .studio-body {
      display: grid;
      grid-template-columns: 96px minmax(0, 1fr) 312px;
      min-height: 0;
    }

    .studio-sidebar {
      border-right: 1px solid rgba(140, 160, 190, 0.12);
      background: rgba(10, 15, 25, 0.76);
      overflow: auto;
    }

    .studio-sidebar--right {
      border-right: 0;
      border-left: 1px solid rgba(140, 160, 190, 0.12);
      padding: 16px;
    }

    .studio-nav {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px 12px;
    }

    .studio-stage {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      min-width: 0;
      min-height: 0;
      background: radial-gradient(circle at top, rgba(29, 41, 68, 0.35), rgba(9, 13, 22, 0.96));
    }

    .studio-stage__toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(140, 160, 190, 0.1);
    }

    .studio-stage__meta {
      margin-left: auto;
      font-size: 12px;
      color: #91a5c0;
    }

    .studio-stage__viewport {
      position: relative;
      min-height: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      overflow: hidden;
    }

    .studio-canvas-frame {
      position: relative;
      display: grid;
      place-items: center;
      background: #101827;
      border-radius: 18px;
      box-shadow: 0 28px 80px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.08);
      overflow: hidden;
      transform-origin: center center;
    }

    .studio-legacy-map-host {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
    }

    .studio-legacy-dialogs-host {
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
      border: 2px solid rgba(110, 168, 255, 0.85);
      box-shadow: 0 0 0 8px rgba(110, 168, 255, 0.14), 0 0 40px rgba(110, 168, 255, 0.5);
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
      border-color: rgba(110, 168, 255, 0.9);
      box-shadow: 0 0 34px rgba(110, 168, 255, 0.34);
    }

    .studio-balance-focus-overlay.is-fix .studio-balance-focus-overlay__label {
      border-color: rgba(246, 196, 83, 0.55);
    }

    .studio-balance-focus-overlay.is-adjust .studio-balance-focus-overlay__label {
      border-color: rgba(110, 168, 255, 0.58);
    }

    .studio-balance-focus-overlay__label {
      align-self: end;
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(8, 12, 20, 0.88);
      border: 1px solid rgba(110, 168, 255, 0.42);
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

    .studio-panel {
      background: rgba(21, 29, 44, 0.85);
      border: 1px solid rgba(140, 160, 190, 0.12);
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 12px;
    }

    .studio-panel__title {
      margin: 0 0 12px;
      font-size: 13px;
      color: #f5f7fb;
    }

    .studio-panel__eyebrow {
      margin-bottom: 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #7f93af;
    }

    .studio-panel__hero {
      margin: 0 0 14px;
      font-size: 20px;
      line-height: 1.2;
      color: #ffffff;
    }

    .studio-panel__text {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: #9eb0c7;
    }

    .studio-panel__actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .studio-ghost--primary {
      background: rgba(70, 109, 196, 0.9);
      border-color: rgba(120, 165, 255, 0.45);
      color: white;
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
      border-color: rgba(110, 168, 255, 0.34);
      background: rgba(110, 168, 255, 0.08);
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
      border: 1px solid rgba(110, 168, 255, 0.18);
    }

    .studio-balance-change {
      padding: 8px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid rgba(140, 160, 190, 0.12);
    }
  `;
  document.head.appendChild(style);
}

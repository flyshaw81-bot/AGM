# AGM Zero-Legacy Cleanout

Date: 2026-05-09

This checkpoint upgrades the earlier self-owned product-path closeout into a
breaking zero-legacy cleanout. The goal is no longer compatibility with old FMG
entrypoints; the accepted product line is the AGM native Studio path.

## Breaking Decisions

- Old `.map` compatibility is no longer a product contract.
- Old URL load parameters are not a product contract.
- Old `window.*` editor and IO APIs are not public APIs.
- Old jQuery UI dialogs and legacy shell e2e tests are not acceptance paths.

## Deleted From Product Assets

- `public/modules/ui`
- `public/modules/dynamic`
- `public/modules/io`
- `public/versioning.js`
- `public/dropbox.html`
- Legacy-only vendor assets: jQuery, jQuery UI, touch-punch, TinyMCE, and the
  Dropbox SDK bundle.
- Legacy e2e specs that depended on `.ui-dialog`, old `edit*` globals, or old
  IO scripts.
- `src/studio/compat/LegacyUiRegistry`; deleted legacy directories are now
  guarded directly.
- jQuery UI dialog runtime usage. `EngineNoticeService` now uses an AGM-owned
  browser notice host instead of `$.dialog`.
- Dropbox product actions and bridge targets. Native Studio data actions now
  expose AGM-owned browser snapshot load/save, project download, file open,
  URL source import, and generated-world creation flows.
- Legacy export/save/load dialog markup, old export setting IDs, and the old
  alert/prompt dialog shells. Native Studio export settings and the AGM
  notice/input services now own those surfaces.
- Replaced legacy editor/tooling dialog markup, including old river/route/label
  editors, overviews, AI/notes/units, style saver, submap/transform, and native
  workbench-covered biome/province/zone/diplomacy shells.
- The last old `class="dialog"` shells and hidden runtime-control host in
  `src/index.html`. Generation-facing world settings now move through
  AGM-owned runtime values and typed targets instead of hidden form controls.
- Legacy inline `onclick` / `onchange` handlers in `src/index.html`. Static
  engine controls now bind through the AGM-owned `engine-html-control-actions`
  module.
- Population and distance-scale runtime defaults no longer require hidden
  engine form controls. The classic shell now exposes those values through the
  runtime boundary so typed generation contexts do not read zeros.
- Height exponent no longer requires a hidden engine form control. Generation
  and climate contexts now read the AGM-owned runtime value directly.
- Temperature scale no longer requires a hidden engine form control. Temperature
  conversion now reads the AGM-owned runtime unit string directly.
- Distance and height units no longer require hidden engine form controls.
  Scale-bar rendering and marker height text now read AGM-owned runtime unit
  strings directly.
- Precipitation no longer requires hidden engine form controls. Climate context,
  random option generation, and native project controls now write the AGM-owned
  runtime precipitation percentage directly.
- Map placement no longer requires hidden engine form controls. Map size,
  latitude, and longitude now move through `mapSizePercent`,
  `latitudePercent`, and `longitudePercent` runtime values, and Studio project
  controls write those values through typed targets.
- Temperature controls no longer require hidden engine form controls. The
  renderer uses an AGM-owned temperature range, while Studio project controls
  and summaries read/write `options.temperature*` through typed targets.
- Globe display compatibility is removed from the Studio climate path. Wind
  tiers now read/write `options.winds`, and climate redraw no longer checks for
  deleted `updateGlobe*` helpers.
- Runtime scalar defaults now mount through `EngineRuntimeDefaults` instead of
  a hand-written `Object.assign(window, ...)` block in `public/main.js`.
- Studio viewport-size synchronization now mounts through
  `EngineViewportSizeService`; `public/main.js` no longer owns a direct
  `window.setStudioViewportSize = ...` implementation.

## Current Guards

- `src/index.html` must not load `modules/ui`, `modules/dynamic`,
  `modules/io`, jQuery, `versioning.js`, or old legacy e2e scripts.
- Deleted public legacy directories must not return.
- Legacy-only vendor assets must not return.
- `public/main.js` must not import deleted legacy public modules.
- Product source and tests must not contain `.dialog(`, `.ui-dialog`, jQuery,
  or `globalThis.$` references outside the boundary guard.
- Package health scripts must not expose `test:e2e:legacy` or
  `test:e2e:studio:legacy-shell`.

## Current Remaining Boundary

- `public/main.js`, `public/versioning.js`, `public/modules/ui`,
  `public/modules/dynamic`, and `public/modules/io` are removed from the
  product tree and guarded against returning.
- `src/index.html` no longer loads old public modules, jQuery, jQuery UI,
  old IO/versioning scripts, or inline legacy browser handlers.
- Studio data actions use AGM-owned action ids such as
  `load-browser-snapshot`, `save-browser-snapshot`, `download-project`,
  `create-generated-world`, and `open-url-source`.
- The only long-term work intentionally outside this cleanout is clean-room
  algorithm ownership: the generated map rules are still preserved rather than
  redesigned.

## Verification

Current closeout result: all commands below passed after the emblem renderer
import boundary was decoupled from the render-adapter runtime chain and Studio
e2e assertions were aligned to the active engine runtime context.

- `npm.cmd run test -- --run src/studio/bridge/engineGlobalBoundary.test.ts`
- `npm.cmd run test -- --run`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run test:e2e:studio`

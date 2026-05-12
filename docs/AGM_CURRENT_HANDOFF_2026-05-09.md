# AGM Studio Current Handoff

Date: 2026-05-09

This document is a context handoff for continuing AGM Studio in a new
conversation. It describes the current project state, what has changed, what is
now considered product truth, and which historical edges still exist. It is not
a task assignment document.

## Project Snapshot

AGM Studio is the native editor and runtime shell for Atlas Generation Matrix.
The current product path is no longer the old FMG/jQuery compatibility shell.
The accepted product line is:

- Vite module boot from `src/index.html`.
- AGM-owned browser runtime entry in `src/modules/engine-browser-runtime-main.ts`.
- AGM-owned `EngineRuntimeContext` and `EngineWorldState` boundaries for active
  map data, generation, rendering, and runtime services.
- Native Studio shell and workbenches under `src/studio`.
- Typed bridge and adapter boundaries instead of scattered old global editor
  calls.

The current practical completion status is:

- **Product runtime path:** 100% self-owned by the agreed completion line.
- **Literal whole-repo old-word cleanup:** about 99% if tests and compile
  aliases are counted.
- **Algorithm ownership:** AGM-owned interface/context boundary is in place,
  but the generation rules themselves were preserved rather than redesigned
  from first principles.

## Current Product Truth

The product should be treated as AGM-native. These old assets are no longer
part of the product path and are deleted or guarded:

- `public/main.js`
- `public/versioning.js`
- `public/modules/ui`
- `public/modules/dynamic`
- `public/modules/io`
- jQuery, jQuery UI, touch-punch, TinyMCE, Dropbox legacy bundles
- legacy `.ui-dialog` editor flow
- legacy e2e specs that depended on old dialogs or `edit*` globals

`src/index.html` no longer loads old public UI, dynamic, IO, jQuery, jQuery UI,
versioning, or `public/main.js` scripts. It now loads the AGM-owned module boot.

## Engine And Runtime State

The current engine direction is clean-room context ownership without rewriting
map-generation rules.

Important runtime files:

- `src/modules/engine-world-state.ts`
- `src/modules/engine-runtime-context.ts`
- `src/modules/engine-runtime-active-context.ts`
- `src/modules/engine-browser-runtime-main.ts`
- `src/modules/engine-browser-runtime-globals.ts`
- `src/modules/engine-generation-pipeline.ts`
- `src/renderers/renderer-runtime-context.ts`
- `src/studio/bridge/engineBrowserPackAdapter.ts`

The intended runtime shape:

- Active map data lives in `EngineWorldState` / `EngineRuntimeContext`.
- Generation pipeline receives explicit context.
- Renderer paths prefer context/state rather than old `window.pack` style reads.
- Browser global access, where still needed, is centralized in adapters such as
  `engine-browser-runtime-globals.ts`.
- Missing runtime functions should fail clearly instead of silently hiding
  broken product paths.

Known boundary caveat:

- `src/types/global.ts` still declares `seed`, `pack`, `grid`, and `options` as
  test/fixture compile aliases.
- Several tests still set `globalThis.pack/grid/options/seed` directly.
- This is not considered product runtime dependency, but it is the remaining
  literal old-global trace if the repository is judged by full-text grep.

## Studio UI State

The accepted shell is the native Studio/V8 shell. The main structure is:

- project home
- topbar
- left navigation and canvas tools
- central map stage
- right native drawer/workbench area
- bottom layer/status bar

Important UI files:

- `src/studio/layout/nativeShell.ts`
- `src/studio/app/styleModules/experimentalV8.ts`
- `src/studio/app/styleModules/nativeShell.ts`
- `src/studio/app/studioRenderSlots.ts`
- `src/studio/app/studioRenderer.ts`
- `src/studio/app/studioRendererTargets.ts`
- direct workbenches under `src/studio/layout/direct*Workbench*.ts`

Recent UI decisions:

- No return to legacy jQuery dialogs for product workbenches.
- Top-level structure should stay stable.
- Avoid decorative over-framing, excessive capsules, and unnecessary lines.
- Keep controls compact and fixed-size where zoom could otherwise stretch them.
- Do not add new features while doing cleanup or handoff work.

Recent bug fix:

- Chinese mojibake on the project home and native shell was repaired.
- `src/index.html` title/meta mojibake was repaired.
- `src/studio/layout/nativeShell.test.ts` now guards against common mojibake
  fragments in native shell output.

## Data, IO, Export, And Project Actions

Old IO naming and old browser globals are no longer product interfaces.

Current data action names include:

- `load-browser-snapshot`
- `save-browser-snapshot`
- `download-project`
- `create-generated-world`
- `open-url-source`

Old names such as `quickLoad`, `saveMap`, `loadMapFromURL`, `uploadMap`,
`loadURL`, and old `edit*` editor action ids should not appear in product code.

AGM project/export ownership is centered around:

- `src/modules/agm-runtime-data-facade.ts`
- `src/studio/bridge/engineDataActions.ts`
- `src/studio/bridge/engineDataActionTargets.ts`
- `src/studio/bridge/engineExportTargets.ts`
- `src/studio/state/worldDocumentDraft*.ts`

Old `.map` compatibility is not a current product contract.

## Guard Rails

The most important static guard is:

- `src/studio/bridge/engineGlobalBoundary.test.ts`

It checks that deleted old public entrypoints and legacy product dependencies do
not return. It also guards old global/editor/data action strings and old script
entrypoints.

Useful grep checks:

```powershell
rg -n "modules/ui|modules/dynamic|modules/io|jquery|versioning\.js|public/main\.js|main\.js" src/index.html package.json tests src/studio/bridge/engineGlobalBoundary.test.ts
rg -n "quickLoad|saveMap|loadMapFromURL|uploadMap|loadURL|editStates|editCultures|editReligions|editBiomes|editProvinces|editZones|editDiplomacy|\.dialog\(|globalThis\.(pack|grid|options|seed)|window\.(pack|grid|options|seed)" src/modules src/studio src/renderers --glob "!**/*.test.ts"
rg -n "鍒囨|鏆|瑷|澶栬|鐢诲|缂栬|芒鈥|冒鸥|â€" src/studio src/index.html --glob "!src/studio/layout/nativeShell.test.ts"
```

Expected current result:

- Product source should not show old product-path hits.
- Tests may still show old `globalThis.pack/grid/options/seed` fixture usage.
- The mojibake grep should not hit product source.

## Validation Status

Most recent zero-legacy closeout validation in this handoff window:

```powershell
npm.cmd run test -- --run src\modules\emblem\renderer-globals.test.ts
npm.cmd run test -- --run src\modules\emblem\renderer.test.ts
npm.cmd run test -- --run src\modules\engine-render-adapter.test.ts src\studio\bridge\engineGlobalBoundary.test.ts
npm.cmd run test -- --run
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e:studio
```

All passed after the emblem renderer import-boundary fix and the Studio e2e
tests were aligned to read the active `EngineRuntimeContext` pack before
falling back to `window.pack`.

Additional targeted suites that have been used repeatedly during the cleanout:

```powershell
npm.cmd run test -- --run src\studio\bridge\engineGlobalBoundary.test.ts
npm.cmd run test -- --run src\modules\engine-runtime-context.test.ts src\modules\engine-generation-session-services.test.ts src\modules\engine-map-store.test.ts
npx.cmd playwright test tests/e2e/studio-rendering-regression.spec.ts --project=chromium
```

The browser smoke after the mojibake fix confirmed:

- page title: `AGM Studio - Atlas Generation Matrix`
- page body contains `Atlas 生成矩阵`
- common mojibake fragments were not present in rendered text

## Important Working Tree Note

The worktree is intentionally very dirty because the zero-legacy cleanout
deleted many old public files and touched many runtime/UI files. Do not assume
that a large `git status` means accidental damage.

Expected dirty categories include:

- deleted old public modules and legacy vendor files
- modified runtime/generation/rendering modules
- modified native Studio layout and bridge files
- new AGM-owned runtime service files
- new docs and tests
- deleted legacy e2e specs

Do not revert unrelated dirty changes while continuing work.

## Current User Preferences Captured In This Thread

- Use Chinese for project status and continuation work unless asked otherwise.
- Give direct progress/status numbers when asked.
- Implement changes instead of stopping at plans when the request is concrete.
- Be honest about completion boundaries: product path complete is not the same
  as literal zero historical text in every test fixture.
- Do not restart UI redesign from scratch unless explicitly requested.
- Avoid adding features while doing cleanup, validation, or handoff work.

## Conceptual Status In Plain Terms

AGM is no longer an FMG UI compatibility shell on the product path. The old
public UI, dynamic, IO, versioning, and jQuery layers are gone from the accepted
runtime. The engine has been pulled behind AGM-owned context and services. The
remaining historical trace is mainly test fixture language and preserved
generation-rule lineage, not product runtime dependency.

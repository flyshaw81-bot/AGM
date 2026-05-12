# AGM Studio Technical Debt

Date: 2026-05-08

This document tracks debt after the zero-legacy semantic closeout. Completed
legacy and compatibility cleanup items are no longer listed as P0/P1 blockers.

## Closed In Self-Owned 100

| Area | Result |
| --- | --- |
| `public/main.js` ownership | Removed from the product tree and guarded against returning. |
| Startup/load lifecycle | Moved to `EngineStartupService`. |
| Assistant toggle | Moved to `EngineAssistantService`. |
| Viewport zooming | Moved to `EngineViewportService`. |
| Canvas clear | Moved to `EngineCanvasClearService`. |
| Drag upload | Moved to `EngineDragUploadService`. |
| Water feature helpers | Moved to `EngineWaterFeatureService`. |
| Naked draw-string calls | Guarded by typed boundary tests. |
| Legacy UI/dynamic/IO modules | Removed from the product tree and guarded directly. |
| High-frequency root render | Replaced by `StudioRenderSlots` for V8 workbench updates. |
| Root render regression guard | Added boundary coverage so root `innerHTML` writes stay isolated in `StudioRenderSlots`. |
| Native shell dead files | Removed `shellStage.ts` and `shellNavigation.ts`. |
| V8/native important overrides | Reduced below 20 and guarded by style tests. |
| Runtime data names | Replaced old IO keys with the AGM-owned runtime data facade. |
| Editor action names | Replaced old `edit*` action ids with native workbench ids. |
| Data action names | Replaced old data command ids with AGM-owned project action ids. |

## Current Product Gate

The product gate is now the native Studio path:

- Native shell and direct workbenches.
- Typed runtime/service boundaries.
- No visible legacy `.ui-dialog` on the Studio product e2e path.
- No product dependency on old public UI/dynamic/IO modules, old jQuery
  dialogs, old e2e scripts, or old IO/editor action ids.
- `typecheck`, `lint`, targeted tests, build, and Studio e2e passing.

## Long-Term V4/V5 Debt

These items are intentionally outside the V2/V3 closeout gate:

| Priority | Area | Notes |
| --- | --- | --- |
| V4 | Clean-room engine | Split generation algorithms away from compatibility globals without changing map output. |
| V4 | Algorithm file size | Split large generators such as markers, states, routes, rivers, and cultures by domain. |
| V4 | CSS taxonomy | Normalize class naming across old Studio and native V8 surfaces. |
| V4 | Data mutation helpers | Continue reducing repeated mutation/writeback code where it lowers real maintenance cost. |

## Non-Goals

- Do not rewrite the map generation algorithm just to satisfy this closeout.
- Do not change `.map` export format.
- Do not revive legacy jQuery dialogs as product acceptance paths.

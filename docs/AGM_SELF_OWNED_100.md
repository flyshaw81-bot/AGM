# AGM Self-Owned 100% Closeout

Date: 2026-05-08

This checkpoint defines "100%" as the AGM-owned product path being closed out,
not as a clean-room rewrite of every map algorithm.

## Superseded By Zero-Legacy

This document is the 2026-05-08 self-owned product-path checkpoint. The
2026-05-09 zero-legacy cleanout is now the current product truth for legacy
assets and acceptance paths. In particular, old public UI/dynamic/IO modules,
jQuery UI, TinyMCE, Dropbox assets, `public/main.js`, and legacy-shell e2e
paths are no longer retained product compatibility surfaces.

## Product Acceptance Path

The accepted AGM V2/V3 product path is:

- Native Studio shell and direct editors.
- Engine startup, generation, loading, focus, viewport, canvas clear,
  regeneration, drag upload, water feature, map placement, graph lifecycle, and
  statistics services.
- Typed runtime adapters for generation, draw, mutation, render, notice,
  loading, focus, viewport, startup, and shell actions.
- Studio e2e product path without visible legacy jQuery editor dialogs.

## Historical Compatibility Boundary

At this checkpoint, these pieces were treated as compatibility rather than
product ownership debt:

- `window.*` names required by old scripts and saved-map flows.
- `public/modules/ui/*` legacy editor dialogs for compatibility sweep only.
- `public/modules/dynamic/*` legacy dynamic helpers for compatibility or
  advanced tooling only.
- jQuery UI and TinyMCE vendor assets for old tool compatibility.
- Current map data structures and generation algorithms.
- Existing `.map` export format.

The later zero-legacy cleanout deleted or disconnected the old public modules,
legacy-only vendor assets, old `.map` compatibility contract, and legacy-shell
acceptance path. Current AGM product work should follow
`AGM_CURRENT_HANDOFF_2026-05-09.md` and `AGM_ZERO_LEGACY.md`.

New AGM product work should not call legacy dialogs or naked global functions
directly. It should route through typed services, adapters, or the runtime
facade boundary.

## Completed Closeout Items

- `public/main.js` is a thin boot/runtime mount and is below the 350-line
  closeout target.
- Startup/load branches and initial DOM lifecycle orchestration moved to
  `EngineStartupService`.
- Assistant visibility moved to `EngineAssistantService`.
- Viewport zooming moved to `EngineViewportService`.
- Canvas clear moved to `EngineCanvasClearService`.
- Drag upload moved to `EngineDragUploadService`.
- Lake opening, depression lakes, and wetland classification moved to
  `EngineWaterFeatureService` while preserving public compatibility names.
- V2 generation boundary imports are guarded by `engineGlobalBoundary.test.ts`.
- Legacy UI and dynamic public modules are explicitly classified by
  `LegacyUiRegistry` so they cannot drift back into the product path silently.
- Studio rendering no longer uses the high-frequency `root.innerHTML = html`
  path; V8 workbench updates route through `StudioRenderSlots`.
- The render boundary test now guards against reintroducing Studio root
  `innerHTML` writes outside `StudioRenderSlots`.
- Dead native shell replacement files `shellStage.ts` and `shellNavigation.ts`
  were removed after reference checks.
- V8/native `!important` usage was reduced below the closeout threshold and is
  guarded by style tests.

## Long-Term V4 Work

The remaining work is no longer part of the V2/V3 self-owned closeout gate:

- Clean-room engine extraction from the compatibility-heavy algorithm layer.
- Full removal of all `window.*` mounts.
- Full replacement of old legacy UI files rather than compatibility isolation.
- Deeper algorithm modularization for rivers, markers, cultures, states, and
  routes.
- Broader CSS class taxonomy cleanup beyond the native V8 product path.

## Final Verification Set

The closeout verification set is:

- `npm.cmd run test -- --run`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run test:e2e:studio`

The former legacy-shell compatibility sweep was part of this historical
checkpoint only. It is not part of the current zero-legacy product gate.

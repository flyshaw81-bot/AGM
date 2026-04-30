# V4 Runtime Context Handoff

> **V4 review note:** This handoff is intentionally scoped to runtime/context,
> command-layer, and compatibility-boundary migration. It is not claiming that
> all public UI, jQuery dialogs, or global compatibility adapters are gone.

> **Codex current reply to V4:** 老检，收到。The current slice has moved well
> past the old Cultures/FlatQueue checkpoint: generation pipeline/session
> adapters, runtime context services, autofix command targets, entity mutation
> targets, focus/resource/canvas access targets, project climate/control/form/
> summary/action targets, layer/style targets, and data action targets are now
> documented here. The latest command-layer pass also moves the Studio app
> engine command handlers, project action handler, and shell event handler
> behind injectable target boundaries. The latest direct editor pass also moves
> entity mutation, diplomacy update, focus resolution, and document sync behind
> a direct editor target boundary. The latest autofix pass also moves project
> summary reads, world draft construction, engine preview writebacks, and
> writeback undo behind an autofix target boundary. The latest draft/export
> pass also splits world document draft construction targets from storage,
> download, blob, and engine package export targets so project exports can
> compose injected runtime summaries without touching the default global bridge.
> Draft load/import now also uses injected storage and file-text targets instead
> of direct `localStorage`/`File.text()` access on the project adapter path.
> Studio shell import targets now pass AGM draft/rules file reads through the
> same injected file-text boundary instead of binding shell imports directly to
> browser `File.text()`.
> Draft file export and JSZip loading are now behind `DraftFileIoTargets`, so
> Blob URL, download-anchor, and script injection browser APIs are isolated from
> the draft/export call sites.
> World document and engine package default target factories now compose the
> same `DraftFileIoTargets`, so project export tests can inject one file IO
> boundary for JSON, blob, and zip package paths.
> Heightmap PNG export now uses `HeightmapPngExportTargets`, isolating DOM
> canvas creation from heightmap serialization while preserving the default
> browser canvas path.
> World document and engine package default target factories now compose the
> same `HeightmapPngExportTargets`, so PNG exports and engine package heightmap
> assets can share one injected canvas boundary.
> Studio preference persistence now uses `StudioPreferenceTargets`, so
> language/theme/navigation storage and document-element writes are isolated
> behind an app-level preference adapter.
> Project center persistence now uses `ProjectCenterTargets`, so recent-project
> storage, project summary reads, and timestamp generation are isolated behind
> app-level project center adapters.
> Initial Studio state creation now uses `InitialStateTargets`, so document
> state reads, style preset reads, preset lookup, preference application, and
> project-center loading can be tested without browser globals.
> Please review whether each remaining global dependency is behind an explicit
> compatibility adapter, and keep treating AGM `window.*` module mounts
> separately from old public UI debt.

## Scope

This batch implements the first runtime-first migration slice after the direct
editor naming cleanup.

Completed:

- Added `EngineRuntimeContext` and `getGlobalEngineRuntimeContext()`.
- Connected `BiomesModule.define(context)` to explicit runtime context.
- Connected `Features.markupGrid(context)` and `Features.markupPack(context)`
  to explicit runtime context.
- Connected `Features.defineGroups(context)` to explicit runtime context.
- Connected `Lakes.getHeight(feature, context)` and the lake helpers used by
  river generation to explicit runtime context.
- Connected the first layer of `Rivers.generate(context)` to explicit runtime
  context while preserving `Rivers.generate(false)` compatibility.
- Added `generationSettings` to `EngineRuntimeContext` for `pointsCount`,
  `heightExponent`, `lakeElevationLimit`, and `resolveDepressionsSteps`.
- Added `naming` to `EngineRuntimeContext` as a narrow engine naming service.
- Removed direct DOM reads for `pointsInput.dataset.cells`,
  `heightExponentInput.value`, `lakeElevationLimitOutput`, and
  `resolveDepressionsStepsOutput` from the Lakes/Rivers generation path.
- Converted Rivers geometry helpers (`addMeandering`, `getRiverPoints`,
  `getBorderPoint`) to accept explicit runtime context while preserving existing
  fallback call shapes used by resampling.
- Converted Rivers post-generation helpers (`specify`, `getName`, `getType`,
  `getBasin`) to accept explicit runtime context while preserving existing
  fallback call shapes.
- Converted Rivers and Lakes culture-name lookups to use
  `context.naming.getCulture(...)` instead of direct `Names.getCulture(...)`.
- Connected the first layer of `Burgs.generate(context)` and
  `Burgs.shift(context)` to explicit runtime context.
- Connected `Burgs.specify(context)`, burg grouping, population calculation,
  emblem/feature assignment, and Watabou preview link helpers to explicit
  runtime context.
- Connected the main `States.generate(context)` path to explicit runtime
  context, including initial state creation, expansion, normalization, poles,
  neighbors, color assignment, campaigns, and diplomacy.
- Connected the main `Routes.generate(context)` path to explicit runtime
  context, including route cost evaluation, path segment discovery, main roads,
  trails, sea routes, points preparation, and route link generation.
- Connected the main `Religions.generate(context)` path to explicit runtime
  context, including folk religion generation, organized religion placement,
  religion naming/specification, origins, expansion settings, and center checks.
- Connected `States.defineStateForms(context)` to explicit runtime context while
  preserving existing `States.defineStateForms()` and
  `States.defineStateForms(list)` compatibility calls used by public editors.
- Connected `Provinces.generate(context)` and `Provinces.getPoles(context)` to
  explicit runtime context while preserving existing `Provinces.generate()`,
  `Provinces.generate(true)`, and `Provinces.generate(true, true)`
  compatibility calls used by public generation/editor paths.
- Connected the main `Zones.generate(context)` path to explicit runtime context
  while preserving existing `Zones.generate()` and `Zones.generate(modifier)`
  compatibility calls.
- Connected the main `Military.generate(context)` path to explicit runtime
  context while preserving existing `Military.generate()` compatibility calls.
- Connected the main `Markers.generate(context)` and `Markers.regenerate(context)`
  entrypoints to explicit runtime context while preserving existing
  no-argument compatibility calls.
- Connected the first marker legend adders to explicit runtime context:
  volcanoes, hot springs, water sources, mines, bridges, lighthouses,
  waterfalls, battlefields, dungeons, and lake monsters.
- Connected the second marker legend adders to explicit runtime context:
  sea monsters, hill monsters, sacred mountains, sacred forests, sacred
  pineries, sacred palm groves, brigands, statues, libraries, caves, portals,
  and necropolises.
- Connected the third marker event adders to explicit runtime context:
  jousts, fairs, canoes, and dances.
- Added `EngineNoteService` to `EngineRuntimeContext` as a compatibility layer
  over global `notes`.
- Added `EngineRenderAdapter` to `EngineRuntimeContext` as a compatibility
  layer for DOM-backed render cleanup.
- Added runtime adapters for route queries (`isCrossroad`, `isConnected`,
  `hasRoad`), state campaign generation, and unit labels used by marker notes.
- Routed Military regiment note cleanup and updates through `context.notes`.
- Routed Markers note writes through a module helper that uses the active
  runtime context during generation and falls back to the global adapter for old
  manual calls.
- Routed Markers manual `add(...)`, `deleteMarker(...)`, and regeneration note
  cleanup through explicit runtime context while preserving no-argument public
  compatibility.
- Routed Markers regeneration DOM removal through `context.rendering`.
- Routed Markers route-connected candidate filters through `context.routes`.
- Routed Markers battlefield campaign generation through `context.states`.
- Routed Markers lake/sea monster unit labels through `context.units`.
- Routed Markers rift habitability checks through `context.biomesData`.
- Routed Zones disease and avalanche route checks through `context.routes`.
- Routed Zones eruption note lookup through `context.notes`.
- Routed Religions expansion passage route lookup through `context.routes`.
- Routed Burgs population/features and Watabou link route metadata through
  `context.routes` while leaving manual editor route creation for command-layer
  migration.
- Routed Burgs manual add/changeGroup/remove data access through explicit
  runtime context where practical: naming, pack mutation, route connection, and
  note cleanup now flow through context adapters.
- Added `EngineRenderAdapter` methods for burg editor rendering side effects:
  cell picking, COA insertion/removal, route drawing, layer checks, burg
  icon/label draw/remove, and tip display.
- Added `EngineHeraldryService` to `EngineRuntimeContext` as a compatibility
  adapter over current COA generation/shield selection.
- Routed Burgs manual add/changeGroup/remove rendering calls through
  `context.rendering` instead of direct renderer globals where practical.
- Routed Burgs, States, and Provinces COA generation/shield selection through
  `context.heraldry`.
- Routed Cultures random shield selection through `context.heraldry` and moved
  `cultures-generator.ts` off the browser-global aggregate `../utils` import.
- Added `EngineMapStore` / `EngineMapSnapshot` to `EngineRuntimeContext` for
  map snapshot creation and resample reset.
- Routed `Resample.process(...)` snapshot creation and global map replacement
  through `context.mapStore`.
- Moved `resample.ts` off the browser-global aggregate `../utils` import.
- Routed the resample rebuild steps for grid markup, climate, pack markup, and
  ice generation through `EngineGenerationPipeline`.
- Added `EngineMapStore.getCurrentContext()` so resample can refresh its runtime
  context after replacing global `grid` / `pack`.
- Added `EngineLifecycleAdapter` for resample orchestration helpers:
  lake-depression repair, near-sea lake opening, ocean-layer drawing, map
  coordinate calculation, graph rebuild, ruler creation, and statistics.
- Routed `Resample.process(...)` lifecycle/helper calls through
  `context.lifecycle`.
- Added Burgs runtime-context tests for group changes and removal cleanup.
- Expanded Burgs runtime-context tests to cover manual add through naming,
  heraldry, route, and render adapters.
- Added a Cultures runtime-context test for random shield selection without
  browser globals.
- Routed Resample state pole refresh and route link rebuilding through runtime
  adapters instead of direct `States.getPoles()` / `Routes.buildLinks(...)`
  calls.
- Routed Resample religion restoration and province restoration through the
  refreshed runtime context after map replacement. Province pole refresh now
  calls `Provinces.getPoles(context)` instead of the no-argument global path.
- Routed Resample marker restoration and zone restoration through the refreshed
  runtime context after map replacement. Marker pruning now calls
  `Markers.deleteMarker(markerId, context)` and zone clipping uses context map
  bounds and `context.pack`.
- Routed Resample culture restoration and burg restoration through the refreshed
  runtime context after map replacement. Burg coordinate helpers now receive the
  active graph instead of reading the global `pack`.
- Routed Resample river snapshotting, river restoration, and feature-detail
  restoration through runtime context. River meander snapshots use the parent
  context before map replacement; basin refresh and feature details use the
  refreshed runtime context after replacement.
- Routed Resample primary grid copying, heightmap smoothing, and packed cell
  data restoration through the refreshed runtime context after map replacement.
- Added an optional climate adapter to `EngineRuntimeContext` and routed
  `EngineGenerationPipeline.calculateClimate(context)` through it. Resample now
  passes the refreshed runtime context into climate recalculation after map
  replacement.
- Routed `EngineGenerationPipeline.generateIce(context)` into
  `Ice.generate(context)`. The main ice generation path now reads `grid`,
  `pack`, `seed`, and map dimensions through runtime context.
- Moved `ice.ts` off the browser-global aggregate `../utils` import and guarded
  its browser global module mount.
- Routed manual Ice editor data mutations through optional runtime context.
  Iceberg/glacier redraws now flow through `context.rendering` adapter methods.
- Added an Ice runtime-context test for manual iceberg add/remove and redraw
  adapter calls.
- Moved `heightmap-generator.ts`, `names-generator.ts`,
  `ocean-layers.ts`, and `provinces-generator.ts` off the browser-global
  aggregate `../utils` import.
- Guarded browser global module mounts for Heightmap, Names, OceanLayers, and
  Resample so those modules can be imported in unit tests without `window`.
- Added lightweight no-browser import/behavior tests for Heightmap, Names, and
  OceanLayers.
- Routed `Cultures.expand(context)` through the active runtime context and
  added `cultureNeutralRate` to `EngineGenerationSettings` so the culture
  expansion pass no longer reads neutral-rate controls directly.
- Routed more of `Cultures.generate(context)` through runtime context:
  `pack`, timing, map dimensions, culture count/set/max, emblem shape, size
  variety, and name-base fallback now flow through `EngineRuntimeContext`.
- Extended `EngineNamingService` with optional base-name helpers used by
  Cultures while preserving fallback compatibility for older test contexts.
- Added a `Cultures.generate(context)` unit test that runs the generation path
  from an explicit runtime context without DOM controls.
- Routed Cultures name-base reads through the active runtime context where a
  naming adapter is available. Global `nameBases` is now a fallback, not the
  primary explicit-context path.
- Routed manual `Cultures.add(center, context)` through runtime context for
  pack mutation, culture naming, emblem shape settings, and random shield
  selection while preserving the old no-argument compatibility call.
- Added optional `EngineNoticeService` to `EngineRuntimeContext`.
- Routed Cultures extreme-climate warnings through `context.notices.showModal`
  when available, leaving the old jQuery alert dialog as the global adapter /
  compatibility fallback.
- Removed direct `alertMessage` / `$("#alert").dialog(...)` calls from
  `CulturesModule`; the module now emits notices through runtime context and
  only the default global notice adapter owns the jQuery dialog compatibility
  call.
- Replaced direct `WARN` / `ERROR` reads in Cultures with guarded
  `globalThis.WARN` / `globalThis.ERROR` checks so explicit-context tests do
  not require public runtime globals.
- Added shared test helpers for runtime note services and adapter services so
  module tests can run with explicit context instead of browser globals.
- Added `statesCount` and `manorsCount` to `generationSettings` for burg
  placement.
- Added `stateSizeVariety`, `globalGrowthRate`, and `statesGrowthRate` to
  `generationSettings` for state expansion.
- Added `religionsCount` to `generationSettings` for organized religion
  placement.
- Added `provincesRatio` to `generationSettings` for province generation.
- Added `populationSettings` to `EngineRuntimeContext` for population rate,
  urban density, and urbanization used by burg previews.
- Added `getCultureShort(...)` to `EngineNamingService` and routed burg capital
  naming through it.
- Added `getState(...)` to `EngineNamingService` and routed initial state naming
  through it.
- Routed `public/main.js` river specification through
  `EngineGenerationPipeline.specifyRivers()`.
- Routed `public/main.js` lake naming through
  `EngineGenerationPipeline.defineLakeNames()`.
- Routed `public/main.js` state generation through
  `EngineGenerationPipeline.generateStates()`.
- Routed `public/main.js` route generation through
  `EngineGenerationPipeline.generateRoutes()`.
- Routed `public/main.js` religion generation through
  `EngineGenerationPipeline.generateReligions()`.
- Routed `public/main.js` state form selection through
  `EngineGenerationPipeline.defineStateForms()`.
- Routed `public/main.js` province generation through
  `EngineGenerationPipeline.generateProvinces()`.
- Routed `public/main.js` province pole selection through
  `EngineGenerationPipeline.defineProvincePoles()`.
- Routed `public/main.js` zone generation through
  `EngineGenerationPipeline.generateZones()`.
- Routed `public/main.js` military generation through
  `EngineGenerationPipeline.generateMilitary()`.
- Routed `public/main.js` marker generation through
  `EngineGenerationPipeline.generateMarkers()`.
- Replaced `river-generator.ts` aggregate `../utils` import with direct pure
  utility imports so the module can be tested without browser globals.
- Replaced `states-generator.ts` aggregate `../utils` import with direct pure
  utility imports and guarded its browser global module mount.
- Replaced `routes-generator.ts` aggregate `../utils` import with direct pure
  utility imports and guarded its browser global module mount.
- Replaced `religions-generator.ts` aggregate `../utils` import with direct pure
  utility imports and guarded its browser global module mount.
- Guarded the Provinces browser global module mount.
- Replaced `zones-generator.ts` aggregate `../utils` import with direct pure
  utility imports and guarded its browser global module mount.
- Replaced `military-generator.ts` aggregate `../utils` import with direct pure
  utility imports and guarded its browser global module mount.
- Replaced `markers-generator.ts` aggregate `../utils` import with direct pure
  utility imports and guarded its browser global module mount.
- Added a self-owned `PriorityQueue` utility and moved States/Religions
  generation paths off the browser-global `FlatQueue`.
- Moved `pathUtils.findPath(...)` off `window.FlatQueue` and onto the
  self-owned `PriorityQueue`.
- Moved province expansion and wild-province expansion off the browser-global
  `FlatQueue` and onto the self-owned `PriorityQueue`.
- Moved disease and disaster zone expansion off the browser-global `FlatQueue`
  and onto the self-owned `PriorityQueue`.
- Moved culture expansion off the browser-global `FlatQueue` and onto the
  self-owned `PriorityQueue`.
- Removed the TypeScript global `FlatQueue` declaration from `src/types`.
- Removed the obsolete `flatqueue.js` script load from `src/index.html` and
  deleted `public/libs/flatqueue.js`.
- Preserved compatibility for `Routes.generate()` and
  `Routes.generate(lockedRoutes)` used by existing public editor tools.
- Preserved compatibility for existing `Religions.generate()` calls in public
  auto-update and editor tools.
- Added a no-global Biomes unit test.
- Added Features runtime context tests for grid markup and empty packed graph
  markup.
- Added `EngineGenerationPipelineModule`.
- Routed the current `public/main.js` generation calls for heightmap, features,
  climate, rivers, biomes, ice, cultures, and burgs through
  `EngineGenerationPipeline`.
- Added a `window.*` dependency classification map for V4 review.
- Restored product placeholder glyphs (`鈥擿) in affected Studio summaries.

## V4 Review Focus

- Verify `EngineRuntimeContext` is a real boundary start, not a claim that all
  global access is gone.
- Verify `BiomesModule.define(context)` works with explicit `grid`, `pack`, and
  `biomesData`.
- Verify `Features.markupGrid(context)` reads `grid`, `seed`, and timing through
  context.
- Verify `Features.markupPack(context)` reads `pack`, map dimensions, and timing
  through context.
- Verify `Lakes.getHeight(feature, context)` uses `context.pack.cells.h`.
- Verify `Rivers.generate(context)` preserves the existing boolean
  `allowErosion` call shape.
- Verify `EngineRuntimeContext.generationSettings` remains a compatibility
  adapter over current DOM controls, not a new settings source of truth yet.
- Verify `EngineRuntimeContext.naming` is intentionally narrow and currently
  wraps `Names.getCulture(...)` and `Names.getCultureShort(...)`.
- Verify `Burgs.generate(context)` still preserves the previous placement order
  and does not claim to migrate `Burgs.specify/add/remove`.
- Verify `Burgs.specify(context)` still preserves the previous post-generation
  order and that manual `add/remove/changeGroup` remain outside this slice.
- Verify `States.generate(context)` preserves the previous generation order and
  that `defineStateForms(...)` remains a follow-up item rather than part of this
  slice.
- Verify `Routes.generate(context)` preserves existing route generation behavior
  and that `Routes.generate(lockedRoutes)` remains compatible for old public UI
  tools.
- Verify `Religions.generate(context)` preserves existing generation order and
  that public `Religions.generate()` compatibility calls still work.
- Verify `States.defineStateForms(context)` preserves existing state-form naming
  behavior and that old list-based public editor calls still work.
- Verify `Provinces.generate(context)` preserves existing province generation
  behavior and that the boolean compatibility calls still map to
  `regenerate` / `regenerateLockedStates` correctly.
- Verify `Provinces.getPoles(context)` preserves existing pole selection while
  reading `pack` and timing through context.
- Verify `Zones.generate(context)` preserves existing zone generation behavior
  and that `Zones.generate(modifier)` remains compatible for public callers.
- Verify zone names that depend on culture short names now use
  `context.naming.getCultureShort(...)`.
- Verify `Military.generate(context)` preserves existing regiment generation,
  default option creation, note updates, and old no-argument public calls.
- Verify `Markers.generate(context)` preserves existing marker generation and
  default config reset behavior. Test-only calls may pass `resetConfig = false`
  to exercise an explicit context without requiring the full map graph.
- Verify the migrated marker adders still preserve their previous note names and
  legends while reading `pack`, `seed`, population settings, and culture names
  through context where applicable.
- Verify marker route candidate checks use `context.routes` instead of direct
  `Routes.*` globals, and that the global adapter keeps existing public calls
  working.
- Verify marker battlefields use `context.states.generateCampaign(...)` and
  lake/sea monster legends use `context.units.height`.
- Verify Zones no longer reads `Routes.*` or global `notes` directly in the
  generation path; those should flow through `context.routes` and
  `context.notes`.
- Verify Religions expansion no longer reads `Routes.getRoute(...)` directly
  and still preserves road/trail passage-cost behavior through the route
  adapter.
- Verify Burgs generation/specification no longer reads route connectivity
  globals directly. `Burgs.add(...)` now routes naming, pack access, population
  feature calculation, route connection, and rendering side effects through
  context adapters.
- Verify Burgs, States, and Provinces no longer call `COA.generate(...)` /
  `COA.getShield(...)` directly in migrated generation paths; those calls now
  go through `context.heraldry`.
- Verify Cultures random shield selection now uses `context.heraldry` and the
  module no longer imports the browser-global aggregate utility barrel.
- Verify `Resample.process(...)` no longer directly clones/replaces global
  `grid`, `pack`, and `notes`; those operations should be isolated in
  `context.mapStore`.
- Verify resample does not reuse the stale pre-reset context after map
  replacement; generation pipeline calls should use
  `context.mapStore.getCurrentContext()`.
- Verify resample rebuild no longer directly calls `Features.markupGrid()`,
  `Features.markupPack()`, `calculateTemperatures()`, or `Ice.generate()`.
- Verify resample no longer directly calls public lifecycle helpers such as
  `addLakesInDeepDepressions()`, `openNearSeaLakes()`, `OceanLayers()`,
  `calculateMapCoordinates()`, `reGraph()`, `createDefaultRuler()`, or
  `showStatistics()`.
- Verify Resample now reaches state poles, route link rebuilding, religion
  restoration, province pole refresh, culture restoration, burg restoration,
  river restoration, feature-detail restoration, marker pruning, and zone
  restoration through runtime context. Primary grid copying, heightmap
  smoothing, and packed cell data restoration should also use the refreshed
  runtime context after map replacement.
- Verify `EngineGenerationPipeline.calculateClimate(context)` now passes an
  explicit climate context into `Climate.calculateTemperatures(...)` and
  `Climate.generatePrecipitation(...)`.
- Verify `EngineGenerationPipeline.generateIce(context)` passes context to
  `Ice.generate(context)`.
- Verify manual Ice editor methods preserve old no-argument compatibility while
  accepting explicit context and using `context.rendering` for redraws.
- Verify `ice.ts` can be imported in unit tests without requiring `window`.
- Verify Heightmap, Names, OceanLayers, and Resample browser module mounts are
  guarded and no longer block unit-test imports.
- Verify `src/modules` has no aggregate `../utils` barrel import left on
  generation modules. `fonts.ts` is a browser/font-resource boundary and now
  uses direct utility imports rather than the aggregate barrel.
- Verify `EngineGenerationPipeline.generateCultures(context)` calls both
  `Cultures.generate(context)` and `Cultures.expand(context)`.
- Verify `Cultures.generate(context)` no longer requires DOM controls for
  culture count, culture set, emblem shape, size variety, timing, or map
  dimensions on the explicit-context path.
- Verify explicit-context Cultures tests do not need to seed
  `globalThis.nameBases`.
- Verify manual `Cultures.add(center, context)` uses runtime context and that
  old `Cultures.add(center)` compatibility remains available.
- Verify Cultures extreme-climate warnings can be captured through
  `EngineNoticeService` without direct DOM/jQuery access on the explicit
  context path.
- Verify `cultures-generator.ts` no longer directly references `alertMessage`,
  `#alert`, or `.dialog(...)`.
- Verify `Rivers.addMeandering(...)` remains compatible with existing resample
  calls that do not pass context.
- Verify `EngineGenerationPipeline.specifyRivers()` keeps the previous
  `Rivers.specify()` generation order.
- Verify `EngineGenerationPipeline` preserves the original generation order in
  `public/main.js`.
- Do not classify AGM module mounts like `window.Biomes`, `window.Rivers`, or
  `window.HeightmapGenerator` as old algorithms by default. See
  `docs/ENGINE_RUNTIME_WINDOW_DEPENDENCIES.md`.
- Continue flagging jQuery UI `.dialog()` in `public/modules/ui/*` as old UI
  dependency.

## Validation Run

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run test -- --run` passed: 137 test files, 457 tests.
- `npm.cmd run build` passed.
- `npm.cmd run test:e2e:studio` passed earlier in this runtime-context batch:
  154 Playwright tests. Re-run Playwright before release-candidate handoff,
  especially after UI/dialog or Studio workflow changes.

## Known Residuals

- `public/main.js` still owns high-level orchestration around the new pipeline
  calls.
- Most generation modules still rely on globals internally. Biomes, Features,
  Lakes, and the first layer of Rivers, Burgs, States, Routes, Religions,
  Provinces, Zones, Military, and the Markers entrypoint are now moved toward
  explicit context.
- Many modules still call `Names.*` directly. Rivers and Lakes now use the
  runtime naming service for culture names, and Burgs generation uses it for
  initial settlement names. States generation uses it for initial state names
  and campaign fallback names. Provinces generation now uses it for province
  names. Zones generation uses it for culture-short-based hazard names.
  Cultures, Markers, and non-generation Burgs paths are not migrated yet.
- Religion generation now uses `context.naming` for culture names in deity and
  generated religion names, and `context.routes` for expansion passage costs.
  `Religions.add(...)` remains an editor mutation path and still uses
  fallback/global context.
- State form selection now reads `pack` and timing through context on the main
  pipeline path. Public editor calls without context still fall back through the
  global runtime adapter.
- States and Religions now use the self-owned `PriorityQueue` instead of the
  browser-global `FlatQueue`.
- `src/` and `public/` no longer reference or ship `FlatQueue`.
- Route query/editor helpers (`connect`, `remove`, `generateName`, `getLength`,
  and route lookup helpers) still rely on global `pack` or rendered SVG state
  where they are not part of the pure generation path.
- Provinces generation still depends on global `Burgs.getType`, `COA`, `Alea`,
  and the existing global random-number side effect. It is context-routed, not
  fully pure yet.
- Zones generation route checks and eruption note lookup now flow through
  `context.routes` and `context.notes`. The default global context still backs
  those adapters with the existing public runtime, so this is boundary
  isolation rather than full data-store replacement.
- Military note updates now go through `context.notes`, but the default global
  context still backs that service with global `notes`.
- Marker legend adders still have compatibility-backed note persistence and DOM
  removal. Direct `Routes.*`, `States.generateCampaign`, and `heightUnit.value`
  reads have been removed from `markers-generator.ts`; those now flow through
  `context.routes`, `context.states`, and `context.units`.
- The first marker legend adders now use context for `pack`, `seed`,
  `populationSettings`, and `context.naming`. Remaining marker adders still need
  the same treatment, and all marker note persistence still writes to global
  `notes`.
- The second marker legend batch now uses context for culture naming and direct
  `pack` reads where applicable. Remaining marker residuals include manual
  `add/deleteMarker`, `notes` persistence, DOM removal, UI unit controls, and
  later event-style adders such as jousts, fairs, canoes, dances, and encounters.
- The third marker batch now uses context for burg, cell, and river reads in
  joust/fair/canoe/dance adders. `EngineNoteService` now centralizes note writes
  for Military and marker generation, but it remains a compatibility layer over
  global `notes`. Remaining marker residuals include the compatibility-backed
  global notes store and replacement of DOM-backed rendered marker lifecycle.
- A few already-corrupted marker icon/script literals were replaced with safe
  placeholders to restore reliable UTF-8 parsing after the note-service edit.
- Markers manual add/delete and regeneration cleanup now accept explicit
  runtime context. `EngineRenderAdapter` still wraps DOM removal, so rendered SVG
  lifecycle is isolated behind a compatibility adapter but not fully replaced by
  Studio rendering yet.
- Manual Burgs editor methods now accept explicit runtime context for data and
  rendering access where practical. The default global context still delegates
  these calls to existing editor/rendering globals, so this is adapter
  isolation, not a replacement of the rendered burg lifecycle yet.
- Heraldry generation is now adapter-isolated for Burgs, States, and Provinces,
  and random shield selection is adapter-isolated for Cultures. The default
  adapter still delegates to the existing global COA service.
- Resample still mutates global `grid`, `pack`, and `notes` as part of the
  existing map replacement flow through the default global `EngineMapStore`.
  This is adapter isolation, not full resample purity yet. The default
  lifecycle adapter still delegates to old public orchestration/render helpers;
  the direct calls have been removed from `resample.ts`, but the underlying
  implementation is not replaced yet. The resample steps now use runtime
  context for primary grid copying, heightmap smoothing, cell data restoration,
  river restoration, culture restoration, burg restoration, state restoration,
  route restoration, religion restoration, province restoration,
  feature-detail restoration, marker restoration, and zone restoration.
  Remaining purity work is in the default adapters themselves and in replacing
  the underlying global map replacement flow.
- Manual ice editor methods are context-capable now, but the default rendering
  adapter still delegates to existing SVG redraw helpers. This is adapter
  isolation, not a replacement of the rendered ice editor lifecycle.
- `fonts.ts` now owns only the browser font-resource compatibility adapter.
  Font registration, Google font CSS parsing, data-URI conversion, and used-font
  discovery are handled by `EngineFontResourceService`, so review remaining
  font debt as `window.*` caller migration rather than missing service
  creation.
- `EngineNoticeService` now depends on an injectable
  `EngineNoticeDialogHost`. The default `createJQueryNoticeDialogHost()` keeps
  the old `alertMessage` + jQuery dialog behavior for compatibility, but the
  notice service itself no longer calls jQuery UI directly.
- Runtime warning/error output now has an `EngineLogService` adapter. The
  default global adapter still delegates to the existing `WARN` / `ERROR`
  console gates, but Burgs, Rivers depression resolution, Religions generation,
  and Resample burg collision warnings now emit through `context.logs` instead
  of directly reading those global flags.
- Ocean layer chain errors and heightmap range validation now use safe
  module-level `globalThis.ERROR` guards instead of bare `ERROR` / `window.ERROR`.
  These modules do not yet have full runtime context inputs, so this is a
  compatibility cleanup rather than full logging adapter isolation.
- Names generation now supports injectable `NamesRuntimeAdapters` for logs and
  tips. The default global `Names` instance remains compatible with existing
  `WARN` / `ERROR` / `tip` globals, while tests can exercise validation errors
  without browser globals.
- Cultures fallback name-base errors, extreme-climate warnings, and insufficient
  livable-area generation warnings now emit through `context.logs`. The warning
  modal itself still goes through `context.notices`, with the default adapter
  delegating to the existing alert dialog.
- Runtime user feedback now has an `EngineFeedbackService`. The default global
  adapter still delegates toast-style messages to the existing `tip(...)`
  helper. `EngineRenderAdapter` no longer owns a `showTip` hook.
- Default runtime services are now explicitly constructed by
  `createGlobalNoticeService()`, `createGlobalFeedbackService()`, and
  `createGlobalLogService()`. The jQuery alert dialog dependency is centralized
  in `createGlobalNoticeService()` as isolated compatibility debt.
- Generation settings DOM reads are now centralized in
  `createGlobalGenerationSettings()`. It still reads legacy public controls, but
  the dependency is isolated behind one settings adapter factory.
- World and population settings reads are now centralized in
  `createGlobalWorldSettings()` and `createGlobalPopulationSettings()`.
  World settings now include map size, latitude, and longitude controls for
  map-coordinate calculation compatibility.
- Unit and timing compatibility reads are now centralized in
  `createGlobalUnitSettings()` and `createGlobalTimingSettings()`.
- `EngineRuntimeContext.timing` now uses the explicit `EngineTimingSettings`
  type, and `OceanModule.draw(context)` reads timing, grid, and map dimensions
  through runtime context while preserving `window.OceanLayers()` compatibility.
- `HeightmapGenerator.generate(graph, context?)` now accepts runtime context for
  timing, seed selection, and heightmap template selection. The default
  generation-settings adapter still reads `templateInput`, while the generator
  no longer reads that DOM control directly.
- `defineMapSize(heightmapTemplateId?)` now accepts explicit template selection.
  The current public generation flow reads the template once via
  `EngineGenerationPipeline.getCurrentContext().generationSettings` after option
  randomization and passes that value into map-size and lake-opening helpers,
  preserving no-argument compatibility while reducing scattered template-control
  reads.
- `showStatistics(heightmapTemplateId?)` now accepts explicit template
  selection. Public generation and resample lifecycle calls pass the active
  template value instead of forcing the statistics helper to read `templateInput`
  on those paths.
- The current `public/main.js` generation flow now creates and refreshes an
  explicit `generationContext` at grid, pack, and map-placement boundaries, then
  passes it into pipeline/lifecycle calls. This keeps the existing public
  orchestration order but reduces per-step default global context reads.
- `EngineGenerationPipeline` now exposes named orchestration phases:
  `prepareGridSurface(context)`, `prepareMapPlacement(context)`,
  `preparePackGraph(context)`, `generateTerrainFeatures(context)`, and
  `generateWorldEntities(context)`. `public/main.js` calls those phases instead
  of directly listing every module step. This is a runtime-boundary cleanup
  only; it intentionally preserves the existing generation order and leaves
  `drawScaleBar(...)` and `Names.getMapName()` in the public compatibility
  flow.
- Added `EngineLifecycleAdapter.defineMapSize(context)`. The new
  `prepareMapPlacement(context)` phase delegates map-size updates through that
  adapter, refreshes the runtime context, then calculates map coordinates and
  climate from the refreshed context.
- Added `CellRankingModule` in `src/modules/cell-ranking.ts`. It moves the
  old `rankCells()` suitability/population scoring into a context-aware AGM
  module. `public/main.js` keeps a no-argument `rankCells()` compatibility
  wrapper, but the main generation path now reaches ranking through
  `EngineGenerationPipeline.generateWorldEntities(context)`.
- Added `EngineGenerationPipeline.finalizeGeneration(context)`. The main
  generation path no longer calls `drawScaleBar(...)`, `Names.getMapName()`, or
  `showStatistics(...)` directly. Finalization is routed through render,
  naming, and lifecycle adapters while preserving the old behavior.
- Added `EngineGenerationPipeline.generateWorld(context)`. `public/main.js`
  now delegates the post-grid generation sequence through this single runtime
  pipeline entry point instead of manually chaining every phase. The remaining
  public entry responsibilities are seed setup, graph sizing, option
  randomization, and grid selection.
- Pack reset during world generation now goes through
  `context.mapStore.resetPackForGeneration()` instead of a direct
  `globalThis.pack = {}` write in `EngineGenerationPipeline`.
- Added `src/modules/engine-generation-pipeline.test.ts` to lock the
  `generateWorld(context)` phase order and verify that context refresh after
  heightmap/pack reset happens before surface, placement, graph, terrain, and
  entity generation.
- Added `EngineGenerationPipeline.prepareGenerationSession(request)`. Seed
  setup, active zoom reset, graph sizing, option randomization, and grid
  selection now live behind the runtime pipeline entry. `public/main.js` still
  keeps the outer error handling and generation timing/reporting wrapper.
- Added `EngineGenerationSessionAdapter` to `EngineRuntimeContext`.
  `prepareGenerationSession(request)` now delegates to this adapter instead of
  directly calling public session helpers. The default adapter still wraps the
  existing public `setSeed`, graph sizing, option randomization, and grid
  selection behavior.
- Added `EngineOptionsSession` and `EngineOptionsControlAdapter`. Public option
  randomization helpers now delegate to the TS module, and option lock / stored
  checks are centralized behind the adapter. The default adapter still delegates
  to current public `locked(...)` / `stored(...)` helpers as compatibility debt.
- Added `EngineOptionsWriterAdapter` so option randomization writes flow through
  one compatibility writer instead of direct scattered DOM/control assignments.
  The default writer still targets existing public controls and `options`.
- Added `EngineOptionsReaderAdapter` and `EngineOptionsNamingAdapter` so
  template/culture-set reads and era naming are injectable. Default adapters
  still wrap current globals (`heightmapTemplates`, `Names`, `nameBases`) as
  compatibility debt.
- Added `EngineRuntimeContext.optionsSession`. Generation session preparation
  now receives the active context and uses `context.optionsSession` for option
  randomization when available, instead of always reaching for the global
  options singleton.
- Added `EngineRuntimeContext.seedSession` and
  `EngineRuntimeContext.graphSession`. Generation session preparation now uses
  context-provided seed/graph services when available, falling back to the
  global `EngineSeedSession` / `EngineGraphSession` singletons only for
  compatibility calls.
- Added `EngineRuntimeContext.gridSession`. Grid regeneration checks, grid
  creation, request-provided graph selection, and stale heightmap cleanup now
  live behind this runtime service. The default service still mutates
  `globalThis.grid` as compatibility debt.
- Added `EngineRuntimeContext.sessionLifecycle`. Active-view reset during
  generation preparation now flows through `context.sessionLifecycle`, with the
  default implementation still delegating to `invokeActiveZooming()` as
  compatibility debt.
- Added `createGlobalGenerationSessionServices()` as the grouped default service
  factory for session preparation. This keeps fallback seed/graph/options/grid
  services centralized instead of creating them piecemeal inside
  `prepare(...)`.
- Moved generation-session service types and factories into
  `src/modules/engine-generation-session-services.ts`. V4 should review this
  module as the session-preparation compatibility boundary.
- Added dedicated tests for `engine-generation-session-services.ts`, including
  default service assembly, full runtime-context service priority, and fallback
  stale-heightmap cleanup. The fallback services are now created lazily, so a
  complete injected context does not require global session singletons.
- Moved generation settings into `src/modules/engine-generation-settings.ts`.
  The adapter still reads current public controls and global inputs for
  compatibility, but `engine-runtime-context.ts` no longer owns those DOM reads
  inline. Added focused tests for default values and explicit control reads.
- Moved world, population, unit, and timing settings into
  `src/modules/engine-runtime-settings.ts`. These are still compatibility
  adapters over current globals/controls, but the runtime context assembler now
  only wires them into `EngineRuntimeContext`.
- Moved global climate-context construction into
  `src/modules/engine-climate-context.ts`. Both `getGlobalEngineRuntimeContext()`
  and `Climate.getGlobalClimateRuntimeContext()` now use the same adapter,
  avoiding duplicate reads of `heightExponentInput`, `pointsInput`, `precInput`,
  `DEBUG.temperature`, and `TIME`. Added focused tests for explicit climate
  globals and default-control fallback values.
- Moved lifecycle adapter construction into
  `src/modules/engine-lifecycle-adapter.ts`. The adapter now receives a
  `getCurrentContext` provider, so it can preserve no-argument compatibility
  without importing `getGlobalEngineRuntimeContext()` directly. Added focused
  tests for explicit runtime context forwarding, fallback current-context
  forwarding, and no-argument graph/ruler public calls.
- Moved map snapshot/reset behavior into `src/modules/engine-map-store.ts`.
  `EngineMapStore` now composes an injectable runtime adapter for grid/pack/note
  reads and writes. The default adapter still mutates global `grid`, `pack`, and
  `notes` for current generation/resample compatibility, but injected stores can
  run without touching `globalThis.pack`. Added focused tests for structured
  snapshots, generation pack reset, resample reset, injected current-context
  access, and no-global injected adapter behavior.
- Moved note persistence into `src/modules/engine-note-service.ts`.
  `EngineNoteService` now composes an injectable note storage adapter. The
  default adapter still backs onto global `notes`, but injected services can run
  without touching global note state. Added focused tests for note reads, writes,
  filtering, splice behavior, and injected no-global storage behavior.
- Moved DOM/SVG render compatibility into
  `src/modules/engine-render-adapter.ts`. `EngineRenderAdapter` still delegates
  to existing `window.findCell`, COA renderer, route drawing, layer checks,
  burg icon/label helpers, DOM removal, ice redraws, and scale-bar drawing, but
  these side effects are no longer inline in `engine-runtime-context.ts`. Added
  focused tests for map/burg rendering calls, COA/element removal, ice redraws,
  and scale-bar forwarding.
- Moved notice modal/error handling into `src/modules/engine-notice-service.ts`.
  The notice service now depends on `EngineNoticeDialogHost`; only the default
  `createJQueryNoticeDialogHost()` touches `alertMessage` and jQuery UI dialog.
  Added focused tests for injected-host modal options, default close action,
  generation-error cleanup/regenerate/ignore actions, and the jQuery host
  compatibility wrapper.
- Moved runtime feedback and log services into
  `src/modules/engine-feedback-service.ts` and
  `src/modules/engine-log-service.ts`. The default adapters still delegate to
  `tip(...)` and the `WARN` / `ERROR` console gates, but those compatibility
  reads are no longer inline in `engine-runtime-context.ts`. Added focused tests
  for toast forwarding and log gate behavior.
- Expanded `engine-generation-pipeline.test.ts` to cover session preparation,
  including the no-regenerate path that clears `grid.cells.h`.
- Added `engine-runtime-context.test.ts` to verify the default session adapter
  preserves the no-regenerate behavior while clearing stale heightmap cells.
- Added `EngineSeedSession` in `src/modules/engine-seed-session.ts`. Seed
  resolution now covers precreated seeds, first-load URL seeds, MFCG-compatible
  13-character seed trimming, and generated fallback in a tested TS module.
  `public/main.js` keeps `setSeed(precreatedSeed)` as a compatibility wrapper.
- `mapHistory` is now intentionally exposed as a global compatibility value so
  the runtime seed session can preserve first-map URL behavior. This is not a
  final state store design; it is an explicit adapter boundary for the current
  public runtime.
- Added `EngineGenerationPipeline.handleGenerationError(error)` and
  `EngineNoticeService.showGenerationError(error)`. `public/main.js` no longer
  manually parses generation errors or builds the generation-error dialog. The
  default adapter in `engine-notice-service.ts` still delegates to the existing
  jQuery dialog for now, so this is compatibility isolation rather than a UI
  replacement.
- Global map snapshot/reset behavior is now centralized in
  `createGlobalMapStore()`. It still mutates global `grid`, `pack`, and `notes`
  for resample compatibility, but the mutation is isolated behind
  `EngineMapStore`.
- Global climate adapter reads are now centralized in
  `createGlobalClimateContext()`. It still reads `precInput`, `DEBUG`,
  `TIME`, coordinates, dimensions, and the precipitation layer from the public
  runtime, but the compatibility boundary is explicit.
- Global `Names.*` and `Routes.*` service calls are now centralized in
  `src/modules/engine-naming-service.ts` and
  `src/modules/engine-route-service.ts`. The default adapters still forward to
  the compatibility-mounted AGM modules, but those calls are no longer inline in
  `engine-runtime-context.ts`. Added focused forwarding tests for both adapters.
- Global `States.*` and `COA.*` service calls are now centralized in
  `src/modules/engine-state-service.ts` and
  `src/modules/engine-heraldry-service.ts`. The default adapters still forward
  to compatibility-mounted services, but those calls are no longer inline in
  `engine-runtime-context.ts`. Added focused forwarding tests for state campaign
  / pole refresh and heraldry generation / shield selection.
- Public lifecycle/render helper calls used by resample are now centralized in
  `createGlobalLifecycleAdapter()`. It still delegates to the existing public
  helpers; this is compatibility isolation, not replacement of those helpers.
- Resample now passes the active runtime context into
  `addLakesInDeepDepressions(...)`, `openNearSeaLakes(...)`, and
  `OceanLayers(...)` through the lifecycle adapter, and passes it into
  `calculateMapCoordinates(...)` for map placement and `showStatistics(...)`
  for final reporting. The public no-argument fallback remains compatible, but
  the resample path uses runtime settings for lake elevation limits, template
  selection, map placement, and statistics reporting.
- Global note persistence and DOM/SVG rendering compatibility are now
  constructed through `src/modules/engine-note-service.ts` and
  `src/modules/engine-render-adapter.ts` instead of inline objects in the
  runtime-context assembler.
- Burgs manual removal now uses `context.feedback.showToast` for missing-burg
  messages, leaving `EngineRenderAdapter` focused on map/SVG rendering effects.
- `fonts.ts` now delegates font loading, used-font discovery, Google CSS
  parsing, and data-URI conversion to
  `src/modules/engine-font-resource-service.ts`. The module itself is the
  browser compatibility adapter that mounts the existing `window.*` font API
  and wires DOM/font-face/toast effects for old public UI callers.
- `Cultures.generate(context)` still falls back to global `nameBases` /
  `Names.*` where optional naming adapters are absent. Global name-base access
  is reduced but not removed from the compatibility path.
- Rivers `remove(...)` remains tied to rendered SVG river selection state and is
  not part of the pure generation path yet.
- Relationship queue internals still contain `nativeRelationship*` naming.
- Old jQuery UI dialogs remain under `public/modules/ui/*`.
- Studio command layer is not fully centralized yet.

## Runtime Context Adapter Split Checkpoint

This checkpoint is specifically for the next V4 review pass.

`src/modules/engine-runtime-context.ts` is now intentionally a context
assembler. It should contain `EngineRuntimeContext`, type re-exports, and
`getGlobalEngineRuntimeContext()`. A scan for direct browser/UI/render/service
compatibility calls should not find inline `document`, jQuery, `alertMessage`,
`COA`, `Names`, `Routes`, `States`, `notes.*`, `tip(...)`, `draw*`, `remove*`,
or `redraw*` usage in that file.

The remaining compatibility debt is not gone; it has been moved into explicit
adapters with focused tests:

- `engine-generation-settings.ts` and `engine-runtime-settings.ts` still read
  current public controls and runtime globals.
- `engine-climate-context.ts` still reads climate controls and public runtime
  climate globals.
- `engine-generation-session-services.ts` still wraps public-compatible seed,
  graph, option, grid, and active-view session behavior.
- `engine-map-store.ts` default adapter still mutates global `grid`, `pack`, and
  `notes`, but map-store callers can now inject a non-global runtime adapter.
- `engine-note-service.ts` default adapter still backs note persistence with
  global `notes`, but note-service callers can now inject non-global storage.
- `engine-notice-service.ts` still delegates blocking/error modals to the
  current jQuery dialog host.
- `engine-render-adapter.ts` still delegates map/SVG rendering side effects to
  current DOM/SVG helpers.
- `engine-naming-service.ts`, `engine-route-service.ts`,
  `engine-state-service.ts`, and `engine-heraldry-service.ts` still forward to
  compatibility-mounted AGM services.

V4 should therefore judge this slice as boundary isolation, not full purity.
The correct finding is "compatibility adapters remain", not "runtime context
still owns scattered old UI/global calls".

## Command Layer Route Checkpoint

Autofix route writeback/undo now enters route operations through explicit
services instead of reading `globalThis.Routes` inline:

- `src/modules/engine-route-service.ts` now owns the default route command
  adapter for `connect`, `remove`, and `findById`, in addition to route query
  helpers.
- `src/studio/bridge/engineAutoFixRouteWriteback.ts` accepts injected
  `EngineRouteService` and `EngineRenderAdapter` dependencies. It still
  relies on the current runtime map for province/cell candidates through
  `EngineRouteWritebackTargets`, but route creation and rendered route refresh
  are behind adapters.
- `src/studio/bridge/engineAutoFixRouteTargets.ts` now owns the route
  writeback target lookup through a dedicated map adapter. The default adapter
  still reads `globalThis.pack`, but the logic has focused tests for province
  and state fallback behavior instead of being embedded in the command
  execution path.
- `src/studio/bridge/engineAutoFixUndo.ts` now removes created routes through
  the injected `EngineRouteService` instead of directly calling
  `globalThis.Routes.remove`.
- `src/modules/engine-burg-service.ts` now owns the default burg command
  adapter for `add`, `remove`, and `findById`.
- `src/studio/bridge/engineAutoFixSettlementWriteback.ts` now creates and
  updates preview burgs through the injected `EngineBurgService` instead of
  directly calling `globalThis.Burgs.add` and then reading
  `globalThis.pack.burgs`.
- `src/studio/bridge/engineAutoFixSettlementTargets.ts` now owns settlement
  writeback point resolution through a dedicated map adapter. The default
  adapter still reads `globalThis.pack`, but the state-burg, state-cell, and
  province-center fallback behavior is tested outside the command execution
  path.
- `src/studio/bridge/engineAutoFixUndo.ts` now removes created burgs through
  the injected `EngineBurgService` instead of directly calling
  `globalThis.Burgs.remove`.
- `src/studio/bridge/engineAutoFixUndoTargets.ts` now owns writable
  province/state/biome lookup for undo through dedicated province, state, and
  biome adapters. It is still a compatibility adapter over `globalThis.pack`
  and `biomesData`, but `engineAutoFixUndo.ts` no longer directly reads those
  globals for updated province/state/biome restoration.
- `src/studio/bridge/engineAutoFixStateTargets.ts` now owns writable state
  lookup through a dedicated state lookup adapter for state autofix writeback.
  `engineAutoFixStateWriteback.ts` applies state changes through injected
  targets instead of directly reading `globalThis.pack.states`.
- `src/studio/bridge/engineAutoFixBiomeTargets.ts` now owns writable biome data
  lookup and biome redraw forwarding through dedicated biome-data lookup and
  redraw adapters. `engineAutoFixBiomeWriteback.ts` applies preview and
  single-resource changes through injected targets instead of directly reading
  `biomesData` or calling `drawBiomes`.
- `src/studio/bridge/engineEntityMutationTargets.ts` now owns direct-editor
  entity lookup and redraw forwarding through dedicated lookup and redraw
  adapters for state, culture, religion, burg, province, route, zone, and
  diplomacy mutations.
- `src/studio/bridge/engineEntityMutations.ts` now applies direct-editor entity
  mutations through injected targets instead of directly reading
  `globalThis.pack` or calling public draw helpers inline.
- `src/studio/bridge/engineFocusGeometryTargets.ts` now owns focus geometry
  lookup through dedicated dimension, cell, and entity adapters for map
  dimensions, cells, entities, routes, and zones.
- `src/studio/bridge/engineFocusGeometry.ts` now resolves Studio focus
  geometry through injected targets instead of directly reading
  `globalThis.pack`, `graphWidth`, `graphHeight`, `svgWidth`, or `svgHeight`
  inline.
- `src/studio/bridge/engineResourceSummaryTargets.ts` now owns resource summary
  lookup through biome-data and pack-resource adapters. Biome data, entity
  collections, world-resource collections, and zone cell metrics can now be
  composed independently.
- `src/studio/bridge/engineResourceSummary.ts` now builds world/entity
  summaries through injected targets instead of directly reading
  `globalThis.pack` / `biomesData` inline.
- `src/studio/app/engineCanvasAccess.ts` now reads canvas graph size, pack/grid
  access, and edit-layer redraw helpers through `EngineCanvasAccessTargets`
  backed by dedicated dimension, map-data, and renderer adapters instead of
  directly reading `globalThis` in every exported helper.
- `src/studio/bridge/engineProjectClimateTargets.ts` now owns the Studio
  project climate redraw compatibility boundary through DOM, pipeline,
  renderer, and scheduler adapters: auto-apply DOM reads, climate/globe
  functions, AGM module calls, pack height preservation, layer redraw checks,
  and 3D refresh scheduling can now be composed independently.
- `src/studio/bridge/engineProjectClimate.ts` now applies the project climate
  redraw through injected targets instead of directly reading `document`,
  `window`, `pack`, layer helpers, or draw helpers inline.
- `src/studio/bridge/engineProjectControlTargets.ts` now owns the Studio
  project control compatibility boundary through DOM, runtime, and storage
  adapters. Temperature labels/conversion, option writes, wind SVG transforms,
  wind-option persistence, map-coordinate tier checks, and the current
  `d3.range` helper can now be composed independently.
- `src/studio/bridge/engineProjectControls.ts` no longer directly reads
  `window`, `document`, `options`, `localStorage`, or `d3`; project control
  events still use the existing DOM pair helpers, but runtime/global effects
  are injected through `EngineProjectControlTargets`.
- `src/studio/bridge/engineProjectFormTargets.ts` now owns the Studio project
  form compatibility boundary through `EngineProjectFormDomAdapter` and
  `EngineProjectFormRuntimeAdapter`. Input/output/text reads, select option
  metadata, visible-inline checks, wind SVG rotation reads, and wind-option
  fallback reads can now be tested without direct document/global access.
- `src/studio/bridge/engineProjectForm.ts` now builds project summary form
  state through injected targets instead of directly reading `document`,
  `window.options`, or wind SVG paths inline.
- `src/studio/bridge/engineProjectSummaryTargets.ts` now owns the Studio
  project summary compatibility boundary through cache, storage, document, and
  database adapters. Cached summary state, local/session storage reads, element
  existence checks, local database snapshot lookup, and the shared project form
  target can now be composed independently.
- `src/studio/bridge/engineProjectSummary.ts` now syncs and reads project
  summary state through injected targets instead of directly reading
  `document`, `localStorage`, `sessionStorage`, `globalThis`, or `ldb` inline.
- `src/studio/bridge/engineProjectActionTargets.ts` now owns the Studio project
  action compatibility boundary through DOM, select, and runtime adapters.
  Inputs, outputs, selects, button clicks, form event dispatch, template option
  lookup/insertion, `applyOption`, and heightmap template label fallback are
  split into replaceable adapters.
- `src/studio/bridge/engineProjectActions.ts` now applies project action
  mutations through injected targets instead of directly reading `document`,
  `window.applyOption`, or heightmap template globals inline. Removing its old
  broad `Window[key: string]` declaration also exposed and fixed two hidden
  loose-typing dependencies in adjacent bridge files.
- `src/studio/bridge/engineLayerTargets.ts` now owns the Studio layer
  compatibility boundary through `EngineLayerRuntimeAdapter` and
  `EngineLayerDomAdapter`. Layer handler detection, active-state reads, layer
  toggles, and `#mapLayers` detail metadata are split into replaceable
  adapters.
- `src/studio/bridge/engineLayerActions.ts` now builds layer states/details and
  toggles layers through injected targets instead of directly reading
  `window`, `document`, or `layerIsOn` inline.
- `src/studio/bridge/engineStyleTargets.ts` now owns the Studio style
  compatibility boundary through runtime, storage, and toggle adapters. Active
  preset reads, style apply hooks, active zoom refresh, stored preset
  reads/writes, and label toggle checkbox reads/writes are split into
  replaceable adapters while the default adapters remain compatible with the
  old `window`, `localStorage`, and DOM sources.
- `src/studio/bridge/engineStyle.ts` now builds style settings, applies style
  presets, and updates label toggles through injected targets instead of
  directly reading `window`, `document`, or `localStorage` inline.
- `src/studio/bridge/engineDataActionTargets.ts` now owns the Studio data
  panel compatibility boundary through document-source, DOM, and runtime
  adapters. Document-source tracking, save-target summaries, file-input state,
  Dropbox DOM state, and data runtime operations such as quick load, save,
  Dropbox load/share, new-map generation, and URL loading are split into
  replaceable adapters.
- `src/studio/bridge/engineDataActions.ts` now builds data action availability
  and runs data actions through injected targets instead of directly reading
  `window`, `document`, or runtime globals inline.
- `src/studio/bridge/engineDocumentSource.ts` now supports injected document
  source targets for its runtime function wrapping, map filename lookup,
  Dropbox source labels, and summary store access. The default target remains a
  compatibility adapter over the current global runtime.
- `src/studio/bridge/engineExportTargets.ts` now owns the Studio export
  compatibility boundary through settings and runtime adapters. Export setting
  inputs and SVG/PNG/JPEG runtime export calls are split into replaceable
  adapters.
- `src/studio/bridge/engineExport.ts` now reads/writes export settings and runs
  exports through injected targets instead of directly reading `document` or
  `window` inline.
- `src/studio/bridge/engineTopbarTargets.ts` now owns the Studio topbar
  compatibility boundary between topbar actions and Data command availability /
  execution.
- `src/studio/bridge/engineTopbarActions.ts` now builds topbar availability and
  maps new/open/save actions through injected targets instead of directly
  coupling to Data action functions.
- `src/studio/bridge/engineEditorTargets.ts` now owns the Studio editor
  compatibility boundary through injectable handler-runtime and dialog-adapter
  interfaces. The default `createJQueryEngineEditorDialogAdapter()` still reads
  old jQuery UI wrapper state, but the target orchestration no longer embeds
  those selectors directly.
- `src/studio/bridge/engineEditorActions.ts` now builds editor availability,
  open-state sync, close behavior, and open-before-close sequencing through
  injected targets instead of directly reading `window`, `document`, or
  `.ui-dialog` inline.
- `src/studio/app/engineHostTargets.ts` now splits Studio host compatibility
  into `EngineHostDomAdapter` and `EngineHostDialogAdapter`. The default
  `createJQueryEngineHostDialogAdapter()` still owns old dialog wrapper
  queries, but DOM host creation and dialog lookup are no longer bundled as one
  opaque target.
- `src/studio/app/engineHost.ts` now performs Studio host setup and dialog
  position clamping through injected targets instead of directly reading
  `document` inline.
- `src/studio/bridge/engineMapHostTargets.ts` now owns the map-host
  compatibility boundary through document, viewport, and runtime adapters:
  baseline storage, current document/baseline candidate reads, map-name writes,
  viewport sizing, content fitting, and SVG runtime compatibility can now be
  composed independently.
- `src/studio/bridge/engineMapHost.ts` now calculates document clean/dirty
  state and name updates through injected targets for this document-state
  slice. It also routes the first viewport sizing layer through targets:
  viewport element lookup, stage inner-size calculation, frame sizing, frame
  scaler sizing, viewport global size sync, and map SVG width/height writes.
  It now also routes content transform fitting through targets: graph size and
  viewbox lookup plus viewbox transform writes. The remaining SVG
  compatibility layer is now behind `syncSvgCompatibility(...)`, covering d3
  SVG width/height attrs, zoom extents, scale bar fitting, and legend fitting.
- `src/studio/bridge/engineAutoFixRouteCommands.test.ts` covers route preview
  writeback and undo with injected services, so this path can keep moving
  toward command-layer isolation without requiring a full public editor rewrite.
- `src/studio/bridge/engineAutoFixRouteTargets.test.ts` covers the remaining
  route target compatibility lookup and injected map adapter composition while
  the default adapter still reads the active global map.
- `src/modules/engine-burg-service.test.ts` and
  `src/studio/bridge/engineAutoFixSettlementCommands.test.ts` cover the burg
  command adapter and settlement writeback service injection.
- `src/studio/bridge/engineAutoFixSettlementTargets.test.ts` covers the
  remaining settlement target compatibility lookup and injected map adapter
  composition while the default adapter still reads the active global map.
- `src/studio/bridge/engineAutoFixUndoTargets.test.ts` covers undo lookup for
  writable provinces, states, and biome data, plus injected
  province/state/biome adapter composition, while default adapters still come
  from the active global map/resources.
- `src/studio/bridge/engineAutoFixStateCommands.test.ts` and
  `src/studio/bridge/engineAutoFixStateTargets.test.ts` cover state autofix
  writeback command execution, target lookup, and injected state lookup adapter
  composition.
- `src/studio/bridge/engineAutoFixBiomeCommands.test.ts` and
  `src/studio/bridge/engineAutoFixBiomeTargets.test.ts` cover biome autofix
  writeback command execution, single-resource updates, target lookup, and
  redraw forwarding, plus injected biome-data/redraw adapter composition.
- `src/studio/bridge/engineEntityMutations.test.ts` and
  `src/studio/bridge/engineEntityMutationTargets.test.ts` cover the first
  direct-editor entity mutation target adapter, injected lookup/redraw adapter
  composition, and command execution slice.
- `src/studio/bridge/engineFocusGeometry.test.ts` and
  `src/studio/bridge/engineFocusGeometryTargets.test.ts` cover focus geometry
  resolution, injected dimension/cell/entity adapter composition, and the
  compatibility target adapter.
- `src/studio/bridge/engineResourceSummary.test.ts` and
  `src/studio/bridge/engineResourceSummaryTargets.test.ts` cover world/entity
  summary generation, compatibility target adapters, and injected biome/pack
  adapter composition.
- `src/studio/app/engineCanvasAccess.test.ts` covers canvas access target
  injection, injected dimension/map-data/renderer adapter composition, and the
  default global adapter.
- `src/studio/bridge/engineProjectClimate.test.ts` and
  `src/studio/bridge/engineProjectClimateTargets.test.ts` cover project climate
  redraw command execution, injected adapter composition, and the default
  compatibility target adapter.
- `src/studio/bridge/engineProjectControls.test.ts` and
  `src/studio/bridge/engineProjectControlTargets.test.ts` cover project
  control wind command behavior, missing SVG path preservation, temperature
  target forwarding, wind transform forwarding, wind-option persistence, and
  injected DOM/runtime/storage adapter composition.
- `src/studio/bridge/engineProjectForm.test.ts` and
  `src/studio/bridge/engineProjectFormTargets.test.ts` cover project form
  summary reads, cached-summary fallbacks, helper forwarding, injected/default
  DOM reads, select metadata, and wind rotation/options fallback behavior.
- `src/studio/bridge/engineProjectSummary.test.ts` and
  `src/studio/bridge/engineProjectSummaryTargets.test.ts` cover project summary
  sync, storage/local database snapshot fallback, cached-summary merging, global
  cache forwarding, storage reads, element checks, and injected adapter
  composition.
- `src/studio/bridge/engineProjectActions.test.ts` and
  `src/studio/bridge/engineProjectActionTargets.test.ts` cover project action
  clamping, button mapping, pending template apply/fallback behavior, injected
  adapter composition, default DOM control resolution, event dispatch, and
  template label forwarding.
- `src/studio/bridge/engineLayerActions.test.ts` and
  `src/studio/bridge/engineLayerTargets.test.ts` cover layer state/detail
  composition, layer toggles, injected/default handler forwarding, active state
  reads, and DOM layer-list metadata parsing.
- `src/studio/bridge/engineStyle.test.ts` and
  `src/studio/bridge/engineStyleTargets.test.ts` cover preset priority,
  system/custom classification, style apply hook priority, storage fallback,
  checkbox updates, change dispatch, active zoom forwarding, and injected
  runtime/storage/toggle adapter composition.
- `src/studio/bridge/engineDataActions.test.ts` and
  `src/studio/bridge/engineDataActionTargets.test.ts` cover data action
  availability, Dropbox state reads, quick load/save/load-from-Dropbox/new-map
  execution, URL loading, file input forwarding, injected adapter composition,
  and default DOM/runtime forwarding.
- `src/studio/bridge/engineDocumentSource.test.ts` covers document source
  tracking for quick load, Dropbox load, URL load, local upload, generated
  maps, and save targets through injected targets without browser globals.
- `src/studio/bridge/engineExport.test.ts` and
  `src/studio/bridge/engineExportTargets.test.ts` cover export setting reads,
  setting writes, format dispatch, injected adapter composition, default DOM
  setting access, and default runtime export forwarding.
- `src/studio/bridge/engineTopbarActions.test.ts` covers topbar availability
  composition and new/open/save command mapping through injected targets.
- `src/studio/bridge/engineEditorActions.test.ts` and
  `src/studio/bridge/engineEditorTargets.test.ts` cover editor availability,
  open-state resolution, close/open sequencing, injected handler forwarding,
  injected dialog adapter delegation, dialog visibility reads, and jQuery UI
  wrapper close fallback behavior.
- `src/studio/app/engineHost.test.ts` covers Studio root/dialog creation,
  engine node preservation, map host relocation, and dialog position clamping
  through injected targets.
- `src/studio/bridge/engineMapHost.test.ts` and
  `src/studio/bridge/engineMapHostTargets.test.ts` cover document baseline
  clean-state tracking, dirty-state detection, document-name normalization,
  default runtime/DOM/storage candidate reads, map-name input forwarding,
  viewport element resolution, stage inner-size calculation, frame/map sizing,
  viewport global size forwarding, content graph/viewbox resolution, and
  viewbox transform writes including portrait rotation. The target tests also
  cover d3 SVG attr forwarding, zoom extent updates, scale bar fitting, and
  legend fitting through the default compatibility adapter, plus injected
  document/viewport/runtime adapter composition.
- `src/studio/app/studioEngineCommandHandlers.test.ts` covers app-level style,
  export, topbar, and data command handling through injected Studio engine
  command targets.
- `src/studio/app/studioEngineCommandTargets.test.ts` covers composition of
  Studio style, export, bridge action, document/project, and generation-profile
  command adapters into the app-level command target.
- `src/studio/app/projectActionHandler.test.ts` covers app-level project draft,
  package export, draft restore, and engine project action forwarding through
  injected project action targets.
- `src/studio/app/projectActionTargets.test.ts` covers composition of project
  summary, draft, export, engine-action, and document adapters into the
  app-level project action target.
- `src/studio/app/studioShellHandlers.test.ts` covers shell-level editor entry,
  AGM/rules import, balance focus resolution, and language/theme/navigation
  preference persistence through injected shell targets.
- `src/studio/app/studioShellTargets.test.ts` covers composition of document,
  editor, draft, autofix, canvas, workspace, and preference adapters into the
  app-level shell target.
- `src/studio/app/directEditorActionHandlers.test.ts` covers direct editor
  entity selection, entity mutation, diplomacy mutation, and relationship queue
  history handling through injected direct editor action targets.
- `src/studio/app/directEditorActionTargets.test.ts` covers composition of
  document, focus, and mutation adapters into the app-level direct editor
  action target.
- `src/studio/app/autoFixPreview.test.ts` covers autofix preview apply, manual
  biome rule writeback, rules-pack import writeback, and undo/redo through
  injected autofix preview targets.
- `src/studio/app/autoFixPreviewTargets.test.ts` covers composition of project,
  draft, and writeback adapters into the app-level autofix preview target.

Known remaining debt for this slice: `EngineRouteWritebackTargets` now splits
route cell/province lookup through a dedicated map adapter, and can also compose
targets directly from an injected `EngineRuntimeContext`.
`EngineSettlementWritebackTargets` now splits settlement point lookup through a
dedicated map adapter, and can also compose targets directly from an injected
`EngineRuntimeContext`.
`EngineAutoFixUndoTargets`, `EngineStateWritebackTargets`, and
`EngineBiomeWritebackTargets` now split pack/biome-data lookup and redraw
forwarding through dedicated bridge adapters, and can also compose targets
directly from an injected `EngineRuntimeContext`. `EngineFocusGeometryTargets` now
splits focus dimensions, cell geometry, and entity lookups through dedicated
bridge adapters, and can also compose targets directly from an injected
`EngineRuntimeContext`.
`EngineEntityMutationTargets` now splits direct-editor entity lookup and redraw
forwarding through dedicated bridge adapters, and can also compose entity
lookups directly from an injected `EngineRuntimeContext`. `EngineResourceSummaryTargets`
now splits biome data and pack resources through dedicated bridge adapters, and
can also compose targets directly from an injected `EngineRuntimeContext`.
`EngineCanvasAccessTargets`
now splits canvas dimensions, map data, and renderer calls through dedicated
app-level adapters.
`EngineProjectClimateTargets` now splits climate DOM reads, generation
pipeline helpers, renderer calls, and scheduling through dedicated bridge
adapters. `EngineProjectControlTargets` now splits project-control DOM,
runtime, and storage helpers through dedicated bridge adapters.
`EngineProjectFormTargets` now splits project-form DOM reads and runtime wind
state through dedicated bridge adapters. `EngineProjectSummaryTargets` now
splits project summary storage, document, cache, and database helpers through
dedicated bridge adapters.
`EngineProjectActionTargets` now splits project action DOM, select, and runtime
template helpers through dedicated bridge adapters. `EngineLayerTargets` now splits layer DOM and
runtime helpers through dedicated bridge adapters. `EngineStyleTargets` now
splits style runtime, storage, and toggle helpers through dedicated bridge
adapters.
`EngineDataActionTargets` now splits data panel DOM, runtime helpers, and
`engineDocumentSource.ts` through dedicated bridge adapters. The document
source default target still wraps current global runtime functions for
compatibility, but the tracking logic is now testable through injected targets.
`EngineExportTargets` now splits export setting DOM inputs and export runtime
helpers through dedicated bridge adapters. `EngineTopbarTargets` still delegates to
Data action functions behind a bridge-level adapter. `EngineEditorTargets` now
splits public editor handlers from old jQuery UI dialog wrappers through
dedicated bridge adapters. `EngineHostTargets` now splits app-level DOM host
and old dialog wrapper queries through dedicated app-level adapters.
`EngineMapHostTargets` now splits the map host into document, viewport, and
runtime adapters. The map host still relies on old runtime objects behind the
default adapters, but `engineMapHost.ts` no longer owns those direct global
calls inline.
`StudioEngineCommandTargets` now splits style, export, bridge action,
document/project, and generation-profile commands through dedicated app-level
adapters. Project center persistence now flows through injected project center
targets, so recent-project storage, project summary reads, and timestamp
generation are no longer hard-wired into the app command/document adapters. The
default adapters still delegate to the current bridge/project helpers, but
`studioEngineCommandHandlers.ts` no longer owns those calls inline.
`ProjectActionTargets` now splits project summary, draft, export,
engine-action, and document commands through dedicated app-level adapters. The
default adapters still delegate to the current engine project action bridge and
world document draft helpers, but `projectActionHandler.ts` no longer owns
those direct calls inline. `StudioShellTargets` now splits document, editor,
draft, autofix, canvas, workspace, and preference commands through dedicated
app-level adapters. The default adapters still delegate to the current editor
bridge, focus geometry, draft import, autofix, canvas, workspace, and
preference helpers, but `studioShellHandlers.ts` no longer owns those direct
calls inline. `DirectEditorActionTargets` now splits document sync, focus
geometry, and entity mutation commands through dedicated app-level adapters.
Initial Studio state creation now has a dedicated `InitialStateTargets`
boundary for engine document reads, style preset reads, canvas preset lookup,
preference reads/application, and project-center loading; the default adapter
still uses the current engine/browser sources, while tests can exercise startup
state without touching `document` or `localStorage`.
Direct editor targets can also compose focus, entity mutation, and biome
mutation commands directly from an injected `EngineRuntimeContext`. The default
adapters still delegate to current entity mutation/focus bridge helpers, but
`directEditorActionHandlers.ts` and
`directEditorEntityActionHandlers.ts` no longer own those direct bridge calls
inline. `AutoFixPreviewTargets` now splits project summary, world draft, and
engine writeback/undo commands through dedicated app-level adapters. The default
adapters still delegate to the current project summary, world draft, engine
writeback, and writeback undo helpers, but `autoFixPreview.ts` no longer owns
those direct bridge calls inline. This checkpoint closes the first
  autofix/direct-editor/canvas access/project control/project form/project
  summary/project action/layer/style/data/export/topbar/editor command entries,
  app command handlers, app project action handlers, shell event handlers, direct
  editor handlers, autofix preview handlers, and target lookups plus the first Studio host/map
  document-state adapters, not the full command-layer plan.

## Next Recommended Slice

Move the next high-value generation step into explicit context. Recommended
order:

1. Move the remaining context type re-exports gradually to direct imports from
   their adapter modules in touched files, without doing a noisy repo-wide
   churn pass.
2. Start a command-layer slice for route/editor/query helpers rather than
   mixing rendered editor state into pure generation migration.
3. Defer `Rivers.remove(...)` until rendered river selection state is isolated
   behind a renderer/command adapter.
4. Continue reducing module-level browser UI exits. `fonts.ts` now has a
   formal `EngineFontResourceService`; the next high-value step is to move
   public UI callers from the compatibility `window.*` font API onto injected
   font-resource commands.
5. Defer manual Burgs editor methods (`add/remove/changeGroup`) until the
   editor command layer can own rendered icons, labels, routes, and COA updates.

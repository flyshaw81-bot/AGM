# V4 Runtime Context Handoff

> **V4 review note:** This handoff is intentionally scoped to runtime/context,
> command-layer, and compatibility-boundary migration. It is not claiming that
> all public UI, jQuery dialogs, or global compatibility adapters are gone.

> **Codex current reply to V4:** V4, received. The current slice has moved well
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
> Viewport dimension updates now use `ViewportPresetTargets`, so orientation
> sizing can be tested without reaching directly into the canvas preset module
> from the Studio bootstrap path.
> Studio workflow watching now uses `StudioWorkflowWatcherTargets`, so interval,
> focus, and visibilitychange wiring are isolated from workflow sync/render
> decisions.
> Studio bootstrap now uses `StudioBootstrapTargets`, so body/loading setup,
> DOMContentLoaded startup, resize viewport sync, and public viewport sync
> mounting are isolated from the app entrypoint.
> Studio rendering now uses `StudioRendererTargets`, so shell HTML writes,
> theme writes, map/dialog host sync, canvas interaction binding, viewport
> sync, and shell event binding are isolated from the app entrypoint.
> Canvas overlay sync now uses `CanvasOverlayTargets`, so paint preview, tool
> HUD, and frame overlay DOM lookups can be injected and tested without a
> browser document.
> Canvas tool interaction binding now uses `CanvasInteractionTargets`, so frame
> and map host lookup, control-event checks, paint preview lookup, selection
> lookup, overlay/HUD sync, viewport sync, and paint-tool checks are injected
> instead of hard-wired into the binding path.
> Canvas selection highlighting now uses `CanvasSelectionHighlightTargets`, so
> stale highlight queries, frame/map selected-state attributes, state path
> lookup, border lookup, and parent reordering are injectable.
> Canvas interaction geometry now uses `CanvasInteractionGeometryTargets`, so
> frame lookup, graph dimensions, and pack reads are injected for selection and
> paint-preview geometry.
> Canvas paint editing now uses `CanvasPaintEditingTargets`, so graph size,
> pack/grid cell access, edit-layer redraw, and edit-entry timestamps are
> injectable across preview, paint apply, undo, and biome coverage paths.
> Studio shell and renderer target factories now also have runtime canvas paint
> variants, so canvas paint edits can use `EngineRuntimeContext` pack/grid/
> rendering services instead of falling back to global canvas access.
> Canvas interaction geometry and interaction binding now also have runtime
> variants, so paint preview and selection hit-testing can read graph/pack data
> from `EngineRuntimeContext` instead of splitting preview reads from paint
> writes.
> Engine notice generation-error actions now use `EngineNoticeActionTargets`,
> so parse/cleanup/regenerate runtime calls are isolated from the notice
> service. The default jQuery dialog host remains a compatibility host until a
> Pencil-aligned Studio modal replaces that UI path.
> Engine editor dialog compatibility now uses `EngineEditorDialogDomAdapter`,
> so dialog element lookup and computed-style reads are isolated from the
> jQuery wrapper close/open-state adapter.
> Engine host dialog compatibility now uses `EngineHostDialogDomAdapter`, so
> old `.ui-dialog` wrapper queries are isolated from host relocation and dialog
> positioning targets.
> Burg and route services now expose runtime factories, and
> `getGlobalEngineRuntimeContext()` wires them back to the context pack, so
> `findById` reads no longer need to fall through `globalThis.pack` once a
> runtime context exists.
> Engine map store now exposes `createRuntimeMapStoreRuntimeAdapter()`, so
> snapshot/reset flows can read and write context `grid`/`pack` and context
> note service state instead of requiring the global map variables.
> `getGlobalEngineRuntimeContext()` now wires its `mapStore` through
> `createRuntimeMapStore()`, so context snapshots and resample resets can stay
> on the runtime context path after the initial global compatibility bootstrap.
> Notes now expose memory-backed runtime storage via `createRuntimeNoteService()`,
> and `getGlobalEngineRuntimeContext()` bootstraps context notes from the current
> global notes array before keeping subsequent note mutations on the context
> service.
> Runtime context construction no longer creates global burg/route/mapStore/note
> services before overriding them; these context-owned services now initialize
> directly on the runtime path after compatibility bootstrap values are captured.
> Engine lifecycle orchestration now uses `EngineLifecycleTargets`, so context
> value mapping is separated from the default public helper calls. The old
> lifecycle helpers remain compatibility targets, but pipeline calls no longer
> need to know where those helpers live.
> Generation session lifecycle now uses
> `EngineGenerationSessionLifecycleTargets`, so active-view reset wiring is
> isolated from the default `invokeActiveZooming()` compatibility call.
> Grid session now exposes `createRuntimeGridSessionService(context)`, and the
> runtime context wires `gridSession` through context `grid`/`seed`/
> `worldSettings`. Grid generation/regeneration utilities are injectable so
> tests and future runtime flows can avoid DOM-backed graph utilities.
> Studio style injection now uses `StudioStyleTargets`, so duplicate style
> detection, style element creation, and head insertion are injectable.
> Studio document theme sync now uses `StudioThemeSyncTargets`, so renderer
> composition no longer writes directly to `document.documentElement`.
> Studio bootstrap browser operations now use `StudioBootstrapDomTargets`, so
> body class setup, loading removal, resize/DOMContentLoaded listeners, ready
> state reads, and public viewport sync mounting are isolated from bootstrap
> composition.
> Studio bootstrap DOM targets now compose explicit body, browser event, and
> viewport sync adapters, so startup DOM setup can evolve separately from
> resize/DOMContentLoaded wiring and public viewport sync mounting.
> Engine host targets now expose an explicit `createEngineHostTargets`
> composer, so injected DOM and dialog adapters are distinct from the global
> default host factory.
> Engine editor targets now expose an explicit `createEngineEditorTargets`
> composer, so injected handler runtimes and dialog adapters are distinct from
> the global editor handler / jQuery-dialog compatibility factory.
> Engine topbar targets now expose an explicit `createEngineTopbarTargets`
> composer, so topbar actions depend on an injected data-action adapter instead
> of importing the data-action bridge directly at the command call site.
> Project center default storage/summary/clock access now uses
> `ProjectCenterTargets` from a dedicated adapter module, so project-center
> state logic no longer owns `localStorage`, engine summary, or clock calls.
> Studio preference default storage/document writes now use
> `StudioPreferenceTargets` from a dedicated adapter module, so preference
> state logic no longer owns `localStorage` or document-element writes.
> Generation profile default engine/draft/clock access now uses
> `GenerationProfileTargets` from a dedicated adapter module, so profile logic
> no longer owns engine pending-setting bridge calls or timestamps inline.
> Document state sync/restore now uses `DocumentStateTargets`, so editor
> workflow reads, document/style reads, document-name writes, and layer restore
> writes are isolated from document state logic.
> `DocumentStateTargets` now also exposes an explicit `createDocumentStateTargets`
> composer, so injected document/editor/layer adapters stay separate from the
> global bridge factory.
> Project workspace changes now use `ProjectWorkspaceActionTargets`, so project
> setting setters, document-name writes, canvas-size writes, autosave writes,
> and project-summary sync are isolated from workspace action routing.
> `ProjectWorkspaceActionTargets` now also exposes
> `createProjectWorkspaceActionTargets`, so injected project write targets stay
> separate from the default engine bridge setter factory.
> Initial Studio state default dependencies now live in
> `InitialStateTargets`, so startup state construction no longer owns
> engine-document, style-preset, viewport-preset, preference, or project-center
> default adapter wiring inline.
> `InitialStateTargets` now also exposes an explicit `createInitialStateTargets`
> composer, so tests and future startup flows can inject the complete startup
> target set without going through the global default factory.
> Studio bootstrap default dependencies now live in
> `StudioBootstrapTargets`, so startup orchestration no longer owns style,
> DOM, initial-state, workflow-watcher, project-summary, document-sync, root,
> or viewport-sync default adapter wiring inline.
> `StudioBootstrapTargets` now also exposes an explicit
> `createStudioBootstrapTargets` composer, so injected startup dependency sets
> stay separate from the global Studio/browser bridge factory.
> Studio renderer default dependencies now live in `StudioRendererTargets`, so
> render orchestration no longer owns shell, canvas, document, project-center,
> viewport, focus, dialog-position, or event-binding default adapter wiring
> inline.
> `StudioRendererTargets` now also exposes an explicit
> `createStudioRendererTargets` composer, so injected renderer dependency sets
> stay separate from the global Studio/browser bridge factory.
> Canvas interaction default dependencies now live in `CanvasInteractionTargets`,
> so canvas gesture handling no longer owns DOM frame/host lookup, viewport sync,
> overlay sync, selection geometry, paint preview geometry, or paint-tool checks
> inline.
> `CanvasInteractionTargets` now also exposes an explicit
> `createCanvasInteractionTargets` composer, so injected canvas gesture
> dependencies stay separate from the global Studio/browser bridge factory.
> Canvas overlay default dependencies now live in `CanvasOverlayTargets`, so
> overlay sync no longer owns paint-preview, tool-HUD, or canvas-frame DOM
> lookup wiring inline.
> `CanvasOverlayTargets` now also exposes an explicit
> `createCanvasOverlayTargets` composer, so injected overlay DOM adapters stay
> separate from the global browser document factory.
> Canvas selection highlight default dependencies now live in
> `CanvasSelectionHighlightTargets`, so highlight sync no longer owns selected
> state queries, selected border queries, canvas host lookup, state path lookup,
> state border lookup, or parent reordering wiring inline.
> `CanvasSelectionHighlightTargets` now also exposes an explicit
> `createCanvasSelectionHighlightTargets` composer, so injected highlight DOM
> adapters stay separate from the global Studio/browser document factory.
> Canvas interaction geometry default dependencies now live in
> `CanvasInteractionGeometryTargets`, so geometry resolution no longer owns
> canvas frame lookup, graph size reads, or pack reads inline.
> `CanvasInteractionGeometryTargets` now also exposes an explicit
> `createCanvasInteractionGeometryTargets` composer, so injected frame/graph/pack
> adapters stay separate from the global Studio/browser bridge factory.
> Canvas paint editing default dependencies now live in
> `CanvasPaintEditingTargets`, so preview/apply/undo/biome coverage logic no
> longer owns graph size reads, pack/grid cell reads, redraw calls, or timestamp
> generation inline.
> `CanvasPaintEditingTargets` now also exposes an explicit
> `createCanvasPaintEditingTargets` composer, so injected paint editing
> adapters stay separate from the global engine canvas factory.
> Studio style injection default DOM dependencies now live in
> `StudioStyleTargets`, so stylesheet composition no longer owns style-element
> lookup, creation, or head insertion inline.
> `StudioStyleTargets` now also exposes an explicit `createStudioStyleTargets`
> composer, so injected style-document adapters stay separate from the global
> browser document factory.
> Studio document theme sync default DOM dependencies now live in
> `StudioThemeSyncTargets`, so theme sync no longer owns document-element
> dataset writes inline.
> `StudioThemeSyncTargets` now also exposes an explicit
> `createStudioThemeSyncTargets` composer, so injected theme-document adapters
> stay separate from the global browser document factory.
> Studio preference targets now compose explicit storage and document adapters,
> so language/theme/navigation persistence can swap browser storage separately
> from document language/theme writes.
> Project center targets now compose explicit storage, summary, and clock
> adapters, so recent-project persistence can swap browser storage separately
> from engine summary reads and timestamp generation.
> Generation profile targets now compose explicit summary, draft, settings, and
> clock adapters, so profile suggestion reads can evolve separately from engine
> setting writes and impact timestamps.
> Studio workflow watcher targets now compose explicit sync, render, and
> browser lifecycle adapters, so interval/focus/visibility wiring can evolve
> separately from workflow sync services and render callbacks.
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
- `npm.cmd run test -- --run` passed: 197 test files, 836 tests.
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
- Provinces generation now routes burg type lookup through `context.burgs` and
  COA generation through `context.heraldry`. It still installs seeded `Alea`
  during generation for compatibility, but restores the previous `Math.random`
  after success or failure, so it is context-routed but not fully pure yet.
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
- Public font import/export/style callers now use the centralized
  `AGMFontResources` runtime object instead of directly calling the loose
  `declareFont`, `getUsedFonts`, `loadFontsAsDataURI`, `addGoogleFont`,
  `addLocalFont`, or `addWebFont` globals. Those loose globals remain as
  compatibility aliases for un-migrated public paths.
- `EngineNoticeService` now depends on an injectable
  `EngineNoticeDialogHost`. The default `createJQueryNoticeDialogHost()` keeps
  the old `alertMessage` + jQuery dialog behavior for compatibility, but the
  notice service itself no longer calls jQuery UI directly.
- `EngineNoticeService` now also exposes `createEngineNoticeService(dialogHost)`.
  `createGlobalNoticeService()` is only the compatibility factory that wires the
  jQuery host, leaving a clear slot for a Studio modal/toast host once UI work
  is aligned with Pencil.
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
- `engine-feedback-service.ts` and `engine-log-service.ts` now also separate
  core service composition from global `tip(...)`, `WARN`, `ERROR`, and console
  reads through `createEngineFeedbackService(targets)` and
  `createEngineLogService(targets)`.
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
- Added `EngineOptionsRandomAdapter` so option randomization consumes injected
  `random` / `gauss` / `rand` / `rw` functions. The default adapter preserves
  the current seeded/public random behavior, but `EngineOptionsSessionModule`
  no longer calls those globals directly from its core session logic.
- Split generation-settings reads into `createGenerationSettings(targets)` plus
  `createGlobalGenerationSettingsTargets()`. The default targets still read
  current DOM/global controls, but the settings mapper is now testable without
  `document` or `globalThis` inputs.
- Removed the remaining `emblemShape` DOM fallback from manual culture add;
  culture emblem selection now uses `context.generationSettings` on that path.
- Added `EngineRandomService` to `EngineRuntimeContext` and routed culture
  expansionism randomness through `context.random.next()`. The default service
  still preserves current seeded `Math.random()` behavior, but context-routed
  culture generation no longer calls it directly on that path.
- Added `EngineBurgService` to `EngineRuntimeContext`. The service remains a
  compatibility-backed command/query boundary over the current AGM `Burgs`
  module mount, but runtime callers can now depend on `context.burgs` instead
  of constructing the global service directly.
- Routed runtime autofix writeback composition through `context.burgs` and
  `context.routes` for settlement creation, route creation, and undo instead of
  falling back to the global service factories on the runtime path.
- Extended `EngineRenderAdapter` with optional canvas redraw hooks and made
  runtime canvas access prefer `context.rendering` for heightmap/biome/cell
  redraws and active zoom sync before falling back to compatibility globals.
- Added `createRuntimeCanvasPaintEditingTargets(context)` so canvas paint
  editing can use runtime graph size, pack/grid cells, and redraw hooks without
  going through global canvas access targets.
- Routed state expansionism randomness through the same runtime random service.
  This keeps the seeded default behavior while moving another context-aware
  generation step off direct `Math.random()` calls.
- Routed burg capital ranking randomness through `context.random.next()` as
  well. Remaining direct random calls are now mostly default random adapters or
  larger algorithm modules that need separate, higher-risk migration passes.
- Routed generated marker candidate selection through `context.random.next()`;
  marker generation can now be tested with deterministic runtime randomness
  instead of relying on direct `Math.random()`.
- Added a random adapter slot to `NamesGenerator` and routed state suffix
  selection through it. Other probability helpers in names remain compatible
  with the existing seeded random behavior for now.
- Added a heightmap-module random source shim and routed heightmap template
  randomness through it during `generate(context)`. The public seeded Alea
  behavior is preserved because the default runtime random service still reads
  the active `Math.random()` function.
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
- `engine-generation-session-services.ts` now also exposes
  `createGridSessionService(targets)`, so grid regeneration checks, grid
  creation, seed/dimension reads, and global grid writes are separated from the
  core grid-session behavior.
- Added `EngineRuntimeContext.sessionLifecycle`. Active-view reset during
  generation preparation now flows through `context.sessionLifecycle`, with the
  default implementation still delegating to `invokeActiveZooming()` as
  compatibility debt.
- Added `createGlobalGenerationSessionServices()` as the grouped default service
  factory for session preparation. This keeps fallback seed/graph/options/grid
  services centralized instead of creating them piecemeal inside
  `prepare(...)`.
- Added `createGenerationSessionAdapter(createFallbackServices)`, so session
  preparation orchestration can be tested with injected fallback services while
  `createGlobalGenerationSessionAdapter()` remains the compatibility factory.
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
- `engine-generation-settings.ts` now reads the remaining global controls
  through explicit `getPointsInput()` / `getHeightExponentInput()` targets
  instead of a generic string-keyed global input getter.
- Moved world, population, unit, and timing settings into
  `src/modules/engine-runtime-settings.ts`. These are still compatibility
  adapters over current globals/controls, but the runtime context assembler now
  only wires them into `EngineRuntimeContext`.
- `engine-runtime-settings.ts` now also exposes injected builders for world,
  population, unit, and timing settings. The global factories still read the
  current public controls/runtime globals, but the core settings builders consume
  explicit targets.
- `engine-runtime-settings.ts` now routes world-setting DOM reads through
  explicit map-size / latitude / longitude targets instead of a generic
  string-keyed input-number getter.
- `engine-runtime-settings.ts` now separates world runtime globals
  (`mapCoordinates`, `graphWidth`, `graphHeight`) into
  `EngineWorldRuntimeTargets`, so global DOM controls and map runtime values can
  be injected independently.
- `engine-runtime-settings.ts` now also separates population runtime globals
  (`populationRate`, `urbanDensity`, `urbanization`) into
  `EnginePopulationRuntimeTargets`, matching the world runtime target split.
- `engine-runtime-settings.ts` now separates unit/timing runtime globals
  (`heightUnit.value`, `TIME`) into `EngineUnitRuntimeTargets` and
  `EngineTimingRuntimeTargets`.
- Moved global climate-context construction into
  `src/modules/engine-climate-context.ts`. Both `getGlobalEngineRuntimeContext()`
  and `Climate.getGlobalClimateRuntimeContext()` now use the same adapter,
  avoiding duplicate reads of `heightExponentInput`, `pointsInput`, `precInput`,
  `DEBUG.temperature`, and `TIME`. Added focused tests for explicit climate
  globals and default-control fallback values.
- `engine-climate-context.ts` now also exposes `createClimateContext(targets)`,
  so climate context assembly can run from injected grid/options/control/timing
  targets while `createGlobalClimateContext()` remains the compatibility
  factory.
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
  run without touching `globalThis.pack`. Snapshot cloning now also flows through
  the runtime adapter, so the core store no longer owns `structuredClone`
  directly. Added focused tests for structured snapshots, generation pack reset,
  resample reset, injected current-context access, clone injection, and
  no-global injected adapter behavior.
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
- `engine-render-adapter.ts` now also separates adapter composition from global
  DOM/SVG helper lookup through `createEngineRenderAdapter(targets)`. The global
  factory remains the compatibility layer over the current rendered map helpers,
  while adapter behavior can be tested and replaced through injected render
  targets.
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
- `EngineSeedSessionModule` now accepts explicit seed-session targets for
  history checks, URL search params, seed writes, options seed input sync,
  random generator replacement, and generated fallback seeds. The global module
  mount still uses the current public runtime adapters.
- `EngineGraphSessionModule` now accepts explicit graph-session targets for map
  size reads, graph size writes, rect bound writes, and fog/water mask updates.
  The global module mount still uses the current public SVG/d3 adapters.
- `EngineOptionsSessionModule` now routes heightmap template application,
  cells-density changes, generation option controls, climate option writes,
  precipitation, distance scale, distance unit, height unit, temperature scale,
  and era/year browser writes through `EngineOptionsBrowserControlTargets`. The
  global writer still updates the current public controls for compatibility,
  but the writer adapter no longer owns those DOM/global writes inline.
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
- `engine-naming-service.ts` now separates service composition from the global
  compatibility adapter via `createEngineNamingService(targets)`. The default
  `createGlobalNamingService()` still reads the current AGM `Names` module
  mount, but the naming service logic itself no longer owns that global read.
- `engine-route-service.ts` now separates service composition from the global
  compatibility adapter via `createEngineRouteService(targets)`. The default
  `createGlobalRouteService()` still reads the current AGM `Routes` module
  mount and `pack.routes`, but the route service logic itself no longer owns
  those `globalThis` reads.
- Global `States.*` and `COA.*` service calls are now centralized in
  `src/modules/engine-state-service.ts` and
  `src/modules/engine-heraldry-service.ts`. The default adapters still forward
  to compatibility-mounted services, but those calls are no longer inline in
  `engine-runtime-context.ts`. Added focused forwarding tests for state campaign
  / pole refresh and heraldry generation / shield selection.
- `engine-state-service.ts` and `engine-heraldry-service.ts` now also separate
  service composition from global compatibility factories through
  `createEngineStateService(targets)` and
  `createEngineHeraldryService(targets)`. The global factories still read the
  current AGM `States` / `COA` mounts, but the service logic itself no longer
  owns those global reads.
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
- `fonts.ts` also mounts `AGMFontResources` as the central runtime facade.
  `public/modules/io/export.js`, `public/modules/io/load.js`,
  `public/modules/io/save.js`, and `public/modules/ui/style.js` now call that
  facade instead of the loose global font helper functions.
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

- `engine-generation-settings.ts` still reads current public controls.
- `engine-runtime-settings.ts` and `engine-climate-context.ts` still read
  current public controls/runtime globals through their global compatibility
  factories, but their core builders now consume explicit targets.
- `engine-generation-session-services.ts` still wraps public-compatible seed,
  graph, option, grid, and active-view session behavior through global
  factories, but the grid session and session adapter core now consume explicit
  injected targets/factories.
- `engine-map-store.ts` default adapter still mutates global `grid`, `pack`, and
  `notes`, but map-store callers can now inject a non-global runtime adapter.
- `engine-note-service.ts` default adapter still backs note persistence with
  global `notes`, but note-service callers can now inject non-global storage.
- `engine-notice-service.ts` still delegates blocking/error modals to the
  current jQuery dialog host.
- `engine-render-adapter.ts` still delegates map/SVG rendering side effects to
  current DOM/SVG helpers through its global compatibility factory, but the core
  adapter now consumes explicit render targets.
- `engine-naming-service.ts`, `engine-route-service.ts`,
  `engine-state-service.ts`, and `engine-heraldry-service.ts` still forward to
  compatibility-mounted AGM services through their global factories, but their
  core services now consume explicit targets.

V4 should therefore judge this slice as boundary isolation, not full purity.
The correct finding is "compatibility adapters remain", not "runtime context
still owns scattered old UI/global calls".

## Command Layer Route Checkpoint

Autofix route writeback/undo now enters route operations through explicit
services instead of reading `globalThis.Routes` inline:

- `src/modules/engine-route-service.ts` now owns the default route command
  adapter for `connect`, `remove`, and `findById`, in addition to route query
  helpers. Its core service is composed through explicit route targets, while
  `createGlobalRouteService()` remains the compatibility factory for the
  current AGM `Routes` module mount and `pack.routes`.
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
  adapter for `add`, `remove`, and `findById`. Its core service is now composed
  through explicit burg targets, while `createGlobalBurgService()` remains the
  compatibility factory for the current AGM `Burgs` module mount and
  `pack.burgs`.
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
Viewport dimension updates now use a dedicated `ViewportPresetTargets`
boundary, moving preset lookup out of the Studio bootstrap file and covering
matching/swapped orientation sizing with focused tests.
Studio workflow watching now has a dedicated `StudioWorkflowWatcherTargets`
boundary for interval, focus, and visibilitychange registration plus workflow
sync/render decisions; the default adapter still uses browser events, while
tests can drive the callbacks without `window` or `document`.
Studio bootstrap now has a dedicated `StudioBootstrapTargets` boundary for
style injection, body/loading setup, initial state creation, DOMContentLoaded
startup, resize viewport sync, workflow watcher creation, and public
`studioViewportSync` mounting; `index.ts` now only wires the render function
into the bootstrap target factory.
Studio rendering now has a dedicated `StudioRendererTargets` boundary for
workflow/document/project-center sync, shell HTML writes, theme writes,
map/dialog host sync, overlays, viewport sync, canvas selection/paint binding,
and shell event binding; `index.ts` now only composes `createStudioRenderer()`
with the bootstrap target factory.
Canvas overlay sync now has a dedicated `CanvasOverlayTargets` boundary for
paint preview, tool HUD, and frame overlay DOM lookups. The default adapter
still queries the current Studio DOM, while focused tests exercise overlay
state updates with injected fake elements and no browser document.
Canvas tool interaction binding now has a dedicated `CanvasInteractionTargets`
boundary for canvas frame and map host lookup, control-event filtering, paint
preview lookup, selection lookup, overlay/HUD sync, viewport sync, and
paint-tool checks. The default adapter still wires the current Studio DOM and
engine viewport bridge, while focused tests drive pan, paint, and select
pointer flows with injected frame/host fakes.
Canvas selection highlighting now has a dedicated
`CanvasSelectionHighlightTargets` boundary for stale selection cleanup,
frame/map selected-state attributes, selected state path/border lookup, and
parent reordering. The default adapter still queries the current Studio DOM/SVG,
while focused tests exercise highlight cleanup and selected-state application
with injected fake elements.
Canvas interaction geometry now has a dedicated
`CanvasInteractionGeometryTargets` boundary for canvas frame lookup, engine
graph dimensions, and pack reads. The default adapter still composes current
DOM and engine canvas access helpers, while focused tests resolve selected
states with injected frame/graph/pack fakes and no browser document.
Canvas paint editing now has a dedicated `CanvasPaintEditingTargets` boundary
for graph dimensions, pack/grid cell access, edit-layer redraw, and timestamps.
The default adapter still composes current engine canvas access helpers, while
focused tests exercise preview creation, paint writes, undo, and biome coverage
batch writes with injected cells, redraw, and clock fakes.
Studio style injection now has a dedicated `StudioStyleTargets` boundary for
duplicate style detection, style element creation, and head insertion. The
default adapter still writes to the browser document, while focused tests verify
style injection and duplicate prevention through injected document fakes.
Studio document theme sync now has a dedicated `StudioThemeSyncTargets`
boundary. The default adapter still writes the theme dataset to the browser
document element, while `studioRenderer.ts` composes the sync helper instead of
owning the document write inline.
Studio bootstrap browser operations now have a dedicated
`StudioBootstrapDomTargets` boundary for body class setup, loading indicator
removal, resize listener wiring, document ready state reads,
DOMContentLoaded listener wiring, and public viewport sync mounting. The
default adapter still writes to browser DOM/window APIs, while
`studioBootstrap.ts` composes the DOM helper and no longer owns those direct
browser calls inline.
`StudioBootstrapDomTargets` now composes explicit body, browser event, and
viewport sync adapters via `createStudioBootstrapDomTargets`, keeping the
existing global factory compatible while separating body/loading setup from
resize/DOMContentLoaded wiring and public viewport sync mounting.
Engine host target composition now has an explicit `createEngineHostTargets`
composer for injected DOM and dialog adapters, while
`createGlobalEngineHostTargets` remains the default browser/jQuery-dialog
compatibility factory.
Engine editor target composition now has an explicit `createEngineEditorTargets`
composer for injected handler runtimes and dialog adapters, while
`createGlobalEngineEditorTargets` remains the default editor handler and
jQuery-dialog compatibility factory.
Engine topbar target composition now has an explicit `createEngineTopbarTargets`
composer and data-action adapter, while `createGlobalEngineTopbarTargets`
remains the default bridge over current Data actions.
Project center default browser/runtime access now has a dedicated
`projectCenterTargets.ts` adapter for recent-project storage, engine project
summary reads, and clock access. `projectCenter.ts` continues to re-export the
target type/factory for existing call sites, while the state update/load logic
no longer owns those direct calls inline.
Studio preference default browser access now has a dedicated
`preferenceTargets.ts` adapter for language/theme/navigation storage and
document language/theme writes. `preferences.ts` continues to re-export the
target type/factory for existing call sites, while the preference read/persist
logic no longer owns those direct browser calls inline.
Generation profile default runtime access now has a dedicated
`generationProfileTargets.ts` adapter for engine project summary reads, world
draft creation, pending generation setting writes, and clock access.
`generationProfile.ts` continues to re-export the target type/factory for
existing call sites, while profile override and impact logic no longer owns
those direct bridge/timestamp calls inline.
Document state sync/restore now has a dedicated `DocumentStateTargets`
boundary for editor workflow reads, engine document/style reads, document name
writes, and layer restore operations. `documentState.ts` continues to re-export
the target type/factory while its sync/restore logic no longer owns direct
bridge calls inline.
`documentStateTargets.ts` now also exposes `createDocumentStateTargets` for
explicit document/editor/layer target composition, keeping injected target sets
separate from the global default bridge factory.
Project workspace setting changes now have a dedicated
`ProjectWorkspaceActionTargets` boundary for project setting setters, document
name writes, canvas-size writes, autosave writes, and project-summary sync.
`projectWorkspaceActions.ts` continues to re-export the target type/factory
while its action routing logic no longer owns direct bridge setter maps inline.
`projectWorkspaceActionTargets.ts` now also exposes
`createProjectWorkspaceActionTargets` for explicit project write target
composition, keeping injected write targets separate from the default engine
bridge setter factory.
Initial Studio state default runtime access now has a dedicated
`initialStateTargets.ts` adapter for engine document reads, style preset reads,
viewport preset lookup, preference targets, and project-center storage targets.
`initialState.ts` continues to re-export the target type/factory while startup
state construction no longer owns those default adapter imports inline.
`initialStateTargets.ts` now also exposes `createInitialStateTargets` for
explicit startup target composition, keeping injected startup dependencies
separate from the global default engine/browser factory.
Studio bootstrap default runtime access now has a dedicated
`studioBootstrapTargets.ts` adapter for style injection, DOM startup helpers,
initial state creation, viewport dimension updates, root creation, project
summary sync, document sync, workflow watching, and viewport sync.
`studioBootstrap.ts` continues to re-export the target type/factory while
bootstrap orchestration no longer owns those default adapter imports inline.
`studioBootstrapTargets.ts` now also exposes `createStudioBootstrapTargets` for
explicit startup target composition, keeping injected bootstrap dependency sets
separate from the global Studio/browser bridge factory.
Studio renderer default runtime access now has a dedicated
`studioRendererTargets.ts` adapter for editor/document sync, project center
updates, shell rendering, root writes, document theme writes, map/dialog host
sync, overlay sync, viewport sync, canvas selection/paint interaction binding,
focus resolution, shell event binding, project-summary sync, and viewport
dimension updates. `studioRenderer.ts` continues to re-export the target
type/factory while render orchestration no longer owns those default adapter
imports inline.
`studioRendererTargets.ts` now also exposes `createStudioRendererTargets` for
explicit renderer target composition, keeping injected renderer dependency sets
separate from the global Studio/browser bridge factory.
Canvas interaction default runtime access now has a dedicated
`canvasInteractionTargets.ts` adapter for canvas frame/host lookup, control
event detection, paint preview geometry, selection geometry, overlay/HUD sync,
viewport sync, and paint-tool checks. `canvasController.ts` continues to
re-export the target type/factory while pointer gesture handling no longer owns
those default adapter imports inline.
`canvasInteractionTargets.ts` now also exposes `createCanvasInteractionTargets`
for explicit canvas gesture target composition, keeping injected targets
separate from the global Studio/browser bridge factory.
Canvas overlay default DOM access now has a dedicated `canvasOverlayTargets.ts`
adapter for paint preview overlay lookup, tool HUD lookup, and canvas frame
lookup. `canvasOverlaySync.ts` continues to re-export the target type/factory
while overlay state syncing no longer owns those document queries inline.
`canvasOverlayTargets.ts` now also exposes `createCanvasOverlayTargets` for
explicit overlay target composition, keeping injected DOM targets separate from
the global browser document factory.
Canvas selection highlight default DOM access now has a dedicated
`canvasSelectionHighlightTargets.ts` adapter for selected state queries,
selected border queries, canvas frame/host lookup, state path lookup, state
border lookup, and parent reordering. `canvasSelectionHighlight.ts` continues
to re-export the target type/factory while selection highlight syncing no longer
owns those document queries inline.
`canvasSelectionHighlightTargets.ts` now also exposes
`createCanvasSelectionHighlightTargets` for explicit highlight target
composition, keeping injected DOM targets separate from the global
Studio/browser document factory.
Canvas interaction geometry default runtime access now has a dedicated
`canvasInteractionGeometryTargets.ts` adapter for canvas frame lookup, graph
size reads, and pack reads. `canvasInteractionGeometry.ts` continues to
re-export the target type/factory while pointer geometry resolution no longer
owns those default adapter imports inline.
`canvasInteractionGeometryTargets.ts` now also exposes
`createCanvasInteractionGeometryTargets` for explicit frame/graph/pack target
composition, keeping injected targets separate from the global Studio/browser
bridge factory.
Canvas paint editing default runtime access now has a dedicated
`canvasPaintEditingTargets.ts` adapter for graph size reads, pack/grid cell
reads, edit-layer redraw, and timestamp generation. `canvasPaintEditing.ts`
continues to re-export the target type/factory while preview, paint apply,
undo, and biome coverage paths no longer own those default adapter imports
inline.
`canvasPaintEditingTargets.ts` now also exposes
`createCanvasPaintEditingTargets` for explicit paint editing target
composition, keeping injected targets separate from the global engine canvas
factory.
Studio style injection default DOM access now has a dedicated
`stylesTargets.ts` adapter for style element lookup, creation, and head
insertion. `styles.ts` continues to re-export the target type/factory while
stylesheet composition no longer owns those document calls inline.
`stylesTargets.ts` now also exposes `createStudioStyleTargets` for explicit
style-document target composition, keeping injected targets separate from the
global browser document factory.
Studio document theme sync default DOM access now has a dedicated
`studioThemeSyncTargets.ts` adapter for document-element theme dataset writes.
`studioThemeSync.ts` continues to re-export the target type/factory while
theme synchronization no longer owns that document call inline.
`studioThemeSyncTargets.ts` now also exposes `createStudioThemeSyncTargets`
for explicit theme-document target composition, keeping injected targets
separate from the global browser document factory.
Studio preference default browser access is now split into explicit storage and
document adapters inside `preferenceTargets.ts`; `createStudioPreferenceTargets`
composes those adapters for language/theme/navigation persistence while keeping
the existing global factory compatible with current call sites.
Project center default browser/runtime access is now split into explicit
storage, summary, and clock adapters inside `projectCenterTargets.ts`;
`createProjectCenterTargets` composes those adapters for recent-project
persistence while keeping the existing global factory compatible with current
call sites.
Generation profile default runtime access is now split into explicit summary,
draft, settings, and clock adapters inside `generationProfileTargets.ts`;
`createGenerationProfileTargets` composes those adapters for profile defaults,
result sampling, engine setting writes, and impact timestamps while keeping the
existing global factory compatible with current call sites.
Studio workflow watcher default runtime access is now split into explicit sync,
render, and browser lifecycle adapters inside `studioWorkflowWatcher.ts`;
`createStudioWorkflowWatcherTargets` composes those adapters for workflow sync,
render callbacks, interval scheduling, focus events, and visibility events
while keeping the existing global factory compatible with current call sites.
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
Options session now exposes `createRuntimeOptionsSession(context)`.
`getGlobalEngineRuntimeContext()` wires `optionsSession` through that runtime
factory instead of keeping the global singleton on the context. The runtime
options session still uses the compatibility controls/reader for DOM setting
application, but era naming and random option generation are now sourced from
`context.naming` and `context.random`. `createRuntimeOptionsWriterAdapter`
also writes runtime-owned values to `context.options`,
`context.generationSettings`, and `context.units` before delegating to the
compatibility writer. This keeps current UI behavior stable while making the
next replacement step narrower: replace individual compatibility option writer
methods with typed runtime settings commands.
Seed session now exposes `createRuntimeSeedSession(context)` and runtime
targets that write resolved seeds to `context.seed` and `context.options.seed`
before delegating to the compatibility seed targets. Runtime-generated seeds
use `context.random.next()`. The remaining compatibility pieces are the URL /
history reads, `optionsSeed` input synchronization, and seeded `Math.random`
installation.
Graph session now exposes `createRuntimeGraphSession(context)` and runtime
targets that read/write graph dimensions through `context.worldSettings` before
delegating SVG rect/mask updates to the compatibility graph targets. The
remaining compatibility pieces are the map size DOM inputs and rendered SVG
selection targets.
Generation session now exposes `createRuntimeGenerationSessionAdapter(context)`
and `createRuntimeGenerationSessionServices(context)`. Runtime context wires
`generationSession` through the bound runtime adapter, so
`context.generationSession.prepare(request)` can use the context-owned
session/lifecycle/seed/graph/options/grid services without requiring callers to
pass the same context back as a second argument. The global adapter remains for
compatibility entry points.
`EngineGenerationPipeline.prepareGenerationSession()` now relies on that bound
runtime adapter and no longer passes the context as a second argument.
`getGlobalEngineRuntimeContext()` no longer creates the full global generation
session service set just to overwrite it. Runtime-owned session services
(`seedSession`, `graphSession`, `gridSession`, `optionsSession`, and
`generationSession`) are initialized after the context object exists.
Generation settings now have an optional `EngineGenerationSettingsStore`
runtime capability. The global runtime context wires
`generationSettingsStore` for `get/replace/patch/refresh`, while lightweight
algorithm test contexts can omit it. `refresh` still reads through the existing
generation settings targets by default, so DOM compatibility remains isolated
behind the settings adapter.
World settings now have the same optional store pattern through
`EngineWorldSettingsStore`. The global runtime context wires
`worldSettingsStore` for graph size/map coordinate `get/replace/patch/refresh`,
while compatibility DOM/global reads remain behind `EngineWorldSettingsTargets`.
Runtime options and graph session writes now use those stores when available:
`createRuntimeOptionsWriterAdapter` patches `generationSettingsStore` for
generated counts/growth/culture settings, and `createRuntimeGraphSessionTargets`
patches `worldSettingsStore` for graph dimensions. Lightweight contexts still
fall back to direct context field updates.
Runtime grid and graph sessions now also read graph dimensions through
`worldSettingsStore.get()` when available, keeping session-level graph size
reads and writes on the same runtime settings boundary.
Lifecycle adapter now creates a `EngineLifecycleSettingsSnapshot` from the
runtime context, preferring `generationSettingsStore.get()` and
`worldSettingsStore.get()` when available. Lifecycle methods read that snapshot
instead of scattering direct settings field access through each method.
Map coordinate lifecycle settings now use a named `EngineMapCoordinateSettings`
type, preparing that helper path for a later runtime-owned map placement
service.
Map placement now has a formal `EngineMapPlacementService` with global
compatibility targets for `defineMapSize` and `calculateMapCoordinates`.
`getGlobalEngineRuntimeContext()` wires `mapPlacement`, and lifecycle targets
can be composed from runtime services instead of directly owning those public
helper calls.
Lifecycle map placement calls now prefer `context.mapPlacement` when an
explicit runtime context provides it, falling back to lifecycle targets for
compatibility contexts. This keeps the generation path behavior stable while
moving map size and coordinate placement behind a runtime-owned service.
Lifecycle water feature preparation now has a formal
`EngineWaterFeatureService` for `addLakesInDeepDepressions`,
`openNearSeaLakes`, and `OceanLayers`. `getGlobalEngineRuntimeContext()` wires
`waterFeatures`, and lifecycle calls prefer the explicit context service before
falling back to compatibility lifecycle targets.
Map graph lifecycle preparation now has a formal
`EngineMapGraphLifecycleService` for `reGraph` and `createDefaultRuler`.
`preparePackGraph()` passes the active runtime context into lifecycle calls, so
explicit contexts can route graph rebuild/ruler creation through
`context.mapGraphLifecycle` without falling back to global helpers.
Generation statistics now has a formal `EngineGenerationStatisticsService` for
`showStatistics`. `getGlobalEngineRuntimeContext()` wires
`generationStatistics`, and lifecycle statistics display prefers the explicit
context service before falling back to compatibility lifecycle targets.
Pipeline context refreshes after generation-session preparation, pack reset,
and map placement now go through `context.mapStore.getCurrentContext()` instead
of direct `EngineGenerationPipeline.getCurrentContext()` calls. The behavior is
unchanged for compatibility contexts, but the refresh boundary is now owned by
the runtime map store instead of scattered through the pipeline.
Culture extreme-climate warnings now use the explicit runtime context notice/log
services only. The previous fallback to `getGlobalEngineRuntimeContext()` for
notices was removed, so culture generation no longer reaches back into the
global runtime just to display that warning.
Route generation now accepts an explicit runtime context when regenerating from
locked route data (`Routes.generate(lockedRoutes, context)`). The legacy
single-argument locked-route call still falls back to the global context for
compatibility, while Studio/runtime callers can avoid that global lookup.
Religion manual operations now have explicit runtime context paths:
`Religions.recalculate(context)`, `Religions.add(center, context)`, and
`Religions.getDeityName(culture, context)`. The no-argument compatibility calls
remain, but direct/runtime command callers can avoid global `pack` and global
runtime lookups for these operations.
Engine editor and host dialog targets now use Studio-first composite dialog
adapters. Default wiring checks Studio-owned dialog selectors/data attributes
before falling back to the jQuery UI compatibility adapters. This does not
remove old public dialogs yet, but it gives new Studio dialogs a non-jQuery
path through the existing target factories.
Targeted coverage was added for three audit gaps: `ProvinceModule.generate`
now has an explicit runtime-context generation fixture, `createGlobalRandomService`
has direct delegation coverage, and `Resampler.process` has a smoke test that
drives the map-store reset, generation pipeline calls, province pole refresh,
and statistics lifecycle through an injected `EngineRuntimeContext`. `Resampler`
is now exported for tests while the existing `window.Resample` compatibility
mount remains unchanged.
Religion naming now accepts deity-less forms safely. `generateReligionName`
accepts `string | null`, `Animism` and `Non-theism` no longer call
`split()` on a null deity, and the explicit `add(center, context)` path has
regression coverage for that case.
Font resources now expose a formal `createFontResourceRuntime()` and
`installGlobalFontResourceCompatibility()` boundary. `fonts.ts` no longer
declares the eight compatibility globals as TypeScript `var` globals; the
existing public UI/export callers still receive the same runtime values through
the centralized compatibility installer until those callers are migrated to
injected font-resource commands.
Voronoi now has direct coverage for constructing cells and circumcenter
vertices from a real `Delaunator` graph. This closes the previous "zero direct
test" audit gap for the base geometric graph module.
Git status audit note: this branch is no longer at a single initial commit.
`git rev-list --count HEAD` reported 164 commits before this Voronoi coverage
slice, so any "only one commit" checklist item is stale for the current branch.
The module-level `document.` reference audit was also rechecked. Several hits
are already in target/adapter factories (`engine-generation-settings`,
`engine-render-adapter`, `fonts.ts`), while `heightmap-generator.ts` and
`emblem/*` had real DOM-backed algorithm/rendering paths that are being moved
behind dedicated services slice by slice.
`heightmap-generator.ts` no longer directly creates the precreated-heightmap
canvas/image in the algorithm path. The new `HeightmapImageTargets` boundary
wraps canvas and image creation, `createGlobalHeightmapImageTargets()` keeps
the browser compatibility behavior, and the precreated heightmap path now has
test coverage through injected image targets.
`emblem/generator.ts` no longer reads `#emblemShape` directly inside
`getShield()`. The new `EmblemShapeTargets` boundary wraps selected shield
shape lookup, default browser behavior remains in
`createGlobalEmblemShapeTargets()`, and generator tests now cover fixed shape,
state fallback, and culture fallback through injected targets.
`emblem/renderer.ts` now uses `EmblemRendererTargets` for charge fetches, SVG
charge parsing, `#coas` insertion, rendered element lookups, rendered-use
checks, and emblem layer state. The default browser behavior remains in
`createGlobalEmblemRendererTargets()`, `window.COArenderer` is guarded for
non-browser imports, and renderer tests cover injected add, skip-existing, and
draw-missing paths.
`utils/graphUtils.ts` now uses `DrawHeightsTargets` for raster height preview
canvas creation. `drawHeights()` keeps the browser default in
`createGlobalDrawHeightsTargets()`, while focused tests verify pixel writes and
data URL generation through injected canvas fakes.
`utils/index.ts` no longer requires browser globals during pure module imports.
Window compatibility assignments are still installed for browser builds, but
`Node.prototype` patches and prompt initialization now guard missing
`Node`/`document`. The utils barrel has a no-browser import regression test,
and `emblem/generator.test.ts` no longer stubs browser globals just to import
the module.
`utils/commonUtils.ts` now has a `StudioInputPromptTargets` boundary around
the Studio input prompt compatibility layer. Dialog creation, body insertion,
keydown listeners, removal of the old `#prompt`, global request installation,
and error-flag reads are injectable; the browser default remains in
`createGlobalStudioInputPromptTargets()`. Focused tests cover installing and
submitting the input prompt through fake targets.
`utils/commonUtils.ts` also now has browser compatibility targets for URL
opening and URL-to-data-URI conversion. `openURL()` and `wiki()` route through
`BrowserNavigationTargets`, while `getBase64()` routes through
`BrowserBlobReaderTargets`; default browser behavior remains backed by
`window.open`, `XMLHttpRequest`, and `FileReader`, and focused tests cover the
injected paths.
`parseError()` now reads browser user-agent information through
`BrowserEnvironmentTargets`; default behavior still uses `navigator.userAgent`,
and focused tests cover Firefox stack parsing through an injected environment.
`clipPoly()`, `getNextId()`, and `byId()` now route their remaining browser
global lookups through small injectable targets. Default behavior still reads
the current browser `window.ERROR` / `document.getElementById`, while focused
tests cover undefined-point warnings, unique ID lookup, and shorthand DOM
lookup through fakes.
`engine-options-session.ts` now routes locale reads through
`EngineOptionsLocaleTargets` instead of reading `navigator.language` directly
inside option randomization controls. `engine-seed-session.ts` now routes the
`#optionsSeed` DOM lookup through `EngineSeedDomTargets`. Default browser
adapters still preserve the current runtime behavior, and focused tests cover
both injected paths.
`engine-seed-session.ts` now also separates seed runtime globals
(`mapHistory`, `location.href`, `seed`, `aleaPRNG`) into
`EngineSeedRuntimeTargets`, while `createGlobalSeedSessionTargets()` remains
backward-compatible for the current public runtime.
`engine-render-adapter.ts` now exports `createGlobalRenderTargets()`, so the
default DOM/SVG render helpers are an explicit target factory and
`createGlobalRenderAdapter()` can be composed with injected render targets.
`engine-generation-session-services.ts` now separates default session service
lookup into `EngineGenerationSessionServiceTargets`, so compatibility reads for
`EngineSeedSession`, `EngineGraphSession`, `EngineOptionsSession`, lifecycle,
and grid-session creation are explicit and injectable.
`engine-graph-session.ts` now separates map dimension globals
(`mapWidthInput`, `mapHeightInput`, `graphWidth`, `graphHeight`) from SVG
selection lookups via `EngineGraphRuntimeTargets` and `EngineGraphSvgTargets`.
`heightmap-generator.ts` now restores the previous global `Math.random` after
heightmap generation, including failure paths after the seeded Alea generator is
installed; focused tests cover the restoration behavior.
`features.ts` now restores the previous global `Math.random` after
`markupGrid()` installs the seeded Alea generator; focused tests cover the
restoration behavior.
`ice.ts` now restores the previous global `Math.random` after ice generation
installs the seeded Alea generator; focused tests cover the restoration
behavior.
`river-generator.ts` now restores the previous global `Math.random` after
river generation installs the seeded Alea generator, including failure paths;
focused tests cover the restoration behavior.
`provinces-generator.ts` now restores the previous global `Math.random` after
province generation installs the seeded Alea generator, including failure paths;
focused tests cover the restoration behavior.
`provinces-generator.ts` also routes burg type lookup through
`context.burgs.getType(...)` instead of calling the global `Burgs.getType`
mount directly; the default burg service still delegates to the mounted module
for compatibility.
`routes-generator.ts` now accepts explicit runtime context for route query
helpers (`isConnected`, `areConnected`, `getRoute`, `hasRoad`, `isCrossroad`,
`getConnectivityRate`, `getNextId`, and route naming burg lookups). The runtime
route service passes context into those module calls; rendered route removal and
SVG length measurement remain deferred.
`EngineRouteService` now also exposes a `getLength(routeId)` adapter method so
future route-length consumers can depend on the route service boundary instead
of calling the mounted `Routes.getLength()` / rendered SVG selector directly.
`Routes.getLength(routeId, context)` now prefers
`context.rendering.getElementTotalLengthById(...)`; the old
`routes.select(...).node().getTotalLength()` path is retained only as a
compatibility fallback.
`Routes.remove(route, context)` now updates route data through `context.pack`
and removes the rendered route through `context.rendering.removeElementById`
when available; the old `viewbox.select(...).remove()` path is retained only as
a compatibility fallback.
`Rivers.remove(id, context)` now removes river and tributary data through
`context.pack` / `context.grid` and removes rendered river paths through
`context.rendering.removeElementById` when available; the old
`rivers.select(...).remove()` path remains only as a compatibility fallback.
`EngineBurgService` now forwards runtime context into `Burgs.add(...)`,
`Burgs.remove(...)`, and `Burgs.getType(...)`, so manual burg commands routed
through the service use the same explicit context as the generator methods.
`EngineStateService` now has a runtime-context factory and forwards context
into `States.generateCampaign(...)` and `States.getPoles(...)`; the global
factory now reads the module mount safely through `globalThis.States`, so
non-browser runtime-context tests do not require a bare `States` global.
`EngineNamingService` and `EngineHeraldryService` now read default module
mounts through `globalThis.Names` / `globalThis.COA` and provide stable
fallback values when those compatibility mounts are absent.
Water feature and map graph lifecycle default targets now guard missing public
helpers through `globalThis.*?.(...)`, keeping no-browser runtime tests from
requiring those compatibility functions.
Feedback, generation statistics, and map placement default targets now use the
same guarded `globalThis.*?.(...)` pattern, so missing `tip`,
`showStatistics`, `defineMapSize`, or `calculateMapCoordinates` helpers no
longer break no-browser runtime tests.
Notice compatibility defaults now also guard missing dialog/action globals:
`alertMessage`, `$`, `parseError`, `clearMainTip`, `cleanupData`, and
`regenerateMap` can be absent in no-browser runtime tests without throwing.
Runtime settings, generation settings, seed session, and render adapter DOM
targets now use guarded `globalThis.document?.getElementById(...)` lookups, so
their default factories stay safe when browser DOM globals are absent.
Font resource and emblem default targets now also guard absent browser globals:
`document`, `FontFace`, `FileReader`, `changeFont`, `tip`, `provs`, `emblems`,
and `layerIsOn` no longer have to exist for no-browser runtime imports/tests.
Heightmap image targets and render cell lookup now also guard missing browser
globals: absent `document`, `Image`, or `findCell` no longer makes their
default target factories throw in no-browser runtime tests.
Map host and editor bridge targets now cover missing browser globals in their
default adapters: absent `Event`, `window.getComputedStyle`, `window`, or
`document` no longer breaks no-browser bridge tests.
Export, project action, and style bridge targets now guard form event dispatch
and option creation when `Event` or `Option` constructors are absent; values
still update, while dispatch/option creation becomes a safe no-op.
Canvas interaction, overlay, selection highlight, and interaction geometry
targets now guard default DOM/SVG lookups when `document`, `Element`, or
`SVGElement` are absent; browser behavior is unchanged, while no-browser target
tests receive null/empty results instead of import-time adapter failures.
Preference, project-center, theme-sync, and style-injection app targets now
guard missing `localStorage`, `document`, `documentElement`, and `head`
adapters. Reads return null, writes become safe no-ops, and style creation
falls back to an inert style-like element in no-browser tests.
Bootstrap DOM, workflow watcher, engine host, and project-control DOM helpers
now guard missing `window`, `document`, and `Event` browser globals. Startup
body writes, loading cleanup, resize/visibility listeners, host element
creation, form event dispatch, and stored-setting locks all degrade safely in
no-browser target tests.
Project summary, project control, and style bridge targets now also guard
blocked browser storage getters. If `localStorage` or `sessionStorage` access
throws, summary/style reads return null and project-control/style writes become
safe no-ops while runtime state updates continue.
Project climate targets now guard missing browser scheduler/DOM paths while
preserving the AGM module mount compatibility calls for Rivers, Biomes,
Features, Lakes, temperature, and precipitation. If no scheduler is available,
climate redraw scheduling becomes a safe no-op instead of throwing.
Project form and data action target coverage now includes no-browser fallback
paths. Form reads return caller fallbacks when DOM/options are absent, and data
actions report unavailable capabilities while async operations resolve safely
when public runtime helpers are not mounted.
Studio preference and project-center app targets now also guard blocked
`localStorage` access. Reads return null and writes become safe no-ops when the
browser storage getter throws.
Map host document-baseline fallback also guards blocked `localStorage` access
before reading the stored style preset.
Startup target composition now covers the blocked-storage path through the
default preference and project-center adapters.
Engine host DOM and dialog DOM adapters now also guard blocked `document`
access; host lookups return null, created elements fall back to inert objects,
and dialog queries return an empty list.
Generation settings DOM targets now guard blocked `document` access and keep
the default settings fallback path available without browser controls.
Render adapter DOM element lookups now also guard blocked `document` access;
element removal and SVG length probes degrade to no-op/undefined.
Runtime settings and seed-session DOM targets now guard blocked `document`
access; settings input reads keep caller fallbacks and options-seed writes
become safe no-ops.
Font resource and emblem generator/renderer browser targets now also guard
blocked `document` access; font selection, font-face registration, emblem shape
selection, and COA SVG insertion safely no-op or fall back when DOM access is
unavailable.
Burg icon and label renderer compatibility exports now guard blocked
`document` access for single-item removal, keeping renderer command entry
points safe in DOM-restricted harnesses while preserving browser mounts.
Draft file IO and heightmap PNG export default targets now guard blocked
`document`/`window` access; downloads degrade to inert links, JSZip loading
keeps the existing unavailable-service error path, and PNG export reports the
canvas-context error instead of crashing on global access.
The public utils compatibility barrel now guards blocked `window`, `document`,
and `Node` access during import, so browser utility mounts degrade to an inert
mount object in restricted runtime harnesses instead of failing module load.
Common utility browser targets now guard blocked or absent navigator, window,
XHR, FileReader, and Studio prompt DOM access. Graph height preview canvas
creation also degrades to an inert canvas target when `document` is blocked.
Node and shorthand DOM lookup helpers now guard blocked `document` access.
Debug drawing helpers now no-op when `window` or the debug SVG layer is absent,
while preserving the mounted debug-layer path.
Relief, ice, and military renderer compatibility mounts now guard absent
`window` access at import time. Relief icon placement now imports
`poissonDiscSampler` directly from AGM utilities instead of reading it from the
browser mount.
Remaining renderer compatibility mounts now use absent-window-safe installers
for borders, emblems, features, heightmap, markers, scale bar, state labels,
temperature, and burg icon/label exports. Marker rendering now uses the local
pin helper instead of reading `getPin` from the browser mount.
Burg icon and label removal renderers now expose injectable document targets,
so command/render adapter tests can exercise single-item removal without
reading the browser global document; the mounted `window.drawBurg*` compatibility
functions remain unchanged.
`emblem/renderer.ts` now also uses a guarded `window.COArenderer` compatibility
mount, so blocked `window` access no longer breaks no-browser imports.
Feedback and log services now expose explicit global target factories, keeping
service composition separate from browser/runtime globals. `CellRanking`,
`Lakes`, `EngineOptionsSession`, `EngineGraphSession`, and `EngineSeedSession`
compatibility mounts now also guard blocked `window` access; focused tests
cover the import path that previously failed through the runtime-context chain.
`Biomes`, `Features`, `Ice`, and `OceanLayers` compatibility mounts now guard
blocked `window` access as well. These remain AGM module mounts for the public
orchestration path, not old-system algorithm dependencies.
`getEngineWorldDimensions(context)` now centralizes the compatibility fallback
from runtime world settings to browser graph globals. Burgs, Cultures, and
Rivers consume that helper instead of reading `globalThis.graphWidth` /
`globalThis.graphHeight` directly in their generation helpers.

`engine-runtime-settings.ts` now routes settings input lookups through
`EngineSettingsDomTargets`, keeping the browser `document.getElementById`
access inside the default adapter while allowing runtime world settings to be
tested through injected DOM targets.

`engine-generation-settings.ts` now splits generation settings browser access
into `EngineGenerationDomTargets` and `EngineGenerationGlobalControlTargets`.
The existing `createGlobalGenerationSettingsTargets()` entry point remains
compatible, while tests can compose generation settings from injected DOM and
global-control adapters.

`emblem/generator.ts` now routes the `#emblemShape` lookup through
`EmblemShapeDomTargets`. The public `createGlobalEmblemShapeTargets()` default
adapter preserves current browser behavior, while the generator can be tested
with injected DOM shape targets.

`fonts.ts` now composes its browser font compatibility adapter from
`EngineBrowserFontResourceTargets`. Direct `document`, `FontFace`, toast,
network, and province-font effects are concentrated in the default browser
targets, while focused tests cover injected adapter composition and the global
font runtime compatibility facade.
Font resource tests also cover the default data-URI reader failure path when
`FileReader` is unavailable, so browser capability gaps fail explicitly instead
of hanging or silently degrading during export.
Runtime direct-editor action targets can now inject the document-sync adapter
instead of always binding the global document-state sync path, keeping focus and
mutation runtime injection aligned with document synchronization.
`EngineRouteService` now exposes `createGlobalRouteServiceTargets()`, so the
remaining default `Routes` / `pack.routes` global reads are isolated in a typed
target factory instead of being embedded directly in service construction.
`EngineStateService` and `EngineBurgService` now expose
`createGlobalStateServiceTargets()` and `createGlobalBurgServiceTargets()`.
Their default `States`, `Burgs`, and `pack.burgs` compatibility reads are now
isolated in typed target factories as well.
`EngineNamingService` and `EngineHeraldryService` now expose
`createGlobalNamingServiceTargets()` and `createGlobalHeraldryServiceTargets()`,
isolating the remaining default `Names`, `COA`, and shield-weight picking
compatibility reads behind typed service targets.
Canvas overlay default DOM access now has a separate
`createGlobalCanvasOverlayDomTargets()` boundary. The overlay sync facade keeps
the same public target factory, while tests cover blocked `document` access.
Canvas selection highlight default DOM access now has a separate
`createGlobalCanvasSelectionHighlightDomTargets()` boundary as well, with
blocked `document` coverage for selected state and state-border lookups.
Canvas interaction default DOM access now has a separate
`createGlobalCanvasInteractionDomTargets()` boundary for the canvas frame, map
host, and control-event checks. Runtime canvas interaction targets can now
reuse an injected DOM adapter while tests cover blocked `document` access.
Canvas interaction geometry default DOM access now also has a separate
`createGlobalCanvasInteractionGeometryDomTargets()` boundary for frame lookup,
with runtime geometry targets accepting the injected DOM adapter.
Heightmap image creation now has a separate
`createGlobalHeightmapImageBrowserTargets()` boundary for browser canvas and
image constructors. The public heightmap image target factory remains
compatible while tests cover blocked `document` and `Image` access.
Engine render DOM lookup now has a separate `createGlobalRenderDomTargets()`
boundary. The default render target factory composes that DOM adapter while
keeping existing global render helper delegation unchanged.
Generation settings global control access now guards `pointsInput` and
`heightExponentInput` through `createGlobalGenerationControlTargets()`, so
restricted global getters fall back to defaults instead of throwing.
Seed session runtime global access now guards `mapHistory`, `location`, and
`aleaPRNG` reads. The default seed runtime target preserves compatibility while
blocked globals now fall back to no history, empty URL params, and no RNG
replacement.
Runtime settings global access now guards world, population, unit, and timing
globals. Blocked getters fall back to empty coordinates, zero numeric settings,
`m` height units, and disabled timing.
Font browser resource targets now guard optional browser globals including
`FontFace`, `FileReader`, `fetch`, `changeFont`, `tip`, `ERROR`, and `provs`.
Unavailable or blocked globals now fall back to no-op behavior or explicit
resource loading errors.

Emblem renderer browser targets now guard optional browser globals including
`fetch`, `emblems`, `layerIsOn`, and `ERROR`. Blocked globals now fall back to
explicit fetch errors, no rendered uses, disabled layers, and no error logging.
Charge SVG fetch failures now report through
`EmblemRendererTargets.reportChargeFetchError`, so `EmblemRenderModule` no
longer reads the global `ERROR` flag directly.
Emblem generator shield selection now uses injectable `EmblemRuntimeTargets` for
state/culture shield lookup and missing-shield diagnostics. The default target
keeps current `pack` / `ERROR` compatibility while blocked globals fall back to
the heater shield without throwing.
`pathUtils.connectVertices(...)` now reports invalid vertex chains through
injectable `PathLogTargets`. The default target keeps current `window.ERROR`
compatibility, but blocked window access no longer throws from the core path
utility.
`languageUtils.list(...)` now guards `document.documentElement.lang` access and
falls back to English when browser document globals are absent or blocked.
`draw-features.ts` now reports undefined feature-path vertices through
injectable `FeatureRendererLogTargets`. The default target keeps current
`ERROR` compatibility while blocked `ERROR` access falls back without throwing.
`draw-heightmap.ts` now exposes `connectHeightmapVertices(...)` and reports
stalled heightmap vertex chains through injectable `HeightmapRendererLogTargets`.
The default target keeps current `ERROR` compatibility while blocked `ERROR`
access falls back without throwing.
`draw-burg-icons.ts` now routes icon/anchor DOM reads through
`BurgIconRendererTargets` (`getElementById`, `querySelector`, and
`querySelectorAll`) instead of letting renderer logic call `document.*`
directly after acquiring the global document.
`draw-burg-labels.ts` now follows the same target split for label DOM reads,
using `BurgLabelRendererTargets.getElementById` and `querySelectorAll` while
keeping the default global document adapter as the compatibility path.
`draw-temperature.ts` now routes the `temperatureEquatorOutput` DOM lookup
through `TemperatureRendererTargets`, leaving `byId` only in the default
compatibility adapter and making missing controls a no-op.
`graphUtils.ts` now routes `pointsInput.dataset.cells` through
`GridPointSettingsTargets`, so `generateGrid` and `shouldRegenerateGrid` can
take injected point-count settings while the default compatibility adapter still
reads the existing DOM control.
`engine-options-session.ts` no longer depends on global `byId` to find
`templateInput`; the default browser-control adapter now uses a guarded local
document lookup before delegating to `applyOption`.
`markers-generator.ts` now reads the culture-set selector through injectable
`MarkersBrowserTargets`, keeping the DOM lookup in the default compatibility
adapter and allowing tests/runtime callers to choose fantasy marker config
without browser globals.
`debugUtils.ts` now routes debug-layer and color-scheme access through
`DebugDrawingTargets`, so debug drawing helpers no longer read `window.debug`
or `window.getColorScheme` directly outside the default compatibility adapter.
`heightmap-generator.ts` now routes heightmap template lookup through
`HeightmapTemplateTargets`, so template-backed generation can run against an
injected template source instead of reading `heightmapTemplates` directly.
The same module now routes template tool world dimensions through
`HeightmapWorldTargets`, removing direct `graphWidth` / `graphHeight` reads
from the template generation path outside the default compatibility adapter.
`engine-options-session.ts` now routes heightmap template weight/name lookup
through `EngineOptionsHeightmapTemplateTargets`, so option randomization can
read from an injected template catalog instead of scanning `heightmapTemplates`
directly.
`engine-climate-context.ts` now routes height exponent, point count, and
precipitation input lookups through `EngineClimateInputTargets`, so global
input controls remain isolated in the default climate compatibility adapter.
`engine-options-session.ts` now centralizes default browser control writes
through safe global control helpers, reducing raw public-control writes and
keeping missing compatibility globals from throwing during option writes.

`ocean-layers.ts` now routes outline-chain error reporting through
`OceanLayerLogTargets`, keeping the default `globalThis.ERROR` compatibility
behavior isolated while making stalled-chain reporting testable without browser
globals.

`heightmap-generator.ts` now routes invalid range diagnostics through
`HeightmapLogTargets`. The default target preserves the existing
`globalThis.ERROR` behavior, and tests can assert diagnostics without reading
browser globals.

`names-generator.ts` now creates its default warning/error/tip behavior through
`createGlobalNamesRuntimeAdapters()`. `NamesGenerator` itself uses injected
runtime adapters for diagnostics, tips, and randomness instead of scattering
global fallbacks across methods.
Default log adapters in `names-generator.ts`, `heightmap-generator.ts`, and
`ocean-layers.ts` now guard `WARN` / `ERROR` flag reads, so blocked
compatibility globals no longer throw while diagnostics remain injectable.
`engine-log-service.ts` now applies the same guarded flag reads at the shared
runtime logging service boundary.
`engine-graph-session.ts` now guards default graph-size control reads, graph
dimension writes, and SVG selection lookups. Missing or blocked compatibility
globals fall back to zero dimensions and inert SVG targets instead of throwing,
while explicit/runtime targets remain unchanged.
`engine-render-adapter.ts` now guards default render helper lookups for
cell search, COA drawing, routes, layers, burg icons/labels, emblems, ice,
scale-bar, canvas redraw, and zoom helpers. Missing compatibility helpers now
degrade to no-op behavior while injected render targets keep the explicit path.
`engine-map-graph-lifecycle-service.ts` now guards `reGraph` and
`createDefaultRuler` lookups, so blocked compatibility helper globals degrade
to no-op lifecycle calls instead of throwing.
`engine-generation-session-services.ts` now guards default grid/session
compatibility access for `grid`, `seed`, graph dimensions, and
`invokeActiveZooming`. Runtime services still prefer explicit context services,
while the browser fallback no longer throws when these compatibility globals
are missing or blocked.
`engine-map-placement-service.ts`, `engine-water-feature-service.ts`, and
`engine-generation-statistics-service.ts` now guard their default lifecycle
helper lookups. Missing or blocked `defineMapSize`, `calculateMapCoordinates`,
`addLakesInDeepDepressions`, `openNearSeaLakes`, `OceanLayers`, and
`showStatistics` compatibility helpers degrade to no-op calls while injected
service targets remain explicit.
Feedback, burg, naming, and heraldry default service targets now guard their
browser/global compatibility reads as well. Blocked `tip`, `Burgs`, `pack`,
`Names`, or `COA` getters now fall back to existing no-op/default behavior
without affecting injected service targets.
Note storage, map-store globals, and resource-summary targets now apply the
same guarded compatibility pattern. Blocked `notes`, `grid`, `pack`,
`structuredClone`, seed/dimension globals, `biomesData`, and `Biomes` reads or
writes degrade to no-op/default behavior while runtime/injected adapters remain
the preferred path.
State service defaults now guard the `States` compatibility mount as well, so
blocked state-module access falls back to empty campaign/no-op pole behavior
while explicit runtime state services keep receiving injected modules.

`engine-graph-session.ts` now applies explicit width/height parameters when
setting graph rectangle bounds instead of re-reading stale `globalThis`
dimensions. `engine-generation-session-services.ts` now exposes
`createBrowserGlobalGridSessionTargets()` and `createGlobalGridSessionTargets()`
so default grid session global access is isolated behind a typed adapter.

`Climate`, `EngineGenerationPipeline`, and `Names` compatibility mounts now
guard blocked `window` access at import time. These mounts remain intentional
AGM module compatibility exports for the current public orchestration path;
they are not old-system algorithm dependencies.

`HeightmapGenerator`, `Rivers`, and `Routes` compatibility mounts now also
guard blocked `window` access at import time. Focused tests cover the restricted
import path while preserving the existing public mount names.

`States`, `Provinces`, `Zones`, and `Markers` compatibility mounts now also
guard blocked `window` access at import time. These remain AGM entity-generator
module mounts for the public compatibility path.

`Burgs`, `Cultures`, `Military`, `Religions`, `Resample`, and `COA`
compatibility mounts now also guard blocked `window` access at import time.
After this pass, the remaining `window.*` hits under `src/modules` are guarded
AGM compatibility mounts rather than naked import-time browser reads.

`Resampler` now accepts injectable `ResamplerTargets` for pipeline rebuild
steps, river restoration helpers, province pole refresh, and marker pruning.
The default target factory still delegates to the current AGM compatibility
mounts, but `Resampler.process(...)` no longer owns direct calls to
`EngineGenerationPipeline`, `Rivers`, `Provinces`, or `Markers`.

`EngineMapStore` now splits its global compatibility boundary into
`EngineMapStoreGlobalTargets`. The default map-store adapter is composed from
those targets, so global `grid` / `pack` / `notes` reads and writes remain
compatible but are no longer embedded directly in the adapter composition.

## Next Recommended Slice

Move the next high-value generation step into explicit context. Recommended
order:

1. Move the remaining context type re-exports gradually to direct imports from
   their adapter modules in touched files, without doing a noisy repo-wide
   churn pass.
2. Start a command-layer slice for route/editor/query helpers rather than
   mixing rendered editor state into pure generation migration.
3. Continue reducing module-level browser UI exits. `fonts.ts` now has a
   formal `EngineFontResourceService`, a typed runtime factory, and a
   centralized compatibility installer; the next high-value step is to replace
   public UI/export `AGMFontResources` callers with injected font-resource
   commands where Studio-owned flows call it.
4. Defer manual Burgs editor methods (`add/remove/changeGroup`) until the
   editor command layer can own rendered icons, labels, routes, and COA updates.

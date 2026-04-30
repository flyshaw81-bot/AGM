# AGM Engine Runtime Window Dependency Map

This list is a V4 audit aid. `window.*` does not automatically mean "old system".
AGM still uses browser globals as a compatibility mount while runtime context and
command boundaries are being extracted.

## AGM module mounts

These are TypeScript AGM modules exposed to the current public orchestration path:

- `window.HeightmapGenerator`
- `window.Features`
- `window.Climate`
- `window.Rivers`
- `window.Biomes`
- `window.Ice`
- `window.Cultures`
- `window.Burgs`
- `window.States`
- `window.Routes`
- `window.Religions`
- `window.Provinces`
- `window.Military`
- `window.Markers`
- `window.Zones`
- `window.Names`
- `window.Lakes`
- `window.OceanLayers`
- `window.Resample`
- `window.EngineGenerationPipeline`

These are compatibility mounts, not evidence that the underlying algorithms are
old public code.

## Runtime compatibility adapters

- `getGlobalEngineRuntimeContext()` centralizes short-term reads from `grid`,
  `pack`, `options`, `seed`, map dimensions, and `biomesData`.
- `createGlobalGenerationSettings()` centralizes short-term DOM reads for
  generation controls such as `statesNumber`, `culturesInput`, `growthRate`,
  and climate/depression settings. The adapter now lives in
  `src/modules/engine-generation-settings.ts` with focused coverage for default
  and DOM/global-input reads.
- `createGlobalWorldSettings()` centralizes short-term world/map globals such as
  `mapCoordinates`, `graphWidth`, `graphHeight`, map size, latitude, and
  longitude controls.
- `createGlobalPopulationSettings()` centralizes short-term population globals
  such as `populationRate`, `urbanDensity`, and `urbanization`.
- `createGlobalUnitSettings()` centralizes short-term unit-control reads such as
  the current height unit label.
- `createGlobalTimingSettings()` centralizes short-term timing/debug reads such
  as `TIME`. World, population, unit, and timing adapters now live in
  `src/modules/engine-runtime-settings.ts`; this keeps
  `engine-runtime-context.ts` focused on assembling runtime services instead of
  owning each compatibility read.
- `EngineTimingSettings` is the typed runtime timing boundary. Ocean-layer
  redraws can now receive explicit runtime context for timing, grid, and map
  dimensions while the public `window.OceanLayers()` entry remains compatible.
- `HeightmapGenerator.generate(graph, context?)` can now receive explicit
  runtime context for timing, seed selection, and heightmap template selection.
  The default global generation-settings adapter still reads the current
  template control as compatibility input.
- `defineMapSize(heightmapTemplateId?)` can now receive explicit heightmap
  template selection. The public generation flow reads the template once through
  `EngineGenerationPipeline.getCurrentContext().generationSettings` after option
  randomization and passes it into map-size and lake-opening helpers while
  keeping no-argument compatibility.
- `showStatistics(heightmapTemplateId?)` can now receive explicit heightmap
  template selection. Public generation and resample lifecycle paths pass the
  active runtime/template value while keeping no-argument compatibility.
- `createGlobalMapStore()` centralizes map snapshot and resample reset behavior.
  It now lives in `src/modules/engine-map-store.ts` and receives a
  current-context provider instead of being owned inline by the runtime context
  assembler. It still replaces global `grid`, `pack`, and `notes`, but the
  mutation is isolated behind `EngineMapStore`.
- `createGlobalClimateContext()` centralizes short-term climate globals and DOM
  reads such as `precInput`, `DEBUG.temperature`, `TIME`, `mapCoordinates`,
  `graphWidth`, and `graphHeight`. It now lives in
  `src/modules/engine-climate-context.ts` and is reused by both the runtime
  context assembler and the default `Climate` module fallback.
- `createGlobalNamingService()` centralizes calls into the compatibility-mounted
  AGM `Names` service from `src/modules/engine-naming-service.ts`.
- `createGlobalRouteService()` centralizes calls into the compatibility-mounted
  AGM `Routes` service from `src/modules/engine-route-service.ts`.
- `createGlobalStateService()` centralizes calls into the compatibility-mounted
  AGM `States` service from `src/modules/engine-state-service.ts`.
- `createGlobalHeraldryService()` centralizes calls into the existing COA
  generation/rendering service from `src/modules/engine-heraldry-service.ts`.
- `createGlobalLifecycleAdapter()` centralizes resample and generation
  lifecycle calls into public orchestration/render helpers such as lake repair,
  ocean-layer redraw, map-coordinate refresh, graph rebuild, ruler creation, and
  statistics display. It now lives in
  `src/modules/engine-lifecycle-adapter.ts` and receives a current-context
  provider instead of importing the runtime context singleton directly. Resample
  and generation paths pass their active runtime context into the adapter, so
  those calls can use runtime settings instead of re-reading public controls on
  that path.
- `createGlobalNoteService()` centralizes reads and writes to the current global
  `notes` store for modules that have moved note persistence behind runtime
  context. It now lives in `src/modules/engine-note-service.ts` instead of being
  owned inline by the runtime context assembler.
- `createGlobalRenderAdapter()` centralizes DOM/SVG-backed rendering side
  effects such as cell hit testing, burg icon/label redraws, COA node updates,
  route drawing, layer checks, iceberg/glacier redraws, and element removal. It
  now lives in `src/modules/engine-render-adapter.ts` instead of being owned
  inline by the runtime context assembler.
- `EngineGenerationPipeline` wraps the current generation order without changing
  output. It is the first command surface for moving orchestration out of
  `public/main.js`.
- The current `public/main.js` generation flow now creates and refreshes an
  explicit generation runtime context at grid, pack, and map-placement
  boundaries, and passes that context into pipeline/lifecycle steps instead of
  relying on each step to read its own default global context.
- `EngineGenerationPipeline.prepareGridSurface(context)`,
  `prepareMapPlacement(context)`, `preparePackGraph(context)`,
  `generateTerrainFeatures(context)`, and `generateWorldEntities(context)` now
  group the existing public generation order into named runtime phases. These
  are orchestration wrappers only; they preserve the previous step order and
  keep map naming and scale-bar drawing in the public compatibility flow for
  now.
- `EngineLifecycleAdapter.defineMapSize(context)` centralizes the map-size
  helper call. `prepareMapPlacement(context)` uses it, refreshes the runtime
  context after map controls are updated, then calculates map coordinates and
  climate through the same context boundary.
- `CellRanking.rank(context)` now owns cell suitability and rural-population
  scoring in `src/modules`. The public `rankCells()` function remains as a
  compatibility wrapper, while `EngineGenerationPipeline.generateWorldEntities`
  calls the context-aware ranking step before cultures, burgs, states, and
  downstream entity generation.
- `EngineGenerationPipeline.finalizeGeneration(context)` now owns the main
  generation finalization sequence. It delegates scale-bar redraw through
  `EngineRenderAdapter.drawScaleBar()`, map naming through
  `EngineNamingService.getMapName()`, and final reporting through
  `EngineLifecycleAdapter.showStatistics(context)`.
- `EngineGenerationPipeline.generateWorld(context)` now owns the main
  post-grid generation orchestration. The public `generate(options)` entry still
  handles seed setup, graph sizing, option randomization, and grid selection,
  then delegates heightmap, surface preparation, map placement, packed graph
  preparation, terrain features, and world entities to this runtime pipeline
  entry point.
- `EngineGenerationPipeline.prepareGenerationSession(request)` now owns seed
  setup, active zoom reset, graph sizing, option randomization, and grid
  selection. `public/main.js` still owns the surrounding try/catch, generation
  timing message, and jQuery error dialog compatibility, but the generation
  session setup is no longer manually expanded in the public entry.
- `EngineGenerationSessionAdapter` is now part of `EngineRuntimeContext`.
  `prepareGenerationSession(request)` delegates session setup through this
  adapter instead of directly calling `setSeed`, `applyGraphSize`,
  `randomizeOptions`, or grid-selection helpers. The default adapter now calls
  TS session modules for seed, graph sizing, and options randomization; grid
  selection remains compatibility-backed.
- `EngineSeedSession` now owns seed resolution and PRNG reset. URL seed,
  MFCG-compatible seed trimming, precreated seed usage, and generated fallback
  are covered in `src/modules/engine-seed-session.ts`. The public `setSeed()`
  helper is now a compatibility wrapper around `EngineSeedSession.apply()`.
  `mapHistory` is intentionally exposed as a global compatibility value until
  history/session state moves fully into runtime state.
- `EngineGraphSession` now owns graph-size application. The public
  `applyGraphSize()` helper is a compatibility wrapper around
  `EngineGraphSession.applyGraphSize()`, while the runtime session adapter calls
  the TS module directly. The module still updates existing SVG/public canvas
  globals as a compatibility boundary.
- `EngineOptionsSession` now owns option randomization, heightmap-template
  randomization, culture-set randomization, and default era generation. The
  public `randomizeOptions()`, `randomizeHeightmapTemplate()`,
  `randomizeCultureSet()`, and `generateEra()` helpers are compatibility
  wrappers around the TS module. The module still reads/writes existing option
  controls and `options` as compatibility debt; this is ownership migration, not
  full typed settings purity.
- `EngineOptionsControlAdapter` now centralizes option lock checks, stored-value
  checks, `options=default` URL reads, and locale-based unit defaults for
  `EngineOptionsSession`. The default adapter still delegates to current public
  helpers such as `locked(...)` and `stored(...)`, but the randomization rules no
  longer call those globals directly.
- `EngineOptionsWriterAdapter` now centralizes option-control writes for cells
  density, map template, states/provinces/manors/religions/cultures, climate
  values, unit defaults, and era fields. The default writer still writes to
  current public DOM controls and `options`, but those writes are no longer
  scattered through the randomization rules.
- `EngineOptionsReaderAdapter` and `EngineOptionsNamingAdapter` now centralize
  heightmap-template weights/names, culture-set weights, and random era naming.
  The default adapters still read current global `heightmapTemplates`,
  `Names`, and `nameBases`, but `EngineOptionsSession` no longer reads those
  globals directly.
- `EngineRuntimeContext.optionsSession` now exposes option randomization as a
  runtime service. `EngineGenerationSessionAdapter.prepare(...)` receives the
  active runtime context and calls `context.optionsSession.randomizeOptions()`
  when provided, falling back to the global singleton only for direct
  compatibility calls.
- `EngineRuntimeContext.seedSession` and `EngineRuntimeContext.graphSession`
  now expose seed/PRNG setup and graph-size application as runtime services.
  `EngineGenerationSessionAdapter.prepare(...)` uses `context.seedSession` and
  `context.graphSession` when an active context is provided, with global
  singletons retained as compatibility fallback for direct calls.
- `EngineRuntimeContext.gridSession` now owns generation grid selection. The
  default service still wraps `shouldRegenerateGrid(...)`, `generateGrid(...)`,
  and `globalThis.grid` mutation, but `EngineGenerationSessionAdapter` no
  longer contains those direct calls.
- `EngineRuntimeContext.sessionLifecycle` now owns generation-session view
  reset. The default lifecycle still delegates to `invokeActiveZooming()`, but
  `EngineGenerationSessionAdapter` no longer calls that public helper directly.
- `createGlobalGenerationSessionServices()` now assembles the default
  generation-session service group (`sessionLifecycle`, `seedSession`,
  `graphSession`, `optionsSession`, and `gridSession`). The adapter resolves
  context-provided services first, then falls back to this grouped default set.
- Generation-session service types and default factories now live in
  `src/modules/engine-generation-session-services.ts` instead of
  `engine-runtime-context.ts`, keeping the runtime context file focused on
  context assembly.
- `createGlobalGenerationSessionAdapter()` now creates fallback services lazily.
  If a complete runtime context supplies session lifecycle, seed, graph,
  options, and grid services, the adapter does not touch the global fallback
  singletons. Dedicated tests cover this boundary in
  `src/modules/engine-generation-session-services.test.ts`.
- `EngineGenerationPipeline.generateWorld(context)` resets packed map state via
  `context.mapStore.resetPackForGeneration()` instead of directly assigning
  `globalThis.pack = {}`.
- `EngineGenerationPipeline.handleGenerationError(error)` now routes generation
  failures through runtime logs and `EngineNoticeService.showGenerationError`.
  The default notice adapter still uses the existing jQuery error dialog, but
  that dependency is centralized behind the notice boundary instead of being
  handwritten in the public generation entry.
- `window.calculateTemperatures` and `window.generatePrecipitation` remain
  compatibility entry points that forward into `window.Climate`.
- Studio input overrides native `prompt` through `window.requestStudioInput`.
- `EngineLogService` centralizes warning/error output. The default adapter still
  delegates to the existing `WARN` / `ERROR` console gates from
  `src/modules/engine-log-service.ts`.
- `EngineNoticeService` centralizes blocking/modal notices.
  `createGlobalNoticeService()` now lives in
  `src/modules/engine-notice-service.ts` and still delegates to `alertMessage`
  and jQuery UI dialog as isolated compatibility debt.
- `EngineFeedbackService` centralizes toast-style feedback.
  `createGlobalFeedbackService()` now lives in
  `src/modules/engine-feedback-service.ts` and still delegates to the existing
  `tip(...)` helper.
- `EngineRenderAdapter` is created through `createGlobalRenderAdapter()` and
  still delegates map/SVG rendering side effects to the existing public DOM/SVG
  helpers from `src/modules/engine-render-adapter.ts`.

These adapter calls are expected in the short term. They are compatibility
boundaries to shrink, not standalone proof of old algorithm ownership.

## Resource compatibility adapters

These are browser resource adapters, not pure generation runtime:

- `src/modules/fonts.ts` owns font registration and data-URI conversion. It
  still exports `window.fonts`, `window.declareFont`, `window.getUsedFonts`,
  `window.loadFontsAsDataURI`, `window.addGoogleFont`, `window.addLocalFont`,
  and `window.addWebFont`.
- `fonts.ts` still touches `document.fonts`, `styleSelectFont`, `FontFace`,
  `fetch`, and `tip(...)` through local font feedback helpers.
- This layer should become a formal font resource service before its `window.*`
  API is moved or removed.

## Real old UI dependencies

These should remain V4 findings until replaced or isolated:

- jQuery UI `.dialog()` usage under `public/modules/ui/*`.
- Old editor entry points that still depend on `#dialogs`, `.ui-dialog`, or
  jQuery event wiring.
- Direct reads/writes to `pack`, `grid`, `options`, and DOM controls from Studio
  UI code outside a typed engine command, runtime adapter, or explicit resource
  adapter.
- `src/modules/engine-notice-service.ts` `createGlobalNoticeService()` still
  uses `$("#alert").dialog(...)`. This is isolated compatibility, but it remains
  a product UI replacement target.

## Migration rule

Keep AGM module mounts while replacing the orchestration and UI dependencies
around them:

1. Add or extend typed runtime context.
2. Route generation steps through `EngineGenerationPipeline`.
3. Move Studio actions into typed engine commands.
4. Replace high-frequency jQuery editors with Direct Editors.
5. Remove compatibility mounts only after the public path no longer needs them.

## Current interpretation guide for V4

- Do not count `window.Rivers`, `window.Biomes`, `window.HeightmapGenerator`,
  or other AGM TypeScript module mounts as old algorithm code by themselves.
- Do count `public/modules/ui/*` jQuery dialogs as old UI dependency.
- Do count direct DOM/jQuery usage inside default adapters as compatibility
  debt, but distinguish it from scattered production logic. The current desired
  shape is "centralized adapter first, replacement second".
- Do count `createGlobalMapStore()` as runtime compatibility debt, not a pure
  engine store. It exists to isolate the current global map replacement flow.
- Do count `fonts.ts` as a resource adapter dependency, not a generation engine
  dependency.

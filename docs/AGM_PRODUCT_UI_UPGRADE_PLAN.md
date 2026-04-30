# AGM Studio Product UI Upgrade Plan

Date: 2026-04-27

## Product Position

AGM Studio should be treated as a game-world production workbench, not as a wrapped legacy map editor. The visible workflow should match how a game developer thinks about delivery:

1. Choose scene
2. Choose canvas/container
3. Edit map parameters
4. Generate map
5. Validate playability
6. Export/save

Anything that does not directly support this path should be moved out of the primary UI and exposed only when the user is in an advanced/debug/editor context.

## Current Findings

- The project has real product value in the generator, legacy map bridge, export data drafts, importer fixtures, and engine package validation.
- The current frontend still exposes too much implementation structure: layers, raw JSON, legacy editors, repair utilities, and low-level style controls compete with the core workflow.
- `src/studio/layout/shell.ts` is too large and mixes information architecture, rendering, editor-specific panels, native editor controls, and event binding.
- `src/studio/state/worldDocumentDraft.ts` is too large and should be split around AGM World JSON, rules, playability, export package, and engine-specific outputs.
- The 16:10 preset must be interpreted as an output canvas contract. The SVG width/height and global legacy viewport values must stay synchronized with the selected preset.
- Repeated controls and metadata should be avoided. If a value already appears in the inspector or status bar, it should not be repeated in the stage toolbar.

## Primary UI Rules

- The top bar is for workflow progress and high-frequency file/generation actions only.
- The left rail is for workflow navigation plus a clearly separated advanced area.
- The canvas stage should preserve the largest possible visible map area.
- The right inspector should show the current step's decision controls, not every available system switch.
- Low-frequency controls should be hidden behind advanced sections or contextual drawers.
- Controls must use one visual language: dark surface, gold accent, compact borders, no blue SaaS styling.
- Selects, segmented controls, chips, action buttons, and cards must share radius, border, text weight, and hover/focus states.

## Visible vs Hidden

Primary visible:

- Scene/game type
- Canvas preset, orientation, fit mode, safe area, guides
- Core map parameters: style preset, biome balance, labels, routes, points of interest
- Generate action
- Validation summary and actionable fixes
- Export format/package targets
- Open/save/export

Advanced or hidden:

- Theme selector
- Raw World JSON
- Full legacy editor list
- Layer preset internals
- Debug repair tools
- Low-level taxonomy details unless a validation error requires them
- Engine fixture/mock internals

## Interaction Upgrades

- Biome distribution should be a compact list plus one selected editor, not repeated expanded cards for every biome.
- Validation should group issues by user action: fix now, review, ignore for export.
- Export should start with target engine/output package, then reveal engine-specific details.
- Canvas controls should be stable and not create layout shifts when toggled.
- Dropdowns should match the AGM dark-gold theme across the entire app.

## Execution Phases

Phase 1: Information architecture and visual baseline

- Reframe navigation around the six-step workflow.
- Move low-frequency items to advanced navigation.
- Apply dark-gold AGMUI baseline to topbar, sidebars, stage, inspector, chips, buttons, and dropdowns.
- Ensure 16:10 canvas dimensions actually sync to the legacy SVG.

Phase 2: Inspector redesign

- Redesign scene, canvas, map params, validation, and export panels as task-focused modules.
- Remove duplicate headings and repeated metadata.
- Replace verbose controls with compact, contextual panels.

Phase 3: Feature simplification

- Hide implementation scaffolding from primary UI.
- Move raw data, layer internals, and legacy editors to advanced.
- Keep advanced tools available for power users and debugging.

Phase 4: Architecture split

- Split `shell.ts` into layout shell, topbar, left rail, stage, inspector panels, native editor panels, and event binding modules.
- Split `worldDocumentDraft.ts` into world document, rules, playability, export package, engine targets, and validators.
- Add focused tests for the core user workflow and keep lower-level tests for contracts.

## Acceptance Criteria

- At 1600 x 900 and 2048 x 1152, the map occupies the maximum useful stage area without visible dead zones.
- The primary workflow is understandable without reading documentation.
- A new user can choose a scene, choose canvas, edit parameters, generate, validate, and export from visible controls.
- Advanced/debug features do not dominate the first-screen UI.
- `npm run build -- --emptyOutDir` passes.
- E2E coverage distinguishes true user workflows from mock/contract coverage.

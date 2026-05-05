# V4 Non-UI Checkpoint

Date: 2026-05-05

## Scope

This checkpoint closes the current non-UI runtime/context and compatibility
adapter hardening pass. It does not claim that AGM Studio has fully removed all
old public UI debt. It only marks the low-level browser-global and DOM adapter
sweep as stage-complete for this migration cycle.

V4 should treat additional adapter hardening findings as follow-up debt unless
they show one of these risks:

1. user-visible breakage,
2. data loss or corrupted output,
3. unguarded import-time browser global crash,
4. a compatibility path incorrectly classified as an AGM module mount.

## Verification Gate

Latest full local verification:

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test -- --run`: passed, 197 test files / 922 tests.
- `npm.cmd run build`: passed.

## Recent Closeout Commits

- `8af100d` Close non-UI boundary hardening checkpoint
- `e14df64` Guard render adapter DOM cleanup
- `37cfdad` Guard engine editor dialog targets
- `133bf18` Guard canvas overlay DOM targets
- `cae5a2f` Guard canvas interaction DOM targets
- `60c1103` Guard style injection targets
- `4eaccd2` Guard engine host DOM adapters
- `c1f8786` Guard draft file IO DOM targets
- `bb44707` Guard heightmap canvas export target
- `c429268` Guard node and language utility lookups
- `8188e5b` Guard shared DOM utility lookups
- `efaaf22` Guard render compatibility helpers
- `673d7f5` Guard seed session compatibility targets
- `c6aa863` Guard runtime settings DOM lookups
- `c0b927c` Guard generation settings DOM lookups
- `6eeeea5` Guard document source compatibility targets
- `9326bc4` Guard project climate compatibility targets
- `6697a83` Guard export compatibility targets
- `02cd475` Guard style compatibility targets
- `51b5b09` Guard layer compatibility targets

## Review Focus

V4 should review:

- Whether unguarded `document`, `window`, `globalThis`, canvas, or DOM calls
  remain outside explicit target factories or intentional AGM compatibility
  mounts.
- Whether AGM module mounts such as `window.Rivers`, `window.Biomes`,
  `window.HeightmapGenerator`, and similar exports are correctly classified as
  compatibility exports for current public orchestration, not as old algorithms.
- Whether `public/modules/ui/*` jQuery dialog debt is still isolated as a UI
  migration item rather than mixed into runtime/context hardening.
- Whether handoff text now reflects the current test count and stage boundary.

## Known Deferred Work

These are not considered blockers for this non-UI checkpoint:

- Replacing high-frequency `public/modules/ui/*` jQuery dialogs with
  Studio-owned UI.
- Moving the remaining default global target factories to real services over
  time.
- Command-layer ownership for remaining rendered editor operations, including
  manual Burgs methods and route/editor helpers.
- Replacing Studio-owned font-resource callers with injected font-resource
  commands where applicable.
- Full Pencil-guided UI migration.

## UI Entry Requirement

Before any UI implementation, the Pencil file must be read successfully:

- `D:/SKILLS/UI/UI1/untitled.pen`
- Required first reads: `get_editor_state({ include_schema: true })`,
  `snapshot_layout`, and when needed `get_variables`.

Current note: the latest attempt to connect to Pencil failed with
`transport not connected to app: desktop`, so no UI code was changed in this
checkpoint.

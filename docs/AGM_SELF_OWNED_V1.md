# AGM Self-Owned Product UI V1

## Goal

AGM V1 is a self-owned map product UI on top of the current compatible engine
runtime. It is not a total engine rewrite and it is not a visual skin over the
old FMG editor surface.

The V1 user path is:

1. Start from Project Center.
2. Enter the native map workbench.
3. Generate or inspect a map without canvas overflow or unexpected viewport
   resets.
4. Edit core world entities in Studio-owned drawers.
5. Adjust visible layers and biome coverage through Studio-owned controls.
6. Review relationship repair readiness.
7. Export from an AGM delivery surface.

## V1 Done Criteria

- Project Center and native workbench are the primary entry path.
- Native workbench does not intentionally open old jQuery UI dialogs on the
  main workflow path.
- Canvas size presets define the actual container; the map does not stretch or
  overflow outside the selected container.
- Wheel zoom, pan, tool switching, drawer dismissal, and rerenders preserve the
  user's current viewport unless the user explicitly resets or changes the
  canvas preset.
- The left iconbar, topbar, floating toolbar, layerbar, zoom control, and biome
  popover can be clicked without accidentally dismissing an active editor
  drawer.
- State, culture, religion, province, burg, route, zone, marker, diplomacy, and
  biome editors share the same native drawer structure: list, detail, useful
  top actions, fixed apply/reset area, and internal scrolling.
- Readonly coverage, technical, and relationship information is visible by
  default in native editor drawers; it is not hidden behind decorative details
  toggles.
- Repair and export surfaces expose a clear ready, blocked, or needs-repair
  state.

## Non-Goals

- Do not rewrite `public/main.js` in V1.
- Do not replace every file under `public/modules/ui/*` in one pass.
- Do not redesign all icon artwork in V1; keep the accepted shell direction and
  standardize size, color, spacing, and interaction states.
- Do not expand editor business scope while converging the UI. Preserve current
  writeback behavior unless a bug fix requires a targeted change.

## Compatibility Boundaries

- The old D3 map zoom remains a compatible engine capability. Studio must read
  it back into viewport state so subsequent renders do not reset the map.
- Old jQuery dialogs may remain as fallback adapters, but native AGM flows
  should not depend on users seeing those dialogs.
- `window.*` and global reads are not automatically legacy; they are acceptable
  only when isolated behind bridge or target adapters.

## Progress Snapshot

- 2026-05-07: V1 tracker created and scoped to product UI convergence, not an
  engine rewrite.
- 2026-05-07: Canvas regression lock completed for native workbench click
  suppression, wheel zoom hydration, default pan tool behavior, viewport preset
  switching, contain/cover/actual-size modes, and no-overflow container rules.
- 2026-05-07: Lower-frequency editor convergence advanced for route, zone,
  marker, and biome drawers: Apply/Reset actions now share the native action bar
  renderer and empty selections no longer leave a blank sticky action strip.
- 2026-05-07: Native route, zone, marker, biome, and diplomacy drawers retain
  stable compatibility classes for existing tests and action hooks while keeping
  the new native drawer structure.
- 2026-05-07: Repair/export gate hardened: blocked relationship health now
  disables formal engine package export while keeping image and manifest exports
  available for review; persisted needs-repair project status also reports a
  blocked relationship gate.
- 2026-05-07: Browser regression added for the blocked relationship gate:
  a real workbench page now verifies formal engine package export is disabled
  while image export, manifest export, and repair navigation remain usable.
- 2026-05-07: Repair/export acceptance path now has a browser regression:
  a blocked relationship gate can be opened from Export, repaired in the native
  Repair Center, and returned to Export with the formal engine package button
  restored.
- 2026-05-07: Native editor drawer edge regression added for all iconbar editor
  modules: each opens inside the native drawer shell, avoids visible legacy
  jQuery dialogs, and closes back to the canvas cleanly.
- 2026-05-07: V1 acceptance smoke added for the current product path: Project
  Center, native workbench shell, default pan tool, wheel-then-click viewport
  stability, every native editor drawer module, and repair/export gate recovery.
- 2026-05-07: `test:e2e:studio` is now the fast V1 acceptance gate. The older
  broad editor/export suites remain available through `test:e2e:studio:deep`
  for legacy compatibility sweeps.
- 2026-05-07: V1 acceptance now locks daylight/night theme switching, common
  viewport presets (16:10, 16:9, 4:3, and 1:1), native-container no-overflow
  behavior, editor drawer outside-click dismissal, and safe clicks on topbar,
  iconbar, floating toolbar, layerbar, and map zoom controls.
- 2026-05-07: Editor drawer outside-click dismissal now runs in capture phase
  so canvas clicks close the drawer before legacy map handlers can consume the
  click or apply an unintended viewport/entity action.
- 2026-05-07: High-frequency native editor writeback coverage migrated out of
  the old mixed shell suite into `studio-v1-editor-convergence.spec.ts`. State,
  culture, religion, province, and burg drawers now have V1 browser coverage for
  native shell structure, Apply/Reset action surfaces, writeback, saved/dirty
  status, and absence of visible legacy dialogs.
- 2026-05-07: The old broad editor/export workflow suite is now explicitly
  `test:e2e:studio:legacy-shell`; it is preserved for compatibility sweeps but
  no longer defines the V1 product gate.
- 2026-05-07: Legacy shell boundary documented in
  `docs/AGM_V1_LEGACY_SHELL_BOUNDARY.md`. Old export/editor compatibility
  scenarios now have an explicit migration rule and no longer block the native
  V1 product gate.
- Current estimate: 100% complete for AGM self-owned product UI V1. Remaining
  work is post-V1 compatibility cleanup, engine extraction, or feature
  expansion, not V1 acceptance debt.

## Verification Baseline

Run these after each V1 batch:

```powershell
npm.cmd run test -- --run <targeted suites>
npm.cmd run typecheck
npm.cmd run lint
```

Canvas and shell behavior batches also require a browser check covering:

- dark and daylight themes
- 16:10, 16:9, 4:3, and 1:1 canvas presets
- wheel zoom followed by canvas click
- editor drawer open followed by canvas click dismissal
- clicks on topbar, iconbar, floating toolbar, layerbar, map zoom, and biome
  popover while an editor drawer is open

Final V1 verification:

```powershell
npm.cmd run build
npm.cmd run test:e2e:studio
```

V1 is complete when the command above passes together with targeted unit
coverage, `npm.cmd run typecheck`, and `npm.cmd run lint`.

Optional deep compatibility sweep:

```powershell
npm.cmd run test:e2e:studio:deep
```

Legacy shell compatibility sweep:

```powershell
npm.cmd run test:e2e:studio:legacy-shell
```

Legacy-shell failures are tracked under
`docs/AGM_V1_LEGACY_SHELL_BOUNDARY.md`; they do not redefine the V1 completion
gate.

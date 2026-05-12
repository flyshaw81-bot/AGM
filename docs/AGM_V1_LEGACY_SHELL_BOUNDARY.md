# AGM V1 Legacy Shell Boundary

## Purpose

This note defines what remains outside the AGM self-owned product UI V1 gate.
It prevents old FMG-shell regression tests from redefining V1 completion after
the native workbench path has its own acceptance coverage.

## V1 Gate

The V1 product gate is:

```powershell
npm.cmd run test:e2e:studio
```

It covers the native AGM path:

- Project Center entry and language persistence.
- Native workbench shell, iconbar, topbar, floating toolbar, layerbar, zoom
  controls, and theme switching.
- Canvas wheel zoom, pan default, click suppression, common viewport presets,
  and no-overflow container behavior.
- Native editor drawer open/close behavior, outside-click dismissal, and safe
  chrome clicks while drawers are open.
- Native editor writeback for high-frequency entities: states, cultures,
  religions, provinces, and burgs.
- Relationship repair/export gate: blocked state, repair path, and restored
  delivery readiness.

## Legacy Shell Suite

The old broad shell suite is preserved as:

```powershell
npm.cmd run test:e2e:studio:legacy-shell
```

It currently includes:

- `tests/e2e/studio-export-data-workflow.spec.ts`
- `tests/e2e/studio-editor-workflow.spec.ts`
- `tests/e2e/studio-language-switch.spec.ts`

This suite is a compatibility sweep, not the V1 acceptance gate. It still mixes
old `.studio-nav` assumptions, historical right-sidebar panels, legacy
`.ui-dialog` editor flows, and newer native workbench checks. Failures here
should be triaged as compatibility debt or migration candidates, not as proof
that V1 regressed.

## Migration Rule

When a legacy-shell test fails:

1. If the behavior is part of the accepted native AGM product path, migrate the
   assertion into a `studio-v1-*` e2e test with native selectors.
2. If the behavior only proves old shell or old jQuery dialog compatibility,
   keep it in `test:e2e:studio:legacy-shell`.
3. If the behavior no longer matches V1 product policy, retire or rewrite the
   old assertion instead of bending the native UI back toward FMG.

## Current V1 Status

As of 2026-05-07, V1 completion is defined by `test:e2e:studio`, targeted unit
coverage, typecheck, lint, and build. The legacy-shell suite remains useful for
future compatibility cleanup, but it is outside the V1 completion boundary.

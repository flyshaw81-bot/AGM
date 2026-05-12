# AGM Studio Product Context

register: product

## Product Purpose

AGM Studio is a professional procedural world-map production tool for game teams, worldbuilders, and campaign designers. The interface serves map editing, inspection, regeneration, validation, and export. It is not a marketing site, a SaaS dashboard, or a reskinned legacy FMG editor.

## Primary Users

- Worldbuilders who need to inspect and adjust generated countries, routes, biomes, markers, regions, towns, and delivery health.
- Game designers who need a stable map-first workspace with dense controls and predictable editing panels.
- Technical artists or tool builders who need export readiness, relationship repair, layer visibility, and generation state to stay visible without interrupting canvas work.

## Product Principles

- The map canvas is the workpiece. Chrome should frame and support it, not compete with it.
- Navigation stays familiar: top command bar, left module rail, center canvas, right information panel, bottom layer/status strip.
- Dense is acceptable when it is organized. Sparse marketing composition is wrong for this tool.
- Entity editing belongs in the right information panel; do not reintroduce floating editor drawers or duplicate popovers.
- The left rail is a module index and canvas tool dock. It should feel engineered, not decorative.
- Collapse behavior must be structural: collapsing the left navigation also hides the right information panel.

## Tone

Precise, calm, field-instrument quality. The UI should feel like a serious cartography and simulation tool: trustworthy, restrained, and fast under repeated use.

## Anti-References

- Brass, gold, or fantasy ornament as the core UI language.
- Purple-blue AI gradients, generic glassmorphism, glow-heavy dark mode, or hero-style metric cards.
- Floating toolbars or transient status overlays for core canvas tools.
- Card grids used as a default structure.
- Decorative icon boxes, repeated borders, or active side stripes that do not improve scanning.

## Constraints

- Preserve existing data attributes and event routing: `data-studio-action`, `data-value`, `data-workbench-target`, and related `data-studio-*` attributes are functional contracts.
- Preserve the current v8 shell structure and module behavior.
- Manual style edits live primarily in `src/studio/app/styleModules/experimentalV8.ts`; shell markup lives in `src/studio/layout/nativeShell.ts`.
- Validate UI edits with targeted Vitest, then typecheck and lint.

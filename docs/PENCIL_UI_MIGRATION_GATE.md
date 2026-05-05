# Pencil UI Migration Gate

Date: 2026-05-05

## Purpose

AGM Studio UI work must follow the Pencil design file rather than ad-hoc
redesigns or generic UI rules. This document is the engineering gate for future
Studio UI implementation.

Required design file:

- `D:/SKILLS/UI/UI1/untitled.pen`

The file is expected to contain four UI sets:

- Chinese + dark theme
- English + dark theme
- Chinese + light theme
- English + light theme

## Mandatory Preflight

Before any UI-related code change, the implementing agent must successfully read
the Pencil file with:

1. `mcp__pencil__.get_editor_state({ include_schema: true })`
2. `mcp__pencil__.snapshot_layout`
3. `mcp__pencil__.get_variables` when theme, token, color, typography, or
   spacing values are relevant

If Pencil cannot be connected or the file cannot be read, UI implementation is
blocked. Do not infer the UI from memory, screenshots, product taste, or old
code.

## Design Interpretation Rules

- Identify all four UI sets before coding.
- Use Chinese pages for Chinese copy and English pages for English copy.
- Use dark pages for dark theme and light pages for light theme.
- Do not show Chinese and English copy at the same time on one business page.
- CN/EN must be implemented as immediate language switching.
- Sun/moon theme controls must be implemented as immediate theme switching, not
  as separate pages.
- The left navigation must support expanded and collapsed states; collapsed
  state shows icons only.
- Component System frames are component-library references, not business pages.
- Dialogs, toast, progress, empty states, error states, and small widgets should
  be implemented as reusable components or states rather than pasted into
  unrelated business pages.

## Implementation Scope Rules

- Migrate one Studio-owned business surface at a time.
- Each implemented page must map back to a specific Pencil frame or frame group.
- All user-facing strings must go through i18n.
- All colors must go through theme tokens or CSS variables.
- Reuse components instead of duplicating UI structures.
- If Pencil conflicts with existing code, prefer the product direction in
  Pencil, but document the risk before making disruptive changes.
- If a Pencil design appears impractical or inconsistent, record the issue and
  propose a correction instead of silently inventing a new design.

## Verification Required After UI Changes

Every UI implementation batch must run:

- `npm.cmd run typecheck`
- `npm.cmd run build`

Run these when the touched area warrants it:

- `npm.cmd run lint`
- relevant unit tests
- relevant Playwright flows
- local browser inspection against the implemented surface

The final handoff for a UI batch must state:

- which Pencil frames or frame groups were used,
- which language/theme variants were matched,
- which parts are implemented,
- which parts remain partial or intentionally deferred,
- what verification passed.

## Current Status

The latest attempted Pencil connection failed with:

`transport not connected to app: desktop`

Therefore no UI implementation has been started under this gate yet. The next
valid UI step is to reconnect Pencil and read `D:/SKILLS/UI/UI1/untitled.pen`
successfully.

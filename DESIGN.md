# AGM Studio Design Context

## Register

Product UI. Design serves task flow, map inspection, editing density, and stable spatial memory.

## Visual Direction

AGM Studio should read as a high-end cartography production environment. Keep the dark workspace, but move it away from generic blue-black tooling by using tinted ink neutrals, muted mineral accents, thin separators, and typography-led hierarchy.

Physical scene: a designer edits a generated world on a large monitor in a dim studio, repeatedly switching between countries, map features, biomes, layers, validation, and export. The interface should stay legible and composed for long sessions.

## Color Strategy

Restrained product palette:

- Ink neutrals carry the shell and panels.
- One muted mineral-blue accent marks active state, primary generation, and focus.
- Success, warning, and danger appear only for status.
- Avoid brass/gold and saturated purple-blue gradients.
- Avoid pure black and pure white. Neutrals should be subtly tinted.

## Typography

- Use a single tuned UI sans stack with Chinese support: `"Satoshi", "Geist Sans", "SF Pro Display", "Segoe UI Variable", "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", system-ui, sans-serif`.
- Use a mono stack only for seed, dimensions, numeric metadata, and aligned metrics.
- Product scale should be fixed, not fluid: compact labels at 0.68rem, body controls around 0.78rem to 0.86rem, panel titles around 1rem.
- Letter spacing is zero for normal text. Uppercase micro-labels may use slight positive tracking.

## Layout

- Main structure stays: topbar, left rail, canvas, right info panel, bottom layer/status strip.
- Topbar should feel like a command deck, not a row of unrelated cards.
- Left rail should be a dense module index with strong scan rhythm and minimal decoration.
- Right panel stays fixed and information-dense.
- Bottom layers should be a toolbar strip, not a marketing card row.

## Components

- Buttons use consistent height, radius, focus, hover, active, disabled states.
- Icons are line icons with consistent stroke weight and optical centering.
- Active states use fill, border, and text contrast together; do not rely on a thick side stripe.
- Use dividers and proximity before adding containers.

## Motion

- Motion communicates state only.
- Use transform and opacity for movement. Avoid animating layout properties.
- Most transitions should sit around 160-240ms with an ease-out curve.
- Respect `prefers-reduced-motion`.

## Hard Rules

- No floating canvas toolbar.
- No brass/gold palette.
- No nested cards.
- No decorative side-stripe borders.
- No heavy blur as a default surface effect.
- No marketing hero composition inside the app shell.

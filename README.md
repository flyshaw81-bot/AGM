# AGM Studio

AGM Studio is the main editor for AGM（Atlas Generation Matrix，阿特拉斯生成矩阵）, a procedural world and map content production tool for game development teams.

AGM helps teams generate, edit, validate, and export playable world data. The product line uses these names consistently:

- AGM Studio: the main editor and authoring app
- AGM World JSON: the world data exchange format
- AGM Rules Pack: generation rule packages
- AGM Engine Kit: engine import plugins for Unity, Godot, Unreal, and related runtimes
- AGM Content Kit: content configuration kits for small games, roguelikes, strategy games, and campaigns

Tagline: Build playable worlds from structured generation.

## Contribution

Pull requests are welcome. The codebase is gradually transitioning from vanilla JavaScript to TypeScript while AGM Studio keeps compatibility with the existing generation pipeline and old `.map` user files.

The expected future architecture separates world data, procedural generation, interactive editing, and rendering:

settings → generators → world data → renderer
UI → editors → world data → renderer

The data layer should contain no rendering code. Generators implement procedural world simulation. Editors perform controlled mutations of world state. The renderer converts world state into SVG or WebGL graphics and should remain a pure visualization step.

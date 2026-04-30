# AGM Studio

AGM Studio is the main editor for AGM（Atlas Generation Matrix，阿特拉斯生成矩阵）, a procedural world and map content production tool for game development teams.

AGM helps teams generate, edit, validate, and export playable world data. The product line uses these names consistently:

- AGM Studio: the main editor and authoring app
- AGM World JSON: the world data exchange format
- AGM Rules Pack: generation rule packages
- AGM Engine Kit: engine import plugins for Unity, Godot, Unreal, and related runtimes
- AGM Content Kit: content configuration kits for small games, roguelikes, strategy games, and campaigns

Tagline: Build playable worlds from structured generation.

## Engine Package handoff / 引擎包交接

AGM Studio can export an AGM Engine Package ZIP for game-engine handoff. The current package contract is `agm.engine-package.v0` with `layoutVersion: 0` and `validationMode: extracted-directory-only`.

Basic workflow:

1. Export Engine Package ZIP from AGM Studio.
2. Extract the ZIP to a local directory.
3. Validate the extracted directory:

   ```bash
   npm run validate:unity-export -- --dir <extracted-package-root>
   ```

4. Optionally run Unity CLI validation:

   ```bash
   npm run validate:unity-export -- --dir <extracted-package-root> --unity <Unity executable>
   ```

5. Adapt source samples under `handoff/importers/` for Unity, Godot, or Unreal.

中文：AGM Studio 可以导出用于游戏引擎交接的 AGM Engine Package ZIP。当前包契约为 `agm.engine-package.v0`，`layoutVersion: 0`，校验模式为 `extracted-directory-only`。

基本流程：

1. 从 AGM Studio 导出 Engine Package ZIP。
2. 将 ZIP 解压到本地目录。
3. 校验解压后的目录：

   ```bash
   npm run validate:unity-export -- --dir <解压后的包目录>
   ```

4. 可选运行 Unity CLI 校验：

   ```bash
   npm run validate:unity-export -- --dir <解压后的包目录> --unity <Unity executable>
   ```

5. 基于 `handoff/importers/` 下的源码示例改造 Unity、Godot 或 Unreal 导入器。

Unity vertical slice prototype:

- Reads package-layout, importer metadata, terrain RAW16/heightfield, and resource/province/biome map layers.
- Emits metadata-only importer reports.
- Does not create Unity Terrain assets, ScriptableObject assets, Unity packages, or production plugins.

Unity vertical slice prototype / Unity 垂直切片原型：

- 读取 package-layout、importer metadata、terrain RAW16/heightfield，以及 resource/province/biome 地图层。
- 只输出 metadata-only importer report。
- 不创建 Unity Terrain asset、ScriptableObject asset、Unity package 或生产级插件。

Unity importer asset authoring metadata spike:

- Describes future editor artifact authoring as JSON metadata only.
- Validates the planned TerrainData, ScriptableObject, and prefab handoff contract without creating Unity assets.
- Does not call AssetDatabase.CreateAsset, ScriptableObject.CreateInstance, PackageManager, or PrefabUtility asset-writing APIs.

Unity importer asset authoring metadata spike / Unity 资产创作元数据尖峰：

- 只用 JSON metadata 描述未来 editor artifact authoring plan。
- 只校验计划中的 TerrainData、ScriptableObject 与 prefab 交接契约，不创建 Unity asset。
- 不调用 AssetDatabase.CreateAsset、ScriptableObject.CreateInstance、PackageManager 或 PrefabUtility 写资产 API。

Current limitations:

- Importer files are source samples and stubs only.
- No production engine plugin is included.
- Direct `--zip` validation is reserved for future work; extract the package and use `--dir`.

## Contribution

Pull requests are welcome. The codebase is gradually transitioning from vanilla JavaScript to TypeScript while AGM Studio keeps compatibility with the existing generation pipeline and old `.map` user files.

The expected future architecture separates world data, procedural generation, interactive editing, and rendering:

settings → generators → world data → renderer
UI → editors → world data → renderer

The data layer should contain no rendering code. Generators implement procedural world simulation. Editors perform controlled mutations of world state. The renderer converts world state into SVG or WebGL graphics and should remain a pure visualization step.

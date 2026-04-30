# AGM Unity Importers

`com.agm.importers.unity` is the separate Unity package deliverable for consuming AGM Engine Package exports. It is intentionally not bundled inside AGM Engine Package ZIP files.

## Install

Use Unity Package Manager's local package flow and select this folder:

```text
Packages/com.agm.importers.unity
```

## Import workflow

1. Export an AGM Engine Package ZIP from AGM Studio.
2. Extract the ZIP to a local folder.
3. In Unity, open `AGM > Engine Package Importer` for a guided Inspect / Import panel.
4. Select the extracted folder, run `Inspect`, and review the status and diagnostics before importing.
5. Run `Import` only after the same folder has inspected successfully; changing the folder clears the inspection and disables Import until you inspect again.
6. Use `AGM > Inspect Unpacked Engine Package...` to validate the extracted folder without creating assets.
7. Use `AGM > Import Unpacked Engine Package...` for the direct menu workflow after inspection succeeds.

Runtime API:

```csharp
var imported = AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage(packageRoot);
var report = AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage(packageRoot);
```

## Boundaries

- Runtime import APIs do not create Unity assets, prefabs, packages, or compiled plugin outputs.
- Editor prototype asset authoring remains validation-only under `Assets/AGM/Validation/EditorPrototypeAssets/`.
- Engine Package ZIP exports must remain source-sample-only and must not contain this production package.

## Sample walkthrough

Use this release-candidate walkthrough to verify the full user path:

1. In AGM Studio, export an `AGM Engine Package ZIP`.
2. Extract the ZIP to a local `engine-package` folder; do not select the ZIP directly in Unity.
3. In Unity 2022.3, open Package Manager and choose `Add package from disk...`.
4. Select `Packages/com.agm.importers.unity/package.json` from this repository or a copied package folder.
5. Open `AGM > Engine Package Importer`.
6. Browse to the extracted `engine-package` folder.
7. Click `Inspect` and confirm diagnostics include package id, grid, height samples, RAW16 bytes, map records, and `Production asset output: False`.
8. Click `Import` only after Inspect succeeds for the same folder.
9. Confirm the import summary states that runtime import created no Unity assets.

## Packaging checklist

Before cutting a preview release candidate:

- Keep `name` as `com.agm.importers.unity` and `version` as `0.1.0-preview.1` until the release candidate is explicitly cut.
- Keep Runtime and Editor assemblies split as `AGM.Importers.Unity.Runtime` and `AGM.Importers.Unity.Editor`.
- Keep this package outside AGM Engine Package ZIP exports.
- Keep runtime APIs non-authoring: no Unity assets, prefabs, packages, compiled plugins, or `.unitypackage` outputs.
- Keep editor prototype asset authoring scoped to validator temp Unity projects only.
- Keep package compile gate, package import smoke test, runtime issue taxonomy, editor prototype asset scope checks, mock Unity fixture automation, and real Unity executable validation green.

## Release-candidate status

This package is still `0.1.0-preview.1`. Promotion requires the package compile gate, package import smoke test, runtime issue taxonomy, editor prototype asset scope checks, and real Unity executable validation to stay green.

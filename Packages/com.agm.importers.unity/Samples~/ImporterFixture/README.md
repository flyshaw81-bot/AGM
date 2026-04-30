# AGM Unity Importer Fixture

This sample folder is reserved for fixture data used by the production Unity importer package scaffold. Engine Package ZIP exports must not include this Unity package or its package metadata.

## Usage contract

- Install or copy `com.agm.importers.unity` as a separate Unity package; do not bundle it inside an AGM Engine Package ZIP.
- Use `AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage(packageRoot)` for importer execution.
- Use `AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage(packageRoot)` for non-authoring diagnostics and import summaries.
- Treat `AgmImportException.Issue` as the machine-readable failure contract. Its issue schema is `agm.unity-runtime-import-issue.v0`.
- Supported issue codes are `package-root-missing`, `required-directory-missing`, `required-file-count-mismatch`, `heightfield-grid-missing`, `heightfield-sample-count-mismatch`, and `raw16-byte-length-mismatch`.
- Runtime import APIs must not create Unity assets, prefabs, packages, or compiled plugin outputs. Editor prototype asset authoring remains validator-temp-project-only.

## Unity menu workflow

After installing this package as a local Unity package, use these menu entries:

- `AGM > Engine Package Importer` opens the guided importer window with folder selection, Inspect, Import, status, and diagnostics output. Import is disabled until the selected folder has inspected successfully.
- `AGM > Inspect Unpacked Engine Package...` runs `InspectUnpackedPackage` and logs a non-authoring diagnostics summary.
- `AGM > Import Unpacked Engine Package...` runs `ImportFromUnpackedPackage` and logs the imported grid/sample summary.

Both menu actions consume an already extracted AGM Engine Package folder. They do not read ZIP files directly and do not create production Unity assets.

## Fixture walkthrough

Use the fixture to rehearse the package workflow without treating the Engine Package ZIP as a Unity package:

1. Export or reuse an AGM Engine Package ZIP from AGM Studio fixture automation.
2. Extract it to an `engine-package` directory.
3. Install `com.agm.importers.unity` separately through Unity Package Manager's local package flow.
4. Open `AGM > Engine Package Importer`, browse to the extracted directory, run `Inspect`, then run `Import` only after Inspect succeeds.
5. Confirm diagnostics mention package id, grid, height samples, RAW16 bytes, map records, and no production asset output.
6. For automation, keep `npm run test:engine-importer-fixtures`, mock Unity validation, and real Unity executable validation green.

## Release-candidate checklist

Before this package can move from scaffold to preview release candidate, keep these checks green:

- Package metadata remains `com.agm.importers.unity` at `0.1.0-preview.1` until the release candidate is explicitly cut.
- Runtime and Editor assemblies remain split as `AGM.Importers.Unity.Runtime` and `AGM.Importers.Unity.Editor`.
- `package.json`, `.asmdef`, `.cs`, compiled assemblies, Unity assets, prefabs, and `.unitypackage` files remain outside Engine Package ZIP exports.
- Validator temp Unity projects must pass package compile gate, package import smoke test, runtime issue taxonomy check, and editor prototype asset scope checks.
- Release-candidate promotion still requires a real Unity executable validation pass in addition to mock Unity fixture automation.

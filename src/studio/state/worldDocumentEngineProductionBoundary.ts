export function createProductionPluginBoundary() {
  return {
    status: "source-sample-and-validation-prototype-only",
    productionPluginsIncluded: false,
    compiledPluginsIncluded: false,
    enginePackagesIncluded: false,
    exportedUnityAssetsIncluded: false,
    validatorTempArtifactsAreProductionAssets: false,
    sourceSamplesMayBeAdaptedIntoPlugins: true,
    productionizationRequiredBeforeRuntimeUse: true,
    allowedExportExtensions: [
      ".json",
      ".txt",
      ".md",
      ".png",
      ".raw",
      ".geojson",
    ],
    forbiddenExportExtensions: [
      ".cs",
      ".dll",
      ".asmdef",
      ".asset",
      ".prefab",
      ".unitypackage",
    ],
    forbiddenUnityPackageFiles: ["handoff/importers/unity/package.json"],
    validatorTempArtifactRoot: "Assets/AGM/Validation/EditorPrototypeAssets",
    productionPluginStatus: "not-included-review-required",
    nextStep:
      "review which source samples can become versioned Unity/Godot/Unreal production plugins without weakening the artifact contract",
  };
}

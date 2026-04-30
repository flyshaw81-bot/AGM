import type { ImporterStubFile } from "./worldDocumentImporterStubTypes";

export function createUnityImportMenuFile(): ImporterStubFile {
  return {
    path: "handoff/importers/unity/Editor/AgmImportMenu.cs.txt",
    content: [
      "using UnityEditor;",
      "using UnityEngine;",
      "",
      "public static class AgmImportMenu",
      "{",
      '    [MenuItem("AGM/Import Unpacked Engine Package")]',
      "    public static void ImportUnpackedPackage()",
      "    {",
      '        var packageRoot = EditorUtility.OpenFolderPanel("Select unpacked AGM Engine Package", Application.dataPath, "");',
      "        if (string.IsNullOrEmpty(packageRoot)) return;",
      "        var imported = AgmRuntimePackageImporter.ImportFromUnpackedPackage(packageRoot);",
      '        Debug.Log($"Imported AGM package {imported.PackageName} with {imported.HeightSampleCount} RAW16 height samples.");',
      "    }",
      "}",
    ].join("\n"),
  };
}

export function createUnityAssetAuthoringPrototypeFile(): ImporterStubFile {
  return {
    path: "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt",
    content: [
      "using System.IO;",
      "using UnityEditor;",
      "using UnityEngine;",
      "",
      "public sealed class AgmWorldPrototypeAsset : ScriptableObject",
      "{",
      "    public string PackageId;",
      "    public string PackageName;",
      "    public int HeightSampleCount;",
      "}",
      "",
      "public static class AgmAssetAuthoringPrototype",
      "{",
      "    public static void AuthorTemporaryEditorPrototypeAssets(AgmImportedPackage imported, string assetRoot)",
      "    {",
      "        Directory.CreateDirectory(assetRoot);",
      "        var terrain = new TerrainData();",
      "        terrain.heightmapResolution = Mathf.Max(33, Mathf.NextPowerOfTwo(Mathf.Max(imported.GridWidth, imported.GridHeight)) + 1);",
      "        terrain.size = new Vector3(Mathf.Max(1, imported.GridWidth), 1f, Mathf.Max(1, imported.GridHeight));",
      '        AssetDatabase.CreateAsset(terrain, Path.Combine(assetRoot, "AgmTerrainPrototype.asset"));',
      "",
      "        var world = (AgmWorldPrototypeAsset)ScriptableObject.CreateInstance(typeof(AgmWorldPrototypeAsset));",
      "        world.PackageId = imported.PackageId;",
      "        world.PackageName = imported.PackageName;",
      "        world.HeightSampleCount = imported.HeightSampleCount;",
      '        AssetDatabase.CreateAsset(world, Path.Combine(assetRoot, "AgmWorldPrototype.asset"));',
      "",
      '        var prefabRoot = new GameObject("AGM World Prototype");',
      "        prefabRoot.transform.position = Vector3.zero;",
      '        PrefabUtility.SaveAsPrefabAsset(prefabRoot, Path.Combine(assetRoot, "AgmWorldPrototype.prefab"));',
      "        Object.DestroyImmediate(prefabRoot);",
      "        AssetDatabase.SaveAssets();",
      "        AssetDatabase.Refresh();",
      "    }",
      "}",
    ].join("\n"),
  };
}

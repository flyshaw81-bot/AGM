using AGM.Importers.Unity;
using UnityEditor;
using UnityEngine;

namespace AGM.Importers.Unity.Editor
{
    public sealed class AgmWorldPrototypeAsset : ScriptableObject
    {
        public string PackageId = string.Empty;
        public string PackageName = string.Empty;
        public int HeightSampleCount;
    }

    public static class AgmAssetAuthoringPrototype
    {
        public static void AuthorTemporaryEditorPrototypeAssets(AgmImportedPackage imported, string assetRoot)
        {
            var world = ScriptableObject.CreateInstance<AgmWorldPrototypeAsset>();
            world.PackageId = imported.PackageId;
            world.PackageName = imported.PackageName;
            world.HeightSampleCount = imported.HeightSampleCount;
            AssetDatabase.CreateAsset(world, $"{assetRoot}/AgmWorldPrototype.asset");
            AssetDatabase.SaveAssets();
        }
    }
}

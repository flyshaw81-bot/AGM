using AGM.Importers.Unity;
using UnityEditor;
using UnityEngine;

namespace AGM.Importers.Unity.Editor
{
    public static class AgmImportMenu
    {
        [MenuItem("AGM/Inspect Unpacked Engine Package...")]
        public static void InspectUnpackedEnginePackage()
        {
            var packageRoot = EditorUtility.OpenFolderPanel("Inspect AGM Engine Package", string.Empty, string.Empty);
            if (string.IsNullOrEmpty(packageRoot)) return;
            var report = AgmRuntimePackageImporter.InspectUnpackedPackage(packageRoot);
            Debug.Log(AgmImporterWindow.FormatReportForMenu(report));
        }

        [MenuItem("AGM/Import Unpacked Engine Package...")]
        public static void ImportUnpackedEnginePackage()
        {
            var packageRoot = EditorUtility.OpenFolderPanel("Import AGM Engine Package", string.Empty, string.Empty);
            if (string.IsNullOrEmpty(packageRoot)) return;
            var imported = AgmRuntimePackageImporter.ImportFromUnpackedPackage(packageRoot);
            Debug.Log(AgmImporterWindow.FormatImportSummary(imported));
        }
    }
}

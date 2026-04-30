using System;
using System.Text;
using AGM.Importers.Unity;
using UnityEditor;
using UnityEngine;

namespace AGM.Importers.Unity.Editor
{
    public sealed class AgmImporterWindow : EditorWindow
    {
        string packageRoot = string.Empty;
        string diagnostics = "Select an extracted AGM Engine Package folder, then inspect it before importing.";
        string lastInspectedPackageRoot = string.Empty;
        AgmImportReport lastInspectionReport;
        MessageType statusType = MessageType.Info;
        Vector2 scroll;

        [MenuItem("AGM/Engine Package Importer")]
        public static void Open()
        {
            var window = GetWindow<AgmImporterWindow>("AGM Importer");
            window.minSize = new Vector2(520, 360);
            window.Show();
        }

        void OnGUI()
        {
            EditorGUILayout.LabelField("AGM Engine Package Importer", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox("Select an extracted AGM Engine Package folder. Inspect validates data without creating Unity assets; Import consumes the package and reports a summary.", MessageType.Info);
            EditorGUILayout.HelpBox(StatusText(), statusType);

            using (new EditorGUILayout.HorizontalScope())
            {
                EditorGUI.BeginChangeCheck();
                packageRoot = EditorGUILayout.TextField("Package Folder", packageRoot);
                if (EditorGUI.EndChangeCheck()) ClearInspection();
                if (GUILayout.Button("Browse", GUILayout.Width(88))) BrowsePackageRoot();
            }

            using (new EditorGUILayout.HorizontalScope())
            {
                using (new EditorGUI.DisabledScope(string.IsNullOrWhiteSpace(packageRoot)))
                {
                    if (GUILayout.Button("Inspect")) InspectPackage();
                }

                using (new EditorGUI.DisabledScope(!CanImportInspectedPackage()))
                {
                    if (GUILayout.Button("Import")) ImportPackage();
                }
            }

            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Diagnostics", EditorStyles.boldLabel);
            scroll = EditorGUILayout.BeginScrollView(scroll);
            EditorGUILayout.TextArea(diagnostics, GUILayout.ExpandHeight(true));
            EditorGUILayout.EndScrollView();
        }

        void BrowsePackageRoot()
        {
            var selected = EditorUtility.OpenFolderPanel("Select AGM Engine Package Folder", packageRoot, string.Empty);
            if (!string.IsNullOrEmpty(selected) && selected != packageRoot)
            {
                packageRoot = selected;
                ClearInspection();
            }
        }

        bool CanImportInspectedPackage()
        {
            return lastInspectionReport != null && lastInspectionReport.Status == "imported" && lastInspectedPackageRoot == packageRoot;
        }

        string StatusText()
        {
            if (string.IsNullOrWhiteSpace(packageRoot)) return "Status: waiting for an extracted AGM Engine Package folder.";
            if (lastInspectionReport == null) return "Status: inspect required before import.";
            if (lastInspectedPackageRoot != packageRoot) return "Status: package folder changed; inspect again before import.";
            return $"Status: inspected {lastInspectionReport.Summary.PackageId}; import is ready.";
        }

        void ClearInspection()
        {
            lastInspectedPackageRoot = string.Empty;
            lastInspectionReport = null;
            statusType = MessageType.Info;
        }

        void InspectPackage()
        {
            try
            {
                lastInspectionReport = AgmRuntimePackageImporter.InspectUnpackedPackage(packageRoot);
                lastInspectedPackageRoot = packageRoot;
                statusType = MessageType.Info;
                diagnostics = FormatReport(lastInspectionReport);
                Debug.Log(diagnostics);
            }
            catch (AgmImportException error)
            {
                ClearInspection();
                statusType = MessageType.Error;
                diagnostics = FormatIssue(error.Issue);
                Debug.LogError(diagnostics);
            }
            catch (Exception error)
            {
                ClearInspection();
                statusType = MessageType.Error;
                diagnostics = error.Message;
                Debug.LogError(diagnostics);
            }
        }

        void ImportPackage()
        {
            if (!CanImportInspectedPackage())
            {
                statusType = MessageType.Warning;
                diagnostics = "Inspect this exact AGM Engine Package folder before importing.";
                Debug.LogWarning(diagnostics);
                return;
            }

            try
            {
                var imported = AgmRuntimePackageImporter.ImportFromUnpackedPackage(packageRoot);
                statusType = MessageType.Info;
                diagnostics = FormatImportSummary(imported);
                Debug.Log(diagnostics);
            }
            catch (AgmImportException error)
            {
                ClearInspection();
                statusType = MessageType.Error;
                diagnostics = FormatIssue(error.Issue);
                Debug.LogError(diagnostics);
            }
            catch (Exception error)
            {
                ClearInspection();
                statusType = MessageType.Error;
                diagnostics = error.Message;
                Debug.LogError(diagnostics);
            }
        }

        internal static string FormatReportForMenu(AgmImportReport report)
        {
            return FormatReport(report);
        }

        internal static string FormatImportSummary(AgmImportedPackage imported)
        {
            return $"Imported AGM package {imported.PackageName} ({imported.GridWidth}x{imported.GridHeight}, {imported.HeightSampleCount} height samples). Runtime import created no Unity assets.";
        }

        static string FormatReport(AgmImportReport report)
        {
            var summary = report.Summary;
            var text = new StringBuilder();
            text.AppendLine($"AGM package inspection: {report.Status}");
            text.AppendLine($"Package: {summary.PackageId}");
            text.AppendLine($"Grid: {summary.Grid}");
            text.AppendLine($"Height samples: {summary.HeightSampleCount}");
            text.AppendLine($"RAW16 bytes: {report.Raw16ByteLength}/{report.ExpectedRaw16ByteLength}");
            text.AppendLine($"Map records: resource={summary.ResourceRecords}, province={summary.ProvinceRecords}, biome={summary.BiomeRecords}");
            text.AppendLine($"Production asset output: {report.ProductionAssetOutput}");
            return text.ToString();
        }

        static string FormatIssue(AgmImportIssue issue)
        {
            if (issue == null) return "AGM import failed.";
            return $"AGM import failed: {issue.Code}\n{issue.Message}\nPath: {issue.Path}\nExpected: {issue.Expected}\nActual: {issue.Actual}";
        }
    }
}

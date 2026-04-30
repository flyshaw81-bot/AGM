using System;
using System.Collections.Generic;

namespace AGM.Importers.Unity
{
    public sealed class AgmImportedPackage
    {
        public string PackageId { get; set; } = string.Empty;
        public string PackageName { get; set; } = string.Empty;
        public int HeightSampleCount { get; set; }
        public int GridWidth { get; set; }
        public int GridHeight { get; set; }
        public int SampleSpacing { get; set; }
        public string HeightScale { get; set; } = string.Empty;
        public string HeightSource { get; set; } = string.Empty;
        public string ArtifactContractSchema { get; set; } = string.Empty;
        public string PackageFormat { get; set; } = string.Empty;
        public int LayoutVersion { get; set; }
        public bool ZipParsingSupported { get; set; }
        public bool ProductionPluginIncluded { get; set; }
        public string ValidationMode { get; set; } = string.Empty;
        public int NormalizedMin { get; set; }
        public int NormalizedMax { get; set; }
        public int RawMin { get; set; }
        public int RawMax { get; set; }
        public ushort Raw16MinSample { get; set; }
        public ushort Raw16MaxSample { get; set; }
        public ushort[] Raw16Heights { get; set; } = new ushort[0];
        public string ResourceLayerPath { get; set; } = string.Empty;
        public string ProvinceLayerPath { get; set; } = string.Empty;
        public string BiomeLayerPath { get; set; } = string.Empty;
        public int ResourceLayerRecordCount { get; set; }
        public int ProvinceLayerRecordCount { get; set; }
        public int BiomeLayerRecordCount { get; set; }
        public string ResourceLayerSummary { get; set; } = string.Empty;
        public string ProvinceLayerSummary { get; set; } = string.Empty;
        public string BiomeLayerSummary { get; set; } = string.Empty;
        public string AssetAuthoringPlanSchema { get; set; } = string.Empty;
        public string AssetAuthoringOutputKind { get; set; } = string.Empty;
        public string AssetAuthoringReportBlock { get; set; } = string.Empty;
        public int PlannedUnityArtifactCount { get; set; }
        public bool CreatesUnityTerrainAsset { get; set; }
        public bool CreatesScriptableObjectAsset { get; set; }
        public bool CreatesPrefabAsset { get; set; }
        public bool ExportedAssetsIncluded { get; set; }
        public bool CreatesUnityTerrainAssetInExport { get; set; }
        public bool CreatesScriptableObjectAssetInExport { get; set; }
        public bool CreatesPrefabAssetInExport { get; set; }
        public bool CreatesUnityPackage { get; set; }
        public bool UsesAssetDatabaseCreateAsset { get; set; }
        public bool UsesScriptableObjectCreateInstance { get; set; }
        public bool UsesUnityPackageManager { get; set; }
        public IReadOnlyList<AgmMapLayerSummary> MapLayers { get; set; } = new List<AgmMapLayerSummary>();
        public List<string> Warnings { get; } = new List<string>();
    }

    public sealed class AgmMapLayerSummary
    {
        public string Layer { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public int RecordCount { get; set; }
        public string SummaryStatus { get; set; } = string.Empty;
    }

    public static class AgmImportIssueCode
    {
        public const string PackageRootMissing = "package-root-missing";
        public const string RequiredDirectoryMissing = "required-directory-missing";
        public const string RequiredFileCountMismatch = "required-file-count-mismatch";
        public const string HeightfieldGridMissing = "heightfield-grid-missing";
        public const string HeightfieldSampleCountMismatch = "heightfield-sample-count-mismatch";
        public const string Raw16ByteLengthMismatch = "raw16-byte-length-mismatch";
    }

    public sealed class AgmImportIssue
    {
        public string Schema { get; set; } = "agm.unity-runtime-import-issue.v0";
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string Expected { get; set; } = string.Empty;
        public string Actual { get; set; } = string.Empty;
    }

    public sealed class AgmImportException : Exception
    {
        public AgmImportException(AgmImportIssue issue) : base(issue == null ? "AGM import failed." : issue.Message)
        {
            Issue = issue ?? new AgmImportIssue { Code = "unknown", Message = "AGM import failed." };
        }

        public AgmImportIssue Issue { get; }
    }

    public sealed class AgmPackageImportSummary
    {
        public string PackageId { get; set; } = string.Empty;
        public int HeightSampleCount { get; set; }
        public string Grid { get; set; } = string.Empty;
        public int Raw16SampleCount { get; set; }
        public int ResourceRecords { get; set; }
        public int ProvinceRecords { get; set; }
        public int BiomeRecords { get; set; }
    }

    public sealed class AgmImportReport
    {
        public string Schema { get; set; } = "agm.unity-runtime-import-report.v0";
        public string Status { get; set; } = "imported";
        public int Raw16ByteLength { get; set; }
        public int ExpectedRaw16ByteLength { get; set; }
        public bool Raw16LengthMatchesHeightfield { get; set; }
        public string ManifestSummary { get; set; } = string.Empty;
        public AgmPackageImportSummary Summary { get; set; } = new AgmPackageImportSummary();
        public bool ProductionAssetOutput { get; set; }
    }
}

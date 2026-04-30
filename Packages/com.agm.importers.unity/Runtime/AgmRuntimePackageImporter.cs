using System;
using System.Collections.Generic;
using System.IO;

namespace AGM.Importers.Unity
{
    public static class AgmRuntimePackageImporter
    {
        public static AgmImportReport InspectUnpackedPackage(string packageRoot)
        {
            var imported = ImportFromUnpackedPackage(packageRoot);
            return new AgmImportReport
            {
                Raw16ByteLength = imported.Raw16Heights.Length * 2,
                ExpectedRaw16ByteLength = imported.HeightSampleCount * 2,
                Raw16LengthMatchesHeightfield = imported.Raw16Heights.Length == imported.HeightSampleCount,
                ManifestSummary = imported.PackageName,
                Summary = CreateImportSummary(imported),
                ProductionAssetOutput = false,
            };
        }

        public static AgmPackageImportSummary CreateImportSummary(AgmImportedPackage imported)
        {
            if (imported == null) throw new ArgumentNullException(nameof(imported));
            return new AgmPackageImportSummary
            {
                PackageId = imported.PackageId,
                HeightSampleCount = imported.HeightSampleCount,
                Grid = imported.GridWidth + "x" + imported.GridHeight,
                Raw16SampleCount = imported.Raw16Heights == null ? 0 : imported.Raw16Heights.Length,
                ResourceRecords = imported.ResourceLayerRecordCount,
                ProvinceRecords = imported.ProvinceLayerRecordCount,
                BiomeRecords = imported.BiomeLayerRecordCount,
            };
        }

        public static AgmImportedPackage ImportFromUnpackedPackage(string packageRoot)
        {
            if (string.IsNullOrWhiteSpace(packageRoot)) ThrowImportIssue(AgmImportIssueCode.PackageRootMissing, "Package root is required.", string.Empty, "non-empty path", "empty");
            if (!Directory.Exists(packageRoot)) ThrowImportIssue(AgmImportIssueCode.PackageRootMissing, $"Package root does not exist: {packageRoot}", packageRoot, "existing directory", "missing");

            var manifestPath = FindRequiredFile(packageRoot, "manifest", ".agm-engine-manifest.json");
            var heightfieldPath = FindRequiredFile(packageRoot, "terrain", ".agm-heightfield.json");
            var raw16Path = FindRequiredFile(packageRoot, "terrain", ".agm-heightmap-r16.raw");
            var sampleMetadataPath = Path.Combine(packageRoot, "handoff", "importer-sample-metadata.json");
            var packageLayoutPath = Path.Combine(packageRoot, "handoff", "importers", "unity", "package-layout.json");
            var resourcePath = FindRequiredFile(packageRoot, "maps", ".agm-resource-map.json");
            var provincePath = FindRequiredFile(packageRoot, "maps", ".agm-province-map.json");
            var biomePath = FindRequiredFile(packageRoot, "maps", ".agm-biome-map.json");

            var manifestJson = File.ReadAllText(manifestPath);
            var heightfieldJson = File.ReadAllText(heightfieldPath);
            var sampleMetadataJson = File.ReadAllText(sampleMetadataPath);
            var packageLayoutJson = File.ReadAllText(packageLayoutPath);
            var resourceMapJson = File.ReadAllText(resourcePath);
            var provinceMapJson = File.ReadAllText(provincePath);
            var biomeMapJson = File.ReadAllText(biomePath);
            var rawBytes = File.ReadAllBytes(raw16Path);

            var heightfieldSampleCount = CountArrayItems(heightfieldJson, "\"values\"");
            var gridJson = ReadObjectAfter(heightfieldJson, "\"grid\"");
            var normalizationJson = ReadObjectAfter(heightfieldJson, "\"normalization\"");
            var gridWidth = ReadIntAfter(gridJson, "\"width\"", 0);
            var gridHeight = ReadIntAfter(gridJson, "\"height\"", 0);
            var sampleSpacing = ReadIntAfter(gridJson, "\"sampleSpacing\"", 1);
            var normalizedMin = ReadIntAfter(normalizationJson, "\"min\"", 0);
            var normalizedMax = ReadIntAfter(normalizationJson, "\"max\"", 100);
            if (gridWidth <= 0 || gridHeight <= 0) ThrowImportIssue(AgmImportIssueCode.HeightfieldGridMissing, "Heightfield grid dimensions are missing.", heightfieldPath, "positive width and height", gridWidth + "x" + gridHeight);
            if (gridWidth * gridHeight != heightfieldSampleCount) ThrowImportIssue(AgmImportIssueCode.HeightfieldSampleCountMismatch, $"Heightfield grid {gridWidth}x{gridHeight} does not match sample count {heightfieldSampleCount}.", heightfieldPath, (gridWidth * gridHeight).ToString(), heightfieldSampleCount.ToString());
            var expectedRawBytes = heightfieldSampleCount * 2;
            if (rawBytes.Length != expectedRawBytes) ThrowImportIssue(AgmImportIssueCode.Raw16ByteLengthMismatch, $"RAW16 byte length {rawBytes.Length} does not match heightfield sample count {heightfieldSampleCount}.", raw16Path, expectedRawBytes.ToString(), rawBytes.Length.ToString());

            var heights = DecodeUInt16LittleEndian(rawBytes);
            var resourceRecords = CountArrayItems(resourceMapJson, "\"tiles\"");
            var provinceRecords = CountArrayItems(provinceMapJson, "\"tiles\"");
            var biomeRecords = CountArrayItems(biomeMapJson, "\"biomes\"");
            var mapLayers = new List<AgmMapLayerSummary>
            {
                new AgmMapLayerSummary { Layer = "resource", Path = RelativePackagePath(packageRoot, resourcePath), RecordCount = resourceRecords, SummaryStatus = HasJsonKey(resourceMapJson, "coverageSummary") ? "coverageSummary-present" : "coverageSummary-missing" },
                new AgmMapLayerSummary { Layer = "province", Path = RelativePackagePath(packageRoot, provincePath), RecordCount = provinceRecords, SummaryStatus = HasJsonKey(provinceMapJson, "structureSummary") ? "structureSummary-present" : "structureSummary-missing" },
                new AgmMapLayerSummary { Layer = "biome", Path = RelativePackagePath(packageRoot, biomePath), RecordCount = biomeRecords, SummaryStatus = HasJsonKey(biomeMapJson, "habitabilitySummary") ? "habitabilitySummary-present" : "habitabilitySummary-missing" },
            };

            return new AgmImportedPackage
            {
                PackageId = ReadStringAfter(manifestJson, "\"id\"", Path.GetFileName(packageRoot)),
                PackageName = ReadStringAfter(manifestJson, "\"name\"", Path.GetFileName(packageRoot)),
                HeightSampleCount = heightfieldSampleCount,
                GridWidth = gridWidth,
                GridHeight = gridHeight,
                SampleSpacing = sampleSpacing,
                HeightScale = ReadStringAfter(sampleMetadataJson, "\"heightScale\"", "designer-defined"),
                HeightSource = ReadStringAfter(manifestJson, "\"rawEncoding\"", "uint16-little-endian"),
                ArtifactContractSchema = ReadStringAfter(packageLayoutJson, "\"contractSchema\"", "agm.engine-package-contract.v0"),
                PackageFormat = ReadStringAfter(manifestJson, "\"packageFormat\"", "agm.engine-package.v0"),
                LayoutVersion = ReadIntAfter(packageLayoutJson, "\"layoutVersion\"", 0),
                ZipParsingSupported = ReadBoolAfter(packageLayoutJson, "\"zipParsingSupported\"", false),
                ProductionPluginIncluded = ReadBoolAfter(packageLayoutJson, "\"productionPluginIncluded\"", false),
                ValidationMode = ReadStringAfter(packageLayoutJson, "\"validationMode\"", "extracted-directory-only"),
                NormalizedMin = normalizedMin,
                NormalizedMax = normalizedMax,
                RawMin = 0,
                RawMax = 65535,
                Raw16MinSample = FindMin(heights),
                Raw16MaxSample = FindMax(heights),
                Raw16Heights = heights,
                ResourceLayerPath = RelativePackagePath(packageRoot, resourcePath),
                ProvinceLayerPath = RelativePackagePath(packageRoot, provincePath),
                BiomeLayerPath = RelativePackagePath(packageRoot, biomePath),
                ResourceLayerRecordCount = resourceRecords,
                ProvinceLayerRecordCount = provinceRecords,
                BiomeLayerRecordCount = biomeRecords,
                ResourceLayerSummary = mapLayers[0].SummaryStatus,
                ProvinceLayerSummary = mapLayers[1].SummaryStatus,
                BiomeLayerSummary = mapLayers[2].SummaryStatus,
                AssetAuthoringPlanSchema = "agm.unity-asset-authoring-plan.v0",
                AssetAuthoringOutputKind = ReadStringAfter(packageLayoutJson, "\"assetAuthoringOutputKind\"", "temporary-unity-project-editor-artifacts"),
                AssetAuthoringReportBlock = "assetAuthoringPrototype",
                PlannedUnityArtifactCount = 3,
                CreatesUnityTerrainAsset = false,
                CreatesScriptableObjectAsset = false,
                CreatesPrefabAsset = false,
                ExportedAssetsIncluded = ReadBoolAfter(packageLayoutJson, "\"exportedAssetsIncluded\"", false),
                CreatesUnityTerrainAssetInExport = ReadBoolAfter(packageLayoutJson, "\"createsUnityTerrainAssetInExport\"", false),
                CreatesScriptableObjectAssetInExport = ReadBoolAfter(packageLayoutJson, "\"createsScriptableObjectAssetInExport\"", false),
                CreatesPrefabAssetInExport = ReadBoolAfter(packageLayoutJson, "\"createsPrefabAssetInExport\"", false),
                CreatesUnityPackage = false,
                UsesAssetDatabaseCreateAsset = false,
                UsesScriptableObjectCreateInstance = false,
                UsesUnityPackageManager = false,
                MapLayers = mapLayers,
            };
        }

        static string FindRequiredFile(string packageRoot, string directoryName, string suffix)
        {
            var directory = Path.Combine(packageRoot, directoryName);
            if (!Directory.Exists(directory)) ThrowImportIssue(AgmImportIssueCode.RequiredDirectoryMissing, $"Required package directory is missing: {directoryName}", directory, "existing directory", "missing");
            var matches = Directory.GetFiles(directory, "*" + suffix, SearchOption.TopDirectoryOnly);
            if (matches.Length != 1) ThrowImportIssue(AgmImportIssueCode.RequiredFileCountMismatch, $"Expected exactly one {suffix} file under {directoryName}, got {matches.Length}.", directory, "1", matches.Length.ToString());
            return matches[0];
        }

        static void ThrowImportIssue(string code, string message, string path, string expected, string actual)
        {
            throw new AgmImportException(new AgmImportIssue
            {
                Code = code,
                Message = message,
                Path = path,
                Expected = expected,
                Actual = actual,
            });
        }

        static string RelativePackagePath(string packageRoot, string fullPath)
        {
            var relative = fullPath.Substring(packageRoot.Length).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            return relative.Replace(Path.DirectorySeparatorChar, '/').Replace(Path.AltDirectorySeparatorChar, '/');
        }

        static ushort[] DecodeUInt16LittleEndian(byte[] rawBytes)
        {
            var values = new ushort[rawBytes.Length / 2];
            for (var i = 0; i < values.Length; i++) values[i] = (ushort)(rawBytes[i * 2] | (rawBytes[i * 2 + 1] << 8));
            return values;
        }

        static ushort FindMin(ushort[] values)
        {
            if (values.Length == 0) return 0;
            var min = values[0];
            for (var i = 1; i < values.Length; i++) if (values[i] < min) min = values[i];
            return min;
        }

        static ushort FindMax(ushort[] values)
        {
            if (values.Length == 0) return 0;
            var max = values[0];
            for (var i = 1; i < values.Length; i++) if (values[i] > max) max = values[i];
            return max;
        }

        static string ReadObjectAfter(string json, string marker)
        {
            var markerIndex = json.IndexOf(marker, StringComparison.Ordinal);
            if (markerIndex < 0) return string.Empty;
            var open = json.IndexOf((char)123, markerIndex);
            if (open < 0) return string.Empty;
            var depth = 0;
            for (var i = open; i < json.Length; i++)
            {
                if (json[i] == (char)123) depth++;
                else if (json[i] == (char)125)
                {
                    depth--;
                    if (depth == 0) return json.Substring(open, i - open + 1);
                }
            }
            return string.Empty;
        }

        static int ReadIntAfter(string json, string marker, int fallback)
        {
            var markerIndex = json.IndexOf(marker, StringComparison.Ordinal);
            if (markerIndex < 0) return fallback;
            var colon = json.IndexOf(':', markerIndex);
            if (colon < 0) return fallback;
            var start = colon + 1;
            while (start < json.Length && char.IsWhiteSpace(json[start])) start++;
            var end = start;
            while (end < json.Length && (char.IsDigit(json[end]) || json[end] == '-')) end++;
            if (end == start) return fallback;
            return int.TryParse(json.Substring(start, end - start), out var value) ? value : fallback;
        }

        static string ReadStringAfter(string json, string marker, string fallback)
        {
            var markerIndex = json.IndexOf(marker, StringComparison.Ordinal);
            if (markerIndex < 0) return fallback;
            var colon = json.IndexOf(':', markerIndex);
            if (colon < 0) return fallback;
            var open = json.IndexOf('"', colon + 1);
            if (open < 0) return fallback;
            var close = json.IndexOf('"', open + 1);
            if (close < 0) return fallback;
            return json.Substring(open + 1, close - open - 1);
        }

        static bool ReadBoolAfter(string json, string marker, bool fallback)
        {
            var markerIndex = json.IndexOf(marker, StringComparison.Ordinal);
            if (markerIndex < 0) return fallback;
            var colon = json.IndexOf(':', markerIndex);
            if (colon < 0) return fallback;
            var start = colon + 1;
            while (start < json.Length && char.IsWhiteSpace(json[start])) start++;
            if (string.Compare(json, start, "true", 0, 4, StringComparison.OrdinalIgnoreCase) == 0) return true;
            if (string.Compare(json, start, "false", 0, 5, StringComparison.OrdinalIgnoreCase) == 0) return false;
            return fallback;
        }

        static int CountArrayItems(string json, string marker)
        {
            var markerIndex = json.IndexOf(marker, StringComparison.Ordinal);
            if (markerIndex < 0) return 0;
            var open = json.IndexOf('[', markerIndex);
            if (open < 0) return 0;
            var close = FindMatchingArrayClose(json, open);
            if (close < 0) return 0;
            var slice = json.Substring(open + 1, close - open - 1).Trim();
            if (slice.Length == 0) return 0;
            var depth = 0;
            var count = 1;
            for (var i = 0; i < slice.Length; i++)
            {
                var c = slice[i];
                if (c == (char)123 || c == (char)91) depth++;
                if (c == (char)125 || c == (char)93) depth--;
                if (c == (char)44 && depth == 0) count++;
            }
            return count;
        }

        static int FindMatchingArrayClose(string json, int open)
        {
            var depth = 0;
            for (var i = open; i < json.Length; i++)
            {
                if (json[i] == (char)91) depth++;
                else if (json[i] == (char)93)
                {
                    depth--;
                    if (depth == 0) return i;
                }
            }
            return -1;
        }

        static bool HasJsonKey(string json, string key)
        {
            return json.IndexOf("\"" + key + "\"", StringComparison.Ordinal) >= 0;
        }
    }
}

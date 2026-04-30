import type {
  ImporterStubContext,
  ImporterStubFile,
} from "./worldDocumentImporterStubTypes";

export function createUnityReadmeFile({
  manifestPath,
  raw16Path,
}: ImporterStubContext): ImporterStubFile {
  return {
    path: "handoff/importers/unity/README.md",
    content: [
      "# Unity AGM importer source sample",
      "",
      "This folder contains source samples for adapting an AGM Engine Package into a Unity project.",
      "It is not a production plugin, Unity package, or supported runtime integration.",
      "Production plugin boundary: exported files are source samples plus validation metadata only; real plugins require a separate productionization review.",
      "Planned production importer package: com.agm.importers.unity as a separate versioned Unity package, not bundled in this Engine Package ZIP.",
      "Unity-first vertical slice prototype reads package-layout, importer metadata, terrain RAW16/heightfield, and resource/province/biome maps.",
      "It emits metadata JSON reports for terrain and map-layer validation.",
      "Unity importer asset authoring source sample can author temporary TerrainData, ScriptableObject, and prefab prototype assets only inside the validator Unity project under Assets/AGM/Validation/EditorPrototypeAssets/.",
      "The exported ZIP still includes no prebuilt Unity assets, compiled plugin, Unity package, or production plugin outputs.",
      "Copy AgmImporterStub.cs.txt into an Editor folder and rename it to .cs when you are ready to adapt it.",
      ".cs.txt keeps the samples from compiling until you intentionally copy and adapt them.",
      `Read ${manifestPath} first, then use ${raw16Path} as a uint16 little-endian terrain source.`,
      "The optional validation harness copies these source samples into a temporary Unity project only when Unity CLI is supplied.",
      "",
      "中文：此目录包含用于将 AGM Engine Package 接入 Unity 项目的源码示例。",
      "它不是生产级插件、Unity package 或已支持的运行时集成。",
      "Production plugin boundary：导出文件只包含源码示例与验证 metadata；真正插件需要单独 productionization review。",
      "Unity-first vertical slice prototype 会读取 package-layout、importer metadata、terrain RAW16/heightfield，以及 resource/province/biome 地图层。",
      "它会输出用于 terrain 与 map-layer 校验的 metadata JSON report。",
      "Unity importer asset authoring 源码示例只会在 validator Unity project 的 Assets/AGM/Validation/EditorPrototypeAssets/ 下创建临时 TerrainData、ScriptableObject 与 prefab prototype assets。",
      "导出的 ZIP 仍不包含预生成 Unity assets、compiled plugin、Unity package 或生产级插件输出。",
      "请在准备改造时再复制 .cs.txt 文件并改名为 .cs，避免未确认前自动编译。",
    ].join("\n"),
  };
}

export function createUnityMinimalImporterStubFile({
  manifestPath,
  raw16Path,
}: ImporterStubContext): ImporterStubFile {
  return {
    path: "handoff/importers/unity/AgmImporterStub.cs.txt",
    content: [
      "using System.IO;",
      "using UnityEngine;",
      "",
      "public static class AgmImporterStub",
      "{",
      "    public static void Import(string packageRoot)",
      "    {",
      `        var manifestJson = File.ReadAllText(Path.Combine(packageRoot, "${manifestPath}"));`,
      `        var rawBytes = File.ReadAllBytes(Path.Combine(packageRoot, "${raw16Path}"));`,
      "        // Parse manifestJson, then decode rawBytes as UInt16 little-endian height samples.",
      '        Debug.Log($"AGM manifest bytes: {manifestJson.Length}, RAW16 bytes: {rawBytes.Length}");',
      "    }",
      "}",
    ].join("\n"),
  };
}

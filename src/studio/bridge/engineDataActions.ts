import type { DataAction } from "./engineActionTypes";
import {
  createGlobalDataActionTargets,
  type EngineDataActionTargets,
} from "./engineDataActionTargets";

export function getEngineDataActions(
  targets: EngineDataActionTargets = createGlobalDataActionTargets(),
) {
  targets.ensureDocumentSourceTracking();
  const documentSource = targets.getDocumentSourceSummary();
  const saveTarget = targets.getSaveTargetSummary();

  return {
    canLoadBrowserSnapshot: targets.canLoadBrowserSnapshot(),
    canSaveBrowserSnapshot: targets.canSaveProject(),
    canDownloadProject: targets.canSaveProject(),
    sourceLabel: documentSource.sourceLabel,
    sourceDetail: documentSource.sourceDetail,
    saveLabel: saveTarget.saveLabel,
    saveDetail: saveTarget.saveDetail,
    canCreateGeneratedWorld: targets.canCreateGeneratedWorld(),
    canOpenFile: targets.hasFileInput(),
    canOpenUrlSource: targets.canOpenUrlSource(),
  };
}

export async function runEngineDataAction(
  action: DataAction,
  targets: EngineDataActionTargets = createGlobalDataActionTargets(),
) {
  targets.ensureDocumentSourceTracking();

  if (action === "load-browser-snapshot" && targets.canLoadBrowserSnapshot()) {
    await targets.loadBrowserSnapshot();
    targets.setDocumentSourceSummary({
      sourceLabel: "Browser snapshot",
      sourceDetail: "Browser snapshot",
    });
    return;
  }

  if (action === "save-browser-snapshot" && targets.canSaveProject()) {
    await targets.saveProject("storage");
    return;
  }

  if (action === "download-project" && targets.canSaveProject()) {
    await targets.saveProject("machine");
    return;
  }

  if (
    action === "create-generated-world" &&
    targets.canCreateGeneratedWorld()
  ) {
    await targets.createGeneratedWorld();
    targets.setDocumentSourceSummary({
      sourceLabel: "Generated",
      sourceDetail: "Current settings",
    });
    return;
  }

  if (action === "open-file") {
    targets.clickFileInput();
    return;
  }

  if (action === "open-url-source" && targets.canOpenUrlSource()) {
    targets.openUrlSource();
  }
}

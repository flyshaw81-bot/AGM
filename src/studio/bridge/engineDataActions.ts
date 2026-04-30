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
  const dropbox = targets.getDropboxState();
  const selectedDropboxFile = dropbox.selectedFile;
  const hasDropboxSelection = Boolean(selectedDropboxFile);

  return {
    canQuickLoad: targets.canQuickLoad(),
    canSaveToStorage: targets.canSaveMap(),
    canSaveToMachine: targets.canSaveMap(),
    canSaveToDropbox: targets.canSaveMap(),
    canConnectDropbox:
      targets.canConnectDropbox() && dropbox.connectButtonAvailable,
    canLoadFromDropbox:
      targets.canLoadFromDropbox() &&
      dropbox.connected &&
      hasDropboxSelection &&
      dropbox.buttonsVisible,
    canShareDropbox:
      targets.canShareDropbox() &&
      dropbox.connected &&
      hasDropboxSelection &&
      dropbox.buttonsVisible,
    hasDropboxSelection,
    dropboxConnected: dropbox.connected,
    selectedDropboxFile,
    selectedDropboxLabel: dropbox.selectedLabel,
    hasDropboxShareLink: dropbox.hasShareLink,
    dropboxShareUrl: dropbox.shareUrl,
    sourceLabel: documentSource.sourceLabel,
    sourceDetail: documentSource.sourceDetail,
    saveLabel: saveTarget.saveLabel,
    saveDetail: saveTarget.saveDetail,
    canCreateNew: targets.canGenerateMapOnLoad(),
    canOpenFile: targets.hasFileInput(),
    canLoadUrl: targets.canLoadUrl(),
  };
}

export async function runEngineDataAction(
  action: DataAction,
  targets: EngineDataActionTargets = createGlobalDataActionTargets(),
) {
  targets.ensureDocumentSourceTracking();

  if (action === "quick-load" && targets.canQuickLoad()) {
    await targets.quickLoad();
    targets.setDocumentSourceSummary({
      sourceLabel: "Browser snapshot",
      sourceDetail: "Quick load",
    });
    return;
  }

  if (action === "save-storage" && targets.canSaveMap()) {
    await targets.saveMap("storage");
    return;
  }

  if (action === "save-machine" && targets.canSaveMap()) {
    await targets.saveMap("machine");
    return;
  }

  if (action === "save-dropbox" && targets.canSaveMap()) {
    await targets.saveMap("dropbox");
    return;
  }

  if (action === "connect-dropbox" && targets.canConnectDropbox()) {
    await targets.connectDropbox();
    return;
  }

  if (action === "load-dropbox" && targets.canLoadFromDropbox()) {
    const dropbox = targets.getDropboxState();
    await targets.loadFromDropbox();
    targets.setDocumentSourceSummary({
      sourceLabel: "Dropbox",
      sourceDetail:
        dropbox.selectedLabel || dropbox.selectedFile || "Selected file",
    });
    return;
  }

  if (action === "share-dropbox" && targets.canShareDropbox()) {
    await targets.createSharableDropboxLink();
    return;
  }

  if (action === "new-map" && targets.canGenerateMapOnLoad()) {
    await targets.generateMapOnLoad();
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

  if (action === "load-url" && targets.canLoadUrl()) {
    targets.loadUrl();
  }
}

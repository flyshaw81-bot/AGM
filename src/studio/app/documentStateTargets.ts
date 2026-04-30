import {
  getEngineLayerStates,
  setEngineLayersPreset,
  syncEngineEditorState,
  toggleEngineLayer,
} from "../bridge/engineActions";
import {
  getEngineDocumentState,
  setEngineDocumentName,
} from "../bridge/engineMapHost";
import { getEngineStylePreset } from "../bridge/engineStyle";

export type DocumentStateTargets = {
  syncEditorState: typeof syncEngineEditorState;
  getDocumentState: typeof getEngineDocumentState;
  getStylePreset: typeof getEngineStylePreset;
  setDocumentName: typeof setEngineDocumentName;
  setLayersPreset: typeof setEngineLayersPreset;
  getLayerStates: typeof getEngineLayerStates;
  toggleLayer: typeof toggleEngineLayer;
};

export function createGlobalDocumentStateTargets(): DocumentStateTargets {
  return {
    syncEditorState: syncEngineEditorState,
    getDocumentState: getEngineDocumentState,
    getStylePreset: getEngineStylePreset,
    setDocumentName: setEngineDocumentName,
    setLayersPreset: setEngineLayersPreset,
    getLayerStates: getEngineLayerStates,
    toggleLayer: toggleEngineLayer,
  };
}

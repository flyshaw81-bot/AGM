import type {
  EngineFocusGeometry,
  EngineFocusTarget,
} from "../bridge/engineActions";
import {
  resolveEngineFocusGeometry,
  updateEngineBiomeResource,
  updateEngineBurg,
  updateEngineCulture,
  updateEngineDiplomacy,
  updateEngineProvince,
  updateEngineReligion,
  updateEngineRoute,
  updateEngineStateName,
  updateEngineZone,
} from "../bridge/engineActions";
import type { StudioShellEventHandlers } from "../layout/shellEvents";
import type { StudioState } from "../types";
import { syncDocumentState } from "./documentState";

type HandlerParameters<Key extends keyof StudioShellEventHandlers> = Parameters<
  StudioShellEventHandlers[Key]
>;

export type DirectEditorActionTargets = {
  syncDocument: (state: StudioState) => void;
  resolveFocusGeometry: (focus: EngineFocusTarget) => EngineFocusGeometry;
  updateState: (
    id: HandlerParameters<"onDirectStateApply">[0],
    next: HandlerParameters<"onDirectStateApply">[1],
  ) => void;
  updateBurg: (
    id: HandlerParameters<"onDirectBurgApply">[0],
    next: HandlerParameters<"onDirectBurgApply">[1],
  ) => void;
  updateCulture: (
    id: HandlerParameters<"onDirectCultureApply">[0],
    next: HandlerParameters<"onDirectCultureApply">[1],
  ) => void;
  updateReligion: (
    id: HandlerParameters<"onDirectReligionApply">[0],
    next: HandlerParameters<"onDirectReligionApply">[1],
  ) => void;
  updateProvince: (
    id: HandlerParameters<"onDirectProvinceApply">[0],
    next: HandlerParameters<"onDirectProvinceApply">[1],
  ) => void;
  updateRoute: (
    id: HandlerParameters<"onDirectRouteApply">[0],
    next: HandlerParameters<"onDirectRouteApply">[1],
  ) => void;
  updateZone: (
    id: HandlerParameters<"onDirectZoneApply">[0],
    next: HandlerParameters<"onDirectZoneApply">[1],
  ) => void;
  updateBiome: (
    id: HandlerParameters<"onDirectBiomeApply">[0],
    next: HandlerParameters<"onDirectBiomeApply">[1],
  ) => void;
  updateDiplomacy: (
    subjectId: HandlerParameters<"onDirectDiplomacyApply">[0],
    objectId: HandlerParameters<"onDirectDiplomacyApply">[1],
    next: HandlerParameters<"onDirectDiplomacyApply">[2],
  ) => void;
};

export type DirectEditorDocumentAdapter = {
  syncDocument: (state: StudioState) => void;
};

export type DirectEditorFocusAdapter = {
  resolveFocusGeometry: (focus: EngineFocusTarget) => EngineFocusGeometry;
};

export type DirectEditorMutationAdapter = {
  updateState: DirectEditorActionTargets["updateState"];
  updateBurg: DirectEditorActionTargets["updateBurg"];
  updateCulture: DirectEditorActionTargets["updateCulture"];
  updateReligion: DirectEditorActionTargets["updateReligion"];
  updateProvince: DirectEditorActionTargets["updateProvince"];
  updateRoute: DirectEditorActionTargets["updateRoute"];
  updateZone: DirectEditorActionTargets["updateZone"];
  updateBiome: DirectEditorActionTargets["updateBiome"];
  updateDiplomacy: DirectEditorActionTargets["updateDiplomacy"];
};

export function createGlobalDirectEditorDocumentAdapter(): DirectEditorDocumentAdapter {
  return {
    syncDocument: syncDocumentState,
  };
}

export function createGlobalDirectEditorFocusAdapter(): DirectEditorFocusAdapter {
  return {
    resolveFocusGeometry: resolveEngineFocusGeometry,
  };
}

export function createGlobalDirectEditorMutationAdapter(): DirectEditorMutationAdapter {
  return {
    updateState: updateEngineStateName,
    updateBurg: updateEngineBurg,
    updateCulture: updateEngineCulture,
    updateReligion: updateEngineReligion,
    updateProvince: updateEngineProvince,
    updateRoute: updateEngineRoute,
    updateZone: updateEngineZone,
    updateBiome: updateEngineBiomeResource,
    updateDiplomacy: updateEngineDiplomacy,
  };
}

export function createDirectEditorActionTargets(
  documentAdapter: DirectEditorDocumentAdapter,
  focusAdapter: DirectEditorFocusAdapter,
  mutationAdapter: DirectEditorMutationAdapter,
): DirectEditorActionTargets {
  return {
    syncDocument: documentAdapter.syncDocument,
    resolveFocusGeometry: focusAdapter.resolveFocusGeometry,
    updateState: mutationAdapter.updateState,
    updateBurg: mutationAdapter.updateBurg,
    updateCulture: mutationAdapter.updateCulture,
    updateReligion: mutationAdapter.updateReligion,
    updateProvince: mutationAdapter.updateProvince,
    updateRoute: mutationAdapter.updateRoute,
    updateZone: mutationAdapter.updateZone,
    updateBiome: mutationAdapter.updateBiome,
    updateDiplomacy: mutationAdapter.updateDiplomacy,
  };
}

export function createGlobalDirectEditorActionTargets(): DirectEditorActionTargets {
  return createDirectEditorActionTargets(
    createGlobalDirectEditorDocumentAdapter(),
    createGlobalDirectEditorFocusAdapter(),
    createGlobalDirectEditorMutationAdapter(),
  );
}

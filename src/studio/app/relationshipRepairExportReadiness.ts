import {
  getEngineEntitySummary,
  getEngineWorldResourceSummary,
} from "../bridge/engineActions";
import {
  createRelationshipRepairHealthFromSummaries,
  type RelationshipRepairDeliveryStatus,
  type RelationshipRepairExportGate,
} from "../layout/directRelationshipRepairHealth";
import type { StudioState } from "../types";

export type RelationshipRepairExportReadyOptions = {
  deliveryStatus: RelationshipRepairDeliveryStatus;
  exportReady: boolean;
};

export function createRelationshipRepairExportReadyOptions(
  exportGate: RelationshipRepairExportGate,
): RelationshipRepairExportReadyOptions {
  const exportReady = exportGate === "ready";
  return {
    deliveryStatus: exportReady ? "ready" : "needs-repair",
    exportReady,
  };
}

export function getRelationshipRepairExportReadyOptions(
  state: StudioState,
): RelationshipRepairExportReadyOptions {
  return createRelationshipRepairExportReadyOptions(
    createRelationshipRepairHealthFromSummaries({
      directEditor: state.directEditor,
      entitySummary: getEngineEntitySummary(),
      language: state.language,
      worldResources: getEngineWorldResourceSummary(),
    }).exportGate,
  );
}

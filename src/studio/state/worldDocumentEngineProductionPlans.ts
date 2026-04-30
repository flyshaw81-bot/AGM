import { createProductionPluginBoundary } from "./worldDocumentEngineProductionBoundary";
import { createGodotProductionImporterPackagingPlan } from "./worldDocumentGodotProductionPlan";
import { createUnityProductionImporterPackagingPlan } from "./worldDocumentUnityProductionPlan";
import { createUnrealProductionImporterPackagingPlan } from "./worldDocumentUnrealProductionPlan";

export function createEngineProductionPlans(
  unityImporterArtifactPaths: string[],
) {
  return {
    productionPluginBoundary: createProductionPluginBoundary(),
    godotProductionImporterPackagingPlan:
      createGodotProductionImporterPackagingPlan(),
    unrealProductionImporterPackagingPlan:
      createUnrealProductionImporterPackagingPlan(),
    unityProductionImporterPackagingPlan:
      createUnityProductionImporterPackagingPlan(unityImporterArtifactPaths),
  };
}

export type EngineProductionPlans = ReturnType<
  typeof createEngineProductionPlans
>;

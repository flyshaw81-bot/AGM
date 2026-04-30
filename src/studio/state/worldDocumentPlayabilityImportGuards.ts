import { GAME_WORLD_PROFILE_LABELS } from "./worldDocumentConstants";

function isNumberList(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

function isSpawnCandidateHint(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.score !== "number" ||
    !Number.isFinite(item.score)
  )
    return false;
  if (
    !Array.isArray(item.reasons) ||
    !item.reasons.every((reason) => typeof reason === "string")
  )
    return false;
  return [item.state, item.province, item.burg, item.biome].every(
    (field) =>
      field === undefined ||
      (typeof field === "number" && Number.isFinite(field)),
  );
}

function isBalanceHint(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.message !== "string")
    return false;
  if (
    item.category !== "spawn" &&
    item.category !== "settlement" &&
    item.category !== "connectivity" &&
    item.category !== "habitability"
  )
    return false;
  if (item.severity !== "info" && item.severity !== "warning") return false;
  if (
    typeof item.profileWeight !== "number" ||
    !Number.isFinite(item.profileWeight)
  )
    return false;
  if (
    item.profilePriority !== undefined &&
    typeof item.profilePriority !== "string"
  )
    return false;
  if (item.refs === undefined) return true;
  if (!item.refs || typeof item.refs !== "object" || Array.isArray(item.refs))
    return false;
  return Object.values(item.refs).every(isNumberList);
}

function isAutoFixPreviewDiff(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const diff = value as Record<string, unknown>;
  if (
    diff.mode !== "dry-run" ||
    typeof diff.title !== "string" ||
    !Array.isArray(diff.changes)
  )
    return false;
  return diff.changes.every((change) => {
    if (!change || typeof change !== "object" || Array.isArray(change))
      return false;
    const item = change as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.summary !== "string")
      return false;
    if (
      item.operation !== "create" &&
      item.operation !== "update" &&
      item.operation !== "link"
    )
      return false;
    if (
      item.entity !== "state" &&
      item.entity !== "province" &&
      item.entity !== "burg" &&
      item.entity !== "route" &&
      item.entity !== "biome"
    )
      return false;
    if (
      !item.refs ||
      typeof item.refs !== "object" ||
      Array.isArray(item.refs) ||
      !Object.values(item.refs).every(isNumberList)
    )
      return false;
    if (item.fields === undefined) return true;
    if (
      !item.fields ||
      typeof item.fields !== "object" ||
      Array.isArray(item.fields)
    )
      return false;
    return Object.values(item.fields).every(
      (field) =>
        field === null ||
        typeof field === "string" ||
        typeof field === "number" ||
        typeof field === "boolean",
    );
  });
}

function isAutoFixDraft(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.hintId !== "string" ||
    typeof item.action !== "string" ||
    typeof item.summary !== "string"
  )
    return false;
  if (
    item.category !== "spawn" &&
    item.category !== "settlement" &&
    item.category !== "connectivity" &&
    item.category !== "habitability"
  )
    return false;
  if (item.status !== "draft") return false;
  if (
    typeof item.profileWeight !== "number" ||
    !Number.isFinite(item.profileWeight)
  )
    return false;
  if (
    item.profilePriority !== undefined &&
    typeof item.profilePriority !== "string"
  )
    return false;
  if (
    !item.targetRefs ||
    typeof item.targetRefs !== "object" ||
    Array.isArray(item.targetRefs)
  )
    return false;
  if (!Object.values(item.targetRefs).every(isNumberList)) return false;
  if (item.previewDiff !== undefined && !isAutoFixPreviewDiff(item.previewDiff))
    return false;
  return (
    Array.isArray(item.steps) &&
    item.steps.every((step) => typeof step === "string") &&
    Array.isArray(item.risks) &&
    item.risks.every((risk) => typeof risk === "string")
  );
}

function isAppliedAutoFixPreviewChange(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (
    typeof item.draftId !== "string" ||
    typeof item.appliedAt !== "number" ||
    !Number.isFinite(item.appliedAt)
  )
    return false;
  return isAutoFixPreviewDiff({
    mode: "dry-run",
    title: "applied",
    changes: [item],
  });
}

function isGeneratorProfileSuggestion(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.priorityId !== "string" ||
    typeof item.recommendation !== "string"
  )
    return false;
  if (
    typeof item.profile !== "string" ||
    !(item.profile in GAME_WORLD_PROFILE_LABELS)
  )
    return false;
  if (
    item.target !== "spawn" &&
    item.target !== "settlement" &&
    item.target !== "connectivity" &&
    item.target !== "habitability" &&
    item.target !== "resource"
  )
    return false;
  if (typeof item.weight !== "number" || !Number.isFinite(item.weight))
    return false;
  const parameterDraft = item.parameterDraft;
  if (
    !parameterDraft ||
    typeof parameterDraft !== "object" ||
    Array.isArray(parameterDraft)
  )
    return false;
  const parameterRecord = parameterDraft as Record<string, unknown>;
  if (
    typeof parameterRecord.key !== "string" ||
    typeof parameterRecord.label !== "string" ||
    typeof parameterRecord.source !== "string"
  )
    return false;
  if (
    typeof parameterRecord.value !== "number" ||
    !Number.isFinite(parameterRecord.value)
  )
    return false;
  if (
    parameterRecord.unit !== "profile-weight" &&
    parameterRecord.unit !== "score" &&
    parameterRecord.unit !== "count" &&
    parameterRecord.unit !== "percent"
  )
    return false;
  if (!item.refs || typeof item.refs !== "object" || Array.isArray(item.refs))
    return false;
  return Object.values(item.refs).every(isNumberList);
}

function isGenerationProfileImpact(value: unknown) {
  if (value === null) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const impact = value as Record<string, unknown>;
  if (
    typeof impact.profile !== "string" ||
    !(impact.profile in GAME_WORLD_PROFILE_LABELS)
  )
    return false;
  if (
    typeof impact.appliedAt !== "number" ||
    !Number.isFinite(impact.appliedAt)
  )
    return false;
  if (!Array.isArray(impact.changes) || !Array.isArray(impact.resultMetrics))
    return false;
  const changesValid = impact.changes.every((change) => {
    if (!change || typeof change !== "object" || Array.isArray(change))
      return false;
    const item = change as Record<string, unknown>;
    return (
      (item.key === "spawnFairnessWeight" ||
        item.key === "settlementDensityTarget" ||
        item.key === "routeConnectivityScore" ||
        item.key === "biomeFrictionWeight" ||
        item.key === "resourceCoverageTarget") &&
      (item.target === "states" ||
        item.target === "burgs" ||
        item.target === "growthRate" ||
        item.target === "sizeVariety" ||
        item.target === "provincesRatio") &&
      (item.before === null ||
        (typeof item.before === "number" && Number.isFinite(item.before))) &&
      typeof item.after === "number" &&
      Number.isFinite(item.after)
    );
  });
  const resultMetricsValid = impact.resultMetrics.every((metric) => {
    if (!metric || typeof metric !== "object" || Array.isArray(metric))
      return false;
    const item = metric as Record<string, unknown>;
    return (
      (item.key === "spawnCandidates" ||
        item.key === "averageSpawnScore" ||
        item.key === "states" ||
        item.key === "burgs" ||
        item.key === "provinces" ||
        item.key === "routes" ||
        item.key === "routePointCount" ||
        item.key === "resourceTaggedBiomes") &&
      typeof item.before === "number" &&
      Number.isFinite(item.before) &&
      typeof item.after === "number" &&
      Number.isFinite(item.after) &&
      typeof item.delta === "number" &&
      Number.isFinite(item.delta)
    );
  });
  return changesValid && resultMetricsValid;
}

export function isWorldPlayabilityHints(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const hints = value as Record<string, unknown>;
  return (
    Array.isArray(hints.spawnCandidates) &&
    hints.spawnCandidates.every(isSpawnCandidateHint) &&
    Array.isArray(hints.balanceHints) &&
    hints.balanceHints.every(isBalanceHint) &&
    Array.isArray(hints.autoFixDrafts) &&
    hints.autoFixDrafts.every(isAutoFixDraft) &&
    Array.isArray(hints.appliedPreviewChanges) &&
    hints.appliedPreviewChanges.every(isAppliedAutoFixPreviewChange) &&
    Array.isArray(hints.generatorProfileSuggestions) &&
    hints.generatorProfileSuggestions.every(isGeneratorProfileSuggestion) &&
    isGenerationProfileImpact(hints.generationProfileImpact)
  );
}

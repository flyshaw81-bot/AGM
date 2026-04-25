import {getPresetById} from "../canvas/presets";
import {syncLegacyViewport, getLegacyDocumentState, markLegacyDocumentClean, setLegacyDocumentName} from "../bridge/legacyMapHost";
import {getLegacyStylePreset, applyLegacyStylePreset, getLegacyStyleSettings, setLegacyStyleToggle} from "../bridge/legacyStyle";
import {exportWithLegacy, setLegacyExportSetting} from "../bridge/legacyExport";
import {toggleLegacyLayer, getLegacyLayerStates, runLegacyDataAction, openLegacyEditor, runLegacyTopbarAction, syncLegacyEditorState, closeLegacyEditor, syncLegacyProjectSummary, getLegacyProjectSummary, setLegacyAutosaveInterval, setLegacyLayersPreset, runLegacyLayersPresetAction, runLegacyProjectAction, setLegacyPendingSeed, setLegacyPendingPoints, setLegacyPendingCultures, setLegacyPendingBurgs, setLegacyPendingReligions, setLegacyPendingStates, setLegacyPendingProvincesRatio, setLegacyPendingGrowthRate, setLegacyTemperatureEquator, setLegacyTemperatureNorthPole, setLegacyTemperatureSouthPole, setLegacyMapSize, setLegacyLatitude, setLegacyLongitude, setLegacyWindTier0, setLegacyWindTier1, setLegacyWindTier2, setLegacyWindTier3, setLegacyWindTier4, setLegacyWindTier5, setLegacyPrecipitation, setLegacyPendingSizeVariety, setLegacyStateLabelsMode, setLegacyCultureSet, setLegacyPendingTemplate, setLegacyPendingCanvasSize, resolveLegacyFocusGeometry, applyLegacySettlementPreviewChanges, applyLegacyRoutePreviewChanges, applyLegacyBiomePreviewChanges, applyLegacyStatePreviewChanges, undoLegacyAutoFixWriteback} from "../bridge/legacyActions";
import type {LegacyAutoFixPreviewChange} from "../bridge/legacyActions";
import {renderStudioShell, bindStudioShellEvents} from "../layout/shell";
import {exportAgmDocumentDraft, exportAgmRulesPackDraft, exportBiomeMapDraft, exportEngineManifestDraft, exportGeoJsonMapLayersDraft, exportHeightfieldDraft, exportHeightmapMetadataDraft, exportHeightmapPngDraft, exportProvinceMapDraft, exportResourceMapDraft, exportTiledMapDraft, exportWorldPackageDraft, importAgmDocumentDraft, importAgmRulesPackDraft, loadAgmDocumentDraft, saveAgmDocumentDraft, createWorldDocumentDraft} from "../state/worldDocumentDraft";
import type {WorldDocumentDraft} from "../state/worldDocumentDraft";
import type {FitMode, GameWorldProfile, GenerationProfileImpactChange, GenerationProfileImpactState, GenerationProfileOverrideKey, Orientation, StudioState} from "../types";
import {injectStudioStyles} from "./styles";

function createInitialState(): StudioState {
  const documentState = getLegacyDocumentState();
  const initialPreset = getPresetById("desktop-landscape");

  return {
    section: "canvas",
    document: {...documentState, stylePreset: getLegacyStylePreset(), gameProfile: "rpg", designIntent: ""},
    viewport: {
      presetId: initialPreset.id,
      width: initialPreset.width,
      height: initialPreset.height,
      orientation: initialPreset.orientation,
      fitMode: "contain",
      zoom: 1,
      panX: 0,
      panY: 0,
      safeAreaEnabled: true,
      guidesEnabled: false,
    },
    export: {
      format: "png",
    },
    editor: {
      activeEditor: null,
      editorDialogOpen: false,
      lastEditorSection: null,
    },
    balanceFocus: null,
    autoFixPreview: {
      appliedDraftIds: [],
      discardedDraftIds: [],
      undoStack: [],
      redoStack: [],
    },
    generationProfileOverrides: {
      profile: "rpg",
      values: {},
    },
    generationProfileImpact: null,
  };
}

function syncEditorWorkflowState(state: StudioState) {
  const previousActiveEditor = state.editor.activeEditor;
  const previousDialogOpen = state.editor.editorDialogOpen;
  const nextEditorState = syncLegacyEditorState();
  const changed =
    previousActiveEditor !== nextEditorState.activeEditor ||
    previousDialogOpen !== nextEditorState.editorDialogOpen;
  const shouldEnterEditorsWorkflow =
    Boolean(nextEditorState.activeEditor) &&
    state.section !== "editors" &&
    (previousActiveEditor !== nextEditorState.activeEditor || !previousDialogOpen);
  const shouldReturnToOrigin =
    !nextEditorState.activeEditor &&
    previousDialogOpen &&
    state.section === "editors" &&
    Boolean(state.editor.lastEditorSection) &&
    state.editor.lastEditorSection !== "editors";

  state.editor.activeEditor = nextEditorState.activeEditor;
  state.editor.editorDialogOpen = nextEditorState.editorDialogOpen;

  if (shouldEnterEditorsWorkflow) {
    state.editor.lastEditorSection = state.section;
    state.section = "editors";
  }

  if (shouldReturnToOrigin) {
    state.section = state.editor.lastEditorSection!;
  }

  if (!nextEditorState.activeEditor && state.section === "editors") {
    state.editor.lastEditorSection = state.editor.lastEditorSection ?? "editors";
  }

  return changed;
}

function syncDocumentState(state: StudioState) {
  const legacyDocument = getLegacyDocumentState();
  const nextDocument = {
    ...state.document,
    ...legacyDocument,
    name: state.document.source === "agm" ? state.document.name : legacyDocument.name,
    source: state.document.source,
    stylePreset: getLegacyStylePreset(),
  };
  const changed =
    state.document.name !== nextDocument.name ||
    state.document.documentWidth !== nextDocument.documentWidth ||
    state.document.documentHeight !== nextDocument.documentHeight ||
    state.document.seed !== nextDocument.seed ||
    state.document.stylePreset !== nextDocument.stylePreset ||
    state.document.dirty !== nextDocument.dirty ||
    state.document.source !== nextDocument.source ||
    state.document.gameProfile !== nextDocument.gameProfile ||
    state.document.designIntent !== nextDocument.designIntent;

  state.document = nextDocument;
  return changed;
}

function syncAgmLayerState(draftLayers: WorldDocumentDraft["layers"]) {
  if (draftLayers.preset) setLegacyLayersPreset(draftLayers.preset);
  const currentLayers = getLegacyLayerStates();
  Object.entries(draftLayers.visible).forEach(([action, enabled]) => {
    if (currentLayers[action as keyof typeof currentLayers] !== enabled) toggleLegacyLayer(action as keyof typeof currentLayers);
  });
}

function restoreAgmDocumentState(state: StudioState, draft: {document: Pick<StudioState["document"], "name" | "gameProfile" | "designIntent">; world?: Partial<Pick<WorldDocumentDraft, "viewport" | "export" | "layers" | "generation">>}) {
  state.document.name = setLegacyDocumentName(draft.document.name);
  state.document.gameProfile = draft.document.gameProfile;
  state.document.designIntent = draft.document.designIntent;
  state.document.source = "agm";
  if (draft.world?.viewport) {
    state.viewport = {...state.viewport, ...draft.world.viewport};
    updateViewportDimensions(state);
  }
  if (draft.world?.export) {
    state.export = {...state.export, ...draft.world.export};
  }
  if (draft.world?.generation?.profileOverrides) {
    state.generationProfileOverrides = {
      profile: draft.world.generation.profileOverrides.profile,
      values: {...draft.world.generation.profileOverrides.values},
    };
  } else {
    state.generationProfileOverrides = {profile: draft.document.gameProfile, values: {}};
  }
  if (draft.world?.layers) syncAgmLayerState(draft.world.layers);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getExplicitGenerationProfileOverrides(state: StudioState) {
  return state.generationProfileOverrides.profile === state.document.gameProfile ? state.generationProfileOverrides.values : {};
}

function getActiveGenerationProfileOverrides(state: StudioState) {
  const projectSummary = getLegacyProjectSummary();
  const worldDraft = createWorldDocumentDraft(state, projectSummary);
  const profileDefaults: Partial<Record<GenerationProfileOverrideKey, number>> = {};

  worldDraft.playability.generatorProfileSuggestions.forEach(suggestion => {
    if (suggestion.profile !== state.document.gameProfile) return;
    profileDefaults[suggestion.parameterDraft.key] = suggestion.parameterDraft.value;
  });

  return {
    ...profileDefaults,
    ...getExplicitGenerationProfileOverrides(state),
  };
}

function numberFromSummary(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function recordGenerationProfileImpactChange(changes: GenerationProfileImpactChange[], change: GenerationProfileImpactChange) {
  if (change.before === change.after) return;
  changes.push(change);
}

function createGenerationProfileResultSample(state: StudioState) {
  const projectSummary = getLegacyProjectSummary();
  const worldDraft = createWorldDocumentDraft(state, projectSummary);
  const routePointCount = worldDraft.resources.routes.reduce((total, route) => total + (route.pointCount || 0), 0);
  const averageSpawnScore = worldDraft.playability.spawnCandidates.length
    ? Math.round(worldDraft.playability.spawnCandidates.reduce((total, candidate) => total + candidate.score, 0) / worldDraft.playability.spawnCandidates.length)
    : 0;

  return {
    spawnCandidates: worldDraft.playability.spawnCandidates.length,
    averageSpawnScore,
    states: worldDraft.entities.states.length,
    burgs: worldDraft.entities.burgs.length,
    provinces: worldDraft.resources.provinces.length,
    routes: worldDraft.resources.routes.length,
    routePointCount,
    resourceTaggedBiomes: worldDraft.resources.biomes.filter(biome => biome.agmResourceTag !== undefined).length,
  };
}

function createGenerationProfileResultMetrics(before: ReturnType<typeof createGenerationProfileResultSample>, after: ReturnType<typeof createGenerationProfileResultSample>): GenerationProfileImpactState["resultMetrics"] {
  return (Object.keys(before) as (keyof typeof before)[]).map(key => ({
    key,
    before: before[key],
    after: after[key],
    delta: after[key] - before[key],
  }));
}

function applyGenerationProfileOverridesToLegacySettings(state: StudioState) {
  const overrides = getActiveGenerationProfileOverrides(state);
  const projectSummary = getLegacyProjectSummary();
  const changes: GenerationProfileImpactChange[] = [];

  if (typeof overrides.spawnFairnessWeight === "number") {
    const after = Math.round(clamp(overrides.spawnFairnessWeight, 0, 10) * 10);
    recordGenerationProfileImpactChange(changes, {key: "spawnFairnessWeight", target: "states", before: numberFromSummary(projectSummary.pendingStates), after});
    setLegacyPendingStates(after);
  }
  if (typeof overrides.settlementDensityTarget === "number") {
    const states = Number(projectSummary.pendingStates) || 1;
    const after = Math.round(clamp(overrides.settlementDensityTarget, 1, 1000) * states);
    recordGenerationProfileImpactChange(changes, {key: "settlementDensityTarget", target: "burgs", before: numberFromSummary(projectSummary.pendingBurgs), after});
    setLegacyPendingBurgs(after);
  }
  if (typeof overrides.routeConnectivityScore === "number") {
    const after = clamp(overrides.routeConnectivityScore / 50, 0.1, 2);
    recordGenerationProfileImpactChange(changes, {key: "routeConnectivityScore", target: "growthRate", before: numberFromSummary(projectSummary.pendingGrowthRate), after});
    setLegacyPendingGrowthRate(after);
  }
  if (typeof overrides.biomeFrictionWeight === "number") {
    const after = clamp(overrides.biomeFrictionWeight * 5, 0, 10);
    recordGenerationProfileImpactChange(changes, {key: "biomeFrictionWeight", target: "sizeVariety", before: numberFromSummary(projectSummary.pendingSizeVariety), after});
    setLegacyPendingSizeVariety(after);
  }
  if (typeof overrides.resourceCoverageTarget === "number") {
    const after = clamp(overrides.resourceCoverageTarget, 0, 100);
    recordGenerationProfileImpactChange(changes, {key: "resourceCoverageTarget", target: "provincesRatio", before: numberFromSummary(projectSummary.pendingProvincesRatio), after});
    setLegacyPendingProvincesRatio(after);
  }

  state.generationProfileImpact = changes.length ? {profile: state.document.gameProfile, appliedAt: Date.now(), changes, resultMetrics: []} : null;
}

async function syncProjectSummaryState() {
  return syncLegacyProjectSummary();
}

function watchEditorWorkflow(root: HTMLElement, state: StudioState) {
  const syncAndRender = async () => {
    const editorChanged = syncEditorWorkflowState(state);
    const projectSummaryChanged = await syncProjectSummaryState();
    const documentChanged = syncDocumentState(state);
    if (editorChanged || projectSummaryChanged || documentChanged) {
      render(root, state);
    }
  };

  window.setInterval(() => {
    void syncAndRender();
  }, 500);
  window.addEventListener("focus", () => {
    void syncAndRender();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void syncAndRender();
  });
}

function ensureStudioRoot() {
  let root = document.getElementById("studioRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "studioRoot";
    document.body.appendChild(root);
  }
  return root;
}

function ensureLegacyDialogsContainer() {
  let dialogs = document.getElementById("dialogs");
  if (!dialogs) {
    dialogs = document.createElement("div");
    dialogs.id = "dialogs";
    document.body.appendChild(dialogs);
  }
  return dialogs;
}

function preserveLegacyNode(root: HTMLElement, elementId: string) {
  const element = document.getElementById(elementId);
  if (element && root.contains(element)) {
    document.body.appendChild(element);
  }
}

function relocateLegacyMapHost() {
  const host = document.getElementById("studioLegacyMapHost");
  const map = document.getElementById("map");
  ensureLegacyDialogsContainer();
  if (host && map && !host.contains(map)) host.appendChild(map);
}

function syncLegacyDialogsPosition() {
  const stage = document.getElementById("studioStageViewport");
  if (!stage) return;

  const bounds = stage.getBoundingClientRect();
  const padding = 8;
  const dialogs = document.querySelectorAll<HTMLElement>("#dialogs > .ui-dialog");

  dialogs.forEach(dialog => {
    const rect = dialog.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const minLeft = bounds.left + padding;
    const maxLeft = Math.max(bounds.right - width - padding, minLeft);
    const minTop = bounds.top + padding;
    const maxTop = Math.max(bounds.bottom - height - padding, minTop);

    let nextLeft = Number.parseFloat(dialog.style.left || `${rect.left}`);
    let nextTop = Number.parseFloat(dialog.style.top || `${rect.top}`);

    if (rect.left < minLeft || rect.right > bounds.right - padding) {
      nextLeft = Math.min(Math.max(nextLeft, minLeft), maxLeft);
    }

    if (rect.top < minTop || rect.bottom > bounds.bottom - padding) {
      nextTop = Math.min(Math.max(nextTop, minTop), maxTop);
    }

    dialog.style.left = `${nextLeft}px`;
    dialog.style.top = `${nextTop}px`;
  });
}

function syncOverlays(state: StudioState) {
  const frame = document.getElementById("studioCanvasFrame");
  const safeArea = frame?.querySelector<HTMLElement>(".studio-canvas-frame__overlay--safe-area");
  const guides = frame?.querySelector<HTMLElement>(".studio-canvas-frame__overlay--guides");
  if (safeArea) safeArea.style.display = state.viewport.safeAreaEnabled ? "block" : "none";
  if (guides) guides.style.display = state.viewport.guidesEnabled ? "block" : "none";
}

function updateViewportDimensions(state: StudioState) {
  const preset = getPresetById(state.viewport.presetId);
  const width = state.viewport.orientation === preset.orientation ? preset.width : preset.height;
  const height = state.viewport.orientation === preset.orientation ? preset.height : preset.width;
  state.viewport.width = width;
  state.viewport.height = height;
}

function setAutoFixPreviewMembership(values: string[], draftId: string, included: boolean) {
  const nextValues = values.filter(value => value !== draftId);
  if (included) nextValues.push(draftId);
  return nextValues;
}

function createLegacyAutoFixWriteback(state: StudioState, draftId: string) {
  const projectSummary = getLegacyProjectSummary();
  const worldDraft = createWorldDocumentDraft(state, projectSummary);
  const draft = worldDraft.playability.autoFixDrafts.find(item => item.id === draftId);
  if (!draft?.previewDiff) return undefined;
  if (draft.category === "spawn") return applyLegacyStatePreviewChanges(draft.previewDiff.changes);
  if (draft.category === "settlement") return applyLegacySettlementPreviewChanges(draft.previewDiff.changes);
  if (draft.category === "connectivity") return applyLegacyRoutePreviewChanges(draft.previewDiff.changes);
  if (draft.category === "habitability") return applyLegacyBiomePreviewChanges(draft.previewDiff.changes);
  return undefined;
}

function applyAutoFixPreviewAction(state: StudioState, draftId: string, action: "apply" | "discard", changeCount: number) {
  const legacyWriteback = action === "apply" ? createLegacyAutoFixWriteback(state, draftId) : undefined;
  state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.appliedDraftIds, draftId, action === "apply");
  state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.discardedDraftIds, draftId, action === "discard");
  state.autoFixPreview.undoStack = [...state.autoFixPreview.undoStack, {draftId, action, changeCount, legacyWriteback}];
  state.autoFixPreview.redoStack = [];
  state.document.source = "agm";
}

function createManualBiomeRuleChange(state: StudioState, biomeId: number, ruleWeight: number, resourceTag: string): LegacyAutoFixPreviewChange | undefined {
  const projectSummary = getLegacyProjectSummary();
  const worldDraft = createWorldDocumentDraft(state, projectSummary);
  const biome = worldDraft.resources.biomes.find(item => item.id === biomeId);
  if (!biome || !Number.isFinite(ruleWeight)) return undefined;
  const currentHabitability = typeof biome.habitability === "number" ? biome.habitability : 50;
  return {
    id: `manual-biome-rule-${biomeId}`,
    operation: "update",
    entity: "biome",
    summary: `Adjust ${biome.name} AGM rule metadata from Studio controls.`,
    refs: {biomes: [biomeId]},
    fields: {
      habitability: currentHabitability,
      previousHabitability: currentHabitability,
      agmRuleWeight: Number(ruleWeight.toFixed(2)),
      agmResourceTag: resourceTag,
      tuningReason: "manual-biome-rule-adjustment",
    },
  };
}

function applyManualBiomeRuleAdjustment(state: StudioState, biomeId: number, ruleWeight: number, resourceTag: string) {
  const change = createManualBiomeRuleChange(state, biomeId, ruleWeight, resourceTag);
  if (!change) return;
  const legacyWriteback = applyLegacyBiomePreviewChanges([change]);
  const draftId = `manual-biome-rule-${biomeId}`;
  state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.appliedDraftIds, draftId, true);
  state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.discardedDraftIds, draftId, false);
  state.autoFixPreview.undoStack = [...state.autoFixPreview.undoStack, {draftId, action: "apply", changeCount: 1, legacyWriteback}];
  state.autoFixPreview.redoStack = [];
  state.document.source = "agm";
}

function applyRulesPackDraft(state: StudioState, rules: WorldDocumentDraft["rules"]) {
  const changes = rules.biomeRules
    .map(rule => createManualBiomeRuleChange(state, rule.biomeId, rule.ruleWeight, rule.resourceTag))
    .filter((change): change is LegacyAutoFixPreviewChange => Boolean(change));
  if (!changes.length) return;
  const legacyWriteback = applyLegacyBiomePreviewChanges(changes);
  const draftId = `import-rules-pack-v${rules.version}`;
  state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.appliedDraftIds, draftId, true);
  state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.discardedDraftIds, draftId, false);
  state.autoFixPreview.undoStack = [...state.autoFixPreview.undoStack, {draftId, action: "apply", changeCount: changes.length, legacyWriteback, rulesPackImportVersion: rules.version}];
  state.autoFixPreview.redoStack = [];
  state.document.source = "agm";
}

function undoAutoFixPreviewAction(state: StudioState) {
  const entry = state.autoFixPreview.undoStack.at(-1);
  if (!entry) return;
  state.autoFixPreview.undoStack = state.autoFixPreview.undoStack.slice(0, -1);
  state.autoFixPreview.redoStack = [...state.autoFixPreview.redoStack, entry];
  if (entry.action === "apply") {
    undoLegacyAutoFixWriteback(entry.legacyWriteback);
    state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.appliedDraftIds, entry.draftId, false);
  } else {
    state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.discardedDraftIds, entry.draftId, false);
  }
  state.document.source = "agm";
}

function createManualBiomeRuleWriteback(state: StudioState, draftId: string, legacyWriteback?: ReturnType<typeof applyLegacyBiomePreviewChanges>) {
  const match = /^manual-biome-rule-(\d+)$/u.exec(draftId);
  if (!match) return undefined;
  const biomeId = Number(match[1]);
  const stored = legacyWriteback?.updatedBiomes.at(-1);
  if (!Number.isFinite(biomeId) || !stored) return undefined;
  const change = createManualBiomeRuleChange(state, biomeId, stored.nextAgmRuleWeight, stored.nextAgmResourceTag);
  return change ? applyLegacyBiomePreviewChanges([change]) : undefined;
}

function redoAutoFixPreviewAction(state: StudioState) {
  const entry = state.autoFixPreview.redoStack.at(-1);
  if (!entry) return;
  state.autoFixPreview.redoStack = state.autoFixPreview.redoStack.slice(0, -1);
  if (entry.action === "apply") {
    const legacyWriteback = createManualBiomeRuleWriteback(state, entry.draftId, entry.legacyWriteback) || createLegacyAutoFixWriteback(state, entry.draftId) || entry.legacyWriteback;
    const nextEntry = {...entry, legacyWriteback};
    state.autoFixPreview.undoStack = [...state.autoFixPreview.undoStack, nextEntry];
    state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.appliedDraftIds, entry.draftId, true);
    state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.discardedDraftIds, entry.draftId, false);
  } else {
    state.autoFixPreview.undoStack = [...state.autoFixPreview.undoStack, entry];
    state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.discardedDraftIds, entry.draftId, true);
    state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(state.autoFixPreview.appliedDraftIds, entry.draftId, false);
  }
  state.document.source = "agm";
}

function render(root: HTMLElement, state: StudioState) {
  syncEditorWorkflowState(state);
  syncDocumentState(state);
  preserveLegacyNode(root, "map");
  preserveLegacyNode(root, "dialogs");
  root.innerHTML = renderStudioShell(state);
  relocateLegacyMapHost();
  syncOverlays(state);
  syncLegacyViewport(state.viewport.presetId, state.viewport.orientation, state.viewport.fitMode);
  syncLegacyDialogsPosition();
  bindStudioShellEvents(
    state,
    section => {
      syncEditorWorkflowState(state);
      syncDocumentState(state);
      if (section === "editors" && state.section !== "editors") {
        state.editor.lastEditorSection = state.section;
      }
      state.section = section;
      render(root, state);
    },
    patch => {
      syncDocumentState(state);
      state.viewport = {...state.viewport, ...patch};
      updateViewportDimensions(state);
      render(root, state);
    },
    preset => {
      state.document.stylePreset = preset;
      applyLegacyStylePreset(preset);
      syncDocumentState(state);
      render(root, state);
    },
    format => {
      state.export.format = format;
      syncDocumentState(state);
      render(root, state);
    },
    action => {
      const nextEnabled = !getLegacyStyleSettings()[action === "hide-labels" ? "hideLabels" : "rescaleLabels"];
      setLegacyStyleToggle(action, nextEnabled);
      syncDocumentState(state);
      render(root, state);
    },
    (setting, value) => {
      setLegacyExportSetting(setting, value);
      syncDocumentState(state);
      render(root, state);
    },
    async action => {
      if (action === "export") {
        exportWithLegacy(state.export.format);
      } else {
        const generationProfileResultBefore = action === "new" ? createGenerationProfileResultSample(state) : null;
        if (action === "new") applyGenerationProfileOverridesToLegacySettings(state);
        await runLegacyTopbarAction(action);
        if (action === "new" && state.generationProfileImpact && generationProfileResultBefore) {
          const generationProfileResultAfter = createGenerationProfileResultSample(state);
          state.generationProfileImpact = {
            ...state.generationProfileImpact,
            resultMetrics: createGenerationProfileResultMetrics(generationProfileResultBefore, generationProfileResultAfter),
          };
        }
        if (action === "save") {
          markLegacyDocumentClean();
        } else if (action === "new" || action === "open") {
          state.document.source = "legacy";
        }
      }
      await syncProjectSummaryState();
      syncDocumentState(state);
      render(root, state);
    },
    async action => {
      toggleLegacyLayer(action);
      await syncProjectSummaryState();
      syncDocumentState(state);
      render(root, state);
    },
    async action => {
      await runLegacyDataAction(action);
      if (action === "save-storage" || action === "save-machine") {
        markLegacyDocumentClean();
      } else if (action === "quick-load" || action === "new-map" || action === "open-file" || action === "load-url" || action === "load-dropbox") {
        state.document.source = "legacy";
      }
      await syncProjectSummaryState();
      syncDocumentState(state);
      render(root, state);
    },
    async action => {
      if (action === "save-agm-draft") {
        await syncProjectSummaryState();
        saveAgmDocumentDraft(state, getLegacyProjectSummary());
      } else if (action === "export-agm-draft") {
        await syncProjectSummaryState();
        exportAgmDocumentDraft(state, getLegacyProjectSummary());
      } else if (action === "export-world-package") {
        await syncProjectSummaryState();
        exportWorldPackageDraft(state, getLegacyProjectSummary());
      } else if (action === "export-resource-map") {
        await syncProjectSummaryState();
        exportResourceMapDraft(state, getLegacyProjectSummary());
      } else if (action === "export-province-map") {
        await syncProjectSummaryState();
        exportProvinceMapDraft(state, getLegacyProjectSummary());
      } else if (action === "export-biome-map") {
        await syncProjectSummaryState();
        exportBiomeMapDraft(state, getLegacyProjectSummary());
      } else if (action === "export-tiled-map") {
        await syncProjectSummaryState();
        exportTiledMapDraft(state, getLegacyProjectSummary());
      } else if (action === "export-geojson-map-layers") {
        await syncProjectSummaryState();
        exportGeoJsonMapLayersDraft(state, getLegacyProjectSummary());
      } else if (action === "export-heightmap-metadata") {
        await syncProjectSummaryState();
        exportHeightmapMetadataDraft(state, getLegacyProjectSummary());
      } else if (action === "export-heightfield") {
        await syncProjectSummaryState();
        exportHeightfieldDraft(state, getLegacyProjectSummary());
      } else if (action === "export-heightmap-png") {
        await syncProjectSummaryState();
        await exportHeightmapPngDraft(state, getLegacyProjectSummary());
      } else if (action === "export-engine-manifest") {
        await syncProjectSummaryState();
        exportEngineManifestDraft(state, getLegacyProjectSummary());
      } else if (action === "export-rules-pack") {
        await syncProjectSummaryState();
        exportAgmRulesPackDraft(state, getLegacyProjectSummary());
      } else if (action === "restore-agm-draft") {
        const draft = loadAgmDocumentDraft();
        if (draft) restoreAgmDocumentState(state, draft);
      } else {
        runLegacyProjectAction(action);
        if (action === "restore-default-canvas-size") state.document.source = "legacy";
      }
      await syncProjectSummaryState();
      syncDocumentState(state);
      render(root, state);
    },
    async file => {
      const draft = await importAgmDocumentDraft(file);
      if (draft) restoreAgmDocumentState(state, draft);
      await syncProjectSummaryState();
      syncDocumentState(state);
      render(root, state);
    },
    async file => {
      const rules = await importAgmRulesPackDraft(file);
      if (rules) applyRulesPackDraft(state, rules);
      await syncProjectSummaryState();
      syncDocumentState(state);
      render(root, state);
    },
    async action => {
      state.editor.lastEditorSection = state.section === "editors" ? state.editor.lastEditorSection : state.section;
      state.section = "editors";
      await openLegacyEditor(action);
      syncDocumentState(state);
      syncEditorWorkflowState(state);
      render(root, state);
    },
    focus => {
      state.balanceFocus = resolveLegacyFocusGeometry(focus);
      state.section = "canvas";
      syncDocumentState(state);
      render(root, state);
    },
    (draftId, action, changeCount) => {
      if (!draftId) return;
      applyAutoFixPreviewAction(state, draftId, action, changeCount);
      syncDocumentState(state);
      render(root, state);
    },
    action => {
      if (action === "undo") {
        undoAutoFixPreviewAction(state);
      } else {
        redoAutoFixPreviewAction(state);
      }
      syncDocumentState(state);
      render(root, state);
    },
    (biomeId, ruleWeight, resourceTag) => {
      if (!Number.isFinite(biomeId)) return;
      applyManualBiomeRuleAdjustment(state, biomeId, ruleWeight, resourceTag);
      syncDocumentState(state);
      render(root, state);
    },
    (key, value) => {
      if (!Number.isFinite(value)) return;
      state.generationProfileOverrides = {
        profile: state.document.gameProfile,
        values: state.generationProfileOverrides.profile === state.document.gameProfile ? {...state.generationProfileOverrides.values, [key]: value} : {[key]: value},
      };
      state.document.source = "agm";
      syncDocumentState(state);
      render(root, state);
    },
    action => {
      closeLegacyEditor(action);
      syncDocumentState(state);
      syncEditorWorkflowState(state);
      render(root, state);
    },
    section => {
      state.section = section;
      syncDocumentState(state);
      render(root, state);
    },
    async (action, value) => {
      if (action === "layers-preset") {
        setLegacyLayersPreset(value);
      } else if (action === "document-name") {
        state.document.name = setLegacyDocumentName(value);
        state.document.source = "agm";
      } else if (action === "game-profile") {
        state.document.gameProfile = value as GameWorldProfile;
        state.generationProfileOverrides = {profile: state.document.gameProfile, values: {}};
        state.document.source = "agm";
      } else if (action === "design-intent") {
        state.document.designIntent = value.trim();
        state.document.source = "agm";
      } else if (action === "seed") {
        setLegacyPendingSeed(value);
      } else if (action === "points") {
        setLegacyPendingPoints(Number(value));
      } else if (action === "states") {
        setLegacyPendingStates(Number(value));
      } else if (action === "provinces-ratio") {
        setLegacyPendingProvincesRatio(Number(value));
      } else if (action === "growth-rate") {
        setLegacyPendingGrowthRate(Number(value));
      } else if (action === "temperature-equator") {
        setLegacyTemperatureEquator(Number(value));
      } else if (action === "temperature-north-pole") {
        setLegacyTemperatureNorthPole(Number(value));
      } else if (action === "temperature-south-pole") {
        setLegacyTemperatureSouthPole(Number(value));
      } else if (action === "map-size") {
        setLegacyMapSize(Number(value));
      } else if (action === "latitude") {
        setLegacyLatitude(Number(value));
      } else if (action === "longitude") {
        setLegacyLongitude(Number(value));
      } else if (action === "wind-tier-0") {
        setLegacyWindTier0(Number(value));
      } else if (action === "wind-tier-1") {
        setLegacyWindTier1(Number(value));
      } else if (action === "wind-tier-2") {
        setLegacyWindTier2(Number(value));
      } else if (action === "wind-tier-3") {
        setLegacyWindTier3(Number(value));
      } else if (action === "wind-tier-4") {
        setLegacyWindTier4(Number(value));
      } else if (action === "wind-tier-5") {
        setLegacyWindTier5(Number(value));
      } else if (action === "precipitation") {
        setLegacyPrecipitation(Number(value));
      } else if (action === "size-variety") {
        setLegacyPendingSizeVariety(Number(value));
      } else if (action === "cultures") {
        setLegacyPendingCultures(Number(value));
      } else if (action === "burgs") {
        setLegacyPendingBurgs(Number(value));
      } else if (action === "religions") {
        setLegacyPendingReligions(Number(value));
      } else if (action === "state-labels-mode") {
        setLegacyStateLabelsMode(value);
      } else if (action === "culture-set") {
        setLegacyCultureSet(value);
      } else if (action === "template") {
        setLegacyPendingTemplate(value);
      } else if (action === "width" || action === "height") {
        setLegacyPendingCanvasSize(action, Number(value));
      } else {
        setLegacyAutosaveInterval(Number(value));
      }
      await syncProjectSummaryState();
      syncDocumentState(state);
      render(root, state);
    },
    async action => {
      runLegacyLayersPresetAction(action);
      await syncProjectSummaryState();
      syncDocumentState(state);
      render(root, state);
    },
    async () => {
      exportWithLegacy(state.export.format);
      await syncProjectSummaryState();
      syncDocumentState(state);
      render(root, state);
    },
  );
}

async function bootstrapStudio() {
  injectStudioStyles();
  document.body.classList.add("studio-enabled");
  document.getElementById("loading")?.remove();
  const state = createInitialState();
  updateViewportDimensions(state);
  const root = ensureStudioRoot();
  await syncProjectSummaryState();
  syncDocumentState(state);
  render(root, state);
  watchEditorWorkflow(root, state);

  window.addEventListener("resize", () => {
    syncLegacyViewport(state.viewport.presetId, state.viewport.orientation, state.viewport.fitMode);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void bootstrapStudio();
  }, {once: true});
} else {
  void bootstrapStudio();
}

declare global {
  interface Window {
    studioViewportSync?: (presetId: string, orientation: Orientation, fitMode: FitMode) => void;
  }
}

window.studioViewportSync = syncLegacyViewport;

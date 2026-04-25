import type {StudioState, FitMode, Orientation, StudioSection, GameWorldProfile, GenerationProfileOverrideKey} from "../types";
import {GAME_WORLD_PROFILE_LABELS, createWorldDocumentDraft} from "../state/worldDocumentDraft";
import {getLegacyStyleSettings} from "../bridge/legacyStyle";
import {getLegacyExportSettings} from "../bridge/legacyExport";
import {
  getLegacyLayerStates,
  getLegacyLayerDetails,
  getLegacyEditorAvailability,
  getLegacyEditorDialogId,
  getLegacyDataActions,
  getLegacyTopbarActions,
  getLegacyProjectSummary,
  type EditorAction,
} from "../bridge/legacyActions";

const FIT_MODE_LABELS: Record<FitMode, string> = {
  contain: "Contain",
  cover: "Cover",
  "actual-size": "Actual size",
};

const STYLE_PRESET_OPTIONS = [
  "default",
  "ancient",
  "gloom",
  "pale",
  "light",
  "watercolor",
  "clean",
  "atlas",
  "darkSeas",
  "cyberpunk",
  "night",
  "monochrome",
];

const EXPORT_FORMAT_LABELS = {
  svg: "SVG",
  png: "PNG",
  jpeg: "JPEG",
};

const SECTION_LABELS: Record<StudioSection, string> = {
  project: "Project",
  canvas: "Canvas",
  style: "Style",
  layers: "Layers",
  export: "Export",
  data: "Data",
  editors: "Editors",
};

const STUDIO_SECTIONS: StudioSection[] = ["project", "canvas", "style", "layers", "export", "data", "editors"];

const LAYER_CONTROL_LABELS = {
  toggleTexture: "Texture",
  toggleHeight: "Heightmap",
  toggleBiomes: "Biomes",
  toggleCells: "Cells",
  toggleGrid: "Grid",
  toggleCoordinates: "Coordinates",
  toggleCompass: "Wind Rose",
  toggleRivers: "Rivers",
  toggleRelief: "Relief",
  toggleReligions: "Religions",
  toggleCultures: "Cultures",
  toggleStates: "States",
  toggleProvinces: "Provinces",
  toggleZones: "Zones",
  toggleBorders: "Borders",
  toggleRoutes: "Routes",
  toggleTemperature: "Temperature",
  togglePopulation: "Population",
  toggleIce: "Ice",
  togglePrecipitation: "Precipitation",
  toggleEmblems: "Emblems",
  toggleBurgIcons: "Burg icons",
  toggleLabels: "Labels",
  toggleMilitary: "Military",
  toggleMarkers: "Markers",
  toggleRulers: "Rulers",
  toggleScaleBar: "Scale bar",
  toggleVignette: "Vignette",
} as const;

const TOPBAR_ACTION_LABELS = {
  new: "New",
  open: "Open",
  save: "Save",
  export: "Export",
} as const;

const EDITOR_CONTROL_LABELS = {
  editStates: "States",
  editCultures: "Cultures",
  editReligions: "Religions",
  editBiomes: "Biomes",
  editProvinces: "Provinces",
  editZones: "Zones",
  editDiplomacy: "Diplomacy",
} as const;

const SECTION_EDITOR_RECOMMENDATIONS: Partial<Record<StudioSection, EditorAction>> = {
  project: "editStates",
  canvas: "editStates",
  style: "editBiomes",
  layers: "editStates",
  export: "editProvinces",
  data: "editStates",
  editors: "editStates",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[char]!);
}

function getEditorLabel(action: EditorAction | null) {
  return action ? EDITOR_CONTROL_LABELS[action] : "None";
}

function getEditorOriginLabel(section: StudioSection | null) {
  return section ? SECTION_LABELS[section] : "None";
}

function sectionNavButton(section: StudioSection, activeSection: StudioSection) {
  const activeClass = section === activeSection ? " is-active" : "";
  return `<button class="studio-nav__item${activeClass}" data-studio-action="section" data-value="${section}">${SECTION_LABELS[section]}</button>`;
}

function topbarActionButton(action: keyof typeof TOPBAR_ACTION_LABELS, enabled: boolean) {
  return `<button class="studio-ghost" data-studio-action="topbar" data-value="${action}"${enabled ? "" : " disabled"}>${TOPBAR_ACTION_LABELS[action]}</button>`;
}

function gameProfileOption(value: GameWorldProfile, current: GameWorldProfile) {
  return `<option value="${value}"${value === current ? " selected" : ""}>${GAME_WORLD_PROFILE_LABELS[value]}</option>`;
}

type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;

function renderWorldJsonDraft(draft: WorldDraftPreview) {
  return escapeHtml(JSON.stringify(draft, null, 2));
}

function renderReferenceList(refs?: Record<string, number[]>) {
  if (!refs || !Object.keys(refs).length) return "";

  return `
    <div class="studio-balance-card__refs">
      ${Object.entries(refs)
        .map(([label, values]) => `<span>${escapeHtml(label)}: ${values.slice(0, 6).join(", ")}</span>`)
        .join("")}
    </div>
  `;
}

function getBalanceHintEditorAction(category: WorldDraftPreview["playability"]["balanceHints"][number]["category"]): EditorAction {
  if (category === "habitability") return "editBiomes";
  if (category === "connectivity") return "editProvinces";
  return "editStates";
}

function getTargetTypeFromRef(type: string): NonNullable<StudioState["balanceFocus"]>["targetType"] {
  if (type === "provinces") return "province";
  if (type === "burgs") return "burg";
  if (type === "biomes") return "biome";
  return "state";
}

function renderFocusButton(targetType: NonNullable<StudioState["balanceFocus"]>["targetType"], targetId: number | undefined, sourceLabel: string, action: NonNullable<StudioState["balanceFocus"]>["action"] = "focus") {
  if (targetId === undefined) return "";
  const label = action === "fix" ? "Fix" : action === "adjust" ? "Adjust" : "Focus";
  return `<button class="studio-ghost" data-studio-action="balance-focus" data-target-type="${targetType}" data-target-id="${targetId}" data-source-label="${escapeHtml(sourceLabel)}" data-focus-action="${action}">${label} ${targetType} ${targetId}</button>`;
}

function renderEditorEntry(action: EditorAction, editorAvailability: Record<EditorAction, boolean>, label = `Open ${EDITOR_CONTROL_LABELS[action]} editor`) {
  return `<button class="studio-ghost" data-studio-action="editor" data-value="${action}"${editorAvailability[action] ? "" : " disabled"}>${label}</button>`;
}

function renderReferenceFocusButtons(refs: Record<string, number[]> | undefined, sourceLabel: string) {
  if (!refs) return "";

  return Object.entries(refs)
    .map(([type, values]) => `${renderFocusButton(getTargetTypeFromRef(type), values[0], sourceLabel)}${renderFocusButton(getTargetTypeFromRef(type), values[0], sourceLabel, "fix")}`)
    .join("");
}

function renderAutoFixTargetButton(refs: Record<string, number[]> | undefined, sourceLabel: string) {
  const entry = Object.entries(refs || {}).find(([, values]) => values.length);
  if (!entry) return "";
  const [type, values] = entry;
  return renderFocusButton(getTargetTypeFromRef(type), values[0], sourceLabel, "fix");
}

function renderAutoFixPreviewDiff(diff: WorldDraftPreview["playability"]["autoFixDrafts"][number]["previewDiff"] | undefined) {
  if (!diff) return "";

  return `
    <div class="studio-panel__eyebrow">Dry-run preview diff</div>
    <div class="studio-balance-preview">
      <div class="studio-kv"><span>Mode</span><strong>${escapeHtml(diff.mode)}</strong></div>
      <div class="studio-panel__text">${escapeHtml(diff.title)} · ${diff.changes.length} planned changes</div>
      <div class="studio-balance-list">
        ${diff.changes
          .map(
            change => `
              <div class="studio-balance-change">
                <div class="studio-balance-card__title">${escapeHtml(change.operation)} ${escapeHtml(change.entity)} · ${escapeHtml(change.id)}</div>
                <div class="studio-panel__text">${escapeHtml(change.summary)}</div>
                ${renderReferenceList(change.refs)}
                ${change.fields ? `<div class="studio-balance-card__refs">${Object.entries(change.fields).map(([key, value]) => `<span>${escapeHtml(key)}: ${escapeHtml(String(value))}</span>`).join("")}</div>` : ""}
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderGeneratorProfileSuggestions(suggestions: WorldDraftPreview["playability"]["generatorProfileSuggestions"]) {
  return `
    <div id="studioGeneratorProfileSuggestions">
      <div class="studio-panel__eyebrow">Profile generator suggestions</div>
      <div class="studio-balance-list">
        ${suggestions.map(suggestion => `
          <article class="studio-balance-card" data-generator-suggestion-id="${escapeHtml(suggestion.id)}">
            <div class="studio-balance-card__title">${escapeHtml(suggestion.target)} · ${escapeHtml(suggestion.priorityId)} · weight ${suggestion.weight}</div>
            <div class="studio-panel__text">${escapeHtml(suggestion.recommendation)}</div>
            <div class="studio-balance-card__refs">
              <label class="studio-stack-field">
                <span>${escapeHtml(suggestion.parameterDraft.label)} (${escapeHtml(suggestion.parameterDraft.unit)})</span>
                <input class="studio-input" data-generator-parameter-key="${escapeHtml(suggestion.parameterDraft.key)}" type="number" step="0.05" value="${escapeHtml(String(suggestion.parameterDraft.value))}" />
              </label>
              <span>source: ${escapeHtml(suggestion.parameterDraft.source)}</span>
              <span>override: ${suggestion.parameterDraft.overridden ? "custom" : "profile default"}</span>
            </div>
            ${renderReferenceList(suggestion.refs)}
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function renderGeneratorProfileImpact(impact: WorldDraftPreview["playability"]["generationProfileImpact"]) {
  const hasParameterChanges = Boolean(impact?.changes.length);
  const hasResultMetrics = Boolean(impact?.resultMetrics.length);

  return `
    <div id="studioGenerationProfileImpact">
      <div class="studio-panel__eyebrow">Profile generation impact</div>
      ${hasParameterChanges
        ? `<div class="studio-balance-list">
            ${impact!.changes.map(change => `
              <article class="studio-balance-card" data-generation-impact-key="${escapeHtml(change.key)}">
                <div class="studio-balance-card__title">${escapeHtml(change.key)} → ${escapeHtml(change.target)}</div>
                <div class="studio-panel__text">Applied ${escapeHtml(impact!.profile)} profile parameters before generation.</div>
                <div class="studio-balance-card__refs">
                  <span>before: ${change.before === null ? "—" : escapeHtml(String(change.before))}</span>
                  <span>after: ${escapeHtml(String(change.after))}</span>
                </div>
              </article>
            `).join("")}
          </div>`
        : `<div class="studio-panel__text">No profile override impact has been applied to generation yet.</div>`}
      ${hasResultMetrics
        ? `<div class="studio-panel__eyebrow">Result metrics</div>
          <div class="studio-balance-list">
            ${impact!.resultMetrics.map(metric => `
              <article class="studio-balance-card" data-generation-result-metric="${escapeHtml(metric.key)}">
                <div class="studio-balance-card__title">${escapeHtml(metric.key)}</div>
                <div class="studio-panel__text">Generation result sampled before and after the ${escapeHtml(impact!.profile)} override run.</div>
                <div class="studio-balance-card__refs">
                  <span>before: ${escapeHtml(String(metric.before))}</span>
                  <span>after: ${escapeHtml(String(metric.after))}</span>
                  <span>delta: ${escapeHtml(String(metric.delta))}</span>
                </div>
              </article>
            `).join("")}
          </div>`
        : ""}
    </div>
  `;
}

function renderBalanceChecker(draft: WorldDraftPreview, editorAvailability: Record<EditorAction, boolean>, previewState: StudioState["autoFixPreview"]) {
  const {spawnCandidates, balanceHints, autoFixDrafts, appliedPreviewChanges, generatorProfileSuggestions, generationProfileImpact} = draft.playability;
  const biomeRuleSummary = draft.resources.biomes.filter(biome => biome.agmRuleWeight !== undefined || biome.agmResourceTag !== undefined).slice(0, 4);
  const warningCount = balanceHints.filter(hint => hint.severity === "warning").length;
  const topSpawn = spawnCandidates[0];
  const topCandidates = spawnCandidates.slice(0, 3);
  const appliedPreviewSummary = appliedPreviewChanges
    .reduce<typeof appliedPreviewChanges>((items, change) => (items.some(item => item.draftId === change.draftId) ? items : [...items, change]), [])
    .slice(0, 4);
  const lastHistoryEntry = previewState.undoStack.at(-1);
  const nextRedoEntry = previewState.redoStack.at(-1);

  return `
    <section id="studioBalanceCheckerPanel" class="studio-panel">
      <div class="studio-panel__eyebrow">AGM Playability</div>
      <h2 class="studio-panel__title">AGM Balance Checker</h2>
      <div class="studio-kv"><span>Spawn candidates</span><strong>${spawnCandidates.length}</strong></div>
      <div class="studio-kv"><span>Balance hints</span><strong>${balanceHints.length}</strong></div>
      <div class="studio-kv"><span>Auto-fix drafts</span><strong>${autoFixDrafts.length}</strong></div>
      <div class="studio-kv"><span>Profile suggestions</span><strong>${generatorProfileSuggestions.length}</strong></div>
      <div class="studio-kv"><span>Profile impacts</span><strong>${(generationProfileImpact?.changes.length || 0) + (generationProfileImpact?.resultMetrics.length || 0)}</strong></div>
      <div class="studio-kv"><span>Applied previews</span><strong>${previewState.appliedDraftIds.length}</strong></div>
      <div class="studio-kv"><span>Applied changes</span><strong>${appliedPreviewChanges.length}</strong></div>
      <div class="studio-kv"><span>Discarded previews</span><strong>${previewState.discardedDraftIds.length}</strong></div>
      <div class="studio-kv"><span>Warnings</span><strong>${warningCount}</strong></div>
      <div class="studio-kv"><span>Top spawn score</span><strong>${topSpawn ? `${topSpawn.score}/100` : "—"}</strong></div>
      <div class="studio-panel__actions">
        <button class="studio-ghost" data-studio-action="auto-fix-history" data-value="undo"${lastHistoryEntry ? "" : " disabled"}>Undo preview</button>
        <button class="studio-ghost" data-studio-action="auto-fix-history" data-value="redo"${nextRedoEntry ? "" : " disabled"}>Redo preview</button>
      </div>
      <div class="studio-panel__text">History: ${lastHistoryEntry ? `${escapeHtml(lastHistoryEntry.action)} ${escapeHtml(lastHistoryEntry.draftId)} · ${lastHistoryEntry.changeCount} changes` : "No preview changes applied"}</div>
      <div class="studio-panel__text">Applied change queue: ${appliedPreviewSummary.length ? appliedPreviewSummary.map(change => `${escapeHtml(change.draftId)} → ${escapeHtml(change.operation)} ${escapeHtml(change.entity)} ${escapeHtml(change.id)}`).join("; ") : "No changes queued for legacy writeback"}</div>
      ${renderGeneratorProfileSuggestions(generatorProfileSuggestions)}
      ${renderGeneratorProfileImpact(generationProfileImpact)}
      <div class="studio-panel__eyebrow">AGM biome rule metadata</div>
      <div class="studio-balance-list">
        ${biomeRuleSummary.length
          ? biomeRuleSummary
              .map(
                biome => `
                  <article class="studio-balance-card" data-biome-rule-id="${biome.id}">
                    <div class="studio-balance-card__title">${escapeHtml(biome.name)} · biome ${biome.id}</div>
                    <label class="studio-stack-field">
                      <span>Rule weight</span>
                      <input class="studio-input" data-biome-rule-weight="${biome.id}" type="number" min="0" max="5" step="0.1" value="${escapeHtml(String(biome.agmRuleWeight ?? 1))}" />
                    </label>
                    <label class="studio-stack-field">
                      <span>Resource tag</span>
                      <select data-biome-resource-tag="${biome.id}">
                        <option value="starter-biome"${biome.agmResourceTag === "starter-biome" ? " selected" : ""}>starter-biome</option>
                        <option value="challenge-biome"${biome.agmResourceTag === "challenge-biome" ? " selected" : ""}>challenge-biome</option>
                        <option value="neutral-biome"${biome.agmResourceTag === "neutral-biome" ? " selected" : ""}>neutral-biome</option>
                      </select>
                    </label>
                    <div class="studio-balance-card__refs">
                      <span>rule weight: ${escapeHtml(String(biome.agmRuleWeight ?? "—"))}</span>
                      <span>resource tag: ${escapeHtml(biome.agmResourceTag ?? "—")}</span>
                    </div>
                    <div class="studio-panel__actions">
                      ${renderFocusButton("biome", biome.id, "biome-rule-metadata", "adjust")}
                      <button class="studio-ghost studio-ghost--primary" data-studio-action="biome-rule-adjust" data-biome-id="${biome.id}">Adjust biome rule</button>
                    </div>
                  </article>
                `,
              )
              .join("")
          : `<div class="studio-panel__text">No AGM biome rule metadata applied yet</div>`}
      </div>
      <div class="studio-panel__eyebrow">Spawn drill-down</div>
      <div class="studio-balance-list">
        ${topCandidates
          .map(
            candidate => `
              <article class="studio-balance-card">
                <div class="studio-balance-card__title">${escapeHtml(candidate.id)} · ${candidate.score}/100</div>
                <div class="studio-balance-card__refs">
                  ${candidate.state === undefined ? "" : `<span>state: ${candidate.state}</span>`}
                  ${candidate.province === undefined ? "" : `<span>province: ${candidate.province}</span>`}
                  ${candidate.burg === undefined ? "" : `<span>burg: ${candidate.burg}</span>`}
                  ${candidate.biome === undefined ? "" : `<span>biome: ${candidate.biome}</span>`}
                </div>
                <ul class="studio-balance-card__reasons">
                  ${candidate.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("")}
                </ul>
                <div class="studio-panel__actions">
                  ${renderFocusButton("province", candidate.province, candidate.id)}
                  ${renderFocusButton("state", candidate.state, candidate.id)}
                  ${renderFocusButton("burg", candidate.burg, candidate.id)}
                  ${renderFocusButton("biome", candidate.biome, candidate.id)}
                  ${renderFocusButton(candidate.province === undefined ? "state" : "province", candidate.province ?? candidate.state, candidate.id, "adjust")}
                  ${renderEditorEntry(candidate.province === undefined ? "editStates" : "editProvinces", editorAvailability, "Review spawn region")}
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
      <div class="studio-panel__eyebrow">Balance hint drill-down</div>
      <div class="studio-balance-list">
        ${balanceHints
          .map(hint => {
            const editorAction = getBalanceHintEditorAction(hint.category);
            return `
              <article class="studio-balance-card studio-balance-card--${hint.severity}">
                <div class="studio-balance-card__title">${escapeHtml(hint.category)} · ${escapeHtml(hint.severity)}</div>
                <div class="studio-panel__text">${escapeHtml(hint.message)}</div>
                ${renderReferenceList(hint.refs)}
                <div class="studio-panel__actions">
                  ${renderReferenceFocusButtons(hint.refs, hint.id)}
                  ${renderEditorEntry(editorAction, editorAvailability)}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
      <div class="studio-panel__eyebrow">AGM auto-fix drafts</div>
      <div class="studio-balance-list">
        ${autoFixDrafts
          .map(draft => {
            const editorAction = getBalanceHintEditorAction(draft.category);
            const isApplied = previewState.appliedDraftIds.includes(draft.id);
            const isDiscarded = previewState.discardedDraftIds.includes(draft.id);
            const previewStatus = isApplied ? "applied" : isDiscarded ? "discarded" : "pending";
            const previewChangeCount = draft.previewDiff?.changes.length || 0;
            return `
              <article class="studio-balance-card studio-balance-card--draft" data-auto-fix-draft-id="${escapeHtml(draft.id)}" data-preview-status="${previewStatus}">
                <div class="studio-balance-card__title">${escapeHtml(draft.action)} · ${escapeHtml(draft.status)}</div>
                <div class="studio-kv"><span>Preview status</span><strong>${previewStatus}</strong></div>
                <div class="studio-panel__text">${escapeHtml(draft.summary)}</div>
                ${renderReferenceList(draft.targetRefs)}
                <div class="studio-panel__eyebrow">Suggested steps</div>
                <ul class="studio-balance-card__reasons">
                  ${draft.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}
                </ul>
                <div class="studio-panel__eyebrow">Risks</div>
                <ul class="studio-balance-card__reasons">
                  ${draft.risks.map(risk => `<li>${escapeHtml(risk)}</li>`).join("")}
                </ul>
                ${renderAutoFixPreviewDiff(draft.previewDiff)}
                <div class="studio-panel__actions">
                  ${renderAutoFixTargetButton(draft.targetRefs, draft.id)}
                  <button class="studio-ghost studio-ghost--primary" data-studio-action="auto-fix-preview" data-value="apply" data-draft-id="${escapeHtml(draft.id)}" data-change-count="${previewChangeCount}"${draft.previewDiff && !isApplied ? "" : " disabled"}>Apply preview</button>
                  <button class="studio-ghost" data-studio-action="auto-fix-preview" data-value="discard" data-draft-id="${escapeHtml(draft.id)}" data-change-count="${previewChangeCount}"${draft.previewDiff && !isDiscarded ? "" : " disabled"}>Discard preview</button>
                  ${renderEditorEntry(editorAction, editorAvailability, "Review draft target")}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderLayerGroup(title: string, actions: (keyof typeof LAYER_CONTROL_LABELS)[], layerStates: Record<string, boolean>) {
  return `
    <section class="studio-panel">
      <h2 class="studio-panel__title">${title}</h2>
      <div class="studio-chip-grid">
        ${actions
          .map(action => `<button class="studio-chip${layerStates[action] ? " is-active" : ""}" data-studio-action="layer" data-value="${action}">${LAYER_CONTROL_LABELS[action]}</button>`)
          .join("")}
      </div>
    </section>
  `;
}

function getEditorStatusText(state: StudioState) {
  if (!state.editor.activeEditor || !state.editor.editorDialogOpen) return "Closed";
  return `Open · ${getEditorLabel(state.editor.activeEditor)}`;
}

function renderInspector(state: StudioState) {
  const layerStates = getLegacyLayerStates();
  const editorAvailability = getLegacyEditorAvailability();
  const dataActions = getLegacyDataActions();
  const topbarActions = getLegacyTopbarActions();
  const projectSummary = getLegacyProjectSummary();
  const styleSettings = getLegacyStyleSettings();
  const exportSettings = getLegacyExportSettings();

  switch (state.section) {
    case "project": {
      const suggestedEditor = SECTION_EDITOR_RECOMMENDATIONS.project ?? null;
      const suggestedEditorLabel = suggestedEditor ? EDITOR_CONTROL_LABELS[suggestedEditor] : "";
      const suggestedEditorDisabled = suggestedEditor && editorAvailability[suggestedEditor] ? "" : " disabled";
      const worldDraft = createWorldDocumentDraft(state, projectSummary);

      return `
        <section class="studio-panel">
          <div class="studio-panel__eyebrow">Preview Beta</div>
          <h2 class="studio-panel__hero">AGM Studio Preview Beta</h2>
          <p class="studio-panel__text">Choose a game profile, generate a map, then inspect Balance Checker and export AGM World JSON.</p>
          <div class="studio-balance-list">
            <article class="studio-balance-card">
              <div class="studio-balance-card__title">1. Select RPG / Strategy / 4X profile</div>
              <div class="studio-panel__text">Use Target game type to set the world design goal.</div>
            </article>
            <article class="studio-balance-card">
              <div class="studio-balance-card__title">2. Generate with profile parameters</div>
              <div class="studio-panel__text">AGM applies effective profile parameters before map creation.</div>
            </article>
            <article class="studio-balance-card">
              <div class="studio-balance-card__title">3. Review Profile generation impact and export AGM World JSON</div>
              <div class="studio-panel__text">Use Balance Checker and the export buttons to inspect game-ready data.</div>
            </article>
          </div>
          <div class="studio-panel__eyebrow">Document</div>
          <h2 class="studio-panel__hero">${state.document.name}</h2>
          <div class="studio-kv"><span>Document source</span><strong>${state.document.source === "agm" ? "AGM Studio" : "Legacy"}</strong></div>
          <label class="studio-stack-field">
            <span>Map name</span>
            <input id="studioProjectNameInput" class="studio-input" type="text" value="${escapeHtml(state.document.name)}" />
          </label>
          <div class="studio-kv"><span>Game profile</span><strong>${GAME_WORLD_PROFILE_LABELS[state.document.gameProfile]}</strong></div>
          <label class="studio-stack-field">
            <span>Target game type</span>
            <select id="studioProjectGameProfileSelect">
              ${Object.keys(GAME_WORLD_PROFILE_LABELS).map(value => gameProfileOption(value as GameWorldProfile, state.document.gameProfile)).join("")}
            </select>
          </label>
          <label class="studio-stack-field">
            <span>Design intent</span>
            <textarea id="studioProjectDesignIntentInput" class="studio-input" rows="3">${escapeHtml(state.document.designIntent)}</textarea>
          </label>
          <div class="studio-kv"><span>Seed</span><strong>${state.document.seed || "—"}</strong></div>
          <div class="studio-kv"><span>Size</span><strong>${state.document.documentWidth || 0} × ${state.document.documentHeight || 0}</strong></div>
          <div class="studio-kv"><span>Style</span><strong>${state.document.stylePreset}</strong></div>
          <p class="studio-panel__text">AGM World JSON is the Preview Beta's core game-data output for engine and toolchain integration.</p>
          <p class="studio-panel__text">Independent map layer JSON exports let game tools consume resource, province, and biome layers without parsing the full package.</p>
          <p class="studio-panel__text">Tiled Map JSON packages these layers into a tilemap-friendly format.</p>
          <p class="studio-panel__text">GeoJSON and heightmap metadata prepare map layers for engine importers. Heightfield JSON exports reconstructable normalized elevation data. Heightmap PNG exports grayscale raster terrain data from the heightfield. Engine Manifest includes Unity, Godot, and Unreal import layout hints.</p>
          <div class="studio-panel__actions">
            <button class="studio-ghost studio-ghost--primary" data-studio-action="project" data-value="save-agm-draft">Save AGM draft</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-agm-draft">Export AGM file</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-world-package">Export AGM World JSON</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-resource-map">Export Resource Map JSON</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-province-map">Export Province Map JSON</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-biome-map">Export Biome Map JSON</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-tiled-map">Export Tiled Map JSON</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-geojson-map-layers">Export GeoJSON Map Layers</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-heightmap-metadata">Export Heightmap Metadata</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-heightfield">Export Heightfield JSON</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-heightmap-png">Export Heightmap PNG</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-engine-manifest">Export Engine Manifest</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-rules-pack">Export AGM Rules Pack</button>
            <label class="studio-ghost" for="studioRulesPackFileInput">Import AGM Rules Pack</label>
            <input id="studioRulesPackFileInput" type="file" accept=".agm-rules.json,application/json" hidden />
            <button class="studio-ghost" data-studio-action="project" data-value="restore-agm-draft">Restore AGM draft</button>
            <label class="studio-ghost" for="studioAgmFileInput">Import AGM file</label>
            <input id="studioAgmFileInput" type="file" accept=".agm,application/json" hidden />
          </div>
          <div class="studio-panel__eyebrow">AGM World JSON draft</div>
          <pre id="studioProjectWorldJsonDraft" class="studio-code-preview">${renderWorldJsonDraft(worldDraft)}</pre>
        </section>
        ${renderBalanceChecker(worldDraft, editorAvailability, state.autoFixPreview)}
        <section class="studio-panel">
          <h2 class="studio-panel__title">Generate map</h2>
          <p class="studio-panel__text">Generate from current settings applies the selected profile's effective parameters before map creation.</p>
          <div class="studio-panel__actions">
            <button class="studio-ghost studio-ghost--primary" data-studio-action="topbar" data-value="new"${topbarActions.new ? "" : " disabled"}>Generate from current settings</button>
            <button class="studio-ghost" data-studio-action="topbar" data-value="open"${topbarActions.open ? "" : " disabled"}>Open file</button>
            <button class="studio-ghost" data-studio-action="topbar" data-value="save"${topbarActions.save ? "" : " disabled"}>Save copy</button>
            <button class="studio-ghost" data-studio-action="topbar" data-value="export"${topbarActions.export ? "" : " disabled"}>Export ${EXPORT_FORMAT_LABELS[state.export.format]}</button>
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Suggested workflow</h2>
          <div class="studio-panel__actions">
            ${suggestedEditor ? `<button class="studio-ghost" data-studio-action="editor" data-value="${suggestedEditor}"${suggestedEditorDisabled}>Open ${suggestedEditorLabel} editor</button>` : ""}
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Map settings</h2>
          <div class="studio-kv"><span>Autosave</span><strong>${projectSummary.autosaveInterval === "0" ? "Off" : `${projectSummary.autosaveInterval} min`}</strong></div>
          <label class="studio-stack-field">
            <span>Autosave interval</span>
            <input id="studioProjectAutosaveInput" class="studio-input" type="number" min="0" max="60" step="1" value="${projectSummary.autosaveInterval}" />
          </label>
          <div class="studio-kv"><span>Pending seed</span><strong>${projectSummary.pendingSeed || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change seed</span>
            <input id="studioProjectSeedInput" class="studio-input" type="number" min="1" max="999999999" step="1" value="${projectSummary.pendingSeed}" ${projectSummary.canSetSeed ? "" : "disabled"} />
          </label>
          <div class="studio-kv"><span>Points density</span><strong>${projectSummary.pendingCellsLabel || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change points density</span>
            <input id="studioProjectPointsInput" class="studio-input" type="range" min="1" max="13" step="1" value="${projectSummary.pendingPoints || "4"}" />
          </label>
          <div class="studio-kv"><span>Pending states</span><strong>${projectSummary.pendingStates || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change states</span>
            <input id="studioProjectStatesInput" class="studio-input" type="number" min="0" max="100" step="1" value="${projectSummary.pendingStates || "0"}" />
          </label>
          <div class="studio-kv"><span>Provinces ratio</span><strong>${projectSummary.pendingProvincesRatio || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change provinces ratio</span>
            <input id="studioProjectProvincesRatioInput" class="studio-input" type="number" min="0" max="100" step="1" value="${projectSummary.pendingProvincesRatio || "0"}" />
          </label>
          <div class="studio-kv"><span>Growth rate</span><strong>${projectSummary.pendingGrowthRate || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change growth rate</span>
            <input id="studioProjectGrowthRateInput" class="studio-input" type="number" min="0.1" max="2" step="0.1" value="${projectSummary.pendingGrowthRate || "1"}" />
          </label>
          <div class="studio-kv"><span>Equator temperature</span><strong>${projectSummary.pendingTemperatureEquator ? `${projectSummary.pendingTemperatureEquator}°C${projectSummary.pendingTemperatureEquatorF ? ` / ${projectSummary.pendingTemperatureEquatorF}` : ""}` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change equator temperature</span>
            <input id="studioProjectTemperatureEquatorInput" class="studio-input" type="number" min="-50" max="50" step="1" value="${projectSummary.pendingTemperatureEquator || "0"}" />
          </label>
          <div class="studio-kv"><span>North Pole temperature</span><strong>${projectSummary.pendingTemperatureNorthPole ? `${projectSummary.pendingTemperatureNorthPole}°C${projectSummary.pendingTemperatureNorthPoleF ? ` / ${projectSummary.pendingTemperatureNorthPoleF}` : ""}` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change North Pole temperature</span>
            <input id="studioProjectTemperatureNorthPoleInput" class="studio-input" type="number" min="-50" max="50" step="1" value="${projectSummary.pendingTemperatureNorthPole || "0"}" />
          </label>
          <div class="studio-kv"><span>South Pole temperature</span><strong>${projectSummary.pendingTemperatureSouthPole ? `${projectSummary.pendingTemperatureSouthPole}°C${projectSummary.pendingTemperatureSouthPoleF ? ` / ${projectSummary.pendingTemperatureSouthPoleF}` : ""}` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change South Pole temperature</span>
            <input id="studioProjectTemperatureSouthPoleInput" class="studio-input" type="number" min="-50" max="50" step="1" value="${projectSummary.pendingTemperatureSouthPole || "0"}" />
          </label>
          <div class="studio-kv"><span>Map size</span><strong>${projectSummary.pendingMapSize ? `${projectSummary.pendingMapSize}%` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change map size</span>
            <input id="studioProjectMapSizeInput" class="studio-input" type="number" min="1" max="100" step="0.1" value="${projectSummary.pendingMapSize || "100"}" />
          </label>
          <div class="studio-kv"><span>Latitude</span><strong>${projectSummary.pendingLatitude ? `${projectSummary.pendingLatitude}%` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change latitude</span>
            <input id="studioProjectLatitudeInput" class="studio-input" type="number" min="0" max="100" step="0.1" value="${projectSummary.pendingLatitude || "50"}" />
          </label>
          <div class="studio-kv"><span>Longitude</span><strong>${projectSummary.pendingLongitude ? `${projectSummary.pendingLongitude}%` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change longitude</span>
            <input id="studioProjectLongitudeInput" class="studio-input" type="number" min="0" max="100" step="0.1" value="${projectSummary.pendingLongitude || "50"}" />
          </label>
          <div class="studio-kv"><span>Wind tier 0</span><strong>${projectSummary.pendingWindTier0 ? `${projectSummary.pendingWindTier0}°` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change wind tier 0</span>
            <input id="studioProjectWindTier0Input" class="studio-input" type="number" min="0" max="315" step="45" value="${projectSummary.pendingWindTier0 || "225"}" />
          </label>
          <div class="studio-kv"><span>Wind tier 1</span><strong>${projectSummary.pendingWindTier1 ? `${projectSummary.pendingWindTier1}°` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change wind tier 1</span>
            <input id="studioProjectWindTier1Input" class="studio-input" type="number" min="0" max="315" step="45" value="${projectSummary.pendingWindTier1 || "45"}" />
          </label>
          <div class="studio-kv"><span>Wind tier 2</span><strong>${projectSummary.pendingWindTier2 ? `${projectSummary.pendingWindTier2}°` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change wind tier 2</span>
            <input id="studioProjectWindTier2Input" class="studio-input" type="number" min="0" max="315" step="45" value="${projectSummary.pendingWindTier2 || "225"}" />
          </label>
          <div class="studio-kv"><span>Wind tier 3</span><strong>${projectSummary.pendingWindTier3 ? `${projectSummary.pendingWindTier3}°` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change wind tier 3</span>
            <input id="studioProjectWindTier3Input" class="studio-input" type="number" min="0" max="315" step="45" value="${projectSummary.pendingWindTier3 || "315"}" />
          </label>
          <div class="studio-kv"><span>Wind tier 4</span><strong>${projectSummary.pendingWindTier4 ? `${projectSummary.pendingWindTier4}°` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change wind tier 4</span>
            <input id="studioProjectWindTier4Input" class="studio-input" type="number" min="0" max="315" step="45" value="${projectSummary.pendingWindTier4 || "135"}" />
          </label>
          <div class="studio-kv"><span>Wind tier 5</span><strong>${projectSummary.pendingWindTier5 ? `${projectSummary.pendingWindTier5}°` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change wind tier 5</span>
            <input id="studioProjectWindTier5Input" class="studio-input" type="number" min="0" max="315" step="45" value="${projectSummary.pendingWindTier5 || "315"}" />
          </label>
          <div class="studio-kv"><span>Precipitation</span><strong>${projectSummary.pendingPrecipitation ? `${projectSummary.pendingPrecipitation}%` : "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change precipitation</span>
            <input id="studioProjectPrecipitationInput" class="studio-input" type="number" min="0" max="500" step="1" value="${projectSummary.pendingPrecipitation || "100"}" />
          </label>
          <div class="studio-kv"><span>Size variety</span><strong>${projectSummary.pendingSizeVariety || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change size variety</span>
            <input id="studioProjectSizeVarietyInput" class="studio-input" type="number" min="0" max="10" step="0.1" value="${projectSummary.pendingSizeVariety || "4"}" />
          </label>
          <div class="studio-kv"><span>Pending cultures</span><strong>${projectSummary.pendingCultures || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change cultures</span>
            <input id="studioProjectCulturesInput" class="studio-input" type="number" min="1" step="1" value="${projectSummary.pendingCultures || "1"}" />
          </label>
          <div class="studio-kv"><span>Burgs number</span><strong>${projectSummary.pendingBurgsLabel || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change burgs number</span>
            <input id="studioProjectBurgsInput" class="studio-input" type="number" min="0" max="1000" step="1" value="${projectSummary.pendingBurgs || "1000"}" />
          </label>
          <div class="studio-kv"><span>Religions number</span><strong>${projectSummary.pendingReligions || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change religions number</span>
            <input id="studioProjectReligionsInput" class="studio-input" type="number" min="0" max="50" step="1" value="${projectSummary.pendingReligions || "0"}" />
          </label>
          <div class="studio-kv"><span>State labels mode</span><strong>${projectSummary.pendingStateLabelsModeLabel || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change state labels mode</span>
            <select id="studioProjectStateLabelsModeSelect">
              <option value="auto">Auto</option>
              <option value="short">Short names</option>
              <option value="full">Full names</option>
            </select>
          </label>
          <div class="studio-kv"><span>Culture set</span><strong>${projectSummary.pendingCultureSetLabel || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change culture set</span>
            <select id="studioProjectCultureSetSelect">
              ${projectSummary.availableCultureSets.map(option => `<option value="${option.value}">${option.label}</option>`).join("")}
            </select>
          </label>
          <div class="studio-kv"><span>Pending heightmap</span><strong>${projectSummary.pendingTemplateLabel || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Change heightmap</span>
            <select id="studioProjectTemplateSelect">
              ${projectSummary.availableTemplates.map(option => `<option value="${option.value}">${option.label}</option>`).join("")}
            </select>
          </label>
          <div class="studio-kv"><span>Pending canvas size</span><strong>${projectSummary.pendingWidth || "—"} × ${projectSummary.pendingHeight || "—"}</strong></div>
          <label class="studio-stack-field">
            <span>Pending width</span>
            <input id="studioProjectWidthInput" class="studio-input" type="number" min="1" step="1" value="${projectSummary.pendingWidth}" />
          </label>
          <label class="studio-stack-field">
            <span>Pending height</span>
            <input id="studioProjectHeightInput" class="studio-input" type="number" min="1" step="1" value="${projectSummary.pendingHeight}" />
          </label>
          <div class="studio-panel__actions">
            <button class="studio-ghost" data-studio-action="project" data-value="restore-default-canvas-size"${projectSummary.canRestoreDefaultCanvasSize ? "" : " disabled"}>Restore default canvas size</button>
            <button class="studio-ghost studio-ghost--primary" data-studio-action="topbar" data-value="new"${topbarActions.new ? "" : " disabled"}>Generate map</button>
          </div>
          <div class="studio-kv"><span>Local snapshot</span><strong>${projectSummary.hasLocalSnapshot ? "Available" : "None"}</strong></div>
          <div class="studio-kv"><span>Layers preset</span><strong>${projectSummary.lastLayersPreset}</strong></div>
          <label class="studio-stack-field">
            <span>Change layers preset</span>
            <select id="studioProjectLayersPresetSelect">
              ${projectSummary.availableLayersPresets.map(option => `<option value="${option}">${option}</option>`).join("")}
            </select>
          </label>
          <div class="studio-panel__actions">
            <button class="studio-ghost" data-studio-action="project" data-value="seed-history"${projectSummary.canOpenSeedHistory ? "" : " disabled"}>Seed history</button>
            <button class="studio-ghost" data-studio-action="project" data-value="copy-seed-url"${projectSummary.canCopySeedUrl ? "" : " disabled"}>Copy seed URL</button>
          </div>
        </section>
      `;
    }
    case "canvas": {
      const suggestedEditor = SECTION_EDITOR_RECOMMENDATIONS.canvas ?? null;
      const suggestedEditorLabel = suggestedEditor ? EDITOR_CONTROL_LABELS[suggestedEditor] : "";
      const suggestedEditorDisabled = suggestedEditor && editorAvailability[suggestedEditor] ? "" : " disabled";

      return `
        <section class="studio-panel">
          <h2 class="studio-panel__title">Canvas</h2>
          <label class="studio-stack-field">
            <span>Preset</span>
            <select id="studioInspectorPresetSelect">
              <option value="desktop-landscape">Desktop 16:10</option>
              <option value="desktop-portrait">Desktop Portrait</option>
              <option value="mobile-portrait">Mobile Portrait</option>
              <option value="mobile-landscape">Mobile Landscape</option>
              <option value="square">Square</option>
            </select>
          </label>
          <div class="studio-stack-field">
            <span>Orientation</span>
            <div class="studio-segment" role="group" aria-label="Inspector orientation">
              ${segmentButton("Landscape", "landscape", state.viewport.orientation === "landscape", "orientation")}
              ${segmentButton("Portrait", "portrait", state.viewport.orientation === "portrait", "orientation")}
            </div>
          </div>
          <div class="studio-stack-field">
            <span>View mode</span>
            <div class="studio-segment" role="group" aria-label="Inspector fit mode">
              ${Object.entries(FIT_MODE_LABELS)
                .map(([value, label]) => segmentButton(label, value, state.viewport.fitMode === value, "fitmode"))
                .join("")}
            </div>
          </div>
          <div class="studio-kv"><span>Canvas</span><strong>${state.viewport.width} × ${state.viewport.height}</strong></div>
          <div class="studio-kv"><span>Safe area</span><strong>${state.viewport.safeAreaEnabled ? "On" : "Off"}</strong></div>
          <div class="studio-kv"><span>Guides</span><strong>${state.viewport.guidesEnabled ? "On" : "Off"}</strong></div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Suggested workflow</h2>
          <div class="studio-panel__actions">
            ${suggestedEditor ? `<button class="studio-ghost" data-studio-action="editor" data-value="${suggestedEditor}"${suggestedEditorDisabled}>Open ${suggestedEditorLabel} editor</button>` : ""}
          </div>
        </section>
      `;
    }
    case "style": {
      const suggestedEditor = SECTION_EDITOR_RECOMMENDATIONS.style ?? null;
      const suggestedEditorLabel = suggestedEditor ? EDITOR_CONTROL_LABELS[suggestedEditor] : "";
      const suggestedEditorDisabled = suggestedEditor && editorAvailability[suggestedEditor] ? "" : " disabled";

      return `
        <section class="studio-panel">
          <h2 class="studio-panel__title">Style</h2>
          <label class="studio-stack-field">
            <span>Preset</span>
            <select id="studioStylePresetSelect">
              ${STYLE_PRESET_OPTIONS.map(option => `<option value="${option}">${option}</option>`).join("")}
            </select>
          </label>
          <div class="studio-kv"><span>Active</span><strong>${styleSettings.preset}</strong></div>
          <div class="studio-kv"><span>Type</span><strong>${styleSettings.presetKind}</strong></div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Label behavior</h2>
          <div class="studio-chip-grid">
            <button class="studio-chip${styleSettings.hideLabels ? " is-active" : ""}" data-studio-action="style-toggle" data-value="hide-labels">Hide small labels</button>
            <button class="studio-chip${styleSettings.rescaleLabels ? " is-active" : ""}" data-studio-action="style-toggle" data-value="rescale-labels">Rescale labels</button>
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Suggested workflow</h2>
          <div class="studio-panel__actions">
            ${suggestedEditor ? `<button class="studio-ghost" data-studio-action="editor" data-value="${suggestedEditor}"${suggestedEditorDisabled}>Open ${suggestedEditorLabel} editor</button>` : ""}
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Fidelity</h2>
          <p class="studio-panel__text">Preset switching still runs through the legacy selector-based style system so the new Studio can improve workflow without changing map layer semantics.</p>
        </section>
      `;
    }
    case "layers": {
      const layerDetails = getLegacyLayerDetails();
      const visibleCount = layerDetails.filter(layer => layer.active).length;
      const pinnedCount = layerDetails.filter(layer => layer.pinned).length;
      const suggestedEditor = SECTION_EDITOR_RECOMMENDATIONS.layers ?? null;
      const suggestedEditorLabel = suggestedEditor ? EDITOR_CONTROL_LABELS[suggestedEditor] : "";
      const suggestedEditorDisabled = suggestedEditor && editorAvailability[suggestedEditor] ? "" : " disabled";

      return `
        <section class="studio-panel">
          <h2 class="studio-panel__title">Layers summary</h2>
          <div class="studio-kv"><span>Visible</span><strong>${visibleCount}/${layerDetails.length}</strong></div>
          <div class="studio-kv"><span>Pinned</span><strong>${pinnedCount}</strong></div>
          <div class="studio-kv"><span>Preset</span><strong>${projectSummary.lastLayersPreset}</strong></div>
          <label class="studio-stack-field">
            <span>Change preset</span>
            <select id="studioLayersPresetSelect">
              ${projectSummary.availableLayersPresets.map(option => `<option value="${option}">${option}</option>`).join("")}
            </select>
          </label>
          <div class="studio-panel__actions">
            <button class="studio-ghost" data-studio-action="layers-preset-action" data-value="save"${projectSummary.canSaveLayersPreset ? "" : " disabled"}>Save preset</button>
            <button class="studio-ghost" data-studio-action="layers-preset-action" data-value="remove"${projectSummary.canRemoveLayersPreset ? "" : " disabled"}>Remove preset</button>
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Suggested workflow</h2>
          <div class="studio-panel__actions">
            ${suggestedEditor ? `<button class="studio-ghost" data-studio-action="editor" data-value="${suggestedEditor}"${suggestedEditorDisabled}>Open ${suggestedEditorLabel} editor</button>` : ""}
          </div>
        </section>
        ${renderLayerGroup("Geography", ["toggleTexture", "toggleHeight", "toggleBiomes", "toggleRelief", "toggleIce"], layerStates)}
        ${renderLayerGroup("Guides", ["toggleCells", "toggleGrid", "toggleCoordinates", "toggleCompass", "toggleRulers", "toggleScaleBar", "toggleVignette"], layerStates)}
        ${renderLayerGroup("Political", ["toggleCultures", "toggleReligions", "toggleStates", "toggleProvinces", "toggleZones", "toggleBorders"], layerStates)}
        ${renderLayerGroup("Infrastructure", ["toggleRivers", "toggleRoutes", "toggleTemperature", "togglePopulation", "togglePrecipitation"], layerStates)}
        ${renderLayerGroup("Settlement", ["toggleEmblems", "toggleBurgIcons", "toggleLabels", "toggleMilitary", "toggleMarkers"], layerStates)}
      `;
    }
    case "export": {
      const suggestedEditor = SECTION_EDITOR_RECOMMENDATIONS.export ?? null;
      const suggestedEditorLabel = suggestedEditor ? EDITOR_CONTROL_LABELS[suggestedEditor] : "";
      const suggestedEditorDisabled = suggestedEditor && editorAvailability[suggestedEditor] ? "" : " disabled";

      return `
        <section class="studio-panel">
          <h2 class="studio-panel__title">Export</h2>
          <div class="studio-segment" role="group" aria-label="Export format">
            ${Object.entries(EXPORT_FORMAT_LABELS)
              .map(([value, label]) => segmentButton(label, value, state.export.format === value, "export-format"))
              .join("")}
          </div>
          <div class="studio-panel__actions">
            <button class="studio-ghost studio-ghost--primary" data-studio-action="run-export">Export ${EXPORT_FORMAT_LABELS[state.export.format]}</button>
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Suggested workflow</h2>
          <div class="studio-panel__actions">
            ${suggestedEditor ? `<button class="studio-ghost" data-studio-action="editor" data-value="${suggestedEditor}"${suggestedEditorDisabled}>Open ${suggestedEditorLabel} editor</button>` : ""}
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Raster settings</h2>
          <label class="studio-stack-field">
            <span>PNG scale</span>
            <input id="studioPngResolutionInput" class="studio-input" type="number" min="1" step="1" value="${exportSettings.pngResolution}" />
          </label>
          <div class="studio-kv"><span>Output</span><strong>${state.viewport.width * exportSettings.pngResolution} × ${state.viewport.height * exportSettings.pngResolution}</strong></div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Tiles</h2>
          <label class="studio-stack-field">
            <span>Columns</span>
            <input id="studioTileColsInput" class="studio-input" type="number" min="2" step="1" value="${exportSettings.tileCols}" />
          </label>
          <label class="studio-stack-field">
            <span>Rows</span>
            <input id="studioTileRowsInput" class="studio-input" type="number" min="2" step="1" value="${exportSettings.tileRows}" />
          </label>
          <label class="studio-stack-field">
            <span>Tile scale</span>
            <input id="studioTileScaleInput" class="studio-input" type="number" min="1" step="1" value="${exportSettings.tileScale}" />
          </label>
        </section>
      `;
    }
    case "data": {
      const suggestedEditor = SECTION_EDITOR_RECOMMENDATIONS.data ?? null;
      const suggestedEditorLabel = suggestedEditor ? EDITOR_CONTROL_LABELS[suggestedEditor] : "";
      const suggestedEditorDisabled = suggestedEditor && editorAvailability[suggestedEditor] ? "" : " disabled";

      return `
        <section class="studio-panel">
          <h2 class="studio-panel__title">Data</h2>
          <div class="studio-kv"><span>Seed</span><strong>${state.document.seed || "—"}</strong></div>
          <div class="studio-kv"><span>Dirty</span><strong>${state.document.dirty ? "Yes" : "No"}</strong></div>
          <div class="studio-kv"><span>Snapshot</span><strong>${projectSummary.hasLocalSnapshot ? "Available" : "None"}</strong></div>
          <div class="studio-kv"><span>Source</span><strong>${dataActions.sourceLabel || "—"}</strong></div>
          <div class="studio-kv"><span>Load detail</span><strong>${dataActions.sourceDetail || "—"}</strong></div>
          <div class="studio-kv"><span>Last save</span><strong>${dataActions.saveLabel || "—"}</strong></div>
          <div class="studio-kv"><span>Save detail</span><strong>${dataActions.saveDetail || "—"}</strong></div>
          <div class="studio-kv"><span>Dropbox</span><strong>${dataActions.dropboxConnected ? dataActions.hasDropboxSelection ? "File selected" : "Connected" : "Not connected"}</strong></div>
          <div class="studio-kv"><span>Dropbox file</span><strong>${dataActions.selectedDropboxLabel || dataActions.selectedDropboxFile || "—"}</strong></div>
          <div class="studio-kv"><span>Share link</span><strong>${dataActions.hasDropboxShareLink ? "Ready" : "Not created"}</strong></div>
          <div class="studio-panel__actions">
            <button class="studio-ghost" data-studio-action="data" data-value="quick-load"${dataActions.canQuickLoad ? "" : " disabled"}>Quick load</button>
            <button class="studio-ghost" data-studio-action="data" data-value="save-storage"${dataActions.canSaveToStorage ? "" : " disabled"}>Save to storage</button>
            <button class="studio-ghost" data-studio-action="data" data-value="save-machine"${dataActions.canSaveToMachine ? "" : " disabled"}>Download</button>
            <button class="studio-ghost" data-studio-action="data" data-value="save-dropbox"${dataActions.canSaveToDropbox ? "" : " disabled"}>Save Dropbox</button>
            <button class="studio-ghost" data-studio-action="data" data-value="connect-dropbox"${dataActions.canConnectDropbox ? "" : " disabled"}>Connect Dropbox</button>
            <button class="studio-ghost" data-studio-action="data" data-value="load-dropbox"${dataActions.canLoadFromDropbox ? "" : " disabled"}>Load Dropbox</button>
            <button class="studio-ghost" data-studio-action="data" data-value="share-dropbox"${dataActions.canShareDropbox ? "" : " disabled"}>Share Dropbox</button>
            <button class="studio-ghost" data-studio-action="data" data-value="new-map"${dataActions.canCreateNew ? "" : " disabled"}>New map</button>
            <button class="studio-ghost" data-studio-action="data" data-value="open-file"${dataActions.canOpenFile ? "" : " disabled"}>Open file</button>
            <button class="studio-ghost" data-studio-action="data" data-value="load-url"${dataActions.canLoadUrl ? "" : " disabled"}>Load URL</button>
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Suggested workflow</h2>
          <div class="studio-panel__actions">
            ${suggestedEditor ? `<button class="studio-ghost" data-studio-action="editor" data-value="${suggestedEditor}"${suggestedEditorDisabled}>Open ${suggestedEditorLabel} editor</button>` : ""}
          </div>
        </section>
      `;
    }
    case "editors": {
      const activeEditor = state.editor.activeEditor;
      const activeEditorLabel = getEditorLabel(activeEditor);
      const recommendedEditor = SECTION_EDITOR_RECOMMENDATIONS[state.editor.lastEditorSection ?? state.section] ?? null;
      const recommendedEditorLabel = recommendedEditor ? EDITOR_CONTROL_LABELS[recommendedEditor] : "None";
      const activeDialogId = activeEditor ? `#${getLegacyEditorDialogId(activeEditor)}` : "—";
      const originSection = state.editor.lastEditorSection;
      const originSectionLabel = getEditorOriginLabel(originSection);
      const canReturnToOrigin = Boolean(originSection) && originSection !== "editors";

      return `
        <section class="studio-panel">
          <h2 class="studio-panel__title">Editors</h2>
          <div class="studio-kv"><span>Active</span><strong>${activeEditorLabel}</strong></div>
          <div class="studio-kv"><span>Status</span><strong>${getEditorStatusText(state)}</strong></div>
          <div class="studio-kv"><span>Dialog</span><strong>${activeDialogId}</strong></div>
          <div class="studio-kv"><span>Origin</span><strong>${originSectionLabel}</strong></div>
          <div class="studio-kv"><span>Suggested</span><strong>${recommendedEditorLabel}</strong></div>
          <div class="studio-panel__actions">
            ${activeEditor ? `<button class="studio-ghost" data-studio-action="close-editor" data-value="${activeEditor}">Close editor</button>` : ""}
            ${canReturnToOrigin ? `<button class="studio-ghost" data-studio-action="return-origin" data-value="${originSection}">Back to ${originSectionLabel}</button>` : ""}
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Open editor</h2>
          <div class="studio-chip-grid">
            ${Object.entries(EDITOR_CONTROL_LABELS)
              .map(([action, label]) => {
                const editorAction = action as EditorAction;
                const disabled = editorAvailability[editorAction] ? "" : " disabled";
                const activeClass = state.editor.activeEditor === editorAction && state.editor.editorDialogOpen ? " is-active" : "";
                return `<button class="studio-chip${activeClass}" data-studio-action="editor" data-value="${action}"${disabled}>${label}</button>`;
              })
              .join("")}
          </div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">Workflow</h2>
          <p class="studio-panel__text">Use this workspace to jump into a legacy editor while the new AGM Studio keeps track of the active editing context.</p>
        </section>
      `;
    }
  }
}

function segmentButton(label: string, value: string, selected: boolean, group: string) {
  const selectedClass = selected ? " is-selected" : "";
  return `<button class="studio-segment__button${selectedClass}" data-studio-action="${group}" data-value="${value}">${label}</button>`;
}

function bindNumberInput(id: string, onChange: (value: number) => void) {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input) return;

  let lastCommittedValue = input.value;

  const commit = () => {
    const value = Number(input.value);
    if (!Number.isFinite(value)) return;
    if (input.value === lastCommittedValue) return;
    lastCommittedValue = input.value;
    onChange(value);
  };

  input.addEventListener("input", commit);
  input.addEventListener("change", commit);
}

function renderFocusOverlay(focus: StudioState["balanceFocus"]) {
  if (!focus) return "";

  const hasGeometry = focus.x !== undefined && focus.y !== undefined;
  const action = focus.action || "focus";
  const actionLabel = action === "fix" ? "AGM fix candidate" : action === "adjust" ? "AGM adjustment target" : "AGM focus";
  const positionStyle = hasGeometry ? ` style="left: ${focus.x}%; top: ${focus.y}%;"` : "";
  const geometryLabel = hasGeometry ? ` · ${focus.x!.toFixed(1)}%, ${focus.y!.toFixed(1)}%` : " · geometry pending";

  return `
    <div id="studioBalanceFocusOverlay" class="studio-balance-focus-overlay${hasGeometry ? " is-positioned" : ""} is-${action}" data-target-type="${focus.targetType}" data-target-id="${focus.targetId}" data-focus-action="${action}" data-focus-x="${focus.x ?? ""}" data-focus-y="${focus.y ?? ""}"${positionStyle}>
      <div class="studio-balance-focus-overlay__ring"></div>
      <div class="studio-balance-focus-overlay__outline"></div>
      <div class="studio-balance-focus-overlay__label">${actionLabel} · ${focus.targetType} ${focus.targetId}${geometryLabel} · ${escapeHtml(focus.sourceLabel)}</div>
    </div>
  `;
}

export function renderStudioShell(state: StudioState) {
  const topbarActions = getLegacyTopbarActions();

  return `
    <div id="studioApp" class="studio-app">
      <header class="studio-topbar">
        <div class="studio-topbar__group">
          <div class="studio-brand">AGM Studio</div>
          <span class="studio-chip is-active">Preview Beta</span>
          <span class="studio-stage__meta">Build playable worlds from structured generation.</span>
          ${Object.entries(TOPBAR_ACTION_LABELS)
            .map(([action]) => topbarActionButton(action as keyof typeof TOPBAR_ACTION_LABELS, topbarActions[action as keyof typeof TOPBAR_ACTION_LABELS]))
            .join("")}
        </div>
        <div class="studio-topbar__group">
          <label class="studio-field studio-field--select">
            <span>Preset</span>
            <select id="studioPresetSelect">
              <option value="desktop-landscape">Desktop 16:10</option>
              <option value="desktop-portrait">Desktop Portrait</option>
              <option value="mobile-portrait">Mobile Portrait</option>
              <option value="mobile-landscape">Mobile Landscape</option>
              <option value="square">Square</option>
            </select>
          </label>
          <div class="studio-segment" role="group" aria-label="Orientation">
            ${segmentButton("Landscape", "landscape", state.viewport.orientation === "landscape", "orientation")}
            ${segmentButton("Portrait", "portrait", state.viewport.orientation === "portrait", "orientation")}
          </div>
          <div class="studio-segment" role="group" aria-label="Fit mode">
            ${Object.entries(FIT_MODE_LABELS)
              .map(([value, label]) => segmentButton(label, value, state.viewport.fitMode === value, "fitmode"))
              .join("")}
          </div>
        </div>
      </header>
      <div class="studio-body">
        <aside class="studio-sidebar studio-sidebar--left">
          <nav class="studio-nav">
            ${STUDIO_SECTIONS.map(section => sectionNavButton(section, state.section)).join("")}
          </nav>
        </aside>
        <main class="studio-stage">
          <div class="studio-stage__toolbar">
            <button class="studio-chip${state.viewport.safeAreaEnabled ? " is-active" : ""}" data-studio-action="toggle-safe-area">Safe area</button>
            <button class="studio-chip${state.viewport.guidesEnabled ? " is-active" : ""}" data-studio-action="toggle-guides">Guides</button>
            <span class="studio-stage__meta">${state.viewport.width} × ${state.viewport.height}</span>
          </div>
          <div id="studioStageViewport" class="studio-stage__viewport">
            <div id="studioCanvasFrame" class="studio-canvas-frame">
              <div class="studio-canvas-frame__overlay studio-canvas-frame__overlay--safe-area"></div>
              <div class="studio-canvas-frame__overlay studio-canvas-frame__overlay--guides"></div>
              ${renderFocusOverlay(state.balanceFocus)}
              <div id="studioLegacyMapHost" class="studio-legacy-map-host"></div>
            </div>
          </div>
        </main>
        <aside class="studio-sidebar studio-sidebar--right">
          ${renderInspector(state)}
        </aside>
      </div>
      <footer class="studio-statusbar">
        <span>${state.viewport.presetId}</span>
        <span>${state.viewport.orientation}</span>
        <span>${FIT_MODE_LABELS[state.viewport.fitMode]}</span>
        <span>${state.viewport.width} × ${state.viewport.height}</span>
        <span>Game profile: ${GAME_WORLD_PROFILE_LABELS[state.document.gameProfile]}</span>
        <span>Editor: ${getEditorStatusText(state)}</span>
      </footer>
    </div>
  `;
}

export function bindStudioShellEvents(
  state: StudioState,
  onSectionChange: (section: StudioSection) => void,
  onViewportChange: (patch: Partial<StudioState["viewport"]>) => void,
  onStyleChange: (preset: string) => void,
  onExportFormatChange: (format: "svg" | "png" | "jpeg") => void,
  onStyleToggle: (action: "hide-labels" | "rescale-labels") => void,
  onExportSettingChange: (setting: "png-resolution" | "tile-cols" | "tile-rows" | "tile-scale", value: number) => void,
  onTopbarAction: (action: keyof typeof TOPBAR_ACTION_LABELS) => void,
  onLayerAction: (action: keyof typeof LAYER_CONTROL_LABELS) => void,
  onDataAction: (action: "quick-load" | "save-storage" | "save-machine" | "save-dropbox" | "connect-dropbox" | "load-dropbox" | "share-dropbox" | "new-map" | "open-file" | "load-url") => void,
  onProjectAction: (action: "seed-history" | "copy-seed-url" | "restore-default-canvas-size" | "save-agm-draft" | "export-agm-draft" | "export-world-package" | "export-resource-map" | "export-province-map" | "export-biome-map" | "export-tiled-map" | "export-geojson-map-layers" | "export-heightmap-metadata" | "export-heightfield" | "export-heightmap-png" | "export-engine-manifest" | "export-rules-pack" | "restore-agm-draft") => void,
  onAgmFileImport: (file: File) => void,
  onRulesPackImport: (file: File) => void,
  onEditorAction: (action: keyof typeof EDITOR_CONTROL_LABELS) => void,
  onBalanceFocus: (focus: NonNullable<StudioState["balanceFocus"]>) => void,
  onAutoFixPreviewAction: (draftId: string, action: "apply" | "discard", changeCount: number) => void,
  onAutoFixHistoryAction: (action: "undo" | "redo") => void,
  onBiomeRuleAdjust: (biomeId: number, ruleWeight: number, resourceTag: string) => void,
  onGeneratorParameterOverride: (key: GenerationProfileOverrideKey, value: number) => void,
  onCloseEditor: (action: keyof typeof EDITOR_CONTROL_LABELS) => void,
  onReturnToOrigin: (section: StudioSection) => void,
  onProjectWorkspaceChange: (
    action:
      | "autosave-interval"
      | "document-name"
      | "game-profile"
      | "design-intent"
      | "layers-preset"
      | "seed"
      | "points"
      | "states"
      | "provinces-ratio"
      | "growth-rate"
      | "temperature-equator"
      | "temperature-north-pole"
      | "temperature-south-pole"
      | "map-size"
      | "latitude"
      | "longitude"
      | "wind-tier-0"
      | "wind-tier-1"
      | "wind-tier-2"
      | "wind-tier-3"
      | "wind-tier-4"
      | "wind-tier-5"
      | "precipitation"
      | "size-variety"
      | "cultures"
      | "burgs"
      | "religions"
      | "state-labels-mode"
      | "culture-set"
      | "template"
      | "width"
      | "height",
    value: string,
  ) => void,
  onLayersPresetAction: (action: "save" | "remove") => void,
  onRunExport: () => void,
) {
  const presetSelects = ["studioPresetSelect", "studioInspectorPresetSelect"];
  presetSelects.forEach(id => {
    const presetSelect = document.getElementById(id) as HTMLSelectElement | null;
    if (!presetSelect) return;
    presetSelect.value = state.viewport.presetId;
    presetSelect.addEventListener("change", () => onViewportChange({presetId: presetSelect.value}));
  });

  const stylePresetSelect = document.getElementById("studioStylePresetSelect") as HTMLSelectElement | null;
  if (stylePresetSelect) {
    stylePresetSelect.value = state.document.stylePreset;
    stylePresetSelect.addEventListener("change", () => onStyleChange(stylePresetSelect.value));
  }

  document.querySelectorAll<HTMLElement>("[data-studio-action='section']").forEach(button => {
    button.addEventListener("click", () => onSectionChange(button.dataset.value as StudioSection));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='style-toggle']").forEach(button => {
    button.addEventListener("click", () => onStyleToggle(button.dataset.value as "hide-labels" | "rescale-labels"));
  });

  bindNumberInput("studioPngResolutionInput", value => onExportSettingChange("png-resolution", value));
  bindNumberInput("studioTileColsInput", value => onExportSettingChange("tile-cols", value));
  bindNumberInput("studioTileRowsInput", value => onExportSettingChange("tile-rows", value));
  bindNumberInput("studioTileScaleInput", value => onExportSettingChange("tile-scale", value));

  const projectLayersPresetSelect = document.getElementById("studioProjectLayersPresetSelect") as HTMLSelectElement | null;
  if (projectLayersPresetSelect) {
    projectLayersPresetSelect.value = state.section === "project" ? getLegacyProjectSummary().lastLayersPreset : projectLayersPresetSelect.value;
    projectLayersPresetSelect.addEventListener("change", () => onProjectWorkspaceChange("layers-preset", projectLayersPresetSelect.value));
  }

  const layersPresetSelect = document.getElementById("studioLayersPresetSelect") as HTMLSelectElement | null;
  if (layersPresetSelect) {
    layersPresetSelect.value = state.section === "layers" ? getLegacyProjectSummary().lastLayersPreset : layersPresetSelect.value;
    layersPresetSelect.addEventListener("change", () => onProjectWorkspaceChange("layers-preset", layersPresetSelect.value));
  }

  const projectNameInput = document.getElementById("studioProjectNameInput") as HTMLInputElement | null;
  if (projectNameInput) {
    projectNameInput.value = state.document.name;
    projectNameInput.addEventListener("change", () => onProjectWorkspaceChange("document-name", projectNameInput.value));
  }

  const projectGameProfileSelect = document.getElementById("studioProjectGameProfileSelect") as HTMLSelectElement | null;
  if (projectGameProfileSelect) {
    projectGameProfileSelect.value = state.document.gameProfile;
    projectGameProfileSelect.addEventListener("change", () => onProjectWorkspaceChange("game-profile", projectGameProfileSelect.value));
  }

  const projectDesignIntentInput = document.getElementById("studioProjectDesignIntentInput") as HTMLTextAreaElement | null;
  if (projectDesignIntentInput) {
    projectDesignIntentInput.value = state.document.designIntent;
    projectDesignIntentInput.addEventListener("change", () => onProjectWorkspaceChange("design-intent", projectDesignIntentInput.value));
  }

  bindNumberInput("studioProjectAutosaveInput", value => onProjectWorkspaceChange("autosave-interval", String(value)));

  const projectSeedInput = document.getElementById("studioProjectSeedInput") as HTMLInputElement | null;
  if (projectSeedInput) {
    projectSeedInput.value = state.section === "project" ? getLegacyProjectSummary().pendingSeed : projectSeedInput.value;
    projectSeedInput.addEventListener("change", () => onProjectWorkspaceChange("seed", projectSeedInput.value));
  }

  const projectPointsInput = document.getElementById("studioProjectPointsInput") as HTMLInputElement | null;
  if (projectPointsInput) {
    projectPointsInput.value = state.section === "project" ? getLegacyProjectSummary().pendingPoints || projectPointsInput.value : projectPointsInput.value;
    projectPointsInput.addEventListener("change", () => onProjectWorkspaceChange("points", projectPointsInput.value));
  }

  const projectStatesInput = document.getElementById("studioProjectStatesInput") as HTMLInputElement | null;
  if (projectStatesInput) {
    projectStatesInput.value = state.section === "project" ? getLegacyProjectSummary().pendingStates || projectStatesInput.value : projectStatesInput.value;
    projectStatesInput.addEventListener("change", () => onProjectWorkspaceChange("states", projectStatesInput.value));
  }

  const projectProvincesRatioInput = document.getElementById("studioProjectProvincesRatioInput") as HTMLInputElement | null;
  if (projectProvincesRatioInput) {
    projectProvincesRatioInput.value = state.section === "project" ? getLegacyProjectSummary().pendingProvincesRatio || projectProvincesRatioInput.value : projectProvincesRatioInput.value;
    projectProvincesRatioInput.addEventListener("change", () => onProjectWorkspaceChange("provinces-ratio", projectProvincesRatioInput.value));
  }

  const projectGrowthRateInput = document.getElementById("studioProjectGrowthRateInput") as HTMLInputElement | null;
  if (projectGrowthRateInput) {
    projectGrowthRateInput.value = state.section === "project" ? getLegacyProjectSummary().pendingGrowthRate || projectGrowthRateInput.value : projectGrowthRateInput.value;
    projectGrowthRateInput.addEventListener("change", () => onProjectWorkspaceChange("growth-rate", projectGrowthRateInput.value));
  }

  const projectTemperatureEquatorInput = document.getElementById("studioProjectTemperatureEquatorInput") as HTMLInputElement | null;
  if (projectTemperatureEquatorInput) {
    projectTemperatureEquatorInput.value = state.section === "project" ? getLegacyProjectSummary().pendingTemperatureEquator || projectTemperatureEquatorInput.value : projectTemperatureEquatorInput.value;
    projectTemperatureEquatorInput.addEventListener("change", () => onProjectWorkspaceChange("temperature-equator", projectTemperatureEquatorInput.value));
  }

  const projectTemperatureNorthPoleInput = document.getElementById("studioProjectTemperatureNorthPoleInput") as HTMLInputElement | null;
  if (projectTemperatureNorthPoleInput) {
    projectTemperatureNorthPoleInput.value = state.section === "project" ? getLegacyProjectSummary().pendingTemperatureNorthPole || projectTemperatureNorthPoleInput.value : projectTemperatureNorthPoleInput.value;
    projectTemperatureNorthPoleInput.addEventListener("change", () => onProjectWorkspaceChange("temperature-north-pole", projectTemperatureNorthPoleInput.value));
  }

  const projectTemperatureSouthPoleInput = document.getElementById("studioProjectTemperatureSouthPoleInput") as HTMLInputElement | null;
  if (projectTemperatureSouthPoleInput) {
    projectTemperatureSouthPoleInput.value = state.section === "project" ? getLegacyProjectSummary().pendingTemperatureSouthPole || projectTemperatureSouthPoleInput.value : projectTemperatureSouthPoleInput.value;
    projectTemperatureSouthPoleInput.addEventListener("change", () => onProjectWorkspaceChange("temperature-south-pole", projectTemperatureSouthPoleInput.value));
  }

  const projectMapSizeInput = document.getElementById("studioProjectMapSizeInput") as HTMLInputElement | null;
  if (projectMapSizeInput) {
    projectMapSizeInput.value = state.section === "project" ? getLegacyProjectSummary().pendingMapSize || projectMapSizeInput.value : projectMapSizeInput.value;
    projectMapSizeInput.addEventListener("change", () => onProjectWorkspaceChange("map-size", projectMapSizeInput.value));
  }

  const projectLatitudeInput = document.getElementById("studioProjectLatitudeInput") as HTMLInputElement | null;
  if (projectLatitudeInput) {
    projectLatitudeInput.value = state.section === "project" ? getLegacyProjectSummary().pendingLatitude || projectLatitudeInput.value : projectLatitudeInput.value;
    projectLatitudeInput.addEventListener("change", () => onProjectWorkspaceChange("latitude", projectLatitudeInput.value));
  }

  const projectLongitudeInput = document.getElementById("studioProjectLongitudeInput") as HTMLInputElement | null;
  if (projectLongitudeInput) {
    projectLongitudeInput.value = state.section === "project" ? getLegacyProjectSummary().pendingLongitude || projectLongitudeInput.value : projectLongitudeInput.value;
    projectLongitudeInput.addEventListener("change", () => onProjectWorkspaceChange("longitude", projectLongitudeInput.value));
  }

  const projectWindTier0Input = document.getElementById("studioProjectWindTier0Input") as HTMLInputElement | null;
  if (projectWindTier0Input) {
    projectWindTier0Input.value = state.section === "project" ? getLegacyProjectSummary().pendingWindTier0 || projectWindTier0Input.value : projectWindTier0Input.value;
    projectWindTier0Input.addEventListener("change", () => onProjectWorkspaceChange("wind-tier-0", projectWindTier0Input.value));
  }

  const projectWindTier1Input = document.getElementById("studioProjectWindTier1Input") as HTMLInputElement | null;
  if (projectWindTier1Input) {
    projectWindTier1Input.value = state.section === "project" ? getLegacyProjectSummary().pendingWindTier1 || projectWindTier1Input.value : projectWindTier1Input.value;
    projectWindTier1Input.addEventListener("change", () => onProjectWorkspaceChange("wind-tier-1", projectWindTier1Input.value));
  }

  const projectWindTier2Input = document.getElementById("studioProjectWindTier2Input") as HTMLInputElement | null;
  if (projectWindTier2Input) {
    projectWindTier2Input.value = state.section === "project" ? getLegacyProjectSummary().pendingWindTier2 || projectWindTier2Input.value : projectWindTier2Input.value;
    projectWindTier2Input.addEventListener("change", () => onProjectWorkspaceChange("wind-tier-2", projectWindTier2Input.value));
  }

  const projectWindTier3Input = document.getElementById("studioProjectWindTier3Input") as HTMLInputElement | null;
  if (projectWindTier3Input) {
    projectWindTier3Input.value = state.section === "project" ? getLegacyProjectSummary().pendingWindTier3 || projectWindTier3Input.value : projectWindTier3Input.value;
    projectWindTier3Input.addEventListener("change", () => onProjectWorkspaceChange("wind-tier-3", projectWindTier3Input.value));
  }

  const projectWindTier4Input = document.getElementById("studioProjectWindTier4Input") as HTMLInputElement | null;
  if (projectWindTier4Input) {
    projectWindTier4Input.value = state.section === "project" ? getLegacyProjectSummary().pendingWindTier4 || projectWindTier4Input.value : projectWindTier4Input.value;
    projectWindTier4Input.addEventListener("change", () => onProjectWorkspaceChange("wind-tier-4", projectWindTier4Input.value));
  }

  const projectWindTier5Input = document.getElementById("studioProjectWindTier5Input") as HTMLInputElement | null;
  if (projectWindTier5Input) {
    projectWindTier5Input.value = state.section === "project" ? getLegacyProjectSummary().pendingWindTier5 || projectWindTier5Input.value : projectWindTier5Input.value;
    projectWindTier5Input.addEventListener("change", () => onProjectWorkspaceChange("wind-tier-5", projectWindTier5Input.value));
  }

  const projectPrecipitationInput = document.getElementById("studioProjectPrecipitationInput") as HTMLInputElement | null;
  if (projectPrecipitationInput) {
    projectPrecipitationInput.value = state.section === "project" ? getLegacyProjectSummary().pendingPrecipitation || projectPrecipitationInput.value : projectPrecipitationInput.value;
    projectPrecipitationInput.addEventListener("change", () => onProjectWorkspaceChange("precipitation", projectPrecipitationInput.value));
  }

  const projectSizeVarietyInput = document.getElementById("studioProjectSizeVarietyInput") as HTMLInputElement | null;
  if (projectSizeVarietyInput) {
    projectSizeVarietyInput.value = state.section === "project" ? getLegacyProjectSummary().pendingSizeVariety || projectSizeVarietyInput.value : projectSizeVarietyInput.value;
    projectSizeVarietyInput.addEventListener("change", () => onProjectWorkspaceChange("size-variety", projectSizeVarietyInput.value));
  }

  const projectCulturesInput = document.getElementById("studioProjectCulturesInput") as HTMLInputElement | null;
  if (projectCulturesInput) {
    projectCulturesInput.value = state.section === "project" ? getLegacyProjectSummary().pendingCultures || projectCulturesInput.value : projectCulturesInput.value;
    projectCulturesInput.addEventListener("change", () => onProjectWorkspaceChange("cultures", projectCulturesInput.value));
  }

  const projectBurgsInput = document.getElementById("studioProjectBurgsInput") as HTMLInputElement | null;
  if (projectBurgsInput) {
    projectBurgsInput.value = state.section === "project" ? getLegacyProjectSummary().pendingBurgs || projectBurgsInput.value : projectBurgsInput.value;
    projectBurgsInput.addEventListener("change", () => onProjectWorkspaceChange("burgs", projectBurgsInput.value));
  }

  const projectReligionsInput = document.getElementById("studioProjectReligionsInput") as HTMLInputElement | null;
  if (projectReligionsInput) {
    projectReligionsInput.value = state.section === "project" ? getLegacyProjectSummary().pendingReligions || projectReligionsInput.value : projectReligionsInput.value;
    projectReligionsInput.addEventListener("change", () => onProjectWorkspaceChange("religions", projectReligionsInput.value));
  }

  const projectStateLabelsModeSelect = document.getElementById("studioProjectStateLabelsModeSelect") as HTMLSelectElement | null;
  if (projectStateLabelsModeSelect) {
    projectStateLabelsModeSelect.value = state.section === "project" ? getLegacyProjectSummary().pendingStateLabelsMode || projectStateLabelsModeSelect.value : projectStateLabelsModeSelect.value;
    projectStateLabelsModeSelect.addEventListener("change", () => onProjectWorkspaceChange("state-labels-mode", projectStateLabelsModeSelect.value));
  }

  const projectCultureSetSelect = document.getElementById("studioProjectCultureSetSelect") as HTMLSelectElement | null;
  if (projectCultureSetSelect) {
    projectCultureSetSelect.value = state.section === "project" ? getLegacyProjectSummary().pendingCultureSet : projectCultureSetSelect.value;
    projectCultureSetSelect.addEventListener("change", () => onProjectWorkspaceChange("culture-set", projectCultureSetSelect.value));
  }

  const projectTemplateSelect = document.getElementById("studioProjectTemplateSelect") as HTMLSelectElement | null;
  if (projectTemplateSelect) {
    projectTemplateSelect.value = state.section === "project" ? getLegacyProjectSummary().pendingTemplate : projectTemplateSelect.value;
    projectTemplateSelect.addEventListener("change", () => onProjectWorkspaceChange("template", projectTemplateSelect.value));
  }

  const projectWidthInput = document.getElementById("studioProjectWidthInput") as HTMLInputElement | null;
  if (projectWidthInput) {
    projectWidthInput.value = state.section === "project" ? getLegacyProjectSummary().pendingWidth : projectWidthInput.value;
    projectWidthInput.addEventListener("change", () => onProjectWorkspaceChange("width", projectWidthInput.value));
  }

  const projectHeightInput = document.getElementById("studioProjectHeightInput") as HTMLInputElement | null;
  if (projectHeightInput) {
    projectHeightInput.value = state.section === "project" ? getLegacyProjectSummary().pendingHeight : projectHeightInput.value;
    projectHeightInput.addEventListener("change", () => onProjectWorkspaceChange("height", projectHeightInput.value));
  }

  document.querySelectorAll<HTMLElement>("[data-studio-action='topbar']").forEach(button => {
    button.addEventListener("click", () => onTopbarAction(button.dataset.value as keyof typeof TOPBAR_ACTION_LABELS));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='layer']").forEach(button => {
    button.addEventListener("click", () => onLayerAction(button.dataset.value as keyof typeof LAYER_CONTROL_LABELS));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='data']").forEach(button => {
    button.addEventListener("click", () =>
      onDataAction(button.dataset.value as "quick-load" | "save-storage" | "save-machine" | "save-dropbox" | "connect-dropbox" | "load-dropbox" | "share-dropbox" | "new-map" | "open-file" | "load-url"),
    );
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='project']").forEach(button => {
    button.addEventListener("click", () => onProjectAction(button.dataset.value as "seed-history" | "copy-seed-url" | "restore-default-canvas-size" | "save-agm-draft" | "export-agm-draft" | "export-world-package" | "export-resource-map" | "export-province-map" | "export-biome-map" | "export-tiled-map" | "export-geojson-map-layers" | "export-heightmap-metadata" | "export-heightfield" | "export-heightmap-png" | "export-engine-manifest" | "export-rules-pack" | "restore-agm-draft"));
  });

  document.getElementById("studioAgmFileInput")?.addEventListener("change", event => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) onAgmFileImport(file);
    input.value = "";
  });

  document.getElementById("studioRulesPackFileInput")?.addEventListener("change", event => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) onRulesPackImport(file);
    input.value = "";
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='editor']").forEach(button => {
    button.addEventListener("click", () => onEditorAction(button.dataset.value as keyof typeof EDITOR_CONTROL_LABELS));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='balance-focus']").forEach(button => {
    button.addEventListener("click", () => {
      onBalanceFocus({
        targetType: button.dataset.targetType as NonNullable<StudioState["balanceFocus"]>["targetType"],
        targetId: Number(button.dataset.targetId),
        sourceLabel: button.dataset.sourceLabel || "balance-checker",
        action: (button.dataset.focusAction as NonNullable<StudioState["balanceFocus"]>["action"]) || "focus",
      });
    });
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='auto-fix-preview']").forEach(button => {
    button.addEventListener("click", () => onAutoFixPreviewAction(button.dataset.draftId || "", button.dataset.value as "apply" | "discard", Number(button.dataset.changeCount || "0")));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='auto-fix-history']").forEach(button => {
    button.addEventListener("click", () => onAutoFixHistoryAction(button.dataset.value as "undo" | "redo"));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='biome-rule-adjust']").forEach(button => {
    button.addEventListener("click", () => {
      const biomeId = Number(button.dataset.biomeId);
      const ruleWeightInput = document.querySelector<HTMLInputElement>(`[data-biome-rule-weight='${biomeId}']`);
      const resourceTagSelect = document.querySelector<HTMLSelectElement>(`[data-biome-resource-tag='${biomeId}']`);
      onBiomeRuleAdjust(biomeId, Number(ruleWeightInput?.value ?? "1"), resourceTagSelect?.value || "starter-biome");
    });
  });

  document.querySelectorAll<HTMLInputElement>("[data-generator-parameter-key]").forEach(input => {
    let lastCommittedValue = input.value;
    const commit = () => {
      const value = Number(input.value);
      if (!Number.isFinite(value)) return;
      if (input.value === lastCommittedValue) return;
      lastCommittedValue = input.value;
      onGeneratorParameterOverride(input.dataset.generatorParameterKey as GenerationProfileOverrideKey, value);
    };
    input.addEventListener("input", commit);
    input.addEventListener("change", commit);
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='close-editor']").forEach(button => {
    button.addEventListener("click", () => onCloseEditor(button.dataset.value as keyof typeof EDITOR_CONTROL_LABELS));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='return-origin']").forEach(button => {
    button.addEventListener("click", () => onReturnToOrigin(button.dataset.value as StudioSection));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='layers-preset-action']").forEach(button => {
    button.addEventListener("click", () => onLayersPresetAction(button.dataset.value as "save" | "remove"));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='orientation']").forEach(button => {
    button.addEventListener("click", () => onViewportChange({orientation: button.dataset.value as Orientation}));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='fitmode']").forEach(button => {
    button.addEventListener("click", () => onViewportChange({fitMode: button.dataset.value as FitMode}));
  });

  document.querySelectorAll<HTMLElement>("[data-studio-action='export-format']").forEach(button => {
    button.addEventListener("click", () => onExportFormatChange(button.dataset.value as "svg" | "png" | "jpeg"));
  });

  document.querySelector("[data-studio-action='run-export']")?.addEventListener("click", () => {
    onRunExport();
  });

  document.querySelector("[data-studio-action='toggle-safe-area']")?.addEventListener("click", () => {
    onViewportChange({safeAreaEnabled: !state.viewport.safeAreaEnabled});
  });

  document.querySelector("[data-studio-action='toggle-guides']")?.addEventListener("click", () => {
    onViewportChange({guidesEnabled: !state.viewport.guidesEnabled});
  });
}

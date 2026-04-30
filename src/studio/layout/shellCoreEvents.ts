import type { EditorAction } from "../bridge/engineActionTypes";
import type { StudioSection, StudioState } from "../types";
import { bindBiomeInsightEvents } from "./biomeInsightEvents";
import { bindProjectWorkspaceEvents } from "./projectWorkspaceEvents";
import type {
  EDITOR_CONTROL_LABELS,
  LAYER_CONTROL_LABELS,
  TOPBAR_ACTION_LABELS,
} from "./shellConstants";
import { bindNumberInput } from "./shellEventDom";
import type { StudioShellEventHandlers } from "./shellEventTypes";
import { bindActionClick, bindFileInput } from "./studioEventBinding";

export function bindShellCoreEvents(
  state: StudioState,
  {
    onSectionChange,
    onExportSettingChange,
    onTopbarAction,
    onLayerAction,
    onDataAction,
    onProjectAction,
    onAgmFileImport,
    onRulesPackImport,
    onEditorAction,
    onProjectWorkspaceChange,
    onBiomeCoverageChange,
  }: StudioShellEventHandlers,
) {
  bindActionClick("section", (button) =>
    onSectionChange(button.dataset.value as StudioSection),
  );

  bindActionClick("pipeline-section", (button) =>
    onSectionChange(button.dataset.value as StudioSection),
  );

  bindBiomeInsightEvents({ onBiomeCoverageChange });

  bindNumberInput("studioPngResolutionInput", (value) =>
    onExportSettingChange("png-resolution", value),
  );
  bindNumberInput("studioTileColsInput", (value) =>
    onExportSettingChange("tile-cols", value),
  );
  bindNumberInput("studioTileRowsInput", (value) =>
    onExportSettingChange("tile-rows", value),
  );
  bindNumberInput("studioTileScaleInput", (value) =>
    onExportSettingChange("tile-scale", value),
  );

  bindProjectWorkspaceEvents(state, onProjectWorkspaceChange);

  bindActionClick("topbar", (button) =>
    onTopbarAction(button.dataset.value as keyof typeof TOPBAR_ACTION_LABELS),
  );

  bindActionClick("layer", (button) =>
    onLayerAction(button.dataset.value as keyof typeof LAYER_CONTROL_LABELS),
  );

  bindActionClick("data", (button) =>
    onDataAction(
      button.dataset.value as
        | "quick-load"
        | "save-storage"
        | "save-machine"
        | "save-dropbox"
        | "connect-dropbox"
        | "load-dropbox"
        | "share-dropbox"
        | "new-map"
        | "open-file"
        | "load-url",
    ),
  );

  bindActionClick("project", (button) =>
    onProjectAction(
      button.dataset.value as
        | "seed-history"
        | "copy-seed-url"
        | "restore-default-canvas-size"
        | "save-agm-draft"
        | "export-agm-draft"
        | "export-world-package"
        | "export-resource-map"
        | "export-province-map"
        | "export-biome-map"
        | "export-tiled-map"
        | "export-geojson-map-layers"
        | "export-heightmap-metadata"
        | "export-heightfield"
        | "export-heightmap-png"
        | "export-heightmap-raw16"
        | "export-engine-manifest"
        | "export-engine-package"
        | "export-rules-pack"
        | "restore-agm-draft",
    ),
  );

  bindFileInput("studioAgmFileInput", onAgmFileImport);
  bindFileInput("studioRulesPackFileInput", onRulesPackImport);

  bindActionClick("editor", (button) =>
    onEditorAction(button.dataset.value as keyof typeof EDITOR_CONTROL_LABELS),
  );

  bindActionClick("open-detailed-editor", (button) =>
    onEditorAction(button.dataset.value as EditorAction),
  );
}

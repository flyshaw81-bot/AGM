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

function closestElement(
  target: EventTarget | null,
  selector: string,
): Element | null {
  const maybeElement = target as {
    closest?: (selector: string) => Element | null;
  } | null;
  if (!maybeElement?.closest) return null;
  try {
    return maybeElement.closest(selector);
  } catch {
    return null;
  }
}

const NATIVE_EDITOR_DRAWER_SAFE_CLICK_TARGETS = [
  ".studio-native-drawer",
  ".studio-native-v8-info-panel",
  ".studio-native-iconbar",
  ".studio-native-topbar",
  ".studio-floating-toolbar",
  ".studio-native-layerbar",
  ".studio-native-v8-bottom",
  ".studio-map-zoom",
  ".studio-native-biome-popover",
] as const;

export function shouldDismissNativeEditorDrawerClick(
  state: Pick<StudioState, "section">,
  target: EventTarget | null,
) {
  if (state.section !== "editors") return false;
  if (!closestElement(target, ".studio-native-app")) return false;
  if (closestElement(target, ".studio-native-app--v8")) return false;
  if (
    NATIVE_EDITOR_DRAWER_SAFE_CLICK_TARGETS.some((selector) =>
      closestElement(target, selector),
    )
  )
    return false;
  return true;
}

function bindNativeEditorOutsideDismiss(
  state: StudioState,
  onSectionChange: (section: StudioSection) => void,
) {
  const app = document.getElementById("studioApp");
  app?.addEventListener(
    "click",
    (event) => {
      if (shouldDismissNativeEditorDrawerClick(state, event.target)) {
        event.preventDefault();
        event.stopPropagation();
        onSectionChange("canvas");
      }
    },
    true,
  );
}

export function bindShellCoreEvents(
  state: StudioState,
  {
    onSectionChange,
    onExportSettingChange,
    onTopbarAction,
    onLayerAction,
    onLayerPin,
    onDataAction,
    onProjectAction,
    onAgmFileImport,
    onRulesPackImport,
    onEditorAction,
    onProjectWorkspaceChange,
    onBiomeCoverageChange,
  }: StudioShellEventHandlers,
) {
  bindNativeEditorOutsideDismiss(state, onSectionChange);

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

  bindActionClick("layer-pin", (button) =>
    onLayerPin(button.dataset.value ?? ""),
  );

  bindActionClick("data", (button) =>
    onDataAction(
      button.dataset.value as
        | "load-browser-snapshot"
        | "save-browser-snapshot"
        | "download-project"
        | "create-generated-world"
        | "open-file"
        | "open-url-source",
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

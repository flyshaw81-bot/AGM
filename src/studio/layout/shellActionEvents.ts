import { STUDIO_CANVAS_PRESETS } from "../canvas/presets";
import type {
  CanvasToolMode,
  FitMode,
  GenerationProfileOverrideKey,
  Orientation,
  StudioSection,
  StudioState,
} from "../types";
import type { EDITOR_CONTROL_LABELS } from "./shellConstants";
import { bindActionClick } from "./studioEventBinding";

type ShellActionEventsOptions = {
  state: StudioState;
  onBalanceFocus: (focus: NonNullable<StudioState["balanceFocus"]>) => void;
  onAutoFixPreviewAction: (
    draftId: string,
    action: "apply" | "discard",
    changeCount: number,
  ) => void;
  onAutoFixHistoryAction: (action: "undo" | "redo") => void;
  onBiomeRuleAdjust: (
    biomeId: number,
    ruleWeight: number,
    resourceTag: string,
  ) => void;
  onGeneratorParameterOverride: (
    key: GenerationProfileOverrideKey,
    value: number,
  ) => void;
  onCloseEditor: (action: keyof typeof EDITOR_CONTROL_LABELS) => void;
  onReturnToOrigin: (section: StudioSection) => void;
  onLayersPresetAction: (action: "save" | "remove") => void;
  onViewportChange: (
    patch: Partial<StudioState["viewport"]>,
  ) => void | Promise<void>;
  onCanvasEditAction: (action: "apply" | "undo", cellId?: number) => void;
  onExportFormatChange: (format: "svg" | "png" | "jpeg") => void;
  onRunExport: () => void;
};

export function bindShellActionEvents({
  state,
  onBalanceFocus,
  onAutoFixPreviewAction,
  onAutoFixHistoryAction,
  onBiomeRuleAdjust,
  onGeneratorParameterOverride,
  onCloseEditor,
  onReturnToOrigin,
  onLayersPresetAction,
  onViewportChange,
  onCanvasEditAction,
  onExportFormatChange,
  onRunExport,
}: ShellActionEventsOptions) {
  bindActionClick("balance-focus", (button) => {
    onBalanceFocus({
      targetType: button.dataset.targetType as NonNullable<
        StudioState["balanceFocus"]
      >["targetType"],
      targetId: Number(button.dataset.targetId),
      sourceLabel: button.dataset.sourceLabel || "balance-checker",
      action:
        (button.dataset.focusAction as NonNullable<
          StudioState["balanceFocus"]
        >["action"]) || "focus",
    });
  });

  bindActionClick("auto-fix-preview", (button) =>
    onAutoFixPreviewAction(
      button.dataset.draftId || "",
      button.dataset.value as "apply" | "discard",
      Number(button.dataset.changeCount || "0"),
    ),
  );

  bindActionClick("auto-fix-history", (button) =>
    onAutoFixHistoryAction(button.dataset.value as "undo" | "redo"),
  );

  bindActionClick("biome-rule-adjust", (button) => {
    const biomeId = Number(button.dataset.biomeId);
    const ruleWeightInput = document.querySelector<HTMLInputElement>(
      `[data-biome-rule-weight='${biomeId}']`,
    );
    const resourceTagSelect = document.querySelector<HTMLSelectElement>(
      `[data-biome-resource-tag='${biomeId}']`,
    );
    onBiomeRuleAdjust(
      biomeId,
      Number(ruleWeightInput?.value ?? "1"),
      resourceTagSelect?.value || "starter-biome",
    );
  });

  document
    .querySelectorAll<HTMLInputElement>("[data-generator-parameter-key]")
    .forEach((input) => {
      let lastCommittedValue = input.value;
      const commit = () => {
        const value = Number(input.value);
        if (!Number.isFinite(value)) return;
        if (input.value === lastCommittedValue) return;
        lastCommittedValue = input.value;
        onGeneratorParameterOverride(
          input.dataset.generatorParameterKey as GenerationProfileOverrideKey,
          value,
        );
      };
      input.addEventListener("input", commit);
      input.addEventListener("change", commit);
    });

  bindActionClick("close-editor", (button) =>
    onCloseEditor(button.dataset.value as keyof typeof EDITOR_CONTROL_LABELS),
  );

  bindActionClick("return-origin", (button) =>
    onReturnToOrigin(button.dataset.value as StudioSection),
  );

  bindActionClick("layers-preset-action", (button) =>
    onLayersPresetAction(button.dataset.value as "save" | "remove"),
  );

  document.addEventListener(
    "toggle",
    (event) => {
      const dropdown = event.target as HTMLDetailsElement | null;
      if (
        !dropdown?.matches?.(
          ".studio-floating-toolbar__dropdown, .studio-native-v8-viewport__dropdown",
        ) ||
        !dropdown.open
      ) {
        return;
      }
      document
        .querySelectorAll<HTMLDetailsElement>(
          ".studio-floating-toolbar__dropdown[open], .studio-native-v8-viewport__dropdown[open]",
        )
        .forEach((otherDropdown) => {
          if (otherDropdown !== dropdown) otherDropdown.open = false;
        });
    },
    true,
  );

  bindActionClick("viewport-dropdown-option", (button) => {
    const dropdown = button.closest<HTMLDetailsElement>(
      ".studio-floating-toolbar__dropdown, .studio-native-v8-viewport__dropdown",
    );
    if (dropdown) dropdown.open = false;
    const field = button.dataset.field;
    const value = button.dataset.value || "";
    if (field === "presetId") {
      const preset = STUDIO_CANVAS_PRESETS.find((item) => item.id === value);
      onViewportChange({
        presetId: value,
        ...(preset ? { orientation: preset.orientation } : {}),
      });
      return;
    }
    if (field === "orientation") {
      onViewportChange({ orientation: value as Orientation });
      return;
    }
    if (field === "fitMode") {
      onViewportChange({ fitMode: value as FitMode });
    }
  });

  document
    .querySelectorAll<HTMLSelectElement>("[data-studio-viewport-select]")
    .forEach((select) => {
      select.addEventListener("change", () => {
        const field = select.dataset.studioViewportSelect;
        if (field === "presetId") {
          const preset = STUDIO_CANVAS_PRESETS.find(
            (item) => item.id === select.value,
          );
          onViewportChange({
            presetId: select.value,
            ...(preset ? { orientation: preset.orientation } : {}),
          });
          return;
        }
        if (field === "orientation") {
          onViewportChange({ orientation: select.value as Orientation });
          return;
        }
        if (field === "fitMode") {
          onViewportChange({ fitMode: select.value as FitMode });
        }
      });
    });

  bindActionClick("viewport-preset-cycle", () => {
    const presetIds = STUDIO_CANVAS_PRESETS.map((preset) => preset.id);
    const currentIndex = Math.max(
      0,
      presetIds.indexOf(state.viewport.presetId),
    );
    const nextPresetId = presetIds[(currentIndex + 1) % presetIds.length];
    const preset = STUDIO_CANVAS_PRESETS.find(
      (item) => item.id === nextPresetId,
    );
    onViewportChange({
      presetId: nextPresetId,
      ...(preset ? { orientation: preset.orientation } : {}),
    });
  });

  bindActionClick("orientation", (button) =>
    onViewportChange({ orientation: button.dataset.value as Orientation }),
  );

  bindActionClick("fitmode", (button) =>
    onViewportChange({ fitMode: button.dataset.value as FitMode }),
  );

  bindActionClick("canvas-tool", (button) =>
    onViewportChange({
      canvasTool: button.dataset.value as CanvasToolMode,
    }),
  );

  bindActionClick("canvas-edit-apply", (button) => {
    const cellId = Number(button.dataset.previewCell);
    onCanvasEditAction("apply", Number.isFinite(cellId) ? cellId : undefined);
  });
  bindActionClick("canvas-edit-undo", () => onCanvasEditAction("undo"));

  bindActionClick("export-format", (button) =>
    onExportFormatChange(button.dataset.value as "svg" | "png" | "jpeg"),
  );

  bindActionClick("run-export", () => {
    onRunExport();
  });

  bindActionClick("viewport-zoom", (button) => {
    const action = button.dataset.value;
    if (action === "reset") {
      onViewportChange({ zoom: 1, panX: 0, panY: 0 });
      return;
    }
    const currentZoom = state.viewport.zoom || 1;
    const nextZoom =
      action === "in"
        ? Math.min(currentZoom * 1.25, 4)
        : Math.max(currentZoom / 1.25, 0.5);
    onViewportChange({ zoom: nextZoom });
  });

  bindActionClick("toggle-safe-area", () => {
    onViewportChange({ safeAreaEnabled: !state.viewport.safeAreaEnabled });
  });

  bindActionClick("toggle-guides", () => {
    onViewportChange({ guidesEnabled: !state.viewport.guidesEnabled });
  });
}

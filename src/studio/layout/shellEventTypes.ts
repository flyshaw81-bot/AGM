import type {
  GenerationProfileOverrideKey,
  StudioEditorModule,
  StudioLanguage,
  StudioSection,
  StudioState,
  StudioTheme,
} from "../types";
import type {
  EDITOR_CONTROL_LABELS,
  LAYER_CONTROL_LABELS,
  TOPBAR_ACTION_LABELS,
} from "./shellConstants";

export type StudioShellEventHandlers = {
  onSectionChange: (section: StudioSection) => void;
  onEditorModuleChange: (module: StudioEditorModule) => void;
  onViewportChange: (
    patch: Partial<StudioState["viewport"]>,
  ) => void | Promise<void>;
  onStyleChange: (preset: string) => void;
  onExportFormatChange: (format: "svg" | "png" | "jpeg") => void;
  onStyleToggle: (action: "hide-labels" | "rescale-labels") => void;
  onExportSettingChange: (
    setting: "png-resolution" | "tile-cols" | "tile-rows" | "tile-scale",
    value: number,
  ) => void;
  onTopbarAction: (action: keyof typeof TOPBAR_ACTION_LABELS) => void;
  onLayerAction: (action: keyof typeof LAYER_CONTROL_LABELS) => void;
  onLayerPin: (action: string) => void;
  onDataAction: (
    action:
      | "load-browser-snapshot"
      | "save-browser-snapshot"
      | "download-project"
      | "create-generated-world"
      | "open-file"
      | "open-url-source",
  ) => void;
  onProjectAction: (
    action:
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
  ) => void;
  onAgmFileImport: (file: File) => void;
  onRulesPackImport: (file: File) => void;
  onEditorAction: (action: keyof typeof EDITOR_CONTROL_LABELS) => void;
  onDirectStateSelect: (stateId: number) => void;
  onDirectStateApply: (
    stateId: number,
    next: {
      name: string;
      formName: string;
      fullName: string;
      form?: string;
      color?: string;
      culture?: number;
      capital?: number;
      population?: number;
      rural?: number;
      urban?: number;
      neighbors?: number[];
      diplomacy?: string[];
    },
  ) => void;
  onDirectStateReset: (stateId: number) => void;
  onDirectStateListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "stateSearchQuery" | "stateSortMode" | "stateFilterMode"
      >
    >,
  ) => void;
  onDirectBurgSelect: (burgId: number) => void;
  onDirectBurgApply: (
    burgId: number,
    next: {
      name: string;
      type?: string;
      state?: number;
      culture?: number;
      population?: number;
    },
  ) => void;
  onDirectBurgReset: (burgId: number) => void;
  onDirectBurgListChange: (
    patch: Partial<
      Pick<StudioState["directEditor"], "burgSearchQuery" | "burgFilterMode">
    >,
  ) => void;
  onDirectCultureSelect: (cultureId: number) => void;
  onDirectCultureApply: (
    cultureId: number,
    next: { name: string; type?: string; color?: string },
  ) => void;
  onDirectCultureReset: (cultureId: number) => void;
  onDirectCultureListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "cultureSearchQuery" | "cultureFilterMode"
      >
    >,
  ) => void;
  onDirectReligionSelect: (religionId: number) => void;
  onDirectReligionApply: (
    religionId: number,
    next: { name: string; type?: string; color?: string },
  ) => void;
  onDirectReligionReset: (religionId: number) => void;
  onDirectReligionListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "religionSearchQuery" | "religionFilterMode"
      >
    >,
  ) => void;
  onDirectProvinceSelect: (provinceId: number) => void;
  onDirectProvinceApply: (
    provinceId: number,
    next: {
      name: string;
      fullName?: string;
      type?: string;
      state?: number;
      burg?: number;
      color?: string;
    },
  ) => void;
  onDirectProvinceReset: (provinceId: number) => void;
  onDirectProvinceListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "provinceSearchQuery" | "provinceFilterMode"
      >
    >,
  ) => void;
  onDirectRouteSelect: (routeId: number) => void;
  onDirectRouteApply: (
    routeId: number,
    next: { group?: string; feature?: number },
  ) => void;
  onDirectRouteReset: (routeId: number) => void;
  onDirectRouteListChange: (
    patch: Partial<
      Pick<StudioState["directEditor"], "routeSearchQuery" | "routeFilterMode">
    >,
  ) => void;
  onDirectZoneSelect: (zoneId: number) => void;
  onDirectZoneApply: (
    zoneId: number,
    next: { name: string; type?: string; color?: string; hidden?: boolean },
  ) => void;
  onDirectZoneReset: (zoneId: number) => void;
  onDirectZoneListChange: (
    patch: Partial<
      Pick<StudioState["directEditor"], "zoneSearchQuery" | "zoneFilterMode">
    >,
  ) => void;
  onDirectMarkerSelect: (markerId: number) => void;
  onDirectMarkerApply: (
    markerId: number,
    next: {
      type?: string;
      icon?: string;
      size?: number;
      pin?: string;
      fill?: string;
      stroke?: string;
      pinned?: boolean;
      locked?: boolean;
    },
  ) => void;
  onDirectMarkerReset: (markerId: number) => void;
  onDirectMarkerListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "markerSearchQuery" | "markerFilterMode"
      >
    >,
  ) => void;
  onDirectDiplomacySubjectSelect: (stateId: number) => void;
  onDirectDiplomacyObjectSelect: (stateId: number) => void;
  onDirectDiplomacyApply: (
    subjectId: number,
    objectId: number,
    next: { relation: string },
  ) => void;
  onDirectDiplomacyReset: (subjectId: number, objectId: number) => void;
  onDirectDiplomacyListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "diplomacySearchQuery" | "diplomacyFilterMode"
      >
    >,
  ) => void;
  onDirectMilitaryListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "militarySearchQuery" | "militaryFilterMode"
      >
    >,
  ) => void;
  onDirectBiomeSelect: (biomeId: number) => void;
  onDirectBiomeApply: (
    biomeId: number,
    next: {
      habitability?: number;
      agmRuleWeight?: number;
      agmResourceTag?: string;
    },
  ) => void;
  onDirectBiomeReset: (biomeId: number) => void;
  onDirectBiomeListChange: (
    patch: Partial<
      Pick<StudioState["directEditor"], "biomeSearchQuery" | "biomeFilterMode">
    >,
  ) => void;
  onDirectRelationshipQueueHistoryChange: (
    history: StudioState["directEditor"]["relationshipQueueHistory"],
  ) => void;
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
  onBiomeCoverageChange: (biomeId: number, targetPercentage: number) => void;
  onCanvasEditAction: (action: "apply" | "undo", cellId?: number) => void;
  onGeneratorParameterOverride: (
    key: GenerationProfileOverrideKey,
    value: number,
  ) => void;
  onCloseEditor: (action: keyof typeof EDITOR_CONTROL_LABELS) => void;
  onReturnToOrigin: (section: StudioSection) => void;
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
  ) => void;
  onLayersPresetAction: (action: "save" | "remove") => void;
  onRunExport: () => void;
  onLanguageChange: (language: StudioLanguage) => void;
  onThemeChange: (theme: StudioTheme) => void;
  onNavigationCollapseChange: (collapsed: boolean) => void;
};

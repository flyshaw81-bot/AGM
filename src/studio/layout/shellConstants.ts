import type { EditorAction } from "../bridge/engineActionTypes";
import { GAME_WORLD_PROFILE_LABELS } from "../state/worldDocumentConstants";
import type {
  CanvasToolMode,
  FitMode,
  GameWorldProfile,
  StudioLanguage,
  StudioSection,
  StudioTheme,
} from "../types";

export const FIT_MODE_LABELS: Record<
  StudioLanguage,
  Record<FitMode, string>
> = {
  en: {
    contain: "Contain",
    cover: "Cover",
    "actual-size": "Actual size",
  },
  "zh-CN": {
    contain: "适应",
    cover: "填充",
    "actual-size": "原始尺寸",
  },
};

export const LANGUAGE_LABELS: Record<StudioLanguage, string> = {
  en: "EN",
  "zh-CN": "CN",
};

export const STUDIO_THEME_LABELS: Record<
  StudioLanguage,
  Record<StudioTheme, string>
> = {
  en: {
    daylight: "Daylight",
    night: "Night",
  },
  "zh-CN": {
    daylight: "白昼",
    night: "黑夜",
  },
};

export const STUDIO_THEME_ORDER: StudioTheme[] = ["daylight", "night"];

export const STUDIO_THEME_ACCENTS: Record<StudioTheme, string> = {
  daylight: "#111827",
  night: "#e5e7eb",
};

export const SHELL_LABELS = {
  en: {
    preview: "Preview Beta",
    tagline: "Build playable worlds from structured generation.",
    preset: "Preset",
    orientation: "Orientation",
    landscape: "Landscape",
    portrait: "Portrait",
    safeArea: "Safe area",
    guides: "Guides",
    gameProfile: "Game profile",
    editor: "Editor",
    language: "Language",
    theme: "Theme",
    closed: "Closed",
    open: "Open",
  },
  "zh-CN": {
    preview: "预览版 Beta",
    tagline: "用结构化生成打造可玩的世界。",
    preset: "预设",
    orientation: "方向",
    landscape: "横向",
    portrait: "纵向",
    safeArea: "安全区",
    guides: "参考线",
    gameProfile: "游戏类型",
    editor: "编辑器",
    language: "语言",
    theme: "主题",
    closed: "已关闭",
    open: "已打开",
  },
} as const satisfies Record<StudioLanguage, Record<string, string>>;

export const STYLE_PRESET_OPTIONS = [
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

export const EXPORT_FORMAT_LABELS = {
  svg: "SVG",
  png: "PNG",
  jpeg: "JPEG",
};

export const GAME_WORLD_PROFILE_UI_LABELS: Record<
  StudioLanguage,
  Record<GameWorldProfile, string>
> = {
  en: GAME_WORLD_PROFILE_LABELS,
  "zh-CN": {
    rpg: "RPG 世界",
    strategy: "策略战役地图",
    "4x": "4X 文明地图",
    tabletop: "跑团战役地图",
    "open-world": "开放世界区域",
    "city-kingdom-continent": "城市 / 王国 / 大陆模板",
  },
};

export const SECTION_LABELS: Record<
  StudioLanguage,
  Record<StudioSection, string>
> = {
  en: {
    project: "Project Center",
    canvas: "Canvas",
    style: "Style",
    layers: "Layers",
    export: "Export",
    data: "Data",
    editors: "Editors",
    repair: "Repair",
  },
  "zh-CN": {
    project: "项目中心",
    canvas: "画布",
    style: "风格",
    layers: "图层",
    export: "导出",
    data: "数据",
    editors: "编辑器",
    repair: "修复器",
  },
};

export const LAYER_CONTROL_LABELS = {
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

export const LAYER_CONTROL_ZH_LABELS: Record<
  keyof typeof LAYER_CONTROL_LABELS,
  string
> = {
  toggleTexture: "纹理",
  toggleHeight: "高度图",
  toggleBiomes: "生物群系",
  toggleCells: "单元格",
  toggleGrid: "网格",
  toggleCoordinates: "坐标",
  toggleCompass: "风玫瑰",
  toggleRivers: "河流",
  toggleRelief: "地形阴影",
  toggleReligions: "宗教",
  toggleCultures: "文化",
  toggleStates: "国家",
  toggleProvinces: "省份",
  toggleZones: "区域",
  toggleBorders: "边界",
  toggleRoutes: "路线",
  toggleTemperature: "温度",
  togglePopulation: "人口",
  toggleIce: "冰层",
  togglePrecipitation: "降水",
  toggleEmblems: "纹章",
  toggleBurgIcons: "城镇图标",
  toggleLabels: "标签",
  toggleMilitary: "军事",
  toggleMarkers: "标记",
  toggleRulers: "标尺",
  toggleScaleBar: "比例尺",
  toggleVignette: "暗角",
};

export const TOPBAR_ACTION_LABELS = {
  new: "Generate",
  open: "Open",
  save: "Save",
  export: "Export",
} as const;

export const TOPBAR_ACTION_ZH_LABELS: Record<
  keyof typeof TOPBAR_ACTION_LABELS,
  string
> = {
  new: "生成",
  open: "打开",
  save: "保存",
  export: "导出",
};

export const VIEWPORT_PRESET_LABELS: Record<
  StudioLanguage,
  Record<string, string>
> = {
  en: {
    "desktop-landscape": "Desktop 16:10",
    "desktop-portrait": "Desktop Portrait",
    "mobile-portrait": "Mobile Portrait",
    "mobile-landscape": "Mobile Landscape",
    square: "Square",
  },
  "zh-CN": {
    "desktop-landscape": "桌面横屏 16:10",
    "desktop-portrait": "桌面竖屏",
    "mobile-portrait": "移动竖屏",
    "mobile-landscape": "移动横屏",
    square: "正方形",
  },
};

export const EDITOR_CONTROL_LABELS = {
  editStates: "States",
  editCultures: "Cultures",
  editReligions: "Religions",
  editBiomes: "Biomes",
  editProvinces: "Provinces",
  editZones: "Zones",
  editDiplomacy: "Diplomacy",
} as const;

export const EDITOR_CONTROL_ZH_LABELS: Record<
  keyof typeof EDITOR_CONTROL_LABELS,
  string
> = {
  editStates: "国家",
  editCultures: "文化",
  editReligions: "宗教",
  editBiomes: "生物群系",
  editProvinces: "省份",
  editZones: "区域",
  editDiplomacy: "外交",
};

export const SECTION_EDITOR_RECOMMENDATIONS: Partial<
  Record<StudioSection, EditorAction>
> = {
  project: "editBiomes",
  canvas: "editStates",
  layers: "editStates",
  export: "editProvinces",
  data: "editStates",
  editors: "editStates",
  repair: "editStates",
};

export const PRODUCT_NAV_LABELS: Record<
  StudioLanguage,
  Record<StudioSection, { label: string; icon: string; hint: string }>
> = {
  en: {
    project: {
      label: "Projects",
      icon: "scene",
      hint: "Manage projects, drafts, and launch actions",
    },
    canvas: {
      label: "Canvas",
      icon: "canvas",
      hint: "Set the output frame and viewport",
    },
    style: {
      label: "Map Params",
      icon: "sliders",
      hint: "Tune terrain, biomes, labels, and rules",
    },
    layers: { label: "Layers", icon: "layers", hint: "Advanced map overlays" },
    export: {
      label: "Export",
      icon: "export",
      hint: "Save, package, and hand off to engines",
    },
    data: { label: "Data", icon: "database", hint: "Advanced JSON snapshots" },
    editors: {
      label: "Detailed Editors",
      icon: "edit",
      hint: "Edit map elements by type",
    },
    repair: {
      label: "Validate",
      icon: "validate",
      hint: "Check playability and repair relationships",
    },
  },
  "zh-CN": {
    project: {
      label: "项目中心",
      icon: "scene",
      hint: "管理项目、草稿与启动动作",
    },
    canvas: { label: "画布", icon: "canvas", hint: "设置输出画幅与容器" },
    style: {
      label: "地图参数",
      icon: "sliders",
      hint: "调整地形、生物群系、标签和规则",
    },
    layers: { label: "图层", icon: "layers", hint: "高级地图叠加层" },
    export: { label: "导出", icon: "export", hint: "保存、打包并交付给引擎" },
    data: { label: "数据", icon: "database", hint: "高级 JSON 快照" },
    editors: { label: "细分编辑器", icon: "edit", hint: "按类型编辑地图元素" },
    repair: { label: "验证", icon: "validate", hint: "检查可玩性与关联修复" },
  },
};

export const PRODUCT_NAV_PRIMARY_SECTIONS: StudioSection[] = [
  "project",
  "canvas",
  "style",
  "repair",
  "export",
];
export const PRODUCT_NAV_ADVANCED_SECTIONS: StudioSection[] = [
  "layers",
  "data",
  "editors",
];

export const CANVAS_TOOL_LABELS: Record<
  StudioLanguage,
  Record<CanvasToolMode, { label: string; hint: string; icon: string }>
> = {
  en: {
    select: { label: "Select", hint: "Inspect map entities", icon: "cursor" },
    pan: { label: "Pan", hint: "Move the viewport", icon: "hand" },
    brush: { label: "Brush", hint: "Paint map data", icon: "brush" },
    water: { label: "Water", hint: "Review water editing", icon: "drop" },
    terrain: {
      label: "Terrain",
      hint: "Review elevation tools",
      icon: "mountain",
    },
    grid: { label: "Grid", hint: "Show cell guide", icon: "grid" },
    measure: {
      label: "Measure",
      hint: "Measure distance and scale",
      icon: "ruler",
    },
  },
  "zh-CN": {
    select: { label: "选择", hint: "检查地图对象", icon: "cursor" },
    pan: { label: "平移", hint: "移动视口", icon: "hand" },
    brush: { label: "笔刷", hint: "绘制地图数据", icon: "brush" },
    water: { label: "水域", hint: "复查水域编辑", icon: "drop" },
    terrain: { label: "地形", hint: "复查高程工具", icon: "mountain" },
    grid: { label: "网格", hint: "显示单元辅助线", icon: "grid" },
    measure: { label: "测量", hint: "测量距离与尺度", icon: "ruler" },
  },
};

export const CANVAS_TOOL_ORDER: CanvasToolMode[] = [
  "select",
  "pan",
  "brush",
  "water",
  "terrain",
  "grid",
  "measure",
];

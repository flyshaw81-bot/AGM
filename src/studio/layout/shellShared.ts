import lucideIconNodes from "lucide-static/icon-nodes.json";
import type { StudioLanguage, StudioTheme } from "../types";

function studioAssetUrl(path: string) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${base.endsWith("/") ? "" : "/"}${path}`;
}

export function studioThemeLogoUrl(theme: StudioTheme) {
  return studioAssetUrl(
    `agm-brand/themes/${theme}/AGM_STUDIO_app_icon_1024.png`,
  );
}

export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]!,
  );
}

export function t(language: StudioLanguage, zh: string, en: string) {
  return language === "zh-CN" ? zh : en;
}

const STUDIO_ICON_FONT_FAMILY = "lucide";

const STUDIO_ICON_NAMES = new Set([
  "scene",
  "canvas",
  "sliders",
  "layers",
  "export",
  "database",
  "edit",
  "pencil",
  "validate",
  "flag",
  "palette",
  "province",
  "map-pin",
  "pin-dot",
  "star",
  "temple",
  "building-2",
  "route",
  "shield",
  "handshake",
  "book-open",
  "table",
  "hammer",
  "wrench",
  "cursor",
  "hand",
  "brush",
  "drop",
  "mountain",
  "grid",
  "zones",
  "ruler",
  "folder",
  "save",
  "bolt",
  "upload",
  "menu",
  "sidebar",
  "project-center",
  "theme-cycle",
  "language-cycle",
  "sun",
  "moon",
  "home",
  "languages",
  "settings",
  "monitor",
  "rotate-ccw",
  "expand",
  "sparkles",
  "cpu",
  "leaf",
  "waves",
  "grid-3x3",
  "globe",
  "plus",
  "minus",
  "chevron-right",
  "chevron-down",
  "check",
  "x",
  "eye",
  "eye-off",
  "search",
  "download",
  "maximize",
  "image",
  "bar-chart-3",
  "filter",
  "crosshair",
  "compass",
  "thermometer",
  "users",
  "snowflake",
  "cloud-rain",
  "badge",
  "type",
  "scale",
  "circle",
  "pin",
]);

const STUDIO_ICON_FONT_NAMES: Record<string, string> = {
  scene: "sparkles",
  canvas: "monitor",
  sliders: "sliders-horizontal",
  layers: "layers",
  export: "upload",
  database: "database",
  edit: "pencil",
  validate: "circle-check",
  province: "map",
  "pin-dot": "map-pin",
  temple: "landmark",
  table: "table-2",
  cursor: "mouse-pointer",
  drop: "droplet",
  grid: "layout-grid",
  zones: "grid-3x3",
  folder: "folder-open",
  home: "house",
  "project-center": "layout-dashboard",
  "theme-cycle": "sun-moon",
  "language-cycle": "languages",
  sidebar: "panel-left",
  waves: "waves-horizontal",
  image: "image",
  "bar-chart-3": "chart-column",
  filter: "funnel",
  badge: "badge",
  circle: "circle",
  pin: "pin",
};

type LucideIconNode = [
  tag: string,
  attributes: Record<string, string | number | boolean>,
];

const STUDIO_LUCIDE_ICON_NODES = lucideIconNodes as unknown as Record<
  string,
  LucideIconNode[] | undefined
>;

function renderIconFontNodes(nodes: LucideIconNode[] | undefined) {
  if (!nodes) {
    return "";
  }

  return nodes
    .map(([tag, attributes]) => {
      const renderedAttributes = Object.entries(attributes)
        .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
        .join(" ");
      return `<${tag}${renderedAttributes ? ` ${renderedAttributes}` : ""} />`;
    })
    .join("");
}

function renderLucideIconFontGlyph(iconFontName: string) {
  return renderIconFontNodes(STUDIO_LUCIDE_ICON_NODES[iconFontName]);
}

export function studioIcon(name: string, className = "studio-icon") {
  const iconName = STUDIO_ICON_NAMES.has(name) ? name : "scene";
  const iconFontName = STUDIO_ICON_FONT_NAMES[iconName] || iconName;
  const paths =
    renderLucideIconFontGlyph(iconFontName) ||
    renderLucideIconFontGlyph(STUDIO_ICON_FONT_NAMES.scene);
  return `<svg class="${className}" data-studio-icon="${escapeHtml(iconName)}" data-studio-icon-font="${STUDIO_ICON_FONT_FAMILY}" data-studio-icon-name="${escapeHtml(iconFontName)}" data-studio-icon-set="pencil-lucide-icon-font" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export function studioMaterialSymbolIcon(
  iconFontName: string,
  className = "studio-material-symbol-icon",
) {
  const glyph = escapeHtml(iconFontName);
  return `<span class="${className}" data-studio-icon="${glyph}" data-studio-icon-font="Material Symbols Outlined" data-studio-icon-name="${glyph}" data-studio-icon-set="pencil-material-symbols-outlined" aria-hidden="true">${glyph}</span>`;
}

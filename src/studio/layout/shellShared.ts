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

const STUDIO_ICON_SVGS: Record<string, string> = {
  scene: `<path d="M12 3.75l2.25 4.55 5.02.73-3.63 3.54.86 5-4.5-2.36-4.5 2.36.86-5-3.63-3.54 5.02-.73L12 3.75z" />`,
  canvas: `<rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M8 9h8M8 13h5" />`,
  sliders: `<path d="M5 7h14M5 12h14M5 17h14" /><circle cx="9" cy="7" r="1.8" /><circle cx="15" cy="12" r="1.8" /><circle cx="11" cy="17" r="1.8" />`,
  layers: `<path d="M12 4l8 4-8 4-8-4 8-4z" /><path d="M4 12l8 4 8-4M4 16l8 4 8-4" />`,
  export: `<path d="M12 4v10" /><path d="M8.5 7.5L12 4l3.5 3.5" /><path d="M5 13v5h14v-5" />`,
  database: `<ellipse cx="12" cy="6" rx="6.5" ry="2.5" /><path d="M5.5 6v6c0 1.38 2.91 2.5 6.5 2.5s6.5-1.12 6.5-2.5V6" /><path d="M5.5 12v5c0 1.38 2.91 2.5 6.5 2.5s6.5-1.12 6.5-2.5v-5" />`,
  edit: `<path d="M5 19l3.5-.8L18.2 8.5a2.1 2.1 0 0 0-3-3L5.5 15.2 5 19z" /><path d="M13.8 6.9l3.3 3.3" />`,
  validate: `<path d="M20 11.2V12a8 8 0 1 1-4.7-7.3" /><path d="M8.7 11.8l2.4 2.4L20 5.4" />`,
  cursor: `<path d="M6 4l11 8-5.1 1.2 3.2 5.8-2.6 1.4-3.1-5.8L6 19V4z" />`,
  hand: `<path d="M8 12V7.8a1.25 1.25 0 0 1 2.5 0V12" /><path d="M10.5 11V6.5a1.25 1.25 0 0 1 2.5 0V12" /><path d="M13 11V7.5a1.25 1.25 0 0 1 2.5 0V13" /><path d="M15.5 12V10a1.2 1.2 0 0 1 2.4 0v3.5c0 4-2.2 6.5-6 6.5H11c-2.7 0-4.2-1.4-5.4-3.8L4.6 14a1.25 1.25 0 0 1 2.2-1.2L8 15" />`,
  brush: `<path d="M15.5 4.5l4 4-8 8-4-4 8-8z" /><path d="M7.5 12.5l-1.4 1.4c-1.2 1.2-.7 3.4-2.6 4.6 2.7.4 4.5-.5 5.1-2.1l.9-1.9" />`,
  drop: `<path d="M12 3.8s5.5 6.1 5.5 10.3A5.5 5.5 0 0 1 6.5 14.1C6.5 9.9 12 3.8 12 3.8z" />`,
  mountain: `<path d="M4 18l5.2-9 3.4 5.1L15 10l5 8H4z" /><path d="M8.6 14.8h6.9" />`,
  grid: `<rect x="5" y="5" width="14" height="14" rx="1.5" /><path d="M9.7 5v14M14.3 5v14M5 9.7h14M5 14.3h14" />`,
  ruler: `<path d="M5 17.5L17.5 5l1.5 1.5L6.5 19 5 17.5z" /><path d="M8.2 14.3l1.3 1.3M10.9 11.6l1.3 1.3M13.6 8.9l1.3 1.3" />`,
  folder: `<path d="M4 7.5h6l1.7 2H20v8.5H4V7.5z" />`,
  save: `<path d="M5 5h11l3 3v11H5V5z" /><path d="M8 5v5h7V5" /><path d="M8 19v-6h8v6" />`,
  bolt: `<path d="M13 3L5.8 13h5.4L10 21l7.2-10h-5.4L13 3z" />`,
  upload: `<path d="M12 16V5" /><path d="M8.5 8.5L12 5l3.5 3.5" /><path d="M5 15v4h14v-4" />`,
  sidebar: `<rect x="4" y="5" width="16" height="14" rx="2" /><path d="M9 5v14" /><path d="M13.5 9l2.5 3-2.5 3" />`,
  sun: `<circle cx="12" cy="12" r="4" /><path d="M12 2.8v2M12 19.2v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.8 12h2M19.2 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />`,
  moon: `<path d="M20.2 14.4A7.4 7.4 0 0 1 9.6 3.8a8.2 8.2 0 1 0 10.6 10.6z" />`,
};

export function studioIcon(name: string, className = "studio-icon") {
  const paths = STUDIO_ICON_SVGS[name] || STUDIO_ICON_SVGS.scene;
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
}

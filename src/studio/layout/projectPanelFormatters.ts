import { GAME_WORLD_PROFILE_LABELS } from "../state/worldDocumentConstants";
import type { GameWorldProfile, StudioLanguage, StudioState } from "../types";
import { GAME_WORLD_PROFILE_UI_LABELS } from "./shellConstants";
import { t } from "./shellShared";

export function localizeProjectSourceDisplayValue(
  value: string,
  language: StudioLanguage,
) {
  if (value === "AGM Core" || value === "Core")
    return language === "zh-CN" ? "AGM 核心" : "AGM Core";
  return value;
}

export function gameProfileOption(
  value: GameWorldProfile,
  current: GameWorldProfile,
  language: StudioLanguage,
) {
  return `<option value="${value}"${value === current ? " selected" : ""}>${GAME_WORLD_PROFILE_UI_LABELS[language][value]}</option>`;
}

export function renderGameProfileOptions(
  current: GameWorldProfile,
  language: StudioLanguage,
) {
  return Object.keys(GAME_WORLD_PROFILE_LABELS)
    .map((value) =>
      gameProfileOption(value as GameWorldProfile, current, language),
    )
    .join("");
}

export function formatProjectCenterTime(
  value: number | null,
  language: StudioLanguage,
) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(language === "zh-CN" ? "zh-CN" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getProjectStatusLabel(
  status: StudioState["projectCenter"]["recentProjects"][number]["status"],
  language: StudioLanguage,
) {
  const labels = {
    draft: t(language, "草稿", "Draft"),
    dirty: t(language, "未保存", "Unsaved"),
    validated: t(language, "已验证", "Validated"),
    "export-ready": t(language, "可交付", "Export ready"),
  };
  return labels[status];
}

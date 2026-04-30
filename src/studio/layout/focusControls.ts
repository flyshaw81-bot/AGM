import type { StudioLanguage, StudioState } from "../types";
import { escapeHtml, t } from "./shellShared";

export function getTargetTypeLabel(
  targetType: NonNullable<StudioState["balanceFocus"]>["targetType"],
  language: StudioLanguage,
) {
  const labels: Record<
    NonNullable<StudioState["balanceFocus"]>["targetType"],
    string
  > = {
    biome: t(language, "生物群系", "biome"),
    burg: t(language, "城镇", "burg"),
    culture: t(language, "文化", "culture"),
    province: t(language, "省份", "province"),
    religion: t(language, "宗教", "religion"),
    route: t(language, "路线", "route"),
    state: t(language, "国家", "state"),
    zone: t(language, "区域", "zone"),
  };
  return labels[targetType];
}

export function renderFocusButton(
  targetType: NonNullable<StudioState["balanceFocus"]>["targetType"],
  targetId: number | undefined,
  sourceLabel: string,
  action: NonNullable<StudioState["balanceFocus"]>["action"] = "focus",
  language: StudioLanguage = "en",
) {
  if (targetId === undefined) return "";
  const label =
    action === "fix"
      ? t(language, "修复", "Fix")
      : action === "adjust"
        ? t(language, "调整", "Adjust")
        : t(language, "聚焦", "Focus");
  return `<button class="studio-ghost" data-studio-action="balance-focus" data-target-type="${targetType}" data-target-id="${targetId}" data-source-label="${escapeHtml(sourceLabel)}" data-focus-action="${action}">${label} ${getTargetTypeLabel(targetType, language)} ${targetId}</button>`;
}

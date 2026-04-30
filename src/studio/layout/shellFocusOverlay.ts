import type { StudioLanguage, StudioState } from "../types";
import { getTargetTypeLabel } from "./focusControls";
import { localizeGeneratedText } from "./generatedText";
import { escapeHtml, t } from "./shellShared";

export function renderFocusOverlay(
  focus: StudioState["balanceFocus"],
  language: StudioLanguage,
) {
  if (!focus) return "";
  if (focus.sourceLabel === "canvas-select-tool") return "";

  const hasGeometry = focus.x !== undefined && focus.y !== undefined;
  const action = focus.action || "focus";
  const actionLabel =
    action === "fix"
      ? t(language, "AGM 修复候选", "AGM fix candidate")
      : action === "adjust"
        ? t(language, "AGM 调整目标", "AGM adjustment target")
        : t(language, "AGM 聚焦", "AGM focus");
  const positionStyle = hasGeometry
    ? ` style="left: ${focus.x}%; top: ${focus.y}%;"`
    : "";
  const geometryLabel = hasGeometry
    ? ` · ${focus.x!.toFixed(1)}%, ${focus.y!.toFixed(1)}%`
    : ` · ${t(language, "几何位置待定", "geometry pending")}`;

  return `
    <div id="studioBalanceFocusOverlay" class="studio-balance-focus-overlay${hasGeometry ? " is-positioned" : ""} is-${action}" data-target-type="${focus.targetType}" data-target-id="${focus.targetId}" data-focus-action="${action}" data-focus-x="${focus.x ?? ""}" data-focus-y="${focus.y ?? ""}"${positionStyle}>
      <div class="studio-balance-focus-overlay__ring"></div>
      <div class="studio-balance-focus-overlay__outline"></div>
      <div class="studio-balance-focus-overlay__label">${actionLabel} · ${getTargetTypeLabel(focus.targetType, language)} ${focus.targetId}${geometryLabel} · ${escapeHtml(localizeGeneratedText(focus.sourceLabel, language))}</div>
    </div>
  `;
}

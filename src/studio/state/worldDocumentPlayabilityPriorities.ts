import type { GameWorldProfile } from "../types";
import type { BalanceHint, WorldRulesDraft } from "./worldDocumentDraftTypes";
import { getProfilePriority } from "./worldDocumentProfilePriorities";

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function profileTargetForHintCategory(
  category: BalanceHint["category"],
): WorldRulesDraft["profileRules"]["priorities"][number]["target"] {
  return category;
}

export function getProfilePriorityForHint(
  profile: GameWorldProfile,
  category: BalanceHint["category"],
) {
  return getProfilePriority(profile, profileTargetForHintCategory(category));
}

import type { GameWorldProfile } from "../types";

export const AGM_DRAFT_STORAGE_KEY = "agm.documentDraft";

export const GAME_WORLD_PROFILE_LABELS: Record<GameWorldProfile, string> = {
  rpg: "RPG world",
  strategy: "Strategy campaign map",
  "4x": "4X civilization map",
  tabletop: "Tabletop campaign map",
  "open-world": "Open world region",
  "city-kingdom-continent": "City / kingdom / continent template",
};

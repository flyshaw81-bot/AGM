import type { GameWorldProfile } from "../types";
import type { WorldRulesDraft } from "./worldDocumentDraftTypes";

export function createProfilePriorities(
  profile: GameWorldProfile,
): WorldRulesDraft["profileRules"]["priorities"] {
  const priorities: Record<
    GameWorldProfile,
    WorldRulesDraft["profileRules"]["priorities"]
  > = {
    rpg: [
      {
        id: "quest-route-connectivity",
        label: "Quest route readability",
        weight: 1.3,
        target: "connectivity",
      },
      {
        id: "settlement-hubs",
        label: "Settlement hub support",
        weight: 1.2,
        target: "settlement",
      },
      {
        id: "biome-variety",
        label: "Adventure biome variety",
        weight: 1.1,
        target: "habitability",
      },
    ],
    strategy: [
      {
        id: "balanced-starts",
        label: "Balanced strategic starts",
        weight: 1.35,
        target: "spawn",
      },
      {
        id: "route-chokepoints",
        label: "Route and chokepoint control",
        weight: 1.25,
        target: "connectivity",
      },
      {
        id: "settlement-logistics",
        label: "Settlement logistics density",
        weight: 1.2,
        target: "settlement",
      },
      {
        id: "terrain-friction",
        label: "Strategic terrain friction",
        weight: 1.18,
        target: "habitability",
      },
      {
        id: "resource-contest",
        label: "Contestable resource coverage",
        weight: 1.15,
        target: "resource",
      },
    ],
    "4x": [
      {
        id: "fair-expansion",
        label: "Fair expansion regions",
        weight: 1.4,
        target: "spawn",
      },
      {
        id: "resource-progression",
        label: "Resource progression bands",
        weight: 1.3,
        target: "resource",
      },
      {
        id: "movement-friction",
        label: "Exploration movement friction",
        weight: 1.1,
        target: "habitability",
      },
    ],
    tabletop: [
      {
        id: "region-legibility",
        label: "Readable campaign regions",
        weight: 1.3,
        target: "settlement",
      },
      {
        id: "travel-links",
        label: "Travel link prompts",
        weight: 1.2,
        target: "connectivity",
      },
      {
        id: "danger-zones",
        label: "Memorable danger zones",
        weight: 1.1,
        target: "resource",
      },
    ],
    "open-world": [
      {
        id: "exploration-loops",
        label: "Exploration loop support",
        weight: 1.35,
        target: "connectivity",
      },
      {
        id: "landmark-biomes",
        label: "Landmark biome contrast",
        weight: 1.25,
        target: "habitability",
      },
      {
        id: "distributed-support",
        label: "Distributed settlement support",
        weight: 1.1,
        target: "settlement",
      },
    ],
    "city-kingdom-continent": [
      {
        id: "scale-fit",
        label: "City / kingdom / continent scale fit",
        weight: 1.35,
        target: "settlement",
      },
      {
        id: "political-starts",
        label: "Political start anchors",
        weight: 1.2,
        target: "spawn",
      },
      {
        id: "connector-coverage",
        label: "Connector coverage",
        weight: 1.15,
        target: "connectivity",
      },
    ],
  };

  return priorities[profile];
}

export function getProfilePriority(
  profile: GameWorldProfile,
  target: WorldRulesDraft["profileRules"]["priorities"][number]["target"],
) {
  return createProfilePriorities(profile).find(
    (priority) => priority.target === target,
  );
}

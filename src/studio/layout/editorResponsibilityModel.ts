export type DirectEditorResponsibilityScope =
  | "owned"
  | "related"
  | "readonly"
  | "advanced";

export type DirectEditorResponsibilityField = {
  id: string;
  label: string;
  scope: DirectEditorResponsibilityScope;
};

export type DirectEditorResponsibility = {
  module: string;
  ownerSummary: string;
  fields: DirectEditorResponsibilityField[];
};

const EDITOR_RESPONSIBILITIES = {
  states: {
    module: "states",
    ownerSummary:
      "Owns state identity, display color, governance, and aggregate population. Related domain data is exposed as linked assignments and visible relationship fields.",
    fields: [
      { id: "name", label: "Short name", scope: "owned" },
      { id: "fullName", label: "Full name", scope: "owned" },
      { id: "form", label: "Form category", scope: "owned" },
      { id: "formName", label: "Form name", scope: "owned" },
      { id: "color", label: "Color", scope: "owned" },
      { id: "population", label: "Population", scope: "owned" },
      { id: "rural", label: "Rural population", scope: "owned" },
      { id: "urban", label: "Urban population", scope: "owned" },
      { id: "culture", label: "Culture assignment", scope: "related" },
      { id: "capital", label: "Capital town", scope: "related" },
      { id: "burgs", label: "State towns", scope: "related" },
      { id: "provinces", label: "State provinces", scope: "related" },
      { id: "diplomacy", label: "Diplomacy", scope: "related" },
      { id: "neighbors", label: "Neighbor IDs", scope: "related" },
      { id: "id", label: "State ID", scope: "readonly" },
      { id: "cells", label: "Cells", scope: "readonly" },
      { id: "area", label: "Area", scope: "readonly" },
      { id: "diplomacyRecords", label: "Diplomacy records", scope: "readonly" },
    ],
  },
  burgs: {
    module: "burgs",
    ownerSummary:
      "Owns settlement identity, assignment, type, and population. State and culture are assignments, not full state or culture editors.",
    fields: [
      { id: "name", label: "Name", scope: "owned" },
      { id: "type", label: "Type", scope: "owned" },
      { id: "population", label: "Population", scope: "owned" },
      { id: "state", label: "State assignment", scope: "related" },
      { id: "culture", label: "Culture assignment", scope: "related" },
      { id: "id", label: "Burg ID", scope: "readonly" },
      { id: "cells", label: "Cells", scope: "readonly" },
    ],
  },
  provinces: {
    module: "provinces",
    ownerSummary:
      "Owns administrative geography, display identity, state assignment, linked burg, and color.",
    fields: [
      { id: "name", label: "Name", scope: "owned" },
      { id: "fullName", label: "Full name", scope: "owned" },
      { id: "type", label: "Type", scope: "owned" },
      { id: "color", label: "Color", scope: "owned" },
      { id: "state", label: "State assignment", scope: "related" },
      { id: "burg", label: "Linked burg", scope: "related" },
      { id: "id", label: "Province ID", scope: "readonly" },
      { id: "center", label: "Center cell", scope: "readonly" },
    ],
  },
  cultures: {
    module: "cultures",
    ownerSummary:
      "Owns cultural identity and presentation. States and burgs reference cultures, but are edited in their own workbenches.",
    fields: [
      { id: "name", label: "Name", scope: "owned" },
      { id: "form", label: "Form", scope: "owned" },
      { id: "color", label: "Color", scope: "owned" },
      { id: "id", label: "Culture ID", scope: "readonly" },
      { id: "cells", label: "Cells", scope: "readonly" },
      { id: "area", label: "Area", scope: "readonly" },
      { id: "center", label: "Center", scope: "readonly" },
    ],
  },
  religions: {
    module: "religions",
    ownerSummary:
      "Owns religious identity and presentation. Distribution is summarized here, while states and regions remain separate editors.",
    fields: [
      { id: "name", label: "Name", scope: "owned" },
      { id: "form", label: "Form", scope: "owned" },
      { id: "color", label: "Color", scope: "owned" },
      { id: "id", label: "Religion ID", scope: "readonly" },
      { id: "cells", label: "Cells", scope: "readonly" },
      { id: "area", label: "Area", scope: "readonly" },
      { id: "center", label: "Center", scope: "readonly" },
    ],
  },
  diplomacy: {
    module: "diplomacy",
    ownerSummary:
      "Owns state-to-state relation values. State identity remains in the state editor.",
    fields: [
      { id: "relation", label: "Relation", scope: "owned" },
      { id: "subject", label: "Subject state", scope: "related" },
      { id: "object", label: "Object state", scope: "related" },
      { id: "pair", label: "Relation pair", scope: "readonly" },
    ],
  },
  routes: {
    module: "routes",
    ownerSummary:
      "Owns route classification and feature assignment. Path geometry remains engine-generated technical data.",
    fields: [
      { id: "group", label: "Route group", scope: "owned" },
      { id: "feature", label: "Feature assignment", scope: "owned" },
      { id: "id", label: "Route ID", scope: "readonly" },
      { id: "pointCount", label: "Points", scope: "readonly" },
      { id: "startCell", label: "Start cell", scope: "readonly" },
    ],
  },
  zones: {
    module: "zones",
    ownerSummary:
      "Owns zone identity, category, color, and visibility. Area and population remain derived map metrics.",
    fields: [
      { id: "name", label: "Name", scope: "owned" },
      { id: "type", label: "Type", scope: "owned" },
      { id: "color", label: "Color", scope: "owned" },
      { id: "hidden", label: "Visibility", scope: "owned" },
      { id: "id", label: "Zone ID", scope: "readonly" },
      { id: "cellCount", label: "Cells", scope: "readonly" },
      { id: "area", label: "Area", scope: "readonly" },
      { id: "population", label: "Population weight", scope: "readonly" },
    ],
  },
  markers: {
    module: "markers",
    ownerSummary:
      "Owns marker presentation and generation locks. Map position is surfaced as technical placement data.",
    fields: [
      { id: "type", label: "Type", scope: "owned" },
      { id: "icon", label: "Icon", scope: "owned" },
      { id: "size", label: "Size", scope: "owned" },
      { id: "pin", label: "Pin shape", scope: "owned" },
      { id: "fill", label: "Fill", scope: "owned" },
      { id: "stroke", label: "Stroke", scope: "owned" },
      { id: "pinned", label: "Pinned", scope: "owned" },
      { id: "locked", label: "Locked", scope: "owned" },
      { id: "id", label: "Marker ID", scope: "readonly" },
      { id: "cell", label: "Cell", scope: "readonly" },
      { id: "coordinates", label: "Coordinates", scope: "readonly" },
      { id: "iconPx", label: "Icon px", scope: "readonly" },
    ],
  },
  biomes: {
    module: "biomes",
    ownerSummary:
      "Owns AGM resource semantics for biomes. Movement cost and icon density stay engine reference data.",
    fields: [
      { id: "habitability", label: "Habitability", scope: "owned" },
      { id: "agmRuleWeight", label: "Rule weight", scope: "owned" },
      { id: "agmResourceTag", label: "Resource tag", scope: "owned" },
      { id: "id", label: "Biome ID", scope: "readonly" },
      { id: "movementCost", label: "Movement cost", scope: "readonly" },
      { id: "iconDensity", label: "Icon density", scope: "readonly" },
    ],
  },
} as const satisfies Record<string, DirectEditorResponsibility>;

export type DirectEditorResponsibilityModule =
  keyof typeof EDITOR_RESPONSIBILITIES;

export function getDirectEditorResponsibility(
  module: DirectEditorResponsibilityModule,
) {
  return EDITOR_RESPONSIBILITIES[module];
}

export function getDirectEditorFieldsByScope(
  module: DirectEditorResponsibilityModule,
  scope: DirectEditorResponsibilityScope,
) {
  return getDirectEditorResponsibility(module).fields.filter(
    (field) => field.scope === scope,
  );
}

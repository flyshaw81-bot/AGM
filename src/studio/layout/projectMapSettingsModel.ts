export type ProjectMapWindTierKey =
  | "pendingWindTier0"
  | "pendingWindTier1"
  | "pendingWindTier2"
  | "pendingWindTier3"
  | "pendingWindTier4"
  | "pendingWindTier5";

export const PROJECT_MAP_EMPTY_VALUE = "-";

export const PROJECT_MAP_WIND_TIER_SETTINGS = [
  {
    fallback: "225",
    index: 0,
    inputId: "studioProjectWindTier0Input",
    setting: "wind-tier-0",
    summaryKey: "pendingWindTier0",
  },
  {
    fallback: "45",
    index: 1,
    inputId: "studioProjectWindTier1Input",
    setting: "wind-tier-1",
    summaryKey: "pendingWindTier1",
  },
  {
    fallback: "225",
    index: 2,
    inputId: "studioProjectWindTier2Input",
    setting: "wind-tier-2",
    summaryKey: "pendingWindTier2",
  },
  {
    fallback: "315",
    index: 3,
    inputId: "studioProjectWindTier3Input",
    setting: "wind-tier-3",
    summaryKey: "pendingWindTier3",
  },
  {
    fallback: "135",
    index: 4,
    inputId: "studioProjectWindTier4Input",
    setting: "wind-tier-4",
    summaryKey: "pendingWindTier4",
  },
  {
    fallback: "315",
    index: 5,
    inputId: "studioProjectWindTier5Input",
    setting: "wind-tier-5",
    summaryKey: "pendingWindTier5",
  },
] satisfies readonly {
  fallback: string;
  index: number;
  inputId: string;
  setting: `wind-tier-${number}`;
  summaryKey: ProjectMapWindTierKey;
}[];

export function formatProjectTemperature(celsius: string, fahrenheit: string) {
  if (!celsius) return PROJECT_MAP_EMPTY_VALUE;
  return `${celsius}°C${fahrenheit ? ` / ${fahrenheit}` : ""}`;
}

export function formatProjectPercent(value: string) {
  return value ? `${value}%` : PROJECT_MAP_EMPTY_VALUE;
}

export function formatProjectWind(value: string) {
  return value ? `${value}°` : PROJECT_MAP_EMPTY_VALUE;
}

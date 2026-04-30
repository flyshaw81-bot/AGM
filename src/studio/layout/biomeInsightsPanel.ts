import { getEngineWorldResourceSummary } from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import { escapeHtml, t } from "./shellShared";

type BiomeDistributionItem = {
  id: number | "other";
  name: string;
  color: string;
  count: number;
  percentage: number;
};

function localizeBiomeName(name: string, language: StudioLanguage) {
  const biomeNumberMatch = /^Biome #(\d+)$/u.exec(name);
  if (biomeNumberMatch)
    return t(language, `生物群系 #${biomeNumberMatch[1]}`, name);
  switch (name) {
    case "Marine":
      return t(language, "海洋", name);
    case "Hot desert":
      return t(language, "炎热沙漠", name);
    case "Cold desert":
      return t(language, "寒冷沙漠", name);
    case "Savanna":
      return t(language, "稀树草原", name);
    case "Grassland":
      return t(language, "草原", name);
    case "Steppe":
      return t(language, "干草原", name);
    case "Forest":
      return t(language, "森林", name);
    case "Desert":
      return t(language, "沙漠", name);
    case "Highland":
      return t(language, "高地", name);
    case "Tropical rainforest":
      return t(language, "热带雨林", name);
    case "Temperate deciduous forest":
      return t(language, "温带落叶林", name);
    case "Temperate rainforest":
      return t(language, "温带雨林", name);
    case "Taiga":
      return t(language, "针叶林", name);
    case "Tundra":
      return t(language, "苔原", name);
    case "Glacier":
      return t(language, "冰川", name);
    case "Wetland":
      return t(language, "湿地", name);
    case "Other":
      return t(language, "其他", name);
    default:
      return name;
  }
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function donutSegmentPath(
  startAngle: number,
  endAngle: number,
  outerRadius = 50,
  innerRadius = 23,
) {
  const center = 56;
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  const outerStart = polarToCartesian(center, center, outerRadius, startAngle);
  const outerEnd = polarToCartesian(center, center, outerRadius, endAngle);
  const innerStart = polarToCartesian(center, center, innerRadius, startAngle);
  const innerEnd = polarToCartesian(center, center, innerRadius, endAngle);
  return [
    `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
    `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

function getBiomeDistributionItems(): BiomeDistributionItem[] {
  const worldResources = getEngineWorldResourceSummary();
  const biomeMap = new Map(
    worldResources.biomes.map((biome) => [biome.id, biome]),
  );
  const pack = (
    globalThis as { pack?: { cells?: { biome?: ArrayLike<number> } } }
  ).pack;
  const cells = pack?.cells?.biome ? Array.from(pack.cells.biome) : [];
  const counts = cells.reduce((next, biomeId) => {
    if (!Number.isFinite(biomeId) || biomeId < 0) return next;
    next.set(biomeId, (next.get(biomeId) || 0) + 1);
    return next;
  }, new Map<number, number>());
  const total = Array.from(counts.values()).reduce(
    (sum, count) => sum + count,
    0,
  );
  if (!total) return [];

  const ranked = Array.from(counts.entries())
    .map(([id, count]) => {
      const biome = biomeMap.get(id);
      return {
        id,
        name: biome?.name || `Biome #${id}`,
        color: biome?.color || "#8dc0ff",
        count,
        percentage: (count / total) * 100,
      };
    })
    .sort((a, b) => b.count - a.count);

  if (ranked.length <= 6) return ranked;

  const visible = ranked.slice(0, 5);
  const otherCount = ranked.slice(5).reduce((sum, item) => sum + item.count, 0);
  return [
    ...visible,
    {
      id: "other",
      name: "Other",
      color: "#7f8aa3",
      count: otherCount,
      percentage: (otherCount / total) * 100,
    },
  ];
}

export function renderBiomeDistributionInsights(
  language: StudioLanguage,
  activeBiomeId: number | string | null,
) {
  const items = getBiomeDistributionItems();
  const title = t(language, "生物群系", "Biomes");
  const activeBiomeKey = activeBiomeId === null ? null : String(activeBiomeId);
  const selectedItem =
    activeBiomeKey === null
      ? null
      : items.find((item) => String(item.id) === activeBiomeKey) || null;
  if (!items.length) {
    return `
      <section class="studio-biome-insights" data-studio-biome-insights="true" data-biome-count="0">
        <div class="studio-biome-insights__header"><strong>${title}</strong><span>⌃</span></div>
        <p>${t(language, "生成地图后会显示生物群系占比。", "Biome coverage appears after a map is generated.")}</p>
      </section>
    `;
  }

  let cursor = 0;
  const slices = items
    .map((item) => {
      const start = cursor;
      cursor += (item.percentage / 100) * 360;
      const label = localizeBiomeName(item.name, language);
      const id = String(item.id);
      const active = String(item.id) === activeBiomeKey;
      return `<path class="studio-biome-insights__slice" data-biome-id="${escapeHtml(id)}" data-biome-label="${escapeHtml(label)}" data-biome-percentage="${item.percentage.toFixed(1)}"${active ? ` data-biome-active="true"` : ""} d="${donutSegmentPath(start, cursor)}" fill="${escapeHtml(item.color)}" tabindex="0" role="button" aria-label="${escapeHtml(`${label} ${item.percentage.toFixed(1)}%`)}"></path>`;
    })
    .join("");

  const editors = items
    .filter((item) => item.id !== "other")
    .map((item) => {
      const label = localizeBiomeName(item.name, language);
      const active = String(item.id) === activeBiomeKey;
      return `<div class="studio-biome-insights__control" data-biome-control-id="${escapeHtml(String(item.id))}"${active ? "" : ` hidden`} style="--biome-color: ${escapeHtml(item.color)}"><div class="studio-biome-insights__control-head"><strong>${escapeHtml(label)}</strong><span>${item.percentage.toFixed(1)}%</span></div><label><span>${t(language, "目标占比", "Target coverage")}</span><input type="range" min="1" max="80" step="1" value="${Math.round(item.percentage)}" data-studio-action="biome-coverage-slider" data-biome-id="${item.id}" /></label><p>${t(language, "调整目标值后会重新分配地图单元。复杂控制会进入高级生态规则。", "Adjusting the target reallocates map cells. Advanced controls belong in biome rules.")}</p></div>`;
    })
    .join("");

  return `
    <section class="studio-biome-insights" data-studio-biome-insights="true" data-biome-count="${items.length}"${selectedItem ? ` data-active-biome-id="${escapeHtml(String(selectedItem.id))}"` : ""}>
      <div class="studio-biome-insights__header"><strong>${title}</strong><span>⌃</span></div>
      <div class="studio-biome-insights__body">
        <div class="studio-biome-insights__legend">
          ${items
            .map((item) => {
              const label = localizeBiomeName(item.name, language);
              const active = String(item.id) === activeBiomeKey;
              return `<button class="studio-biome-insights__row" data-biome-id="${escapeHtml(String(item.id))}" data-biome-percentage="${item.percentage.toFixed(1)}"${active ? ` data-biome-active="true"` : ""} style="--biome-color: ${escapeHtml(item.color)}" type="button"><span class="studio-biome-insights__swatch" style="--biome-color: ${escapeHtml(item.color)}"></span><strong>${escapeHtml(label)}</strong><em>${item.percentage.toFixed(1)}%</em></button>`;
            })
            .join("")}
        </div>
        <div class="studio-biome-insights__donut" role="img" aria-label="${escapeHtml(title)}">
          <svg viewBox="0 0 112 112" aria-hidden="true">
            <g>${slices}</g>
            <circle class="studio-biome-insights__hole" cx="56" cy="56" r="23"></circle>
          </svg>
        </div>
        <div class="studio-biome-insights__editors">
          ${editors}
        </div>
      </div>
      <p class="studio-biome-insights__hint"${selectedItem ? " hidden" : ""}>${t(language, "点击一个分区后可用拉条调整它在地图中的占比。", "Select a segment to adjust its map coverage with a slider.")}</p>
    </section>
  `;
}

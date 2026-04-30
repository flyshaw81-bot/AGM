import { afterEach, describe, expect, it, vi } from "vitest";
import { renderBiomeDistributionInsights } from "./biomeInsightsPanel";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("biome distribution insights", () => {
  it("renders data-driven donut percentages from legacy biome cells", () => {
    vi.stubGlobal("biomesData", {
      i: [0, 1, 2],
      name: ["Marine", "Grassland", "Forest"],
      color: ["#2f6db8", "#8da85a", "#4f7d4a"],
      habitability: [0, 60, 80],
      cost: [10, 4, 6],
      iconsDensity: [0, 2, 3],
    });
    vi.stubGlobal("pack", {
      cells: {
        biome: [0, 1, 1, 2, 2, 2],
      },
    });

    const html = renderBiomeDistributionInsights("zh-CN", 2);

    expect(html).toContain("森林");
    expect(html).toContain('data-biome-percentage="50.0"');
    expect(html).toContain('data-biome-percentage="33.3"');
    expect(html).toContain('data-biome-percentage="16.7"');
    expect(html).toContain('data-biome-active="true"');
    expect(html).toContain('data-studio-action="biome-coverage-slider"');
  });
});

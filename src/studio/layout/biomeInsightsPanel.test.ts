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
    expect(html).not.toContain("<span>⌃</span>");
    expect(html).not.toContain('studio-biome-insights__close"');
  });

  it("defaults to the largest editable biome when no active biome is selected", () => {
    vi.stubGlobal("biomesData", {
      i: [0, 1, 2, 3, 4, 5, 6],
      name: [
        "Marine",
        "Grassland",
        "Forest",
        "Desert",
        "Tundra",
        "Wetland",
        "Steppe",
      ],
      color: [
        "#2f6db8",
        "#8da85a",
        "#4f7d4a",
        "#d4a45f",
        "#b7c9d6",
        "#5aa6a0",
        "#b9a15f",
      ],
      habitability: [0, 60, 80, 20, 10, 70, 50],
      cost: [10, 4, 6, 8, 9, 5, 4],
      iconsDensity: [0, 2, 3, 1, 1, 2, 1],
    });
    vi.stubGlobal("pack", {
      cells: {
        biome: [0, 1, 1, 2, 2, 2],
      },
    });

    const html = renderBiomeDistributionInsights("en", null, {
      closeAction: true,
    });

    expect(html).toContain('data-active-biome-id="2"');
    expect(html).toContain('data-biome-count="6"');
    expect(html).toContain("0.0%");
    expect(html).toContain('data-biome-control-id="2"');
    expect(html).toContain('data-studio-action="canvas-tool"');
    expect(html).toContain('data-value="select"');
    expect(html).toContain("Close biome adjustment");
  });

  it("can render the v8 atlas palette without changing source map colors", () => {
    vi.stubGlobal("biomesData", {
      i: [0, 1],
      name: ["Marine", "Hot desert"],
      color: ["#2f6db8", "#ffd166"],
      habitability: [0, 20],
      cost: [10, 8],
      iconsDensity: [0, 1],
    });
    vi.stubGlobal("pack", {
      cells: {
        biome: [0, 0, 1],
      },
    });

    const sourceHtml = renderBiomeDistributionInsights("en", 0);
    const atlasHtml = renderBiomeDistributionInsights("en", 0, {
      palette: "atlas",
    });

    expect(sourceHtml).toContain('fill="#2f6db8"');
    expect(sourceHtml).toContain("--biome-color: #2f6db8");
    expect(atlasHtml).toContain('fill="#6f93bd"');
    expect(atlasHtml).toContain("--biome-color: #6f93bd");
    expect(atlasHtml).not.toContain('fill="#ffd166"');
  });
});

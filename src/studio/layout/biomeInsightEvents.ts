import type { StudioShellEventHandlers } from "./shellEventTypes";

export function bindBiomeInsightEvents({
  onBiomeCoverageChange,
}: Pick<StudioShellEventHandlers, "onBiomeCoverageChange">) {
  document
    .querySelectorAll<HTMLElement>("[data-studio-biome-insights='true']")
    .forEach((insights) => {
      const activateBiome = (biomeId: string) => {
        insights.dataset.activeBiomeId = biomeId;
        insights
          .querySelectorAll<HTMLElement>("[data-biome-active='true']")
          .forEach((element) => {
            delete element.dataset.biomeActive;
            element.classList.remove("is-active");
          });
        insights
          .querySelectorAll<HTMLElement>(
            `[data-biome-id='${CSS.escape(biomeId)}']`,
          )
          .forEach((element) => {
            element.dataset.biomeActive = "true";
            element.classList.add("is-active");
          });
        insights
          .querySelectorAll<HTMLElement>("[data-biome-control-id]")
          .forEach((element) => {
            element.hidden = element.dataset.biomeControlId !== biomeId;
          });
        const hint = insights.querySelector<HTMLElement>(
          ".studio-biome-insights__hint",
        );
        if (hint) hint.hidden = biomeId !== "other";
      };

      insights
        .querySelectorAll<HTMLElement>("[data-biome-id]")
        .forEach((element) => {
          element.addEventListener("click", () =>
            activateBiome(element.dataset.biomeId || ""),
          );
          element.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            activateBiome(element.dataset.biomeId || "");
          });
        });
    });

  document
    .querySelectorAll<HTMLInputElement>(
      "[data-studio-action='biome-coverage-slider']",
    )
    .forEach((input) => {
      input.addEventListener("input", () =>
        onBiomeCoverageChange(
          Number(input.dataset.biomeId),
          Number(input.value),
        ),
      );
    });
}

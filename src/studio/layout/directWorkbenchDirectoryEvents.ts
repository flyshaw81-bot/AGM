import type { StudioSection, StudioState } from "../types";
import { createDirectWorkbenchClearFilterPatches } from "./directWorkbenchDefaults";
import { bindActionClick } from "./studioEventBinding";

type DirectListPatch<K extends keyof StudioState["directEditor"]> = Partial<
  Pick<StudioState["directEditor"], K>
>;

type BindDirectWorkbenchDirectoryEventsOptions = {
  onSectionChange: (section: StudioSection) => void;
  onDirectStateListChange: (
    patch: DirectListPatch<
      "stateSearchQuery" | "stateSortMode" | "stateFilterMode"
    >,
  ) => void;
  onDirectBurgListChange: (
    patch: DirectListPatch<"burgSearchQuery" | "burgFilterMode">,
  ) => void;
  onDirectCultureListChange: (
    patch: DirectListPatch<"cultureSearchQuery" | "cultureFilterMode">,
  ) => void;
  onDirectReligionListChange: (
    patch: DirectListPatch<"religionSearchQuery" | "religionFilterMode">,
  ) => void;
  onDirectProvinceListChange: (
    patch: DirectListPatch<"provinceSearchQuery" | "provinceFilterMode">,
  ) => void;
  onDirectRouteListChange: (
    patch: DirectListPatch<"routeSearchQuery" | "routeFilterMode">,
  ) => void;
  onDirectZoneListChange: (
    patch: DirectListPatch<"zoneSearchQuery" | "zoneFilterMode">,
  ) => void;
  onDirectDiplomacyListChange: (
    patch: DirectListPatch<"diplomacySearchQuery" | "diplomacyFilterMode">,
  ) => void;
  onDirectBiomeListChange: (
    patch: DirectListPatch<"biomeSearchQuery" | "biomeFilterMode">,
  ) => void;
};

export function bindDirectWorkbenchDirectoryEvents({
  onSectionChange,
  onDirectStateListChange,
  onDirectBurgListChange,
  onDirectCultureListChange,
  onDirectReligionListChange,
  onDirectProvinceListChange,
  onDirectRouteListChange,
  onDirectZoneListChange,
  onDirectDiplomacyListChange,
  onDirectBiomeListChange,
}: BindDirectWorkbenchDirectoryEventsOptions) {
  bindActionClick("direct-relationship-history-balance", () => {
    onSectionChange("project");
    window.setTimeout(
      () =>
        document
          .getElementById("studioBalanceCheckerPanel")
          ?.scrollIntoView({ block: "start", behavior: "smooth" }),
      0,
    );
  });

  bindActionClick("direct-relationship-hidden-page", (button) => {
    const hiddenIssues = button.closest<HTMLElement>(
      "[data-direct-relationship-hidden-issues='true']",
    );
    const page = button.dataset.hiddenPage || "0";
    hiddenIssues
      ?.querySelectorAll<HTMLElement>(
        "[data-studio-action='direct-relationship-hidden-page']",
      )
      .forEach((pageButton) => {
        pageButton.classList.toggle(
          "is-active",
          pageButton.dataset.hiddenPage === page,
        );
      });
    hiddenIssues
      ?.querySelectorAll<HTMLElement>(
        "[data-direct-relationship-hidden-page='true']",
      )
      .forEach((pagePanel) => {
        pagePanel.hidden = pagePanel.dataset.hiddenPage !== page;
      });
    const pagination = hiddenIssues?.querySelector<HTMLElement>(
      "[data-direct-relationship-hidden-pagination='true']",
    );
    if (pagination) pagination.dataset.activePage = page;
  });

  bindActionClick("direct-workbench-clear-filters", (button) => {
    if (button.hasAttribute("disabled")) return;
    const clearFilters = createDirectWorkbenchClearFilterPatches();
    onDirectStateListChange(clearFilters.state);
    onDirectBurgListChange(clearFilters.burg);
    onDirectCultureListChange(clearFilters.culture);
    onDirectReligionListChange(clearFilters.religion);
    onDirectProvinceListChange(clearFilters.province);
    onDirectRouteListChange(clearFilters.route);
    onDirectZoneListChange(clearFilters.zone);
    onDirectDiplomacyListChange(clearFilters.diplomacy);
    onDirectBiomeListChange(clearFilters.biome);
  });
}

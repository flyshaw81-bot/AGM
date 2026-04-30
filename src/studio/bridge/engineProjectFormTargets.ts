type EngineProjectFormWindow = typeof globalThis & {
  options?: {
    winds?: unknown[];
  };
};

export type EngineSelectOption = {
  value: string;
  label: string;
};

export type EngineCultureSetOption = EngineSelectOption & {
  max: string;
};

export type EngineProjectFormTargets = {
  getInputValue: (id: string, fallback?: string) => string;
  getOutputValue: (id: string, fallback?: string) => string;
  getTextValue: (id: string, fallback?: string) => string;
  getSelect: (id: string) => HTMLSelectElement | null;
  getSelectValue: (
    select: HTMLSelectElement | null,
    fallback?: string,
  ) => string;
  getSelectedOptionLabel: (
    select: HTMLSelectElement | null,
    fallback?: string,
  ) => string;
  getSelectOptions: (select: HTMLSelectElement | null) => EngineSelectOption[];
  getCultureSetOptions: (
    select: HTMLSelectElement | null,
  ) => EngineCultureSetOption[];
  hasVisibleInlineDisplay: (id: string, fallback?: boolean) => boolean;
  getWindOption: (tier: number) => string;
  getWindTierRotation: (tier: number) => string;
};

function getFormWindow(): EngineProjectFormWindow {
  return (globalThis.window ?? globalThis) as EngineProjectFormWindow;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

export function createGlobalProjectFormTargets(): EngineProjectFormTargets {
  return {
    getInputValue: (id, fallback = "") =>
      (getDocument()?.getElementById(id) as HTMLInputElement | null | undefined)
        ?.value || fallback,
    getOutputValue: (id, fallback = "") => {
      const output = getDocument()?.getElementById(id) as
        | HTMLOutputElement
        | null
        | undefined;
      return output?.value || output?.textContent?.trim() || fallback;
    },
    getTextValue: (id, fallback = "") =>
      getDocument()?.getElementById(id)?.textContent?.trim() || fallback,
    getSelect: (id) =>
      (getDocument()?.getElementById(id) as
        | HTMLSelectElement
        | null
        | undefined) ?? null,
    getSelectValue: (select, fallback = "") => select?.value || fallback,
    getSelectedOptionLabel: (select, fallback = "") =>
      select?.selectedOptions?.[0]?.textContent?.trim() || fallback,
    getSelectOptions: (select) =>
      Array.from(select?.options || []).map((option) => ({
        value: option.value,
        label: option.textContent?.trim() || option.value,
      })),
    getCultureSetOptions: (select) =>
      Array.from(select?.options || []).map((option) => ({
        value: option.value,
        label: option.textContent?.trim() || option.value,
        max: option.dataset.max || "",
      })),
    hasVisibleInlineDisplay: (id, fallback = false) =>
      ((getDocument()?.getElementById(id) as HTMLElement | null | undefined)
        ?.style.display || (fallback ? "inline-block" : "none")) !== "none",
    getWindOption: (tier) => {
      const winds = getFormWindow().options?.winds;
      return Array.isArray(winds) ? String(winds[tier] ?? "") : "";
    },
    getWindTierRotation: (tier) =>
      (
        getDocument()
          ?.querySelector(`#globeWindArrows path[data-tier='${tier}']`)
          ?.getAttribute("transform")
          ?.match(/rotate\(([-\d.]+)/)?.[1] || ""
      ).trim(),
  };
}

type EngineProjectActionWindow = typeof globalThis & {
  applyOption?: (
    select: HTMLSelectElement,
    value: string,
    label: string,
  ) => void;
  heightmapTemplates?: Record<string, { name?: string }>;
  precreatedHeightmaps?: Record<string, { name?: string }>;
};

export type EngineProjectActionTargets = {
  getInput: (id: string) => HTMLInputElement | null;
  getOutput: (id: string) => HTMLOutputElement | null;
  getSelect: (id: string) => HTMLSelectElement | null;
  clickElement: (id: string) => void;
  dispatchInputAndChange: (element: HTMLElement) => void;
  dispatchChange: (element: HTMLElement) => void;
  findSelectOption: (
    select: HTMLSelectElement,
    value: string,
  ) => HTMLOptionElement | undefined;
  addSelectOption: (
    select: HTMLSelectElement,
    label: string,
    value: string,
  ) => void;
  applyOption: (
    select: HTMLSelectElement,
    value: string,
    label: string,
  ) => boolean;
  getTemplateLabel: (template: string) => string;
};

function getActionWindow(): EngineProjectActionWindow {
  return (globalThis.window ?? globalThis) as EngineProjectActionWindow;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

export function createGlobalProjectActionTargets(): EngineProjectActionTargets {
  return {
    getInput: (id) =>
      (getDocument()?.getElementById(id) as
        | HTMLInputElement
        | null
        | undefined) ?? null,
    getOutput: (id) =>
      (getDocument()?.getElementById(id) as
        | HTMLOutputElement
        | null
        | undefined) ?? null,
    getSelect: (id) =>
      (getDocument()?.getElementById(id) as
        | HTMLSelectElement
        | null
        | undefined) ?? null,
    clickElement: (id) => getDocument()?.getElementById(id)?.click(),
    dispatchInputAndChange: (element) => {
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    },
    dispatchChange: (element) => {
      element.dispatchEvent(new Event("change", { bubbles: true }));
    },
    findSelectOption: (select, value) =>
      Array.from(select.options).find((option) => option.value === value),
    addSelectOption: (select, label, value) => {
      select.options.add(new Option(label, value));
    },
    applyOption: (select, value, label) => {
      const applyOption = getActionWindow().applyOption;
      if (typeof applyOption !== "function") return false;
      applyOption(select, value, label);
      return true;
    },
    getTemplateLabel: (template) =>
      getActionWindow().heightmapTemplates?.[template]?.name ??
      getActionWindow().precreatedHeightmaps?.[template]?.name ??
      template,
  };
}

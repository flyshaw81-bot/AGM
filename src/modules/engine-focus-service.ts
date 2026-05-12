type FocusBurg = {
  i: number;
  name: string;
  cell: number;
  port?: unknown;
  population: number;
  x: number;
  y: number;
  [key: string]: unknown;
};

type FocusPack = {
  cells: {
    p: Array<[number, number]>;
    r: Record<number, unknown>;
    t: Record<number, number>;
  };
  burgs: FocusBurg[];
};

type FocusLabel = {
  size: () => number;
  text: (value: string) => FocusLabel;
  classed: (name: string, value: boolean) => FocusLabel;
  on: (event: string, handler: ((this: unknown) => void) | null) => FocusLabel;
};

export type EngineFocusTargets = {
  getUrl: () => URL;
  getReferrer: () => string;
  getPack: () => FocusPack;
  getGraphSize: () => { width: number; height: number };
  zoomTo: (x: number, y: number, scale: number, duration: number) => void;
  invokeActiveZooming: () => void;
  tip: (
    message: string,
    autoHide: boolean,
    type: "success",
    timeout: number,
  ) => void;
  logError: (message: string) => void;
  scan: <T>(
    values: T[],
    comparator: (a: T, b: T) => number,
  ) => number | undefined;
  getBurgLabel: (burgId: number) => FocusLabel;
  markLabelDragInactive: (target: unknown) => void;
};

export type EngineFocusService = {
  focusOn: () => void;
  findBurgForMFCG: (params: URLSearchParams) => void;
};

type FocusGlobal = {
  document?: { referrer?: string };
  location?: Location;
  pack?: FocusPack;
  graphWidth?: number;
  graphHeight?: number;
  zoomTo?: (x: number, y: number, scale: number, duration: number) => void;
  invokeActiveZooming?: () => void;
  tip?: EngineFocusTargets["tip"];
  ERROR?: boolean;
  d3?: {
    scan?: EngineFocusTargets["scan"];
  };
  select?: (selectorOrNode: unknown) => {
    classed?: (name: string, value: boolean) => void;
  };
  burgLabels?: { select?: (selector: string) => FocusLabel };
  EngineFocusService?: EngineFocusService;
  focusOn?: () => void;
  findBurgForMFCG?: (params: URLSearchParams) => void;
};

declare global {
  var EngineFocusService: EngineFocusService;
  var focusOn: () => void;
  var findBurgForMFCG: (params: URLSearchParams) => void;
  interface Window {
    EngineFocusService: EngineFocusService;
    focusOn: () => void;
    findBurgForMFCG: (params: URLSearchParams) => void;
  }
}

export function createEngineFocusService(
  targets: EngineFocusTargets,
): EngineFocusService {
  const findBurgForMFCG = (params: URLSearchParams): void => {
    const { cells, burgs } = targets.getPack();
    if (burgs.length < 2) {
      targets.logError("Cannot select a burg for MFCG");
      return;
    }

    const size = Number(params.get("size"));
    const coast = Number(params.get("coast"));
    const port = Number(params.get("port"));
    const river = Number(params.get("river"));

    let selection = defineSelection(cells, burgs, coast, port, river);
    if (!selection.length)
      selection = defineSelection(
        cells,
        burgs,
        coast,
        Number(!port),
        Number(!river),
      );
    if (!selection.length)
      selection = defineSelection(
        cells,
        burgs,
        Number(!coast),
        0,
        Number(!river),
      );
    if (!selection.length) selection = [burgs[1]];

    const selected = targets.scan(
      selection,
      (a, b) => Math.abs(a.population - size) - Math.abs(b.population - size),
    );
    const burgId = selected === undefined ? undefined : selection[selected]?.i;
    if (!burgId) {
      targets.logError("Cannot select a burg for MFCG");
      return;
    }

    const burg = burgs[burgId];
    const referrer = new URL(targets.getReferrer());
    for (const [key, value] of referrer.searchParams) {
      if (key === "name") burg.name = value;
      else if (key === "size") burg.population = Number(value);
      else if (key === "seed") burg.MFCG = Number(value);
      else if (key === "shantytown") burg.shanty = Number(value);
      else burg[key] = Number(value);
    }
    if (params.get("name") && params.get("name") !== "null") {
      burg.name = String(params.get("name"));
    }

    const label = targets.getBurgLabel(burgId);
    if (label.size()) {
      label
        .text(burg.name)
        .classed("drag", true)
        .on("mouseover", function () {
          targets.markLabelDragInactive(this);
          label.on("mouseover", null);
        });
    }

    targets.zoomTo(burg.x, burg.y, 8, 1600);
    targets.invokeActiveZooming();
    targets.tip(
      `Here stands the glorious city of ${burg.name}`,
      true,
      "success",
      15000,
    );
  };

  return {
    findBurgForMFCG,
    focusOn: () => {
      const params = targets.getUrl().searchParams;

      const fromMFCG = params.get("from") === "MFCG" && targets.getReferrer();
      if (fromMFCG) {
        const seed = params.get("seed");
        if (seed?.length === 13) {
          params.set("burg", seed.slice(-4));
        } else {
          findBurgForMFCG(params);
          return;
        }
      }

      const scaleParam = params.get("scale");
      const cellParam = params.get("cell");
      const burgParam = params.get("burg");
      if (!scaleParam && !cellParam && !burgParam) return;

      const scale = Number(scaleParam) || 8;
      const pack = targets.getPack();

      if (cellParam) {
        const [x, y] = pack.cells.p[Number(cellParam)];
        targets.zoomTo(x, y, scale, 1600);
        return;
      }

      if (burgParam) {
        const burg = Number.isNaN(Number(burgParam))
          ? pack.burgs.find((candidate) => candidate.name === burgParam)
          : pack.burgs[Number(burgParam)];
        if (!burg) return;

        targets.zoomTo(burg.x, burg.y, scale, 1600);
        return;
      }

      const { width, height } = targets.getGraphSize();
      const x = Number(params.get("x")) || width / 2;
      const y = Number(params.get("y")) || height / 2;
      targets.zoomTo(x, y, scale, 1600);
    },
  };
}

function defineSelection(
  cells: FocusPack["cells"],
  burgs: FocusBurg[],
  coast: number,
  port: number,
  river: number,
): FocusBurg[] {
  if (port && river)
    return burgs.filter((burg) => burg.port && cells.r[burg.cell]);
  if (!port && coast && river) {
    return burgs.filter(
      (burg) => !burg.port && cells.t[burg.cell] === 1 && cells.r[burg.cell],
    );
  }
  if (!coast && !river) {
    return burgs.filter(
      (burg) => cells.t[burg.cell] !== 1 && !cells.r[burg.cell],
    );
  }
  if (!coast && river) {
    return burgs.filter(
      (burg) => cells.t[burg.cell] !== 1 && cells.r[burg.cell],
    );
  }
  if (coast && river) {
    return burgs.filter(
      (burg) => cells.t[burg.cell] === 1 && cells.r[burg.cell],
    );
  }
  return [];
}

export function createGlobalFocusTargets(
  runtime: FocusGlobal = globalThis as unknown as FocusGlobal,
): EngineFocusTargets {
  return {
    getUrl: () => new URL(runtime.location?.href ?? ""),
    getReferrer: () => runtime.document?.referrer ?? "",
    getPack: () => {
      if (!runtime.pack)
        throw new Error("Cannot focus map without packed graph data");
      return runtime.pack;
    },
    getGraphSize: () => ({
      width: runtime.graphWidth ?? 0,
      height: runtime.graphHeight ?? 0,
    }),
    zoomTo: (x, y, scale, duration) => runtime.zoomTo?.(x, y, scale, duration),
    invokeActiveZooming: () => runtime.invokeActiveZooming?.(),
    tip: (message, autoHide, type, timeout) =>
      runtime.tip?.(message, autoHide, type, timeout),
    logError: (message) => {
      if (runtime.ERROR) console.error(message);
    },
    scan: (values, comparator) => {
      if (!values.length) return undefined;
      let minIdx = 0;
      for (let i = 1; i < values.length; i++) {
        if (comparator(values[i], values[minIdx]) < 0) minIdx = i;
      }
      return minIdx;
    },
    getBurgLabel: (burgId) =>
      runtime.burgLabels?.select?.(`[data-id='${burgId}']`) ??
      createEmptyFocusLabel(),
    markLabelDragInactive: (target) => {
      if (target instanceof Element) {
        target.classList.remove("drag");
      }
    },
  };
}

export function createGlobalFocusService(
  targets = createGlobalFocusTargets(),
): EngineFocusService {
  return createEngineFocusService(targets);
}

function createEmptyFocusLabel(): FocusLabel {
  const label: FocusLabel = {
    size: () => 0,
    text: () => label,
    classed: () => label,
    on: () => label,
  };
  return label;
}

function getRuntimeWindow(): Window | undefined {
  try {
    return window;
  } catch {
    return undefined;
  }
}

const runtimeWindow = getRuntimeWindow();
if (runtimeWindow) {
  runtimeWindow.EngineFocusService = createGlobalFocusService();
  runtimeWindow.focusOn = () => runtimeWindow.EngineFocusService.focusOn();
  runtimeWindow.findBurgForMFCG = (params: URLSearchParams) =>
    runtimeWindow.EngineFocusService.findBurgForMFCG(params);
}

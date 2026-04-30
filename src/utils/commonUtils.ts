import { clipPolygon } from "lineclip";
import { last } from "./arrayUtils";
import { distanceSquared } from "./functionUtils";
import { rn } from "./numberUtils";
import { rand } from "./probabilityUtils";

/**
 * Clip polygon points to graph boundaries
 * @param points - Array of points [[x1, y1], [x2, y2], ...]
 * @param graphWidth - Width of the graph
 * @param graphHeight - Height of the graph
 * @returns Clipped polygon points
 */
export const clipPoly = (
  points: [number, number][],
  graphWidth: number,
  graphHeight: number,
) => {
  if (points.length < 2) return points;
  if (points.some((point) => point === undefined)) {
    window.ERROR && console.error("Undefined point in clipPoly", points);
    return points;
  }

  return clipPolygon(points, [0, 0, graphWidth, graphHeight]);
};

/**
 * Get segment of any point on polyline
 * @param points - Array of points defining the polyline
 * @param point - The point to find the segment for
 * @param step - Step size for segment search (default is 10)
 * @returns The segment ID (1-indexed)
 */
export const getSegmentId = (
  points: [number, number][],
  point: [number, number],
  step: number = 10,
): number => {
  if (points.length === 2) return 1;

  let minSegment = 1;
  let minDist = Infinity;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const length = Math.sqrt(distanceSquared(p1, p2));
    const segments = Math.ceil(length / step);
    const dx = (p2[0] - p1[0]) / segments;
    const dy = (p2[1] - p1[1]) / segments;

    for (let s = 0; s < segments; s++) {
      const x = p1[0] + s * dx;
      const y = p1[1] + s * dy;
      const dist = distanceSquared(point, [x, y]);

      if (dist >= minDist) continue;
      minDist = dist;
      minSegment = i + 1;
    }
  }

  return minSegment;
};

/**
 * Creates a debounced function that delays next func call until after ms milliseconds
 * @param func - The function to debounce
 * @param ms - The number of milliseconds to delay
 * @returns The debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  ms: number,
) => {
  let isCooldown = false;

  return function (this: any, ...args: Parameters<T>) {
    if (isCooldown) return;
    func.apply(this, args);
    isCooldown = true;
    setTimeout(() => {
      isCooldown = false;
    }, ms);
  };
};

/**
 * Creates a throttled function that only invokes func at most once every ms milliseconds
 * @param func - The function to throttle
 * @param ms - The number of milliseconds to throttle invocations to
 * @returns The throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  ms: number,
) => {
  let isThrottled = false;
  let savedArgs: any[] | null = null;
  let savedThis: any = null;

  function wrapper(this: any, ...args: Parameters<T>) {
    if (isThrottled) {
      savedArgs = args;
      savedThis = this;
      return;
    }

    func.apply(this, args);
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs as Parameters<T>);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper;
};

/**
 * Parse error to get the readable string in Chrome and Firefox
 * @param error - The error object to parse
 * @returns Formatted error string with HTML formatting
 */
export const parseError = (error: Error): string => {
  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  const errorString = isFirefox
    ? `${error.toString()} ${error.stack}`
    : error.stack || "";
  const regex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  const errorNoURL = errorString.replace(
    regex,
    (url) => `<i>${last(url.split("/"))}</i>`,
  );
  const errorParsed = errorNoURL.replace(/at /gi, "<br>&nbsp;&nbsp;at ");
  return errorParsed;
};

/**
 * Convert a URL to base64 encoded data
 * @param url - The URL to convert
 * @param callback - Callback function that receives the base64 data
 */
export const getBase64 = (
  url: string,
  callback: (result: string | ArrayBuffer | null) => void,
): void => {
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
};

/**
 * Open URL in a new tab or window
 * @param url - The URL to open
 */
export const openURL = (url: string): void => {
  window.open(url, "_blank");
};

/**
 * Open project wiki-page
 * @param page - The wiki page name/path to open
 */
export const wiki = (page: string): void => {
  window.open(`docs/${page}`, "_blank");
};

/**
 * Wrap URL into html a element
 * @param URL - The URL for the link
 * @param description - The link text/description
 * @returns HTML anchor element as a string
 */
export const link = (URL: string, description: string): string => {
  return `<a href="${URL}" rel="noopener" target="_blank">${description}</a>`;
};

/**
 * Check if Ctrl key (or Cmd on Mac) was pressed during an event
 * @param event - The keyboard or mouse event
 * @returns True if Ctrl/Cmd was pressed
 */
export const isCtrlClick = (event: MouseEvent | KeyboardEvent): boolean => {
  // meta key is cmd key on MacOs
  return event.ctrlKey || event.metaKey;
};

/**
 * Generate a random date within a specified range
 * @param from - Start year (default is 100)
 * @param to - End year (default is 1000)
 * @returns Formatted date string
 */
export const generateDate = (from: number = 100, to: number = 1000): string => {
  return new Date(rand(from, to), rand(11), rand(1, 28)).toLocaleDateString(
    "en",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
};

/**
 * Convert x coordinate to longitude
 * @param x - The x coordinate
 * @param mapCoordinates - Map coordinates object with lonW and lonT properties
 * @param graphWidth - Width of the graph
 * @param decimals - Number of decimal places (default is 2)
 * @returns Longitude value
 */
export const getLongitude = (
  x: number,
  mapCoordinates: any,
  graphWidth: number,
  decimals: number = 2,
): number => {
  return rn(
    mapCoordinates.lonW + (x / graphWidth) * mapCoordinates.lonT,
    decimals,
  );
};

/**
 * Convert y coordinate to latitude
 * @param y - The y coordinate
 * @param mapCoordinates - Map coordinates object with latN and latT properties
 * @param graphHeight - Height of the graph
 * @param decimals - Number of decimal places (default is 2)
 * @returns Latitude value
 */
export const getLatitude = (
  y: number,
  mapCoordinates: any,
  graphHeight: number,
  decimals: number = 2,
): number => {
  return rn(
    mapCoordinates.latN - (y / graphHeight) * mapCoordinates.latT,
    decimals,
  );
};

/**
 * Convert x,y coordinates to longitude,latitude
 * @param x - The x coordinate
 * @param y - The y coordinate
 * @param mapCoordinates - Map coordinates object
 * @param graphWidth - Width of the graph
 * @param graphHeight - Height of the graph
 * @param decimals - Number of decimal places (default is 2)
 * @returns Array with [longitude, latitude]
 */
export const getCoordinates = (
  x: number,
  y: number,
  mapCoordinates: any,
  graphWidth: number,
  graphHeight: number,
  decimals: number = 2,
): [number, number] => {
  return [
    getLongitude(x, mapCoordinates, graphWidth, decimals),
    getLatitude(y, mapCoordinates, graphHeight, decimals),
  ];
};

/**
 * Prompt options interface
 */
export interface PromptOptions {
  default: number | string;
  step?: number;
  min?: number;
  max?: number;
  required?: boolean;
}

export type StudioInputCallback = (value: number | string) => void;
export type StudioInputRequest = (
  promptText?: string,
  options?: PromptOptions,
  callback?: StudioInputCallback,
) => void;

export type StudioInputPromptTargets = {
  getElementById: (id: string) => HTMLElement | null;
  createElement: (tagName: "div") => HTMLElement;
  appendToBody: (element: HTMLElement) => void;
  addKeydownListener: (listener: (event: KeyboardEvent) => void) => void;
  removeKeydownListener: (listener: (event: KeyboardEvent) => void) => void;
  removeElement: (id: string) => void;
  installRequest: (request: StudioInputRequest) => void;
  isErrorEnabled: () => boolean;
};

const studioInputDefaults: PromptOptions = {
  default: 1,
  step: 0.01,
  min: 0,
  max: 100,
  required: true,
};

export function createGlobalStudioInputPromptTargets(): StudioInputPromptTargets {
  return {
    getElementById: (id) => document.getElementById(id),
    createElement: (tagName) => document.createElement(tagName),
    appendToBody: (element) => {
      document.body.appendChild(element);
    },
    addKeydownListener: (listener) => {
      document.addEventListener("keydown", listener);
    },
    removeKeydownListener: (listener) => {
      document.removeEventListener("keydown", listener);
    },
    removeElement: (id) => {
      document.getElementById(id)?.remove();
    },
    installRequest: (request) => {
      window.requestStudioInput = request;
      (window as any).prompt = request;
    },
    isErrorEnabled: () => Boolean(window.ERROR),
  };
}

function createStudioInputDialog(targets: StudioInputPromptTargets) {
  const existing = targets.getElementById("studioInputDialog");
  if (existing) return existing;

  const host = targets.createElement("div");
  host.id = "studioInputDialog";
  host.className = "studio-input-dialog";
  host.setAttribute("role", "dialog");
  host.setAttribute("aria-modal", "true");
  host.setAttribute("aria-labelledby", "studioInputDialogTitle");
  host.style.display = "none";
  host.innerHTML = /* html */ `
    <div class="studio-input-dialog__scrim" data-studio-input-cancel></div>
    <form class="studio-input-dialog__panel" id="studioInputForm">
      <label class="studio-input-dialog__label" id="studioInputDialogTitle" for="studioInputValue"></label>
      <input class="studio-input-dialog__input" id="studioInputValue" autocomplete="off" />
      <div class="studio-input-dialog__actions">
        <button class="studio-input-dialog__button" type="button" data-studio-input-cancel>Cancel</button>
        <button class="studio-input-dialog__button studio-input-dialog__button--primary" type="submit">Apply</button>
      </div>
    </form>
  `;
  targets.appendToBody(host);
  return host;
}

/**
 * Initialize Studio input dialog for old editor commands.
 * This should be called once when the DOM is ready
 */
export const initializePrompt = (
  targets: StudioInputPromptTargets = createGlobalStudioInputPromptTargets(),
): void => {
  const defaultText = "Please provide an input";

  const requestStudioInput: StudioInputRequest = (
    promptText: string = defaultText,
    options: PromptOptions = studioInputDefaults,
    callback?: (value: number | string) => void,
  ) => {
    if (options.default === undefined)
      return (
        targets.isErrorEnabled() &&
        console.error(
          "Prompt: options object does not have default value defined",
        )
      );

    const dialog = createStudioInputDialog(targets);
    const form = dialog.querySelector("#studioInputForm") as HTMLFormElement;
    const input = dialog.querySelector("#studioInputValue") as HTMLInputElement;
    const label = dialog.querySelector(
      "#studioInputDialogTitle",
    ) as HTMLElement;
    const cancelButtons = Array.from(
      dialog.querySelectorAll("[data-studio-input-cancel]"),
    );
    if (!form || !input || !label) return;

    const type = typeof options.default === "number" ? "number" : "text";
    function onKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    function close() {
      dialog.style.display = "none";
      targets.removeKeydownListener(onKeydown);
    }

    function submit(event: Event) {
      event.preventDefault();
      const value = type === "number" ? +input.value : input.value;
      close();
      if (callback) callback(value);
    }

    label.innerHTML = promptText;
    input.type = type;
    input.step = "";
    input.min = "";
    input.max = "";

    if (options.step !== undefined) input.step = options.step.toString();
    if (options.min !== undefined) input.min = options.min.toString();
    if (options.max !== undefined) input.max = options.max.toString();

    input.required = options.required !== false;
    input.placeholder = `type a ${type}`;
    input.value = options.default.toString();

    form.onsubmit = submit;
    cancelButtons.forEach((button) => {
      button.addEventListener("click", close, { once: true });
    });
    targets.addKeydownListener(onKeydown);
    dialog.style.display = "block";
    input.focus();
    input.select();
  };

  targets.removeElement("prompt");
  targets.installRequest(requestStudioInput);
};

declare global {
  interface Window {
    ERROR: boolean;
    requestStudioInput: StudioInputRequest;

    clipPoly: typeof clipPoly;
    getSegmentId: typeof getSegmentId;
    debounce: typeof debounce;
    throttle: typeof throttle;
    parseError: typeof parseError;
    getBase64: typeof getBase64;
    openURL: typeof openURL;
    wiki: typeof wiki;
    link: typeof link;
    isCtrlClick: typeof isCtrlClick;
    generateDate: typeof generateDate;
    getLongitude: typeof getLongitude;
    getLatitude: typeof getLatitude;
    getCoordinates: typeof getCoordinates;
  }

  // Global variables defined in main.js
  var mapCoordinates: {
    latT?: number;
    latN?: number;
    latS?: number;
    lonT?: number;
    lonW?: number;
    lonE?: number;
  };
  var graphWidth: number;
  var graphHeight: number;
}

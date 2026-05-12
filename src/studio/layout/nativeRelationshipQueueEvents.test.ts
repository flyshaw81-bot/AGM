import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import { bindNativeRelationshipQueueEvents } from "./nativeRelationshipQueueEvents";

type FakeListener = (event: { target: FakeElement }) => void;

class FakeElement {
  className = "";
  dataset: Record<string, string> = {};
  disabled = false;
  hidden = false;
  parent: FakeElement | null = null;
  textContent = "";
  private children: FakeElement[] = [];
  private html = "";
  private readonly listeners = new Map<string, FakeListener[]>();
  private readonly selectorResults = new Map<string, FakeElement | null>();

  constructor(readonly tagName = "div") {}

  set innerHTML(value: string) {
    this.html = value;
    this.children = [];
    if (value.includes("<strong")) this.append(new FakeElement("strong"));
    if (value.includes("<code")) this.append(new FakeElement("code"));
    if (value.includes("<em")) this.append(new FakeElement("em"));
  }

  get innerHTML() {
    return this.html;
  }

  addEventListener(type: string, listener: FakeListener) {
    this.listeners.set(type, [...(this.listeners.get(type) || []), listener]);
  }

  append(...children: FakeElement[]) {
    children.forEach((child) => {
      child.parent = this;
      this.children.push(child);
    });
  }

  click() {
    if (this.disabled) return;
    (this.listeners.get("click") || []).forEach((listener) => {
      listener({ target: this });
    });
  }

  setQuerySelector(selector: string, element: FakeElement | null) {
    this.selectorResults.set(selector, element);
  }

  querySelector<T = FakeElement>(selector: string): T | null {
    if (this.selectorResults.has(selector)) {
      return this.selectorResults.get(selector) as T | null;
    }
    return (this.children.find((child) => child.matches(selector)) ||
      this.children
        .map((child) => child.querySelector<T>(selector))
        .find(Boolean) ||
      null) as T | null;
  }

  querySelectorAll<T = FakeElement>(selector: string): T[] {
    return [
      ...this.children.filter((child) => child.matches(selector)),
      ...this.children.flatMap((child) => child.querySelectorAll<T>(selector)),
    ] as T[];
  }

  closest<T = FakeElement>(selector: string): T | null {
    let current: FakeElement | null = this;
    while (current) {
      if (current.matches(selector)) return current as T;
      current = current.parent;
    }
    return null;
  }

  cloneNode() {
    const clone = new FakeElement(this.tagName);
    clone.className = this.className;
    clone.dataset = { ...this.dataset };
    clone.textContent = this.textContent;
    return clone;
  }

  private matches(selector: string) {
    if (selector === this.tagName) return true;
    if (selector.startsWith(".")) {
      return this.className.split(/\s+/u).includes(selector.slice(1));
    }
    const action = selector.match(/^\[data-studio-action='([^']+)'\]$/u);
    if (action) return this.dataset.studioAction === action[1];
    const data = selector.match(/^\[data-([a-z0-9-]+)='([^']+)'\]$/u);
    if (data) return this.dataset[toDatasetKey(data[1])] === data[2];
    return false;
  }
}

function toDatasetKey(attribute: string) {
  return attribute.replace(/-([a-z0-9])/gu, (_match, value: string) =>
    value.toUpperCase(),
  );
}

const originalPack = (globalThis as { pack?: unknown }).pack;

function createState(): StudioState {
  return {
    language: "en",
    section: "repair",
    directEditor: {
      relationshipQueueHistory: null,
      relationshipQueueHistoryLog: [],
    },
  } as unknown as StudioState;
}

function installQueueDom(fixButton: FakeElement) {
  const root = new FakeElement();
  root.dataset.directRelationshipQueue = "true";
  root.dataset.emptyLabel = "Queue is empty";
  root.dataset.readyLabel = "Queue is ready to apply.";
  root.dataset.conflictLabel = "Queue needs review";

  const review = new FakeElement();
  review.dataset.directRelationshipQueueReview = "true";
  const actionScope = new FakeElement();
  actionScope.dataset.directRelationshipQueueActionScope = "true";
  const summary = new FakeElement();
  summary.dataset.directRelationshipQueueSummary = "true";
  const list = new FakeElement();
  list.dataset.directRelationshipQueueList = "true";
  const details = new FakeElement();
  details.dataset.directRelationshipQueueDetails = "true";
  const count = new FakeElement();
  count.dataset.directRelationshipQueueCount = "true";
  const apply = new FakeElement("button");
  apply.dataset.studioAction = "direct-relationship-queue-apply";
  const add = new FakeElement("button");
  add.dataset.studioAction = "direct-relationship-queue-add";
  add.textContent = "Queue repair";
  const issue = new FakeElement();
  issue.className = "studio-direct-workbench-directory__issue";
  issue.append(fixButton, add);
  issue.setQuerySelector(
    "[data-studio-action='direct-relationship-fix']",
    fixButton,
  );

  const selectors = new Map<string, FakeElement | null>([
    ["[data-direct-relationship-queue='true']", root],
    ["[data-direct-relationship-queue-review='true']", review],
    ["[data-direct-relationship-queue-action-scope='true']", actionScope],
    ["[data-direct-relationship-queue-summary='true']", summary],
    ["[data-direct-relationship-queue-history='true']", null],
    ["[data-direct-relationship-queue-history-text='true']", null],
    ["[data-studio-action='direct-relationship-history-review']", null],
    ["[data-studio-action='direct-relationship-history-undo']", null],
    ["[data-direct-relationship-history-filters='true']", null],
    ["[data-direct-relationship-history-filter-summary='true']", null],
    ["[data-direct-relationship-history-filter-empty='true']", null],
    ["[data-direct-relationship-history-list='true']", null],
    ["[data-direct-relationship-queue-list='true']", list],
    ["[data-direct-relationship-queue-details='true']", details],
    ["[data-studio-action='direct-relationship-queue-toggle']", null],
    ["[data-direct-relationship-queue-count='true']", count],
    ["[data-studio-action='direct-relationship-queue-apply']", apply],
  ]);

  vi.stubGlobal("document", {
    createElement: (tagName: string) => new FakeElement(tagName),
    querySelector: (selector: string) => selectors.get(selector) || null,
    querySelectorAll: (selector: string) =>
      selector === "[data-studio-action='direct-relationship-queue-add']"
        ? [add]
        : [],
  });

  return { actionScope, add, apply, count, review, summary };
}

function createFixButton(textContent = "#8 -> #0") {
  const fixButton = new FakeElement("button");
  fixButton.dataset.fixKind = "state-clear-culture";
  fixButton.dataset.stateId = "2";
  fixButton.dataset.stateCulture = "0";
  fixButton.dataset.workbenchTarget = "studioDirectStatesWorkbench";
  fixButton.textContent = textContent;
  return fixButton;
}

afterEach(() => {
  (globalThis as { pack?: unknown }).pack = originalPack;
  vi.unstubAllGlobals();
});

describe("nativeRelationshipQueueEvents", () => {
  it("applies a queued repair, writes history, and requests a rerender sync", () => {
    (globalThis as { pack?: unknown }).pack = {
      states: {
        2: { culture: 8 },
      },
    };
    const dom = installQueueDom(createFixButton());
    const histories: Array<
      StudioState["directEditor"]["relationshipQueueHistory"]
    > = [];
    const applyPayload = vi.fn((button: HTMLElement) => {
      const pack = (globalThis as { pack?: { states: Record<number, any> } })
        .pack;
      if (pack?.states?.[2]) {
        pack.states[2].culture = button.dataset.stateCulture || "";
      }
    });

    bindNativeRelationshipQueueEvents({
      state: createState(),
      openDirectWorkbench: vi.fn(),
      selectNativeRelationshipSource: vi.fn(),
      applyNativeRelationshipButtonPayload: applyPayload,
      onDirectRelationshipQueueHistoryChange: (history) =>
        histories.push(history),
    });

    dom.add.click();
    expect(dom.count.textContent).toBe("1");
    expect(dom.review.textContent).toBe("Queue is ready to apply.");

    dom.apply.click();

    expect(applyPayload).toHaveBeenCalledTimes(1);
    expect(histories).toHaveLength(1);
    expect(histories[0]).toMatchObject({
      count: 1,
      target: "studioDirectStatesWorkbench",
      undoChanges: [
        {
          entity: "state",
          id: 2,
          field: "culture",
          beforeValue: "8",
          afterValue: "0",
        },
      ],
    });
    expect(
      (globalThis as { pack: { states: Record<number, any> } }).pack.states[2]
        .culture,
    ).toBe("0");
  });

  it("blocks apply when the queued source value becomes stale", () => {
    (globalThis as { pack?: unknown }).pack = {
      states: {
        2: { culture: 8 },
      },
    };
    const dom = installQueueDom(createFixButton());
    const applyPayload = vi.fn();
    const onHistory = vi.fn();

    bindNativeRelationshipQueueEvents({
      state: createState(),
      openDirectWorkbench: vi.fn(),
      selectNativeRelationshipSource: vi.fn(),
      applyNativeRelationshipButtonPayload: applyPayload,
      onDirectRelationshipQueueHistoryChange: onHistory,
    });

    dom.add.click();
    (
      globalThis as { pack: { states: Record<number, any> } }
    ).pack.states[2].culture = 9;
    dom.apply.click();

    expect(applyPayload).not.toHaveBeenCalled();
    expect(onHistory).not.toHaveBeenCalled();
    expect(dom.review.textContent).toBe("Queue needs review");
    expect(dom.actionScope.dataset.actionState).toBe("conflict");
    expect(dom.summary.textContent).toContain("States culture: 1");
  });
});

/**
 * Self-developed lightweight SVG selection/manipulation library.
 * Replacement for d3-selection.
 *
 * Provides a chainable API for DOM manipulation compatible with
 * the d3 Selection API surface used in AGM Studio.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

type ValueOrAccessor<GElement, Datum, V> =
  | V
  | ((this: GElement, d: Datum, i: number, nodes: GElement[]) => V);

/**
 * Lightweight d3-compatible Selection class.
 * Generic parameters mirror d3's Selection<GElement, Datum, PElement, PDatum>.
 */
export class Selection<
  GElement extends Element = Element,
  Datum = unknown,
  _PElement extends Element | null = null,
  _PDatum = undefined,
> {
  private _groups: GElement[][];
  private _parents: (Element | null)[];

  constructor(groups: GElement[][], parents: (Element | null)[]) {
    this._groups = groups;
    this._parents = parents;
  }

  select<E extends Element = GElement>(
    selector: string,
  ): Selection<E, Datum, GElement, Datum> {
    const groups: E[][] = [];
    for (const group of this._groups) {
      const subgroup: E[] = [];
      for (const node of group) {
        const found = node?.querySelector<E>(selector);
        if (found) subgroup.push(found);
      }
      groups.push(subgroup);
    }
    return new Selection<E, Datum, GElement, Datum>(
      groups,
      this._groups.map((g) => g[0] ?? null),
    );
  }

  selectAll<E extends Element = Element, D = unknown>(
    selector: string,
  ): Selection<E, D, GElement, Datum> {
    const groups: E[][] = [];
    const parents: (Element | null)[] = [];
    for (const group of this._groups) {
      for (const node of group) {
        if (!node) continue;
        const found = node.querySelectorAll<E>(selector);
        groups.push(Array.from(found));
        parents.push(node);
      }
    }
    return new Selection<E, D, GElement, Datum>(groups, parents);
  }

  append<K extends keyof SVGElementTagNameMap>(
    type: K,
  ): Selection<SVGElementTagNameMap[K], Datum, GElement, Datum>;
  append<E extends Element = Element>(
    type: string,
  ): Selection<E, Datum, GElement, Datum>;
  append<E extends Element = Element>(
    type: string,
  ): Selection<E, Datum, GElement, Datum> {
    const groups: E[][] = [];
    for (const group of this._groups) {
      const subgroup: E[] = [];
      for (const node of group) {
        if (!node) continue;
        const child = createSvgElement(type, node) as E;
        // Inherit datum
        const d = (node as any).__data__;
        if (d !== undefined) (child as any).__data__ = d;
        node.appendChild(child);
        subgroup.push(child);
      }
      groups.push(subgroup);
    }
    return new Selection<E, Datum, GElement, Datum>(groups, this._parents);
  }

  attr(name: string): string;
  attr(
    name: string,
    value: ValueOrAccessor<GElement, Datum, string | number | null>,
  ): this;
  attr(
    name: string,
    value?: ValueOrAccessor<GElement, Datum, string | number | null>,
  ): this | string {
    // Getter mode: no value argument
    if (value === undefined) {
      const node = this.node();
      if (!node) return "";
      return node.getAttribute(name) ?? "";
    }
    for (const group of this._groups) {
      for (let i = 0; i < group.length; i++) {
        const node = group[i];
        if (!node) continue;
        const v =
          typeof value === "function"
            ? (
                value as (
                  d: Datum,
                  i: number,
                  nodes: GElement[],
                ) => string | number | null
              ).call(node, (node as any).__data__, i, group)
            : value;
        if (v == null) {
          node.removeAttribute(name);
        } else {
          node.setAttribute(name, String(v));
        }
      }
    }
    return this;
  }

  style(name: string): string;
  style(
    name: string,
    value: ValueOrAccessor<GElement, Datum, string | null>,
  ): this;
  style(
    name: string,
    value?: ValueOrAccessor<GElement, Datum, string | null>,
  ): this | string {
    // Getter mode: no value argument (only for reading)
    if (value === undefined) {
      const node = this.node();
      if (!node) return "";
      return (
        (node as unknown as HTMLElement).style?.getPropertyValue(name) ?? ""
      );
    }
    for (const group of this._groups) {
      for (let i = 0; i < group.length; i++) {
        const node = group[i];
        if (!node) continue;
        const v =
          typeof value === "function"
            ? (
                value as (
                  d: Datum,
                  i: number,
                  nodes: GElement[],
                ) => string | null
              ).call(node, (node as any).__data__, i, group)
            : value;
        if (v == null) {
          (node as unknown as HTMLElement).style?.removeProperty(name);
        } else {
          (node as unknown as HTMLElement).style?.setProperty(name, v);
        }
      }
    }
    return this;
  }

  on(
    typenames: string,
    listener: ((this: GElement, event: Event, d: Datum) => void) | null,
  ): this {
    const types = typenames.trim().split(/\s+/);
    for (const group of this._groups) {
      for (const node of group) {
        if (!node) continue;
        for (const typename of types) {
          const parts = typename.split(".");
          const type = parts[0];
          if (listener == null) {
            // Remove listener
            const stored = (node as any).__listeners__;
            if (stored?.[typename]) {
              node.removeEventListener(type, stored[typename]);
              delete stored[typename];
            }
          } else {
            // Add listener — d3 v5 style: no event arg for compat with engine-browser-runtime-main
            const wrapped = function (this: GElement, event: Event) {
              listener.call(this, event, (node as any).__data__);
            };
            if (!(node as any).__listeners__) (node as any).__listeners__ = {};
            // Remove old listener of same typename first
            const stored = (node as any).__listeners__;
            if (stored[typename]) {
              node.removeEventListener(type, stored[typename]);
            }
            stored[typename] = wrapped;
            node.addEventListener(type, wrapped);
          }
        }
      }
    }
    return this;
  }

  each(
    callback: (this: GElement, d: Datum, i: number, nodes: GElement[]) => void,
  ): this {
    for (const group of this._groups) {
      for (let i = 0; i < group.length; i++) {
        const node = group[i];
        if (node) callback.call(node, (node as any).__data__, i, group);
      }
    }
    return this;
  }

  html(value: string | null): this {
    for (const group of this._groups) {
      for (const node of group) {
        if (!node) continue;
        node.innerHTML = value ?? "";
      }
    }
    return this;
  }

  text(value: ValueOrAccessor<GElement, Datum, string | number | null>): this {
    for (const group of this._groups) {
      for (let i = 0; i < group.length; i++) {
        const node = group[i];
        if (!node) continue;
        const v =
          typeof value === "function"
            ? (
                value as (
                  d: Datum,
                  i: number,
                  nodes: GElement[],
                ) => string | number | null
              ).call(node, (node as any).__data__, i, group)
            : value;
        node.textContent = v == null ? "" : String(v);
      }
    }
    return this;
  }

  remove(): this {
    for (const group of this._groups) {
      for (const node of group) {
        if (node?.parentNode) node.parentNode.removeChild(node);
      }
    }
    return this;
  }

  node(): GElement | null {
    for (const group of this._groups) {
      for (const node of group) {
        if (node) return node;
      }
    }
    return null;
  }

  size(): number {
    let count = 0;
    for (const group of this._groups) {
      count += group.length;
    }
    return count;
  }

  empty(): boolean {
    return this.node() === null;
  }

  /**
   * Data join. Returns a new selection with data bound.
   * Enter nodes are tracked for `.enter()`.
   */
  data<D>(data: D[]): DataSelection<GElement, D, Element | null, _PDatum> {
    return new DataSelection<GElement, D, Element | null, _PDatum>(
      this._groups,
      this._parents,
      data,
    );
  }

  /**
   * Set/toggle CSS classes. Matches d3's `.classed(names, value)` API.
   */
  classed(names: string, value: boolean): this {
    const classNames = names.trim().split(/\s+/);
    for (const group of this._groups) {
      for (const node of group) {
        if (!node) continue;
        for (const name of classNames) {
          if (value) {
            node.classList.add(name);
          } else {
            node.classList.remove(name);
          }
        }
      }
    }
    return this;
  }

  /**
   * Create a transition selection for animated attribute/style changes.
   */
  transition(_t?: TransitionConfig): TransitionSelection<GElement, Datum> {
    const config = _t || new TransitionConfig();
    return new TransitionSelection<GElement, Datum>(this._groups, config);
  }

  /**
   * Call a function with this selection as the argument.
   * Matches d3's `.call(fn, ...args)` API.
   */
  call<Args extends unknown[]>(
    fn: (selection: this, ...args: Args) => void,
    ...args: Args
  ): this {
    fn(this, ...args);
    return this;
  }
}

/**
 * Selection returned by `.data()` — tracks enter/update/exit.
 */
class DataSelection<
  GElement extends Element,
  Datum,
  PElement extends Element | null,
  _PDatum,
> {
  private _parents: (Element | null)[];
  private _data: Datum[];

  constructor(
    _groups: GElement[][],
    parents: (Element | null)[],
    data: Datum[],
  ) {
    this._parents = parents;
    this._data = data;
  }

  enter(): EnterSelection<Datum, PElement> {
    return new EnterSelection<Datum, PElement>(this._parents, this._data);
  }
}

/**
 * Enter selection — represents placeholders for new data.
 */
class EnterSelection<Datum, PElement extends Element | null> {
  private _parents: (Element | null)[];
  private _data: Datum[];

  constructor(parents: (Element | null)[], data: Datum[]) {
    this._parents = parents;
    this._data = data;
  }

  append<K extends keyof SVGElementTagNameMap>(
    type: K,
  ): Selection<SVGElementTagNameMap[K], Datum, PElement, undefined>;
  append<E extends Element = Element>(
    type: string,
  ): Selection<E, Datum, PElement, undefined>;
  append<E extends Element = Element>(
    type: string,
  ): Selection<E, Datum, PElement, undefined> {
    const groups: E[][] = [];
    for (const parent of this._parents) {
      if (!parent) continue;
      const subgroup: E[] = [];
      for (const d of this._data) {
        const child = createSvgElement(type, parent) as E;
        (child as any).__data__ = d;
        parent.appendChild(child);
        subgroup.push(child);
      }
      groups.push(subgroup);
    }
    return new Selection<E, Datum, PElement, undefined>(groups, this._parents);
  }
}

/**
 * Transition configuration object.
 * Created by `transition()` and passed to `.transition(config)`.
 */
export class TransitionConfig {
  _duration = 250;
  _ease: (t: number) => number = (t) => t;

  duration(ms: number): this {
    this._duration = ms;
    return this;
  }

  ease(fn: (t: number) => number): this {
    this._ease = fn;
    return this;
  }
}

/**
 * Transition selection — animates attribute/style changes.
 */
class TransitionSelection<GElement extends Element = Element, Datum = unknown> {
  private _groups: GElement[][];
  private _config: TransitionConfig;

  constructor(groups: GElement[][], config: TransitionConfig) {
    this._groups = groups;
    this._config = config;
  }

  attr(
    name: string,
    value: ValueOrAccessor<GElement, Datum, string | number | null>,
  ): this {
    for (const group of this._groups) {
      for (let i = 0; i < group.length; i++) {
        const node = group[i];
        if (!node) continue;
        const target =
          typeof value === "function"
            ? (
                value as (
                  d: Datum,
                  i: number,
                  nodes: GElement[],
                ) => string | number | null
              ).call(node, (node as any).__data__, i, group)
            : value;
        animateAttribute(
          node,
          name,
          target == null ? "" : String(target),
          this._config._duration,
          this._config._ease,
        );
      }
    }
    return this;
  }

  style(
    name: string,
    value: ValueOrAccessor<GElement, Datum, string | number | null>,
  ): this {
    for (const group of this._groups) {
      for (let i = 0; i < group.length; i++) {
        const node = group[i];
        if (!node) continue;
        const target =
          typeof value === "function"
            ? (
                value as (
                  d: Datum,
                  i: number,
                  nodes: GElement[],
                ) => string | number | null
              ).call(node, (node as any).__data__, i, group)
            : value;
        animateStyle(
          node,
          name,
          target == null ? "" : String(target),
          this._config._duration,
          this._config._ease,
        );
      }
    }
    return this;
  }

  /**
   * Call a function passing a transition-aware wrapper.
   * Used for zoom: `svg.transition().duration(d).call(zoom.transform, t)`
   */
  call<Args extends unknown[]>(
    fn: (...args: unknown[]) => void,
    ...args: Args
  ): this {
    // Pass transition config + selection info to the function
    fn(this, ...args);
    return this;
  }

  duration(ms: number): this {
    this._config._duration = ms;
    return this;
  }

  ease(fn: (t: number) => number): this {
    this._config._ease = fn;
    return this;
  }
}

/**
 * Animate a numeric attribute from current to target value.
 */
function animateAttribute(
  node: Element,
  name: string,
  target: string,
  duration: number,
  ease: (t: number) => number,
): void {
  const startValue = Number.parseFloat(node.getAttribute(name) || "0") || 0;
  const endValue = Number.parseFloat(target) || 0;
  if (duration <= 0 || startValue === endValue) {
    node.setAttribute(name, target);
    return;
  }
  const startTime = performance.now();
  const tick = (now: number) => {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = ease(t);
    const current = startValue + (endValue - startValue) * eased;
    node.setAttribute(name, String(current));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Animate a CSS style property (opacity, etc.).
 */
function animateStyle(
  node: Element,
  name: string,
  target: string,
  duration: number,
  ease: (t: number) => number,
): void {
  const style = (node as HTMLElement).style;
  if (!style) {
    return;
  }
  const current = style.getPropertyValue(name);
  const startValue = Number.parseFloat(current) || 0;
  const endValue = Number.parseFloat(target) || 0;
  if (duration <= 0 || startValue === endValue) {
    style.setProperty(name, target);
    return;
  }
  const startTime = performance.now();
  const tick = (now: number) => {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = ease(t);
    const val = startValue + (endValue - startValue) * eased;
    style.setProperty(name, String(val));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Create an SVG or HTML element based on context.
 */
function createSvgElement(type: string, parent: Element): Element {
  // If parent is in SVG namespace, create SVG element
  if (parent.namespaceURI === SVG_NS || parent instanceof SVGElement) {
    return document.createElementNS(SVG_NS, type);
  }
  return document.createElement(type);
}

/**
 * Select a single element. Matches d3's `select()` API.
 * Accepts a CSS selector string or an Element.
 */
export function select<E extends Element = Element, _D = unknown>(
  selectorOrNode: string | E,
): Selection<E, unknown, null, undefined> {
  let element: E | null;
  if (typeof selectorOrNode === "string") {
    element = document.querySelector<E>(selectorOrNode);
  } else {
    element = selectorOrNode;
  }
  return new Selection<E, unknown, null, undefined>(
    [element ? [element] : []],
    [document.documentElement],
  );
}

/**
 * Standalone transition factory.
 * Returns a TransitionConfig that can be shared across selections.
 */
export function transition(): TransitionConfig {
  return new TransitionConfig();
}

/**
 * Sine in-out easing function.
 * Matches d3's `easeSinInOut`.
 */
export function easeSinInOut(t: number): number {
  return (1 - Math.cos(Math.PI * t)) / 2;
}

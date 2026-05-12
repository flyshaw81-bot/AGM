/**
 * Self-developed zoom behavior for SVG elements.
 * Replacement for d3-zoom.
 *
 * Provides mouse wheel zoom, touch pinch zoom, and drag panning
 * with a transform model compatible with d3-zoom's API surface.
 */

/**
 * Zoom transform — immutable transform object.
 * k = scale, x/y = translation.
 */
export class ZoomTransform {
  readonly k: number;
  readonly x: number;
  readonly y: number;

  constructor(k: number, x: number, y: number) {
    this.k = k;
    this.x = x;
    this.y = y;
  }

  translate(tx: number, ty: number): ZoomTransform {
    return new ZoomTransform(
      this.k,
      this.x + this.k * tx,
      this.y + this.k * ty,
    );
  }

  scale(s: number): ZoomTransform {
    return new ZoomTransform(this.k * s, this.x, this.y);
  }

  toString(): string {
    return `translate(${this.x},${this.y}) scale(${this.k})`;
  }
}

/**
 * Identity transform (k=1, x=0, y=0).
 */
export const zoomIdentity = new ZoomTransform(1, 0, 0);

type ZoomEventHandler = (event: ZoomEvent) => void;

interface ZoomEvent {
  transform: ZoomTransform;
  sourceEvent: Event | null;
}

/**
 * Zoom behavior — attaches to an SVG element and dispatches zoom events.
 */
export class ZoomBehavior {
  private _scaleMin = 0;
  private _scaleMax = Number.POSITIVE_INFINITY;
  private _translateExtent: [[number, number], [number, number]] | null = null;
  private _handlers: { [type: string]: ZoomEventHandler | null } = {};
  private _element: Element | null = null;
  private _transform: ZoomTransform = zoomIdentity;

  // Drag state
  private _dragging = false;
  private _dragStartX = 0;
  private _dragStartY = 0;
  private _dragStartTransformX = 0;
  private _dragStartTransformY = 0;

  // Touch state
  private _touches: Map<number, { x: number; y: number }> = new Map();
  private _touchStartDist = 0;
  private _touchStartScale = 1;
  private _touchStartCenter: [number, number] = [0, 0];
  private _touchStartTransform: ZoomTransform = zoomIdentity;

  // Bound handlers for cleanup
  private _boundWheel: ((e: WheelEvent) => void) | null = null;
  private _boundMouseDown: ((e: MouseEvent) => void) | null = null;
  private _boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private _boundMouseUp: ((e: MouseEvent) => void) | null = null;
  private _boundTouchStart: ((e: TouchEvent) => void) | null = null;
  private _boundTouchMove: ((e: TouchEvent) => void) | null = null;
  private _boundTouchEnd: ((e: TouchEvent) => void) | null = null;

  scaleExtent(extent: [number, number]): this {
    this._scaleMin = extent[0];
    this._scaleMax = extent[1];
    return this;
  }

  translateExtent(): [[number, number], [number, number]] | null;
  translateExtent(extent: [[number, number], [number, number]]): this;
  translateExtent(
    extent?: [[number, number], [number, number]],
  ): this | [[number, number], [number, number]] | null {
    if (!extent) return this._translateExtent;
    this._translateExtent = extent;
    return this;
  }

  on(typenames: string, handler: ZoomEventHandler | null): this {
    const types = typenames.trim().split(/\s+/);
    for (const type of types) {
      this._handlers[type] = handler;
    }
    return this;
  }

  /**
   * Apply this zoom behavior to an element.
   * Called as `selection.call(zoom)` in d3 pattern.
   */
  apply(selectionOrElement: unknown): void {
    // Handle both Selection and direct Element
    let element: Element | null = null;
    if (
      selectionOrElement &&
      typeof (selectionOrElement as any).node === "function"
    ) {
      element = (selectionOrElement as any).node();
    } else if (selectionOrElement instanceof Element) {
      element = selectionOrElement;
    }
    if (!element) return;
    this._element = element;
    this._attachListeners(element);
  }

  /**
   * Programmatically set the transform.
   * Can accept a Selection/TransitionSelection as first arg (for animated transitions).
   * Second arg is the target transform.
   */
  transformTo = (
    selectionOrTransition: unknown,
    targetTransform: ZoomTransform,
  ): void => {
    if (!this._element) return;

    // Check if this is an animated transition
    const duration = (selectionOrTransition as any)?._config?._duration;
    const ease = (selectionOrTransition as any)?._config?._ease;

    if (duration && duration > 0) {
      // Animated transition
      this._animateTransform(
        targetTransform,
        duration,
        ease || ((t: number) => t),
      );
    } else {
      // Instant transform
      this._setTransform(targetTransform, null);
    }
  };

  /**
   * Get the current transform.
   */
  getTransform(): ZoomTransform {
    return this._transform;
  }

  /**
   * Sync the internal transform state without dispatching events.
   * Use this when an external process (e.g., initial viewport fit)
   * has set the DOM transform and you need the zoom behavior to be
   * aware of it so subsequent wheel/touch interactions don't drift.
   */
  syncInternalTransform(k: number, x: number, y: number): void {
    this._transform = new ZoomTransform(
      Math.min(this._scaleMax, Math.max(this._scaleMin, k)),
      x,
      y,
    );
  }

  private _setTransform(t: ZoomTransform, sourceEvent: Event | null): void {
    const k = Math.min(this._scaleMax, Math.max(this._scaleMin, t.k));
    const x = t.x;
    const y = t.y;

    this._transform = new ZoomTransform(k, x, y);
    this._dispatch("zoom", sourceEvent);
  }

  private _dispatch(type: string, sourceEvent: Event | null): void {
    const handler = this._handlers[type];
    if (!handler) return;
    // d3 v5 compat: also set the event on the behavior for `d3.event` style access
    (this as any)._event = { transform: this._transform, sourceEvent };
    handler({ transform: this._transform, sourceEvent });
    (this as any)._event = null;
  }

  private _animateTransform(
    target: ZoomTransform,
    duration: number,
    ease: (t: number) => number,
  ): void {
    const start = this._transform;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const et = ease(t);
      const k = start.k + (target.k - start.k) * et;
      const x = start.x + (target.x - start.x) * et;
      const y = start.y + (target.y - start.y) * et;
      this._setTransform(new ZoomTransform(k, x, y), null);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private _attachListeners(element: Element): void {
    this._boundWheel = this._onWheel.bind(this);
    this._boundMouseDown = this._onMouseDown.bind(this);
    this._boundMouseMove = this._onMouseMove.bind(this);
    this._boundMouseUp = this._onMouseUp.bind(this);
    this._boundTouchStart = this._onTouchStart.bind(this);
    this._boundTouchMove = this._onTouchMove.bind(this);
    this._boundTouchEnd = this._onTouchEnd.bind(this);

    element.addEventListener("wheel", this._boundWheel as EventListener, {
      passive: false,
    });
    element.addEventListener(
      "mousedown",
      this._boundMouseDown as EventListener,
    );
    element.addEventListener(
      "touchstart",
      this._boundTouchStart as EventListener,
      { passive: false },
    );

    // Mouse move/up go on window for drag tracking
    window.addEventListener("mousemove", this._boundMouseMove as EventListener);
    window.addEventListener("mouseup", this._boundMouseUp as EventListener);
    window.addEventListener(
      "touchmove",
      this._boundTouchMove as EventListener,
      { passive: false },
    );
    window.addEventListener("touchend", this._boundTouchEnd as EventListener);
    window.addEventListener(
      "touchcancel",
      this._boundTouchEnd as EventListener,
    );
  }

  private _onWheel(e: WheelEvent): void {
    e.preventDefault();
    const rect = this._element!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // The zoom behavior is bound to the SVG element, but the transform is
    // applied to the #viewbox <g> child. Read from the correct element.
    const viewboxEl = this._element
      ? this._element.querySelector("#viewbox") || this._element
      : null;
    let domTransform = "";
    if (viewboxEl) {
      domTransform = (viewboxEl as Element).getAttribute("transform") || "";
    }
    const domMatch =
      /translate\(([-\d.]+(?:\.[\d]+)?)\s+([-\d.]+(?:\.[\d]+)?)\)\s+scale\(([-\d.]+(?:\.[\d]+)?)\)/.exec(
        domTransform,
      );

    // Always use the DOM transform as ground truth so external changes
    // (e.g. Studio viewport fit) never cause drift.
    let baseTransform = this._transform;
    if (domMatch) {
      baseTransform = new ZoomTransform(
        Number(domMatch[3]),
        Number(domMatch[1]),
        Number(domMatch[2]),
      );
    }

    // Zoom factor — normalize wheel delta
    const delta =
      -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002);
    const factor = 2 ** delta;

    const k = Math.min(
      this._scaleMax,
      Math.max(this._scaleMin, baseTransform.k * factor),
    );
    const ratio = k / baseTransform.k;
    const x = mx - (mx - baseTransform.x) * ratio;
    const y = my - (my - baseTransform.y) * ratio;

    this._setTransform(new ZoomTransform(k, x, y), e);
  }

  private _onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return; // left button only
    this._dragging = true;
    this._dragStartX = e.clientX;
    this._dragStartY = e.clientY;
    this._dragStartTransformX = this._transform.x;
    this._dragStartTransformY = this._transform.y;
    e.preventDefault();
  }

  private _onMouseMove(e: MouseEvent): void {
    if (!this._dragging) return;
    const dx = e.clientX - this._dragStartX;
    const dy = e.clientY - this._dragStartY;
    this._setTransform(
      new ZoomTransform(
        this._transform.k,
        this._dragStartTransformX + dx,
        this._dragStartTransformY + dy,
      ),
      e,
    );
  }

  private _onMouseUp(_e: MouseEvent): void {
    this._dragging = false;
  }

  private _onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      this._touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
      });
    }

    if (this._touches.size === 2) {
      const [t1, t2] = Array.from(this._touches.values());
      this._touchStartDist = Math.hypot(t1.x - t2.x, t1.y - t2.y);
      this._touchStartScale = this._transform.k;
      this._touchStartCenter = [(t1.x + t2.x) / 2, (t1.y + t2.y) / 2];
      this._touchStartTransform = this._transform;
    } else if (this._touches.size === 1) {
      const [t] = Array.from(this._touches.values());
      this._dragStartX = t.x;
      this._dragStartY = t.y;
      this._dragStartTransformX = this._transform.x;
      this._dragStartTransformY = this._transform.y;
    }
  }

  private _onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (this._touches.has(touch.identifier)) {
        this._touches.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY,
        });
      }
    }

    if (this._touches.size === 2) {
      // Pinch zoom
      const [t1, t2] = Array.from(this._touches.values());
      const dist = Math.hypot(t1.x - t2.x, t1.y - t2.y);
      const ratio = dist / this._touchStartDist;
      const k = Math.min(
        this._scaleMax,
        Math.max(this._scaleMin, this._touchStartScale * ratio),
      );
      const cx = (t1.x + t2.x) / 2;
      const cy = (t1.y + t2.y) / 2;
      const dx = cx - this._touchStartCenter[0];
      const dy = cy - this._touchStartCenter[1];
      const scaleRatio = k / this._touchStartTransform.k;
      const x =
        cx -
        (this._touchStartCenter[0] - this._touchStartTransform.x) * scaleRatio +
        dx -
        cx;
      const y =
        cy -
        (this._touchStartCenter[1] - this._touchStartTransform.y) * scaleRatio +
        dy -
        cy;

      this._setTransform(new ZoomTransform(k, x + cx, y + cy), e);
    } else if (this._touches.size === 1) {
      // Drag pan
      const [t] = Array.from(this._touches.values());
      const dx = t.x - this._dragStartX;
      const dy = t.y - this._dragStartY;
      this._setTransform(
        new ZoomTransform(
          this._transform.k,
          this._dragStartTransformX + dx,
          this._dragStartTransformY + dy,
        ),
        e,
      );
    }
  }

  private _onTouchEnd(e: TouchEvent): void {
    for (const touch of e.changedTouches) {
      this._touches.delete(touch.identifier);
    }
  }
}

/**
 * Create a new zoom behavior.
 * Matches d3's `zoom()` factory.
 */
export function zoom(): ZoomBehavior {
  return new ZoomBehavior();
}

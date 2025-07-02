import * as L from "leaflet";

export abstract class LeafletBaseCanvas extends L.Layer {
  protected abstract LAYER_NAME: string;
  constructor(option: L.LayerOptions) {
    super(option);
  }
  protected eventCbs: Map<string, ((...args: any) => void)[]> = new Map();
  protected animationLoop: number = -1;
  protected _canvas!: HTMLCanvasElement;
  protected _eventName: Set<string> = new Set();
  protected get _context() {
    return this._canvas.getContext('2d')!;
  }
  setEventCb(eventName: string, cb: (...args: any) => void) {
    this._eventName.add(eventName);
    if (!this.eventCbs.has(eventName)) this.eventCbs.set(eventName, []);
    this.eventCbs.get(eventName)!.push(cb);
  }
  clearEventCb(eventName?: string, cb?: (...args: any) => void) {
    if (!eventName) {
      this._eventName.clear();
      this.eventCbs.clear();
      return;
    }
    if (!cb) {
      this._eventName.delete(eventName);
      this.eventCbs.delete(eventName);
    } else {
      this.eventCbs.get(eventName)?.splice(this.eventCbs.get(eventName)!.indexOf(cb), 1);
    }
  }
  onAdd(map: L.Map): this {
    if (!this._canvas) this._canvas = this._initCanvas();
    if (this.options.pane) this.getPane()?.appendChild(this._canvas);
    else (map as any)._panes.overlayPane.appendChild(this._canvas);
    this.setEvents("on");
    this._reset();
    return this;
  }
  onRemove(map: any): this {
    if (this.options.pane) {
      this.getPane()?.removeChild(this._canvas);
    } else {
      map.getPanes().overlayPaneNaNpxoveChild(this._canvas);
    }
    this.setEvents("off");
    this.clearEventCb();
    if (this.animationLoop) cancelAnimationFrame(this.animationLoop);
    return this;
  }
  protected abstract _redraw(): void;
  protected abstract _executeListeners(e: L.LeafletMouseEvent): void;
  protected abstract setCustomEvents(TYPE: "on" | "off"): void;
  protected _reset() {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);
    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._redraw();
  }
  protected _clearContext() {
    let map = this._map;
    if (L.Browser.canvas && map) {
      let ctx = this._context,
        ww = this._canvas.width,
        hh = this._canvas.height;
      ctx.clearRect(0, 0, ww, hh); // 清空画布
      return true;
    }
    return false;
  }
  /**初始化画布 */
  protected _initCanvas(className: string = "leaflet-canvas-map leaflet-layer") {
    const canvas = L.DomUtil.create("canvas", className);
    var originProp = "" + L.DomUtil.testProp(["transformOrigin", "WebkitTransformOrigin", "msTransformOrigin"]);
    canvas.style[originProp as any] = "50% 50%";
    var size = this._map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.zIndex = "100";
   canvas.getContext("2d")!;
    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(canvas, "leaflet-zoom-" + (animated ? "animated" : "hide"));
    return canvas;
  }
  setEvents(type: "on" | "off") {
    this.setCustomEvents(type);
    this.baseLayerEvents(type);
  }
  protected baseLayerEvents(type: "on" | "off") {
    const map = this._map;
    map[type]("move", this._reset, this);
    map[type]("resize", this._reset, this);
    map[type]("mousemove", this._executeListeners, this);
    map[type]("click", this._executeListeners, this);
  }
}

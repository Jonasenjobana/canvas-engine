import { LeafletBaseCanvas } from "./common/leaflet-base-canvas"
import { MapLayerBase } from "./map-layer.base";
import { LeafletMouseEvent, Map } from "leaflet";
import * as L from "leaflet";

/**
 * 图层渲染管理
 */
export class MapLayerControl extends LeafletBaseCanvas {
  protected LAYER_NAME: string = "MapLayerControl";
  get map() {
    return this._map;
  }
  /**动态图层 */
  animeCanvas!: HTMLCanvasElement;
  layers: Set<MapLayerBase> = new Set();
  animeFlag: number = -1;
  /**默认30帧 */
  animeFrame: number = 30;
  get wh() {
    return this._map.getSize();
  }
  get animeFrameDiff() {
    return 1000 / this.animeFrame;
  }
  get ctx() {
    return this._context;
  }
  get animeCtx() {
    return this.animeCanvas.getContext("2d");
  }
  setPointer(flag: boolean) {
    this._map.getContainer().style.cursor = flag ? "pointer" : "grab";
  }
  constructor() {
    super({});
  }
  onAdd(map: Map): this {
    if (!this._canvas) this._canvas = this._initCanvas("control-canvas-layer");
    if (this.options.pane) this.getPane()?.appendChild(this._canvas);
    else (map as any)._panes.overlayPane.appendChild(this._canvas);
    this.setEvents("on");
    this.animeCanvas = this._initCanvas("control-anime-canvas");
    this._canvas.parentElement!.appendChild(this.animeCanvas);
    this._reset();
    return this;
  }
  onRemove(map: Map): this {
    super.onRemove(map);
    
    cancelAnimationFrame(this.animeFlag);
    this.animeCanvas.remove();
    return this;
  }
  protected _reset(): void {
    super._reset();
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this.animeCanvas, topLeft);
    var size = this._map.getSize();
    this.animeCanvas.width = size.x;
    this.animeCanvas.height = size.y;
    this._redraw();
  }
  protected _clearContext() {
    let map = this._map;
    if (L.Browser.canvas && map) {
      let ctx = this._context,
        ww = this._canvas.width,
        hh = this._canvas.height;
      ctx.clearRect(0, 0, ww, hh); // 清空画布
      // this.animeCtx!.clearRect(0, 0, ww, hh);
      return true;
    }
    return false;
  }
  addLayer(layer: MapLayerBase) {
    this.layers.add(layer);
  }
  removeLayer(layer: MapLayerBase) {
    this.layers.delete(layer);
  }
  get layerList() {
    return [...this.layers];
  }
  protected _redraw(): void {
    this._clearContext();
    this.animeLoop();
    this.layerList.forEach((layer) => {
      layer.updateRbush();
      layer.renderLayer();
    });
  }
  protected _executeListeners(e: LeafletMouseEvent): void {
    this.layerList.forEach((layer) => layer.eventEmit(e.type, e));
    if (e.type == 'mousemove') {
      requestAnimationFrame(() => {
        // this.setPointer(this.layerList.some(layer => layer.pointer));
      })
    }
  }
  protected setCustomEvents(TYPE: "on" | "off"): void {
    // throw new Error("Method not implemented.");
  }
  animeLoop() {
    let prevTime = Date.now();
    cancelAnimationFrame(this.animeFlag);
    const animeTick = () => {
      let now = Date.now();
      let diff = now - prevTime;
      if (diff >= this.animeFrameDiff || diff <= 0) {
        this.animeCtx?.clearRect(0, 0, this.wh.x, this.wh.y);
        // tick call
        this.layerList.forEach((layer) => {
          layer.animeTickEmit(now)
        });
        prevTime = now;
      }
      this.animeFlag = requestAnimationFrame(animeTick);
    };
    animeTick();
  }
  /**执行渲染进程 */
  taskRender: boolean = false;
  renderQueue: number = 0;
  /**子元素请求渲染 渲染批处理 */
  requestRender() {
    this.renderQueue++;
    if (this.taskRender) return Promise.resolve(true);
    return new Promise((res) => {
      this.taskRender = true;
      this.renderQueue--;
      setTimeout(() => {
        this._redraw();
        res(true);
      }, 100);
    }).finally(() => {
      // 重置标志，允许新的渲染请求
      this.taskRender = false;
      // 检查在渲染期间是否有新的请求
      if (this.renderQueue > 0) {
        this.requestRender();
        this.renderQueue = 0;
      }
    })
  }
}

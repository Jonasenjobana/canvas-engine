import { SlCanvasEventName, SlCanvasEventDispatcher, SlCanvasEvent, MapAdapter, NullMapAdapter } from "./event/sl-canvas-event";
import { SlCanvasLayer } from "./layer/sl-canvas-layer";
import { SlCanvasRender } from "./render/sl-canvas-render";
export interface SlCanvasStageOption {
  mapAdapter: MapAdapter;
  renderWidth?: number; // 渲染宽度 自定义坐标系统时需要设置
  renderHeight?: number; // 渲染高度
  zoom?: number; // 缩放比例 自定义坐标系统时需要设置
  center?: number[]; // 中心点 自定义坐标系统时需要设置
}
/**
 * canvas 
 */
export class SlCanvasStage extends SlCanvasEvent implements SlCanvasStageOption {
  constructor(private domEl: HTMLElement, public option?: SlCanvasStageOption) {
    super();
    this.mapAdapter = option?.mapAdapter || new NullMapAdapter();
    this.initStage(domEl);
  }
  /** 图层管理 */
  layer: SlCanvasLayer[] = [];
  /** 渲染ctx */
  context: CanvasRenderingContext2D | null = null;
  /** 画布 */
  canvasEl: HTMLCanvasElement | null = null;
  /** 事件分发器 */
  eventDispatcher!: SlCanvasEventDispatcher;
  /** 渲染器 */
  render: SlCanvasRender = new SlCanvasRender(this);
  mapAdapter: MapAdapter = new NullMapAdapter();
  /** 初始化 */
  initStage(domEl: HTMLElement) {
    const canvasEl = (this.canvasEl = document.createElement("canvas"));
    const { width, height } = domEl.getBoundingClientRect();
    canvasEl.width = width;
    canvasEl.height = height;
    this.context = canvasEl.getContext("2d")!;
    domEl.appendChild(canvasEl);
    this.initEvent();
    this.render.start();
  }
  /**
   * 初始化事件
   * 渲染事件和销毁事件
   *  */
  initEvent() {
    this.eventDispatcher = new SlCanvasEventDispatcher();
    const dispatchName: SlCanvasEventName[] = ["ticker-update", "destroy"];
    dispatchName.forEach((name) => {
      this.on(name);
    });
    if (this.canvasEl) {
      const domEventName: SlCanvasEventName[] = ["mousewheel", "mousedown", "mouseup", "mousemove"];
      domEventName.forEach((name) => {
        this.canvasEl!.addEventListener(name, (e) => {
          this.fire(name, e);
        });
      });
    }
  }
  on(name: SlCanvasEventName) {
    this.eventDispatcher.on(name, (...args: any) => {
      this.layer.forEach((layer) => {
        layer.fire(name, ...args);
      });
    });
  }
  fire(name: SlCanvasEventName, ...args: any[]) {
    this.eventDispatcher.fire(name, ...args);
  }
  off(name: SlCanvasEventName, callback?: Function): void {
    this.eventDispatcher.off(name, callback);
  }
}
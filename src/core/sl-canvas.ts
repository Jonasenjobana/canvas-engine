import { SlCanvasEventName, SlCanvasEventDispatcher, SlCanvasEvent, CoordinateTransformAdapter } from "./event/sl-canvas-event";
import { SlCanvasLayer } from "./layer/sl-canvas-layer";
import { SlCanvasRender } from "./render/sl-canvas-render";
export interface SlCanvasStageOption {
  viewBox?: [number, number]; // 渲染宽度 自定义坐标系统时需要设置
  zoom?: number; // 缩放比例 自定义坐标系统时需要设置
  center?: number[]; // 中心点 自定义坐标系统时需要设置
  allowDrag?: boolean; // 是否允许拖拽
  allowZoom?: boolean; // 是否允许缩放
  transformToCanvas?: (x: number, y: number) => { x: number; y: number }; // 转换为canvas坐标 自定义坐标系统时需要设置
  transformToOutside?: (x: number, y: number) => { x: number; y: number }; // 转换为外部定义 自定义坐标系统时需要设置
  debugger?: { // 测试调试
    bbox?: boolean // 显示边缘
    target?: boolean // 显示目标信息 layer element 等信息
  }
}
/**
 * canvas 
 */
export class SlCanvasStage extends SlCanvasEvent implements SlCanvasStageOption {
  constructor(public domEl: HTMLElement, public option?: SlCanvasStageOption) {
    super();
    this.initStage(domEl);
    if (option?.transformToCanvas && option?.transformToOutside) {
      this.cooridinate = new CoordinateTransformAdapter({ transformToCanvas: option.transformToCanvas, transformToOutside: option.transformToOutside});
    }
  }
  center?: number[] | undefined;
  viewBox?: [number, number] | undefined;
  zoom?: number | undefined;
  /** 图层管理 */
  layer: SlCanvasLayer[] = [];
  /** 图层升序 */
  get sortLayer() {
    return this.layer.sort((a, b) => a.zIndex - b.zIndex);
  }
  /** 渲染ctx */
  context: CanvasRenderingContext2D | null = null;
  /** 画布 */
  canvasEl: HTMLCanvasElement | null = null;
  /** 事件分发器 */
  eventDispatcher!: SlCanvasEventDispatcher;
  /** 渲染器 */
  render: SlCanvasRender = new SlCanvasRender(this);
  /** 坐标转化适配 */
  cooridinate: CoordinateTransformAdapter = new CoordinateTransformAdapter();
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
  setCenter(center: number[]) {
    this.center = center;
    // this.update();
  }
  /**
   * 初始化事件
   * 渲染事件和销毁事件
   *  */
  initEvent() {
    this.eventDispatcher = new SlCanvasEventDispatcher();
    const dispatchName: SlCanvasEventName[] = ["ticker-update", "destroy"];
    dispatchName.forEach((name) => {
      this.eventDispatcher.on(name, (...args: any) => {
        this.layer.forEach((layer) => {
          layer.fire(name, ...args);
        });
      });
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
  on(name: SlCanvasEventName, cb?: Function) {
    this.eventDispatcher.on(name, (...args: any) => {
      if (cb) { // 如果有回调，执行回调
        cb(...args); // 执行回调函数，传入参数
      }
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
  /**
   * 外部更新
   * 由于坐标系变化可能需要重新计算
   *  */
  update() {

  }
}
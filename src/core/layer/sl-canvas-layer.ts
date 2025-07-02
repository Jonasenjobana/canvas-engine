import { SlCanvasElement } from "../element/sl-canvas-element";
import {
  SlCanvasEventName,
  SlCanvasEventDispatcher,
  SlCanvasEvent,
} from "../event/sl-canvas-event";
import { SlCanvasStage } from "../sl-canvas";
import RBush, { BBox } from 'rbush';
import { SlBBox } from "../type";
export class SlCanvasLayer extends SlCanvasEvent {
  stage: SlCanvasStage | null = null;
  elements: SlCanvasElement[] = [];
  zIndex: number = 0;
  eventDispatcher: SlCanvasEventDispatcher = new SlCanvasEventDispatcher();
  rbush: RBush<SlBBox> = new RBush(); // 用于存储元素的 RBush 树
  virtualCanvas: HTMLCanvasElement = document.createElement("canvas"); // 用于绘制元素的假画布
  get virtualCtx() {
    return this.virtualCanvas.getContext("2d", { willReadFrequently: true })!;
  }
  get virtualImageData() {
    return this.virtualCtx.getImageData(0, 0, this.virtualCanvas.width, this.virtualCanvas.height);
  }
  isDirty: boolean = false; // 是否需要重新绘制
  // 获取脏画布区域
  /**
   * 初始化假画布
   */
  initLayerCanvas() {
    if (this.stage) {
      const { width, height } = this.stage.domEl.getBoundingClientRect();
      this.virtualCanvas.width = width;
      this.virtualCanvas.height = height;
      this.virtualCtx.clearRect(0, 0, width, height);
    }
  }
  getDirtyArea() {

  }
  renderLayer(): ImageData {
    return this.virtualCtx.getImageData(0, 0, this.virtualCanvas.width, this.virtualCanvas.height);
  }
  constructor() {
    super();
    this.initEvent();
  }
  addTo(stage: SlCanvasStage) {
    this.stage = stage;
    stage.layer.push(this);
    this.initLayerCanvas();
    return this;
  }
  remove() {
    if (this.stage) {
      this.stage.layer = this.stage.layer.filter((layer) => layer !== this);
      this.stage = null;
    }
  }
  addElement(element: SlCanvasElement) {
    this.elements.push(element);
  }
  initEvent() {
    const dispatchName: SlCanvasEventName[] = ["ticker-update", "destroy"];
    dispatchName.forEach((name) => {
        this.on(name);
    });
  }
  // 要是模拟dom渲染的话 根据css样式设置渲染优先级 先是父元素背景 边框 如果有overflowhidden 则裁剪 然后是子元素 内部需要处理滚动逻辑
  // 这里就不模拟dom渲染了 直接渲染所有元素 然后根据zIndex排序 然后渲染
  fire(name: SlCanvasEventName, ...args: any[]) {
    this.eventDispatcher.fire(name, ...args);
  }
  on(name: SlCanvasEventName): void {
    this.eventDispatcher.on(name, (...args: any) => {
      this.elements.forEach((element) => {
        element.fire(name, ...args);
      });
    });
  }
  off(name: SlCanvasEventName, callback?: Function): void {
    this.eventDispatcher.off(name, callback);
  }
}

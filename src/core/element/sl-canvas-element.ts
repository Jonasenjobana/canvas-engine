import { SlCanvasEvent, SlCanvasEventDispatcher, SlCanvasEventName } from "../event/sl-canvas-event";
import { SlCanvasLayer } from "../layer/sl-canvas-layer";
export interface SlCanvasElementOption {
  width?: number; // 元素宽度
  height?: number; // 元素高度
  lat?: number; // 元素纬度
  lng?: number; // 元素经度
  x?: number; // 元素x坐标
  y?: number; // 元素y坐标
  zIndex?: number; // 元素zIndex
  relatePosition?: {
    x?: number; // 元素x坐标相对于父元素的偏移量
    y?: number; // 元素y坐标相对于父元素的偏移量
  }
}
export abstract class SlCanvasElement extends SlCanvasEvent {
  constructor(public option: SlCanvasElementOption = {}) {
    super();
    this.setOption(option);
    this.initEvent();
  }
  get context() {
    return this.layer?.context || null;
  }
  /**相同属性 位置不同 减少画笔切换性能开销 */
  groupsElement: SlCanvasElement[] = [];
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  zIndex?: number;
  rotation?: number;
  relatePosition?: {
    x?: number; // 元素x坐标相对于父元素的偏移量
    y?: number; // 元素y坐标相对于父元素的偏移量
  }
  layer: SlCanvasLayer | null = null;
  children: SlCanvasElement[] = [];
  parent?: SlCanvasElement;
  eventDispatcher: SlCanvasEventDispatcher = new SlCanvasEventDispatcher();
  protected tickerCb: Function = (time: number) => void 0;
  stopPropagation: boolean = false; // 停止事件传播，默认不停止;
  setGroupsElement(position: number[][]) { // 设置元素的属性
    // this.groupsElement = position; // 清空当前元素的子元素列表
    return this; // 返回当前元素，方便链式调用
  }
  setOption(option: SlCanvasElementOption) { // 设置元素的属性
    Object.assign(this, option); // 将option中的属性赋值给当前元素
    return this; // 返回当前元素，方便链式调用
  }
  addElement(element: SlCanvasElement) {
    this.children.push(element); // 将元素添加到当前元素的子元素列表中
    element.parent = this; // 设置元素的父元素为当前元素
  }
  addTo(addInItem: SlCanvasLayer | SlCanvasElement) {
    if (this.layer) { // 如果元素已经在其他layer中，先移除
      this.remove();
    }
    if (addInItem instanceof SlCanvasLayer) {
      this.layer = addInItem; // 保存引用到layer，方便后续操作layer的元素列表
      this.layer.elements.push(this); // 将元素添加到layer的元素列表中
      addInItem.addElement(this);
    } else if (addInItem instanceof SlCanvasElement) { // 如果是元素且已经在其他layer中，先移除
      this.layer = addInItem.layer; // 保存引用到layer，方便后续操作layer的元素列表
      addInItem.addElement(this); // 将元素添加到layer的元素列表中
    } else {
      throw new Error('addTo参数错误');
    }
    return this;
  }
  remove() {
    if (!this.layer) return this;
    if (this.parent) { // 如果有父元素，先从父元素的子元素列表中移除
      this.parent.children = this.parent.children.filter(child => child !== this); // 从父元素的子元素列表中移除
      return this;
    } else {
      this.layer.elements = this.layer.elements.filter(element => element!== this); // 从layer的元素列表中移除
    }
    const index = this.layer.elements.indexOf(this); // 获取当前元素在layer中的索引
    if (index !== -1) { // 如果找到了元素
      this.layer.elements.splice(index, 1); // 从layer的元素列表中移除
    }
    this.layer = null; // 清除对layer的引用  
    return this;
  }
  /**
   * 整体画布动画一帧触发一次
   */
  animeTicket(cb: (timeStamp: number) => void) {
    this.tickerCb = cb;
    return this;
  }
  abstract render(): void;
  initEvent(): void {
    this.eventDispatcher.on('ticker-update', (time: number) => { // 监听ticker-update事件，触发render方法
      this.render(); // 调用当前元素的render方法
      this.tickerCb(time); // 调用tickerCb callbac
      this.children.forEach(child => {
        child.fire('ticker-update', time); // 递归调用子元素的fire方法
      })
    })
  }
  on(name: SlCanvasEventName, callback: Function): void {
    this.eventDispatcher.on(name, callback); // 调用父类的on方法
  }
  off(name: SlCanvasEventName, callback?: Function): void {
    this.eventDispatcher.off(name, callback);
  }
  fire(name: SlCanvasEventName, ...args: any[]): void {
    this.eventDispatcher.fire(name,...args); // 调用父类的fire方法
  }
}

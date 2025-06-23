export type SlCanvasEventName = "ticker-update" | "destroy" | "resize" | "mousedown" | "mousemove" | "mouseup" | "mousewheel";

export interface MapAdapter {
  /**
   * 监听地图事件
   */
  on(eventName: string, handler: (event: any) => void): void;

  /**
   * 移除地图事件监听
   */
  off(eventName: string, handler: (event: any) => void): void;

  /**
   * 获取地图容器DOM元素
   */
  getContainer(): HTMLElement;

  /**
   * 销毁适配器
   */
  destroy(): void;
  /**
   * 新增：Canvas坐标转地图坐标
   */
  canvasToMap(point: { x: number; y: number }): { lat: number; lng: number };

  /**
   * 新增：地图坐标转Canvas坐标
   */
  mapToCanvas(point: { lat: number; lng: number }): { x: number; y: number };
}
/**
 * 默认空适配器（无地图时使用）
 */
export class NullMapAdapter implements MapAdapter {
  on(eventName: string, handler: (event: any) => void): void {}
  off(eventName: string, handler: (event: any) => void): void {}
  getContainer(): HTMLElement {
    throw new Error("NullMapAdapter: No map container available");
  }
  canvasToMap(point: { x: number; y: number }): { lat: number; lng: number } {
    return {
      lat: point.y, // 无地图不变
      lng: point.x, // 无地图不变
    }; // 无地图不变
  }
  mapToCanvas(point: { lat: number; lng: number }): { x: number; y: number } {
    return {
      x: point.lng, // 无地图不变
      y: point.lat, // 无地图不变
    }; // 无地图不变
  }
  destroy(): void {}
}
export interface SlCanvasEventDetail {
  x: number; // 鼠标x坐标
  y: number; // 鼠标y坐标
  deltaX: number; // 鼠标x方向移动距离
  deltaY: number; // 鼠标y方向移动距离
  deltaZ: number; // 鼠标滚轮滚动距离
}
export abstract class SlCanvasEvent {
  eventDispatcher: SlCanvasEventDispatcher = new SlCanvasEventDispatcher();
  preventDefault: boolean = false; // 阻止默认事件，默认不阻止;
  stopPropagation: boolean = false; // 停止事件传播，默认不停止
  abstract fire(name: SlCanvasEventName, ...args: any[]): void;
  abstract on(name: SlCanvasEventName, callback?: Function): void;
  abstract off(name: SlCanvasEventName, callback?: Function): void;
  abstract initEvent(): void;
} // 事件基类，用于扩展其他事件类型的基类，如 SlCanvasMouseEvent 等。目前没有使用到，可忽略。
/**事件分发器 */
export class SlCanvasEventDispatcher {
  // 事件存储结构: { 事件名称: [{ 回调函数, 是否一次性 }] }
  private events: Record<string, Array<{ callback: Function; once: boolean }>> = {};

  /**
   * 注册事件监听
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: SlCanvasEventName, callback: Function): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push({ callback, once: false });
  }

  /**
   * 注册一次性事件监听（触发后自动移除）
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  once(eventName: SlCanvasEventName, callback: Function): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push({ callback, once: true });
  }

  /**
   * 移除事件监听
   * @param eventName 事件名称
   * @param callback 可选，指定要移除的回调（不提供则移除该事件所有监听）
   */
  off(eventName: SlCanvasEventName, callback?: Function): void {
    if (!this.events[eventName]) return;

    // 移除特定回调或所有回调
    if (callback) {
      this.events[eventName] = this.events[eventName].filter((item) => item.callback !== callback);
    } else {
      delete this.events[eventName];
    }
  }

  /**
   * 触发事件并分发参数
   * @param eventName 事件名称
   * @param args 传递给回调的参数（支持多个）
   */
  fire(eventName: SlCanvasEventName, ...args: any[]): void {
    if (!this.events[eventName]) return;

    // 创建副本防止在触发过程中修改原数组导致异常
    const callbacks = [...this.events[eventName]];
    callbacks.forEach(({ callback, once }, index) => {
      // 执行回调并传递参数
      callback.apply(this, args);

      // 如果是一次性事件，从原数组中移除
      if (once) {
        this.events[eventName] = this.events[eventName].filter((_, i) => i !== index);
      }
    });
  }

  /**
   * 清除所有事件监听
   */
  clear(): void {
    this.events = {};
  }

  /**
   * 获取当前注册的事件名称列表
   * @returns 事件名称数组
   */
  getEventNames(): string[] {
    return Object.keys(this.events);
  }

  /**
   * 检查事件是否有监听
   * @param eventName 事件名称
   * @returns 是否存在监听
   */
  hasListeners(eventName: string): boolean {
    return !!this.events[eventName]?.length;
  }
}

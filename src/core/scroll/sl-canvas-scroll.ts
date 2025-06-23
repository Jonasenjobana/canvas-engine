import { SlCanvasElement } from "../element/sl-canvas-element";

// 滚动基类 最后渲染的 鼠标悬浮显示
export class SlCanvasScroll extends SlCanvasElement {
    parentContainer?: any
    childrendContainer?: any
    scrollOffsetX: number = 0; // 水平滚动偏移量
    scrollOffsetY: number = 0; // 垂直滚动偏移量
    scrollLeft: number = 0; // 水平滚动位置
    scrollTop: number = 0; // 垂直滚动位置
    hover?: boolean = false; // 鼠标悬浮显示
    constructor() {
        super();
    }
    render(): void {
        throw new Error("Method not implemented.");
    }
}
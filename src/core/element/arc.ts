import { SlCanvasElement, SlCanvasElementOption } from "./sl-canvas-element";
export interface SlCanvasArcOption extends SlCanvasElementOption {
  radius: number; // 半径
  startAngle: number; // 起始角度
  endAngle: number; // 结束角度
  strokeStyle?: string; // 边框颜色
  fillStyle?: string; // 填充颜色
  lineWidth?: number; // 边框宽度
}
export class SlCanvasArc extends SlCanvasElement implements SlCanvasArcOption {
  constructor(option: SlCanvasArcOption) {
    super(option);
    this.setOption(option);
  }
  radius: number = 0;
  startAngle: number = 0;
  endAngle: number = Math.PI * 2;
  strokeStyle?: string | undefined;
  fillStyle?: string | undefined;
  lineWidth?: number | undefined;
  render(context?: CanvasRenderingContext2D | null): void {
    context = context || this.context;
    if (context) {
      context.save();
      context.translate(this.x || 0, this.y || 0); // 移动到元素的位置
      context.rotate(this.rotation || 0); // 旋转元素
      context.beginPath(); // 开始绘制路径
      context.arc(0, 0, this.radius, this.startAngle, this.endAngle); // 绘制圆形
      if (this.strokeStyle) { // 如果有边框颜色，绘制边框
        context.strokeStyle = this.strokeStyle; // 设置边框颜色
        context.lineWidth = this.lineWidth || 1; // 设置边框宽度
        context.stroke(); // 绘制边框
      }
      if (this.fillStyle) { // 如果有填充颜色，绘制填充
        context.fillStyle = this.fillStyle; // 设置填充颜色
        context.fill(); // 绘制填充
      }
      context.restore();
    }
  }
}

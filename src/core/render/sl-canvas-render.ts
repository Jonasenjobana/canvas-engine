import { SlCanvasStage } from "../sl-canvas";

export class SlCanvasRender {
  constructor(public stage: SlCanvasStage) {}
  get ctx() {
    return this.stage.context;
  }
  private readonly FPS_LIMIT: number = 60;
  // 动画控制状态
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private frameInterval: number = 1000 / this.FPS_LIMIT;
  private renderId: number = 0;
  // 启动动画循环
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.ticker(performance.now());
  }
  // 停止动画循环
  stop(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.renderId);
  }
  ticker(currentTime: number) {
    if (!this.isRunning) return;

    // 计算时间差 (毫秒)
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // 帧率控制
    if (this.deltaTime < this.frameInterval) {
      this.renderId = requestAnimationFrame((time) => this.ticker(time));
      return;
    }

    // 执行更新和渲染
    this.update(this.deltaTime / 1000); // 转换为秒

    // 请求下一帧
    this.renderId = requestAnimationFrame((time) => this.ticker(time));
  }

  // 同步更新所有图层
  private update(deltaTime: number): void {
    this.ctx?.clearRect(0, 0, this.stage.canvasEl!.width, this.stage.canvasEl!.height);
    // 按图层深度排序 (确保正确绘制顺序)
    this.stage.fire('ticker-update', { deltaTime });
  }
}

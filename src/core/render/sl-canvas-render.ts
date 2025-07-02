import { SlCanvasStage } from "../sl-canvas";

export class SlCanvasRender {
  constructor(public stage: SlCanvasStage) {}
  get ctx() {
    return this.stage.context;
  }
  private readonly FPS_LIMIT: number = 10;
  // 动画控制状态
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private frameInterval: number = 1000 / this.FPS_LIMIT;
  private renderId: number = 0;
  /**像素数据 */
  get layer() {
    return this.stage.sortLayer;
  }
  // 启动动画循环
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    // 直接请求下一帧，避免第一次 deltaTime 为 0
    this.renderId = requestAnimationFrame((time) => this.ticker(time));
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
    // 帧率控制
    if (this.deltaTime >= this.frameInterval) {
      this.lastTime = currentTime;
      // 执行更新和渲染
      this.update(this.deltaTime / 1000); // 转换为秒
    }
    // 统一请求下一帧
    this.renderId = requestAnimationFrame((time) => this.ticker(time));
  }

  // 同步更新所有图层
  private update(deltaTime: number): void {
    // this.ctx?.clearRect(0, 0, this.stage.canvasEl!.width, this.stage.canvasEl!.height);
    const imageDatas = this.layer.map((layer) => {
      return layer.renderLayer(); // 调用每个图层的 render 方法
    });
    imageDatas.forEach((imageData) => {
      this.ctx?.putImageData(imageData, 0, 0); // 绘制到主画布上
    })
    // 按图层深度排序 (确保正确绘制顺序)
    this.stage.fire('ticker-update', { deltaTime });
  }
}

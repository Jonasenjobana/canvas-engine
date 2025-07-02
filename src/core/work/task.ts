/**
 * 绘制批处理
 *  */
export class RenderTask {
  private tasks: Function[] = [];
  addTask(task: Function) {
    this.tasks.push(task);
  }
  render() {
    this.tasks.forEach((task) => {
      task();
    });
    this.tasks = [];
  }
}
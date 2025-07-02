// 缩放计算坐标算法
export function CanvasMap(id) {
  this.datas = [[300, 780], [50, 50]]
  this.projectZoom = {
    offsetProject: [0, 0], // 偏移量
    scaleProject: 1, // 缩放比例
    scaleProjectMin: 1, // 最小缩放比例
    scaleProjectMax: 10, // 最大缩放比例
    centerProject: [0, 0], // 中心点
  }
  this.ctx = initCanvas.call(this, id);
  function initCanvas(id) {
    var canvas = document.getElementById(id);
    this.ctx = canvas.getContext("2d");
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.projectZoom.centerProject = [rect.width / 2, rect.height / 2]; // 中心点
}
  function initEvent() {
    // 记录鼠标当前位置A
    // 记录缩放后A的位置变化B
    // 平移变化B到原来位置A
    let mousePos = [0,0]
    this.ctx.canvas.addEventListener("mousewheel",  (e) => {
      var x = e.clientX;
      var y = e.clientY;
      this.projectZoom.scaleProject = e.wheelDelta > 0 ? 1.1 : 0.9; // 缩放比例
      // if (this.projectZoom.scaleProject < this.projectZoom.scaleProjectMin) { // 最小缩放比例
      //   this.projectZoom.scaleProject = this.projectZoom.scaleProjectMin;
      // } else if (this.projectZoom.scaleProject > this.projectZoom.scaleProjectMax) { // 最大缩放比例
      //   this.projectZoom.scaleProject = this.projectZoom.scaleProjectMax;
      // }
      this.datas.forEach((item) => {
        item[0] = (item[0] - mousePos[0]) * this.projectZoom.scaleProject + mousePos[0]; // 缩放后x坐标
        item[1] = (item[1] - mousePos[1]) * this.projectZoom.scaleProject + mousePos[1]; // 缩放后y坐标
      })
      mousePos = [x, y]; // 中心点
      this.render();
      console.log(this.projectZoom);
    });
    let drag = {
      isDrag: false, // 是否拖动
      startPos: [0, 0], // 起始位置
      endPos: [0, 0], // 结束位置
      offsetPos: [0, 0], // 偏移量
    }
    this.ctx.canvas.addEventListener("mousedown", (e) => {
      drag.isDrag = true;
    })
    this.ctx.canvas.addEventListener("mousemove", (e) => {
      if (drag.isDrag) {
        console.log(e)
        drag.offsetPos = [e.movementX, e.movementY]; // 偏移量
        this.datas.forEach((item) => {
          item[0] += drag.offsetPos[0]; // 偏移后x坐标
          item[1] += drag.offsetPos[1]; // 偏移后y坐标
        })
        this.render();
      }
    })
    this.ctx.canvas.addEventListener("mouseup", (e) => {
      drag.isDrag = false;
      this.projectZoom.offsetProject = [this.projectZoom.offsetProject[0] + drag.offsetPos[0], this.projectZoom.offsetProject[1] + drag.offsetPos[1]]; // 偏移量
    })
  }
  initCanvas.call(this, id);
  initEvent.call(this);
  this.render = function ()  {
    console.log(this.ctx, this.data);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.beginPath();
    this.ctx.fillStyle = "red";
    this.ctx.arc(this.datas[0][0], this.datas[0][1], 10, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.fillStyle = "blue";
    this.ctx.arc(this.datas[1][0], this.datas[1][1], 10, 0, 2 * Math.PI);
    this.ctx.fill();
  }
}

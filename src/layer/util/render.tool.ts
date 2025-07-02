/**
 * 
 * @param renderPath 
 * @returns 
 */
function drawPath(renderPath: { width: number; height: number; paths: [number, number][] }): Path2D {
  const { width, height, paths } = renderPath;
  return new Path2D()
}
/**
 * 绘制线
 * @param opt 
 */
function drawLine(opt: {points: [number, number][], ctx: CanvasRenderingContext2D}) {
  const { ctx, points } = opt;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1, len = points.length; i < len; i++) {
    let point = points[i];
    ctx.lineTo(point[0], point[1]);
  }
  ctx.stroke();
}
/**
 * 绘制圆点
 * @param opt {points: [number, number], radius: number, ctx: CanvasRenderingContext2D}
 */
function drawArc(opt: {points: [number, number], radius: number, ctx: CanvasRenderingContext2D}) {
  const { points, radius, ctx } = opt;
  ctx.beginPath();
  ctx.arc(points[0], points[1], radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
}

/**
 * @param opt {point: [number, number], width: number, height: number, ctx: CanvasRenderingContext2D} 左上角开始
 */
function drawRect(opt: {point: [number, number], width: number, height: number, ctx: CanvasRenderingContext2D}) {
    const { point, width, height, ctx } = opt;
    ctx.beginPath();
    ctx.rect(point[0], point[1], width, height);
    ctx.stroke();
    ctx.fill();
}

export { drawPath, drawLine, drawArc, drawRect };
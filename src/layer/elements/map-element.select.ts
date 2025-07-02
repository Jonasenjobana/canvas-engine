import { drawLine } from "../util/render.tool";
import { MapElementBase, MapElementOption } from "./map-element.base";

/**
 * 业务 选中框
 */
export class MapElementSelectRect extends MapElementBase {
  constructor(opt: MapElementOption) {
    super(opt);
    this.clickable = false;
    this.hidden = true;
    this.alawayRender = true;
    this.isAnime = false;
  }
  target: MapElementBase | null = null;
  clickable: boolean = false;
  waitNextTick: boolean = true;
  prevTargetAABBBox: { minX: number; minY: number; maxX: number; maxY: number } = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  setTarget(target: MapElementBase) {
    if (this.target) {
      this.prevTargetAABBBox = this.target.aabbBox();
    }
    this.target = target;
    this.waitNextTick = true;
    this.parent?.requestRender();
  }
  aabbBox(): { minX: number; minY: number; maxX: number; maxY: number } {
    if (this.waitNextTick) {
      return this.prevTargetAABBBox;
    }
    return this.target?.aabbBox() || { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  render(ctx: CanvasRenderingContext2D): this {
    if (!this.target) return this;
    if (!this.target.inView) return this;
    let { minX, minY, maxX, maxY } = this.aabbBox();
    let w = maxX - minX;
    let h = maxY - minY;
    // 最小尺寸 32 * 32选中框大小
    if (w <= 28 || h <= 28) {
      let diffX = 28 - w,
        diffY = 28 - h;
      if (diffX > 0) {
        minX -= diffX / 2;
        maxX += diffX / 2;
      }
      if (diffY > 0) {
        minY -= diffY / 2;
        maxY += diffY / 2;
      }
      w = maxX - minX;
      h = maxY - minY;
    }
    const linePrecent = 0.25;
    const lineLen = Math.min(w, h) * linePrecent;
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#e02020";
    // 选中框
    // 左上角
    drawLine({
      points: [
        [minX, minY + lineLen],
        [minX, minY],
        [minX + lineLen, minY],
      ],
      ctx,
    });
    // 右上角
    drawLine({
      points: [
        [maxX - lineLen, minY],
        [maxX, minY],
        [maxX, minY + lineLen],
      ],
      ctx,
    });
    // 右下角
    drawLine({
      points: [
        [maxX, maxY - lineLen],
        [maxX, maxY],
        [maxX - lineLen, maxY],
      ],
      ctx,
    });
    // 左下角
    drawLine({
      points: [
        [minX + lineLen, maxY],
        [minX, maxY],
        [minX, maxY - lineLen],
      ],
      ctx,
    });
    ctx.beginPath();
    ctx.fillStyle = "#ff000020";
    ctx.fillRect(minX - 2, minY - 2, w + 4, h + 4);
    ctx.restore();
    this.waitNextTick = false;
    return this;
  }
}

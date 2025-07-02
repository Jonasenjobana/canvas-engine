import * as turf from '@turf/turf';
import { getPXSize } from "../../util/map.tool";
import { ImageCached, MapElementBase, MapElementOption } from "../map-element.base";
interface MapElementShipOption extends MapElementOption {
  id: string; // mmsi 或 id 用于更新一个
  typeCode: string;
  rotate: number;
  shipInfo?: {
    shipWidth: number;
    shipLength: number;
    cog: number;
    heading: number;
  };
}
const ShipTypeColorConfig: any = {
  "1": "#91ef91", // 货船
  "2": "#ff0000", // 油轮
  "3": "#0000ff", // 客船
  "4": "#ffff02", // 高速船
  "5": "#ffa17a", // 渔船
  "6": "#ff00ff", // 游艇
  "7": "#01ffff", // 拖船/特种
  "8": "#bfbfbf", // 其他
  "9": "#9a5af9", // 作业船
};
const ExtraShipTypeConfig: any = {
  w: "/assets/img/map/ship/white.png", // 白名单
  b: "/assets/img/map/ship/black.png" // 黑名单
};
interface ShapePath {
  width: number;
  height: number;
  paths: [number, number][];
}
/**
 * 绘制路径
 * 比例
 */
const ShipRenderPath: { width: number; height: number; paths: [number, number][] } = {
  width: 24,
  height: 64,
  paths: [
    [12, 0],
    [24, 6],
    [24, 60],
    [16, 64],
    [8, 64],
    [0, 60],
    [0, 6],
    [12, 0],
  ],
};
/**
 * 绘制路径
 * 图标模拟
 */
const ShipRenderPath2: { width: number; height: number; paths: [number, number][] } = {
  width: 28,
  height: 28,
  paths: [
    [13, 2],
    [22, 26],
    [13, 22],
    [4, 26],
    [13, 2],
  ],
};
/**
 * 业务定制 纯canvas绘制
 * 根据typeCode或者层级变化
 * 可能是icon 可能是自定义路径绘制 可能是雪碧图 动态
 */
export class MapElementShip extends MapElementBase implements MapElementShipOption {
  constructor(opt: MapElementShipOption) {
    super(opt);
    this.id = opt.id;
    this.typeCode = opt.typeCode;
    this.rotate = opt.rotate;
    this.shipInfo = opt.shipInfo;
    // 下标图标
    const extraUrl = ExtraShipTypeConfig[this.extraCode] || "";
    if (extraUrl) {
      this.setImage(extraUrl);
    }
  }

  id: string;
  typeCode: string;
  rotate: number;
  shipInfo?: {
    shipWidth: number;
    shipLength: number;
    cog: number;
    heading: number;
  };
  isSelected: boolean = false;
  isFocus: boolean = false;
  get shipCode() {
    return this.typeCode.split("-")[0];
  }
  get extraCode() {
    return this.typeCode.split("-")[1] || "";
  }
  get zoomLevel() {
    return this.map!.getZoom();
  }
  get radain() {
    return (this.rotate * Math.PI) / 180;
  }
  image: HTMLImageElement = new Image();
  renderPath?: Path2D
  pathAABB: { minX: number; minY: number; maxX: number; maxY: number } = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  aabbBox(): { minX: number; minY: number; maxX: number; maxY: number } {
    return this.pathAABB;
  }
  render(context: CanvasRenderingContext2D): this {
    if (!this.map) {
      throw new Error("map is null");
    }
    let renderCtx = context || this.ctx;
    const shipColor = ShipTypeColorConfig[this.shipCode] || "#bfbfbf";
    const extraUrl = ExtraShipTypeConfig[this.extraCode] || "";
    const zoom = this.map.getZoom();
    const {x, y} = this.containerPosition!;
    const { shipWidth = 0, shipLength = 0 } = this.shipInfo || {};
    const widthPx = getPXSize(this.map, this.latlng, shipWidth);
    const lenPx = getPXSize(this.map, this.latlng, shipLength);
    const renderShapPath = widthPx > 8 || lenPx > 16;
    renderCtx.save();
    renderCtx.strokeStyle = "#000";
    if (zoom > 15 && renderShapPath) {
      this.textElement && (this.textElement.type = 'area');
      // 详细路径
      const { path, aabb } = this.drawShapeByPoint({ position: [x, y], rotate: this.rotate }, ShipRenderPath, [widthPx, lenPx]);
      this.pathAABB = aabb;
      this.renderPath = path;
    } else {
      this.textElement && (this.textElement.type = 'bottom');
      // 图标路径
      const size = this.getSizeByZoom();
      const { path, aabb } = this.drawShapeByPoint({ position: [x, y], rotate: this.rotate }, ShipRenderPath2, [size, size]);
      this.pathAABB = aabb;
      this.renderPath = path;
    }
    if (this.isSelected || this.isActive) {
      // 选中边缘
      renderCtx.strokeStyle = "#f00";
      renderCtx.lineWidth = 2;
    }
    renderCtx.fillStyle = shipColor;
    renderCtx.stroke(this.renderPath);
    renderCtx.fill(this.renderPath);
    // 除了基础图形 额外图形叠加标识
    if (extraUrl) {
      this.setImage(extraUrl);
      const size = this.getIconSizeByZoom();
      renderCtx.setTransform(1, 0, 0, 1, x, y);
      renderCtx.rotate(this.radain);
      // 下标图标
      renderCtx.drawImage(this.image, 3, 3, size, size);
      renderCtx.rotate(-this.radain);
      renderCtx.setTransform(1, 0, 0, 1, 0, 0);
    }
    renderCtx.restore();
    return this;
  }
  setImage(url: string) {
    if (ImageCached.has(url)) {
      this.image = ImageCached.get(url)!;
    } else {
      this.image = new Image();
      this.image.src = url;
      this.image.onload = () => {
        this.parent?.requestRender();
      };
      ImageCached.set(url, this.image);
    }
  }
  getSizeByZoom() {
    return this.zoomLevel < 10 ? 4 : this.zoomLevel < 12 ? 16 : this.zoomLevel < 16 ? 22 : 28;
  }
  getIconSizeByZoom() {
    return this.zoomLevel < 10 ? 4 : this.zoomLevel < 12 ? 6 : this.zoomLevel < 16 ? 8 : 10;
  }
  /**
   *
   * @param position 位置
   * @param rotate 选中
   * @param shape 形状
   * @param scaleSize 长宽比例
   * @returns
   */
  drawShapeByPoint(
    drawInfo: { position: [number, number]; rotate: number; showSpeedDirection?: boolean; showRotate?: boolean },
    shape: ShapePath,
    scaleSize?: [number, number]
  ): { path: Path2D; aabb: { minX: number; minY: number; maxX: number; maxY: number } } {
    const { position, rotate, showSpeedDirection, showRotate } = drawInfo;
    const { width, height, paths } = shape;
    scaleSize = scaleSize || [width, height];
    const [cx, cy] = position;
    /**左上角位置 obb包围盒*/
    const [ltx, lty] = [cx - scaleSize[0] / 2, cy - scaleSize[1] / 2];
    const [w, h] = scaleSize;
    const path = new Path2D();
    /**基于OBB包围盒范围缩放 */
    const scaleX = w / width;
    const scaleY = h / height;
    const arc = (rotate * Math.PI) / 180;
    /**路径旋转 矩阵转化 */
    const rotateUpdate = (x: number, y: number) => {
      return {
        x: (x - cx) * Math.cos(arc) - (y - cy) * Math.sin(arc) + cx,
        y: (x - cx) * Math.sin(arc) + (y - cy) * Math.cos(arc) + cy,
      };
    };
    const { x: mvx, y: mvy } = rotateUpdate(paths[0][0] * scaleX + ltx, paths[0][1] * scaleY + lty);
    path.moveTo(mvx, mvy);
    for (let i = 1; i < paths.length; i++) {
      const { x: lineX, y: lineY } = rotateUpdate(paths[i][0] * scaleX + ltx, paths[i][1] * scaleY + lty);
      path.lineTo(lineX, lineY);
    }
    if (showSpeedDirection) {
      const { x: mvx2, y: mvy2 } = rotateUpdate(paths[0][0] * scaleX + ltx, (paths[0][1] - 12) * scaleY + lty);
      // 速度比例
      path.moveTo(mvx, mvy);
      path.lineTo(mvx2, mvy2);
      // 转弯
      if (showRotate) {
        const { x: mvx3, y: mvy3 } = rotateUpdate(paths[0][0] * scaleX + ltx + 4, (paths[0][1] - 12) * scaleY + lty);
        path.lineTo(mvx3, mvy3);
        path.lineTo(mvx2, mvy2);
      }
    }
    path.closePath();
    /**适当放大包围盒边界 保证在aabb盒内部 */
    const bound = 1;
    const a = rotateUpdate(ltx - bound, lty - bound);
    const a2 = rotateUpdate(ltx + w + bound, lty - bound);
    const b2 = rotateUpdate(ltx - bound, lty + h + bound);
    const b = rotateUpdate(ltx + w + bound, lty + h + bound);
    const rect = turf.polygon([
      [
        [a.x, a.y],
        [a2.x, a2.y],
        [b.x, b.y],
        [b2.x, b2.y],
        [a.x, a.y],
      ],
    ]);
    const [minX, minY, maxX, maxY] = turf.bbox(rect);
    return {
      path,
      aabb: {
        minX,
        minY,
        maxX,
        maxY,
      },
    };
  }
}

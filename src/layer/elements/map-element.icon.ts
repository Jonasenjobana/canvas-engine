import { ImageCached, MapElementBase, MapElementOption } from "./map-element.base";

export interface MapElementIconOption extends MapElementOption {
  url: string;
  rotate: number;
  /**渲染大小 */
  size: [number, number];
  /**整图中截取的大小 */
  sizeo?: [number, number];
  text?: string;
  /**截图偏移x */
  posX?: number;
  /**截图偏移y */
  posY?: number;
  /**相对原画布x y 偏移 */
  left?: number;
  /**相对原画布x y 偏移 */
  top?: number;
}
/**基础图形 */
export class MapElementIcon extends MapElementBase implements MapElementIconOption {
  constructor(opt: MapElementIconOption) {
    super(opt);
    this.url = opt.url;
    this.rotate = opt.rotate;
    this.size = opt.size;
    this.sizeo = opt.sizeo;
    this.text = opt.text || '';
    this.setImage();
  }
  setImage() {
    if (ImageCached.has(this.url)) {
      this.image = ImageCached.get(this.url)!;
    } else {
      this.image = new Image();
      this.image.src = this.url;
      ImageCached.set(this.url, this.image);
    }
  }
  image: HTMLImageElement | null = null;
  text: string = "";
  url: string = "";
  rotate: number = 0;
  posX?: number;
  posY?: number;
  left: number = 0;
  top: number = 0;
  get radain() {
    return (this.rotate * Math.PI) / 180;
  }
  /** 整图中截取的大小 */
  sizeo?: [number, number];
  /** 渲染大小 */
  size: [number, number] = [0, 0];
  aabbBox(): { minX: number; minY: number; maxX: number; maxY: number } {
    const {x, y} = this.containerPosition || {x: 0, y: 0};
    return {
      minX: x - this.size[0] / 2 + this.left,
      minY: y - this.size[1] / 2 + this.top,
      maxX: x + this.size[0] / 2 + this.left,
      maxY: y + this.size[1] / 2 + this.top 
    }
  }
  render(context?: CanvasRenderingContext2D): this {
    const that = this;
    const { ctx, sizeo, size, image, containerPosition, radain, posX = 0, posY = 0, left = 0, top = 0 } = that;
    let renderCtx = context || ctx;
    if (image && renderCtx && containerPosition) {
      let { x, y } = containerPosition;
      let sizeX: number = size[0],
        sizeY: number = size[1],
        sizeOX = sizeo && sizeo[0],
        sizeOY = sizeo && sizeo[1];
      renderCtx.setTransform(1, 0, 0, 1, x, y);
      renderCtx.rotate(radain);
      if (sizeOX && sizeOY) {
        /**-sizeX/2 和-sizeY/2确定了图片的中心位置在x,y点 */
        renderCtx.drawImage(image, posX, posY, sizeOX, sizeOY, -sizeX / 2 + left, -sizeY / 2 + top, sizeX, sizeY);
      } else {
        /**-sizeX/2 和-sizeY/2确定了图片的中心位置在x,y点 */
        renderCtx.drawImage(image, -sizeX / 2 + left, -sizeY / 2 + top, sizeX, sizeY);
      }
      renderCtx.rotate(-radain);
      renderCtx.setTransform(1, 0, 0, 1, 0, 0);
    }
    return this;
  }

}

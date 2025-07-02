import { ImageCached, MapElementBase } from "./map-element.base";
import { MapElementIconOption } from "./map-element.icon";

export interface MapElementSpriteOption extends MapElementIconOption {
  url: string;
  frame: FrameSprite[];
}
/**
 * 精灵图动画配置
 */
interface FrameSprite {
  startFrame: number;
  endFrame: number;
  posX: number;
  posY: number;
  spriteSize: [number, number];
}
/**
 * 精灵图 自定义动画帧播放动画
 */
export class MapElementSprite extends MapElementBase implements Omit<MapElementIconOption, "sizeo"> {
  constructor(opt: MapElementSpriteOption) {
    super({
      ...opt,
      isAnime: true,
    });
    this.url = opt.url || "";
    this.rotate = opt.rotate || 0;
    this.size = opt.size || [0, 0];
    this.frame = opt.frame || [];
    this.setImage();
  }
  url: string;
  rotate: number = 0;
  size!: [number, number];
  posX?: number | undefined;
  posY?: number | undefined;
  left?: number | undefined;
  top?: number | undefined;
  image: HTMLImageElement | null = null;
  frame: FrameSprite[] = [];
  /**当前帧数 */
  currentFrame: number = 0;
  /**总帧数 */
  get frameCount() {
    return this.frame[this.frame.length - 1].endFrame;
  }
  get currentFrameData() {
    return this.frame.find((f) => this.currentFrame >= f.startFrame && this.currentFrame <= f.endFrame);
  }
  get radain() {
    return (this.rotate * Math.PI) / 180;
  }
  aabbBox(): { minX: number; minY: number; maxX: number; maxY: number } {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  render(context: CanvasRenderingContext2D): this {
    this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    const that = this;
    const { ctx, size, image, containerPosition, radain, currentFrameData, left = 0, top = 0 } = that;
    let renderCtx = context || ctx;
    if (image && renderCtx && containerPosition && currentFrameData) {
      const { posX, posY, spriteSize } = currentFrameData
      let { x, y } = containerPosition;
      let sizeX: number = size[0],
        sizeY: number = size[1],
        sizeOX = spriteSize && spriteSize[0],
        sizeOY = spriteSize && spriteSize[1];
      renderCtx.save();
      renderCtx.setTransform(1, 0, 0, 1, x, y);
      renderCtx.rotate(radain);
      renderCtx.drawImage(image, posX, posY, sizeOX, sizeOY, -sizeX / 2 + left, -sizeY / 2 + top, sizeX, sizeY);
      renderCtx.rotate(-radain);
      renderCtx.setTransform(1, 0, 0, 1, 0, 0);
    }
    return this;
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
}

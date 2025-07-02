import { SLUHypertxt } from "../../ship/slu-hypertxt";
import { MapLayerBase } from "../map-layer.base";
import { MapElementBase, MapElementOption } from "./map-element.base";
import rbush from "rbush";
interface TextFontRect {
  paddingTop: number
  paddingLeft: number
  backgroundColor: string
}
export interface MapTextOption extends MapElementOption {
  text: string;
  maxWidth?: number;
  px?: number;
  py?: number;
  textAlign?: "left" | "right" | "center";
  fontColor?: string;
  /**文本框 */
  fontRect?: TextFontRect
  fontSize?: number;
  fontFamily?: string;
  /**文字显示在底部 或者 四周寻找间隙 */
  type: 'bottom' | 'area';
  overlap: boolean;// 重叠排版 隐藏 active则显示到最顶层
}
/**
 * canvas字体排版渲染
 */
export class MapTextBase implements MapTextOption {
  constructor(opt: MapTextOption) {
    this.text = opt.text;
    this.maxWidth = opt.maxWidth;
    this.px = opt.px;
    this.py = opt.py;
    this.textAlign = opt.textAlign;
    this.fontSize = opt.fontSize || 12;
    this.fontFamily = opt.fontFamily || 'Microsoft YaHei';
    this.type = opt.type || 'bottom';
    this.overlap = opt.overlap || false;
    this.fontRect = opt.fontRect;
    this.id = opt.id;
  }
  id: string;
  fontRect?: TextFontRect;
  parent: MapLayerBase | null = null;
  overlap: boolean;
  type: 'bottom' | 'area';
  text: string = "";
  maxWidth?: number | undefined;
  px?: number | undefined;
  py?: number | undefined;
  textAlign?: "left" | "right" | "center" | undefined;
  fontSize?: number | undefined;
  fontFamily?: string | undefined;
  target: MapElementBase | null = null;
  position: [number, number] = [0, 0];
  textWidth: number = 0;
  lineHeight: number = 0;
  /**绑定元素 根据绑定元素计算重叠位置*/
  setTarget(target: MapElementBase) {
    this.target = target;
    return this;
  }
  getTextWidth() {
    if (this.ctx) {
      this.ctx.save();
      this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      const w = this.ctx.measureText(this.text).width;
      this.ctx.restore();
    }
  }
  get map() {
    return this.parent?.map;
  }
  get ctx() {
    return this.parent?.ctx;
  }
  get font() {
    return `${this.fontSize}px ${this.fontFamily}`;
  }
  /**自动根据长度 换行字符串 */
  wordWrap(text: string): string[] {
    const that = this;
    const { font, maxWidth = -1, ctx } = that;
    if (!ctx) return [text];
    /**强制分行分隔符 */
    let strs = text.split("\n").filter((e) => e != "");
    if (maxWidth <= 0) return strs;
    let texts: string[] = [];
    // 逗号自动根据最大宽度分隔
    strs.forEach((text) => {
      texts.push(
        ...SLUHypertxt.splitMultilineText(ctx, text, font, maxWidth, true, (str) => {
          return [str.lastIndexOf(",") + 1];
        })
      );
    });
    return texts;
  }
  get fontWidth() {
    return
  }
  aabbBox(): { minX: number; minY: number; maxX: number; maxY: number } {
    const {minX, minY, maxX, maxY} = this.targetAABB;
    if (this.type == 'bottom') {
      return { minX: minX - this.textWidth / 2, minY: maxY + 2, maxX: maxX + this.textWidth / 2, maxY: maxY + 20 };
    } else {

    }
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  get targetAABB() {
    return this.target!.aabbBox();
  }
  /**
   * 文本渲染 重叠处理
   * @param ctx 
   * @param alreadyRenderAABB 已经渲染的矩形区域 
   * @returns 
   */
  render(ctx: CanvasRenderingContext2D, alreadyRenderAABB: { minX: number; minY: number; maxX: number; maxY: number }[]): this {
    if (!this.target) return this;
    let tmpBush = new rbush();
    tmpBush.load(alreadyRenderAABB);
    const overlapList = tmpBush.search(this.aabbBox());
    if (overlapList.length > 0 && !this.target.isActive) {
      // 区域文本重叠 且目标非激活状态
      if (this.type == 'bottom') {
        // 隐藏不渲染
        return this;
      } else {
        // 自动寻找可渲染区域
      }
    }
    const that = this, {target, px, py, textAlign, font, text, fontRect} = that;
    const {minX, minY, maxX, maxY} = target!.aabbBox();
    const { paddingTop, paddingLeft, backgroundColor } = fontRect || {paddingTop: 2, paddingLeft: 4, backgroundColor: '#fff'};
    ctx.save();
    if (this.type == 'bottom') {
      ctx.font = font;
      ctx.textBaseline = 'top';
      const {fontBoundingBoxDescent} = ctx.measureText('M');
      const {width} = ctx.measureText(text.trim());
      this.textWidth = width;
      this.lineHeight = fontBoundingBoxDescent + 2;
      if (this.target.isActive) {
        ctx.fillStyle = '#b5dcfe';
        ctx.fillRect(minX - (this.textWidth - maxX + minX) / 2 - paddingLeft, maxY, this.textWidth + paddingLeft * 2, this.lineHeight + paddingTop * 2);
      }
      ctx.fillStyle = '#000';
      ctx.fillText(text.trim(), minX - (this.textWidth - maxX + minX) / 2, maxY + 4 + paddingTop);
    } else {

    }
    ctx.restore();
    return this;
  }
}

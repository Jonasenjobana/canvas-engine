import * as L from "leaflet";
import { MapLayerBase } from "../map-layer.base";
import { MapTextBase, MapTextOption } from "./map-text.base";
export const ImageCached = new Map<string, HTMLImageElement>();
export interface MapElementOption {
  latlng?: [number, number];
  zIndex?: number;
  hidden?: boolean;
  clickable?: boolean;
  isAnime?: boolean;
  textOpt?: MapTextOption;
  id: string
}
export abstract class MapElementBase implements MapElementOption {
  constructor(elementOpt: MapElementOption) {
    this.latlng = elementOpt.latlng || [0, 0];
    this.zIndex = elementOpt.zIndex || 0;
    this.hidden = elementOpt.hidden || false;
    this.clickable = elementOpt.clickable || true;
    this.isAnime = elementOpt.isAnime || false;
    this.textOpt = elementOpt.textOpt || { type: 'bottom', overlap: false, text: '', id: elementOpt.id  };
    this.id = elementOpt.id;
    this.setText(this.textOpt);
  }
  id: string = '';
  textOpt!: MapTextOption
  hidden: boolean = false;
  zIndex: number = 0;
  latlng: [number, number];
  parent: MapLayerBase | null = null;
  clickable: boolean = true;
  isAnime: boolean = false;
  /**是否触发过点击事件 */
  isTriggerClick: boolean = false;
  /**是否处于激活状态 置于顶层 */
  isActive: boolean = false;
  /**总是渲染不会被过滤掉 */
  alawayRender: boolean = false;
  textElement: MapTextBase | null = null;
  animeTickCb: (time: number) => void = () => {};
  eventMap: Map<string, ((...args: any) => void)[]> = new Map();
  get containerPosition() {
    return this.map?.latLngToContainerPoint(L.latLng(this.latlng[0], this.latlng[1]));
  }
  get inView() {
    return this.map?.getBounds().contains(L.latLng(this.latlng[0], this.latlng[1]));
  }
  get map() {
    return this.parent?.map;
  }
  get ctx() {
    return this.parent?.ctx;
  }
  abstract aabbBox(): { minX: number; minY: number; maxX: number; maxY: number };
  abstract render(ctx: CanvasRenderingContext2D): this;
  animeTick(cb: (time: number) => void) {
    this.animeTickCb = cb;
    return this;
  }
  /**暂时只有click */
  on(type: string, cb: (...args: any) => void) {
    if (this.eventMap.has(type)) {
      this.eventMap.get(type)?.push(cb);
    } else {
      this.eventMap.set(type, [cb]);
    }
    return this;
  }
  off(type: string, cb: (...args: any) => void) {
    if (this.eventMap.has(type)) {
      this.eventMap.get(type)?.splice(this.eventMap.get(type)!.indexOf(cb), 1);
    }
  }
  fire(type: string, ...args: any) {
    this.eventMap.get(type)?.forEach((cb) => cb(...args));
  }
  /**
   * 绑定内置文本元素
   * @param textOpt 
   * @returns 
   */
  setText(textOpt: MapTextOption) {
    const {text} = textOpt;
    if (!text) {
      this.textElement = null;
    } else {
      this.textElement = this.textElement || new MapTextBase(textOpt).setTarget(this);
    }
    return this;
  }
  updateElement(newElement: MapElementBase) {
    this.latlng = newElement.latlng || this.latlng;
    this.zIndex = newElement.zIndex || this.zIndex;
    this.hidden = newElement.hidden || this.hidden;
    this.clickable = newElement.clickable || this.clickable;
    this.isAnime = newElement.isAnime || this.isAnime;
    this.textOpt = newElement.textOpt || this.textOpt;
    this.setText(this.textOpt);
  }
}

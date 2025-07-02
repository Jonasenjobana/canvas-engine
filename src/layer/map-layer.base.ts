import * as L from "leaflet";
import { MapElementBase } from "./elements/map-element.base";
import { MapLayerControl } from "./map-layer-control";
import rbush from "rbush";
import { MapTextBase } from "./elements/map-text.base";
import RBush from "rbush";
/**
 * leaflet 基础图层继承类
 * 由controllayer进行统一渲染管理
 */
export class MapLayerBase {
  elements: MapElementBase[] = [];
  map: L.Map | null = null;
  /**图层层级 */
  zIndex: number = 0;
  offlineCanvas!: HTMLCanvasElement;
  offlineAnimeCanvas!: HTMLCanvasElement;
  /**用于事件触发 */
  rbush: RBush<{minX: number, maxX: number, minY: number, maxY: number, data: MapElementBase}> = new rbush();
  // textOverlap: TextRectOverlap = new TextRectOverlap();
  pointer: boolean = false;
  control: MapLayerControl | null = null;
  activeElement: MapElementBase | null = null;
  setPointer(flag: boolean) {
    this.pointer = flag;
  }
  get ctx() {
    return this.control?.ctx;
  }
  get animeCtx() {
    return this.control?.animeCtx;
  }
  get sortElement() {
    let elements: MapElementBase[] = [];
    // 放置最后渲染 置顶
    let activeElements: MapElementBase[] = [];
    this.elements.forEach((el) => {
      if (el.isActive) {
        activeElements.push(el);
      } else {
        elements.push(el);
      }
    });
    elements.sort((a, b) => b.zIndex - a.zIndex);
    activeElements.sort((a, b) => b.zIndex - a.zIndex);
    return elements.concat(activeElements).filter((e) => (!e.hidden && e.inView) || e.alawayRender);
  }
  constructor() {}
  setElements(elements: MapElementBase[]) {
    this.elements = elements.map((e) => {
      e.parent = this;
      return e;
    });
    this.requestRender();
  }
  /**根据id 更新部分值 */
  updateElements(elements: MapElementBase[]) {
    const updateIds: string[] = [];
    this.elements.forEach(oldEl => {
      let newElement = elements.find(newEl => newEl.id === oldEl.id);
      if (newElement) {
        oldEl.updateElement(newElement);
        updateIds.push(oldEl.id);
      }
    })
    const newAddEl = elements.filter(newEl => !updateIds.includes(newEl.id)).map(newEl => {
      newEl.parent = this;
      return newEl;
    });
    this.elements = this.elements.concat(newAddEl);
    this.requestRender();
  }
  renderLayer() {
    let textEl: MapTextBase[] = [];
    this.sortElement.filter((e) => {
      if (e.textElement) {
        textEl.push(e.textElement);
      }
      return !e.isAnime;
    }).forEach((e) => {
      e.render(this.ctx!);
    });
    /**文本绘制 */
    textEl.reduce((renderList: { minX: number; minY: number; maxX: number; maxY: number }[], text) => {
      text.render(this.ctx!, renderList);
      renderList.push(text.aabbBox());
      return renderList;
    }, []);
  }
  updateRbush() {
    this.rbush.clear();
    const tmp = this.sortElement
      .filter((e) => e.clickable)
      .map((e) => {
        const aabb = e.aabbBox();
        return {
          ...aabb,
          data: e,
        };
      });
    this.rbush.load(tmp);
  }
  eventEmit(type: string, event: L.LeafletMouseEvent) {
    const { containerPoint } = event,
      { x, y } = containerPoint;
    const result = this.rbush.search({ minX: x, minY: y, maxX: x, maxY: y });
    this.setPointer(result.length > 0);
    if (this.activeElement) {
      this.activeElement.isActive = false;
    }
    if (result.length == 0) {
      if (this.activeElement) {
        this.activeElement = null;
        this.requestRender();
      }
      return;
    }
    let data;
    // 防止重复触发 点击切换
    let findRbush: any = null;
    /**相同位置触发 */
    let sameArea = false;
    result.forEach((rbush: any) => {
      if (!rbush.data.isTriggerClick) {
        findRbush = rbush;
      }
      if (!sameArea && this.activeElement == rbush.data) {
        sameArea = true;
      }
    });
    if (!findRbush) {
      result.forEach((e: any) => {
        e.data.isTriggerClick = false;
      });
      data = result[0].data;
    } else {
      data = findRbush.data;
    }
    if (!sameArea) {
      this.activeElement && (this.activeElement.isActive = false);
      this.activeElement = data;
    }
    data.isActive = true;
    if (type == "click") {
      data.isTriggerClick = true;
      data.fire("click", { ...event, target: data });
    } else if (type == "mousemove") {
      data.fire("mousemove", { ...event, target: data });
    }
    this.requestRender();
  }
  requestRender() {
    this.control!.requestRender();
  }
  addTo(control: MapLayerControl) {
    control.addLayer(this);
    this.map = control.map;
    this.control = control;
    return this;
  }
  animeTickEmit(now: number) {
    this.sortElement
      .filter((el) => el.isAnime)
      .forEach((el) => {
        el.animeTickCb(now);
        el.render(this.animeCtx!);
      });
  }
}

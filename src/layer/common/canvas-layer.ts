import * as L from "leaflet";
import { SLUMap } from "../slu-map";
declare var AMap: any;
/** 地图canvas基础图层类(基本所有插件都要继承此类) 删除永远比新增简单 */
export class MapCanvasLayer {
    constructor(MAP: L.Map, opt?: MapCanvasPara)
    constructor(MAP: AMAP.Map, opt?: AMAP.CustomLayerOption)
    constructor(MAP: AMAP.Map | L.Map, opt?: AMAP.CustomLayerOption | MapCanvasPara)
    constructor(map: AMAP.Map | L.Map, opt?: AMAP.CustomLayerOption | MapCanvasPara) {
        this.map = map;
        Object.assign(this.options, opt);
        if (map instanceof L.Map) {
            this.type = 0;
            let layer = this.layer = new L.Layer(this.options);
            this.layer.onAdd = () => { this.onAdd(); return layer }
        } else if (map instanceof AMap.Map) {
            this.type = 1;
            opt = Object.assign({
                zooms: [3, 18],
                alwaysRender: false,//缩放过程中是否重绘，复杂绘制建议设为false
                zIndex: 200,
            }, opt);
            this.layer = new AMap.CustomLayer(this.canvas, opt);
        }
        this.initCanvas();
        this.onAdd();
    }
    /**开发自己设置项目使用了的地图插件类型Leaflet(0)、高德(1)、百度(2),防止网络加载的第三方插件再使用instanceof是为define*/
    protected readonly type: 0 | 1 | 2;
    protected readonly map!: AMAP.Map | L.Map;
    private layer: L.Layer | AMAP.CustomLayer;
    protected readonly canvas: HTMLCanvasElement = document.createElement('canvas');
    protected readonly ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;
    protected width: number = 0;
    protected height: number = 0;
    public readonly options: SLPMap.Canvas = {
        pane: 'canvas',
    };
    /**动画循环的id标识 */
    protected flagAnimation: number = 0;
    /**移除图层 */
    public onRemove() {
        const { flagAnimation } = this;
        this._eventSwitch(false);
        if (flagAnimation) cancelAnimationFrame(flagAnimation);
        this._onAmapRemove();
        this._onLeafletRemove();
        return this;
    }
    /** 清空并重新设置画布 */
    public resetCanvas(): void {
        const { canvas, map } = this;
        if (map instanceof L.Map) {
            var topLeft = map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);
        }
        const { w, h } = SLUMap.getMapSize(map);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        //清除画布
        this.width = canvas.width = w;
        this.height = canvas.height = h;
    }
    /**添加或关闭地图特定的监听事件(_eventSwitch事件后自动调用) */
    protected addMapEvents(map: AMAP.Map | L.Map, key: 'on' | 'off') { }
    /**绘制静态数据推荐使用此方法(固定的图) */
    protected renderFixedData() { };
    /** 推荐使用此方法绘制动态图(跟随鼠标拖动，移动时需要立刻绘制时)
     ** 动画图层绘制前的画布清空、计算等均在此方法中自行计算 
     ** 与renderFixedData本质是一样的
     */
    protected renderAnimation() { };
    /** */
    protected on(key: string, cb: Function) {
        this.map.on(key, (e) => { cb() })
    }
    /** */
    protected off(key: string, cb: Function) {
        this.map.off(key, (e) => { cb() })
    }
    /**初始化canvas */
    private initCanvas() {
        const { canvas, map, type, options, layer } = this;
        canvas.className = `sl-layer ${options.className || 'sl-canvas-map'}`;
        canvas.style['zIndex'] = `${options.zIndex || 100}`;
        canvas.style['transformOrigin'] = '50% 50%';
        this.initLeafletCanvas();
    }
    /** 将图层添加到map实例中显示 */
    private onAdd() {
        this._onAmapAdd();
        this._eventSwitch(true);
        this.layer['render'] = this._redraw;
        return this;
    }
    /**基础的监听事件   
    * @param flag true开启重绘事件监听 false 关闭重绘事件监听
    **/
    private _eventSwitch(flag: boolean = true) {
        let map = this.map;
        let key: 'on' | 'off' = flag ? 'on' : 'off';
        this.addLeafletEvent(flag);
        this.addMapEvents(map, key);
    }
    /**基础绘制 */
    /** 重绘(子类重写也无效)
     ** 清空之前的绘制
     ** ①高德地图渲染配置alwaysRender:true后拖动缩放会多次渲染
     */
    protected _redraw = () => {
        console.log('##########--------MapCanvasLayer=>_redraw--------##########')
        if (!this.map) return;
        this.resetCanvas();
        this.renderFixedData();
        this.renderAnimation();
    };
    /**------------------------------高德地图的实现------------------------------*/
    private _onAmapAdd() {
        const { map, layer, type } = this;
        if (type === 1) {
            (layer as AMAP.CustomLayer).setMap(map as AMAP.Map);
        }
    }
    private _onAmapRemove() {
        const { map, layer, type } = this;
        if (type === 1) {
            map.remove(layer as AMAP.CustomLayer);
            // (layer as AMAP.CustomLayer).destroy();
        }
    }
    /**------------------------------Leaflet地图的实现------------------------------*/
    /**初始化画布并添加到Pane中 */
    private initLeafletCanvas() {
        const { canvas, map, type, options } = this;
        if (type || !(map instanceof L.Map)) return;
        let pane = options.pane || 'overlayPane', paneEle = map.getPane(pane) || map.createPane(pane);
        /**如果指定的pane不存在就自己创建(往map添加div Pane) */
        paneEle.appendChild(canvas);
        paneEle.style.pointerEvents = 'none';
        let animated = map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
        L.extend(canvas, {
            onselectstart: L.Util.falseFn,
            onmousemove: L.Util.falseFn,
            onload: L.bind(this._onCanvasLoad, this),
        });
    }
    /**移除 */
    private _onLeafletRemove() {
        let { map, layer, options, type } = this;
        if (type == 0) {
            let pane = options.pane;
            pane && (map as L.Map).getPane(pane)?.removeChild(this.canvas);
            (layer as L.Layer).remove();
        }
    }
    private addLeafletEvent(flag: boolean = true) {
        let map = this.map;
        if (map instanceof L.Map) {
            /**为了和高德保持一致，初始化后渲染一次 */
            requestAnimationFrame(() => this._reset());
            let key: 'on' | 'off' = flag ? 'on' : 'off';
            map[key]('viewreset', this._reset, this);
            map[key]('resize', this._reset, this);
            map[key]('moveend', this._reset, this);
            if (map.options.zoomAnimation && L.Browser.any3d) {
                /**缩放动画 */
                map[key]('zoomanim', this._animateZoom, this);
            }
        };
    }
    /**重设画布,并重新渲染*/
    private _reset() {
        this.resetCanvas();
        this._redraw();
    }
    /**缩放动画 */
    private _animateZoom(e: any) {
        let map: any = this.map;
        var scale = map.getZoomScale(e.zoom),
            offset = map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(map._getMapPanePos());
        L.DomUtil.setTransform(this.canvas, offset, scale);
    }
    private _onCanvasLoad() {
        if (this.layer instanceof L.Layer) this.layer.fire('load');
    }



}
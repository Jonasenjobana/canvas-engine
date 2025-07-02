import * as L from "leaflet";
declare var AMap: any;
const a = 6378245.0;
const pi = 3.1415926535897932384626;
const ee = 0.00669342162296594323;
const x_pi = pi * 3000.0 / 180.0;
/**地球半径 */
const R = 6378137;
/** 百度转84 */
function tobd09gps84(lng: number, lat: number) {
    var gcj02 = tobd09cj02(lng, lat);
    var map84 = togcj02gps84(gcj02.lng, gcj02.lat);
    return map84;
}
/** 火星转84 */
function togcj02gps84(lng: number, lat: number) {
    var coord = transform(lng, lat);
    var lontitude = lng * 2 - coord.lng;
    var latitude = lat * 2 - coord.lat;
    var newCoord = {
        lng: lontitude,
        lat: latitude
    };
    return newCoord;
}
/** 84转百度 */
function togps84bd09(lng: number, lat: number) {
    var gcj02 = togps84gcj02(lng, lat);
    var bd09 = togcj02bd09(gcj02.lng, gcj02.lat);
    return bd09;
}
/** 84转火星 */
function togps84gcj02(lng: number, lat: number) {
    var dLat = transformLat(lng - 105.0, lat - 35.0);
    var dLng = transformLng(lng - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * pi;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    var mgLat = lat + dLat;
    var mgLng = lng + dLng;
    var newCoord = {
        lng: mgLng,
        lat: mgLat
    };
    return newCoord;
}
/** 火星转百度 */
function togcj02bd09(lng: number, lat: number) {
    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_pi);
    var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_pi);
    var bd_lng = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    var newCoord = {
        lng: bd_lng,
        lat: bd_lat
    };
    return newCoord;
}
/** 百度转火星 */
function tobd09cj02(bd_lng: number, bd_lat: number) {
    var x = bd_lng - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    var newCoord = {
        lng: gg_lng,
        lat: gg_lat
    };
    return newCoord;
}
function transform(lng: number, lat: number) {
    var dLat = transformLat(lng - 105.0, lat - 35.0);
    var dLng = transformLng(lng - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * pi;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    var mgLat = lat + dLat;
    var mgLng = lng + dLng;
    var newCoord = {
        lng: mgLng,
        lat: mgLat
    };
    return newCoord;
}
function transformLat(x: number, y: number) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    return ret;
}
function transformLng(x: number, y: number) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
    return ret;
}

/** 测算两点与Y轴形成的角度大小（Y轴方向 ↑ ）
* @param map 当前的地图
* @param latLngA 第一个点的[纬度，经度]
* @param latLngB 第二个点的[纬度，经度]
* @returns 两点与正北方的角度
*/
function getAngle(map: AMAP.Map | L.Map, latLngA: [number, number], latLngB: [number, number]): number {
    let [y0, x0] = getPointByLatlng(map, latLngA),
        [y1, x1] = getPointByLatlng(map, latLngB);
    let θ = Math.atan2(x1 - x0, y1 - y0);
    θ = θ * 180 / Math.PI;
    θ = (90 + θ) < 0 ? 450 + θ : 90 + θ;
    return θ
}
/**
 * 获取地图边界
 * @params map 地图实例
 * @params mapType=0  0天地图  1高德地图 2 百度 暂不支持
 *  */
function getBounds(map: AMAP.Map | L.Map) {
    const mapType = getMapType(map);
    if (mapType == 0) {
        let bounds = (map as L.Map).getBounds();
        return {
            lngLeft: bounds.getSouthWest().lng,
            latTop: bounds.getNorthEast().lat,
            lngRight: bounds.getNorthEast().lng,
            latBottom: bounds.getSouthWest().lat
        }
    } else if (mapType == 1) {
        let { southwest, northeast } = (map as AMAP.Map).getBounds();
        return {
            lngLeft: southwest.lng,
            latTop: northeast.lat,
            lngRight: northeast.lng,
            latBottom: southwest.lat
        }
    }
    throw new Error('百度地图暂时不支持！')
}
/**获取距离distance在地球上的纬度跨度 
 * @param distance 距离(米)
*/
function getDiffLatitude(distance: number | string) {
    let d = Number(distance);
    const delta_lat = 2 * Math.asin(d / (2 * R)); // 两点间的纬度差值
    return delta_lat * (180 / Math.PI); // 将弧度转换为角度
}
/**获取两点间的距离
 * @param latLngA A点的[纬度，经度]
 * @param latLngB B点的[纬度，经度]
 * @param type=0  0天地图  1高德地图
 * @returns 两点间的距离(米)
 */
function getDistance(latLngA: [number, number], latLngB: [number, number], type: 0 | 1 = 0): number {
    let [latA, lngA] = latLngA, [latB, lngB] = latLngB, dis = 0;
    if (type && AMap && AMap.GeometryUtil) {
        dis = AMap.GeometryUtil.distance([lngA, latA], [lngB, latB])
    } else {
        dis = L.latLng(latLngA).distanceTo(latLngB);
    }
    return dis;
}
/** 将坐标系转换为经纬度数
 * @param map 地图实例
 * @param point 像素点位
 * @returns latlng [lat,lng]
 */
function getLatLngByPoint(map: AMAP.Map | L.Map, point: [number, number] | undefined): [number, number] {
    if (!point) return [0, 0];
    let p: L.LatLng | AMAP.LngLat;
    if (map instanceof L.Map) {
        p = map.containerPointToLatLng(point)
    } else {
        p = map.containerToLngLat(new AMap.Pixel(point[0], point[1]));
    }
    return [p.lat, p.lng]
}
/** 获取指定间隔距离的经度差值 
 * @param 间隔距离 
 * @param 纬度点位集合(纬度不同，相同距离经度变化差值不一样) 
 * @param type=0  0 天地图 1 高德地图
 */
function getLngDiffByDistance(map: AMAP.Map | L.Map, distance: number = 100, latLng: [number, number][]): number {
    if (latLng.length === 0) { return 0; }
    let type: 0 | 1 = map instanceof L.Map ? 0 : 1;
    let lng = 0.00001, lat = latLng.map(e => e[0]).reduce((s, v) => s + v) / latLng.length;
    let positionA: [number, number] = [lat, 100],
        positionB: [number, number] = [lat, 100 + lng];
    let xMeasure = getDistance(positionA, positionB, type);
    return distance / xMeasure * lng
}
/** 得到坐标系点位    
 * @param map 当前的地图 
 * @param latlng [纬度,经度]
 * @returns latlng有效时返回 [x,y] , 无效时返回 [-1000, -1000]
 */
function getPointByLatlng(map: AMAP.Map | L.Map, latlng: [number, number] | undefined): [number, number] {
    if (!latlng) return [-1000, -1000];
    let [lat = 90, lng = 180] = latlng, p: AMAP.Pixel | L.Point;
    if (isNaN(lat) || isNaN(lng)) return [-1000, -1000];
    if ((map as L.Map).latLngToContainerPoint) {
        p = (map as L.Map).latLngToContainerPoint([lat, lng]);
    } else {
        p = (map as AMAP.Map).lngLatToContainer([lng, lat]);
    }
    return [p.x, p.y]
}
/** 将经纬度数组转换为坐标系 
 * @param map 当前的地图 
 * @param latlngs [纬度,经度][]
 * @returns latlngs有效时返回 [x,y][]
 */
function getPointsByLatlngs(map: AMAP.Map | L.Map, latlngs: [number, number][] | undefined): [number, number][] {
    return latlngs?.map(e => getPointByLatlng(map, e)) || [];
}

/**对大小进行解析设置
 * @param map  当前的地图 
 * @param info 大小信息和位置信息
 * @returns [x轴的像素大小 number,y轴的像素大小 number]
 */
function getSizeByMap(map: AMAP.Map | L.Map, info: (MapPoint | MapPoints) & (MapSize | MapSizeFix)): [number, number] {
    let { sizeFix, latlng, size = [0, 0] } = info;
    if (!sizeFix || !latlng) {
        Array.isArray(size) || (size = [size, size]);
        return size;
    }
    let sizes: [number, number] = Array.isArray(sizeFix) ? sizeFix : [sizeFix, sizeFix];
    let [x, y] = latlng;
    let lngDiff = getLngDiffByDistance(map, sizes[1], [latlng]);
    /**获取同纬度下，经度变化指定sizeFix后像素点的差值 */
    let [x0, y0] = getPointByLatlng(map, [x, y]);
    let [x1, y1] = getPointByLatlng(map, [x, y + lngDiff]);
    let xd = Math.abs(x1 - x0), yd = (xd * sizes[1]) / sizes[0];
    return [xd, yd];
}
/**获取地图实例的大小宽高 */
function getMapSize(map: AMAP.Map | L.Map): { w: number, h: number } {
    let size: any = map.getSize();
    let { x, y, width, height } = size;
    return {
        w: x || width,
        h: y || height
    }
}
/**
* 转化为通用地图事件
* @param event L.LeafletMouseEvent | AMap.MouseEventArgs
* @param mapType 0 | 1 | 2 对应leaflet | 高德 | 百度 （百度暂时不支持）
*/
function getMapMouseEvent(e: L.LeafletMouseEvent | AMapMapsEvent, mapType: MapType): MapUtils.MapEventResponse<TypeToMap<MapType>> {
    let latlng, point, page, originalEvent, type;
    type = e.type;
    if (mapType == 0) {
        const {latlng: Llatlng, originalEvent: LorginalEvent, containerPoint} = e = e as L.LeafletMouseEvent;
        const {lat, lng} = Llatlng;
        latlng = {lat, lng};
        const {x, y} = containerPoint;
        point = {x, y};
        originalEvent = LorginalEvent;
    } else if (mapType == 1) {
        const {pixel, originEvent, lnglat} = e = e as AMapMapsEvent;
        const {lat, lng} = lnglat;
        latlng = {lat, lng};
        const {x, y} = pixel;
        point = {x, y};
        originalEvent = originEvent;
    }
    return {
        type,
        latlng,
        containerPoint: point,
        orginDOMEvent: originalEvent,
        orginMapEvent: e
    }
}
/**设置地图状态 
*   showIndoorMap: boolean; // 是否在有矢量底图的时候自动展示室内地图，PC默认true,移动端默认false
*   resizeEnable: boolean; //是否监控地图容器尺寸变化，默认值为false
*   dragEnable: boolean; // 地图是否可通过鼠标拖拽平移，默认为true
*   keyboardEnable: boolean; //地图是否可通过键盘控制，默认为true
*   doubleClickZoom: boolean; // 地图是否可通过双击鼠标放大地图，默认为true
*   zoomEnable: boolean; //地图是否可缩放，默认值为true
*   rotateEnable: boolean; // 地图是否可旋转，3D视图默认为true，2D视图默认false
*/
function setMapStatus(map: AMAP.Map | L.Map, key: 'dragEnable', flag: boolean) {
    let _map: any = map;
    const amap: AMAP.Map = _map.setStatus ? _map : undefined, lmap: L.Map = _map.dragging ? _map : undefined
    switch (key) {
        case 'dragEnable': if (lmap) {
            flag ? lmap.dragging.enable() : lmap.dragging.disable()
        } else if (amap) {
            amap.setStatus({ dragEnable: flag })
        }; break;
    }
}
/**
 * 根据传入实例判断地图类型
 * @param map 
 * @returns 0 leaflet 1 高德 2 百度
 */
function getMapType(map: AMAP.Map | L.Map): MapType {
    if (map instanceof L.Map) {
        return 0;
    } else if (map instanceof AMap.Map) {
        return 1;
    } else {
        return 2;
    }
}
/**
 * 
 * @param map 
 * @param center 中心 latlng顺序
 * @param zoom 
 * @param offset 中心 但需要偏移固定像素
 */
function setViewCenter(map: L.Map | AMAP.Map, center: [number, number], zoom: number, offset?: [number, number]) {
    const mapType = getMapType(map);
    if (offset) {
        const centerPixel = getPointByLatlng(map, center);
        center = getLatLngByPoint(map, [centerPixel[0] + offset[0], centerPixel[1] + offset[1]])
    }
    if (mapType == 0) {
        map = map as L.Map
        map.setView(center, zoom);
    } else if (mapType == 1) {
        map = map as AMAP.Map
        map.setCenter(center.reverse() as [number, number]);
        map.setZoom(zoom);
    } else {
        throw new Error('百度地图暂时不支持！')
    }
}
/**
 * 设置地图最合适缩放位置中心
 * @param map 
 * @param allPoints 大于等于2个点
 */
function setFitBounds(map: L.Map | AMAP.Map, allPoints: [number, number][]);
/**
 * 设置地图最合适缩放位置中心
 * @param map 
 * @param southwest 地图左下 
 * @param northeast 地图右上
 */
function setFitBounds(map: L.Map | AMAP.Map, southwest: [number, number], northeast: [number, number]);
function setFitBounds(map: L.Map | AMAP.Map, point: [number, number] | [number, number][], point2?: [number, number]) {
  const mapType = getMapType(map);
  let southwest: [number, number], northeast: [number, number];
  if (point.length == 0 || !point) return;
  if (point && Array.isArray(point[0])) {
    // 传入坐标数组
    let maxLat = Math.max(...point.map((e) => e[0])),
      minLat = Math.min(...point.map((e) => e[0])),
      maxLng = Math.max(...point.map((e) => e[1])),
      minLng = Math.min(...point.map((e) => e[1]));
      southwest = [minLat, minLng];
      northeast = [maxLat, maxLng];
  } else {
    southwest = point as [number, number];
    northeast = point2 as [number, number];
  }
  if (mapType == 0) {
    map = map as L.Map;
    map.fitBounds([southwest, northeast]);
  } else if (mapType == 1) {
    map = map as AMAP.Map;
    const bounds = new AMap.Bounds(southwest.reverse(), northeast.reverse());
    const [zoom, center] = map.getFitZoomAndCenterByBounds(bounds);
    map.setZoomAndCenter(zoom, center);
  }
}
export const SLUMap = {
    /** 百度转84 */
    tobd09gps84,
    /** 火星转84 */
    togcj02gps84,
    /** 84转百度 */
    togps84bd09,
    /** 84转火星 */
    togps84gcj02,
    /** 火星转百度 */
    togcj02bd09,
    /** 百度转火星 */
    tobd09cj02,
    /** 测算两点与Y轴形成的角度大小（Y轴方向 ↑ ）
     * @param map 当前的地图
     * @param latLngA 第一个点的[纬度，经度]
     * @param latLngB 第二个点的[纬度，经度]
     * @returns 两点与正北方的角度
     */
    getAngle,
    /**
    * 获取地图边界
    * @params map 地图实例
    * @params mapType=0  0天地图  1高德地图 2 百度 暂不支持
    *  */
    getBounds,
    /**获取距离distance在地球上的纬度跨度
     * @param distance 距离(米)
     */
    getDiffLatitude,
    /**获取两点间的距离
     * @param latLngA A点的[纬度，经度]
     * @param latLngB B点的[纬度，经度]
     * @param type=0  0天地图  1高德地图
     * @returns 两点间的距离(米)
     */
    getDistance,
    /** 将坐标系转换为经纬度数
     * @param map 地图实例
     * @param point 像素点位
     * @returns latlng [lat,lng]
     */
    getLatLngByPoint,
    /** 获取指定间隔距离的经度差值
     * @param 间隔距离
     * @param 纬度点位集合(纬度不同，相同距离经度变化差值不一样)
     * @param type=0  0 天地图 1 高德地图
     */
    getLngDiffByDistance,
    /** 得到坐标系点位
     * @param map 当前的地图
     * @param latlng [纬度,经度]
     * @returns latlng有效时返回 [x,y] , 无效时返回 [-1000, -1000]
     */
    getPointByLatlng,
    /** 将经纬度数组转换为坐标系
     * @param map 当前的地图
     * @param latlngs [纬度,经度][]
     * @returns latlngs有效时返回 [x,y][]
     */
    getPointsByLatlngs,
    /**对大小进行解析设置
    * @param map  当前的地图 
    * @param info 大小信息和位置信息
    * @returns [x轴的像素大小 number,y轴的像素大小 number]
    */
    getSizeByMap,
    getMapSize,
    setMapStatus,
    /**
     * 转化为通用地图事件
     * @param event L.LeafletMouseEvent | AMap.MouseEventArgs
     * @param mapType 0 | 1 | 2 对应leaflet | 高德 | 百度 （百度暂时不支持）
     */
    getMapMouseEvent,
    /**
    * 设置地图最合适缩放位置中心
    * @overload
    * @param map 
    * @param southwest 地图左下 latlng
    * @param northeast 地图右上 latnlng
    */
    /**
    * 设置地图最合适缩放位置中心
    * @overload
    * @param map 
    * @param allPoints 大于等于2个点 latlng顺序
    */
    /**
     * @param map 
     * @param {[number, number][] | [[number, number]]} point
     * @param {[[number, number]]}
     */
    setFitBounds,
    /**
    * 
    * @param map 
    * @param center 中心 latlng顺序
    * @param zoom 
    * @param offset 中心 [x, y]但需要偏移固定像素
    */
    setViewCenter,
    /**
    * 根据传入实例判断地图类型
    * @param map 
    * @returns 0 leaflet 1 高德 2 百度
    */
    getMapType
};
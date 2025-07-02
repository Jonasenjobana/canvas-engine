import L from "leaflet"

/**
 * 根据船长 船宽 计算实际像素
 * @param latlng 经纬度
 * @param length 长 米
 * @param width  宽 米
 */
export function getPXSize(map: L.Map, latlng: [number, number], length: number) {
  const [lat, lng] = latlng,
    crs = map.options.crs!,
    Earth: any = L.CRS.Earth;
  let _length = 0;
  if (crs.distance === Earth.distance) {
    var d = Math.PI / 180,
      latR = length / Earth.R / d,
      top = map.project([lat + latR, lng]),
      bottom = map.project([lat - latR, lng]),
      p = top.add(bottom).divideBy(2),
      lat2 = map.unproject(p).lat,
      lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) / (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

    if (isNaN(lngR) || lngR === 0) {
      lngR = latR / Math.cos((Math.PI / 180) * lat); // Fallback for edge case, #2425
    }
    const _point = p.subtract(map.getPixelOrigin());
    _length = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
    const _radiusY = p.y - top.y;
  } else {
    const latlng2 = crs.unproject(crs.project(L.latLng(lat, lng)).subtract([length, 0]));
    const _point = map.latLngToLayerPoint(latlng);
    _length = _point.x - map.latLngToLayerPoint(latlng2).x;
  }
  return _length;
}

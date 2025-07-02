import { Injectable } from "@angular/core";
import { MapStateService } from "../../service/map-state.service";
import { MapLayerControl } from "./map-layer-control";
import { MapLayerBase } from "./map-layer.base";
import { MapElementIcon } from "./elements/map-element.icon";
import { MapElementSprite } from "./elements/map-element.sprite";
import { MapElementShip } from "./elements/ship/map-element.ship";
import { MapElementSelectRect } from "./elements/map-element.select";
import { DataType, WebSocketService } from "src/app/shared/services/websocket.service";
import { AisAndRadarModel, UpdateAisDatas } from "../../layer-popup-component/windpower-ais/model";
import { MapLayerComponentService } from "../../service/map-layer-component.service";
import { WindpowerShipService } from "../../layer-popup-component/windpower-ship/windpower-ship.service";
import * as L from "leaflet";

@Injectable({
  providedIn: "root",
})
export class MapLayerControlService {
  map: L.Map | null = null;
  mapControl: MapLayerControl = new MapLayerControl();
  private aisDatas: AisAndRadarModel[] = [];
  private radarDatas: AisAndRadarModel[] = [];
  baseLayer: MapLayerBase = new MapLayerBase();
  selectedRect: MapElementSelectRect = new MapElementSelectRect({id: 'select-rect'});
  constructor(private mapState: MapStateService,
    private webSocketService: WebSocketService,
    private mapLayerService: MapLayerComponentService,
    private shipHttp: WindpowerShipService,
  ) {
    this.webSocketService.receive(DataType.Ais).subscribe((res) => {
      this.aisDatas = UpdateAisDatas(this.aisDatas, res.datas || []);
      const shipEl = this.aisDatas.map(ship => {
        return new MapElementShip({
          typeCode: ship.shipTypeCode!,
          id: ship.mmsi!,
          latlng: [ship.lat!, ship.lng!],
          rotate: ship.cog!,
          shipInfo: {
            shipLength: ship.shipLength!,
            shipWidth: ship.shipWidth!,
            cog: ship.cog!,
            heading: ship.heading!
          },
          textOpt: {
            id: ship.mmsi!,
            text: ship.shipName! || ship.mmsi!,
            type: 'bottom',
            overlap: true
          }
        }).on('click', (event) => {
          console.log(event)
          this.selectedRect.setTarget(event.target);
          this.shipHttp.getInfo(ship.mmsi!).then(res => {
            const { lat, lng } = res;
            if (lat && lng) {
              this.mapLayerService.addComponent({
                title: `System-Mg.Ship Details`,
                name: "ShipWindpowerInfoComponent",
                type: "popup",
                titleType: "primary",
                aliasName: "popInfo",
                data: {
                  params: { shipInfo: {...res, latlng: L.latLng(lat, lng)} },
                  // 使用海图的定位弹出详情
                  position: { left: 10, top: 86 },
                },
              });
            }
          })
          
        })
      });
      this.baseLayer.updateElements(shipEl);
    });
    this.webSocketService.receive(DataType.Radar).subscribe((res) => {
      this.radarDatas = res.datas || [];
      const radarEl = this.radarDatas.map(radar => {
        return new MapElementIcon({
          id: radar.mmsi!,
          url: '/assets/img/map/ship/radar.png',
          size: [16, 16],
          latlng: [radar.lat!, radar.lng!],
          rotate: 0,
          textOpt: {
            id: radar.mmsi!,
            text: radar.mmsi!,
            type: 'bottom',
            overlap: true
          }
        }).on('click', (event) => {
          console.log(event)
          this.selectedRect.setTarget(event.target);
        })
      });
      this.baseLayer.updateElements(radarEl);
    })
    this.mapState.map.subscribe((map) => {
      this.map = map;
      this.mapControl.addTo(map);
      this.baseLayer.addTo(this.mapControl);
      this.baseLayer.setElements([this.selectedRect])
    });
  }
  generateRandomCoordinates() {
    // 纬度范围 (21.19°N~21.3°N)
    const minLat = 20.19;
    const maxLat = 22.3;
    
    // 经度范围 (109.1°E~109.5°E)
    const minLng = 108.1;
    const maxLng = 110.5;
    const lat = parseFloat((Math.random() * (maxLat - minLat) + minLat).toFixed(6));
    const lng = parseFloat((Math.random() * (maxLng - minLng) + minLng).toFixed(6));
    return [lat, lng];
}

  randomType() {
    // 确定可用的类型
    const types = ["single", "w", "b"];

    // 如果没有选择任何类型，默认使用所有类型
    if (types.length === 0) {
      types.push("single", "w", "b");
    }

    // 随机选择类型
    const type = types[Math.floor(Math.random() * types.length)];

    // 随机选择1-9的数字
    const number = Math.floor(Math.random() * 9) + 1;

    // 根据类型生成字符串
    switch (type) {
      case "single":
        return number.toString();
      case "w":
        return `${number}-w`;
      case "b":
        return `${number}-b`;
      default:
        return number.toString();
    }
  }
}

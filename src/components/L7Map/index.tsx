import React, { useEffect, useRef, useState } from 'react';

import { Scene, Popup, LayerPopup } from '@antv/l7';
import { PointLayer, LineLayer } from '@antv/l7-layers';
import { GaodeMap } from '@antv/l7-maps';
import * as xlsx from 'xlsx';

function L7Map() {
  const containerRef = useRef(null);
  const [data, setData] = useState<any>();
  useEffect(() => {
    if (data) {
      console.log('++++++++++');
      // 在组件挂载后初始化 L7 地图
      const scene = new Scene({
        id: 'map',
        map: new GaodeMap({
          pitch: 0,
          style: 'dark', // 可根据需求调整地图样式
          zoom: 10,
          center: [119.6, 39.9], // 设置地图中心点坐标
        }),
      });

      scene.addLayer(data);
      // 将 L7 地图绑定到容器中

      const layerPopup = new LayerPopup({
        items: [
          {
            layer: data,
            fields: [
              {
                field: 'name',
                formatValue: (name?: string) => {
                  console.log('++++', name);
                  return name ?? '-';
                },
              },
            ],
          },
        ],
        trigger: 'hover',
      });
      scene.addPopup(layerPopup);
      return () => {
        scene.destroy();
      };
    }
  }, [data]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = xlsx.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      const extractedData = jsonData.slice(1).map((row) => ({
        lng: row[1],
        lat: row[0],
        chlorophyll: row[2],
        name: `叶绿素: ${row[2]}<br/>经度：${row[1]}<br/>纬度：${row[0]}`,
      }));
      const geojsonData = {
        type: 'FeatureCollection',
        features: jsonData.slice(1).map((row) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [Number(row[1]), Number(row[0])], // 经度在第一列，纬度在第二列
          },
          properties: {
            concentration: Number(row[2]), // 浓度在第三列
          },
        })),
      };
      console.log('+++', extractedData);
      const pointLayer = new PointLayer({})
        .source(extractedData, {
          parser: {
            type: 'json',
            x: 'lng',
            y: 'lat',
          },
        })
        .shape('circle')
        .size(10)
        .color('chlorophyll', (chlorophyll) => {
          if (chlorophyll > 0 && chlorophyll < 5) {
            return '#fcffe6';
          } else if (chlorophyll > 5 && chlorophyll < 6) {
            return '#f4ffb8';
          } else if (chlorophyll > 6 && chlorophyll < 6.5) {
            return '#eaff8f';
          } else if (chlorophyll > 6.5 && chlorophyll < 7) {
            return '#d3f261';
          } else if (chlorophyll > 7 && chlorophyll < 7.5) {
            return '#bae637';
          } else if (chlorophyll > 7.5 && chlorophyll < 8) {
            return '#a0d911';
          } else if (chlorophyll > 8 && chlorophyll < 8.5) {
            return '#7cb305';
          } else if (chlorophyll > 8.5 && chlorophyll < 9) {
            return '#5b8c00';
          } else if (chlorophyll > 9 && chlorophyll < 9.5) {
            return '#3f6600';
          } else if (chlorophyll > 9.5 && chlorophyll < 10) {
            return '#254000';
          }
        })
        .style({
          opacity: 1,
        });

      setData(pointLayer);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      {data ? <div id="map" ref={containerRef} style={{ height: '400px' }}></div> : null}

      <input type="file" accept=".xlsx,.csv" onChange={handleFileChange} />
    </div>
  );
}

export default L7Map;

export default class Enlarge {
    constructor(context) {
        this.context = context;
        this.map = window.map;
        this.map2 = window.map2;
        this.turf = window.turf;
        this.minemap = window.minemap;
        this.lineLayerName = '';
        this.lineSourceName = '';
        this.pointLayerName = '';
        this.pointSourceName = '';
        this.lineColors = ["white", "pink", "orange", "#aa22ff", "#bbcc22"]
        this.pointColors = ["red", "black", "green", "yellow", "blue"]
        // 自行车图标
        this._marker = null;
        // 控制动画
        this.timer = null;
        this.i = 1;
        this.length = null;
    }

    // 初始化marker动画
    initAnimation() {
        let map = this.map;
        let minemap = this.minemap;
        let el = document.createElement('div');
        el.id = 'marker';
        let img = require("../../assets/img/zxc.png")
        el.style["background-image"] = `url(${img})`;
        el.style["background-size"] = "cover";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style["border-radius"] = "50%";
        let lnglat = this.lineJsonData.features[0].geometry.coordinates[0];
        this._marker = new minemap.Marker(el, { offset: [-15, -15] }).setLngLat(lnglat).addTo(map);
        this.length = this.lineJsonData.features[0].geometry.coordinates.length
        this.timer = setInterval(this.animation.bind(this), 100)
    }

    // 动画函数
    animation() {
        let lnglat = this.lineJsonData.features[0].geometry.coordinates[this.i]
        this.updateMarker(lnglat)
        this.i++;
        if (this.length == this.i) {
            this.updateMarker(this.lineJsonData.features[0].geometry.coordinates[0])
            this.i = 1;
        }
    }

    // 开始动画
    startAnimation() {
        if (this.timer == null) {
            this.timer = setInterval(this.animation.bind(this), 100)
        }
    }

    // 停止动画
    stopAnimation() {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    }

    // 更新icon的位置
    updateMarker(lnglat) {
        this.map2.setCenter(lnglat)
        this._marker.setLngLat(lnglat);
    }

    // 初始化
    initTrack(pointJsonData, lineJsonData) {
        this.pointJsonData = pointJsonData
        this.lineJsonData = lineJsonData
        this.initAnimation()
    }
    setPointJsonData(data) {
        this.pointJsonData = data
    }
    setLineJsonData(data) {
        this.lineJsonData = data
    }
    getPointJsonData() {
        return this.pointJsonData
    }
    getLineJsonData() {
        return this.lineJsonData
    }
    getLineLayerName() {
        return this.lineLayerName;
    }
    getLineSourceName() {
        return this.lineSourceName;
    }
    getPointLayerName() {
        return this.pointLayerName;
    }
    getPointSourceName() {
        return this.pointSourceName;
    }
    // 添加点图层
    addPoint(data, layerName, sourceName, imgSrc) {
        let map = this.map
        let map2 = this.map2
        let lName = layerName
        let sName = sourceName
        this.pointLayerName = lName;
        this.pointSourceName = sName;
        if (this.getLayer(lName) && this.getSource(sName)) {
            this.setData(data, sName)
            return;
        }
        let color = this.pointColors[Math.floor(Math.random() * 5)];
        let lObj = {
            id: lName,
            type: "circle",
            source: sName,
        }
        if (imgSrc) {
            lObj['type'] = 'symbol'
            lObj['layout'] = {
                "icon-image": "videoimg",
                "icon-size": 0.3,
                "icon-allow-overlap": false,  //图标允许压盖
                "text-allow-overlap": false,   //图标覆盖文字允许压盖
            }
            map.loadImage(imgSrc, function (error, image) {
                if (error) throw error;
                map.addImage('videoimg', image);
                map.addSource(sName, {
                    type: "geojson",
                    data: data
                });
                map.addLayer(lObj);
            })
            map2.loadImage(imgSrc, function (error, image) {
                if (error) throw error;
                map2.addImage('videoimg', image);
                map2.addSource(sName, {
                    type: "geojson",
                    data: data
                });
                map2.addLayer(lObj);
            })
        } else {
            lObj['paint'] = {
                "circle-radius": 5,
                "circle-color": color
            }
            map.addSource(sName, {
                type: "geojson",
                data: data
            });
            map.addLayer(lObj);
            map2.addSource(sName, {
                type: "geojson",
                data: data
            });
            map2.addLayer(lObj);
        }
        let coors = [];
        for (let item of data.features) {
            coors.push(item.geometry.coordinates)
        }
        this.setViewport(coors)
    }
    // 添加线图层
    addLine(data, layerName, sourceName) {
        let map = this.map;
        let map2 = this.map2;
        let lName = layerName
        let sName = sourceName
        this.lineLayerName = lName;
        this.lineSourceName = sName;
        if (this.getLayer(lName) && this.getSource(sName)) {
            this.setData(data, sName)
            return;
        }
        let color = this.lineColors[Math.floor(Math.random() * 5)];
        map.addSource(sName, {
            type: "geojson",
            data: data
        });
        map.addLayer({
            id: lName,
            type: "line",
            source: sName,
            paint: {
                "line-width": 5,
                "line-color": color
            }
        });
        map2.addSource(sName, {
            type: "geojson",
            data: data
        });
        map2.addLayer({
            id: lName,
            type: "line",
            source: sName,
            paint: {
                "line-width": 5,
                "line-color": color
            }
        });
    }

    // 设置Data
    setData(data, name) {
        let map = this.map;
        let map2 = this.map;
        map.getSource(name).setData(data)
        map2.getSource(name).setData(data)
    }


    getLayer(name) {
        let map = this.map
        return map.getLayer(name) != undefined ? true : false
    }

    getSource(name) {
        let map = this.map
        return map.getSource(name) != undefined ? true : false
    }

    // 清楚所有数据
    clearAll() {
        try {
            this.map.removeSource(this.lineSourceName)
            this.map.removeLayer(this.lineLayerName)
            this.map2.removeSource(this.lineSourceName)
            this.map2.removeLayer(this.lineLayerName)
            this.map.removeSource(this.pointSourceName)
            this.map.removeLayer(this.pointLayerName)
            this.map2.removeSource(this.pointSourceName)
            this.map2.removeLayer(this.pointLayerName)
            this.map.removeImage('videoimg')
            this.map2.removeImage('videoimg')
            this.stopAnimation()
            this._marker.remove()
        } catch (e) {
            console.log(e)
        }
    }

    setViewport(pointArray) {
        var map = this.map
        var minemap = this.minemap
        var minX, maxY, maxX, minY;
        var data = pointArray;
        for (var i = 0; i < data.length; i++) {
            var point = {
                lng: data[i][0],
                lat: data[i][1]
            }
            if (i == 0) {
                minX = point.lng;
                minY = point.lat;
                maxY = point.lat;
                maxX = point.lng;
            } else {
                if (minX > point.lng) {//最小X
                    minX = point.lng;
                }
                if (maxX < point.lng) {//最大X
                    maxX = point.lng;
                }
                if (maxY < point.lat) {//最大Y
                    maxY = point.lat;
                }
                if (minY > point.lat) {//最小Y
                    minY = point.lat;
                }
            }
        }
        //得到当前区域在地图上展示范围
        var arr = [[minX, minY], [maxX, maxY]];
        map.fitBounds(minemap.LngLatBounds.convert(arr), {
            padding: { top: 20, bottom: 20, left: 430, right: 560 }
        });
    }

    // 返回分割的点位数据，线数据
    splitLineData(lineCoors, unit, splitLength) {
        let lineJsonData = {
            features: [],
            type: "FeatureCollection"
        }
        let pointJsonData = {
            features: [],
            type: "FeatureCollection"
        }
        let turf = this.turf;
        let line = turf.lineString(lineCoors);
        let length = line.geometry.coordinates.length;
        let options = { units: unit };
        let along = turf.along(line, 0, options)
        along['properties']['streetName'] = '道路' + 0;
        pointJsonData.features.push(along);
        along = turf.along(line, Number(splitLength), options);
        along['properties']['streetName'] = '道路' + 1;
        pointJsonData.features.push(along);
        let i = 2;
        while (
            along.geometry.coordinates != line.geometry.coordinates[length - 1]
        ) {
            along = turf.along(line, Number(splitLength * i), options);
            pointJsonData.features.push(along);
            along['properties']['streetName'] = '道路' + i;
            i++;
        }
        lineJsonData.features.push({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: lineCoors
            }
        });
        return {
            pointJsonData,
            lineJsonData
        }
    }
    // 转换坐标点数据
    parseCoors(lineCoors) {
        let that = this.context
        try {
            let coors;
            coors = JSON.parse(lineCoors);
            return coors
        } catch {
            that.$message({
                message: "坐标格式有误！！！",
                type: "warning"
            });
            return 'error';
        }
    }
    // 获取实例
    getConfig() {
        return {
            map: this.map,
            map2: this.map2,
            turf: this.turf,
            minemap: this.minemap
        }
    }
}
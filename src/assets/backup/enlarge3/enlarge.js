export default class Enlarge {
    constructor(context) {
        this.context = context;
        this.map = window.map;
        this.map2 = window.map2;
        this.turf = window.turf;
        this.minemap = window.minemap;
        this.lineColors = ["white", "pink", "orange", "#aa22ff", "#bbcc22"]
        this.pointColors = ["red", "black", "green", "yellow", "blue"]
        this.lineJsonData = context.lineJsonData;
        this.pointJsonData = context.pointJsonData;
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
        // this.addTrackSource()
        // this.addTrackLayer()
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

    // 添加轨迹数据源
    addTrackSource() {
        let minemap = this.minemap
        let map = this.map
        let route = require('./data').default
        map.repaint = true;
        let jsonData = minemap.Template.util.pointArrayToSymtrackingGeoJson(route, false, 100);
        map.addSource('symtrackingSource', {
            type: 'geojson',
            data: jsonData
        });
    }

    // 添加轨迹图层
    addTrackLayer() {
        let map = this.map;
        map.addLayer({
            "type": "symtracking",
            "source": 'symtrackingSource',
            "id": 'symtrackingLayer',
            "layout": {
                "icon-image": "n-vehicle",
                "icon-allow-overlap": false,
                "icon-ignore-placement": true,
                "symbol-avoid-edges": false,
                "symbol-placement": "line",
                "symtracking-fps": 1,            //行动快慢，现在是1秒37帧
                "symtracking-time-segment": 60,   //总共要运行多少秒
                "compatible-mode": false          //notice  采用新的数据样式，保证小车不消失
            },
            "paint": {
                "icon-color": "#ff0000",
                "symtracking-delay": 0            //notice 小车更新延迟为零，保证小车能够循环播放，小车循环播放的条件是：此项为零 并且 symtracking-fps * symtracking-time-segment ≈ myGeojson.features.length
            }
        });
    }

    addPoint(data, imgSrc) {
        let map = this.map
        let map2 = this.map2
        let lName = "pointLayer"
        let sName = "pointSource"
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
            map.loadImage(imgSrc, function (error, image) {
                if (error) throw error;
                map.addImage('videoimg', image);
            })
            map2.loadImage(imgSrc, function (error, image) {
                if (error) throw error;
                map2.addImage('videoimg', image);
            })
            lObj['type'] = 'symbol'
            lObj['layout'] = {
                "icon-image": "videoimg",
                "icon-size": 0.3,
                "icon-allow-overlap": false,  //图标允许压盖
                "text-allow-overlap": false,   //图标覆盖文字允许压盖
            }
        } else {
            lObj['paint'] = {
                "circle-radius": 5,
                "circle-color": color
            }
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
        let coors = [];
        for (let item of data.features) {
            coors.push(item.geometry.coordinates)
        }
        this.setViewport(coors)
    }

    addLine(data) {
        let map = this.map;
        let map2 = this.map2;
        let lName = "lineLayer"
        let sName = "lineSource"
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

    clearAll() {
        try {
            this.map.removeSource('lineSource')
            this.map.removeLayer('lineLayer')
            this.map2.removeSource('lineSource')
            this.map2.removeLayer('lineLayer')
            this.map.removeSource('pointSource')
            this.map.removeLayer('pointLayer')
            this.map2.removeSource('pointSource')
            this.map2.removeLayer('pointLayer')
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
        map.fitBounds(minemap.LngLatBounds.convert(arr));
    }
    /**
      * @method initSplitLineData 初始化点位数据
      * @param {Array} lineCoors  线的坐标
      * @param {String} unit  单位
      * @param {String} splitLength  以多长切割
      * @return void
    */
    initSplitLineData(lineCoors, unit, splitLength) {
        let turf = this.turf;
        let line = turf.lineString(lineCoors);
        let length = line.geometry.coordinates.length;
        let options = { units: unit };
        let along = turf.along(line, 0, options)
        along['properties']['streetName'] = '道路' + 0;
        this.pointJsonData.features.push(along);
        along = turf.along(line, Number(splitLength), options);
        along['properties']['streetName'] = '道路' + 1;
        this.pointJsonData.features.push(along);
        let i = 2;
        while (
            along.geometry.coordinates != line.geometry.coordinates[length - 1]
        ) {
            along = turf.along(line, Number(splitLength * i), options);
            this.pointJsonData.features.push(along);
            along['properties']['streetName'] = '道路' + i;
            i++;
        }
        this.lineJsonData.features.push({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: lineCoors
            }
        });
        return {
            pointJsonData: this.pointJsonData,
            lineJsonData: this.lineJsonData
        }
    }
    /**
     * @method parseCoors 将字符串线坐标转换为数组
     * @param {String} lineCoors  线的坐标
     * @return Array || String
     */
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
}
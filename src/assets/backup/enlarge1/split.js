export default class Split {
    constructor(context) {
        this.context = context;
        this.lineColors = ["white", "pink", "orange", "#aa22ff", "#bbcc22"]
        this.pointColors = ["red", "black", "green", "yellow", "blue"]
        this.lineJsonData = {
            features: [],
            type: "FeatureCollection"
        }
        this.pointJsonData = {
            features: [],
            type: "FeatureCollection"
        }
        this.turf = window.turf
        this.map = window.map
        this.map2 = window.map2;
    }
    /**
     * @method setData 设置Source的Data
     * @param {Object} data  Source的Data
     * @param {String} name  Source的Id
     * @return void
     */
    setData(data, name) {
        let map = this.map;
        let map2 = this.map;
        map.getSource(name).setData(data)
        map2.getSource(name).setData(data)
    }

    /**
     * @method getLayer 判断图层是否存在
     * @param {name} coors  Source的Id
     * @return boolean
     */
    getLayer(name) {
        let map = this.map
        return map.getLayer(name) != undefined ? true : false
    }

    /**
     * @method getSource 判断Source是否存在
     * @param {String} name  Source的Id
     * @return boolean
     */
    getSource(name) {
        let map = this.map
        return map.getSource(name) != undefined ? true : false
    }

    /**
     * @method addPoint 初始化点位数据
     * @param {Object} data  Source的Data
     * @return void
     */
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
    }

    /**
     * @method addLine 初始化点位数据
     * @param {Object} data  Source的Data
     * @return void
     */
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

    }

    // 生成点和线
    init(data, unit, length) {
        let imgSrc = require("../../assets/img/cam.png")
        this.initSplitLineData(data, unit, length)
        this.addLine(this.lineJsonData)
        this.addPoint(this.pointJsonData, imgSrc)
        return {
            lineJsonData: this.lineJsonData,
            pointJsonData: this.pointJsonData
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

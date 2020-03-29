export default class SplitLine {
    constructor(context) {
        this.option = context;
        this.lineJsonData = {
            data: {
                features: [],
                type: "FeatureCollection"
            },
            type: "geojson"
        }
        this.pointJsonData = {
            data: {
                features: [],
                type: "FeatureCollection"
            },
            type: "geojson"
        }
        this.lineLayerData = null
        this.pointLayerData = null
        this.turf = window.turf
        this.map = window.map
        this.minemap = window.minemap
    }

    /**
     * @method setOption 设置单个属性
     * @param {String} optionName  
     * @param {Any} optionValue
     * @return void
     */
    setOption(optionName, optionValue) {
        this.option[optionName] = optionValue;
    }

    /**
     * @method setObjectOption 设置多个属性
     * @param {Object} obj
     * @return void
     */
    setObjectOption(obj) {
        this.option = obj;
    }

    /**
     * @method render 渲染
     * @return void
     */
    render() {
        let defaultOption = {
            circleRadius: 5,
            lineWidth: 5,
            unit: "kilometers",
            pointColors: ["red", "black", "green", "yellow", "blue"],
            lineColors: ["white", "pink", "orange", "#aa22ff", "#bbcc22"],
            lineLayerName: "lineLayer",
            lineSourceName: "lineSource",
            pointLayerName: "pointLayer",
            pointSourceName: "pointSource"
        }
        this.option = Object.assign({}, defaultOption, this.option);
        let option = this.option;
        if (option["start"] && option["end"]) {
            this.initDrivingRoute(option.start, option.end)
        } else if (option["lineData"]) {
            let lineData = this.parseString(option.lineData)
            this.splitLine(lineData, option.unit, option.splitLength)
        }
    }

    /**
     * @method addPoint 初始化点位数据
     * @param {Object} data  Source的Data
     * @return void
     */
    addPoint(data) {
        let option = this.option;
        let lName = option.pointLayerName;
        let sName = option.pointSourceName;
        let map = this.map
        if (map.getLayer(lName) && map.getSource(sName)) {
            map.getSource(sName).setData(data.data)
            return;
        }
        map.addSource(sName, data);
        this.pointLayerData = {
            id: lName,
            type: "circle",
            source: sName,
            paint: {
                "circle-radius": option.circleRadius,
                "circle-color": {
                    type: 'identity',
                    property: 'color'
                }
            }
        }
        map.addLayer(this.pointLayerData);
    }

    /**
     * @method addLine 初始化点位数据
     * @param {Object} data  Source的Data
     * @return void
     */
    addLine(data) {
        let option = this.option
        let lName = option.lineLayerName
        let sName = option.lineSourceName;
        let map = this.map;
        if (map.getLayer(lName) && map.getSource(sName)) {
            map.getSource(sName).setData(data.data)
            return;
        }
        map.addSource(sName, data);
        this.lineLayerData = {
            id: lName,
            type: "line",
            source: sName,
            paint: {
                "line-width": option.lineWidth,
                "line-color": {
                    type: 'identity',
                    property: 'color'
                }
            }
        }
        map.addLayer(this.lineLayerData);
    }

    /**
    * @method splitLine 初始化点位数据
    * @param {Array} lineCoors  线的坐标
    * @param {String} unit  单位
    * @param {String} splitLength  以多长切割
    * @return void
    */
    splitLine(lineCoors, unit, splitLength) {
        let option = this.option;
        let turf = this.turf;
        let line = turf.lineString(lineCoors);
        let length = line.geometry.coordinates.length;
        let options = { units: unit };
        let along = turf.along(line, Number(splitLength), options);
        let pointCoors = []
        pointCoors.push(turf.along(line, 0, options).geometry.coordinates);
        pointCoors.push(along.geometry.coordinates);
        let i = 2;
        while (
            along.geometry.coordinates != line.geometry.coordinates[length - 1]
        ) {
            along = turf.along(line, Number(splitLength * i), options);
            pointCoors.push(along.geometry.coordinates)
            i++;
        }
        this.pointJsonData.data.features.push({
            type: "Feature",
            properties: {
                color: option.pointColors[Math.floor(Math.random() * 5)]
            },
            geometry: {
                type: "MultiPoint",
                coordinates: pointCoors
            }
        });
        this.lineJsonData.data.features.push({
            type: "Feature",
            properties: {
                color: option.lineColors[Math.floor(Math.random() * 5)]
            },
            geometry: {
                type: "LineString",
                coordinates: lineCoors
            }
        });
        this.addLine(this.lineJsonData);
        this.addPoint(this.pointJsonData);
    }

    /**
    * @method getPointJsonData 获取点位数据
    * @return Object
    */
    getPointJsonData() {
        return this.pointJsonData;
    }

    /**
    * @method getPointJsonData 获取线数据
    * @return Object
    */
    getLineJsonData() {
        return this.lineJsonData;
    }

    /**
        * @method getPointLayerData 获取点图层数据
        * @return Object
        */
    getPointLayerData() {
        return this.pointLayerData;
    }

    /**
    * @method getLineLayerData 获取线图层数据
    * @return Object
    */
    getLineLayerData() {
        return this.lineLayerData;
    }
    /**
    * @method parseString 将字符串转换为对象
    * @param {String} str  
    * @return Array || String
    */
    parseString(str) {
        try {
            let data = [];
            let json = eval("(" + str + ")");
            for (let item of json.features) {
                data.push(...item.geometry.coordinates);
            }
            return data
        } catch {
            return 'error';
        }
    }

    /**
    * @method initDrivingLightLine 根据起点和终点路径规划来生成高亮线
    * @param {String} start  起点
    * @param {String} end  终点
    * @param {String} lineWidth  高亮线的宽度
    * @param {String} value  高亮线的颜色
    * @return void
    */
    initDrivingRoute(start, end) {
        this.minemap.service.queryDrivingRouteResult(
            start,
            end,
            4,
            "",
            "",
            (error, results) => {
                if (results) {
                    let coors = JSON.parse(
                        (
                            "[[" +
                            results.data.rows[0].routelatlon.split(";").join("],[") +
                            "]]"
                        ).replace(",[]]", "]")
                    );
                    this.splitLine(coors, this.option.unit, this.option.splitLength)
                } else {
                    return error;
                }
            }
        );
    }
}

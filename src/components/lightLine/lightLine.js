export default class LightLine {
    constructor(context) {
        this.option = context;
        this.sourceData = {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: []
            }
        }
        this.layerData = []
        this.colors = {
            red: ["#ff0000", "#ff3838", "#ff8383", "#ffbebe", "#ffd1d1"],
            orange: ["#ff9b00", "#ffb23a", "#ffcc7b", "#fff1ab", "#fff6c9"],
            blue: ["#0048ff", "#2865ff", "#5c8aff", "#96b4ff", "#eaf0ff"],
            green: ["#00A600", "#00EC00", "#79FF79", "#BBFFBB", "#F0FFF0"]
        }
        this.map = window.map;
        this.minemap = window.minemap
    }

    /**
    * @method render 渲染
    * @return void
    */
    render() {
        let defaultOption = {
            sourceName: "lightLineSource",
            layerName: "lightLineLayer",
            colors: this.colors
        }
        this.option = Object.assign({}, defaultOption, this.option);
        let option = this.option;
        if (option['lineCoors']) {
            let coors = this.parseCoors(option.lineCoors)
            this.initLightLine(coors, option.lineWidth, option.color)
        } else if (option['start'] && option['end']) {
            this.initDrivingLightLine(option.start, option.end, option.lineWidth, option.color)
        }
    }

    /**
     * @method setOption 设置单个属性
     * @param {String} name  
     * @param {Any} value
     * @return void
     */
    setOption(name, value) {
        this.option[name] = value;
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
     * @method getColorNames 获取颜色数组
     * @return Array
     */
    getColorNames() {
        let arr = []
        for (let key in this.colors) {
            arr.push(key)
        }
        return arr;
    }

    /**
    * @method getLayerData 获取图层数据
    * @return Array
    */
    getLayerData() {
        return this.layerData;
    }

    /**
    * @method getSourceData 获取数据源数据
    * @return Array
    */
    getSourceData() {
        return this.sourceData;
    }

    /**
     * @method initLightLine 根据坐标添加高亮线
     * @param {Array} coors  高亮线的坐标数据
     * @param {Number} lineWidth  高亮线的宽度
     * @param {String} value  高亮线的颜色
     * @return void
     */
    initLightLine(coors, lineWidth, value) {
        let map = this.map;
        let option = this.option;
        let sourceName = option.sourceName;
        let length = option.colors[value].length;
        let lineOpacity = 1 / length;
        let oldLineWidth = lineWidth
        let featureObj = {
            type: "Feature",
            properties: {
                sourceName: sourceName,
                colorName: value
            },
            geometry: {
                type: "LineString",
                coordinates: coors
            }
        };
        this.sourceData.data.features.push(featureObj);
        option.colors[value].forEach((e, i) => {
            featureObj.properties[`color${i}`] = option.colors[value][i];
            featureObj.properties[`lineWidth${i}`] = lineWidth;
            lineWidth -= oldLineWidth / length;
            if (!map.getSource(sourceName)) {
                let lObj = {
                    id: `${option.layerName}_${i}`,
                    type: "line",
                    source: sourceName,
                    layout: {
                        "line-join": "round",
                        "line-cap": "round"
                    },
                    paint: {
                        "line-width": {
                            type: "identity",
                            property: `lineWidth${i}`
                        },
                        "line-color": {
                            type: "identity",
                            property: `color${i}`
                        },
                        "line-opacity": lineOpacity
                    }
                };
                this.layerData.push(lObj);
                lineOpacity += 1 / length;
            }
        });
        if (!map.getSource(sourceName)) {
            map.addSource(sourceName, this.sourceData);
            for (let item of this.layerData) {
                map.addLayer(item);
            }
        } else {
            map.getSource(sourceName).setData(this.sourceData.data);
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
    initDrivingLightLine(start, end, lineWidth, value) {
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
                    this.initLightLine(coors, lineWidth, value);
                } else {
                    return error;
                }
            }
        );
    }

    /**
     * @method parseCoors 将字符串线坐标转换为数组
     * @param {String} lineCoors  线的坐标
     * @return Array || String
     */
    parseCoors(lineCoors) {
        try {
            let coors;
            coors = JSON.parse(lineCoors);
            return coors
        } catch {
            return 'error';
        }
    }
}

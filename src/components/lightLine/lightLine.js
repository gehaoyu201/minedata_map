export default class LightLine {
    constructor(context) {
        this.that = context
        this.context = context;
        this.colors = context.colors;
        this.sourceData = context.sourceData
        this.layerData = context.layerData
        this.coors = context.coors
        this.$message = context.message
        this.map = window.map;
        this.minemap = window.minemap
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
        let SourceName = "lightLineSource";
        let length = this.colors[value].length;
        let lineOpacity = 1 / length;
        let oldLineWidth = lineWidth
        let featureObj = {
            type: "Feature",
            properties: {
                sourceName: SourceName,
                colorName: value
            },
            geometry: {
                type: "LineString",
                coordinates: coors
            }
        };
        this.sourceData.data.features.push(featureObj);
        this.colors[value].forEach((e, i) => {
            featureObj.properties[`color${i}`] = this.colors[value][i];
            featureObj.properties[`lineWidth${i}`] = lineWidth;
            lineWidth -= oldLineWidth / length;
            if (!map.getSource("lightLineSource")) {
                let lObj = {
                    id: `lightLineLayer_${i}`,
                    type: "line",
                    source: `lightLineSource`,
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
        if (!map.getSource(SourceName)) {
            map.addSource(SourceName, this.sourceData);
            for (let item of this.layerData) {
                map.addLayer(item);
            }
        } else {
            map.getSource(SourceName).setData(this.sourceData.data);
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
        let that = this.that
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

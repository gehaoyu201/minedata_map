export default class SplitLine {
    constructor(context) {
        this.context = context;
        this.lineColors = context.lineColors
        this.pointColors = context.pointColors
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
    }
    /**
     * @method setData 设置Source的Data
     * @param {Object} data  Source的Data
     * @param {String} name  Source的Id
     * @return void
     */
    setData(data, name) {
        let map = this.map;
        map.getSource(name).setData(data)
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
    addPoint(data) {
        let lName = "pointLayer"
        let sName = "pointSource"
        if (this.getLayer(lName) && this.getSource(sName)) {
            this.setData(data, sName)
            return;
        }
        let map = this.map;
        map.addSource(sName, {
            type: "geojson",
            data: data
        });
        map.addLayer({
            id: lName,
            type: "circle",
            source: sName,
            paint: {
                "circle-radius": 5,
                "circle-color": this.pointColors[Math.floor(Math.random() * 5)]
            }
        });
    }

    /**
     * @method addLine 初始化点位数据
     * @param {Object} data  Source的Data
     * @return void
     */
    addLine(data) {
        let lName = "lineLayer"
        let sName = "lineSource"
        if (this.getLayer(lName) && this.getSource(sName)) {
            this.setData(data, sName)
            return;
        }
        let map = this.map;
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
                "line-color": this.lineColors[Math.floor(Math.random() * 5)]
            }
        });
    }

    /**
      * @method splitLine 初始化点位数据
      * @param {Array} lineCoors  线的坐标
      * @param {String} unit  单位
      * @param {String} splitLength  以多长切割
      * @return Object
      */
    splitLine(lineCoors, unit, splitLength) {
        let turf = this.turf;
        let line = turf.lineString(lineCoors);
        let length = line.geometry.coordinates.length;
        let options = { units: unit };
        let along = turf.along(line, Number(splitLength), options);
        this.pointJsonData.features.push(turf.along(line, 0, options));
        this.pointJsonData.features.push(along);
        let i = 2;
        while (
            along.geometry.coordinates != line.geometry.coordinates[length - 1]
        ) {
            along = turf.along(line, Number(splitLength * i), options);
            this.pointJsonData.features.push(along);
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
        this.addLine(this.lineJsonData);
        this.addPoint(this.pointJsonData);
        return {
            pointData: this.pointJsonData,
            lineData: this.lineJsonData
        }
    }

}

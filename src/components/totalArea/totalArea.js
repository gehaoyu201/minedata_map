export default class TotalArea {
    constructor(context) {
        this.context = context
        this.edit = null
        this.minemap = window.minemap
        this.map = window.map
        this.turf = window.turf
    }
    /**
     * @method initEdit 初始化edit
     * @return void
     */
    initEdit() {
        let map = this.map;
        let minemap = this.minemap;
        this.edit = new minemap.edit.init(map, {
            boxSelect: true,
            touchEnabled: true,
            displayControlsDefault: true,
            showButtons: false
        });
    }
    /**
     * @method onEditBtnClick 
     * @param {String} mode  
     * @return void
     */
    onEditBtnClick(mode) {
        let edit = this.edit;
        if (edit && mode) {
            edit.onBtnCtrlActive(mode, { style: { "fillColor": "red", "fillOpacity": "0.6", "fillOutlineColor": "red" } });
        }
    }
    /**
     * @method sumArea 计算总面积
     * @return Object
     */
    sumArea() {
        let turf = this.turf
        let sum = 0;
        let coors = []
        let jsonData = []
        jsonData.push(...this.edit.draw.getAll().features)
        for (let item of jsonData) {
            coors.push(item.geometry.coordinates);
        }
        coors.forEach((item, i) => {
            sum += turf.area(turf.polygon(item));
            jsonData[i].properties['area'] = sum + '平方米';
        })
        this.addTextLayer(jsonData)
        return { sum, jsonData }
    }
    /**
     * @method addTextLayer 添加文字图层
     * @param {Array} data  面数据  
     * @return void
     */
    addTextLayer(data) {
        let map = this.map;
        if (map.getSource('textSource')) {
            map.getSource('textSource').setData({
                type: "FeatureCollection",
                features: data
            })
            return;
        }
        map.addSource('textSource', {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: data
            }
        })
        map.addLayer({
            id: "textLayer",
            source: "textSource",
            type: "symbol",
            layout: {
                'text-field': "{area}",
                "text-anchor": "right",
            },
            paint: {
                'text-color': 'white'
            }
        })
    }
}

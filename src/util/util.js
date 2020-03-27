import { map, minemap } from "../config";
let colors = ['red', 'black', 'green', 'yellow', 'blue', 'white', 'pink', 'orange', '#aa22ff', '#bbcc22']
let addPointLayer = (data, name) => {
    if (map.getSource("pointSource_" + name)) {
        map.removeSource("pointSource_" + name)
    }
    map.addSource("pointSource_" + name, {
        type: "geojson",
        data: data
    });
    map.addLayer({
        "id": "pointLayer_" + name,
        "type": "circle",
        "source": "pointSource_" + name,
        "paint": {
            'circle-radius': 5,
            'circle-color': colors[Math.floor(Math.random() * 10)]
        },
    });
}
let queryDrivingRoute = (start, end) => {
    minemap.service.queryDrivingRouteResult(
        start,
        end,
        4,
        "",
        "",
        async (error, results) => {
            if (results) {
                return results;
            } else {
                return error;
            }
        }
    );
}
export { addPointLayer, queryDrivingRoute }
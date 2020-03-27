<!-- 需要引入的有：turf,map,mimemap -->
<template>
  <div class="split-wrapper">
    <el-form label-position="left" label-width="40px">
      <el-form-item>
        <el-button @click="flag=!flag">点我切换生成方式</el-button>
      </el-form-item>
      <el-form-item v-if="!flag" label="数据">
        <el-input
          :placeholder="'请输入线数据,示例数据:' + exampleStr"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 10}"
          v-model.trim="lineData"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item v-if="flag" label="起点">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="start" clearable></el-input>
      </el-form-item>
      <el-form-item v-if="flag" label="终点">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="end" clearable></el-input>
      </el-form-item>
      <el-form-item label="单位">
        <el-col :span="10">
          <el-input placeholder="按多少单位切割" v-model.trim="splitLength"></el-input>
        </el-col>
        <el-col :span="14">
          <el-radio-group v-model="unit">
            <el-radio-button label="kilometers">kilometers</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleClick">提交生成</el-button>
      </el-form-item>
    </el-form>
    <div>
      <h3>PointSourceData</h3>
      <json-viewer :value="pointJsonData" :expand-depth="1" class="json-viewer" copyable sort></json-viewer>
      <h3>LineSourceData</h3>
      <json-viewer :value="lineJsonData" :expand-depth="1" class="json-viewer" copyable sort></json-viewer>
    </div>
  </div>
</template>

<script>
import { turf, map, minemap } from "../config";
export default {
  components: {},
  data() {
    return {
      start: "",
      end: "",
      splitLength: "",
      lineData: "",
      lineCoors: null,
      pointJsonData: {
        features: [],
        type: "FeatureCollection"
      },
      lineJsonData: {
        features: [],
        type: "FeatureCollection"
      },
      unit: "kilometers",
      flag: true,
      exampleStr: `{"type": "FeatureCollection","features": [{"type": "Feature","geometry": {"type": "LineString","coordinates":  [[116.37978,39.86563],[116.37994,39.86549],[116.37997,39.86546],[116.38013,39.86531]]},"properties": {"title": "路线一","kind": 1}}]}`,
      pointColors: ["red", "black", "green", "yellow", "blue"],
      lineColors: ["white", "pink", "orange", "#aa22ff", "#bbcc22"]
    };
  },

  computed: {},

  watch: {},

  methods: {
    handleClick() {
      if (this.flag) {
        minemap.service.queryDrivingRouteResult(
          this.start,
          this.end,
          4,
          "",
          "",
          (error, results) => {
            if (results) {
              this.lineCoors = JSON.parse(
                (
                  "[[" +
                  results.data.rows[0].routelatlon.split(";").join("],[") +
                  "]]"
                ).replace(",[]]", "]")
              );
              this.splitLine();
            } else {
              return error;
            }
          }
        );
      } else {
        this.lineCoors = [];
        let json = eval("(" + this.lineData + ")");
        for (let item of json.features) {
          this.lineCoors.push(...item.geometry.coordinates);
        }
        this.splitLine();
      }
    },
    splitLine() {
      let line = turf.lineString(this.lineCoors);
      let length = line.geometry.coordinates.length;
      let options = { units: this.unit };
      let along = turf.along(line, Number(this.splitLength), options);
      this.pointJsonData.features.push(turf.along(line, 0, options));
      this.pointJsonData.features.push(along);
      let i = 2;
      while (
        along.geometry.coordinates != line.geometry.coordinates[length - 1]
      ) {
        along = turf.along(line, Number(this.splitLength * i), options);
        this.pointJsonData.features.push(along);
        i++;
      }
      this.lineJsonData.features.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: this.lineCoors
        }
      });
      this.addLineLayer(this.lineJsonData, "along");
      this.addPointLayer(this.pointJsonData, "along");
    },

    addPointLayer(data, name) {
      if (map.getSource("pointSource_" + name)) {
        map.removeSource("pointSource_" + name);
      }
      map.addSource("pointSource_" + name, {
        type: "geojson",
        data: data
      });
      map.addLayer({
        id: "pointLayer_" + name,
        type: "circle",
        source: "pointSource_" + name,
        paint: {
          "circle-radius": 5,
          "circle-color": this.pointColors[Math.floor(Math.random() * 5)]
        }
      });
    },

    addLineLayer(data, name) {
      if (map.getSource("lineSource_" + name)) {
        map.removeSource("lineSource_" + name);
      }
      map.addSource("lineSource_" + name, {
        type: "geojson",
        data: data
      });
      map.addLayer({
        id: `lineLayer_${name}`,
        type: "line",
        source: `lineSource_${name}`,
        paint: {
          "line-width": 5,
          "line-color": this.lineColors[Math.floor(Math.random() * 5)]
        }
      });
    }
  },
  created() {},
  mounted() {},
  beforeCreate() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  activated() {}
};
</script>
<style lang="scss">
div {
  box-sizing: border-box;
}
h3 {
  z-index: 99;
  position: relative;
  color: white;
  margin-top: 0;
}
.split-wrapper {
  padding: 10px;
  display: flex;
  width: 100vw;
  justify-content: space-between;
}
.el-form {
  z-index: 99;
  label {
    color: white;
  }
}
.json-viewer {
  max-height: 200px;
  min-width: 177px;
  overflow: auto;
  margin-bottom: 10px;
}
</style>
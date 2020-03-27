<!-- 需要引入的有：turf,map,mimemap-->
<template>
  <div class="wrapper">
    <el-row>
      <el-button @click="flag=!flag">点击切换</el-button>
    </el-row>
    <el-row v-if="!flag">
      <el-input
        placeholder="请输入线数据"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 10}"
        v-model.trim="lineData"
        clearable
      ></el-input>
    </el-row>
    <el-row v-if="flag">
      <el-input placeholder="起点" v-model.trim="start" clearable></el-input>
    </el-row>
    <el-row v-if="flag">
      <el-input placeholder="终点" v-model.trim="end" clearable></el-input>
    </el-row>
    <el-row>
      <el-col :span="10">
        <el-input placeholder="按单位切割" v-model.trim="splitLength"></el-input>
      </el-col>
      <el-col :span="14">
        <el-radio-group v-model="unit">
          <el-radio-button label="kilometers">kilometers</el-radio-button>
          <el-radio-button label="miles">miles</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row>
      <el-button type="primary" @click="handleClick">提交生成</el-button>
    </el-row>
    <el-row>
      <json-viewer :value="jsonData" :expand-depth="1" copyable boxed sort></json-viewer>
    </el-row>
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
      lineCoors: null,
      splitLength: "",
      jsonData: [],
      unit: "kilometers",
      flag: true,
      lineData: "",
      colors: [
        "red",
        "black",
        "green",
        "yellow",
        "blue",
        "white",
        "pink",
        "orange",
        "#aa22ff",
        "#bbcc22"
      ]
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
              this.jsonData.push(this.splitLine());
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
          this.jsonData.push(this.splitLine());
        }
      }
    },
    splitLine() {
      let splitCoors = { type: "FeatureCollection", features: [] };
      let line = turf.lineString(this.lineCoors);
      let length = line.geometry.coordinates.length;
      let options = { units: this.unit };
      let along = turf.along(line, Number(this.splitLength), options);
      splitCoors.features.push(turf.along(line, 0, options));
      splitCoors.features.push(along);
      let i = 2;
      while (
        along.geometry.coordinates != line.geometry.coordinates[length - 1]
      ) {
        along = turf.along(line, Number(this.splitLength * i), options);
        splitCoors.features.push(along);
        i++;
      }
      this.addLineLayer(this.lineCoors);
      this.addPointLayer(splitCoors);
      return splitCoors;
      // this.jsonData = splitCoors;
    },

    addPointLayer(data) {
      let time = new Date().getTime();
      map.addSource("pointSource_" + time, {
        type: "geojson",
        data: data
      });
      map.addLayer({
        id: "pointLayer_" + time,
        type: "circle",
        source: "pointSource_" + time,
        paint: {
          "circle-radius": 5,
          "circle-color": this.colors[Math.floor(Math.random() * 10)]
        }
      });
    },

    addLineLayer(data) {
      let time = new Date().getTime();
      // if (map.getSource("lineSource_" + name)) {
      //   map.removeSource("lineSource_" + name);
      // }
      map.addSource("lineSource_" + time, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: data
          }
        }
      });
      map.addLayer({
        id: `lineLayer_` + time,
        type: "line",
        source: `lineSource_` + time,
        paint: {
          "line-width": 5,
          "line-color": this.colors[Math.floor(Math.random() * 10)]
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
<style lang="scss" scoped>
.wrapper {
  z-index: 99;
  position: absolute;
  top: 10px;
  left: 10px;
}
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
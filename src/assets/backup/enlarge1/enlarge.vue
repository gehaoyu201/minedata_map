<!--  -->
<template>
  <div class="wrapper">
    <el-form label-position="left" label-width="40px">
      <el-form-item>
        <el-button @click="loadExample">加载样例数据</el-button>
        <el-button @click="delExample" v-if="!flag">删除当前数据</el-button>
      </el-form-item>
      <div v-if="!flag">
        <div class="block">
          <span class="demonstration" style="color:white;">线宽</span>
          <el-slider v-model="lineWidth" :min="0" :max="100"></el-slider>
        </div>
        <div class="block">
          <span class="demonstration" style="color:white;">点大小</span>
          <el-slider v-model="circleSize" :min="0" :max="5" :step="0.1"></el-slider>
        </div>
      </div>
      <el-form-item label="点">
        <el-input
          :placeholder="'请输入点数据,示例' + pointExampleStr"
          type="textarea"
          :autosize="{ minRows: 5, maxRows: 6}"
          v-model.trim="pointData"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="线">
        <el-input
          :placeholder="'请输入线数据,示例' + lineExampleStr"
          type="textarea"
          :autosize="{ minRows: 5, maxRows: 6}"
          v-model.trim="lineData"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="单位">
        <el-input placeholder="点切割的距离，示例：5" v-model.trim="splitLength">
          <template slot="append">km</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleClick" v-if="flag">提交</el-button>
        <el-button type="primary" @click="startAnimation" v-if="!flag">开始动画</el-button>
        <el-button type="primary" @click="stopAnimation" v-if="!flag">暂停动画</el-button>
      </el-form-item>
    </el-form>
    <div class="container">
      <h3>线路扩大图</h3>
      <div class="bottom-con">
        <Map></Map>
        <el-timeline :style="{'top':topNumber + 'px'}">
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :color="activity.color"
            :size="activity.size"
            :timestamp="activity.timestamp"
          >{{activity.content}}</el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<script>
import Enlarge from "./enlarge";
import { lineJsonData, pointJsonData } from "./data";

import Map from "../MapContainer2";
export default {
  components: {
    Map
  },
  data() {
    return {
      pointJsonData: null,
      lineJsonData: null,
      flag: true,
      activities: [],
      topNumber: 141,
      pointData: "",
      lineData: "",
      splitLength: "",
      lineWidth: 10,
      circleSize: 0.3,
      pointExampleStr: `{ "features": [ { "type": "Feature", "properties": { "streetName": "起点", }, "geometry": { "type": "Point", "coordinates": [ 116.37978, 39.86563 ] } }, { "type": "Feature", "properties": { "streetName": "道路1", }, "geometry": { "type": "Point", "coordinates": [ 116.35340468579525, 39.86854792900613 ] } }, { "type": "Feature", "properties": { "streetName": "道路2", }, "geometry": { "type": "Point", "coordinates": [ 116.35663445200784, 39.9067765111443 ] } },{"type": "Feature","properties": {"streetName": "终点",},"geometry": {"type": "Point","coordinates": [116.36605245520686,39.946594123379455]}},], "type": "FeatureCollection"}`,
      lineExampleStr: `{"type": "FeatureCollection","features": [{"type": "Feature","geometry": {"type": "LineString","coordinates":  [[116.37978,39.86563],[116.37994,39.86549],[116.37997,39.86546],[116.38013,39.86531]]},"properties": {}}]}`
    };
  },

  computed: {},

  watch: {
    lineWidth(val) {
      window.map.setPaintProperty("lineLayer", "line-width", val);
    },
    circleSize(val) {
      window.map.setLayoutProperty("pointLayer", "icon-size", val);
    }
  },

  methods: {
    loadExample() {
      if (!this.flag) {
        return;
      }
      this.splitLength = 5;
      this.init(pointJsonData, lineJsonData);
    },
    delExample() {
      this.flag = true;
      this.pointData = "";
      this.lineData = "";
      this.splitLength = "";
      this.activities = [];
      this.enlarge.clearAll();
    },
    handleClick() {
      if (!this.pointData || !this.lineData) {
        this.$message({
          message: "输入有误！",
          type: "warning"
        });
        return;
      }
      if (!this.flag) {
        this.delExample();
      }
      let pointJsonData = eval("(" + this.pointData + ")");
      let lineJsonData = eval("(" + this.lineData + ")");
      this.init(pointJsonData, lineJsonData);
    },
    init(pointJsonData, lineJsonData) {
      this.flag = false;
      let imgSrc = require("../../assets/img/cam.png");
      this.pointData = JSON.stringify(pointJsonData);
      this.lineData = JSON.stringify(lineJsonData);
      this.pointJsonData = pointJsonData;
      this.lineJsonData = lineJsonData;
      this.enlarge = new Enlarge(this);
      this.enlarge.addLine(lineJsonData);
      this.enlarge.addPoint(pointJsonData, imgSrc);
      this.enlarge.initTrack(pointJsonData, lineJsonData);
      this.initTimeStamp(pointJsonData);
      window.map.on("click", e => this.mapClick(e));
      window.map2.on("move", () => this.move());
    },
    initTimeStamp(pointJsonData) {
      for (let item of pointJsonData.features) {
        this.activities.push({
          content: item.properties.streetName,
          color: "white"
        });
      }
      this.activities = this.activities.slice(0, this.activities.length - 1);
      this.$set(this.activities[0], "color", "red");
    },
    move() {
      let turf = window.turf;
      let map2 = window.map2;
      var point = turf.point([map2.getCenter().lng, map2.getCenter().lat]);
      var buffered = turf.buffer(point, this.splitLength, {
        units: "kilometers"
      });
      let i = 0;
      for (let item of this.pointJsonData.features) {
        var pt = turf.point(item.geometry.coordinates);
        var poly = turf.polygon(buffered.geometry.coordinates);
        var flag = turf.booleanPointInPolygon(pt, poly);
        if (flag) {
          for (let j = 0; j < this.activities.length; j++) {
            this.$set(this.activities[j], "color", "white");
            this.$set(this.activities[j], "size", "normal");
          }
          this.$set(this.activities[i], "color", "red");
          this.$set(this.activities[i], "size", "large");
          this.topNumber = -(47 * (i - 3));
          break;
        }
        i++;
      }
    },
    mapClick(e) {
      let map = window.map;
      let map2 = window.map2;
      let features = map.queryRenderedFeatures(
        [
          [e.point.x, e.point.y],
          [e.point.x, e.point.y]
        ],
        { layers: ["lineLayer", "pointLayer"] }
      );
      if (features.length != 0) {
        map2.flyTo({
          center: [e.lngLat.lng, e.lngLat.lat]
        });
        this.stopAnimation();
        this.move();
      }
    },
    startAnimation() {
      this.enlarge.startAnimation();
    },
    stopAnimation() {
      this.enlarge.stopAnimation();
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
* {
  box-sizing: border-box;
}
.wrapper {
  overflow: hidden;
}
.container {
  text-align: center;
  z-index: 99;
  position: absolute;
  right: 10px;
  top: 10px;
  padding: 10px;
  background: #4e85c659;
  overflow: hidden;
  height: 400px;
  width: 537px;
  h3 {
    margin: 0;
    margin-bottom: 10px;
    color: white;
  }
  .bottom-con {
    position: relative;
    width: 600px;
    height: 340px;
    overflow: hidden;
    .el-timeline {
      width: 138px;
      position: absolute;
      right: 80px;
      top: 0;
      .el-timeline-item__content {
        color: white;
      }
    }
  }
}
.el-form {
  z-index: 99;
  height: 100vh;
  padding: 10px 25px;
  backdrop-filter: saturate(120%) blur(10px);
  label {
    color: white;
  }
  .el-button {
    background: #25374b00;
    border-color: #48719f;
    color: #fff;
    &:hover,
    &:focus {
      background-color: #1d486d;
    }
  }
  .el-textarea__inner {
    background: #25374b00;
    border-color: #48719f;
    color: #fff;
  }
  .el-input {
    .el-input__inner {
      background: #25374b00;
      border-color: #48719f;
      color: #fff;
      &:hover {
        border-color: #c0c4cc;
      }
      &:focus {
        border-color: #409eff;
      }
    }
    .el-input-group__append {
      background: #25374b00;
      border-color: #48719f;
      color: #fff;
    }
  }
}
.el-textarea {
  textarea {
    resize: none;
    &::-webkit-scrollbar {
      width: 8px;
      background-color: rgba(0, 0, 0, 0);
    }
    &::-webkit-scrollbar-thumb {
      background-color: #48719f;
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
    }
  }
}
</style>
<!--  -->
<template>
  <div class="wrapper">
    <el-form label-position="left" label-width="40px">
      <el-tabs v-model="activeName" @tab-click="tabClick">
        <el-form-item>
          <el-button @click="loadExample">加载样例数据</el-button>
          <el-button @click="delData" v-if="!flag">删除当前加载数据</el-button>
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
        <el-tab-pane label="输入点线数据源" name="first">
          <el-form-item label="点">
            <el-input
              :placeholder="'请输入点数据,示例' + pointExampleStr"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 6}"
              v-model.trim="pointData"
              :disabled="activities.length != 0"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="线">
            <el-input
              :placeholder="'请输入线数据,示例' + lineExampleStr"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 6}"
              v-model.trim="lineData"
              :disabled="activities.length != 0"
              clearable
            ></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="输入起点终点经纬度" name="second">
          <el-form-item label="起点">
            <el-input
              placeholder="示例：116.37,39.86"
              v-model.trim="start"
              :disabled="activities.length != 0"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="终点">
            <el-input
              placeholder="示例：116.37,39.86"
              v-model.trim="end"
              :disabled="activities.length != 0"
              clearable
            ></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="输入起点终点名称" name="third">
          <el-form-item label="代码">
            <el-input
              placeholder="请输入行政区划代码，示例：320900"
              v-model="adcode"
              :disabled="activities.length != 0"
            ></el-input>
          </el-form-item>
          <el-form-item label="起点">
            <el-autocomplete
              class="inline-input"
              v-model="start"
              :fetch-suggestions="querySearch"
              placeholder="请输入内容"
              :trigger-on-focus="false"
              :disabled="activities.length != 0"
              @select="handleSelect"
            ></el-autocomplete>
          </el-form-item>
          <el-form-item label="终点">
            <el-autocomplete
              class="inline-input"
              v-model="end"
              :fetch-suggestions="querySearch"
              placeholder="请输入内容"
              :trigger-on-focus="false"
              :disabled="activities.length != 0"
              @select="handleSelect"
            ></el-autocomplete>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="输入线坐标数据" name="fourth">
          <el-form-item label="线">
            <el-input
              placeholder="请输入线数据,示例：[[116.37978,39.86563],[116.37994,39.86549],[116.37997,39.86546],[116.38013,39.86531]]"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 6}"
              v-model.trim="lineData"
              :disabled="activities.length != 0"
              clearable
            ></el-input>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-form-item label="单位">
        <el-input
          placeholder="点切割的距离，示例：5"
          v-model.trim="splitLength"
          :disabled="activities.length != 0"
        >
          <template slot="append">km</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleClick" v-if="flag">提交</el-button>
        <el-button type="primary" @click="startAnimation" v-if="!flag">开始动画</el-button>
        <el-button type="primary" @click="stopAnimation" v-if="!flag">暂停动画</el-button>
      </el-form-item>
    </el-form>
    <div class="container" v-show="activities.length!=0">
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
// 线路扩大图中的地图
import Map from "../MapContainer2";
let turf, map2, map, minemap;
export default {
  components: {
    Map
  },
  data() {
    return {
      results: [], //用来存放搜索结果
      end: "", //终点经纬度
      start: "", //起点经纬度
      activeName: "first", //切换tabs的名字
      flag: true, //用来判断是否加载样例数据
      activities: [], //时间轴用到的数据
      topNumber: 141, //初始时间轴的偏移值
      pointData: "", //点字符串数据源
      lineData: "", //线字符串数据源
      pointJsonData: null, //点数据源
      lineJsonData: null, //线数据源
      splitLength: "", //分割长度
      lineWidth: 5, //线的宽度
      circleSize: 0.3, //点的大小
      adcode: "", //行政区号
      pointExampleStr: `{ "features": [ { "type": "Feature", "properties": { "streetName": "起点", }, "geometry": { "type": "Point", "coordinates": [ 116.37978, 39.86563 ] } }, { "type": "Feature", "properties": { "streetName": "道路1", }, "geometry": { "type": "Point", "coordinates": [ 116.35340468579525, 39.86854792900613 ] } }, { "type": "Feature", "properties": { "streetName": "道路2", }, "geometry": { "type": "Point", "coordinates": [ 116.35663445200784, 39.9067765111443 ] } },{"type": "Feature","properties": {"streetName": "终点",},"geometry": {"type": "Point","coordinates": [116.36605245520686,39.946594123379455]}},], "type": "FeatureCollection"}`,
      lineExampleStr: `{"type": "FeatureCollection","features": [{"type": "Feature","geometry": {"type": "LineString","coordinates":  [[116.37978,39.86563],[116.37994,39.86549],[116.37997,39.86546],[116.38013,39.86531]]},"properties": {}}]}`
    };
  },

  computed: {},

  watch: {
    // 控制线的宽度
    lineWidth(val) {
      map.setPaintProperty("lineLayer", "line-width", val);
    },
    // 控制点的大小
    circleSize(val) {
      map.setLayoutProperty("pointLayer", "icon-size", val);
    }
  },

  methods: {
    tabClick() {
      let obj = this.enlarge.getConfig();
      turf = obj.turf;
      map = obj.map;
      map2 = obj.map2;
      minemap = obj.minemap;
    },
    handleSelect(item) {
      this.results.push(item);
    },
    querySearch(queryString, cb) {
      let result = [];
      minemap.service.queryPoiSearchResult(
        this.adcode,
        queryString,
        1,
        10,
        function(error, results) {
          for (let item of results.data.rows) {
            result.push({
              value: item.name,
              coor: item.geom.coordinates
            });
          }
          cb(result);
        }
      );
    },
    loadExample() {
      if (!this.flag) {
        this.$message("当前已经有数据了");
        return;
      }
      this.activeName = "first";
      let obj = this.enlarge.getConfig();
      turf = obj.turf;
      map = obj.map;
      map2 = obj.map2;
      minemap = obj.minemap;
      this.splitLength = 5;
      this.init(pointJsonData, lineJsonData);
    },
    delData() {
      this.flag = true;
      this.pointData = "";
      this.lineData = "";
      this.splitLength = "";
      this.lineCoorData = "";
      this.pointJsonData = null;
      this.lineJsonData = null;
      this.start = "";
      this.end = "";
      this.adcode = "";
      this.activities = [];
      this.circleSize = 0.3;
      this.lineWidth = 5;
      this.enlarge.clearAll();
    },
    handleClick() {
      if (this.activeName == "first") {
        this.firstEvent();
      } else if (this.activeName == "second") {
        this.secondEvent(this.start, this.end);
      } else if (this.activeName == "third") {
        this.secondEvent(this.results[0].coor, this.results[1].coor);
      } else if (this.activeName == "fourth") {
        let coors = this.enlarge.parseCoors(this.lineData);
        let obj = this.enlarge.splitLineData(
          coors,
          "kilometers",
          this.splitLength
        );
        this.init(obj.pointJsonData, obj.lineJsonData);
      }
    },
    secondEvent(start, end) {
      let that = this;
      minemap.service.queryDrivingRouteResult(
        String(start),
        String(end),
        4,
        "",
        "",
        (error, results) => {
          let coors = null;
          if (results) {
            if (results.errcode == -1) {
              that.$message({
                message: "没有找到线路",
                type: "warning"
              });
              return;
            }
            coors = JSON.parse(
              (
                "[[" +
                results.data.rows[0].routelatlon.split(";").join("],[") +
                "]]"
              ).replace(",[]]", "]")
            );
          }
          let obj = this.enlarge.splitLineData(
            coors,
            "kilometers",
            this.splitLength
          );
          this.init(obj.pointJsonData, obj.lineJsonData);
          this.results = [];
        }
      );
    },
    firstEvent() {
      if (!this.pointData || !this.lineData) {
        this.$message({
          message: "输入有误！",
          type: "warning"
        });
        return;
      }
      if (!this.flag) {
        this.delData();
      }
      let pointJsonData = eval("(" + this.pointData + ")");
      let lineJsonData = eval("(" + this.lineData + ")");
      this.init(pointJsonData, lineJsonData);
    },
    init(pointJsonData, lineJsonData) {
      this.flag = false;
      let imgSrc = require("../../assets/img/cam.png");
      if (this.activeName == "first") {
        this.pointData = JSON.stringify(pointJsonData);
        this.lineData = JSON.stringify(lineJsonData);
      }
      this.pointJsonData = pointJsonData;
      this.lineJsonData = lineJsonData;
      this.splitLen = this.splitLength;
      this.enlarge = new Enlarge(this);
      this.enlarge.addLine(lineJsonData, "lineLayer", "lineSource");
      this.enlarge.addPoint(pointJsonData, "pointLayer", "pointSource", imgSrc);
      this.enlarge.initTrack(pointJsonData, lineJsonData);
      this.initTimeStamp(pointJsonData);
      map.on("click", e => this.mapClick(e));
      map2.on("move", () => this.move());
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
      var point = turf.point([map2.getCenter().lng, map2.getCenter().lat]);
      var buffered = turf.buffer(point, this.splitLen, {
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
  mounted() {
    this.enlarge = new Enlarge(this);
  },
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

.container {
  text-align: center;
  z-index: 99;
  position: absolute;
  right: 10px;
  top: 10px;
  padding: 10px;
  background: #4e85c659;
  overflow: hidden;
  height: 365px;
  width: 537px;
  h3 {
    margin: 0;
    margin-bottom: 10px;
    color: white;
  }
  .bottom-con {
    position: relative;
    width: 600px;
    height: 300px;
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
form.el-form {
  z-index: 99;
  height: 100vh;
  padding: 10px 25px;
  backdrop-filter: saturate(120%) blur(10px);
  overflow: auto;
  &::-webkit-scrollbar {
    width: 8px;
    background-color: rgba(0, 0, 0, 0);
  }
  &::-webkit-scrollbar-thumb {
    background-color: #48719f;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
  label {
    color: white;
  }
  .el-tabs__item {
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
      &.is-disabled .el-input__inner {
        background: none;
        border-color: #48719f;
      }
    }
    .el-input-group__append {
      background: #25374b00;
      border-color: #48719f;
      color: #fff;
    }
  }
  .el-autocomplete {
    width: 100%;
  }
  .el-tabs__nav-next,
  .el-tabs__nav-prev {
    color: white;
  }
}
div.el-textarea {
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
  &.is-disabled .el-textarea__inner {
    background: none;
    border-color: #48719f;
  }
}
div.el-autocomplete-suggestion {
  background-color: #26466aed;
  border-color: #48719f;
  &.is-loading li:hover {
    background-color: #525f728c;
  }
  li {
    color: white;
    &:hover {
      background-color: #525f728c;
    }
  }
}
div.el-popper[x-placement^="bottom"] .popper__arrow {
  border-bottom-color: #264569;
  &::after {
    border-bottom-color: #3a74b8;
  }
}
</style>
<!-- 需要引入的有：turf,map,mimemap -->
<template>
  <div class="split-wrapper">
    <el-form label-position="left" label-width="40px">
      <el-form-item>
        <el-button @click="flag=!flag;clickStr='点击切换为按起点终点分割'" style="width:216px;">{{clickStr}}</el-button>
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
        <el-input placeholder="按多少千米切割，示例：10" v-model.trim="splitLength">
          <template slot="append">km</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleClick">提交生成</el-button>
      </el-form-item>
    </el-form>
    <div class="json-wrapper" v-if="pointJsonData">
      <h3>点数据</h3>
      <json-viewer :value="pointJsonData" :expand-depth="3" class="json-viewer" copyable sort></json-viewer>
      <h3>线数据</h3>
      <json-viewer :value="lineJsonData" :expand-depth="3" class="json-viewer" copyable sort></json-viewer>
    </div>
  </div>
</template>

<script>
import SplitLine from "./splitLine";
import { minemap } from "../../config";
export default {
  components: {},
  data() {
    return {
      start: "",
      end: "",
      splitLength: "",
      lineData: "",
      clickStr: "点击切换为按线数据分割",
      splitLine: null,
      pointJsonData: null,
      lineJsonData: null,
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
              let lineCoors = JSON.parse(
                (
                  "[[" +
                  results.data.rows[0].routelatlon.split(";").join("],[") +
                  "]]"
                ).replace(",[]]", "]")
              );
              let obj = this.splitLine.splitLine(
                lineCoors,
                this.unit,
                this.splitLength
              );
              this.pointJsonData = obj.pointData;
              this.lineJsonData = obj.lineData;
            } else {
              return error;
            }
          }
        );
      } else {
        let lineCoors = [];
        let json = eval("(" + this.lineData + ")");
        for (let item of json.features) {
          lineCoors.push(...item.geometry.coordinates);
        }
        let obj = this.splitLine.splitLine(
          lineCoors,
          this.unit,
          this.splitLength
        );
        this.pointJsonData = obj.pointData;
        this.lineJsonData = obj.lineData;
      }
    }
  },
  created() {},
  mounted() {
    this.splitLine = new SplitLine(this);
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
div {
  box-sizing: border-box;
}
h3 {
  z-index: 99;
  position: relative;
  color: white;
  margin: 0;
}
.split-wrapper {
  padding: 10px;
  display: flex;
  width: 100vw;
  justify-content: space-between;
}
.el-form {
  z-index: 99;
  border: 2px solid #333f51;
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
.json-wrapper {
  border: 2px solid #333f51;
  padding: 10px 25px;
  backdrop-filter: saturate(120%) blur(10px);
  .json-viewer {
    max-height: 200px;
    min-width: 177px;
    overflow: auto;
    margin-bottom: 10px;
    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    &::-webkit-scrollbar-track {
      background: rgb(239, 239, 239);
      border-radius: 2px;
    }
    &::-webkit-scrollbar-thumb {
      background: #1a2a3e;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #333;
    }
  }
  .jv-container.jv-light {
    background: #25374b00;
    border-color: #48719f;
    .jv-node .jv-item {
      color: #fff !important;
    }
    .jv-key {
      color: #fff !important;
    }
  }
}
</style>
<!-- 用户输入坐标点页面，需要引入map，minemap -->
<template>
  <div class="drawLine-wrapper">
    <el-form label-position="left" label-width="40px">
      <el-form-item>
        <el-button @click="flag=!flag;clickStr='点击切换为按起点终点分割'" style="width:216px;">{{clickStr}}</el-button>
      </el-form-item>

      <el-form-item v-if="!flag" label="数据">
        <el-input
          placeholder="请输入线数据,示例：[[116.37978,39.86563],[116.37994,39.86549],[116.37997,39.86546],[116.38013,39.86531]]"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 10}"
          v-model.trim="lineCoors"
          clearable
          v-if="!flag"
        ></el-input>
      </el-form-item>

      <el-form-item label="起点" v-if="flag">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="start" clearable></el-input>
      </el-form-item>

      <el-form-item label="终点" v-if="flag">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="end" clearable></el-input>
      </el-form-item>

      <el-form-item label="颜色">
        <el-select v-model="value" placeholder="请选择线的颜色">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="线宽">
        <el-input placeholder="示例：10" v-model.trim="lineWidth" clearable></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleClick">提交生成</el-button>
      </el-form-item>
    </el-form>

    <div v-if="!layerData.length == 0" class="json-wrapper">
      <h3>Source数据</h3>
      <json-viewer :value="sourceData" class="json-viewer" :expand-depth="2" copyable sort></json-viewer>
      <h3>Layer数据</h3>
      <json-viewer :value="layerData" class="json-viewer" :expand-depth="2" copyable sort></json-viewer>
    </div>
  </div>
</template>

<script>
import LightLine from "./lightLine";
export default {
  components: {},
  data() {
    return {
      lineCoors: "",
      value: "",
      start: "",
      end: "",
      lineWidth: "",
      clickStr: "点击切换为按线数据分割",
      flag: true,
      LightLine: null,
      layerData: [],
      sourceData: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      colors: {
        red: ["#ff0000", "#ff3838", "#ff8383", "#ffbebe", "#ffd1d1"],
        orange: ["#ff9b00", "#ffb23a", "#ffcc7b", "#fff1ab", "#fff6c9"],
        blue: ["#0048ff", "#2865ff", "#5c8aff", "#96b4ff", "#eaf0ff"],
        green: ["#00A600", "#00EC00", "#79FF79", "#BBFFBB", "#F0FFF0"]
      },
      options: [
        {
          value: "red",
          label: "红色"
        },
        {
          value: "orange",
          label: "橙色"
        },
        {
          value: "green",
          label: "绿色"
        },
        {
          value: "blue",
          label: "蓝色"
        }
      ]
    };
  },

  computed: {},

  watch: {},

  methods: {
    handleClick() {
      if (this.flag) {
        if (this.start && this.end && this.value && this.lineWidth) {
          this.LightLine.initDrivingLightLine(
            this.start,
            this.end,
            this.lineWidth,
            this.value
          );
        } else {
          this.$message({
            message: "输入有误！！！",
            type: "warning"
          });
        }
      } else {
        if (this.lineCoors && this.value && this.lineWidth) {
          this.LightLine.initLightLine(
            this.LightLine.parseCoors(this.lineCoors),
            this.lineWidth,
            this.value
          );
        } else {
          this.$message({
            message: "输入有误！！！",
            type: "warning"
          });
        }
      }
    }
  },

  created() {},
  mounted() {
    this.LightLine = new LightLine(this);
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
.drawLine-wrapper {
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
    &:last-child {
      margin: 0;
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
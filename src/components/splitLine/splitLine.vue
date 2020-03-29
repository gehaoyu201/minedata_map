<!-- 需要引入的有：turf,map,mimemap -->
<template>
  <div class="split-wrapper">
    <el-form label-position="left" label-width="40px">
      <el-form-item>
        <el-button @click="flag=!flag;clickStr='点击切换为按起点终点分割';" style="width:264px;">{{clickStr}}</el-button>
      </el-form-item>
      <el-form-item v-if="!flag" label="数据">
        <el-input
          :placeholder="'请输入线数据,示例数据:' + exampleStr"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 10}"
          v-model.trim="splitOption.lineData"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item v-if="flag" label="起点">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="splitOption.start" clearable></el-input>
      </el-form-item>
      <el-form-item v-if="flag" label="终点">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="splitOption.end" clearable></el-input>
      </el-form-item>
      <el-form-item label="单位">
        <el-input placeholder="按多少千米切割，示例：10" v-model.trim="splitOption.splitLength">
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
export default {
  components: {},
  data() {
    return {
      /**
       *
       *  必须指定的属性：start,end,splitLength 或者 lineData,splitLength
       *  非必须指定的属性：unit,circleRadius,lineWidth,pointColors(不超过5个),lineColors(不超过5个)
       *                  lineLayerName,lineSourceName,pointLayerName,pointSourceName
       */
      splitOption: {
        start: "", //起点
        end: "", //终点
        splitLength: "", //分割长度
        lineData: "", //线数据
        unit: "kilometers" //分割单位
      },
      clickStr: "点击切换为按线数据分割",
      splitLine: null,
      pointJsonData: null, //json-viewer pointSource展示
      lineJsonData: null, //json-viewer lineJsonSource展示
      flag: true,
      exampleStr: `{"type": "FeatureCollection","features": [{"type": "Feature","geometry": {"type": "LineString","coordinates":  [[116.37978,39.86563],[116.37994,39.86549],[116.37997,39.86546],[116.38013,39.86531]]},"properties": {"title": "路线一","kind": 1}}]}`
    };
  },

  computed: {},

  watch: {},

  methods: {
    handleClick() {
      let option = JSON.parse(JSON.stringify(this.splitOption));
      if (this.flag) {
        // 路径规划选项，不需要线数据
        delete option.lineData;
      } else {
        // 线数据选项，不需要起点和终点
        delete option.start;
        delete option.end;
      }
      // 设置整个对象属性
      this.splitLine.setObjectOption(option);
      // 渲染
      this.splitLine.render();
      // 得到json-viewer数据
      this.pointJsonData = this.splitLine.getPointJsonData();
      this.lineJsonData = this.splitLine.getLineJsonData();
    }
  },
  created() {},
  mounted() {
    // 实例对象
    this.splitLine = new SplitLine();
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
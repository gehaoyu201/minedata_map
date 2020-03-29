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
          v-model.trim="lightLineOption.lineCoors"
          clearable
          v-if="!flag"
        ></el-input>
      </el-form-item>

      <el-form-item label="起点" v-if="flag">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="lightLineOption.start" clearable></el-input>
      </el-form-item>

      <el-form-item label="终点" v-if="flag">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="lightLineOption.end" clearable></el-input>
      </el-form-item>

      <el-form-item label="颜色">
        <el-select v-model="lightLineOption.color" placeholder="请选择线的颜色">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="线宽">
        <el-input placeholder="示例：10" v-model.trim="lightLineOption.lineWidth" clearable></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleClick">提交生成</el-button>
      </el-form-item>
    </el-form>

    <div v-if="!layerData.length == 0" class="json-wrapper">
      <h3>数据源</h3>
      <json-viewer :value="sourceData" class="json-viewer" :expand-depth="2" copyable sort></json-viewer>
      <h3>图层数据</h3>
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
      /**
       *
       *  必须指定的属性：start,end,color,lineWidth 或者 lineCoors,color,lineWidth
       *  非必须指定的属性：sourceName,layerName,colors
       */
      lightLineOption: {
        lineCoors: "", //线坐标数据，示例[[120,121],[122,123]]
        color: "", //线的颜色
        start: "", //路径规划起点
        end: "", //路径规划终点
        lineWidth: "" //路径规划线宽
      },
      clickStr: "点击切换为按线数据分割",
      flag: true,
      lightLine: null,
      layerData: [], //图层
      sourceData: [], //数据源
      options: [] //颜色下拉框属性
    };
  },

  computed: {},

  watch: {},

  methods: {
    handleClick() {
      let option = JSON.parse(JSON.stringify(this.lightLineOption));
      if (this.flag) {
        // 起点终点选项，不需要线数据
        delete option.lineCoors;
      } else {
        // 线数据选项，不需要起点终点
        delete option.start;
        delete option.end;
      }
      // 设置整个对象属性
      this.lightLine.setObjectOption(option);
      // 渲染高亮线
      this.lightLine.render();
      // 获得图层数据
      this.layerData = this.lightLine.getLayerData();
      // 获得数据源
      this.sourceData = this.lightLine.getSourceData();
    }
  },

  created() {},
  mounted() {
    // 初始化实例
    this.lightLine = new LightLine();
    // 获取高亮色颜色的数组，放进下拉框
    let arr = this.lightLine.getColorNames();
    for (let item of arr) {
      this.options.push({ value: item, label: item });
    }
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
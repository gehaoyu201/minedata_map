<template>
  <div id="edit-ctrl-group" class="edit-ctrl-group">
    <div class="edit-btn" title="画多边形" @click="handleClick('polygon')">
      <span class="iconfont icon-draw-polygon1" />
    </div>
    <el-popover placement="bottom" title="总面积" width="400" trigger="click">
      <div>{{sum!=0?sum+'平方米' :'你还没有进行绘制'}}</div>
      <json-viewer :value="jsonData" class="json-viewer" :expand-depth="5" copyable sort></json-viewer>
      <el-button slot="reference" @click="handleAreaClick">点击查看总面积</el-button>
    </el-popover>
  </div>
</template>

<script>
import TotalArea from "./totalArea";
export default {
  components: {},
  data() {
    return {
      jsonData: [],
      sum: 0
    };
  },
  computed: {},

  watch: {},

  methods: {
    handleClick(mode) {
      this.totalArea.onEditBtnClick(mode);
    },
    handleAreaClick() {
      let obj = this.totalArea.sumArea();
      this.sum = obj.sum;
      this.jsonData = obj.jsonData;
    }
  },

  created() {},
  mounted() {
    this.totalArea = new TotalArea(this);
    this.totalArea.initEdit();
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
@import url("https://minedata.cn/api/static/demo/js-api/zh/css/iconfont/iconfont.css");
@import url("https://minedata.cn/minemapapi/v2.0.0/plugins/edit/minemap-edit.css");
.edit-ctrl-group {
  position: absolute;
  z-index: 300;
  top: 10px;
  right: 10px;
  overflow: hidden;
  .el-button {
    background: #25374b00;
    border-color: #48719f;
    color: #fff;
    &:hover,
    &:focus {
      background-color: #1d486d;
    }
  }
  .edit-btn {
    width: 37px;
    display: inline-block;
    height: 37px;
    line-height: 36px;
    font-size: 19px;
    margin-right: 1rem;
    vertical-align: middle;
    text-align: center;
    cursor: pointer;
    color: #fff;
    background-color: #25374b00;
    border: 1px solid #48719f;
    &:hover,
    &:focus {
      background-color: #1d486d;
    }
  }
}

.edit-btn:hover {
  background-color: #efefef;
}
div.el-popover {
  background: #25374b00;
  backdrop-filter: saturate(120%) blur(10px);
  border-color: #48719f;
  color: #fff;
  .el-popover__title {
    color: #fff;
  }
  .popper__arrow::after {
    background: #25374b00;
    border-bottom-color: #25374b !important;
  }
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


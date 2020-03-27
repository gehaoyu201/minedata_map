<!-- 绘制面并计算所有面的总面积,需要引入map，minemap，turf，minemap-edit -->
<template>
  <div id="edit-ctrl-group" class="edit-ctrl-group">
    <div class="edit-btn" title="画多边形" @click="onEditBtnClick('polygon')">
      <span class="iconfont icon-draw-polygon1" />
    </div>
    <el-popover placement="bottom" title="总面积" width="400" trigger="hover">
      <div>{{sum!=0?sum+'平方米' :'你还没有进行绘制'}}</div>
      <json-viewer :value="jsonData" :expand-depth="5" copyable boxed sort></json-viewer>
      <el-button slot="reference">查看总面积</el-button>
    </el-popover>
  </div>
</template>

<script>
import { edit, minemap, map, turf } from "../config";
export default {
  components: {},
  data() {
    return {
      edit: null,
      sum: 0,
      coors: [],
      jsonData: []
    };
  },
  computed: {},

  watch: {},

  methods: {
    initEdit() {
      this.edit = new minemap.edit.init(map, {
        boxSelect: true,
        touchEnabled: true,
        displayControlsDefault: true,
        showButtons: false
      });
      map.on("edit.record.create", this.onEditRecordCreate);
    },
    onEditRecordCreate() {
      this.totalArea();
    },
    onEditBtnClick(mode) {
      if (edit && mode) {
        edit.onBtnCtrlActive(mode);
      }
    },
    totalArea() {
      this.coors = [];
      this.sum = 0;
      this.jsonData = this.edit.draw.getAll().features;
      for (let item of this.jsonData) {
        this.coors.push(item.geometry.coordinates);
      }
      for (let item of this.coors) {
        this.sum += turf.area(turf.polygon(item));
      }
    }
  },

  created() {},
  mounted() {
    this.initEdit();
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
<style>
@import url("https://minedata.cn/api/static/demo/js-api/zh/css/iconfont/iconfont.css");
@import url("https://minedata.cn/minemapapi/v2.0.0/plugins/edit/minemap-edit.css");
.edit-ctrl-group {
  position: absolute;
  z-index: 300;
  top: 10px;
  right: 10px;
  overflow: hidden;
}

.edit-btn {
  width: 30px;
  display: inline-block;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  margin-right: 1rem;
  vertical-align: middle;
  text-align: center;
  cursor: pointer;
  color: #111;
  background-color: white;
  border: 1px solid #ddd;
}

.edit-btn:hover {
  background-color: #efefef;
}
</style>


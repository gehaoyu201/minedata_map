<!-- 
    需要引入的有：this.turf,mimemap,为了显示点位数据,还引入了this.addPointLayer方法，需要使用到json-viewer插件
-->
<template>
  <div class="wrapper">
    <el-row>
      <json-viewer :value="jsonData" :expand-depth="1" copyable boxed sort></json-viewer>
    </el-row>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      line: null,
      jsonData: []
    };
  },
  props: [
    "start",
    "end",
    "unit",
    "splitLength",
    "turf",
    "minemap",
    "addPointLayer"
  ],
  computed: {},

  watch: {},

  methods: {
    init() {
      this.minemap.service.queryDrivingRouteResult(
        this.start,
        this.end,
        4,
        "",
        "",
        (error, results) => {
          if (results) {
            this.line = JSON.parse(
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
    },
    splitLine() {
      let splitCoors = { type: "FeatureCollection", features: [] };
      let line = this.turf.lineString(this.line);
      let length = line.geometry.coordinates.length;
      let options = { units: this.unit };
      let along = this.turf.along(line, Number(this.splitLength), options);
      splitCoors.features.push(this.turf.along(line, 0, options));
      splitCoors.features.push(along);
      let i = 2;
      while (
        along.geometry.coordinates != line.geometry.coordinates[length - 1]
      ) {
        along = this.turf.along(line, Number(this.splitLength * i), options);
        splitCoors.features.push(along);
        i++;
      }
      this.addPointLayer(splitCoors, "along");
      this.jsonData = splitCoors;
    }
  },
  created() {},
  mounted() {
    this.init();
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
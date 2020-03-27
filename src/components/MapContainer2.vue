<!-- Map容器 -->
<template>
  <div class="map2" id="map2"></div>
</template>

<script>
import { minemap, mapConfig } from "../config";
let map2 = null;
export default {
  components: {},
  data() {
    return {};
  },

  computed: {},

  watch: {},

  methods: {
    initMap() {
      minemap.domainUrl = mapConfig.domainUrl;
      minemap.dataDomainUrl = mapConfig.dataDomainUrl;
      minemap.spriteUrl = mapConfig.spriteUrl;
      minemap.serviceUrl = mapConfig.serviceUrl;
      minemap.accessToken = mapConfig.accessToken;
      minemap.solution = 2374;
      map2 = new minemap.Map({
        container: "map2",
        style: mapConfig.style,
        center: [116.38187377766894, 39.86596170220275],
        zoom: 15,
        pitch: 0,
        maxZoom: 17,
        minZoom: 3,
        logoControl: false /*logo控件是否显示，不加该参数时默认显示*/,
        scrollZoom: false,
        dragRotate: false,
        dragPan: false,
        doubleClickZoom: false,
        interactive: false
      });
      window.map2 = map2;
    }
  },

  created() {},
  mounted() {
    this.initMap();
    this.$emit("map", map2);
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
@import url("https://minedata.cn/minemapapi/v2.0.0/minemap.css");
html,
body,
#map2 {
  margin: 0;
  padding: 0;
  /* width: 100%;
  height: 100%; */
  width: 400px;
  height: 340px;
}
#map2 {
  position: absolute;
}
</style>
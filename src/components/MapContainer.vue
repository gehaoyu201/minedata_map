<!-- Map容器 -->
<template>
  <div class="map" id="map"></div>
</template>

<script>
import { minemap, mapConfig } from "../config";
export let map = null;
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
      map = new minemap.Map({
        container: "map",
        style: mapConfig.style,
        // center: [116.46, 39.92],
        center: [116.4160546871152, 39.93790262784151],
        zoom: 10,
        pitch: 0,
        maxZoom: 17,
        minZoom: 3,
        logoControl: false
      });
      window.map = map;
    }
  },

  created() {},
  mounted() {
    this.initMap();
    this.$emit("map", map);
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
#map {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
#map {
  position: absolute;
}
</style>
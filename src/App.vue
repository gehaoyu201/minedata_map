<template>
  <div id="app">
    <Map></Map>
    <TotalArea />
  </div>
</template>

<script>
import Map from "./components/MapContainer";
import TotalArea from "./components/totalArea/totalArea.vue";
export default {
  name: "app",
  components: {
    Map,
    TotalArea
  }
};
</script>

<style>
</style>

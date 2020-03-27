<template>
  <div id="app2">
    <Map></Map>
    <LineSplit />
  </div>
</template>

<script>
import Map from "./components/MapContainer";
import LineSplit from "./components/splitLine/splitLine.vue";
export default {
  name: "app2",
  components: {
    Map,
    LineSplit
  }
};
</script>

<style>
</style>

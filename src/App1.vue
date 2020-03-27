<template>
  <div id="app1">
    <Map></Map>
    <DrawLine />
  </div>
</template>

<script>
import Map from "./components/MapContainer";
import DrawLine from "./components/lightLine/lightLine.vue";
export default {
  name: "app1",
  components: {
    Map,
    DrawLine
  }
};
</script>

<style>
</style>

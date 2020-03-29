<template>
  <div id="app">
    <Map></Map>
    <Enlarge />
  </div>
</template>

<script>
import Map from "./components/MapContainer";
import Enlarge from "./components/enlarge/enlarge.vue";
export default {
  name: "app",
  components: {
    Map,
    Enlarge
  },
  data() {
    return {
      mapState: false
    };
  },
  method: {}
};
</script>

<style>
</style>

<template>
  <div id="app2">
    <Map @map="getMap"></Map>
    <DrawLine1
      :start="this.start"
      :end="this.end"
      :color="this.color"
      :lineWidth="this.lineWidth"
      :map="this.map"
      :minemap="this.minemap"
    />
    <LineSplit1
      :start="this.start"
      :end="this.end"
      :unit="this.unit"
      :splitLength="this.splitLength"
      :turf="this.turf"
      :minemap="this.minemap"
      :addPointLayer="this.addPointLayer"
    />
  </div>
</template>

<script>
import Map from "./components/MapContainer";
import LineSplit1 from "./assets/backup/LineSplit1";
import DrawLine1 from "./assets/backup/DrawLine1";

import { addPointLayer } from "./util/util";

export default {
  name: "app3",
  components: {
    Map,
    LineSplit1,
    DrawLine1
  },
  data() {
    return {
      start: "116.37959,39.86541",
      end: "116.40411,40.04775",
      unit: "miles",
      splitLength: "1",
      turf: window.turf,
      minemap: window.minemap,
      addPointLayer: addPointLayer,
      map: null,
      lineWidth: "10",
      color: "red"
    };
  },
  methods: {
    getMap(v) {
      this.map = v;
    }
  }
};
</script>

<style>
</style>

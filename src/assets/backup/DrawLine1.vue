<template>
  <div class="wrapper"></div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      colors: {
        // 颜色从外到里
        red: ["#ff0000", "#ff5858", "#ff5858", "#ff9191", "#f9c0c0"],
        orange: ["#BB3D00", "#FF5809", "#FF9D6F", "#FFCBB3", "#FFF3EE"],
        blue: ["0008ff", "#3a40ff", "#6d71ff", "#9497ff", "#bcbeff"],
        green: ["#00A600", "#00EC00", "#79FF79", "#BBFFBB", "#F0FFF0"]
      },
      options: [
        {
          value: "red",
          label: "红色"
        },
        {
          value: "orange",
          label: "橙色"
        },
        {
          value: "blue",
          label: "蓝色"
        },
        {
          value: "green",
          label: "绿色"
        }
      ]
    };
  },
  props: ["start", "end", "color", "lineWidth", "map", "minemap"],
  computed: {},

  watch: {},

  methods: {
    init() {
      if (this.start && this.end) {
        this.minemap.service.queryDrivingRouteResult(
          this.start,
          this.end,
          4,
          "",
          "",
          (error, results) => {
            if (results) {
              let coors = JSON.parse(
                (
                  "[[" +
                  results.data.rows[0].routelatlon.split(";").join("],[") +
                  "]]"
                ).replace(",[]]", "]")
              );
              this.addLine(coors);
            } else {
              return error;
            }
          }
        );
      }
    },
    addLine(coors) {
      let time = new Date().getTime();
      this.map.addSource("lineSource_" + time, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coors
          }
        }
      });
      let length = this.colors[this.color].length;
      let lineWidth = Number(this.lineWidth);
      let lineOpacity = 0.2;
      this.colors[this.color].forEach((e, i) => {
        this.map.addLayer({
          id: `lineLayer${i}_${time}`,
          type: "line",
          source: `lineSource_${time}`,
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-width": lineWidth,
            "line-color": this.colors[this.color][i],
            "line-opacity": lineOpacity
          }
        });
        lineWidth -= this.lineWidth / length;
        lineOpacity += 1 / length;
      });
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
<style scoped lang="scss">
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
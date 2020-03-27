<!-- 用户输入坐标点页面，需要引入map，minemap -->
<template>
  <div class="drawLine-wrapper">
    <el-form label-position="left" label-width="40px">
      <el-form-item>
        <el-button @click="flag=!flag">点击切换生成方式</el-button>
      </el-form-item>

      <el-form-item v-if="!flag" label="数据">
        <el-input
          placeholder="请输入线数据，参照例子[[116.37978,39.86563],[116.37994,39.86549],[116.37997,39.86546],[116.38013,39.86531]]"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 10}"
          v-model.trim="input"
          clearable
          v-if="!flag"
        ></el-input>
      </el-form-item>

      <el-form-item label="起点" v-if="flag">
        <el-input placeholder="起点,例子116.37,39.86" v-model.trim="start" clearable></el-input>
      </el-form-item>

      <el-form-item label="终点" v-if="flag">
        <el-input placeholder="终点,例子116.37,39.86" v-model.trim="end" clearable></el-input>
      </el-form-item>

      <el-form-item label="颜色">
        <el-select v-model="value" placeholder="请选择线的颜色">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="线宽">
        <el-input placeholder="线的宽度" v-model.trim="lineWidth" clearable></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleClick">提交生成</el-button>
      </el-form-item>
    </el-form>

    <div>
      <json-viewer :value="sourceData" class="json-viewer" :expand-depth="1" copyable sort></json-viewer>
      <json-viewer :value="layerData" class="json-viewer" :expand-depth="1" copyable sort></json-viewer>
    </div>
  </div>
</template>

<script>
import { minemap, map } from "../config";
export default {
  components: {},
  data() {
    return {
      input: "",
      value: "",
      start: "",
      end: "",
      lineWidth: "",
      flag: true,
      layerData: [],
      sourceData: [],
      colors: {
        // 颜色从外到里
        red: ["#ff0000", "#ff5858", "#ff5858", "#ff9191", "#f9c0c0"],
        orange: ["#BB3D00", "#FF5809", "#FF9D6F", "#FFCBB3", "#FFF3EE"],
        blue: ["#0005a7", "#3a40ff", "#6d71ff", "#9497ff", "#bcbeff"],
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

  computed: {},

  watch: {},

  methods: {
    handleClick() {
      if (this.flag) {
        if (this.start && this.end && this.value && this.lineWidth) {
          minemap.service.queryDrivingRouteResult(
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
        } else {
          this.$message({
            message: "输入有误！！！",
            type: "warning"
          });
        }
      } else {
        if (this.input && this.value && this.lineWidth) {
          this.initLine();
        } else {
          this.$message({
            message: "输入有误！！！",
            type: "warning"
          });
        }
      }
    },
    initLine() {
      let coors;
      try {
        coors = JSON.parse(this.input);
        this.addLine(coors);
      } catch {
        this.$message({
          message: "坐标格式有误！！！",
          type: "warning"
        });
        return;
      }
    },
    addLine(coors) {
      let time = new Date().getTime();
      let sName = "lineSource_" + time;
      let sObj = {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {
            sourceName: sName
          },
          geometry: {
            type: "LineString",
            coordinates: coors
          }
        }
      };
      map.addSource(sName, sObj);
      this.sourceData.push(sObj);
      let length = this.colors[this.value].length;
      let lineWidth = Number(this.lineWidth);
      let lineOpacity = 1 / length;
      this.colors[this.value].forEach((e, i) => {
        let lObj = {
          id: `lineLayer${i}_${time}`,
          type: "line",
          source: `lineSource_${time}`,
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-width": lineWidth,
            "line-color": this.colors[this.value][i],
            "line-opacity": lineOpacity
          }
        };
        map.addLayer(lObj);
        this.layerData.push(lObj);
        lineWidth -= this.lineWidth / length;
        lineOpacity += 1 / length;
      });
    }
  },

  created() {},
  mounted() {},
  beforeCreate() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  activated() {}
};
</script>
<style lang="scss">
.drawLine-wrapper {
  box-sizing: border-box;
  padding: 10px;
  display: flex;
  width: 100vw;
  justify-content: space-between;
}
.el-form {
  z-index: 99;
  label {
    color: white;
  }
}
.json-viewer {
  width: 300px;
  max-height: 300px;
  overflow: auto;
  margin-bottom: 10px;
}
</style>
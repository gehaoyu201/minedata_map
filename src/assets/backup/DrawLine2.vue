<!-- 用户输入坐标点页面，需要引入map，minemap -->
<template>
  <div class="drawLine-wrapper">
    <el-form label-position="left" label-width="40px">
      <el-form-item>
        <el-button @click="flag=!flag">点我切换生成方式</el-button>
      </el-form-item>

      <el-form-item v-if="!flag" label="数据">
        <el-input
          placeholder="请输入线数据,示例：[[116.37978,39.86563],[116.37994,39.86549],[116.37997,39.86546],[116.38013,39.86531]]"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 10}"
          v-model.trim="input"
          clearable
          v-if="!flag"
        ></el-input>
      </el-form-item>

      <el-form-item label="起点" v-if="flag">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="start" clearable></el-input>
      </el-form-item>

      <el-form-item label="终点" v-if="flag">
        <el-input placeholder="示例：116.37,39.86" v-model.trim="end" clearable></el-input>
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
        <el-input placeholder="示例：10" v-model.trim="lineWidth" clearable></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleClick">提交生成</el-button>
      </el-form-item>
    </el-form>

    <div>
      <h3>SourceData</h3>
      <json-viewer :value="sourceData" class="json-viewer" :expand-depth="1" copyable sort></json-viewer>
      <h3>LayerData</h3>
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
      setDataFlag: true,
      flag: true,
      layerData: [],
      sourceData: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      colors: {
        // 颜色从外到里
        red: ["#ff0000", "#ff3838", "#ff8383", "#ffbebe", "#ffd1d1"],
        orange: ["#ff9b00", "#ffb23a", "#ffcc7b", "#fff1ab", "#fff6c9"],
        blue: ["#0048ff", "#2865ff", "#5c8aff", "#96b4ff", "#eaf0ff"],
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
          value: "green",
          label: "绿色"
        },
        {
          value: "blue",
          label: "蓝色"
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
      let sName = "lightLineSource";
      let featureObj = {
        type: "Feature",
        properties: {
          sourceName: sName,
          colorName: this.value
        },
        geometry: {
          type: "LineString",
          coordinates: coors
        }
      };
      this.sourceData.data.features.push(featureObj);
      let length = this.colors[this.value].length;
      let lineWidth = Number(this.lineWidth);
      let lineOpacity = 1 / length;
      let temp = [];
      this.colors[this.value].reverse().forEach((e, i) => {
        featureObj.properties[`color${i}`] = this.colors[this.value][i];
        featureObj.properties[`lineWidth${i}`] = lineWidth;
        lineWidth -= this.lineWidth / length;
        if (this.setDataFlag) {
          let lObj = {
            id: `lightLineLayer_${i}`,
            type: "line",
            source: `lightLineSource`,
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              "line-width": {
                type: "identity",
                property: `lineWidth${i}`
              },
              "line-color": {
                type: "identity",
                property: `color${i}`
              },
              "line-opacity": lineOpacity
            }
          };
          temp.push(lObj);
          lineOpacity += 1 / length;
        }
      });
      if (this.setDataFlag) {
        map.addSource(sName, this.sourceData);
        for (let item of temp) {
          map.addLayer(item);
        }
        this.setDataFlag = false;
        this.layerData = temp;
      } else {
        map.getSource("lightLineSource").setData(this.sourceData.data);
      }
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
div {
  box-sizing: border-box;
}
h3 {
  z-index: 99;
  position: relative;
  color: white;
  margin-top: 0;
}
.drawLine-wrapper {
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
  max-height: 200px;
  min-width: 177px;
  overflow: auto;
  margin-bottom: 10px;
}
</style>
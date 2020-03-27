const minemap = window.minemap
const edit = window.edit
const turf = window.turf;
const mapConfig = {
    domainUrl: "https://minedata.cn",
    dataDomainUrl: "https://datahive.minedata.cn",
    spriteUrl: "https://minedata.cn/minemapapi/v2.0.0/sprite/sprite",
    serviceUrl: "https://minedata.cn/service/",
    accessToken: "25cc55a69ea7422182d00d6b7c0ffa93",
    solution: 2374,
    style: "https://minedata.cn/service/solu/style/id/2374"
}
import { map } from "./components/MapContainer"
export { minemap, edit, turf, map, mapConfig }
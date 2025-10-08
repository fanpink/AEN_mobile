/**
 * earthquake_report.js
 * 完整实现 test.py 文件中的地震报告功能
 */

// 导入所需模块
const fs = require('fs');
const path = require('path');

/**
 * Report_info 类 - 地震报告信息
 * 对应 Python 中的 Report_info 类
 */
class ReportInfo {
  /**
   * 构造函数
   * @param {string} O_TIME - 发震时间
   * @param {number} EPI_LAT - 震中纬度
   * @param {number} EPI_LON - 震中经度
   * @param {number} EPI_DEPTH - 震源深度
   * @param {string} NEW_DID - 地震事件ID
   * @param {string} LOCATION_C - 震中地名
   * @param {number} M - 震级
   */
  constructor(O_TIME, EPI_LAT, EPI_LON, EPI_DEPTH, NEW_DID, LOCATION_C, M) {
    // 初始化属性
    this.qihao = null; // 期号
    
    // 日期格式化
    const dateObj = new Date(O_TIME);
    this.fwdate = this.formatDate(dateObj, 'YYYY年MM月DD日');
    this.eq_title = this.formatDate(dateObj, 'YYYY年MM月DD日 HH时mm分ss秒') + LOCATION_C + '发生' + M + '级地震';
    this.eq_time = this.formatDate(dateObj, 'YYYY年MM月DD日 HH时mm分ss秒');
    
    this.eq_location = LOCATION_C; // 发震地点
    this.eq_level = M; // 震级
    this.eq_depth = EPI_DEPTH; // 震源深度
    this.eq_lon = EPI_LON; // 经度
    this.eq_lat = EPI_LAT; // 纬度
    
    // 其他属性初始化
    this.my_distance = null; // 震中距离
    this.my_intensity = null; // 预估地震烈度
    this.my_leader = null; // 分管领导
    this.my_analysis = null; // 本地化综合分析
    this.my_city_lon = null; // 本地县政府经纬度
    this.my_city_lat = null;
    this.my_min_intensity = null; // 最小报送烈度
  }

  /**
   * 日期格式化函数
   * @param {Date} date - 日期对象
   * @param {string} format - 格式化模板
   * @returns {string} - 格式化后的日期字符串
   */
  formatDate(date, format) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    return format
      .replace('YYYY', year)
      .replace('MM', month.toString().padStart(2, '0'))
      .replace('DD', day.toString().padStart(2, '0'))
      .replace('HH', hours.toString().padStart(2, '0'))
      .replace('mm', minutes.toString().padStart(2, '0'))
      .replace('ss', seconds.toString().padStart(2, '0'));
  }

  /**
   * 读取配置文件
   * @returns {Object} - 配置参数
   */
  static readConfig() {
    try {
      const configPath = path.join(__dirname, 'config', 'report_config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('读取配置文件失败:', error);
      // 返回默认配置
      return {
        "期号": 1,
        "服务位置": {
          "centre_lon": 103.5,
          "centre_lat": 29.5
        },
        "政府风管领导": "未知",
        "报送最小烈度": 3
      };
    }
  }

  /**
   * 生成地震事件信息报告
   * @returns {Object} - 地震报告信息
   */
  reportEventInfo() {
    // 第一步：配置基本参数
    const myConfig = ReportInfo.readConfig();
    
    // 获取配置参数并使用默认值
    this.qihao = myConfig["期号"] || 1;
    this.my_min_intensity = myConfig["报送最小烈度"] || 3;
    this.my_leader = myConfig["政府风管领导"] || "未知";
    
    const myCentre = myConfig["服务位置"];
    if (myCentre) {
      this.my_city_lon = myCentre["centre_lon"];
      this.my_city_lat = myCentre["centre_lat"];
    }
    
    // 第二步：预估烈度和分析
    const eqEvent = new EQEvent(this.eq_level, this.eq_lon, this.eq_lat);
    const eventInfo = eqEvent.eventInfo();
    this.my_intensity = eventInfo.intensity;
    this.my_analysis = eventInfo.analysis;
    this.my_distance = Math.round(eqEvent.distanceSJXZF);
    
    // 构建报告对象
    const report = {
      "期号": this.qihao,
      "发文日期": this.fwdate,
      "标题": this.eq_title,
      "发震时间": this.eq_time,
      "发震地点": this.eq_location,
      "震级": this.eq_level,
      "震源深度": this.eq_depth,
      "经度": this.eq_lon,
      "纬度": this.eq_lat,
      "震中距离": this.my_distance,
      "预估烈度": this.my_intensity,
      "分管领导": this.my_leader,
      "本地化综合分析": this.my_analysis
    };
    
    return report;
  }
}

/**
 * EQEvent 类 - 地震事件
 * 简化版本，对应 Python 中的 EQEvent 类
 */
class EQEvent {
  // 绥江各级政府经纬度常数
  static LON_SJXZF = 103.9668967771;
  static LAT_SJXZF = 28.5956549725;   // 绥江县政府经纬度
  static LON_ZCZF = 103.9773385502;
  static LAT_ZCZF = 28.5972649981;    // 中城镇政府经纬度
  static LON_BLZF = 103.9890869022;
  static LAT_BLZF = 28.5199362731;    // 板栗镇政府经纬度
  static LON_NAZF = 103.8642291077;
  static LAT_NAZF = 28.6530961206;    // 南岸镇政府经纬度
  static LON_HYZF = 104.2501485126;
  static LAT_HYZF = 28.6521888424;    // 会仪镇政府经纬度
  static LON_XTZF = 104.1655444570;
  static LAT_XTZF = 28.6369765630;    // 新滩镇政府距离

  /**
   * 构造函数
   * @param {number} M - 震级
   * @param {number} eq_lon - 震中经度
   * @param {number} eq_lat - 震中纬度
   */
  constructor(M, eq_lon, eq_lat) {
    this.M = M;
    this.Eq_lon = eq_lon;
    this.Eq_lat = eq_lat;
    
    // 初始化距离和烈度属性
    this.distanceSJXZF = 0.0;    // 到绥江县政府距离
    this.distanceCZCZF = 0.0;    // 到中城镇政府距离
    this.distanceBLZF = 0.0;     // 到板栗镇政府距离
    this.distanceNAZF = 0.0;     // 到南岸镇政府距离
    this.distanceHYZF = 0.0;     // 到会仪镇政府距离
    this.distanceXTZF = 0.0;     // 到新滩镇政府距离

    this.minDistanceSJ = 0.0;    // 到绥江县边界最近距离
    
    this.intensitySJXZF = 0.0;   // 绥江县政府的烈度
    this.intensityCZCZF = 0.0;   // 中城镇政府的烈度
    this.intensityBLZF = 0.0;    // 板栗镇政府的烈度
    this.intensityNAZF = 0.0;    // 南岸镇政府的烈度
    this.intensityHYZF = 0.0;    // 会仪镇政府的烈度
    this.intensityXTZF = 0.0;    // 新滩镇政府的烈度

    this.minCoordinateSJ = [0.0, 0.0];  // 到绥江县边界最近点坐标 [经度, 纬度]
    
    // 计算距离
    this._calculateDistances();
    
    // 计算烈度
    this._calculateIntensities();
    
    // 生成分析报告
    this.my_analysis = `震中到绥江县政府距离${Math.round(this.distanceSJXZF)}公里，预估烈度${this.intensitySJXZF}度。` +
      "到其他乡镇距离及预估烈度：\r\n" +
      `到板栗镇政府距离${Math.round(this.distanceBLZF)}公里，预估烈度${this.intensityBLZF}度；\r\n` +
      `到南岸镇政府距离${Math.round(this.distanceNAZF)}公里，预估烈度${this.intensityNAZF}度；\r\n` +
      `到会仪镇政府距离${Math.round(this.distanceHYZF)}公里，预估烈度${this.intensityHYZF}度；\r\n` +
      `到新滩镇政府距离${Math.round(this.distanceXTZF)}公里，预估烈度${this.intensityXTZF}度。\r\n` +
      "——此烈度值仅供参考，精确烈度以中国地震局公布信息为准。";
  }

  /**
   * 返回事件信息
   * @returns {Object} - 包含烈度和分析的对象
   */
  eventInfo() {
    return {
      intensity: this.intensitySJXZF,
      analysis: this.my_analysis
    };
  }

  /**
   * 计算到各个政府位置的距离
   * @private
   */
  _calculateDistances() {
    const geoCalculator = new GeoCalculator();
    
    // 计算到绥江政府距离
    this.distanceSJXZF = geoCalculator.ellipsoidDistancePointToPoint(
      this.Eq_lon, this.Eq_lat, EQEvent.LON_SJXZF, EQEvent.LAT_SJXZF
    );
    
    // 计算到中城镇政府距离
    this.distanceCZCZF = geoCalculator.ellipsoidDistancePointToPoint(
      this.Eq_lon, this.Eq_lat, EQEvent.LON_ZCZF, EQEvent.LAT_ZCZF
    );
    
    // 计算到板栗镇政府距离
    this.distanceBLZF = geoCalculator.ellipsoidDistancePointToPoint(
      this.Eq_lon, this.Eq_lat, EQEvent.LON_BLZF, EQEvent.LAT_BLZF
    );
    
    // 计算到南岸镇政府距离
    this.distanceNAZF = geoCalculator.ellipsoidDistancePointToPoint(
      this.Eq_lon, this.Eq_lat, EQEvent.LON_NAZF, EQEvent.LAT_NAZF
    );
    
    // 计算到会仪镇政府距离
    this.distanceHYZF = geoCalculator.ellipsoidDistancePointToPoint(
      this.Eq_lon, this.Eq_lat, EQEvent.LON_HYZF, EQEvent.LAT_HYZF
    );
    
    // 计算到新滩镇政府距离
    this.distanceXTZF = geoCalculator.ellipsoidDistancePointToPoint(
      this.Eq_lon, this.Eq_lat, EQEvent.LON_XTZF, EQEvent.LAT_XTZF
    );
  }

  /**
   * 计算到各个政府位置的烈度
   * @private
   */
  _calculateIntensities() {
    // 简化版烈度计算，基于距离和震级
    const intensityCalculator = new IntensityCalculator();
    
    // 计算到各个政府位置的烈度
    this.intensitySJXZF = intensityCalculator.calculateIntensity(
      this.M, this.distanceSJXZF
    );
    
    this.intensityCZCZF = intensityCalculator.calculateIntensity(
      this.M, this.distanceCZCZF
    );
    
    this.intensityBLZF = intensityCalculator.calculateIntensity(
      this.M, this.distanceBLZF
    );
    
    this.intensityNAZF = intensityCalculator.calculateIntensity(
      this.M, this.distanceNAZF
    );
    
    this.intensityHYZF = intensityCalculator.calculateIntensity(
      this.M, this.distanceHYZF
    );
    
    this.intensityXTZF = intensityCalculator.calculateIntensity(
      this.M, this.distanceXTZF
    );
  }
}

/**
 * GeoCalculator 类 - 地理计算工具
 * 简化版本，对应 Python 中的 GeoJisuan 类
 */
class GeoCalculator {
  // 地球半径（千米）
  static EARTH_RADIUS = 6371.0;
  
  /**
   * 计算两点间的椭球距离
   * @param {number} lon1 - 点1经度
   * @param {number} lat1 - 点1纬度
   * @param {number} lon2 - 点2经度
   * @param {number} lat2 - 点2纬度
   * @returns {number} - 距离（千米）
   */
  ellipsoidDistancePointToPoint(lon1, lat1, lon2, lat2) {
    // 将经纬度转换为弧度
    const radLat1 = this._toRadians(lat1);
    const radLon1 = this._toRadians(lon1);
    const radLat2 = this._toRadians(lat2);
    const radLon2 = this._toRadians(lon2);
    
    // 使用 Haversine 公式计算球面距离
    const dLon = radLon2 - radLon1;
    const dLat = radLat2 - radLat1;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(radLat1) * Math.cos(radLat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = GeoCalculator.EARTH_RADIUS * c;
    
    return distance;
  }
  
  /**
   * 将角度转换为弧度
   * @param {number} degrees - 角度
   * @returns {number} - 弧度
   * @private
   */
  _toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
}

/**
 * IntensityCalculator 类 - 烈度计算工具
 * 简化版本，对应 Python 中的 Get_Intensity 类
 */
class IntensityCalculator {
  /**
   * 计算烈度
   * @param {number} M - 震级
   * @param {number} distance - 距离（千米）
   * @returns {number} - 烈度值
   */
  calculateIntensity(M, distance) {
    // 简化的烈度计算公式，基于震级和距离
    // 参考张方浩烈度衰减模型的简化版本
    const intensity = 6.5953 + 1.3467 * M - 4.5952 * Math.log10(distance + 26.0);
    
    // 烈度值取整，范围限制在 0-12 之间
    return Math.max(0, Math.min(12, Math.round(intensity)));
  }
}

/**
 * ReadGeoJSON 类 - GeoJSON 数据读取工具
 * 简化版本，对应 Python 中的 Read_Geojson 类
 */
class ReadGeoJSON {
  /**
   * 读取 GeoJSON 文件
   * @param {string} filePath - 文件路径
   * @returns {Object} - GeoJSON 数据
   */
  static readGeoJSONFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取 GeoJSON 文件失败:', error);
      return null;
    }
  }
  
  /**
   * 查找县边界
   * @param {string} xianName - 县名
   * @returns {Array} - 边界坐标数组
   */
  findXian(xianName) {
    try {
      const filePath = path.join(__dirname, 'EQ_liedu', '昭通市各县.geojson');
      const geoJSON = ReadGeoJSON.readGeoJSONFile(filePath);
      
      if (!geoJSON || !geoJSON.features) {
        return [];
      }
      
      // 查找指定县名的要素
      const feature = geoJSON.features.find(f => 
        f.properties && f.properties.NAME === xianName
      );
      
      if (!feature || !feature.geometry || !feature.geometry.coordinates) {
        return [];
      }
      
      // 返回边界坐标
      return feature.geometry.coordinates[0];
    } catch (error) {
      console.error(`查找县 ${xianName} 边界失败:`, error);
      return [];
    }
  }
}

// 主函数
function main() {
  try {
    // 示例地震事件数据
    const eventLatestStr = '{"M":"5.7","O_TIME":"2025-03-31 23:54:19","EPI_LAT":"-10.30","EPI_LON":"119.05","EPI_DEPTH":30,"NEW_DID":"CC20250331235419","LOCATION_C":"印尼松巴哇岛南部海域"}';
    const eventLatest = JSON.parse(eventLatestStr);
    
    // 创建报告信息实例
    const reportInfo = new ReportInfo(
      eventLatest.O_TIME,
      parseFloat(eventLatest.EPI_LAT),
      parseFloat(eventLatest.EPI_LON),
      eventLatest.EPI_DEPTH,
      eventLatest.NEW_DID,
      eventLatest.LOCATION_C,
      parseFloat(eventLatest.M)
    );
    
    // 生成报告
    const myJson = reportInfo.reportEventInfo();
    
    // 输出报告
    console.log(JSON.stringify(myJson, null, 2));
    
    return myJson;
  } catch (error) {
    console.error('处理地震事件失败:', error);
    return null;
  }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main();
}

// 导出模块
module.exports = {
  ReportInfo,
  EQEvent,
  GeoCalculator,
  IntensityCalculator,
  ReadGeoJSON,
  main
};
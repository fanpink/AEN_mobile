// 前端版震情通报生成器：参考 earthquake_report.js 的核心逻辑

// 地理计算工具（Haversine）
class GeoCalculator {
  static EARTH_RADIUS = 6371.0; // km

  static toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  static distance(lon1, lat1, lon2, lat2) {
    const radLat1 = GeoCalculator.toRadians(lat1);
    const radLon1 = GeoCalculator.toRadians(lon1);
    const radLat2 = GeoCalculator.toRadians(lat2);
    const radLon2 = GeoCalculator.toRadians(lon2);
    const dLon = radLon2 - radLon1;
    const dLat = radLat2 - radLat1;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return GeoCalculator.EARTH_RADIUS * c; // km
  }
}

// 烈度计算（简化版张方浩模型）
class IntensityCalculator {
  static calculate(M, distanceKm) {
    const intensity = 6.5953 + 1.3467 * M - 4.5952 * Math.log10(distanceKm + 26.0);
    return Math.max(0, Math.min(12, Math.round(intensity)));
  }
}

// 政府位置常量（与参考代码一致）
const GOV = {
  SJXZF: { lon: 103.9668967771, lat: 28.5956549725, name: '绥江县政府' },
  ZCZF: { lon: 103.9773385502, lat: 28.5972649981, name: '中城镇政府' },
  BLZF: { lon: 103.9890869022, lat: 28.5199362731, name: '板栗镇政府' },
  NAZF: { lon: 103.8642291077, lat: 28.6530961206, name: '南岸镇政府' },
  HYZF: { lon: 104.2501485126, lat: 28.6521888424, name: '会仪镇政府' },
  XTZF: { lon: 104.165544457, lat: 28.636976563, name: '新滩镇政府' },
};

function formatDate(date, tpl) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return tpl
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// 生成震情通报信息
export function generateReport(event) {
  if (!event) return null;
  const M = parseFloat(event.M);
  const lon = parseFloat(event.EPI_LON);
  const lat = parseFloat(event.EPI_LAT);
  const depth = typeof event.EPI_DEPTH === 'number' ? event.EPI_DEPTH : parseFloat(event.EPI_DEPTH);
  const timeStr = event.O_TIME;
  const location = event.LOCATION_C || '未知地点';

  const date = new Date(timeStr.replace(/-/g, '/')); // 兼容 Safari
  const fwdate = formatDate(date, 'YYYY年MM月DD日');
  const eq_time = formatDate(date, 'YYYY年MM月DD日 HH时mm分ss秒');
  const eq_title = `${fwdate} ${location}发生${M}级地震`;

  // 计算到各政府位置的距离与烈度（主要展示绥江县政府）
  const dSJ = Math.round(GeoCalculator.distance(lon, lat, GOV.SJXZF.lon, GOV.SJXZF.lat));
  const iSJ = IntensityCalculator.calculate(M, dSJ);

  const dBL = Math.round(GeoCalculator.distance(lon, lat, GOV.BLZF.lon, GOV.BLZF.lat));
  const iBL = IntensityCalculator.calculate(M, dBL);
  const dNA = Math.round(GeoCalculator.distance(lon, lat, GOV.NAZF.lon, GOV.NAZF.lat));
  const iNA = IntensityCalculator.calculate(M, dNA);
  const dHY = Math.round(GeoCalculator.distance(lon, lat, GOV.HYZF.lon, GOV.HYZF.lat));
  const iHY = IntensityCalculator.calculate(M, dHY);
  const dXT = Math.round(GeoCalculator.distance(lon, lat, GOV.XTZF.lon, GOV.XTZF.lat));
  const iXT = IntensityCalculator.calculate(M, dXT);

  const analysis =
    `震中到${GOV.SJXZF.name}距离${dSJ}公里，预估烈度${iSJ}度。\n` +
    `到${GOV.BLZF.name}距离${dBL}公里，预估烈度${iBL}度；\n` +
    `到${GOV.NAZF.name}距离${dNA}公里，预估烈度${iNA}度；\n` +
    `到${GOV.HYZF.name}距离${dHY}公里，预估烈度${iHY}度；\n` +
    `到${GOV.XTZF.name}距离${dXT}公里，预估烈度${iXT}度。\n` +
    '——此烈度值仅供参考，精确烈度以中国地震局公布信息为准。';

  return {
    期号: 1,
    发文日期: fwdate,
    标题: eq_title,
    发震时间: eq_time,
    发震地点: location,
    震级: M,
    震源深度: depth,
    经度: lon,
    纬度: lat,
    震中距离: dSJ,
    预估烈度: iSJ,
    分管领导: '未知',
    本地化综合分析: analysis,
  };
}
// 地震数据服务 - 严格参考 TS 实现与提供的 Vite 代理配置（仅解析 HTML）
import axios from 'axios';

/**
 * 处理后的地震数据结构
 * @typedef {Object} ProcessedEarthquakeData
 * @property {string} title - 地震标题
 * @property {string} time - 发震时间
 * @property {string} magnitude - 震级
 * @property {string} location - 位置信息
 * @property {string} depth - 震源深度
 * @property {string} from - 数据来源
 * @property {string} info - 详细信息
 * @property {string} url - 数据URL
 * @property {string} latitude - 纬度
 * @property {string} longitude - 经度
 */

class EarthquakeService {
  constructor() {
    // 使用同源代理路径（根据提供的 Vite 配置将其重写为 speedsearch.html）
    this.CEIC_URL = '/api/earthquake';
  }

  /**
   * 获取HTML内容 - 对应参考代码中的fetchHtml方法
   * @param {string} url - 请求URL
   * @returns {Promise<string>} HTML内容
   */
  async fetchHtml(url) {
    try {
      // 使用Vite代理服务器
      const response = await axios.get(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      console.error('获取HTML失败:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('请求超时，请检查网络连接');
        } else if (error.response?.status === 404) {
          throw new Error('地震数据源不可用');
        } else if (error.response?.status >= 500) {
          throw new Error('地震数据服务器错误');
        }
      }
      throw new Error('无法获取地震数据，请检查网络连接');
    }
  }

  /**
   * 从HTML中提取newdata数据
   * @param {string} html - HTML内容
   * @returns {string} 提取的JSON字符串
   */
  extractNewdata(html) {
    // 更稳健：允许 const/var/let、可选空格、跨行匹配
    const pattern = /(?:const|var|let)\s+newdata\s*=\s*(\[[\s\S]*?\]);/;
    const match = html.match(pattern);
    
    if (match && match[1]) {
      // 去除JavaScript注释
      let newdataJson = match[1];
      newdataJson = newdataJson.replace(/\/\*.*?\*\//gs, '');
      return newdataJson;
    }
    
    return '';
  }

  /**
   * 从页面表格解析地震数据（当 newdata 不存在时）
   * @param {string} html - HTML 内容
   * @returns {Array} 原始数据项数组
   */
  parseTableData(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = Array.from(doc.querySelectorAll('table'));
      const items = [];

      const timeRe = /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/;
      const numRe = /^-?\d+(?:\.\d+)?$/;

      for (const table of tables) {
        const rows = Array.from(table.querySelectorAll('tr'));
        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll('td')).map((td) => td.textContent.trim());
          if (cells.length >= 6) {
            const [mag, time, lat, lon, depth, location] = cells.slice(0, 6);
            if (timeRe.test(time) && numRe.test(mag) && numRe.test(lat) && numRe.test(lon) && numRe.test(depth)) {
              items.push({
                M: mag,
                O_TIME: time,
                EPI_LAT: lat,
                EPI_LON: lon,
                EPI_DEPTH: Number(depth),
                LOCATION_C: location || '未知地点',
              });
            }
          }
        }
      }
      return items;
    } catch (error) {
      console.error('表格解析失败:', error);
      return [];
    }
  }

  /**
   * 解析地震数据JSON
   * @param {string} jsonString - JSON字符串
   * @returns {Array} 解析后的数据数组
   */
  parseEarthquakeData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('解析地震数据失败:', error);
      return [];
    }
  }

  /**
   * 转换地震数据为处理后的格式
   * @param {Object} item - 地震数据项
   * @returns {ProcessedEarthquakeData} 处理后的数据
   */
  convertToProcessedData(item) {
    const magnitude = item.M || '未知';
    const time = item.O_TIME || '未知时间';
    const latitude = item.EPI_LAT || '0';
    const longitude = item.EPI_LON || '0';
    const depth = item.EPI_DEPTH?.toString() || '0';
    const location = item.LOCATION_C || '未知地点';
    
    return {
      title: `${location}发生${magnitude}级地震`,
      time: time,
      magnitude: magnitude,
      location: `纬度：${latitude}|经度：${longitude}`,
      depth: depth,
      from: '中国地震台网中心',
      info: `根据中国地震台网测定，${time}在${location}发生了${magnitude}级地震，震源深度${depth}公里，震中位于(${longitude},${latitude})。`,
      url: this.CEIC_URL,
      latitude: latitude,
      longitude: longitude,
    };
  }

  /**
   * 获取最新地震数据 - 仅解析代理到的 HTML（/speedsearch.html）
   * @returns {Promise<Array<ProcessedEarthquakeData>>} 处理后的地震数据数组
   */
  async getLatestEarthquakeData() {
    // 仅解析 HTML：先尝试 newdata，其次尝试表格
    try {
      const html = await this.fetchHtml(this.CEIC_URL);

      // 1) 提取 newdata
      const newdataJson = this.extractNewdata(html);
      if (newdataJson) {
        const earthquakeItems = this.parseEarthquakeData(newdataJson);
        const processedData = earthquakeItems.map(item => this.convertToProcessedData(item));
        if (processedData.length > 0) {
          return processedData;
        }
      }

      // 2) 解析页面表格
      const tableItems = this.parseTableData(html);
      if (tableItems.length > 0) {
        return tableItems.map(item => this.convertToProcessedData(item));
      }

      throw new Error('未能从页面中提取到地震数据');
    } catch (error) {
      console.error('获取地震数据失败:', error);
      throw new Error(`地震数据获取失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取模拟地震数据（用于开发和测试）
   * @returns {Array<ProcessedEarthquakeData>} 模拟数据
   */
  getMockEarthquakeData() {
    const mockData = [
      {
        id: '1',
        CATA_ID: 'CEIC_001',
        SAVE_TIME: '2024-01-15 10:30:00',
        O_TIME: '2024-01-15 10:25:32',
        EPI_LAT: '28.2',
        EPI_LON: '104.1',
        EPI_DEPTH: 12,
        AUTO_FLAG: '0',
        EQ_TYPE: 'ML',
        O_TIME_FRA: '32.5',
        M: '4.2',
        M_MS: '4.2',
        M_MS7: '4.2',
        M_ML: '4.2',
        M_MB: '4.1',
        M_MB2: '4.1',
        SUM_STN: '15',
        LOC_STN: '8',
        LOCATION_C: '四川绥江县',
        LOCATION_S: 'Suijiang County, Sichuan',
        CATA_TYPE: 'M',
        SYNC_TIME: '2024-01-15 10:30:00',
        IS_DEL: '0',
        EQ_CATA_TYPE: 'M',
        NEW_DID: 'CEIC_001_NEW'
      },
      {
        id: '2',
        CATA_ID: 'CEIC_002',
        SAVE_TIME: '2024-01-15 08:15:00',
        O_TIME: '2024-01-15 08:12:45',
        EPI_LAT: '31.5',
        EPI_LON: '103.8',
        EPI_DEPTH: 8,
        AUTO_FLAG: '0',
        EQ_TYPE: 'ML',
        O_TIME_FRA: '45.2',
        M: '3.8',
        M_MS: '3.8',
        M_MS7: '3.8',
        M_ML: '3.8',
        M_MB: '3.7',
        M_MB2: '3.7',
        SUM_STN: '12',
        LOC_STN: '6',
        LOCATION_C: '四川雅安市',
        LOCATION_S: 'Yaan City, Sichuan',
        CATA_TYPE: 'M',
        SYNC_TIME: '2024-01-15 08:15:00',
        IS_DEL: '0',
        EQ_CATA_TYPE: 'M',
        NEW_DID: 'CEIC_002_NEW'
      },
      {
        id: '3',
        CATA_ID: 'CEIC_003',
        SAVE_TIME: '2024-01-14 22:45:00',
        O_TIME: '2024-01-14 22:41:18',
        EPI_LAT: '26.8',
        EPI_LON: '100.2',
        EPI_DEPTH: 15,
        AUTO_FLAG: '0',
        EQ_TYPE: 'ML',
        O_TIME_FRA: '18.7',
        M: '5.1',
        M_MS: '5.1',
        M_MS7: '5.1',
        M_ML: '5.1',
        M_MB: '5.0',
        M_MB2: '5.0',
        SUM_STN: '25',
        LOC_STN: '15',
        LOCATION_C: '云南丽江市',
        LOCATION_S: 'Lijiang City, Yunnan',
        CATA_TYPE: 'M',
        SYNC_TIME: '2024-01-14 22:45:00',
        IS_DEL: '0',
        EQ_CATA_TYPE: 'M',
        NEW_DID: 'CEIC_003_NEW'
      }
    ];

    return mockData.map(item => this.convertToProcessedData(item));
  }

  /**
   * Unicode解码
   * @param {string} unicode - Unicode字符串
   * @returns {string} 解码后的字符串
   */
  static decodeUnicode(unicode) {
    if (!unicode) {
      return '';
    }
    
    try {
      return unicode.replace(/\\u[\dA-F]{4}/gi, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
      });
    } catch (error) {
      console.error('Unicode解码失败:', error);
      return unicode;
    }
  }
}

// 导出单例实例
const earthquakeService = new EarthquakeService();
export default earthquakeService;
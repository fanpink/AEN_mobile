// 地震数据服务 - 基于geteq.cs的逻辑实现
import axios from 'axios';

// 地震数据项接口 - 对应C#中的ShujuItem类
export interface EarthquakeDataItem {
  id: string;
  CATA_ID: string;
  SAVE_TIME: string;
  O_TIME: string; // 发震时间
  EPI_LAT: string; // 纬度
  EPI_LON: string; // 经度
  EPI_DEPTH: number; // 震源深度
  AUTO_FLAG: string;
  EQ_TYPE: string;
  O_TIME_FRA: string;
  M: string; // 震级
  M_MS: string;
  M_MS7: string;
  M_ML: string;
  M_MB: string;
  M_MB2: string;
  SUM_STN: string;
  LOC_STN: string;
  LOCATION_C: string; // 地点中文名
  LOCATION_S: string;
  CATA_TYPE: string;
  SYNC_TIME: string;
  IS_DEL: string;
  EQ_CATA_TYPE: string;
  NEW_DID: string;
}

// 地震数据根对象 - 对应C#中的Root类
export interface EarthquakeDataRoot {
  shuju: EarthquakeDataItem[];
  jieguo: string; // 最近24小时地震信息
  page: string;
  num: number;
}

// 处理后的地震数据 - 对应C#中的Eqdata结构
export interface ProcessedEarthquakeData {
  title: string;
  time: string;
  magnitude: string;
  location: string;
  depth: string;
  from: string;
  info: string;
  url: string;
  latitude: string;
  longitude: string;
}

class EarthquakeService {
  private readonly CEIC_URL = '/api/earthquake'; // 使用代理路径
  
  /**
   * 获取HTML内容 - 对应C#中的Get1方法
   */
  private async fetchHtml(url: string): Promise<string> {
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
      console.error('获取地震数据失败:', error);
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
   * 从HTML中提取newdata数据 - 对应C#中的ExtractNewdata方法
   */
  private extractNewdata(html: string): string {
    const pattern = /const newdata = (\[.*?\]);/s;
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
   * 解析地震数据JSON
   */
  private parseEarthquakeData(jsonString: string): EarthquakeDataItem[] {
    try {
      const data = JSON.parse(jsonString);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('解析地震数据失败:', error);
      return [];
    }
  }

  /**
   * 转换地震数据为处理后的格式 - 对应C#中的Eqdata2json方法
   */
  private convertToProcessedData(item: EarthquakeDataItem): ProcessedEarthquakeData {
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
   * 获取最新地震数据 - 主要方法，对应C#中的Html属性
   */
  public async getLatestEarthquakeData(): Promise<ProcessedEarthquakeData[]> {
    try {
      // 尝试获取真实数据
      const html = await this.fetchHtml(this.CEIC_URL);
      const newdataJson = this.extractNewdata(html);
      
      if (!newdataJson) {
        throw new Error('未能从页面中提取到地震数据');
      }
      
      const earthquakeItems = this.parseEarthquakeData(newdataJson);
      const processedData = earthquakeItems.map(item => this.convertToProcessedData(item));
      
      if (processedData.length === 0) {
        throw new Error('未获取到有效的地震数据');
      }
      
      return processedData;
    } catch (error) {
      console.error('获取地震数据失败:', error);
      // 抛出错误而不是返回模拟数据
      throw new Error(`地震数据获取失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取模拟地震数据（用于开发和测试）
   */
  private getMockEarthquakeData(): ProcessedEarthquakeData[] {
    const mockData: EarthquakeDataItem[] = [
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
   * Unicode解码 - 对应C#中的DecodeString1方法
   */
  public static decodeUnicode(unicode: string): string {
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
export const earthquakeService = new EarthquakeService();
export default earthquakeService;
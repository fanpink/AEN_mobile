import axios from 'axios';
import { makeUrl } from './serverBase';

class EarthquakeService {
  constructor() {
    // 后端基址由环境变量控制，使用 makeUrl 来构造完整 URL
    this.SERVER_BASE = null;
  }

  /**
   * 从后端获取所有地震数据（原始列表）
   * @returns {Promise<Array>} 数据项数组
   */
  async getAllEarthquakeDataFromServer() {
    try {
      const url = makeUrl('/getceic_all');
      const res = await axios.get(url, { timeout: 15000 });
      const payload = res.data;
      if (payload && payload.success && Array.isArray(payload.data)) {
        return payload.data;
      }
      return [];
    } catch (error) {
      console.error('后端地震数据获取失败:', error);
      throw new Error(error?.message || '获取后端地震数据失败');
    }
  }
}

const earthquakeService = new EarthquakeService();
export default earthquakeService;
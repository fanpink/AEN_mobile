import axios from 'axios';
import { getServerBase } from './serverBase';

class EarthquakeService {
  constructor() {
    // 后端基址：开发环境走代理，其它环境直连
    this.SERVER_BASE = getServerBase();
  }

  /**
   * 从后端获取所有地震数据（原始列表）
   * @returns {Promise<Array>} 数据项数组
   */
  async getAllEarthquakeDataFromServer() {
    try {
      const res = await axios.get(`${this.SERVER_BASE}/getceic_all`, { timeout: 15000 });
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
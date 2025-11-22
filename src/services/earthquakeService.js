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
      // 后端返回格式为 { status: 'success', data: [...] }
      // 兼容性处理：支持多种情况
      if (!payload) return [];
      // 1) 若后端直接返回数组
      if (Array.isArray(payload)) return payload;
      // 2) 若后端返回 { status: 'success', data: [...] }
      if (Array.isArray(payload.data) && (String(payload.status) === 'success' || payload.success === true)) {
        return payload.data;
      }
      // 3) 宽松回退：只要 payload.data 是数组就返回（兼容老接口）
      if (Array.isArray(payload.data)) return payload.data;
      return [];
    } catch (error) {
      console.error('后端地震数据获取失败:', error);
      throw new Error(error?.message || '获取后端地震数据失败');
    }
  }
}

const earthquakeService = new EarthquakeService();
export default earthquakeService;
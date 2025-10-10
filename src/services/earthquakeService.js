import axios from 'axios';

class EarthquakeService {
  constructor() {
    // 使用 CRA 开发代理将该路径转发到后端 http://localhost:5000
    this.SERVER_BASE = '/api/server';
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
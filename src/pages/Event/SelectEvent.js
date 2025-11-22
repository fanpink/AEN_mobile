import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectEventContext } from '../../Status_Context';
import { makeUrl } from '../../services/serverBase';

function SelectEvent() {
  const { setSelectEqEvent } = useContext(SelectEventContext); // 使用 Context
  // 使用 SessionStorage 持久化列表数据，切换页面直接显示本地数据
  function useSessionStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
      try {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : initialValue;
      } catch (_) {
        return initialValue;
      }
    });
    useEffect(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (_) {
        // ignore storage write error
      }
    }, [key, value]);
    return [value, setValue];
  }

  const [earthquakeData, setEarthquakeData] = useSessionStorage('eq_list_cache', []);
  const [lastUpdated, setLastUpdated] = useSessionStorage('eq_list_cache_time', '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 加载地震数据
  const loadEarthquakeData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 通过环境配置的后端基址调用后端 /getceic_all 路由
      const resp = await fetch(makeUrl('/getceic_all'));
      if (!resp.ok) {
        throw new Error(`后端返回错误状态: ${resp.status}`);
      }
      const json = await resp.json();
      const data = Array.isArray(json?.data) ? json.data : [];

      // 转换数据格式以适配表格显示（后端字段与 CEIC newdata 保持一致）
      const formattedData = data.map((item, index) => ({
        id: (index + 1).toString(),
        O_TIME: item['发震时刻(UTC+8)'] || item.O_TIME,
        M: item['震级(M)'] ?? item.M,
        LOCATION_C: item['参考位置'] ?? item.LOCATION_C ?? '未知地点',
        EPI_LAT: item['纬度(°)'] ?? item.EPI_LAT,
        EPI_LON: item['经度(°)'] ?? item.EPI_LON,
        EPI_DEPTH: typeof item['深度(千米)'] === 'number' ? item['深度(千米)'] : (parseFloat(item['深度(千米)']) || 0),
        NEW_DID: item.NEW_DID || `CC${String((item['发震时刻(UTC+8)'] || item.O_TIME) || '').replace(/[-:\s]/g, '')}`,
      }));

      setEarthquakeData(formattedData);
      try {
        setLastUpdated(new Date().toISOString());
      } catch (_) {}
    } catch (error) {
      console.error('加载地震数据失败:', error);
      const errorMessage = error instanceof Error ? error.message : '加载地震数据失败，请稍后重试';
      setError(errorMessage);
      setEarthquakeData([]); // 获取失败时不显示任何数据
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时：若存在本地缓存则直接展示，不触发自动请求；无缓存时再加载
  useEffect(() => {
    if (Array.isArray(earthquakeData) && earthquakeData.length > 0) {
      return; // 已有本地数据，切换到此页即刻显示
    }
    loadEarthquakeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 提供一个软提示：显示上次更新时间

  const handleRowClick = (event) => {
    const confirmSelection = window.confirm(
      `确认选择此次地震事件？\n\n` +
      `震级(M): ${event.M}\n` +
      `发震时刻(UTC+8): ${event.O_TIME}\n` +
      `纬度(°): ${event.EPI_LAT}\n` +
      `经度(°): ${event.EPI_LON}\n` +
      `深度(千米): ${event.EPI_DEPTH}\n` +
      `参考位置: ${event.LOCATION_C}`
    );
    if (confirmSelection) {
      setSelectEqEvent(event); // 更新全局状态
      navigate('/Reporting'); // 跳转到震情通报，自动展示 ReportInfo
    }
  };

  return (
    <div style={styles.container}>
      <h2>从地震目录选择</h2>
      {/* 刷新按钮和状态显示 */}
      <div style={styles.toolbar}>
        <button 
          style={styles.refreshButton} 
          onClick={loadEarthquakeData}
          disabled={loading}
        >
          {loading ? '正在加载...' : '刷新数据'}
        </button>
        <span style={styles.statusText}>
          {loading ? '正在获取最新地震数据...' : '显示最近地震事件'}{lastUpdated ? `（上次更新时间：${new Date(lastUpdated).toLocaleString()}）` : ''}
        </span>
      </div>

      {/* 错误提示 */}
      {error && (
        <div style={styles.errorAlert}>
          <strong>数据获取失败：</strong>{error}
          <button 
            style={styles.retryButton} 
            onClick={loadEarthquakeData}
          >
            重试
          </button>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>震级(M)</th>
              <th style={styles.th}>发震时刻(UTC+8)</th>
              <th style={styles.th}>纬度(°)</th>
              <th style={styles.th}>经度(°)</th>
              <th style={styles.th}>深度(千米)</th>
              <th style={styles.th}>参考位置</th>
            </tr>
          </thead>
          <tbody>
            {earthquakeData.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" style={styles.emptyCell}>
                  {error ? '数据获取失败，请点击刷新数据重试' : '暂无数据'}
                </td>
              </tr>
            ) : (
              earthquakeData.map((item, index) => (
                <tr key={index} style={styles.row} onClick={() => handleRowClick(item)}>
                  <td style={styles.td}>{item.M}</td>
                  <td style={styles.td}>{item.O_TIME}</td>
                  <td style={styles.td}>{item.EPI_LAT}</td>
                  <td style={styles.td}>{item.EPI_LON}</td>
                  <td style={styles.td}>{item.EPI_DEPTH}</td>
                  <td style={styles.td}>{item.LOCATION_C}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 样式
const styles = {
  container: {
    padding: "20px",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
  },
  refreshButton: {
    padding: "8px 16px",
    backgroundColor: "#1890ff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  statusText: {
    fontSize: "14px",
    color: "#666",
  },
  errorAlert: {
    padding: "12px",
    backgroundColor: "#fff2f0",
    border: "1px solid #ffccc7",
    borderRadius: "4px",
    marginBottom: "16px",
    color: "#a8071a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  retryButton: {
    padding: "4px 8px",
    backgroundColor: "#ff4d4f",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "8px",
  },
  tableContainer: {
    maxHeight: "600px",
    overflowY: "auto",
    border: "1px solid #ddd",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    textAlign: "left",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  },
  row: {
    cursor: "pointer",
  },
  emptyCell: {
    border: "1px solid #ddd",
    padding: "20px",
    textAlign: "center",
    color: "#999",
  },
};

export default SelectEvent;

import React, { useEffect, useState } from 'react';
import ReportInfo from './Reporting/ReportInfo';
import WordPre from './Reporting/WordPre';
import { makeUrl } from '../services/serverBase';

// 信息报送
function Reporting() {
  const [activeTab, setActiveTab] = useState('auto'); // 默认选中“通报信息”标签
  const [preview, setPreview] = useState(null); // 保存生成后的预览数据
  const [configData, setConfigData] = useState(null); // 后端配置（期号、政府分管领导等）

  // 页面挂载时尝试恢复预览数据，避免返回后丢失
  useEffect(() => {
    try {
      const s = sessionStorage.getItem('report_preview');
      if (s) {
        const data = JSON.parse(s);
        if (data && (data.docxUrl || data.pdfUrl)) setPreview(data);
      }
    } catch (_) {}
  }, []);

  // 启动页面时读取后端配置并在本地保存（即使已有缓存，也拉取最新），供 ReportInfo 使用期号与分管领导
  useEffect(() => {
    const normalizeConfig = (data) => {
      // 后端已统一返回规范键：期号、分管领导、报送最小烈度、服务位置
      if (!data || typeof data !== 'object') return data;
      return { ...data };
    };
    // 先同步展示会话缓存，随后拉取最新配置覆盖
    try {
      const cached = sessionStorage.getItem('report_config');
      if (cached) {
        const data = JSON.parse(cached);
        setConfigData(normalizeConfig(data));
      }
    } catch (_) {}

    (async () => {
      try {
        const resp = await fetch(makeUrl('/config/report'));
        const json = await resp.json();
        if (json?.status === 'success' && json?.data) {
          const normalized = normalizeConfig(json.data);
          setConfigData(normalized);
          try {
            sessionStorage.setItem('report_config', JSON.stringify(normalized));
          } catch (_) {}
        }
      } catch (_) {
        // ignore fetch error; ReportInfo 会回退到默认生成值
      }
    })();
  }, []);

  return (
    <div>
      <h2>震情通报</h2>

      {/* 标签导航 */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'auto' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'auto' ? '#fff' : '#000',
          }}
          onClick={() => setActiveTab('auto')}
        >
          通报信息
        </button>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'manual' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'manual' ? '#fff' : '#000',
          }}
          onClick={() => setActiveTab('manual')}
        >
         文件预览
        </button>
      </div>

      {/* 保持组件常驻，使用绝对定位叠放并通过透明度隐藏，避免 PDF/Embed 在 display 切换时重新加载 */}
      <div style={styles.tabContentContainer}>
        <div
          style={{
            ...styles.pane,
            opacity: activeTab === 'auto' ? 1 : 0,
            pointerEvents: activeTab === 'auto' ? 'auto' : 'none',
          }}
        >
          <ReportInfo
            configData={configData}
            onGenerated={(data) => {
              setPreview(data);
              try {
                sessionStorage.setItem('report_preview', JSON.stringify(data));
              } catch (_) {}
              setActiveTab('manual');
            }}
          />
        </div>
        <div
          style={{
            ...styles.pane,
            opacity: activeTab === 'manual' ? 1 : 0,
            pointerEvents: activeTab === 'manual' ? 'auto' : 'none',
          }}
        >
          <WordPre
            docxUrl={preview?.docxUrl}
            pdfUrl={preview?.pdfUrl}
            filename={preview?.filename}
          />
        </div>
      </div>
    </div>
  );
}

// 样式
const styles = {
  tabContainer: {
    display: 'flex',
    justifyContent: 'space-between', // 标签之间均匀分布
    marginBottom: '20px',
    width: '100%', // 宽度填充父容器
  },
  tab: {
    flex: 1, // 每个标签平分宽度
    padding: '10px 0', // 上下内边距
    margin: '0 5px', // 标签之间的间距
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    textAlign: 'center', // 文本居中
  },
  tabContentContainer: {
    position: 'relative',
    minHeight: '700px', // 保证容器有固定高度，避免绝对定位元素溢出
    overflow: 'hidden',
    border: '1px solid #eee',
    borderRadius: '6px',
  },
  pane: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
    transition: 'opacity 0.2s ease-in-out',
    background: '#fff',
  },
};

export default Reporting;

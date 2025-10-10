import React, { useState } from 'react';
import ReportInfo from './Reporting/ReportInfo';
import WordPre from './Reporting/WordPre';

// 信息报送
function Reporting() {
  const [activeTab, setActiveTab] = useState('auto'); // 默认选中“通报信息”标签
  const [preview, setPreview] = useState(null); // 保存生成后的预览数据

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

      {/* 根据选中的标签显示内容 */}
      {activeTab === 'auto' && (
        <ReportInfo
          onGenerated={(data) => {
            // data 结构：{ docxUrl, pdfUrl, filename }
            setPreview(data);
            setActiveTab('manual');
          }}
        />
      )}
      {activeTab === 'manual' && (
        <WordPre
          docxUrl={preview?.docxUrl}
          pdfUrl={preview?.pdfUrl}
          filename={preview?.filename}
        />
      )}
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
};

export default Reporting;

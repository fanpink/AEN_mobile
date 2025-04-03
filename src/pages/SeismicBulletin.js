import React, { useState } from 'react';
import Sub_server_event from './SeismicBulletin/Sub_server_event';
import Sub_web_clickEvent from './SeismicBulletin/Sub_web_clickEvent';

// 震情通报
function SeismicBulletin() {
  const [activeTab, setActiveTab] = useState('auto'); // 默认选中“自动”标签

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
          自动
        </button>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'manual' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'manual' ? '#fff' : '#000',
          }}
          onClick={() => setActiveTab('manual')}
        >
          手动
        </button>
      </div>

      {/* 根据选中的标签显示内容 */}
      {activeTab === 'auto' && <Sub_server_event />}
      {activeTab === 'manual' && <Sub_web_clickEvent />}
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

export default SeismicBulletin;
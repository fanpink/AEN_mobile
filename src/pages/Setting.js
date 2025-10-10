import React, { useState } from 'react';
import Config from './Setting/Config';
import User from './Setting/User';

// 基础配置
function Setting() {
  const [activeTab, setActiveTab] = useState('config');

  return (
    <div>
      <h2>设置</h2>

      {/* 标签导航 */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'config' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'config' ? '#fff' : '#000',
          }}
          onClick={() => setActiveTab('config')}
        >
          基础配置
        </button>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'user' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'user' ? '#fff' : '#000',
          }}
          onClick={() => setActiveTab('user')}
        >
         用户信息
        </button>
      </div>

      {/* 保持组件常驻，切换时仅隐藏以保留内部状态 */}
      <div style={styles.tabContentContainer}>
        <div
          style={{
            ...styles.pane,
            opacity: activeTab === 'config' ? 1 : 0,
            pointerEvents: activeTab === 'config' ? 'auto' : 'none',
          }}
        >
          <Config />
        </div>
        <div
          style={{
            ...styles.pane,
            opacity: activeTab === 'user' ? 1 : 0,
            pointerEvents: activeTab === 'user' ? 'auto' : 'none',
          }}
        >
          <User />
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
    minHeight: '400px',
    overflow: 'hidden',
    border: '1px solid #eee',
    borderRadius: '6px',
    marginTop: '10px',
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
    padding: '10px',
  },
};

export default Setting;
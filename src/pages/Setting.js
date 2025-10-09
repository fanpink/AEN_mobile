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

      {/* 根据选中的标签显示内容 */}
      {activeTab === 'config' && <Config />}
      {activeTab === 'user' && <User />}
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

export default Setting;
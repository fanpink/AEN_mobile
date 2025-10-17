import React, { useState } from 'react';
import SelectEvent from './Event/SelectEvent';
import InputEvent from './Event/InputEvent';
import BreakingNews from './Event/BreakingNews';

// 地震目录
function Event() {
  const [activeTab, setActiveTab] = useState('select'); // 默认选中"地震目录"标签

  return (
    <div>
      <h2>烈度评估</h2>

      {/* 标签导航 */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'select' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'select' ? '#fff' : '#000',
          }}
          onClick={() => setActiveTab('select')}
        >
          在线选择
        </button>
        
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'input' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'input' ? '#fff' : '#000',
          }}
          onClick={() => setActiveTab('input')}
        >
          正式测定<br/>手动输入
        </button>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'breakingNews' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'breakingNews' ? '#fff' : '#000',
          }}
          onClick={() => setActiveTab('breakingNews')}
        >
          快报、速报处理
        </button>
      </div>

      {/* 保持组件常驻，切换时仅隐藏以保留内部状态 */}
      <div style={{ display: activeTab === 'select' ? 'block' : 'none' }}>
        <SelectEvent />
      </div>
      <div style={{ display: activeTab === 'input' ? 'block' : 'none' }}>
        <InputEvent />
      </div>
      <div style={{ display: activeTab === 'breakingNews' ? 'block' : 'none' }}>
        <BreakingNews />
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
};

export default Event;
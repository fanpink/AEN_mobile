import React, { useContext, useState } from 'react';
import EventList from './History/EventList';
import EventSend from './History/Event_Send';
import { SelectedReportContext } from '../Status_Context';

// 震情通报
function History() {
  const [activeTab, setActiveTab] = useState('auto'); // 默认选中“自动”标签
  const { setSelectedReportName } = useContext(SelectedReportContext);

  return (
    <div>
      <h2>通报记录</h2>

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
          已生成事件列表
        </button>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'manual' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'manual' ? '#fff' : '#000',
          }}
          onClick={() => setActiveTab('manual')}
        >
         选中事件发送到邮箱
        </button>
      </div>

      {/* 根据选中的标签显示内容 */}
      {activeTab === 'auto' && (
        <EventList
          onSend={(name) => {
            if (name) {
              try {
                setSelectedReportName(name);
              } catch (_) {}
              setActiveTab('manual');
            }
          }}
        />
      )}
      {activeTab === 'manual' && <EventSend />}
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

export default History;

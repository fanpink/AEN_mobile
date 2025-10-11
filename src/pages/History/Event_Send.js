import React, { useContext } from 'react';
import { SelectedReportContext } from '../../Status_Context';

function Event_Send() {
  const { selectedReportName } = useContext(SelectedReportContext);

  return (
    <div>
      <h3>发送震情通报</h3>
      {selectedReportName ? (
        <div style={{ marginTop: '12px', background: '#f7f7f7', padding: '8px', borderRadius: '6px' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>已选通报文件：</div>
          <div style={{ wordBreak: 'break-all' }}>{selectedReportName}</div>
        </div>
      ) : (
        <div style={{ marginTop: '12px', color: '#888' }}>暂无选中的通报文件，请在“已生成事件列表”中选择并点击发送。</div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={{ padding: '8px 12px', backgroundColor: '#1890ff', color: '#fff', border: 'none', borderRadius: 4 }}
          onClick={() => {
            if (!selectedReportName) return;
            alert('“发送给防震减灾局全体干部职工”功能暂未接入后端接口，请稍后配置。\n文件：' + selectedReportName);
          }}
        >
          发送给防震减灾局全体干部职工
        </button>
        <button style={{ padding: '8px 12px', backgroundColor: '#52c41a', color: '#fff', border: 'none', borderRadius: 4 }}
          onClick={() => {
            if (!selectedReportName) return;
            alert('“报送两办、应急局邮箱”功能暂未接入后端接口，请稍后配置。\n文件：' + selectedReportName);
          }}
        >
          报送两办、应急局邮箱
        </button>
      </div>
    </div>
  );
}

export default Event_Send;

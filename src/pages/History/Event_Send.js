import React, { useContext, useState } from 'react';
import { SelectedReportContext } from '../../Status_Context';
import { makeUrl } from '../../services/serverBase';

function Event_Send() {
  const { selectedReportName } = useContext(SelectedReportContext);
  const [running, setRunning] = useState('idle'); // idle | eqsj | threee
  const [errorMsg, setErrorMsg] = useState('');
  const [eqsjStatuses, setEqsjStatuses] = useState([]); // {email, status, message}
  const [threeEStatuses, setThreeEStatuses] = useState([]); // {email, status, message}

  // 顺序发送到列表，并实时更新每个邮箱的状态
  const sendToList = async (type) => {
    if (!selectedReportName) return;
    setRunning(type);
    setErrorMsg('');
    if (type === 'eqsj') setEqsjStatuses([]);
    if (type === 'threee') setThreeEStatuses([]);
    try {
      // 读取邮箱列表
      const url = type === 'eqsj' ? '/config/email-list-eqsj' : '/config/email-list-3e';
      const resp = await fetch(makeUrl(url));
      const json = await resp.json();
      if (!(json?.status === 'success' && json?.data && Array.isArray(json.data.list))) {
        throw new Error(json?.message || '读取邮箱列表失败');
      }
      const list = json.data.list.filter((it) => typeof it?.邮箱 === 'string' && it.邮箱.includes('@'));

      // 逐个发送
      for (const item of list) {
        const email = item.邮箱;
        try {
          const sendResp = await fetch(makeUrl('/email/send-one'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ report_name: selectedReportName, mto: email }),
          });
          const sendJson = await sendResp.json();
          const statusItem = {
            email,
            status: sendJson?.status === 'success' ? 'success' : 'error',
            message: sendJson?.message || (sendResp.ok ? '发送成功' : '发送失败'),
          };
          if (type === 'eqsj') {
            setEqsjStatuses((prev) => [...prev, statusItem]);
          } else {
            setThreeEStatuses((prev) => [...prev, statusItem]);
          }
        } catch (e) {
          const statusItem = { email, status: 'error', message: e?.message || '发送失败' };
          if (type === 'eqsj') {
            setEqsjStatuses((prev) => [...prev, statusItem]);
          } else {
            setThreeEStatuses((prev) => [...prev, statusItem]);
          }
        }
      }
    } catch (e) {
      setErrorMsg(e?.message || '操作失败');
    } finally {
      setRunning('idle');
    }
  };

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
        <button style={{ padding: '8px 12px', backgroundColor: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, opacity: running !== 'idle' ? 0.6 : 1 }}
          disabled={!selectedReportName || running !== 'idle'}
          onClick={() => sendToList('eqsj')}
        >
          发送给防震减灾局全体干部职工
        </button>
        <button style={{ padding: '8px 12px', backgroundColor: '#52c41a', color: '#fff', border: 'none', borderRadius: 4, opacity: running !== 'idle' ? 0.6 : 1 }}
          disabled={!selectedReportName || running !== 'idle'}
          onClick={() => sendToList('threee')}
        >
          报送两办、应急局邮箱
        </button>
      </div>
      {errorMsg && <div style={{ marginTop: 12, color: 'red' }}>错误：{errorMsg}</div>}

      {/* 防震减灾局干部职工发送状态 */}
      {eqsjStatuses.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>防震减灾局干部职工发送状态：</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 8 }}>
            <div style={{ fontWeight: 500 }}>邮箱</div>
            <div style={{ fontWeight: 500 }}>状态</div>
            <div style={{ fontWeight: 500 }}>信息</div>
            {eqsjStatuses.map((s, idx) => (
              <React.Fragment key={idx}>
                <div style={{ wordBreak: 'break-all' }}>{s.email}</div>
                <div style={{ color: s.status === 'success' ? '#52c41a' : '#f5222d' }}>{s.status === 'success' ? '成功' : '失败'}</div>
                <div style={{ wordBreak: 'break-all', color: s.status === 'success' ? '#333' : '#f5222d' }}>{s.message}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 两办、应急局发送状态 */}
      {threeEStatuses.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>两办、应急局发送状态：</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 8 }}>
            <div style={{ fontWeight: 500 }}>邮箱</div>
            <div style={{ fontWeight: 500 }}>状态</div>
            <div style={{ fontWeight: 500 }}>信息</div>
            {threeEStatuses.map((s, idx) => (
              <React.Fragment key={idx}>
                <div style={{ wordBreak: 'break-all' }}>{s.email}</div>
                <div style={{ color: s.status === 'success' ? '#52c41a' : '#f5222d' }}>{s.status === 'success' ? '成功' : '失败'}</div>
                <div style={{ wordBreak: 'break-all', color: s.status === 'success' ? '#333' : '#f5222d' }}>{s.message}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Event_Send;

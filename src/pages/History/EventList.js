import React, { useEffect, useMemo, useRef, useState } from 'react';
import { makeUrl } from '../../services/serverBase';

function EventList({ onSend }) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | deleting | error
  const [error, setError] = useState('');
  const loadedRef = useRef(false);

  // 会话持久化：避免切换组件时重复加载
  const SESSION_KEY = 'report_events';

  // 初始加载：优先使用会话缓存，若无则从服务端获取一次
  useEffect(() => {
    try {
      const s = sessionStorage.getItem(SESSION_KEY);
      if (s) {
        const data = JSON.parse(s);
        if (Array.isArray(data)) {
          setEvents(data);
        }
      }
    } catch (_) {}

    if (!loadedRef.current) {
      loadedRef.current = true;
      refresh();
    }
  }, []);

  const refresh = async () => {
    setStatus('loading');
    setError('');
    try {
      const resp = await fetch(makeUrl('/report/list'));
      const json = await resp.json();
      if (json?.status === 'success' && Array.isArray(json?.data)) {
        setEvents(json.data);
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(json.data));
        } catch (_) {}
        setStatus('idle');
      } else {
        throw new Error(json?.message || '读取失败');
      }
    } catch (e) {
      setStatus('error');
      setError(e?.message || '读取失败');
    }
  };

  const handleDelete = async (name) => {
    if (!name) return;
    setStatus('deleting');
    setError('');
    try {
      const resp = await fetch(makeUrl('/report/event'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json = await resp.json();
      if (json?.status === 'success') {
        const next = events.filter((e) => e.name !== name);
        setEvents(next);
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
        } catch (_) {}
        setStatus('idle');
      } else {
        throw new Error(json?.message || '删除失败');
      }
    } catch (e) {
      setStatus('error');
      setError(e?.message || '删除失败');
    }
  };

  const hasData = useMemo(() => Array.isArray(events) && events.length > 0, [events]);

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={refresh} disabled={status === 'loading' || status === 'deleting'} style={{ padding: '6px 10px' }}>
          {status === 'loading' ? '正在刷新...' : '刷新列表'}
        </button>
        {status === 'deleting' && <span>正在删除...</span>}
        {status === 'error' && <span style={{ color: 'red' }}>操作失败：{error}</span>}
      </div>

      {!hasData && status !== 'loading' && <div>暂无报告记录。</div>}
      {status === 'loading' && <div>正在加载...</div>}

      {hasData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
          {events.map((ev) => (
            <div key={ev.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', borderRadius: 6, padding: '8px 12px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{ev.name}</div>
                <div style={{ color: '#666', fontSize: 14 }}>可用格式：{(ev.available || []).join(', ') || '无'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onSend && onSend(ev.name)} disabled={status === 'deleting'} style={{ padding: '6px 10px', color: '#fff', backgroundColor: '#52c41a', border: 'none', borderRadius: 4 }}>
                  发送
                </button>
                <button onClick={() => handleDelete(ev.name)} disabled={status === 'deleting'} style={{ padding: '6px 10px', color: '#fff', backgroundColor: '#ff4d4f', border: 'none', borderRadius: 4 }}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;

import React, { useEffect, useMemo, useState } from 'react';
import { makeUrl } from '../../services/serverBase';

// 简单的会话存储钩子，确保切换页面/组件后内容可恢复
function useSessionStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const s = sessionStorage.getItem(key);
      return s ? JSON.parse(s) : initialValue;
    } catch (_) {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }, [key, value]);
  return [value, setValue];
}

function Config() {
  const [config, setConfig] = useSessionStorage('report_config', {
    期号: '',
    政府分管领导: '',
    报送最小烈度: 3,
    服务位置: { centre_lon: 0, centre_lat: 0 },
  });
  const [status, setStatus] = useState('idle'); // idle | loading | saving | success | error
  const [error, setError] = useState('');

  // 启动时总是读取后端配置（即使存在本地缓存），确保页面显示服务端内容；成功后写入会话缓存
  useEffect(() => {
    (async () => {
      setStatus('loading');
      setError('');
      try {
        const resp = await fetch(makeUrl('/config/report'));
        const json = await resp.json();
        if (json?.status === 'success' && json?.data) {
          setConfig(json.data);
          try {
            sessionStorage.setItem('report_config', JSON.stringify(json.data));
          } catch (_) {}
          setStatus('idle');
        } else {
          throw new Error(json?.message || '读取配置失败');
        }
      } catch (e) {
        setStatus('error');
        setError(e?.message || '读取配置失败');
      }
    })();
  }, [setConfig]);

  const handleChange = (key, nested) => (e) => {
    const val = e.target.value;
    setConfig((prev) => {
      const next = { ...prev };
      if (nested === '服务位置') {
        next.服务位置 = { ...prev.服务位置, [key]: Number(val) };
      } else if (key === '报送最小烈度') {
        next[key] = Number(val);
      } else if (key === '期号') {
        next[key] = Number(val);
      } else {
        next[key] = val;
      }
      return next;
    });
  };

  const canSave = useMemo(() => {
    return config && config.服务位置 && typeof config.服务位置.centre_lon === 'number' && typeof config.服务位置.centre_lat === 'number';
  }, [config]);

  const handleSave = async () => {
    if (!canSave) return;
    setStatus('saving');
    setError('');
    try {
      const resp = await fetch(makeUrl('/config/report'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await resp.json();
      if (json?.status === 'success' && json?.data) {
        setConfig(json.data);
        sessionStorage.setItem('report_config', JSON.stringify(json.data));
        setStatus('success');
        setTimeout(() => setStatus('idle'), 1200);
      } else {
        throw new Error(json?.message || '保存失败');
      }
    } catch (e) {
      setStatus('error');
      setError(e?.message || '保存失败');
    }
  };

  return (
    <div>
      <h3>通报参数配置</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label>
          期号
          <input type="number" value={config.期号} onChange={handleChange('期号')} style={{ width: '100%' }} />
        </label>
        <label>
          政府分管领导
          <input type="text" value={config.政府分管领导} onChange={handleChange('政府分管领导')} style={{ width: '100%' }} />
        </label>
        <label>
          报送最小烈度
          <input type="number" value={config.报送最小烈度} onChange={handleChange('报送最小烈度')} style={{ width: '100%' }} />
        </label>
        <label>
          中心经度 (centre_lon)
          <input type="number" step="0.0001" value={config.服务位置.centre_lon} onChange={handleChange('centre_lon', '服务位置')} style={{ width: '100%' }} />
        </label>
        <label>
          中心纬度 (centre_lat)
          <input type="number" step="0.0001" value={config.服务位置.centre_lat} onChange={handleChange('centre_lat', '服务位置')} style={{ width: '100%' }} />
        </label>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={handleSave} disabled={!canSave || status === 'saving'} style={{ padding: '8px 12px' }}>
          {status === 'saving' ? '保存中...' : '保存配置'}
        </button>
        {status === 'success' && <span style={{ color: '#52c41a' }}>保存成功</span>}
        {status === 'error' && <span style={{ color: 'red' }}>操作失败：{error}</span>}
        {status === 'loading' && <span>正在读取后端配置...</span>}
      </div>
      <div style={{ marginTop: 8, color: '#666' }}>
        提示：配置内容在本会话中持久化，切换页面后可直接恢复。
      </div>
    </div>
  );
}

export default Config;

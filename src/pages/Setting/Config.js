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
    分管领导: '',
    报送最小烈度: 3,
    服务位置: { centre_lon: 0, centre_lat: 0 },
  });
  const [status, setStatus] = useState('idle'); // idle | loading | saving | success | error
  const [error, setError] = useState('');
  // 两办、应急局联系方式（email-list-3e.json）
  const [contacts3e, setContacts3e] = useState({ list: [] });
  const [status3e, setStatus3e] = useState('idle'); // idle | loading | saving | success | error
  const [error3e, setError3e] = useState('');
  const [selected3eIndex, setSelected3eIndex] = useState(null);
  const [showEdit3e, setShowEdit3e] = useState(false);
  const [edit3e, setEdit3e] = useState({ 联系人: '', 电话: '', 邮箱: '' });

  // 绥江县防震减灾局дето邮箱配置（email-list-eqsj.json）
  const [contactsEqsj, setContactsEqsj] = useState({ list: [] });
  const [statusEqsj, setStatusEqsj] = useState('idle'); // idle | loading | saving | success | error
  const [errorEqsj, setErrorEqsj] = useState('');
  const [showAddEqsj, setShowAddEqsj] = useState(false);
  const [newEqsj, setNewEqsj] = useState({ 联系人: '', 邮箱: '' });
  const [selectedEqsjIndex, setSelectedEqsjIndex] = useState(null);
  const [showEditEqsj, setShowEditEqsj] = useState(false);
  const [editEqsj, setEditEqsj] = useState({ 联系人: '', 邮箱: '' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // 发送邮箱参数配置（send-email-config.json）
  const [sendEmailConfig, setSendEmailConfig] = useState({ server: '', account: '', send_name: '', password: '' });
  const [sendEmailStatus, setSendEmailStatus] = useState('idle'); // idle | loading | saving | success | error
  const [sendEmailError, setSendEmailError] = useState('');

  // 启动时总是读取后端配置（即使存在本地缓存），确保页面显示服务端内容；成功后写入会话缓存
  useEffect(() => {
    (async () => {
      setStatus('loading');
      setError('');
      try {
        const resp = await fetch(makeUrl('/config/report'));
        const json = await resp.json();
        if (json?.status === 'success' && json?.data) {
          // 后端已统一返回规范键：直接使用
          const d = { ...json.data };
          setConfig(d);
          try {
            sessionStorage.setItem('report_config', JSON.stringify(d));
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
  // 读取两办、应急局联系方式
  useEffect(() => {
    (async () => {
      setStatus3e('loading');
      setError3e('');
      try {
        const resp = await fetch(makeUrl('/config/email-list-3e'));
        const json = await resp.json();
        if (json?.status === 'success' && json?.data?.list) {
          setContacts3e({ list: json.data.list });
          setStatus3e('idle');
        } else {
          throw new Error(json?.message || '读取联系方式失败');
        }
      } catch (e) {
        setStatus3e('error');
        setError3e(e?.message || '读取联系方式失败');
      }
    })();
  }, []);

  // 读取绥江县防震减灾局дето邮箱列表
  useEffect(() => {
    (async () => {
      setStatusEqsj('loading');
      setErrorEqsj('');
      try {
        const resp = await fetch(makeUrl('/config/email-list-eqsj'));
        const json = await resp.json();
        if (json?.status === 'success' && json?.data?.list) {
          setContactsEqsj({ list: json.data.list });
          setStatusEqsj('idle');
        } else {
          throw new Error(json?.message || '读取邮箱列表失败');
        }
      } catch (e) {
        setStatusEqsj('error');
        setErrorEqsj(e?.message || '读取邮箱列表失败');
      }
    })();
  }, []);

  // 读取发送邮箱参数配置
  useEffect(() => {
    (async () => {
      setSendEmailStatus('loading');
      setSendEmailError('');
      try {
        const resp = await fetch(makeUrl('/config/send-email-config'));
        const json = await resp.json();
        if (json?.status === 'success' && json?.data) {
          setSendEmailConfig({
            server: json.data.server || '',
            account: json.data.account || '',
            send_name: json.data.send_name || '',
            password: json.data.password || '',
          });
          setSendEmailStatus('idle');
        } else {
          throw new Error(json?.message || '读取发送邮箱参数配置失败');
        }
      } catch (e) {
        setSendEmailStatus('error');
        setSendEmailError(e?.message || '读取发送邮箱参数配置失败');
      }
    })();
  }, []);

  // 监听“配置刷新”事件：无干扰地刷新后端配置，仅更新期号等配置字段
  useEffect(() => {
    const handler = () => {
      (async () => {
        try {
          const resp = await fetch(makeUrl('/config/report'));
          const json = await resp.json();
          if (json?.status === 'success' && json?.data) {
            const d = { ...json.data };
            setConfig(d);
            try {
              sessionStorage.setItem('report_config', JSON.stringify(d));
            } catch (_) {}
          }
        } catch (_) {
          // 静默失败，不影响当前页面状态
        }
      })();
    };
    window.addEventListener('report-config-refresh', handler);
    return () => window.removeEventListener('report-config-refresh', handler);
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

  // 统一区块样式
  const sectionStyle = {
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    background: '#fff',
  };
  // 修改联系方式字段（未使用，注释保留以备后续启用）
  /*
  const handleContactChange = (idx, key) => (e) => {
    const val = e.target.value;
    setContacts3e((prev) => {
      const nextList = Array.isArray(prev.list) ? [...prev.list] : [];
      nextList[idx] = { ...nextList[idx], [key]: val };
      return { list: nextList };
    });
  };
  */

  // 修改 EQSJ 邮箱列表字段（保留占位，不在列表中直接编辑，未使用）
  /*
  const handleEqsjChange = (idx, key) => (e) => {
    const val = e.target.value;
    setContactsEqsj((prev) => {
      const next = Array.isArray(prev.list) ? [...prev.list] : [];
      next[idx] = { ...next[idx], [key]: val };
      return { list: next };
    });
  };
  */

  // 保存联系方式到后端（支持直接传入最新列表以避免异步状态竞争）
  const handleSaveContacts = async (overrideList) => {
    setStatus3e('saving');
    setError3e('');
    try {
      const listToSave = Array.isArray(overrideList)
        ? overrideList
        : Array.isArray(contacts3e.list)
        ? contacts3e.list
        : [];
      const payload = { list: listToSave };
      const resp = await fetch(makeUrl('/config/email-list-3e'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();
      if (json?.status === 'success' && json?.data?.list) {
        setContacts3e({ list: json.data.list });
        setStatus3e('success');
        setTimeout(() => setStatus3e('idle'), 1200);
      } else {
        throw new Error(json?.message || '保存联系方式失败');
      }
    } catch (e) {
      setStatus3e('error');
      setError3e(e?.message || '保存联系方式失败');
    }
  };

  // 打开“修改联系方式”弹窗（基于当前选中行）
  const openEdit3eModal = () => {
    if (selected3eIndex == null || !Array.isArray(contacts3e.list) || !contacts3e.list[selected3eIndex]) return;
    const cur = contacts3e.list[selected3eIndex];
    setEdit3e({ 联系人: cur.联系人 || '', 电话: cur.电话 || '', 邮箱: cur.邮箱 || '' });
    setShowEdit3e(true);
  };

  // 确认修改并保存到后端
  const handleEdit3eConfirm = () => {
    const name = String(edit3e.联系人 || '').trim();
    const phone = String(edit3e.电话 || '').trim();
    const email = String(edit3e.邮箱 || '').trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name) {
      setError3e('联系人不能为空');
      return;
    }
    if (!emailOk) {
      setError3e('邮箱格式不正确');
      return;
    }
    setContacts3e((prev) => {
      const next = Array.isArray(prev.list) ? [...prev.list] : [];
      if (selected3eIndex != null && selected3eIndex >= 0 && selected3eIndex < next.length) {
        next[selected3eIndex] = { 联系人: name, 电话: phone, 邮箱: email };
      }
      const updated = { list: next };
      setContacts3e(updated);
      handleSaveContacts(updated.list);
      setShowEdit3e(false);
      return updated;
    });
  };

  // 保存 EQSJ 邮箱列表到后端
  const handleSaveEqsj = async (overrideList) => {
    setStatusEqsj('saving');
    setErrorEqsj('');
    try {
      const listToSave = Array.isArray(overrideList)
        ? overrideList
        : Array.isArray(contactsEqsj.list)
        ? contactsEqsj.list
        : [];
      const payload = { list: listToSave };
      const resp = await fetch(makeUrl('/config/email-list-eqsj'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();
      if (json?.status === 'success' && json?.data?.list) {
        setContactsEqsj({ list: json.data.list });
        setStatusEqsj('success');
        setTimeout(() => setStatusEqsj('idle'), 1200);
      } else {
        throw new Error(json?.message || '保存邮箱列表失败');
      }
    } catch (e) {
      setStatusEqsj('error');
      setErrorEqsj(e?.message || '保存邮箱列表失败');
    }
  };

  // 保存发送邮箱参数配置到后端
  const handleSaveSendEmailConfig = async () => {
    setSendEmailStatus('saving');
    setSendEmailError('');
    try {
      const payload = {
        server: String(sendEmailConfig.server || ''),
        account: String(sendEmailConfig.account || ''),
        send_name: String(sendEmailConfig.send_name || ''),
        password: String(sendEmailConfig.password || ''),
      };
      const resp = await fetch(makeUrl('/config/send-email-config'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();
      if (json?.status === 'success' && json?.data) {
        setSendEmailConfig({
          server: json.data.server || '',
          account: json.data.account || '',
          send_name: json.data.send_name || '',
          password: json.data.password || '',
        });
        setSendEmailStatus('success');
        setTimeout(() => setSendEmailStatus('idle'), 1200);
      } else {
        throw new Error(json?.message || '保存发送邮箱参数配置失败');
      }
    } catch (e) {
      setSendEmailStatus('error');
      setSendEmailError(e?.message || '保存发送邮箱参数配置失败');
    }
  };

  // 删除选中的 EQSJ 邮箱项（弹窗确认）
  const handleConfirmDeleteSelected = () => {
    if (selectedEqsjIndex == null) {
      setShowConfirmDelete(false);
      return;
    }
    setContactsEqsj((prev) => {
      const next = Array.isArray(prev.list) ? [...prev.list] : [];
      if (selectedEqsjIndex >= 0 && selectedEqsjIndex < next.length) {
        next.splice(selectedEqsjIndex, 1);
      }
      const updated = { list: next };
      setContactsEqsj(updated);
      handleSaveEqsj(updated.list);
      setSelectedEqsjIndex(null);
      setShowConfirmDelete(false);
      return updated;
    });
  };

  // 弹窗添加 EQSJ 邮箱
  const handleAddEqsjConfirm = () => {
    const name = String(newEqsj.联系人 || '').trim();
    const email = String(newEqsj.邮箱 || '').trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name) {
      setErrorEqsj('联系人不能为空');
      return;
    }
    if (!emailOk) {
      setErrorEqsj('邮箱格式不正确');
      return;
    }
    setContactsEqsj((prev) => {
      const next = Array.isArray(prev.list) ? [...prev.list] : [];
      next.push({ 联系人: name, 邮箱: email });
      const updated = { list: next };
      setContactsEqsj(updated);
      // 直接提交最新数据，确保持久化正确
      handleSaveEqsj(updated.list);
      // 关闭弹窗并重置表单
      setShowAddEqsj(false);
      setNewEqsj({ 联系人: '', 邮箱: '' });
      return updated;
    });
  };

  // 弹窗修改选中的 EQSJ 邮箱
  const openEditEqsjModal = () => {
    if (selectedEqsjIndex == null || !Array.isArray(contactsEqsj.list) || !contactsEqsj.list[selectedEqsjIndex]) return;
    const cur = contactsEqsj.list[selectedEqsjIndex];
    setEditEqsj({ 联系人: cur.联系人 || '', 邮箱: cur.邮箱 || '' });
    setShowEditEqsj(true);
  };

  const handleEditEqsjConfirm = () => {
    const name = String(editEqsj.联系人 || '').trim();
    const email = String(editEqsj.邮箱 || '').trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name) {
      setErrorEqsj('联系人不能为空');
      return;
    }
    if (!emailOk) {
      setErrorEqsj('邮箱格式不正确');
      return;
    }
    setContactsEqsj((prev) => {
      const next = Array.isArray(prev.list) ? [...prev.list] : [];
      if (selectedEqsjIndex != null && selectedEqsjIndex >= 0 && selectedEqsjIndex < next.length) {
        next[selectedEqsjIndex] = { 联系人: name, 邮箱: email };
      }
      const updated = { list: next };
      setContactsEqsj(updated);
      handleSaveEqsj(updated.list);
      setShowEditEqsj(false);
      return updated;
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
      // 仅发送规范字段，避免冗余键
      const payload = {
        期号: Number(config.期号),
        分管领导: config.分管领导,
        报送最小烈度: Number(config.报送最小烈度),
        服务位置: {
          centre_lon: Number(config.服务位置.centre_lon),
          centre_lat: Number(config.服务位置.centre_lat),
        },
      };
      const resp = await fetch(makeUrl('/config/report'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();
      if (json?.status === 'success' && json?.data) {
        // 成功后直接使用后端返回的数据
        const d = { ...json.data };
        setConfig(d);
        sessionStorage.setItem('report_config', JSON.stringify(d));
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
      <div style={sectionStyle}>
        <h3>通报参数配置</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            期号
            <input type="number" value={config.期号} onChange={handleChange('期号')} style={{ width: '100%' }} />
          </label>
          <label>
            分管领导
            <input type="text" value={config.分管领导} onChange={handleChange('分管领导')} style={{ width: '100%' }} />
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
      </div>
      {/* 两办、应急局信息配置模块 */}
      <div style={{ ...sectionStyle, marginTop: 24 }}>
        <h3>两办、应急局信息配置</h3>
        {status3e === 'loading' && <div>正在读取联系方式...</div>}
        {status3e === 'error' && <div style={{ color: 'red' }}>读取失败：{error3e}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr 1fr', gap: 12, alignItems: 'start', overflowX: 'hidden' }}>
          {(contacts3e.list || []).map((item, idx) => (
            <React.Fragment key={idx}>
              <div style={{ textAlign: 'center' }}>
                <input
                  type="radio"
                  name="threeeSelect"
                  checked={selected3eIndex === idx}
                  onChange={() => setSelected3eIndex(idx)}
                />
              </div>
              <div style={{ whiteSpace: 'normal', wordBreak: 'break-all', overflowWrap: 'anywhere', minWidth: 0 }}>{item.联系人 || '-'}</div>
              <div style={{ whiteSpace: 'normal', wordBreak: 'break-all', overflowWrap: 'anywhere', minWidth: 0 }}>{item.电话 || '-'}</div>
              <div style={{ whiteSpace: 'normal', wordBreak: 'break-all', overflowWrap: 'anywhere', minWidth: 0 }}>{item.邮箱 || '-'}</div>
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={openEdit3eModal} disabled={selected3eIndex == null} style={{ padding: '8px 12px' }}>修改</button>
          {status3e === 'success' && <span style={{ color: '#52c41a' }}>操作成功</span>}
          {status3e === 'error' && <span style={{ color: 'red' }}>操作失败：{error3e}</span>}
        </div>
        <div style={{ marginTop: 8, color: '#666' }}>提示：选中一行后点击“修改”，在弹窗中编辑并保存。</div>

        {/* 修改联系方式弹窗 */}
        {showEdit3e && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ width: 420, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <h4 style={{ marginTop: 0 }}>修改联系方式</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <label>
                  联系人
                  <input type="text" value={edit3e.联系人} onChange={(e) => setEdit3e((p) => ({ ...p, 联系人: e.target.value }))} style={{ width: '100%' }} />
                </label>
                <label>
                  电话
                  <input type="text" value={edit3e.电话} onChange={(e) => setEdit3e((p) => ({ ...p, 电话: e.target.value }))} style={{ width: '100%' }} />
                </label>
                <label>
                  邮箱
                  <input type="email" value={edit3e.邮箱} onChange={(e) => setEdit3e((p) => ({ ...p, 邮箱: e.target.value }))} style={{ width: '100%' }} />
                </label>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowEdit3e(false)} style={{ padding: '8px 12px' }}>取消</button>
                <button onClick={handleEdit3eConfirm} style={{ padding: '8px 12px' }}>保存</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 发送邮箱参数配置模块 */}
      <div style={{ ...sectionStyle, marginTop: 24 }}>
        <h3>发送邮箱参数配置</h3>
        <div style={{ marginTop: 8, padding: '8px 12px', background: '#fffbe6', border: '1px solid #ffe58f', color: '#ad6800', borderRadius: 6 }}>
          注意：此配置信息不可随便修改，错误将导致邮件无法发送。修改前请确认账号与授权码有效。
        </div>
        {sendEmailStatus === 'loading' && <div>正在读取发送邮箱参数配置...</div>}
        {sendEmailStatus === 'error' && <div style={{ color: 'red' }}>读取/保存失败：{sendEmailError}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, alignItems: 'center' }}>
          <label style={{ display: 'contents' }}>
            <div style={{ color: '#666' }}>邮件服务器</div>
            <input
              type="text"
              value={sendEmailConfig.server}
              onChange={(e) => setSendEmailConfig((p) => ({ ...p, server: e.target.value }))}
              placeholder="smtp.163.com"
              style={{ width: '100%' }}
            />
          </label>
          <label style={{ display: 'contents' }}>
            <div style={{ color: '#666' }}>发件账号</div>
            <input
              type="email"
              value={sendEmailConfig.account}
              onChange={(e) => setSendEmailConfig((p) => ({ ...p, account: e.target.value }))}
              placeholder="example@163.com"
              style={{ width: '100%' }}
            />
          </label>
          <label style={{ display: 'contents' }}>
            <div style={{ color: '#666' }}>发件显示名称</div>
            <input
              type="text"
              value={sendEmailConfig.send_name}
              onChange={(e) => setSendEmailConfig((p) => ({ ...p, send_name: e.target.value }))}
              placeholder="绥江县防震减灾局"
              style={{ width: '100%' }}
            />
          </label>
          <label style={{ display: 'contents' }}>
            <div style={{ color: '#666' }}>授权密码/Token</div>
            <input
              type="password"
              value={sendEmailConfig.password}
              onChange={(e) => setSendEmailConfig((p) => ({ ...p, password: e.target.value }))}
              placeholder="请输入邮箱授权码"
              style={{ width: '100%' }}
            />
          </label>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={handleSaveSendEmailConfig} disabled={sendEmailStatus === 'saving'} style={{ padding: '8px 12px' }}>
            {sendEmailStatus === 'saving' ? '保存中...' : '保存发送邮箱参数'}
          </button>
          {sendEmailStatus === 'success' && <span style={{ color: '#52c41a' }}>保存成功</span>}
          {sendEmailStatus === 'error' && <span style={{ color: 'red' }}>保存失败：{sendEmailError}</span>}
        </div>
      </div>

      {/* 绥江县防震减灾局дето邮箱配置模块 */}
      <div style={{ ...sectionStyle, marginTop: 24 }}>
        <h3>绥江县防震减灾局дето邮箱配置</h3>
        {statusEqsj === 'loading' && <div>正在读取邮箱列表...</div>}
        {statusEqsj === 'error' && <div style={{ color: 'red' }}>读取失败：{errorEqsj}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '36px 48px 1fr 1fr', gap: 12, alignItems: 'start', overflowX: 'hidden' }}>
          {(contactsEqsj.list || []).map((item, idx) => (
            <React.Fragment key={idx}>
              <div style={{ textAlign: 'center' }}>
                <input
                  type="radio"
                  name="eqsjSelect"
                  checked={selectedEqsjIndex === idx}
                  onChange={() => setSelectedEqsjIndex(idx)}
                />
              </div>
              <div style={{ textAlign: 'center', lineHeight: '24px' }}>{idx + 1}</div>
              <div style={{ whiteSpace: 'normal', wordBreak: 'break-all', overflowWrap: 'anywhere', minWidth: 0 }}>{item.联系人 || '-'}</div>
              <div style={{ whiteSpace: 'normal', wordBreak: 'break-all', overflowWrap: 'anywhere', minWidth: 0 }}>{item.邮箱 || '-'}</div>
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setShowAddEqsj(true)} style={{ padding: '8px 12px' }}>新增</button>
          <button onClick={openEditEqsjModal} disabled={selectedEqsjIndex == null} style={{ padding: '8px 12px' }}>修改</button>
          <button onClick={() => setShowConfirmDelete(true)} disabled={selectedEqsjIndex == null} style={{ padding: '8px 12px' }}>删除</button>
          {statusEqsj === 'success' && <span style={{ color: '#52c41a' }}>操作成功</span>}
          {statusEqsj === 'error' && <span style={{ color: 'red' }}>操作失败：{errorEqsj}</span>}
        </div>
        <div style={{ marginTop: 8, color: '#666' }}>提示：支持新增/修改/删除，删除与修改针对选中的行。</div>

        {/* 新增弹窗 */}
        {showAddEqsj && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ width: 420, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <h4 style={{ marginTop: 0 }}>新增邮箱</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <label>
                  联系人
                  <input type="text" value={newEqsj.联系人} onChange={(e) => setNewEqsj((p) => ({ ...p, 联系人: e.target.value }))} style={{ width: '100%' }} />
                </label>
                <label>
                  邮箱
                  <input type="email" value={newEqsj.邮箱} onChange={(e) => setNewEqsj((p) => ({ ...p, 邮箱: e.target.value }))} style={{ width: '100%' }} />
                </label>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddEqsj(false)} style={{ padding: '8px 12px' }}>取消</button>
                <button onClick={handleAddEqsjConfirm} style={{ padding: '8px 12px' }}>添加</button>
              </div>
            </div>
          </div>
        )}

        {/* 修改弹窗 */}
        {showEditEqsj && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ width: 420, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <h4 style={{ marginTop: 0 }}>修改邮箱</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <label>
                  联系人
                  <input type="text" value={editEqsj.联系人} onChange={(e) => setEditEqsj((p) => ({ ...p, 联系人: e.target.value }))} style={{ width: '100%' }} />
                </label>
                <label>
                  邮箱
                  <input type="email" value={editEqsj.邮箱} onChange={(e) => setEditEqsj((p) => ({ ...p, 邮箱: e.target.value }))} style={{ width: '100%' }} />
                </label>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowEditEqsj(false)} style={{ padding: '8px 12px' }}>取消</button>
                <button onClick={handleEditEqsjConfirm} style={{ padding: '8px 12px' }}>保存</button>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认弹窗 */}
        {showConfirmDelete && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ width: 360, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <h4 style={{ marginTop: 0 }}>确认删除</h4>
              <div style={{ color: '#333', marginTop: 8 }}>确定删除当前选中的邮箱记录吗？该操作不可恢复。</div>
              <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowConfirmDelete(false)} style={{ padding: '8px 12px' }}>取消</button>
                <button onClick={handleConfirmDeleteSelected} style={{ padding: '8px 12px', color: '#fff', background: '#ff4d4f', border: 'none' }}>删除</button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default Config;

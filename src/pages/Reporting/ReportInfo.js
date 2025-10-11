import React, { useContext, useMemo, useEffect, useState } from 'react';
import { SelectEventContext } from '../../Status_Context';
import { generateReport } from '../../services/reportGenerator';
import axios from 'axios';
import { makeUrl } from '../../services/serverBase';
// 由父组件传入生成成功后的回调，用于切换到预览标签

function ReportInfo({ onGenerated, configData }) {
  const { selectEqEvent } = useContext(SelectEventContext);
  const report = useMemo(() => (selectEqEvent ? generateReport(selectEqEvent) : null), [selectEqEvent]);
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | generating | success | error
  const [error, setError] = useState('');
  const [copyOpen, setCopyOpen] = useState(false); // 复制预览弹窗
  const [copyText, setCopyText] = useState('');
  const [copyStatus, setCopyStatus] = useState(''); // 复制反馈

  // 使用 sessionStorage 保留用户填写内容与状态，避免切换标签时刷新丢失
  const STORAGE_FORM_KEY = 'report_info_form';
  const STORAGE_EVENT_HASH_KEY = 'report_info_event_hash';
  const STORAGE_STATUS_KEY = 'report_info_status';
  const STORAGE_ERROR_KEY = 'report_info_error';

  // 基于当前选中事件生成哈希，用于判断缓存是否与当前事件匹配
  const eventHash = useMemo(() => (selectEqEvent ? JSON.stringify(selectEqEvent) : ''), [selectEqEvent]);

  // 初始化：优先读取与当前事件匹配的缓存，否则用实时生成的 report
  useEffect(() => {
    const cachedEventHash = sessionStorage.getItem(STORAGE_EVENT_HASH_KEY);
    const cachedFormStr = sessionStorage.getItem(STORAGE_FORM_KEY);
    // 如果缓存与当前事件一致，恢复缓存的表单和状态
    if (cachedEventHash && cachedEventHash === eventHash && cachedFormStr) {
      try {
        const cachedForm = JSON.parse(cachedFormStr);
        // 恢复缓存后，仍然以服务端配置中的“期号”“分管领导”为准更新对应字段
        const leaderFromConfig = getLeaderFromConfig(configData);
        const mergedCached = {
          ...cachedForm,
          ...(configData && {
            期号: typeof configData['期号'] !== 'undefined' ? configData['期号'] : cachedForm['期号'],
            分管领导: typeof leaderFromConfig !== 'undefined' ? leaderFromConfig : cachedForm['分管领导'],
          }),
        };
        setForm(mergedCached);
        try {
          sessionStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(mergedCached));
        } catch (_) {}
        const cachedStatus = sessionStorage.getItem(STORAGE_STATUS_KEY);
        const cachedError = sessionStorage.getItem(STORAGE_ERROR_KEY);
        if (cachedStatus) setStatus(cachedStatus);
        if (cachedError) setError(cachedError);
      } catch (_) {
        // 若解析失败，回退到新生成的 report
        if (report) {
          // 初始化表单时融合后端配置中的期号与分管领导
          const leaderFromConfig = getLeaderFromConfig(configData);
          const merged = {
            ...report,
            ...(configData && {
              期号: typeof configData['期号'] !== 'undefined' ? configData['期号'] : report['期号'],
              分管领导: typeof leaderFromConfig !== 'undefined' ? leaderFromConfig : report['分管领导'],
            }),
          };
          setForm(merged);
        }
      }
    } else {
      // 缓存不匹配或不存在时，使用最新的 report 并写入缓存基线
      if (report) {
        // 初始化表单时融合后端配置中的期号与分管领导
        const leaderFromConfig = getLeaderFromConfig(configData);
        const merged = {
          ...report,
          ...(configData && {
            期号: typeof configData['期号'] !== 'undefined' ? configData['期号'] : report['期号'],
            分管领导: typeof leaderFromConfig !== 'undefined' ? leaderFromConfig : report['分管领导'],
          }),
        };
        setForm(merged);
        sessionStorage.setItem(STORAGE_EVENT_HASH_KEY, eventHash);
        sessionStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(merged));
        sessionStorage.removeItem(STORAGE_STATUS_KEY);
        sessionStorage.removeItem(STORAGE_ERROR_KEY);
      }
    }
    // 当选中事件变化时触发
  }, [eventHash, report, configData]);

  // 当后端配置变更时，即使已存在表单，也同步更新“期号”“分管领导”两个字段以显示服务端内容
  useEffect(() => {
    if (configData && form) {
      const leaderFromConfig = getLeaderFromConfig(configData);
      const next = {
        ...form,
        期号: typeof configData['期号'] !== 'undefined' ? configData['期号'] : form['期号'],
        分管领导: typeof leaderFromConfig !== 'undefined' ? leaderFromConfig : form['分管领导'],
      };
      setForm(next);
      try {
        sessionStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(next));
      } catch (_) {}
    }
  }, [configData]);

  // 表单内容变化时更新缓存
  useEffect(() => {
    if (form) {
      try {
        sessionStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(form));
      } catch (_) {
        // ignore storage write error
      }
    }
  }, [form]);

  // 状态与错误信息变化时更新缓存
  useEffect(() => {
    if (status) {
      sessionStorage.setItem(STORAGE_STATUS_KEY, status);
    }
  }, [status]);

  useEffect(() => {
    if (error) {
      sessionStorage.setItem(STORAGE_ERROR_KEY, error);
    } else {
      sessionStorage.removeItem(STORAGE_ERROR_KEY);
    }
  }, [error]);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form) return;
    setStatus('generating');
    setError('');
    try {
      // 统一后端地址（开发环境代理，其他环境直连）
      const res = await axios.post(makeUrl('/report/generate'), {
        // 将表单字段直接发送，后端负责占位符替换
        ...form,
      });
      const data = res.data;
      if (data && data.status === 'success') {
        setStatus('success');
        // 通知父组件：设置预览数据并切换到“文件预览”标签
        onGenerated?.({
          docxUrl: makeUrl(data.docx_url),
          pdfUrl: data.pdf_url ? makeUrl(data.pdf_url) : '',
          filename: data.filename,
        });
      } else {
        setStatus('error');
        setError(data?.message || '生成失败');
      }
    } catch (err) {
      setStatus('error');
      setError(err?.message || '请求失败');
    }
  };

  // 构造通报文本（参考示例格式）
  const buildReportText = (data) => {
    const val = (k) => (data && data[k] !== undefined && data[k] !== null ? String(data[k]) : '');
    const unitHeader = '【绥江县防震减灾局】';
    const time = val('发震时间');
    const place = val('发震地点');
    const lat = val('纬度');
    const lon = val('经度');
    const mag = val('震级');
    const depth = val('震源深度');
    const dist = val('震中距离');
    const intensity = val('预估烈度');
    const analysisRaw = val('本地化综合分析');

    const lines = [];
    // 标题行（单位）及空格对齐
    lines.push(`${unitHeader}　　　　　　　　 `);
    // 核心信息段
    lines.push(`据中国地震台网正式测定：${time}在${place}（北纬${lat}度、东经${lon}度）发生${mag}级地震，震源深度${depth}公里。`);
    lines.push('');
    // 震中到政府距离与烈度
    if (dist || intensity) {
      lines.push(`震中到绥江县政府距离${dist}公里，预估烈度${intensity}度。`);
    }
    // 本地化综合分析各行，统一行尾分号
    if (analysisRaw) {
      const analysisLines = analysisRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      for (const line of analysisLines) {
        const end = line.slice(-1);
        const needsSemicolon = end !== '；' && end !== '。';
        lines.push(needsSemicolon ? `${line}；` : line);
      }
    }
    // 结尾说明
    // lines.push('——此烈度值仅供参考，精确烈度以中国地震局公布信息为准。');
    return lines.join('\n');
  };

  const openCopyPreview = () => {
    if (!form) return;
    setCopyText(buildReportText(form));
    setCopyStatus('');
    setCopyOpen(true);
  };

  const confirmCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(copyText);
      } else {
        // 兼容旧环境
        const textarea = document.createElement('textarea');
        textarea.value = copyText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyStatus('已复制到剪贴板');
      setCopyOpen(false);
    } catch (e) {
      setCopyStatus('复制失败，请手动选择复制');
    }
  };

  if (!selectEqEvent) {
    return (
      <div className="section">
        暂无选中事件，请在“地震事件”页选择或输入后查看通报信息。
      </div>
    );
  }

  if (!report || !form) {
    return <div className="section">正在生成通报信息...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>震情通报信息</h2>
      </header>
      <main className="page-body">
        <section className="section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              期号
              <input type="number" value={form['期号']} onChange={handleChange('期号')} style={{ width: '100%' }} />
            </label>
            <label>
              发文日期
              <input type="text" value={form['发文日期']} onChange={handleChange('发文日期')} style={{ width: '100%' }} />
            </label>
            <label style={{ gridColumn: '1 / span 2' }}>
              标题
              <input type="text" value={form['标题']} onChange={handleChange('标题')} style={{ width: '100%' }} />
            </label>
          </div>
        </section>
        <section className="section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              发震时间
              <input type="text" value={form['发震时间']} onChange={handleChange('发震时间')} style={{ width: '100%' }} />
            </label>
            <label>
              发震地点
              <input type="text" value={form['发震地点']} onChange={handleChange('发震地点')} style={{ width: '100%' }} />
            </label>
            <label>
              震级(M)
              <input type="number" step="0.1" value={form['震级']} onChange={handleChange('震级')} style={{ width: '100%' }} />
            </label>
            <label>
              震源深度(km)
              <input type="number" step="0.1" value={form['震源深度']} onChange={handleChange('震源深度')} style={{ width: '100%' }} />
            </label>
            <label>
              经度(°)
              <input type="number" step="0.0001" value={form['经度']} onChange={handleChange('经度')} style={{ width: '100%' }} />
            </label>
            <label>
              纬度(°)
              <input type="number" step="0.0001" value={form['纬度']} onChange={handleChange('纬度')} style={{ width: '100%' }} />
            </label>
          </div>
        </section>
        <section className="section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              震中距离(公里)
              <input type="number" value={form['震中距离']} onChange={handleChange('震中距离')} style={{ width: '100%' }} />
            </label>
            <label>
              预估烈度
              <input type="number" value={form['预估烈度']} onChange={handleChange('预估烈度')} style={{ width: '100%' }} />
            </label>
            <label style={{ gridColumn: '1 / span 2' }}>
              分管领导
              <input type="text" value={form['分管领导']} onChange={handleChange('分管领导')} style={{ width: '100%' }} />
            </label>
          </div>
        </section>
        <section className="section">
          <label style={{ width: '100%' }}>
            本地化综合分析
            <textarea value={form['本地化综合分析']} onChange={handleChange('本地化综合分析')} rows={6} style={{ width: '100%' }} />
          </label>
        </section>
        <section className="section" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleSubmit} disabled={status === 'generating'} style={{ padding: '8px 12px' }}>
            确认生成报告文件
          </button>
          <button onClick={openCopyPreview} disabled={!form} style={{ padding: '8px 12px' }}>
            一键复制通报文本
          </button>
          {status === 'generating' && <span>正在生成...</span>}
          {status === 'success' && <span>生成成功，正在跳转预览...</span>}
          {status === 'error' && <span style={{ color: 'red' }}>生成失败：{error}</span>}
          {copyStatus && <span style={{ color: '#1890ff' }}>{copyStatus}</span>}
        </section>
        {copyOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', width: 'min(800px, 90vw)', maxHeight: '80vh', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', fontWeight: 600 }}>复制通报文本预览</div>
              <div style={{ padding: 16, overflow: 'auto' }}>
                <textarea value={copyText} readOnly rows={14} style={{ width: '100%' }} />
              </div>
              <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #eee' }}>
                <button onClick={() => setCopyOpen(false)} style={{ padding: '6px 10px' }}>取消</button>
                <button onClick={confirmCopy} style={{ padding: '6px 10px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4 }}>复制到剪贴板</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ReportInfo;
  // 后端接口已统一返回规范键，简化从配置中读取分管领导
  const getLeaderFromConfig = (cfg) => (
    cfg && typeof cfg['分管领导'] !== 'undefined' ? cfg['分管领导'] : undefined
  );

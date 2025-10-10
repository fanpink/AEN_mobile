import React, { useContext, useMemo, useEffect, useState } from 'react';
import { SelectEventContext } from '../../Status_Context';
import { generateReport } from '../../services/reportGenerator';
import axios from 'axios';
// 由父组件传入生成成功后的回调，用于切换到预览标签

function ReportInfo({ onGenerated }) {
  const { selectEqEvent } = useContext(SelectEventContext);
  const report = useMemo(() => (selectEqEvent ? generateReport(selectEqEvent) : null), [selectEqEvent]);
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | generating | success | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (report) {
      setForm(report);
    }
  }, [report]);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form) return;
    setStatus('generating');
    setError('');
    try {
      // 后端服务默认在 http://localhost:5000
      const res = await axios.post('http://localhost:5000/report/generate', {
        // 将表单字段直接发送，后端负责占位符替换
        ...form,
      });
      const data = res.data;
      if (data && data.status === 'success') {
        setStatus('success');
        // 通知父组件：设置预览数据并切换到“文件预览”标签
        onGenerated?.({
          docxUrl: `http://localhost:5000${data.docx_url}`,
          pdfUrl: `http://localhost:5000${data.pdf_url}`,
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
            确认生成word报告
          </button>
          {status === 'generating' && <span>正在生成...</span>}
          {status === 'success' && <span>生成成功，正在跳转预览...</span>}
          {status === 'error' && <span style={{ color: 'red' }}>生成失败：{error}</span>}
        </section>
      </main>
    </div>
  );
}

export default ReportInfo;

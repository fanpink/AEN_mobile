import React, { useMemo, useState } from 'react';
import { generateReport } from '../../services/reportGenerator';

function BreakingNews() {
  const [rawText, setRawText] = useState('');
  const [form, setForm] = useState({
    数据来源: '',
    震级: '', // 震级(M)
    发震时刻: '', // 发震时刻(UTC+8)
    纬度: '',
    经度: '',
    深度: '', // 千米
    参考位置: '',
  });
  const [resultOpen, setResultOpen] = useState(false);
  const [resultText, setResultText] = useState('');
  const [copyMsg, setCopyMsg] = useState('');

  const sectionStyle = useMemo(() => ({
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    background: '#fff',
  }), []);

  const handleFormChange = (key) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  function parseChineseTimeToISO(cn) {
    // 输入示例：2025年10月11日11时18分15秒
    const m = cn.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2})时(\d{1,2})分(\d{1,2})秒/);
    if (!m) return '';
    const [, y, mo, d, h, mi, s] = m;
    const pad = (n) => String(n).padStart(2, '0');
    return `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}:${pad(s)}`;
  }

  function parseTextToForm(text) {
    const t = text.replace(/\s+/g, ' ').trim();
    // 数据来源
    let source = '';
    let isOfficial = false;
    if (/中国地震台网正式测定/.test(t)) {
      source = '据中国地震台网正式测定';
      isOfficial = true;
    } else if (/中国地震台网自动测定/.test(t)) {
      source = '据中国地震台网自动测定';
    } else if (/云南地震台网初步测定/.test(t)) {
      source = '据云南地震台网初步测定';
    }

    // 时间
    const timeMatch = t.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2})时(\d{1,2})分(\d{1,2})秒/);
    const timeCN = timeMatch ? `${timeMatch[1]}年${timeMatch[2]}月${timeMatch[3]}日${timeMatch[4]}时${timeMatch[5]}分${timeMatch[6]}秒` : '';

    // 参考位置（在...附近 / 在...（） / 在...发生）
    let place = '';
    const placeMatch = t.match(/在(.+?)(?:附近|（|\(|发生)/);
    if (placeMatch) place = placeMatch[1].trim();

    // 经纬度
    const latMatch = t.match(/(北纬|南纬)\s*([0-9]+(?:\.[0-9]+)?)度/);
    const lonMatch = t.match(/(东经|西经)\s*([0-9]+(?:\.[0-9]+)?)度/);
    let lat = '';
    let lon = '';
    if (latMatch) lat = (latMatch[1] === '南纬' ? -parseFloat(latMatch[2]) : parseFloat(latMatch[2]));
    if (lonMatch) lon = (lonMatch[1] === '西经' ? -parseFloat(lonMatch[2]) : parseFloat(lonMatch[2]));

    // 震级
    const magMatch = t.match(/发生\s*([0-9]+(?:\.[0-9]+)?)级/);
    const M = magMatch ? parseFloat(magMatch[1]) : '';

    // 深度
    const depthMatch = t.match(/震源深度\s*([0-9]+(?:\.[0-9]+)?)\s*(?:公里|千米)/);
    const depth = depthMatch ? parseFloat(depthMatch[1]) : '';

    return { source, isOfficial, M, timeCN, lat, lon, depth, place };
  }

  function handleAutoFill() {
    const parsed = parseTextToForm(rawText);
    setForm((prev) => ({
      ...prev,
      数据来源: parsed.source || prev.数据来源,
      震级: parsed.M !== '' ? parsed.M : prev.震级,
      发震时刻: parsed.timeCN || prev.发震时刻,
      纬度: parsed.lat !== '' ? parsed.lat : prev.纬度,
      经度: parsed.lon !== '' ? parsed.lon : prev.经度,
      深度: parsed.depth !== '' ? parsed.depth : prev.深度,
      参考位置: parsed.place || prev.参考位置,
    }));
  }

  function buildAssessmentText() {
    const unitHeader = '【绥江县防震减灾局】　　　　　　　　 ';
    const source = String(form.数据来源 || '').trim();
    const M = String(form.震级 || '').trim();
    const lat = String(form.纬度 || '').trim();
    const lon = String(form.经度 || '').trim();
    const depth = String(form.深度 || '').trim();
    const place = String(form.参考位置 || '').trim();
    const timeCN = String(form.发震时刻 || '').trim();

    if (!source || !M || !lat || !lon || !timeCN || !place) {
      return '信息不完整：请填写数据来源、震级、经纬度、发震时刻与参考位置。';
    }

    const isOfficial = /正式测定/.test(source);
    const approxSuffix = isOfficial ? '' : '左右';
    const disclaimer = isOfficial
      ? ''
      : (source.includes('云南地震台网初步测定')
          ? '最终结果以中国地震台网测定为准。'
          : '最终结果以正式测定为准。');

    const mainLine = `${source}：${timeCN}在${place}（北纬${lat}度、东经${lon}度）发生${M}${approxSuffix}级地震${depth ? `，震源深度${depth}公里` : ''}。${disclaimer}`;

    // 使用 reportGenerator 的生成器计算本地化分析（包含到各政府的距离与烈度）
    const oTimeISO = parseChineseTimeToISO(timeCN);
    const event = {
      M: Number(M),
      EPI_LON: Number(lon),
      EPI_LAT: Number(lat),
      EPI_DEPTH: depth ? Number(depth) : undefined,
      O_TIME: oTimeISO || new Date().toISOString().slice(0, 19).replace('T', ' '),
      LOCATION_C: place,
    };
    const rep = generateReport(event) || {};
    const analysis = rep['本地化综合分析'] || '';

    return `${unitHeader}\n${mainLine}\n\n${analysis}`;
  }

  function openAssessment() {
    setCopyMsg('');
    const text = buildAssessmentText();
    setResultText(text);
    setResultOpen(true);
  }

  async function copyAssessment() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(resultText);
        setCopyMsg('已复制到剪贴板');
      } else {
        const ta = document.createElement('textarea');
        ta.value = resultText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopyMsg('已复制到剪贴板');
      }
    } catch (_) {
      setCopyMsg('复制失败，请手动选择复制');
    }
  }

  return (
    <div>
      <h3>快报、速报处理</h3>

      {/* 文本输入与自动提取 */}
      <div style={sectionStyle}>
        <h4>短信/文本内容</h4>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={6}
          style={{ width: '100%' }}
          placeholder={'粘贴自动/初步/正式测定短信内容，例如：\n据中国地震台网自动测定：2025年10月11日11时18分15秒在云南昭通市鲁甸县附近（北纬27.0度、东经103.5度）发生4.5级左右地震。最终结果以正式测定为准。'}
        />
        <div style={{ marginTop: 12 }}>
          <button onClick={handleAutoFill} style={{ padding: '8px 12px' }}>自动提取填充</button>
        </div>
      </div>

      {/* 表单内容 */}
      <div style={sectionStyle}>
        <h4>表单内容</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            数据来源
            <select value={form.数据来源} onChange={handleFormChange('数据来源')} style={{ width: '100%' }}>
              <option value="">请选择</option>
              <option value="据中国地震台网自动测定">据中国地震台网自动测定</option>
              <option value="据云南地震台网初步测定">据云南地震台网初步测定</option>
              <option value="据中国地震台网正式测定">据中国地震台网正式测定</option>
            </select>
          </label>
          <label>
            震级(M)
            <input type="number" step="0.1" value={form.震级} onChange={handleFormChange('震级')} style={{ width: '100%' }} />
          </label>
          <label>
            发震时刻(UTC+8)
            <input type="text" value={form.发震时刻} onChange={handleFormChange('发震时刻')} style={{ width: '100%' }} placeholder="YYYY年MM月DD日HH时mm分ss秒" />
          </label>
          <label>
            纬度(°)
            <input type="number" step="0.0001" value={form.纬度} onChange={handleFormChange('纬度')} style={{ width: '100%' }} />
          </label>
          <label>
            经度(°)
            <input type="number" step="0.0001" value={form.经度} onChange={handleFormChange('经度')} style={{ width: '100%' }} />
          </label>
          <label>
            深度(千米)
            <input type="number" step="0.1" value={form.深度} onChange={handleFormChange('深度')} style={{ width: '100%' }} />
          </label>
          <label style={{ gridColumn: '1 / span 2' }}>
            参考位置
            <input type="text" value={form.参考位置} onChange={handleFormChange('参考位置')} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={openAssessment} style={{ padding: '8px 12px' }}>快速计算</button>
        </div>
      </div>

      {/* 评估结果弹窗 */}
      {resultOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', width: 'min(800px, 90vw)', maxHeight: '80vh', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', fontWeight: 600 }}>评估结果</div>
            <div style={{ padding: 16, overflow: 'auto' }}>
              <textarea value={resultText} readOnly rows={14} style={{ width: '100%' }} />
            </div>
            <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', gap: 8, borderTop: '1px solid #eee' }}>
              <div style={{ color: '#1890ff' }}>{copyMsg}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setResultOpen(false)} style={{ padding: '6px 10px' }}>关闭</button>
                <button onClick={copyAssessment} style={{ padding: '6px 10px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4 }}>一键复制</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BreakingNews;

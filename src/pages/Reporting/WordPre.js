import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

function WordPre({ docxUrl: propDocxUrl, pdfUrl: propPdfUrl, filename: propFilename }) {
  const location = useLocation();
  const state = location.state || {};
  // 预览数据恢复优先级：props -> 路由 state -> sessionStorage
  let saved = null;
  try {
    const s = sessionStorage.getItem('report_preview');
    if (s) saved = JSON.parse(s);
  } catch (_) {}
  const docxUrl = propDocxUrl || state.docxUrl || saved?.docxUrl || '';
  const pdfUrl = propPdfUrl || state.pdfUrl || saved?.pdfUrl || '';
  const filename = propFilename || state.filename || saved?.filename || '';

  // PDF 资源保持：首次加载后抓取为 Blob 并缓存到 window 级，避免组件卸载/路由切换后再次请求
  const [pdfSrc, setPdfSrc] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // 持久化预览数据到 sessionStorage，便于页面导航后恢复
    if (docxUrl || pdfUrl || filename) {
      try {
        sessionStorage.setItem('report_preview', JSON.stringify({ docxUrl, pdfUrl, filename }));
      } catch (_) {}
    }
  }, [docxUrl, pdfUrl, filename]);

  useEffect(() => {
    if (!pdfUrl) {
      setPdfSrc('');
      setPdfLoading(false);
      return;
    }
    setPdfLoading(true);
    const key = `__AEN_pdf_blob__${pdfUrl}`;
    const existing = typeof window !== 'undefined' ? window[key] : undefined;
    if (existing) {
      setPdfSrc(existing);
      setPdfLoading(false);
      return;
    }
    let aborted = false;
    // 抓取 PDF 并缓存为 Blob URL，避免路由返回后重新加载网络资源
    (async () => {
      try {
        const resp = await fetch(pdfUrl, { cache: 'force-cache' });
        if (!resp.ok) throw new Error(`获取PDF失败: ${resp.status}`);
        const blob = await resp.blob();
        if (aborted) return;
        const url = URL.createObjectURL(blob);
        setPdfSrc(url);
        setPdfLoading(false);
        if (typeof window !== 'undefined') {
          window[key] = url; // 缓存在 window，保持会话级可用
        }
      } catch (_) {
        // 如果抓取失败，退回使用原始 pdfUrl（不再切换 src，避免产生 abort 报错）
        if (!aborted) {
          setPdfSrc(pdfUrl);
          setPdfLoading(false);
        }
      }
    })();
    return () => {
      aborted = true;
    };
  }, [pdfUrl]);

  // 恢复滚动位置，避免返回后滚动状态丢失
  useEffect(() => {
    try {
      const posStr = sessionStorage.getItem('report_wordpre_scroll');
      const pos = posStr ? parseInt(posStr, 10) : 0;
      if (containerRef.current && !Number.isNaN(pos)) {
        containerRef.current.scrollTop = pos;
      }
    } catch (_) {}
  }, []);

  const handleScroll = (e) => {
    try {
      sessionStorage.setItem('report_wordpre_scroll', String(e.currentTarget.scrollTop));
    } catch (_) {}
  };

  return (
    <div className="page">
      <header className="page-header">
        <h2>Word报告预览</h2>
      </header>
      <main className="page-body" ref={containerRef} onScroll={handleScroll}>
        {!docxUrl && !pdfUrl && (
          <div className="section">暂无预览数据，请先生成报告。</div>
        )}
        {(docxUrl || pdfUrl) && (
          <section className="section">
            <div style={{ marginBottom: 8 }}>文件名：{filename || '未知文件'}</div>
            {pdfUrl ? (
              <div>
                <div style={{ marginBottom: 8 }}>PDF预览：</div>
                {pdfLoading && (
                  <div style={{ marginBottom: 8, color: '#666' }}>正在加载预览...</div>
                )}
                {/* 仅在 pdfSrc 就绪后渲染 embed，避免先加载原始链接后再切换导致 net::ERR_ABORTED */}
                {pdfSrc && (
                  <embed src={pdfSrc} type="application/pdf" width="100%" height="600px" />
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 8 }}>当前仅提供Word下载，浏览器不支持直接预览。</div>
            )}
            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              {docxUrl && (
                <a href={docxUrl} target="_blank" rel="noreferrer">下载Word</a>
              )}
              {pdfUrl && (
                <a href={pdfUrl} target="_blank" rel="noreferrer">下载PDF</a>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default WordPre;

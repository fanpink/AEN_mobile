import React from 'react';
import { useLocation } from 'react-router-dom';

function WordPre({ docxUrl: propDocxUrl, pdfUrl: propPdfUrl, filename: propFilename }) {
  const location = useLocation();
  const state = location.state || {};
  const docxUrl = propDocxUrl || state.docxUrl;
  const pdfUrl = propPdfUrl || state.pdfUrl;
  const filename = propFilename || state.filename;

  return (
    <div className="page">
      <header className="page-header">
        <h2>Word报告预览</h2>
      </header>
      <main className="page-body">
        {!docxUrl && !pdfUrl && (
          <div className="section">暂无预览数据，请先生成报告。</div>
        )}
        {(docxUrl || pdfUrl) && (
          <section className="section">
            <div style={{ marginBottom: 8 }}>文件名：{filename || '未知文件'}</div>
            {pdfUrl ? (
              <div>
                <div style={{ marginBottom: 8 }}>PDF预览：</div>
                <embed src={pdfUrl} type="application/pdf" width="100%" height="600px" />
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

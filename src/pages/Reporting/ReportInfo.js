import React, { useContext, useMemo } from 'react';
import { SelectEventContext } from '../../Status_Context';
import { generateReport } from '../../services/reportGenerator';

function ReportInfo() {
  const { selectEqEvent } = useContext(SelectEventContext);
  const report = useMemo(() => (selectEqEvent ? generateReport(selectEqEvent) : null), [selectEqEvent]);

  if (!selectEqEvent) {
    return (
      <div className="section">
        暂无选中事件，请在“地震事件”页选择或输入后查看通报信息。
      </div>
    );
  }

  if (!report) {
    return <div className="section">正在生成通报信息...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>震情通报信息</h2>
      </header>
      <main className="page-body">
        <section className="section">
          <div>期号：{report['期号']}</div>
          <div>发文日期：{report['发文日期']}</div>
          <div>标题：{report['标题']}</div>
        </section>
        <section className="section">
          <div>发震时间：{report['发震时间']}</div>
          <div>发震地点：{report['发震地点']}</div>
          <div>震级(M)：{report['震级']}</div>
          <div>震源深度(km)：{report['震源深度']}</div>
          <div>经度(°)：{report['经度']}</div>
          <div>纬度(°)：{report['纬度']}</div>
        </section>
        <section className="section">
          <div>震中距离(公里)：{report['震中距离']}</div>
          <div>预估烈度：{report['预估烈度']} 度</div>
          <div>分管领导：{report['分管领导']}</div>
        </section>
        <section className="section">
          <div style={{ whiteSpace: 'pre-wrap' }}>{report['本地化综合分析']}</div>
        </section>
      </main>
    </div>
  );
}

export default ReportInfo;

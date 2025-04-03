import React, { useContext } from 'react';
import { SelectEventContext } from '../../Status_Context'; // 引入 SelectEventContext

function Sub_web_clickEvent() {
  const { selectEqEvent } = useContext(SelectEventContext); // 获取 select_eq_event 的值
  // const selectEqEvent 的数据示例
//selectEqEvent ={ M: "5.9", O_TIME: "2025-04-03 05:03:39", EPI_LAT: "2.15", EPI_LON: "126.85", EPI_DEPTH: 40, NEW_DID: "CC20250403050340", LOCATION_C: "印尼马鲁古海北部", }；

  return (
    <div>
      <h2>当前选中的地震事件</h2>
      {selectEqEvent ? (
        <div>
          <p><strong>震级(M):</strong> {selectEqEvent.M}</p>
          <p><strong>发震时刻(UTC+8):</strong> {selectEqEvent.O_TIME}</p>
          <p><strong>纬度(°):</strong> {selectEqEvent.EPI_LAT}</p>
          <p><strong>经度(°):</strong> {selectEqEvent.EPI_LON}</p>
          <p><strong>深度(千米):</strong> {selectEqEvent.EPI_DEPTH}</p>
          <p><strong>参考位置:</strong> {selectEqEvent.LOCATION_C}</p>
        </div>
      ) : (
        <p>尚未选择地震事件</p>
      )}
    </div>
  );
}

export default Sub_web_clickEvent;

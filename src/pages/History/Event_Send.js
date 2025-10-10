import React, { useContext } from 'react';
import { SelectEventContext } from '../../Status_Context'; // 引入 SelectEventContext

function Event_Send() {
  const { selectEqEvent } = useContext(SelectEventContext); // 获取 select_eq_event 的值
  // const selectEqEvent 的数据示例
//selectEqEvent ={ M: "5.9", O_TIME: "2025-04-03 05:03:39", EPI_LAT: "2.15", EPI_LON: "126.85", EPI_DEPTH: 40, NEW_DID: "CC20250403050340", LOCATION_C: "印尼马鲁古海北部", }；

  return (
    <div>
      预览选中的信息，确认后发送到邮箱功能
      {selectEqEvent ? (
        <pre style={{ marginTop: '12px', background: '#f7f7f7', padding: '8px', borderRadius: '6px' }}>
          {JSON.stringify(selectEqEvent, null, 2)}
        </pre>
      ) : (
        <div style={{ marginTop: '12px', color: '#888' }}>暂无选中事件</div>
      )}
    </div>
  );
}

export default Event_Send;

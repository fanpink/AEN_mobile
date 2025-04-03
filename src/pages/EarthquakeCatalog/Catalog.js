import React, { useContext } from 'react';
import { SelectEventContext } from '../../Status_Context';

function SubComponent1() {
  const { setSelectEqEvent } = useContext(SelectEventContext); // 使用 Context
  const newdata = [
    {
      M: "5.9",
      O_TIME: "2025-04-03 05:03:39",
      EPI_LAT: "2.15",
      EPI_LON: "126.85",
      EPI_DEPTH: 40,
      NEW_DID: "CC20250403050340",
      LOCATION_C: "印尼马鲁古海北部",
    },
    {
      M: "6.2",
      O_TIME: "2025-04-02 22:04:00",
      EPI_LAT: "31.15",
      EPI_LON: "131.50",
      EPI_DEPTH: 30,
      NEW_DID: "CC20250402220401",
      LOCATION_C: "日本九州岛附近海域",
    },
    {
      M: "3.6",
      O_TIME: "2025-04-02 15:18:20",
      EPI_LAT: "40.63",
      EPI_LON: "83.69",
      EPI_DEPTH: 18,
      NEW_DID: "CD20250402151820",
      LOCATION_C: "新疆阿克苏地区沙雅县",
    },
    {
      M: "3.7",
      O_TIME: "2025-04-02 08:19:19",
      EPI_LAT: "28.28",
      EPI_LON: "87.32",
      EPI_DEPTH: 10,
      NEW_DID: "CD20250402081920",
      LOCATION_C: "西藏日喀则市定日县",
    },
  ];

  const handleRowClick = (event) => {
    const confirmSelection = window.confirm(
      `确认选择此次地震事件？\n\n` +
      `震级(M): ${event.M}\n` +
      `发震时刻(UTC+8): ${event.O_TIME}\n` +
      `纬度(°): ${event.EPI_LAT}\n` +
      `经度(°): ${event.EPI_LON}\n` +
      `深度(千米): ${event.EPI_DEPTH}\n` +
      `参考位置: ${event.LOCATION_C}`
    );
    if (confirmSelection) {
      setSelectEqEvent(event); // 更新全局状态
    }
  };

  return (
    <div style={styles.container}>
      <h2>地震目录</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>震级(M)</th>
              <th style={styles.th}>发震时刻(UTC+8)</th>
              <th style={styles.th}>纬度(°)</th>
              <th style={styles.th}>经度(°)</th>
              <th style={styles.th}>深度(千米)</th>
              <th style={styles.th}>参考位置</th>
            </tr>
          </thead>
          <tbody>
            {newdata.map((item, index) => (
              <tr key={index} style={styles.row} onClick={() => handleRowClick(item)}>
                <td style={styles.td}>{item.M}</td>
                <td style={styles.td}>{item.O_TIME}</td>
                <td style={styles.td}>{item.EPI_LAT}</td>
                <td style={styles.td}>{item.EPI_LON}</td>
                <td style={styles.td}>{item.EPI_DEPTH}</td>
                <td style={styles.td}>{item.LOCATION_C}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 样式
const styles = {
  container: {
    padding: "20px",
  },
  tableContainer: {
    maxHeight: "600px",
    overflowY: "auto",
    border: "1px solid #ddd",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    textAlign: "left",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  },
  row: {
    cursor: "pointer",
  },
};

export default SubComponent1;

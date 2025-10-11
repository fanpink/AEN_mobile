import React, { createContext, useState } from 'react';

// 创建 Context
export const SelectEventContext = createContext();
export const SelectedReportContext = createContext();

// 提供 Context 的 Provider
export const EventProvider = ({ children }) => {
  const [selectEqEvent, setSelectEqEvent] = useState(null); // 初始化为 null
  const [selectedReportName, setSelectedReportName] = useState(null); // 历史通报选中文件名

  return (
    <SelectEventContext.Provider value={{ selectEqEvent, setSelectEqEvent }}>
      <SelectedReportContext.Provider value={{ selectedReportName, setSelectedReportName }}>
        {children}
      </SelectedReportContext.Provider>
    </SelectEventContext.Provider>
  );
};
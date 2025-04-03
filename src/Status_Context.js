import React, { createContext, useState } from 'react';

// 创建 Context
export const SelectEventContext = createContext();

// 提供 Context 的 Provider
export const EventProvider = ({ children }) => {
  const [selectEqEvent, setSelectEqEvent] = useState(null); // 初始化为 null

  return (
    <SelectEventContext.Provider value={{ selectEqEvent, setSelectEqEvent }}>
      {children}
    </SelectEventContext.Provider>
  );
};
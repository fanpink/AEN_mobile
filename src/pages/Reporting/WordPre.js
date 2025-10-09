import React, { useContext } from 'react';
import { SelectEventContext } from '../../Status_Context';

function WordPre() {
  const { selectEqEvent } = useContext(SelectEventContext); // 获取 select_eq_event 的值

  return (
    <div>
      word预览
      
    </div>
  );
}

export default WordPre;

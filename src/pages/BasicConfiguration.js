import React from 'react';
import SubComponent1 from './BasicConfiguration/SubComponent1';
import SubComponent2 from './BasicConfiguration/SubComponent2';

// 基础配置
function BasicConfiguration() {
  return (
    <div>
      <h1>基础配置</h1>
      <SubComponent1 />
      <SubComponent2 />
    </div>
  );
}

export default BasicConfiguration;
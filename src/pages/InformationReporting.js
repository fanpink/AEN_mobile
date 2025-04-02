import React from 'react';
import SubComponent1 from './InformationReporting/SubComponent1';
import SubComponent2 from './InformationReporting/SubComponent2';

// 信息报送
function InformationReporting() {
  return (
    <div>
      <h1>信息报送</h1>
      <SubComponent1 />
      <SubComponent2 />
    </div>
  );
}

export default InformationReporting;
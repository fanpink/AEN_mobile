import React from 'react';
import SubComponent_Auto from './InformationReporting/SubComponent_Auto';
import SubComponent_Click from './InformationReporting/SubComponent_Click';

// 信息报送
function InformationReporting() {
  return (
    <div>
      <h1>信息报送</h1>
      <SubComponent_Auto />
      <SubComponent_Click />
    </div>
  );
}

export default InformationReporting;
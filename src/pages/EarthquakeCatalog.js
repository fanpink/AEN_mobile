import React from 'react';
import SubComponent1 from './EarthquakeCatalog/SubComponent1';
import SubComponent2 from './EarthquakeCatalog/SubComponent2';

// 地震目录
function EarthquakeCatalog() {
  return (
    <div>
      <h1>地震目录</h1>
      <SubComponent1 />
      <SubComponent2 />
    </div>
  );
}

export default EarthquakeCatalog;